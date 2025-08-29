/**
 * 场景图
 * 实现场景图的逻辑
 * 提供了场景图的初始化、激活、禁用、移动、结束等功能
 * 提供了场景图的性能监控、调试工具等功能
 */

import { EventEmitter, getDevicePixelRatio } from '@g-asset-forge/common';
import { type IRect, Matrix } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import {
  GAssetForgeCanvas,
  GAssetForgeDocument,
  GAssetForgeEllipse,
  GAssetForgeFrame,
  GAssetForgeGraphics,
  GAssetForgeLine,
  GAssetForgePath,
  GAssetForgeRect,
  GAssetForgeRegularPolygon,
  GAssetForgeStar,
  GAssetForgeText,
  type GraphicsAttrs,
  type IDrawInfo,
  isFrameGraphics,
} from '../graphics';
import { Grid } from '../grid';
import { GraphicsType, type IEditorPaperData } from '../type';
import { rafThrottle } from '../utils';
import {
  type CanvasStateManager,
  createCanvasStateManager,
} from '../utils/canvasStateManager';

const graphCtorMap = {
  [GraphicsType.Graph]: GAssetForgeGraphics,
  [GraphicsType.Rect]: GAssetForgeRect,
  [GraphicsType.Ellipse]: GAssetForgeEllipse,
  [GraphicsType.Line]: GAssetForgeLine,
  [GraphicsType.Text]: GAssetForgeText,
  [GraphicsType.Path]: GAssetForgePath,
  [GraphicsType.RegularPolygon]: GAssetForgeRegularPolygon,
  [GraphicsType.Star]: GAssetForgeStar,
  [GraphicsType.Frame]: GAssetForgeFrame,
  [GraphicsType.Canvas]: GAssetForgeCanvas,
  [GraphicsType.Document]: GAssetForgeDocument,
};

interface Events {
  render(): void;
}

export class SceneGraph {
  selection: IRect | null = null;
  private eventEmitter = new EventEmitter<Events>();
  private grid: Grid;
  showBoxAndHandleWhenSelected = true;
  showSelectedGraphsOutline = true;
  highlightLayersOnHover = true;

  // 画布状态管理器
  private canvasStateManager: CanvasStateManager;

  constructor(private editor: GAssetForgeEditor) {
    this.grid = new Grid(editor);

    // 初始化画布状态管理器
    this.canvasStateManager = createCanvasStateManager();
    this.canvasStateManager.setEditor(editor);
  }

  addItems(graphicsArr: GAssetForgeGraphics[]) {
    for (const graphics of graphicsArr) {
      this.editor.doc.addGraphics(graphics);
    }
  }

  // 全局重渲染
  render = rafThrottle(() => {
    // 获取视口区域
    const { canvasElement: canvas, ctx, setting } = this.editor;

    // 安全检查：确保ctx和canvas存在
    if (!ctx || !canvas) {
      console.warn('SceneGraph.render: ctx或canvas不存在，跳过渲染');
      return;
    }

    // 检查canvas是否已被移除或损坏
    if (!canvas.parentElement) {
      console.warn('SceneGraph.render: canvas已从DOM中移除，跳过渲染');
      return;
    }

    // 检查canvas尺寸是否有效
    if (canvas.width === 0 || canvas.height === 0) {
      console.warn('SceneGraph.render: canvas尺寸无效，跳过渲染');
      return;
    }

    const zoom = this.editor.viewportManager.getZoom();
    const selectedElements = this.editor.selectedElements;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 2. 清空画布，然后绘制所有可见元素
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景色
    ctx.save();
    ctx.fillStyle = setting.get('canvasBgColor');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 场景坐标转换为视口坐标
    const dpr = getDevicePixelRatio();

    const viewMatrix = new Matrix()
      .scale(dpr, dpr)
      .append(this.editor.viewportManager.getViewMatrix());
    ctx.setTransform(...viewMatrix.getArray());

    const imgManager = this.editor.imgManager;

    const canvasGraphics = this.canvasStateManager.getCurrentCanvas();
    const smooth = zoom <= 1;
    if (canvasGraphics) {
      const viewportArea = this.editor.viewportManager.getSceneBbox();
      ctx.save();

      // 只渲染当前画布及其子元素，确保画布隔离
      this.drawCanvasContent(canvasGraphics, {
        ctx,
        imgManager,
        smooth,
        viewportArea,
      });

      ctx.restore();
    }

    /********** draw guide line *********/
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    /** draw pixel grid */
    if (
      setting.get('enablePixelGrid') &&
      zoom >= this.editor.setting.get('minPixelGridZoom')
    ) {
      this.grid.draw();
    }

    /** draw hover graphics outline and its control handle */
    if (this.highlightLayersOnHover && setting.get('highlightLayersOnHover')) {
      const hlItem = selectedElements.getHighlightedItem();
      if (hlItem && !selectedElements.hasItem(hlItem)) {
        // 只高亮当前画布中的元素
        if (this.isGraphicsInCurrentCanvas(hlItem)) {
          this.drawGraphsOutline(
            [hlItem],
            setting.get('hoverOutlineStrokeWidth'),
            this.editor.setting.get('hoverOutlineStroke'),
          );
        }
      }
    }

    const selectedTransformBox = this.editor.selectedBox.updateBbox();

    /** draw selected elements outline */
    if (this.showSelectedGraphsOutline) {
      // 只显示当前画布中选中的元素
      const currentCanvasSelectedElements = this.editor.selectedElements
        .getItems()
        .filter(
          (item) => item.isVisible() && this.isGraphicsInCurrentCanvas(item),
        );

      if (currentCanvasSelectedElements.length > 0) {
        this.drawGraphsOutline(
          currentCanvasSelectedElements,
          setting.get('selectedOutlineStrokeWidth'),
          this.editor.setting.get('hoverOutlineStroke'),
        );
        this.editor.selectedBox.draw();
      }
    }

    // draw path editor path outline
    if (this.editor.pathEditor.isActive()) {
      const path = this.editor.pathEditor.getPath();
      if (path && this.isGraphicsInCurrentCanvas(path)) {
        this.drawGraphsOutline(
          [path],
          setting.get('selectedOutlineStrokeWidth'),
          this.editor.setting.get('pathLineStroke'),
        );
      }
    }

    // draw frame text
    if (canvasGraphics) {
      const padding = 4;
      const frames = this.editor.doc.graphicsStoreManager.getFrames();
      for (const frame of frames) {
        if (
          (isFrameGraphics(frame) && frame.isGroup()) ||
          frame.isDeleted() ||
          // check canvas - 只显示当前画布中的frame
          !frame.hasAncestor(canvasGraphics.attrs.id) ||
          !this.isGraphicsInCurrentCanvas(frame)
        ) {
          continue;
        }
        const pos = frame.getWorldPosition();
        const viewportPos = this.editor.toViewportPt(pos.x, pos.y);
        frame.drawText(ctx, viewportPos.x, viewportPos.y - padding);
      }
    }

    /** draw transform handle */
    if (this.showBoxAndHandleWhenSelected) {
      this.editor.controlHandleManager.draw(selectedTransformBox);
    }

    this.editor.textEditor.drawRange({
      ctx,
      imgManager,
      smooth,
    });

    /** draw selection */
    if (this.selection) {
      ctx.save();
      ctx.strokeStyle = setting.get('selectionStroke');
      ctx.fillStyle = setting.get('selectionFill');
      const { x, y, width, height } = this.selection;

      const { x: xInViewport, y: yInViewport } = this.editor.toViewportPt(x, y);

      const widthInViewport = width * zoom;
      const heightInViewport = height * zoom;

      ctx.fillRect(xInViewport, yInViewport, widthInViewport, heightInViewport);
      ctx.strokeRect(
        xInViewport,
        yInViewport,
        widthInViewport,
        heightInViewport,
      );
      ctx.restore();
    }

    this.editor.guideLineManager.draw(ctx);

    /** drawing rulers */
    if (setting.get('enableRuler')) {
      this.editor.ruler.draw();
    }

    ctx.restore();

    this.eventEmitter.emit('render');
  });

  /**
   * 绘制画布内容，确保只渲染当前画布的元素
   */
  private drawCanvasContent(canvas: GAssetForgeGraphics, drawInfo: IDrawInfo) {
    // 绘制画布本身
    canvas.draw(drawInfo);

    // 绘制画布的子元素
    const children = canvas.getChildren();
    for (const child of children) {
      if (child.isVisible() && !child.isDeleted()) {
        child.draw(drawInfo);
      }
    }
  }

  /**
   * 检查图形是否属于当前画布
   */
  private isGraphicsInCurrentCanvas(graphics: GAssetForgeGraphics): boolean {
    const currentCanvas = this.canvasStateManager.getCurrentCanvas();
    if (!currentCanvas) {
      return false;
    }

    // 检查图形是否是当前画布的子元素，或者就是当前画布本身
    return (
      graphics === currentCanvas || graphics.hasAncestor(currentCanvas.attrs.id)
    );
  }

  private drawGraphsOutline(
    graphicsArr: GAssetForgeGraphics[],
    strokeWidth: number,
    stroke: string,
  ) {
    const ctx = this.editor.ctx;
    const dpr = getDevicePixelRatio();
    const zoom = this.editor.viewportManager.getZoom();

    ctx.save();
    const viewMatrix = new Matrix()
      .scale(dpr, dpr)
      .append(this.editor.viewportManager.getViewMatrix());
    ctx.setTransform(...viewMatrix.getArray());

    strokeWidth /= zoom;
    for (const graphics of graphicsArr) {
      ctx.save();
      graphics.drawOutline(ctx, stroke, strokeWidth);
      ctx.restore();
    }
    ctx.restore();
  }

  setSelection(partialRect: Partial<IRect>) {
    this.selection = Object.assign({}, this.selection, partialRect);
  }

  /**
   * get tree data with simple info (for layer panel)
   */
  toObjects() {
    const canvasGraphics = this.canvasStateManager.getCurrentCanvas();
    if (!canvasGraphics) {
      return [];
    }
    return canvasGraphics.toObject().children ?? [];
  }

  toJSON() {
    const data = [
      ...this.editor.doc
        .getAllGraphicsArr()
        .filter((graphics) => !graphics.isDeleted())
        .map((item) => item.toJSON()),
    ];
    const paperData: IEditorPaperData = {
      appVersion: this.editor.appVersion,
      paperId: this.editor.paperId,
      data: data,
    };
    return JSON.stringify(paperData);
  }

  createGraphicsArr(data: GraphicsAttrs[]) {
    const children: GAssetForgeGraphics[] = [];

    /** document need to be handled separately */
    for (const item of data) {
      if (item.type === GraphicsType.Document) {
        const doc = new GAssetForgeDocument(item);
        doc.setEditor(this.editor);
        this.editor.doc = doc;
        children.push(doc);
        break;
      }
    }

    for (const attrs of data) {
      const type = attrs.type;
      if (type === GraphicsType.Document) {
        continue;
      }

      // 检查是否已经存在相同ID的图形，避免重复创建
      const existingGraphics = this.editor.doc.getGraphicsById(attrs.id);
      if (existingGraphics && !existingGraphics.isDeleted()) {
        // 如果图形已存在且未删除，跳过创建
        continue;
      }

      // 特殊处理：如果是画布类型，检查是否与现有画布冲突
      if (type === GraphicsType.Canvas) {
        const existingCanvases =
          this.editor.doc.graphicsStoreManager.getCanvasItems();
        const hasCanvasWithSameName = existingCanvases.some(
          (canvas) =>
            canvas.attrs.objectName === attrs.objectName && !canvas.isDeleted(),
        );
        if (hasCanvasWithSameName) {
          // 如果存在同名画布，跳过创建
          continue;
        }
      }

      const Ctor = graphCtorMap[type!];
      if (!Ctor) {
        console.error(`Unsupported graphics type "${attrs.type}", ignore it`);
        continue;
      }
      children.push(new Ctor(attrs as any, { doc: this.editor.doc }));
    }
    return children;
  }

  initGraphicsTree(graphicsArr: GAssetForgeGraphics[]) {
    for (const graphics of graphicsArr) {
      const parent = graphics.getParent();
      if (parent && parent !== graphics) {
        parent.insertChild(graphics, graphics.attrs.parentIndex?.position);
      }
    }
  }

  load(info: GraphicsAttrs[], isApplyChanges?: boolean) {
    // 保存现有的画布引用，在清空前先保存
    const existingCanvases =
      this.editor.doc.graphicsStoreManager.getCanvasItems();
    // const existingCanvasIds = new Set(
    //   existingCanvases.map((canvas) => canvas.attrs.id),
    // );

    const graphicsArr = this.createGraphicsArr(info);

    // 只有在不是应用变更时才清空文档
    if (!isApplyChanges) {
      // 清空文档
      this.editor.doc.clear();

      // 重新添加现有的画布到存储管理器
      for (const canvas of existingCanvases) {
        if (canvas && !canvas.isDeleted()) {
          this.editor.doc.graphicsStoreManager.add(canvas);
          // 确保画布也被添加到场景图中
          this.editor.sceneGraph.addItems([canvas]);
        }
      }
    }

    // 添加新的图形项目
    this.addItems(graphicsArr);
    this.initGraphicsTree(graphicsArr);

    // 如果数据中没有画布，但我们需要保持现有画布
    if (!isApplyChanges && existingCanvases.length > 0) {
      // 确保现有画布在场景树中正确设置
      for (const canvas of existingCanvases) {
        if (canvas && !canvas.isDeleted()) {
          // 检查画布是否已经在文档的子节点中
          const children = this.editor.doc.getChildren();
          if (!children.includes(canvas)) {
            this.editor.doc.insertChild(canvas);
          }
        }
      }
    }
  }

  on<K extends keyof Events>(eventName: K, handler: Events[K]) {
    this.eventEmitter.on(eventName, handler);
  }

  off<K extends keyof Events>(eventName: K, handler: Events[K]) {
    this.eventEmitter.off(eventName, handler);
  }
}
