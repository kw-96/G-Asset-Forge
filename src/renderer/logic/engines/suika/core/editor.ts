/**
 * Suika编辑器核心 - 主编辑器类，管理所有子系统
 * @description 提供编辑器的核心功能，包括画布管理、视口控制、工具管理等
 * @author Suika团队
 */

import { EventEmitter, genUuid } from '../common';
import { mergeBoxes } from '../geo';
import { Setting, type SettingValue } from './setting';
import { ViewportManager } from './viewport-manager';
import { Ruler } from './ruler';
import { RefLine } from './ref-line';

export interface SuikaEditorOptions {
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
  render(): void;
  selectionChange(): void;
}

/**
 * Suika编辑器主类
 */
export class SuikaEditor {
  containerElement: HTMLDivElement;
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  appVersion = 'suika-editor_0.0.3';
  paperId: string;

  private emitter = new EventEmitter<Events>();

  // 核心系统
  setting: Setting;
  viewportManager: ViewportManager;
  ruler: Ruler;
  refLine: RefLine;

  // 简化的文档和场景图
  doc: any;
  sceneGraph: any;
  selectedElements: any;

  // 性能监控
  perfMonitor: any;

  constructor(options: SuikaEditorOptions) {
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

    this.viewportManager = new ViewportManager(this);
    this.ruler = new Ruler(this);
    this.refLine = new RefLine(this);

    // 简化的文档和场景图实现
    this.doc = this.createSimpleDocument();
    this.sceneGraph = this.createSimpleSceneGraph();
    this.selectedElements = this.createSimpleSelectedElements();

    this.paperId = genUuid();

    this.viewportManager.setViewportSize({
      width: options.width,
      height: options.height,
    });

    // 性能监控（简化实现）
    this.perfMonitor = {
      start: () => {},
      destroy: () => {},
    };

    if (options.showPerfMonitor) {
      this.perfMonitor.start(this.containerElement);
    }

    // 异步渲染
    Promise.resolve().then(() => {
      this.render();
    });
  }

  /**
   * 销毁编辑器
   */
  destroy() {
    this.containerElement.removeChild(this.canvasElement);
    this.perfMonitor.destroy();
    this.emitter.emit('destroy');
  }

  /**
   * 设置光标
   */
  setCursor(cursor: any) {
    this.containerElement.style.cursor = cursor.type || 'default';
  }

  /**
   * 获取光标
   */
  getCursor() {
    return { type: this.containerElement.style.cursor || 'default' };
  }

  /**
   * 视口坐标转场景坐标
   */
  toScenePt(x: number, y: number, round = false) {
    const viewMatrix = this.viewportManager.getViewMatrix();
    const scenePt = viewMatrix.applyInverse({ x, y });
    if (round) {
      scenePt.x = Math.round(scenePt.x);
      scenePt.y = Math.round(scenePt.y);
    }
    return scenePt;
  }

  /**
   * 场景坐标转视口坐标
   */
  toViewportPt(x: number, y: number) {
    const viewMatrix = this.viewportManager.getViewMatrix();
    return viewMatrix.apply({ x, y });
  }

  /**
   * 场景尺寸转视口尺寸
   */
  toSceneSize(size: number) {
    const zoom = this.viewportManager.getZoom();
    return size / zoom;
  }

  /**
   * 视口尺寸转场景尺寸
   */
  toViewportSize(size: number) {
    const zoom = this.viewportManager.getZoom();
    return size * zoom;
  }

  /**
   * 获取光标视口坐标
   */
  getCursorXY(event: { clientX: number; clientY: number }) {
    return {
      x: event.clientX - this.setting.get('offsetX'),
      y: event.clientY - this.setting.get('offsetY'),
    };
  }

  /**
   * 获取光标场景坐标
   */
  getSceneCursorXY(event: { clientX: number; clientY: number }, round = false) {
    const { x, y } = this.getCursorXY(event);
    return this.toScenePt(x, y, round);
  }

  /**
   * 渲染画布
   */
  render() {
    const ctx = this.ctx;
    const { width, height } = this.viewportManager.getPageSize();
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景
    ctx.fillStyle = this.setting.get('canvasBgColor');
    ctx.fillRect(0, 0, width, height);

    // 绘制场景图（简化实现）
    this.sceneGraph.render(ctx);

    // 绘制标尺
    if (this.setting.get('enableRuler') && this.ruler.visible) {
      this.ruler.draw();
    }

    // 绘制参考线
    this.refLine.drawRefLine(ctx);

    this.emitter.emit('render');
  }

  /**
   * 获取画布子元素边界框
   */
  getCanvasChildrenBbox() {
    const canvasGraphics = this.doc.getCurrentCanvas();
    if (!canvasGraphics) {
      return null;
    }
    const children = canvasGraphics
      .getChildren()
      .filter((item: any) => item.isVisible());
    if (children.length === 0) return null;
    return mergeBoxes(children.map((item: any) => item.getBbox()));
  }

  /**
   * 获取编辑器状态
   */
  getState() {
    return {
      zoom: this.viewportManager.getZoom(),
      viewport: this.viewportManager.getPos(),
      selectedObjects: this.selectedElements.getItems(),
    };
  }

  /**
   * 设置编辑器状态
   */
  setState(state: any) {
    if (state.zoom !== undefined) {
      const center = this.viewportManager.getPageSize();
      this.viewportManager.setZoom(state.zoom, {
        x: center.width / 2,
        y: center.height / 2,
      });
    }
    if (state.viewport !== undefined) {
      this.viewportManager.translate(state.viewport.x, state.viewport.y);
    }
  }

  /**
   * 获取性能信息
   */
  getPerformanceInfo() {
    return {
      fps: 60, // 简化实现
      frameCount: 0,
    };
  }

  /**
   * 事件监听
   */
  on<T extends keyof Events>(eventName: T, listener: Events[T]) {
    this.emitter.on(eventName, listener);
  }

  /**
   * 移除事件监听
   */
  off<T extends keyof Events>(eventName: T, listener: Events[T]) {
    this.emitter.off(eventName, listener);
  }

  /**
   * 创建简化的文档对象
   */
  private createSimpleDocument() {
    return {
      getCurrentCanvas: () => ({
        forEachVisibleChildNode: (_callback: (graphics: any) => void) => {
          // 简化实现，暂时返回空
        },
        getChildren: () => [],
      }),
    };
  }

  /**
   * 创建简化的场景图对象
   */
  private createSimpleSceneGraph() {
    return {
      render: (_ctx: CanvasRenderingContext2D) => {
        // 简化的渲染实现
      },
      addObject: (_object: any) => {
        // 简化的添加对象实现
      },
      removeObject: (_id: string) => {
        // 简化的移除对象实现
      },
      getObject: (_id: string) => {
        // 简化的获取对象实现
        return null;
      },
      getObjects: () => {
        // 简化的获取所有对象实现
        return [];
      },
    };
  }

  /**
   * 创建简化的选中元素管理器
   */
  private createSimpleSelectedElements() {
    return {
      getItems: () => [],
      getBoundingRect: () => null,
    };
  }
}