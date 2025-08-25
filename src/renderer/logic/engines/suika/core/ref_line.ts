import {
  arrMap,
  forEach,
  getClosestTimesVal,
  getClosestValInSortedArr,
} from '../common';
import {
  calcRectBbox,
  type IPoint,
  isBoxIntersect,
  type ITransformRect,
  mergeBoxes,
  rectToVertices,
} from '../geo';

import { type SuikaEditor } from './editor';
import {
  isCanvasGraphics,
  isFrameGraphics,
  type SuikaGraphics,
} from './graphics';
import { type IHorizontalLine, type IVerticalLine } from './type';
import {
  bboxToBboxWithMid,
  drawLine,
  drawXShape,
  pointsToHLines,
  pointsToVLines,
} from './utils';

/**
 * reference line - 支持手动创建和管理辅助线
 *
 * reference: https://mp.weixin.qq.com/s/-IjHEw_W0JjnSRD224Orig
 */
export class RefLine {
  /**
   * 参考图形产生的垂直参照线。对于其中的同一条线，x 相同（作为 key），y 不同（作为 value）
   */
  private vRefLineMap = new Map<number, Set<number>>();
  /**
   * 参考图形产生的水平照线，对于其中的同一条线，y 相同（作为 key），x 不同（作为 value）
   */
  private hRefLineMap = new Map<number, Set<number>>();

  private sortedXs: number[] = []; // 对 vRefLineMap 的 key 排序
  private sortedYs: number[] = []; // 对 hRefLineMap 的 key 排序

  private toDrawVLines: IVerticalLine[] = []; // 等待绘制的垂直参照线
  private toDrawHLines: IHorizontalLine[] = []; // 等待绘制的水平参照线

  /**
   * 手动创建的辅助线
   */
  private manualGuides: Array<{
    id: string;
    type: 'horizontal' | 'vertical';
    position: number;
    visible: boolean;
    selected: boolean;
  }> = [];

  /**
   * 辅助线拖拽状态
   */
  private isDraggingGuide = false;
  private draggingGuideId: string | null = null;

  constructor(private editor: SuikaEditor) {
    this.bindEvents();
  }

  /**
   * 绑定事件监听器
   */
  private bindEvents() {
    // 使用捕获阶段，确保RefLine事件优先执行，避免与画布操作冲突
    this.editor.canvasElement.addEventListener('pointerdown', this.handlePointerDown, true);
    this.editor.canvasElement.addEventListener('pointermove', this.handlePointerMove, true);
    this.editor.canvasElement.addEventListener('pointerup', this.handlePointerUp, true);
    
    // 监听键盘事件以支持删除选中的辅助线
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 解绑事件监听器
   */
  private unbindEvents() {
    this.editor.canvasElement.removeEventListener('pointerdown', this.handlePointerDown, true);
    this.editor.canvasElement.removeEventListener('pointermove', this.handlePointerMove, true);
    this.editor.canvasElement.removeEventListener('pointerup', this.handlePointerUp, true);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 添加手动辅助线
   */
  addManualGuide(type: 'horizontal' | 'vertical', position: number): string {
    const id = `guide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.manualGuides.push({
      id,
      type,
      position,
      visible: true,
      selected: false
    });
    
    console.log(`[RefLine] 添加${type === 'horizontal' ? '水平' : '垂直'}辅助线: ${position}`);
    this.editor.render();
    
    return id;
  }

  /**
   * 移除手动辅助线
   */
  removeManualGuide(id: string): boolean {
    const index = this.manualGuides.findIndex(guide => guide.id === id);
    if (index !== -1) {
      this.manualGuides.splice(index, 1);
      console.log(`[RefLine] 移除辅助线: ${id}`);
      this.editor.render();
      return true;
    }
    return false;
  }

  /**
   * 移动手动辅助线
   */
  moveManualGuide(id: string, position: number): boolean {
    const guide = this.manualGuides.find(g => g.id === id);
    if (guide) {
      guide.position = position;
      console.log(`[RefLine] 移动辅助线 ${id} 到位置: ${position}`);
      this.editor.render();
      return true;
    }
    return false;
  }

  /**
   * 获取所有手动辅助线
   */
  getManualGuides() {
    return [...this.manualGuides];
  }

  /**
   * 清除所有手动辅助线
   */
  clearManualGuides() {
    this.manualGuides = [];
    this.editor.render();
  }

  /**
   * 处理鼠标按下事件
   */
  private handlePointerDown = (event: PointerEvent) => {
    // 确保事件目标就是canvas元素
    if (event.target !== this.editor.canvasElement) {
      return;
    }
    
    const rect = this.editor.canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 转换为场景坐标
    const scenePos = this.editor.toScenePt(x, y);
    
    // 检查是否点击了辅助线
    const clickedGuide = this.getGuideAtPosition(scenePos.x, scenePos.y);
    
    if (clickedGuide) {
      event.preventDefault();
      event.stopPropagation(); // 防止影响画布操作
      event.stopImmediatePropagation(); // 阻止同一元素上的其他监听器
      
      // 选中辅助线
      this.selectGuide(clickedGuide.id);
      
      // 开始拖拽
      this.isDraggingGuide = true;
      this.draggingGuideId = clickedGuide.id;
      
      // 设置鼠标样式
      this.editor.canvasElement.style.cursor = clickedGuide.type === 'horizontal' ? 'ns-resize' : 'ew-resize';
      
      console.log(`[RefLine] 选中并开始拖拽${clickedGuide.type === 'horizontal' ? '水平' : '垂直'}辅助线: ${clickedGuide.id}`);
    } else {
      // 取消所有辅助线的选中状态
      this.clearSelection();
    }
  };

  /**
   * 处理鼠标移动事件
   */
  private handlePointerMove = (event: PointerEvent) => {
    // 确保事件目标就是canvas元素
    if (event.target !== this.editor.canvasElement) {
      return;
    }
    
    const rect = this.editor.canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (this.isDraggingGuide && this.draggingGuideId) {
      event.preventDefault();
      event.stopPropagation(); // 防止影响画布操作
      event.stopImmediatePropagation(); // 阻止同一元素上的其他监听器
      
      // 转换为场景坐标
      const scenePos = this.editor.toScenePt(x, y);
      
      const guide = this.manualGuides.find(g => g.id === this.draggingGuideId);
      if (guide) {
        // 对齐到网格或标尺刻度
        let newPosition: number;
        if (guide.type === 'horizontal') {
          newPosition = this.snapToGridOrRuler(scenePos.y);
        } else {
          newPosition = this.snapToGridOrRuler(scenePos.x);
        }
        
        // 更新辅助线位置
        guide.position = newPosition;
        
        // 重新渲染
        this.editor.render();
      }
    } else {
      // 检查鼠标是否悬停在辅助线上，更新鼠标样式
      const scenePos = this.editor.toScenePt(x, y);
      const hoveredGuide = this.getGuideAtPosition(scenePos.x, scenePos.y);
      
      if (hoveredGuide) {
        this.editor.canvasElement.style.cursor = hoveredGuide.type === 'horizontal' ? 'ns-resize' : 'ew-resize';
      } else {
        this.editor.canvasElement.style.cursor = 'default';
      }
    }
  };

  /**
   * 处理鼠标释放事件
   */
  private handlePointerUp = (event: PointerEvent) => {
    // 确保事件目标就是canvas元素
    if (event.target !== this.editor.canvasElement) {
      return;
    }
    
    if (this.isDraggingGuide && this.draggingGuideId) {
      event.preventDefault();
      event.stopPropagation(); // 防止影响画布操作
      event.stopImmediatePropagation(); // 阻止同一元素上的其他监听器
      
      console.log(`[RefLine] 完成拖拽辅助线: ${this.draggingGuideId}`);
      
      // 重置拖拽状态
      this.isDraggingGuide = false;
      this.draggingGuideId = null;
      
      // 重置鼠标样式
      this.editor.canvasElement.style.cursor = 'default';
      
      // 重新渲染
      this.editor.render();
    }
  };

  /**
   * 获取指定位置的辅助线
   */
  private getGuideAtPosition(x: number, y: number): { id: string; type: 'horizontal' | 'vertical'; position: number } | null {
    const tolerance = 5 / this.editor.viewportManager.getZoom(); // 5像素的容差，转换为场景坐标
    
    for (const guide of this.manualGuides) {
      if (!guide.visible) continue;
      
      if (guide.type === 'horizontal') {
        // 水平辅助线，检查Y坐标
        if (Math.abs(y - guide.position) <= tolerance) {
          return { id: guide.id, type: guide.type, position: guide.position };
        }
      } else {
        // 垂直辅助线，检查X坐标
        if (Math.abs(x - guide.position) <= tolerance) {
          return { id: guide.id, type: guide.type, position: guide.position };
        }
      }
    }
    
    return null;
  }

  /**
   * 选中辅助线
   */
  private selectGuide(id: string) {
    // 取消所有辅助线的选中状态
    this.manualGuides.forEach(guide => guide.selected = false);
    
    // 选中指定辅助线
    const guide = this.manualGuides.find(g => g.id === id);
    if (guide) {
      guide.selected = true;
      this.editor.render();
    }
  }

  /**
   * 清除所有辅助线的选中状态
   */
  private clearSelection() {
    let hasSelection = false;
    this.manualGuides.forEach(guide => {
      if (guide.selected) {
        guide.selected = false;
        hasSelection = true;
      }
    });
    
    if (hasSelection) {
      this.editor.render();
    }
  }

  /**
   * 对齐到网格（强制启用网格对齐）
   */
  private snapToGridOrRuler(value: number): number {
    const setting = this.editor.setting;
    
    // 强制使用网格对齐，忽略用户设置
    const gridSpacing = setting.get('gridSnapX'); // 假设X和Y网格间距相同
    return getClosestTimesVal(value, gridSpacing);
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    // 删除选中的辅助线
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selectedGuides = this.manualGuides.filter(guide => guide.selected);
      if (selectedGuides.length > 0) {
        event.preventDefault();
        
        for (const guide of selectedGuides) {
          this.removeManualGuide(guide.id);
        }
        
        console.log(`[RefLine] 删除了 ${selectedGuides.length} 条选中的辅助线`);
      }
    }
  };

  /**
   * 获取基于缩放级别的步长
   */
  private getStepByZoom(zoom: number): number {
    const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
    const step = 50 / zoom;
    for (let i = 0, len = steps.length; i < len; i++) {
      if (steps[i]! >= step) return steps[i]!;
    }
    return steps[0]!;
  }

  /**
   * 销毁RefLine，清理事件监听器
   */
  destroy() {
    this.unbindEvents();
  }

  /**
   * cache reference line of graphics in viewport
   */
  cacheGraphicsRefLines(
    options: {
      excludeItems: SuikaGraphics[];
    } = {
      excludeItems: [],
    },
  ) {
    this.clear();

    const excludeItems = options.excludeItems;

    const vRefLineMap = this.vRefLineMap;
    const hRefLineMap = this.hRefLineMap;

    const viewportBbox = this.editor.viewportManager.getSceneBbox();

    const refGraphicsSet = new Set<SuikaGraphics>();
    this.editor.doc.getCurrentCanvas().forEachVisibleChildNode((graphics) => {
      if (
        isCanvasGraphics(graphics) ||
        (isFrameGraphics(graphics) && graphics.isGroup())
      ) {
        return;
      }
      refGraphicsSet.add(graphics);
    });

    for (const selectedItem of excludeItems) {
      selectedItem.forEachVisibleChildNode((graphics) => {
        if (refGraphicsSet.has(graphics)) {
          refGraphicsSet.delete(graphics);
        }
      });
    }

    const excludeIdSet = new Set(excludeItems.map((item) => item.attrs.id));
    for (const graphics of refGraphicsSet) {
      if (excludeIdSet.has(graphics.attrs.id)) {
        continue;
      }

      const bbox = bboxToBboxWithMid(graphics.getBbox());
      if (!isBoxIntersect(viewportBbox, bbox)) {
        continue;
      }

      const setting = this.editor.setting;
      if (setting.get('snapToGrid')) {
        const gridSnapSpacingX = setting.get('gridSnapX');
        const gridSnapSpacingY = setting.get('gridSnapY');
        bbox.minX = getClosestTimesVal(bbox.minX, gridSnapSpacingX);
        bbox.minY = getClosestTimesVal(bbox.minY, gridSnapSpacingY);
        bbox.midX = getClosestTimesVal(bbox.midX, gridSnapSpacingX);
        bbox.midY = getClosestTimesVal(bbox.midY, gridSnapSpacingY);
        bbox.maxX = getClosestTimesVal(bbox.maxX, gridSnapSpacingX);
        bbox.maxY = getClosestTimesVal(bbox.maxY, gridSnapSpacingY);
      }

      // bbox 中水平线
      RefLine.addRefLinesToMap(vRefLineMap, bbox.midX, [bbox.minY, bbox.maxY]);
      // bbox 中垂直线
      RefLine.addRefLinesToMap(hRefLineMap, bbox.midY, [bbox.minX, bbox.maxX]);

      /**
       * 获取旋转后4个顶点的坐标
       *      top
       *     /   \
       *   /       \
       * left      right
       *   \       /
       *    \    /
       *    bottom
       *
       * special when rotate 90 degree:
       *
       * top(left) ---------- right(top)
       *      |                 |
       * left(bottom) ------- bottom(right)
       *
       * top 和 bottom 要绘制水平参考线，不要绘制垂直参照线
       * left 和 right 要绘制垂直参照线，不要绘制水平参照线
       */
      const bboxVerts = graphics.getWorldBboxVerts();

      if (setting.get('snapToGrid')) {
        const gridSnapSpacingX = setting.get('gridSnapX');
        const gridSnapSpacingY = setting.get('gridSnapY');
        for (const vert of bboxVerts) {
          vert.x = getClosestTimesVal(vert.x, gridSnapSpacingX);
          vert.y = getClosestTimesVal(vert.y, gridSnapSpacingY);
        }
      }

      const top = bboxVerts.filter((p) => p.x === bbox.minX);
      const bottom = bboxVerts.filter((p) => p.x === bbox.maxX);
      const left = bboxVerts.filter((p) => p.y === bbox.minY);
      const right = bboxVerts.filter((p) => p.y === bbox.maxY);

      // top 和 bottom 要绘制水平参考线，不要绘制垂直参照线
      for (const p of [...top, ...bottom]) {
        RefLine.addRefLinesToMap(vRefLineMap, p.x, [p.y]);
      }
      // left 和 right 要绘制垂直参照线，不要绘制水平参照线
      for (const p of [...left, ...right]) {
        RefLine.addRefLinesToMap(hRefLineMap, p.y, [p.x]);
      }
    }

    this.sortedXs = Array.from(vRefLineMap.keys()).sort((a, b) => a - b);
    this.sortedYs = Array.from(hRefLineMap.keys()).sort((a, b) => a - b);
  }
  clear() {
    this.vRefLineMap.clear();
    this.hRefLineMap.clear();
    this.sortedXs = [];
    this.sortedYs = [];
    this.toDrawVLines = [];
    this.toDrawHLines = [];
  }
  static addRefLinesToMap(
    m: Map<number, Set<number>>,
    xOrY: number,
    xsOrYs: number[],
  ) {
    const line = m.get(xOrY);
    if (line) {
      for (const xOrY of xsOrYs) {
        line.add(xOrY);
      }
    } else {
      m.set(xOrY, new Set(xsOrYs));
    }
  }

  static getGraphicsTargetPoints(record: Map<string, ITransformRect>) {
    let targetPoints: IPoint[] = [];
    // 选中的为单个图形，要以旋转后的 4 个顶点和中心点为目标线
    if (record.size === 1) {
      const { width, height, transform } = Array.from(record.values())[0]!;
      const points = rectToVertices(
        { x: 0, y: 0, width: width, height: height },
        transform,
      );
      points.push({
        x: (points[0]!.x + points[2]!.x) / 2,
        y: (points[0]!.y + points[2]!.y) / 2,
      });
      return points;
    } else {
      const targetBbox = bboxToBboxWithMid(
        mergeBoxes(
          Array.from(record.values()).map((item) => calcRectBbox(item)),
        ),
      );

      targetPoints = [
        { x: targetBbox.minX, y: targetBbox.minY },
        { x: targetBbox.minX, y: targetBbox.maxY },

        { x: targetBbox.maxX, y: targetBbox.minY },
        { x: targetBbox.maxX, y: targetBbox.maxY },

        { x: targetBbox.midX, y: targetBbox.midY },
      ];
    }
    return targetPoints;
  }

  /**
   * update ref line
   * and return offset
   */
  getGraphicsSnapOffset(targetPoints: IPoint[]): IPoint {
    this.toDrawVLines = [];
    this.toDrawHLines = [];

    let vTargetLines = pointsToVLines(targetPoints); // 目标矩形的垂直线
    let vTargetLineKeys = Array.from(vTargetLines.keys()); // 目标矩形的垂直线的 x 坐标
    let hTargetLines = pointsToHLines(targetPoints); // 目标矩形的水平线
    let hTargetLineKeys = Array.from(hTargetLines.keys()); // 目标矩形的水平线的 y 坐标

    const vRefLineMap = this.vRefLineMap;
    const hRefLineMap = this.hRefLineMap;
    const sortedXs = this.sortedXs;
    const sortedYs = this.sortedYs;

    // there are no reference graphs
    if (sortedXs.length === 0 && sortedYs.length === 0) {
      return { x: 0, y: 0 };
    }

    let offsetX: number | undefined = undefined;
    let offsetY: number | undefined = undefined;

    const closestXs = arrMap(vTargetLineKeys, (x) =>
      getClosestValInSortedArr(sortedXs, x),
    );
    // 目标矩形的每个 x 坐标离它们最近的参照线的差值
    const closestXDiffs = arrMap(vTargetLineKeys, (x, i) => closestXs[i]! - x);
    const closestXDist = Math.min(
      ...arrMap(closestXDiffs, (item) => Math.abs(item)),
    );

    const closestYs = arrMap(hTargetLineKeys, (y) =>
      getClosestValInSortedArr(sortedYs, y),
    );
    // 目标矩形的每个 y 坐标离它们最近的参照线的差值
    const closestYDiffs = arrMap(hTargetLineKeys, (y, i) => closestYs[i]! - y);
    const closestYDist = Math.min(
      ...arrMap(closestYDiffs, (item) => Math.abs(item)),
    );

    const isEqualNum = (a: number, b: number) => Math.abs(a - b) < 0.00001;

    const tol =
      this.editor.setting.get('refLineTolerance') /
      this.editor.viewportManager.getZoom();

    // 确定最终偏移值 offsetX
    if (closestXDist <= tol) {
      for (const closestXDiff of closestXDiffs) {
        if (isEqualNum(closestXDist, Math.abs(closestXDiff))) {
          offsetX = closestXDiff;
          break;
        }
      }
      if (offsetX === undefined) {
        throw new Error('it should not reach here, please put a issue to us');
      }
    }

    // 再确认偏移值 offsetY
    if (closestYDist <= tol) {
      for (const closestYDiff of closestYDiffs) {
        if (isEqualNum(closestYDist, Math.abs(closestYDiff))) {
          offsetY = closestYDiff;
          break;
        }
      }
      if (offsetY === undefined) {
        throw new Error('it should not reach here, please put a issue to us');
      }
    }

    const correctedTargetPoints: IPoint[] = arrMap(targetPoints, (p) => ({
      x: p.x + (offsetX ?? 0),
      y: p.y + (offsetY ?? 0),
    }));

    vTargetLines = pointsToVLines(correctedTargetPoints);
    vTargetLineKeys = Array.from(vTargetLines.keys()); // 对应 x

    if (offsetX !== undefined) {
      /*************** 标记需要绘制的垂直参考线 ************/
      forEach(vTargetLineKeys, (y, i) => {
        if (isEqualNum(offsetX!, closestXDiffs[i]!)) {
          const vLine: IVerticalLine = {
            x: closestXs[i]!,
            ys: [],
          };

          vLine.ys.push(...vTargetLines.get(y)!);
          vLine.ys.push(...Array.from(vRefLineMap.get(y)! ?? []));
          this.toDrawVLines.push(vLine);
        }
      });
    }

    if (offsetY !== undefined) {
      /*************** 标记需要绘制的水平参考线 ************/
      hTargetLines = pointsToHLines(correctedTargetPoints);
      hTargetLineKeys = Array.from(hTargetLines.keys()); // 对应 y

      forEach(hTargetLineKeys, (x, i) => {
        if (isEqualNum(offsetY!, closestYDiffs[i]!)) {
          const hLine: IHorizontalLine = {
            y: closestYs[i]!,
            xs: [],
          };

          hLine.xs.push(...hTargetLines.get(x)!);
          hLine.xs.push(...Array.from(hRefLineMap.get(x) ?? []));

          this.toDrawHLines.push(hLine);
        }
      });
    }

    return { x: offsetX ?? 0, y: offsetY ?? 0 };
  }

  drawRefLine(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const color = this.editor.setting.get('refLineStroke');
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = this.editor.setting.get('refLineStrokeWidth');

    const pointsSet = new Set<string>();
    const pointSize = this.editor.setting.get('refLinePointSize');

    // 绘制自动生成的参考线
    this.drawVerticalLines(ctx, pointSize, pointsSet);
    this.drawHorizontalLines(ctx, pointSize, pointsSet);

    // 绘制手动创建的辅助线
    this.drawManualGuides(ctx);

    ctx.restore();
  }

  /**
   * 绘制手动创建的辅助线
   */
  private drawManualGuides(ctx: CanvasRenderingContext2D) {
    const { width: viewportWidth, height: viewportHeight } = this.editor.viewportManager.getPageSize();
    const rulerWidth = this.editor.setting.get('rulerWidth');
    
    ctx.save();
    
    for (const guide of this.manualGuides) {
      if (!guide.visible) continue;
      
      // 根据选中状态设置样式
      if (guide.selected) {
        ctx.strokeStyle = '#ff6600'; // 选中的辅助线使用橙色
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]); // 选中状态使用不同的虚线样式
      } else {
        ctx.strokeStyle = '#0066ff'; // 普通手动辅助线使用蓝色
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]); // 虚线样式，区别于临时辅助线
      }
      
      if (guide.type === 'horizontal') {
        // 水平辅助线
        const y = this.editor.toViewportPt(0, guide.position).y;
        if (y >= rulerWidth && y <= viewportHeight) {
          ctx.beginPath();
          ctx.moveTo(rulerWidth, y);
          ctx.lineTo(viewportWidth, y);
          ctx.stroke();
          
          // 如果选中，绘制拖拽手柄
          if (guide.selected) {
            this.drawGuideHandle(ctx, rulerWidth - 5, y);
          }
        }
      } else {
        // 垂直辅助线
        const x = this.editor.toViewportPt(guide.position, 0).x;
        if (x >= rulerWidth && x <= viewportWidth) {
          ctx.beginPath();
          ctx.moveTo(x, rulerWidth);
          ctx.lineTo(x, viewportHeight);
          ctx.stroke();
          
          // 如果选中，绘制拖拽手柄
          if (guide.selected) {
            this.drawGuideHandle(ctx, x, rulerWidth - 5);
          }
        }
      }
    }
    
    ctx.restore();
  }

  /**
   * 绘制辅助线拖拽手柄
   */
  private drawGuideHandle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.fillStyle = '#ff6600';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([]); // 实线
    
    // 绘制小圆点作为拖拽手柄
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  private drawVerticalLines(
    ctx: CanvasRenderingContext2D,
    pointSize: number,
    pointsSet: Set<string>,
  ) {
    for (const vLine of this.toDrawVLines) {
      let minY = Infinity;
      let maxY = -Infinity;

      const { x } = this.editor.toViewportPt(vLine.x, 0);
      for (const y_ of vLine.ys) {
        // TODO: optimize
        const { y } = this.editor.toViewportPt(0, y_);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        // prevent draw same points again
        const key = `${x},${y}`;
        if (pointsSet.has(key)) {
          continue;
        }
        pointsSet.add(key);

        drawXShape(ctx, x, y, pointSize);
      }

      drawLine(ctx, x, minY, x, maxY);
    }
  }

  private drawHorizontalLines(
    ctx: CanvasRenderingContext2D,
    pointSize: number,
    pointsSet: Set<string>,
  ) {
    for (const hLine of this.toDrawHLines) {
      let minX = Infinity;
      let maxX = -Infinity;

      const { y } = this.editor.toViewportPt(0, hLine.y);

      for (const x_ of hLine.xs) {
        const { x } = this.editor.toViewportPt(x_, 0);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);

        // prevent draw same points again
        const key = `${x},${y}`;
        if (pointsSet.has(key)) {
          continue;
        }
        pointsSet.add(key);

        drawXShape(ctx, x, y, pointSize);
      }

      drawLine(ctx, minX, y, maxX, y);
    }
  }
}
