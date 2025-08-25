import { getClosestTimesVal, nearestPixelVal } from '../common';

import { HALF_PI } from './constant';
import { type SuikaEditor } from './editor';
import { mergeIntervals, rotateInCanvas } from './utils';
import { type IPoint } from '../geo';

const getStepByZoom = (zoom: number) => {
  /**
   * 步长研究，参考 figma
   * 1
   * 2
   * 5
   * 10（对应 500% 往上） 找到规律了： 50 / zoom = 步长
   * 25（对应 200% 往上）
   * 50（对应 100% 往上）
   * 100（对应 50% 往上）
   * 250
   * 500
   * 1000
   * 2500
   * 5000
   */
  const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  const step = 50 / zoom;
  for (let i = 0, len = steps.length; i < len; i++) {
    if (steps[i]! >= step) return steps[i]!;
  }
  return steps[0]!;
};

/**
 * Ruler - 支持拖拽创建辅助线的标尺
 *
 * reference: https://mp.weixin.qq.com/s/RlNTitV3XTEKHfwpOKAQ0g
 */
export class Ruler {
  visible = false;
  private isDragging = false;
  private dragType: 'horizontal' | 'vertical' | null = null;
  private dragStartPos: IPoint | null = null;
  private tempGuideLine: { type: 'horizontal' | 'vertical'; position: number } | null = null;

  constructor(private editor: SuikaEditor) {
    this.bindEvents();
  }

  open() {
    this.visible = true;
  }
  close() {
    this.visible = false;
  }

  /**
   * 绑定标尺拖拽事件
   */
  private bindEvents() {
    // 使用捕获阶段，确保Ruler事件优先执行，避免与画布操作冲突
    this.editor.canvasElement.addEventListener('pointerdown', this.handlePointerDown, true);
    this.editor.canvasElement.addEventListener('pointermove', this.handlePointerMove, true);
    this.editor.canvasElement.addEventListener('pointerup', this.handlePointerUp, true);
  }

  /**
   * 解绑事件
   */
  private unbindEvents() {
    this.editor.canvasElement.removeEventListener('pointerdown', this.handlePointerDown, true);
    this.editor.canvasElement.removeEventListener('pointermove', this.handlePointerMove, true);
    this.editor.canvasElement.removeEventListener('pointerup', this.handlePointerUp, true);
  }

  /**
   * 检查点是否在标尺区域内
   */
  private isInRulerArea(x: number, y: number): { inRuler: boolean; type: 'horizontal' | 'vertical' | null } {
    if (!this.visible) return { inRuler: false, type: null };
    
    const rulerWidth = this.editor.setting.get('rulerWidth');
    
    // 检查是否在水平标尺区域（顶部）
    if (x >= rulerWidth && y >= 0 && y <= rulerWidth) {
      return { inRuler: true, type: 'horizontal' };
    }
    
    // 检查是否在垂直标尺区域（左侧）
    if (x >= 0 && x <= rulerWidth && y >= rulerWidth) {
      return { inRuler: true, type: 'vertical' };
    }
    
    return { inRuler: false, type: null };
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
    
    const rulerCheck = this.isInRulerArea(x, y);
    if (rulerCheck.inRuler && rulerCheck.type) {
      // 在标尺区域内，立即阻止事件传播，避免影响画布操作
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation(); // 阻止同一元素上的其他监听器
      
      this.isDragging = true;
      this.dragType = rulerCheck.type;
      this.dragStartPos = { x, y };
      
      // 设置鼠标样式
      this.editor.canvasElement.style.cursor = rulerCheck.type === 'horizontal' ? 'ns-resize' : 'ew-resize';
      
      console.log(`[Ruler] 开始从${rulerCheck.type === 'horizontal' ? '水平' : '垂直'}标尺拖拽辅助线`);
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
    
    // 检查是否在标尺区域
    const rulerCheck = this.isInRulerArea(x, y);
    
    if (this.isDragging && this.dragType && this.dragStartPos) {
      // 拖拽状态下阻止事件传播
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation(); // 阻止同一元素上的其他监听器
      
      // 转换为场景坐标
      const scenePos = this.editor.toScenePt(x, y);
      
      // 创建临时辅助线，并对齐到网格或标尺刻度
      if (this.dragType === 'horizontal') {
        // 从水平标尺（顶部）拖拽，创建水平辅助线
        let alignedY = scenePos.y;
        
        // 对齐到网格或标尺刻度
        alignedY = this.snapToGridOrRuler(alignedY);
        
        this.tempGuideLine = {
          type: 'horizontal',
          position: alignedY
        };
      } else {
        // 从垂直标尺（左侧）拖拽，创建垂直辅助线
        let alignedX = scenePos.x;
        
        // 对齐到网格或标尺刻度
        alignedX = this.snapToGridOrRuler(alignedX);
        
        this.tempGuideLine = {
          type: 'vertical',
          position: alignedX
        };
      }
      
      // 重新渲染以显示临时辅助线
      this.editor.render();
    } else if (rulerCheck.inRuler && rulerCheck.type) {
      // 在标尺区域内但未拖拽时，也要阻止事件传播，避免选中画布对象
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation(); // 阻止同一元素上的其他监听器
      
      // 更新鼠标样式
      this.editor.canvasElement.style.cursor = rulerCheck.type === 'horizontal' ? 'ns-resize' : 'ew-resize';
    } else {
      this.editor.canvasElement.style.cursor = 'default';
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
    
    if (this.isDragging && this.tempGuideLine) {
      event.preventDefault();
      event.stopPropagation(); // 防止影响画布操作
      event.stopImmediatePropagation(); // 阻止同一元素上的其他监听器
      
      const rect = this.editor.canvasElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // 检查是否拖拽到了画布区域（不是标尺区域）
      const rulerWidth = this.editor.setting.get('rulerWidth');
      const isInCanvasArea = x > rulerWidth && y > rulerWidth;
      
      if (isInCanvasArea) {
        // 创建永久辅助线
        this.createGuideLine(this.tempGuideLine.type, this.tempGuideLine.position);
        console.log(`[Ruler] 创建${this.tempGuideLine.type === 'horizontal' ? '水平' : '垂直'}辅助线，位置: ${this.tempGuideLine.position}`);
      } else {
        console.log('[Ruler] 辅助线创建取消（未拖拽到画布区域）');
      }
    }
    
    // 重置拖拽状态
    this.isDragging = false;
    this.dragType = null;
    this.dragStartPos = null;
    this.tempGuideLine = null;
    this.editor.canvasElement.style.cursor = 'default';
    
    // 重新渲染
    this.editor.render();
  };

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
   * 创建辅助线
   */
  private createGuideLine(type: 'horizontal' | 'vertical', position: number) {
    // 这里需要与RefLine系统集成，暂时先打印日志
    // TODO: 实现辅助线的持久化存储和管理
    console.log(`[Ruler] 创建辅助线: ${type}, 位置: ${position}`);
    
    // 直接调用RefLine的方法创建辅助线
    this.editor.refLine.addManualGuide(type, position);
  }

  /**
   * 销毁标尺，清理事件监听器
   */
  destroy() {
    this.unbindEvents();
  }
  draw() {
    const setting = this.editor.setting;
    const rulerWidth = setting.get('rulerWidth');

    const ctx = this.editor.ctx;
    const { width: viewportWidth, height: viewportHeight } =
      this.editor.viewportManager.getPageSize();
    ctx.save();
    // 绘制背景
    ctx.fillStyle = setting.get('rulerBgColor');
    ctx.fillRect(0, 0, viewportWidth, rulerWidth);
    ctx.fillRect(0, 0, rulerWidth, viewportHeight);

    this.drawSelectArea();

    this.drawXRuler();
    this.drawYRuler();

    // 把左上角的小矩形上的刻度盖掉
    ctx.fillStyle = setting.get('rulerBgColor');
    ctx.fillRect(0, 0, rulerWidth, rulerWidth);

    // 绘制 border
    ctx.strokeStyle = setting.get('rulerStroke');
    ctx.beginPath();
    // 水平 border
    ctx.moveTo(0, rulerWidth + 0.5);
    ctx.lineTo(viewportWidth, rulerWidth + 0.5);
    ctx.stroke();
    ctx.closePath();
    // 垂直 border
    ctx.beginPath();
    ctx.moveTo(rulerWidth + 0.5, 0);
    ctx.lineTo(rulerWidth + 0.5, viewportHeight);
    ctx.stroke();
    ctx.closePath();

    // 绘制临时辅助线
    if (this.tempGuideLine) {
      this.drawTempGuideLine();
    }

    ctx.restore();
  }

  /**
   * 绘制临时辅助线
   */
  private drawTempGuideLine() {
    if (!this.tempGuideLine) return;
    
    const ctx = this.editor.ctx;
    const { width: viewportWidth, height: viewportHeight } = this.editor.viewportManager.getPageSize();
    const rulerWidth = this.editor.setting.get('rulerWidth');
    
    ctx.save();
    ctx.strokeStyle = '#ff4444'; // 临时辅助线使用红色
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // 虚线样式
    
    if (this.tempGuideLine.type === 'horizontal') {
      // 水平辅助线
      const y = this.editor.toViewportPt(0, this.tempGuideLine.position).y;
      ctx.beginPath();
      ctx.moveTo(rulerWidth, y);
      ctx.lineTo(viewportWidth, y);
      ctx.stroke();
    } else {
      // 垂直辅助线
      const x = this.editor.toViewportPt(this.tempGuideLine.position, 0).x;
      ctx.beginPath();
      ctx.moveTo(x, rulerWidth);
      ctx.lineTo(x, viewportHeight);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  private drawSelectArea() {
    const setting = this.editor.setting;
    const rulerWidth = setting.get('rulerWidth');
    const ctx = this.editor.ctx;

    const bboxes = this.editor.selectedElements
      .getItems()
      .map((item) => item.getBbox());

    ctx.fillStyle = setting.get('rulerSelectedBgColor');
    for (const [minX, maxX] of mergeIntervals(
      bboxes.map(({ minX, maxX }) => [minX, maxX]),
    )) {
      ctx.fillRect(
        this.editor.toViewportPt(minX, 0).x,
        0,
        this.editor.toViewportSize(maxX - minX),
        rulerWidth,
      );
    }
    for (const [minY, maxY] of mergeIntervals(
      bboxes.map(({ minY, maxY }) => [minY, maxY]),
    )) {
      ctx.fillRect(
        0,
        this.editor.toViewportPt(0, minY).y,
        rulerWidth,
        this.editor.toViewportSize(maxY - minY),
      );
    }
  }
  private drawXRuler() {
    // 绘制刻度线和刻度值
    // 计算 x 轴起点和终点范围
    const setting = this.editor.setting;
    const rulerWidth = setting.get('rulerWidth');

    const ctx = this.editor.ctx;
    const zoom = this.editor.viewportManager.getZoom();
    const stepInScene = getStepByZoom(zoom);

    const viewBbox = this.editor.viewportManager.getSceneBbox();

    const startXInScene = getClosestTimesVal(viewBbox.minX, stepInScene);

    const endXInScene = getClosestTimesVal(viewBbox.maxX, stepInScene);

    ctx.textAlign = 'center';
    const y = rulerWidth - setting.get('rulerMarkSize');
    let x = startXInScene;
    while (x <= endXInScene) {
      ctx.strokeStyle = setting.get('rulerMarkStroke');
      ctx.fillStyle = setting.get('rulerMarkStroke');
      // 转为视口坐标

      const intX = nearestPixelVal(this.editor.toViewportPt(x, 0).x);
      ctx.beginPath();
      ctx.moveTo(intX, y);
      ctx.lineTo(intX, y + setting.get('rulerMarkSize'));
      ctx.stroke();
      ctx.closePath();
      ctx.fillText(String(x), intX, y - 4);
      x += stepInScene;
    }
  }
  private drawYRuler() {
    const setting = this.editor.setting;
    const rulerWidth = setting.get('rulerWidth');

    const ctx = this.editor.ctx;
    const zoom = this.editor.viewportManager.getZoom();
    const stepInScene = getStepByZoom(zoom);

    const viewBbox = this.editor.viewportManager.getSceneBbox();
    const startYInScene = getClosestTimesVal(viewBbox.minY, stepInScene);
    const endYInScene = getClosestTimesVal(viewBbox.maxY, stepInScene);

    const x = rulerWidth - setting.get('rulerMarkSize');
    ctx.textAlign = 'center';
    ctx.fillStyle = setting.get('rulerMarkStroke');
    let y = startYInScene;
    while (y <= endYInScene) {
      const intY = nearestPixelVal(this.editor.toViewportPt(0, y).y);
      ctx.beginPath();
      ctx.moveTo(x, intY);
      ctx.lineTo(x + setting.get('rulerMarkSize'), intY);
      ctx.stroke();
      ctx.closePath();
      rotateInCanvas(ctx, -HALF_PI, x, intY);
      ctx.fillText(String(y), x, intY - 3);
      rotateInCanvas(ctx, HALF_PI, x, intY);
      y += stepInScene;
    }
  }
}
