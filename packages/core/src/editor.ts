/**
 * 编辑器
 * 实现编辑器的逻辑
 * 提供了编辑器的初始化、激活、禁用、移动、结束等功能
 * 提供了编辑器的性能监控、调试工具等功能
 */

import { EventEmitter } from '@g-asset-forge/common';
import { mergeBoxes } from '@g-asset-forge/geo';

import { CanvasDragger } from './canvas_dragger';
import { ClipboardManager } from './clipboard';
import { CommandManager } from './commands/command_manager';
import { ControlHandleManager } from './control_handle_manager';
import { CursorManger, type ICursor } from './cursor_manager';
import { GAssetForgeCanvas, type GraphicsAttrs } from './graphics';
import { GAssetForgeDocument } from './graphics/document';
import { GuideLineManager } from './guide_lines/guide_line_manager';
import { HostEventManager, MouseEventManager } from './host_event_manager';
import { ImgManager } from './Img_manager';
import { KeyBindingManager } from './key_binding_manager';
import { PathEditor } from './path_editor';
import { PerfMonitor } from './perf_monitor';
import { Ruler } from './ruler';
import { SceneGraph } from './scene/scene_graph';
import { SelectedBox } from './selected_box';
import { SelectedElements } from './selected_elements';
import { Setting, type SettingValue } from './setting';
import { TextEditor } from './text/text_editor';
import { ToolManager } from './tools';
import { type IChanges, type IEditorPaperData } from './type';
import { getNoConflictObjectName } from './utils';
import { ViewportManager } from './viewport_manager';

interface IEditorOptions {
  containerElement: HTMLDivElement;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  showPerfMonitor?: boolean;
  userPreference?: Partial<SettingValue>;
}

interface Events {
  destroy(): void;
}

export class GAssetForgeEditor {
  containerElement: HTMLDivElement;
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  appVersion = 'g-asset-forge-editor_0.0.3';
  paperId: string;

  private emitter = new EventEmitter<Events>();

  doc: GAssetForgeDocument;
  sceneGraph: SceneGraph;
  controlHandleManager: ControlHandleManager;

  setting: Setting;

  viewportManager: ViewportManager;

  canvasDragger: CanvasDragger;
  toolManager: ToolManager;
  commandManager: CommandManager;
  imgManager: ImgManager;

  cursorManager: CursorManger;
  mouseEventManager: MouseEventManager;
  keybindingManager: KeyBindingManager;
  hostEventManager: HostEventManager;
  clipboard: ClipboardManager;

  selectedElements: SelectedElements;
  selectedBox: SelectedBox;
  ruler: Ruler;
  guideLineManager: GuideLineManager;
  textEditor: TextEditor;
  pathEditor: PathEditor;

  perfMonitor: PerfMonitor;

  constructor(options: IEditorOptions) {
    this.containerElement = options.containerElement;
    this.canvasElement = document.createElement('canvas');
    this.containerElement.appendChild(this.canvasElement);
    this.ctx = this.canvasElement.getContext('2d')!;

    this.setting = new Setting(options.userPreference);
    if (options.offsetX) {
      this.setting.set('offsetX', options.offsetX);
    }
    if (options.offsetY) {
      this.setting.set('offsetY', options.offsetY);
    }

    this.mouseEventManager = new MouseEventManager(this);
    this.keybindingManager = new KeyBindingManager(this);
    this.keybindingManager.bindEvent();

    this.sceneGraph = new SceneGraph(this);

    this.cursorManager = new CursorManger(this);
    this.viewportManager = new ViewportManager(this);

    this.commandManager = new CommandManager(this);
    this.imgManager = new ImgManager();

    this.selectedElements = new SelectedElements(this);
    this.selectedBox = new SelectedBox(this);
    this.ruler = new Ruler(this);
    this.guideLineManager = new GuideLineManager(this);

    this.controlHandleManager = new ControlHandleManager(this);
    this.controlHandleManager.bindEvents();

    this.textEditor = new TextEditor(this);
    this.pathEditor = new PathEditor(this);

    this.hostEventManager = new HostEventManager(this);
    this.hostEventManager.bindHotkeys();

    this.canvasDragger = new CanvasDragger(this);
    this.toolManager = new ToolManager(this);

    this.clipboard = new ClipboardManager(this);
    this.clipboard.bindEvents();

    this.imgManager.on('added', () => {
      this.render();
    });

    this.paperId = 'g-asset-forge-paper-1'; // 使用固定ID

    this.doc = new GAssetForgeDocument({
      id: '0-0',
      objectName: 'Document',
      width: 0,
      height: 0,
    });
    this.doc.setEditor(this);

    // 在单项目模式下，不创建默认画布
    // 等待项目数据加载时再创建画布
    this.doc.graphicsStoreManager.add(this.doc);
    this.sceneGraph.addItems([this.doc]);

    this.viewportManager.setViewportSize({
      width: options.width,
      height: options.height,
    });

    this.perfMonitor = new PerfMonitor();
    if (options.showPerfMonitor) {
      this.perfMonitor.start(this.containerElement);
    }

    /**
     * setViewport 其实会修改 canvas 的宽高，浏览器的 DOM 更新是异步的，
     * 所以下面的 render 要异步执行
     */
    Promise.resolve().then(() => {
      this.render();
    });
  }

  setContents(data: IEditorPaperData) {
    // 检查编辑器是否已经完全初始化
    if (!this.doc || !this.sceneGraph) {
      console.warn('编辑器未完全初始化，延迟调用setContents');
      // 延迟执行，等待编辑器完全初始化
      setTimeout(() => this.setContents(data), 100);
      return;
    }

    // 防重复加载检查
    if ((this as any).isLoadingContents) {
      return;
    }

    (this as any).isLoadingContents = true;

    console.log(
      'setContents: 开始加载数据，数据包含',
      data.data.length,
      '个对象',
    );

    // 在单项目模式下，直接加载项目数据
    // 不需要清空现有画布，因为编辑器初始化时没有创建默认画布
    this.sceneGraph.load(data.data);
    this.commandManager.clearRecords();
    this.paperId = data.paperId ?? 'g-asset-forge-paper-1'; // 使用固定ID

    // 设置当前画布为项目中的第一个画布
    const availableCanvases = this.doc.graphicsStoreManager.getCanvasItems();

    if (availableCanvases && availableCanvases.length > 0) {
      // 使用项目中的第一个画布
      const firstCanvas = availableCanvases[0];
      console.log(
        'setContents: 使用项目画布:',
        firstCanvas.attrs.id,
        firstCanvas.attrs.objectName,
      );

      // 直接设置currentCanvasId，避免触发无效ID检查
      this.doc.setCurrentCanvasId(firstCanvas.attrs.id);
    } else {
      // 如果项目数据中没有画布，创建一个新的
      console.log('setContents: 项目数据中没有画布，创建新画布');
      const canvasName = getNoConflictObjectName(this.doc, 'Page');
      const canvas = new GAssetForgeCanvas(
        {
          objectName: canvasName,
        },
        {
          doc: this.doc,
        },
      );

      // 确保画布被正确添加到存储管理器
      this.doc.graphicsStoreManager.add(canvas);
      this.sceneGraph.addItems([canvas]);
      this.doc.insertChild(canvas);

      console.log('setContents: 创建新画布完成:', canvas.attrs.id);
      // 直接设置currentCanvasId，避免触发无效ID检查
      this.doc.setCurrentCanvasId(canvas.attrs.id);
    }

    this.viewportManager.zoomToFit(1);

    // 重置加载标志位
    (this as any).isLoadingContents = false;
  }

  /**
   * 获取编辑器内容数据
   * @returns 编辑器数据，包含所有图形元素
   */
  getContents(): IEditorPaperData {
    if (!this.doc) {
      throw new Error('编辑器文档未初始化');
    }

    // 获取所有图形元素的属性数据
    const allGraphics = this.doc.graphicsStoreManager.getAll();
    const data: GraphicsAttrs[] = allGraphics.map((graphics) => graphics.attrs);

    return {
      appVersion: '1.0.0', // 可以从配置中获取
      paperId: this.doc.attrs.id,
      data: data,
    };
  }

  destroy() {
    try {
      // 检查是否已经被销毁
      if (!this.containerElement || !this.canvasElement) {
        console.warn('编辑器已经被销毁或未正确初始化');
        return;
      }

      // 检查canvasElement是否还在containerElement中
      if (this.containerElement.contains(this.canvasElement)) {
        this.containerElement.removeChild(this.canvasElement);
      } else {
        console.warn('canvasElement不在containerElement中，可能已经被移除');
      }

      // 清理其他资源
      this.textEditor.destroy();
      this.keybindingManager.destroy();
      this.hostEventManager.destroy();
      this.clipboard.destroy();
      this.canvasDragger.destroy();
      this.toolManager.unbindEvent();
      this.toolManager.destroy();
      this.perfMonitor.destroy();
      this.controlHandleManager.unbindEvents();

      // 发出销毁事件
      this.emitter.emit('destroy');

      // 清理引用
      this.canvasElement = null as any;
      this.ctx = null as any;
    } catch (error) {
      console.error('编辑器销毁过程中出现错误:', error);
    }
  }
  setCursor(cursor: ICursor) {
    this.cursorManager.setCursor(cursor);
  }
  getCursor() {
    return this.cursorManager.getCursor();
  }

  toScenePt(x: number, y: number, round = false) {
    return this.viewportManager.toScenePt(x, y, round);
  }
  toViewportPt(x: number, y: number) {
    return this.viewportManager.toViewportPt(x, y);
  }
  toSceneSize(size: number) {
    return this.viewportManager.toSceneSize(size);
  }
  toViewportSize(size: number) {
    return this.viewportManager.toViewportSize(size);
  }
  /** get cursor viewport xy */
  getCursorXY(event: { clientX: number; clientY: number }) {
    return {
      x: event.clientX - this.setting.get('offsetX'),
      y: event.clientY - this.setting.get('offsetY'),
    };
  }
  /** get cursor scene xy */
  getSceneCursorXY(event: { clientX: number; clientY: number }, round = false) {
    const { x, y } = this.getCursorXY(event);
    return this.toScenePt(x, y, round);
  }
  render() {
    this.sceneGraph.render();
  }

  getCanvasChildrenBbox() {
    const canvasGraphics = this.doc.getCurrentCanvas();
    if (!canvasGraphics) {
      return null;
    }
    const children = canvasGraphics
      .getChildren()
      .filter((item) => item.isVisible());
    if (children.length === 0) return null;
    return mergeBoxes(children.map((item) => item.getBbox()));
  }

  applyChanges(changes: IChanges) {
    const addedGraphicsArr: GraphicsAttrs[] = [];
    for (const [, attrs] of changes.added) {
      addedGraphicsArr.push(attrs);
    }
    this.sceneGraph.load(addedGraphicsArr, true);

    for (const [id, partialAttrs] of changes.update) {
      const graphics = this.doc.getGraphicsById(id);
      if (!graphics) {
        console.warn(`graphics ${id} is not exist`);
        continue;
      }
      graphics.updateAttrs(partialAttrs);
    }

    for (const id of changes.deleted) {
      const graphics = this.doc.getGraphicsById(id);
      if (!graphics) {
        console.warn(`graphics ${id} is not exist`);
        continue;
      }
      graphics.setDeleted(true);
      graphics.removeFromParent();
    }
  }

  on<T extends keyof Events>(eventName: T, listener: Events[T]) {
    this.emitter.on(eventName, listener);
  }
  off<T extends keyof Events>(eventName: T, listener: Events[T]) {
    this.emitter.off(eventName, listener);
  }
}
