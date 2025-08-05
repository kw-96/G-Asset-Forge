// H5-Editor核心类
import { EventEmitter } from '../utils/event-emitter';

export interface IH5EditorOptions {
  containerElement: HTMLDivElement;
  width: number;
  height: number;
  mode?: 'mobile' | 'desktop';
}

export interface IH5Page {
  id: string;
  name: string;
  width: number;
  height: number;
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  components: IH5Component[];
}

export interface IH5Component {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, any>;
}

export interface IH5EditorEvents extends Record<string, (...args: any[]) => void> {
  pageChange(page: IH5Page): void;
  componentAdd(component: IH5Component): void;
  componentUpdate(component: IH5Component): void;
  componentRemove(componentId: string): void;
}

export class H5Editor {
  private containerElement: HTMLDivElement;
  private canvasElement: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private emitter = new EventEmitter<IH5EditorEvents>();
  
  private currentPage: IH5Page | null = null;
  private pages: Map<string, IH5Page> = new Map();
  private options: IH5EditorOptions;

  constructor(options: IH5EditorOptions) {
    this.options = options;
    this.containerElement = options.containerElement;
    
    // 创建canvas
    this.canvasElement = document.createElement('canvas');
    this.containerElement.appendChild(this.canvasElement);
    this.ctx = this.canvasElement.getContext('2d')!;
    
    this.setupCanvas();
    this.createDefaultPage();
  }

  private setupCanvas(): void {
    const { width, height } = this.options;
    const dpr = window.devicePixelRatio || 1;
    
    this.canvasElement.width = width * dpr;
    this.canvasElement.height = height * dpr;
    this.canvasElement.style.width = `${width}px`;
    this.canvasElement.style.height = `${height}px`;
    
    this.ctx.scale(dpr, dpr);
  }

  private createDefaultPage(): void {
    const defaultPage: IH5Page = {
      id: 'page_' + Date.now(),
      name: '页面1',
      width: this.options.width,
      height: this.options.height,
      background: {
        type: 'color',
        value: '#ffffff'
      },
      components: []
    };
    
    this.pages.set(defaultPage.id, defaultPage);
    this.setCurrentPage(defaultPage.id);
  }

  // 页面管理
  createPage(name: string): IH5Page {
    const page: IH5Page = {
      id: 'page_' + Date.now(),
      name,
      width: this.options.width,
      height: this.options.height,
      background: {
        type: 'color',
        value: '#ffffff'
      },
      components: []
    };
    
    this.pages.set(page.id, page);
    return page;
  }

  setCurrentPage(pageId: string): void {
    const page = this.pages.get(pageId);
    if (page) {
      this.currentPage = page;
      this.render();
      this.emitter.emit('pageChange', page);
    }
  }

  getCurrentPage(): IH5Page | null {
    return this.currentPage;
  }

  getAllPages(): IH5Page[] {
    return Array.from(this.pages.values());
  }

  // 组件管理
  addComponent(component: IH5Component): void {
    if (!this.currentPage) return;
    
    this.currentPage.components.push(component);
    this.render();
    this.emitter.emit('componentAdd', component);
  }

  updateComponent(componentId: string, updates: Partial<IH5Component>): void {
    if (!this.currentPage) return;
    
    const component = this.currentPage.components.find(c => c.id === componentId);
    if (component) {
      Object.assign(component, updates);
      this.render();
      this.emitter.emit('componentUpdate', component);
    }
  }

  removeComponent(componentId: string): void {
    if (!this.currentPage) return;
    
    const index = this.currentPage.components.findIndex(c => c.id === componentId);
    if (index !== -1) {
      this.currentPage.components.splice(index, 1);
      this.render();
      this.emitter.emit('componentRemove', componentId);
    }
  }

  // 背景设置
  setPageBackground(background: IH5Page['background']): void {
    if (!this.currentPage) return;
    
    this.currentPage.background = background;
    this.render();
  }

  // 渲染
  render(): void {
    if (!this.currentPage) return;
    
    const { width, height } = this.options;
    
    // 清空画布
    this.ctx.clearRect(0, 0, width, height);
    
    // 渲染背景
    this.renderBackground();
    
    // 渲染组件
    this.currentPage.components.forEach(component => {
      this.renderComponent(component);
    });
  }

  private renderBackground(): void {
    if (!this.currentPage) return;
    
    const { width, height } = this.options;
    const { background } = this.currentPage;
    
    switch (background.type) {
      case 'color':
        this.ctx.fillStyle = background.value;
        this.ctx.fillRect(0, 0, width, height);
        break;
      case 'gradient':
        // 实现渐变背景
        break;
      case 'image':
        // 实现图片背景
        break;
    }
  }

  private renderComponent(component: IH5Component): void {
    this.ctx.save();
    this.ctx.translate(component.x, component.y);
    
    switch (component.type) {
      case 'text':
        this.renderTextComponent(component);
        break;
      case 'image':
        this.renderImageComponent(component);
        break;
      case 'button':
        this.renderButtonComponent(component);
        break;
      default:
        // 默认渲染为矩形
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillRect(0, 0, component.width, component.height);
    }
    
    this.ctx.restore();
  }

  private renderTextComponent(component: IH5Component): void {
    const { text, fontSize, color } = component.props;
    
    this.ctx.fillStyle = color || '#333333';
    this.ctx.font = `${fontSize || 16}px Arial`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text || 'Text', 0, 0);
  }

  private renderImageComponent(component: IH5Component): void {
    // 实现图片组件渲染
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, component.width, component.height);
    this.ctx.strokeStyle = '#ccc';
    this.ctx.strokeRect(0, 0, component.width, component.height);
  }

  private renderButtonComponent(component: IH5Component): void {
    const { text, backgroundColor, textColor } = component.props;
    
    // 绘制按钮背景
    this.ctx.fillStyle = backgroundColor || '#007bff';
    this.ctx.fillRect(0, 0, component.width, component.height);
    
    // 绘制按钮文字
    this.ctx.fillStyle = textColor || '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      text || 'Button',
      component.width / 2,
      component.height / 2
    );
  }

  // 导出功能
  exportAsImage(format: 'png' | 'jpg' = 'png', quality: number = 1): string {
    return this.canvasElement.toDataURL(`image/${format}`, quality);
  }

  exportPageData(): IH5Page | null {
    return this.currentPage ? { ...this.currentPage } : null;
  }

  // 事件管理
  on<T extends keyof IH5EditorEvents>(eventName: T, listener: IH5EditorEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IH5EditorEvents>(eventName: T, listener: IH5EditorEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  // 销毁
  destroy(): void {
    if (this.canvasElement && this.containerElement.contains(this.canvasElement)) {
      this.containerElement.removeChild(this.canvasElement);
    }
  }
}