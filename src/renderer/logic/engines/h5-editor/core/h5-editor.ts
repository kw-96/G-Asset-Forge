// H5-Editor核心类 - 扩展版本，支持更多功能
import { EventEmitter } from '../utils/event-emitter';
// 网格系统现在由Suika核心直接管理

export interface H5EditorOptions {
  containerElement: HTMLDivElement;
  width: number;
  height: number;
  mode?: 'mobile' | 'desktop';
  enablePreview?: boolean;
  enableMultiPage?: boolean;
  enableComponentLibrary?: boolean;
  enableTemplateSystem?: boolean;
}

export interface H5Project {
  id: string;
  name: string;
  pages: H5Page[];
}

export interface H5Page {
  isCurrentPage: boolean;
  id: string;
  name: string;
  width: number;
  height: number;
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  components: H5Component[];
}

export interface H5Component {
  id: string;
  type: 'text' | 'image' | 'button' | 'shape' | 'container' | 'custom';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  zIndex?: number;
  props: Record<string, any>;
}

export interface H5Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  pages: H5Page[];
  metadata: {
    author: string;
    description: string;
    tags: string[];
    createdAt: Date;
  };
}

export interface H5ComponentLibraryItem {
  id: string;
  name: string;
  type: H5Component['type'];
  category: string;
  thumbnail: string;
  defaultProps: Record<string, any>;
  previewComponent: H5Component;
}

export interface H5EditorEvents extends Record<string, (...args: any[]) => void> {
  pageChange(page: H5Page): void;
  componentAdd(component: H5Component): void;
  componentUpdate(component: H5Component): void;
  componentRemove(componentId: string): void;
  backgroundChange(background: H5Page['background']): void;
  canvasSizeChange(size: { width: number; height: number }): void;
  templateLoad(template: H5Template): void;
  exportStart(): void;
  exportComplete(result: { format: string; dataUrl: string; size: number }): void;
  exportError(error: Error): void;
  previewUpdate(previewUrl: string): void;
}

export class H5Editor {
  private containerElement: HTMLDivElement;
  private canvasElement!: HTMLCanvasElement;
  private previewCanvasElement: HTMLCanvasElement | null = null;
  private ctx!: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D | null = null;
  private emitter = new EventEmitter<H5EditorEvents>();
  
  private currentPage: H5Page | null = null;
  private pages: Map<string, H5Page> = new Map();
  private templates: Map<string, H5Template> = new Map();
  private componentLibrary: Map<string, H5ComponentLibraryItem> = new Map();
  private options: H5EditorOptions;
  private isDestroyed = false;
  // 网格系统现在由Suika核心直接管理

  constructor(options: H5EditorOptions) {
    this.options = {
      enablePreview: true,
      enableMultiPage: true,
      enableComponentLibrary: true,
      enableTemplateSystem: true,
      ...options
    };
    this.containerElement = options.containerElement;
    
    this.initializeCanvases();
    this.setupCanvas();
    this.initializeComponentLibrary();
    this.initializeTemplates();
    this.createDefaultPage();
    
    // 网格系统现在由Suika核心直接管理
    console.log('网格系统已由Suika核心接管');
  }

  private initializeCanvases(): void {
    // 创建主画布
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.style.position = 'absolute';
    this.canvasElement.style.top = '0';
    this.canvasElement.style.left = '0';
    this.canvasElement.style.zIndex = '1';
    this.containerElement.appendChild(this.canvasElement);
    this.ctx = this.canvasElement.getContext('2d')!;

    // 创建预览画布（如果启用）
    if (this.options.enablePreview) {
      this.previewCanvasElement = document.createElement('canvas');
      this.previewCanvasElement.style.position = 'absolute';
      this.previewCanvasElement.style.top = '0';
      this.previewCanvasElement.style.left = '0';
      this.previewCanvasElement.style.zIndex = '0';
      this.previewCanvasElement.style.opacity = '0.5';
      this.previewCanvasElement.style.pointerEvents = 'none';
      this.containerElement.appendChild(this.previewCanvasElement);
      this.previewCtx = this.previewCanvasElement.getContext('2d')!;
    }
  }

  private setupCanvas(): void {
    const { width, height } = this.options;
    const dpr = window.devicePixelRatio || 1;
    
    // 设置主画布
    this.canvasElement.width = width * dpr;
    this.canvasElement.height = height * dpr;
    this.canvasElement.style.width = `${width}px`;
    this.canvasElement.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);

    // 设置预览画布
    if (this.previewCanvasElement && this.previewCtx) {
      this.previewCanvasElement.width = width * dpr;
      this.previewCanvasElement.height = height * dpr;
      this.previewCanvasElement.style.width = `${width}px`;
      this.previewCanvasElement.style.height = `${height}px`;
      this.previewCtx.scale(dpr, dpr);
    }
  }

  private initializeComponentLibrary(): void {
    if (!this.options.enableComponentLibrary) return;

    // 初始化基础组件库
    const basicComponents: H5ComponentLibraryItem[] = [
      {
        id: 'text-basic',
        name: '基础文本',
        type: 'text',
        category: '文本',
        thumbnail: '',
        defaultProps: {
          text: '文本内容',
          fontSize: 16,
          color: '#333333',
          fontFamily: 'Arial',
          textAlign: 'left'
        },
        previewComponent: {
          id: 'preview-text',
          type: 'text',
          x: 0,
          y: 0,
          width: 100,
          height: 30,
          props: {
            text: '文本内容',
            fontSize: 16,
            color: '#333333'
          }
        }
      },
      {
        id: 'button-primary',
        name: '主要按钮',
        type: 'button',
        category: '按钮',
        thumbnail: '',
        defaultProps: {
          text: '按钮',
          backgroundColor: '#007bff',
          textColor: '#ffffff',
          borderRadius: 4,
          fontSize: 16
        },
        previewComponent: {
          id: 'preview-button',
          type: 'button',
          x: 0,
          y: 0,
          width: 100,
          height: 40,
          props: {
            text: '按钮',
            backgroundColor: '#007bff',
            textColor: '#ffffff'
          }
        }
      },
      {
        id: 'image-placeholder',
        name: '图片占位符',
        type: 'image',
        category: '媒体',
        thumbnail: '',
        defaultProps: {
          src: '',
          alt: '图片',
          fit: 'cover'
        },
        previewComponent: {
          id: 'preview-image',
          type: 'image',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          props: {
            src: '',
            alt: '图片'
          }
        }
      }
    ];

    basicComponents.forEach(component => {
      this.componentLibrary.set(component.id, component);
    });
  }

  private initializeTemplates(): void {
    if (!this.options.enableTemplateSystem) return;

    // 初始化基础模板
    const basicTemplates: H5Template[] = [
      {
        id: 'mobile-basic',
        name: '移动端基础模板',
        category: '移动端',
        thumbnail: '',
        pages: [{
          id: 'page_1',
          name: '首页',
          width: 375,
          height: 667,
          isCurrentPage: true,
          background: {
            type: 'color',
            value: '#ffffff'
          },
          components: []
        }],
        metadata: {
          author: 'G-Asset Forge',
          description: '移动端基础模板',
          tags: ['移动端', '基础'],
          createdAt: new Date()
        }
      },
      {
        id: 'desktop-basic',
        name: '桌面端基础模板',
        category: '桌面端',
        thumbnail: '',
        pages: [{
          id: 'page_1',
          name: '首页',
          width: 1200,
          height: 800,
          isCurrentPage: true,
          background: {
            type: 'color',
            value: '#ffffff'
          },
          components: []
        }],
        metadata: {
          author: 'G-Asset Forge',
          description: '桌面端基础模板',
          tags: ['桌面端', '基础'],
          createdAt: new Date()
        }
      }
    ];

    basicTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private createDefaultPage(): void {
    const defaultPage: H5Page = {
      id: 'page_' + Date.now(),
      name: '页面1',
      width: this.options.width,
      height: this.options.height,
      isCurrentPage: true,
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
  createPage(name: string, options?: Partial<H5Page>): H5Page {
    const page: H5Page = {
      id: 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name,
      width: options?.width || this.options.width,
      height: options?.height || this.options.height,
      isCurrentPage: false,
      background: options?.background || {
        type: 'color',
        value: '#ffffff'
      },
      components: options?.components || []
    };
    
    this.pages.set(page.id, page);
    return page;
  }

  deletePage(pageId: string): boolean {
    if (this.pages.size <= 1) {
      console.warn('Cannot delete the last page');
      return false;
    }

    const deleted = this.pages.delete(pageId);
    
    // 如果删除的是当前页面，切换到第一个可用页面
    if (deleted && this.currentPage?.id === pageId) {
      const firstPage = Array.from(this.pages.values())[0];
      if (firstPage) {
        this.setCurrentPage(firstPage.id);
      }
    }

    return deleted;
  }

  duplicatePage(pageId: string, newName?: string): H5Page | null {
    const sourcePage = this.pages.get(pageId);
    if (!sourcePage) return null;

    const duplicatedPage: H5Page = {
      ...sourcePage,
      id: 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: newName || `${sourcePage.name} 副本`,
      components: sourcePage.components.map(comp => ({
        ...comp,
        id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      }))
    };

    this.pages.set(duplicatedPage.id, duplicatedPage);
    return duplicatedPage;
  }

  setCurrentPage(pageId: string): void {
    const page = this.pages.get(pageId);
    if (page) {
      this.currentPage = page;
      this.render();
      this.emitter.emit('pageChange', page);
    }
  }

  getCurrentPage(): H5Page | null {
    return this.currentPage;
  }

  getAllPages(): H5Page[] {
    return Array.from(this.pages.values());
  }

  // 组件管理
  addComponent(component: H5Component): void {
    if (!this.currentPage) return;
    
    // 确保组件有唯一ID
    if (!component.id) {
      component.id = 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 设置默认属性
    component.rotation = component.rotation || 0;
    component.opacity = component.opacity || 1;
    component.visible = component.visible !== false;
    component.locked = component.locked || false;
    component.zIndex = component.zIndex || this.currentPage.components.length;
    
    this.currentPage.components.push(component);
    this.render();
    this.updatePreview();
    this.emitter.emit('componentAdd', component);
  }

  addComponentFromLibrary(libraryItemId: string, position?: { x: number; y: number }): H5Component | null {
    const libraryItem = this.componentLibrary.get(libraryItemId);
    if (!libraryItem) return null;

    const component: H5Component = {
      ...libraryItem.previewComponent,
      id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      x: position?.x || 50,
      y: position?.y || 50,
      props: { ...libraryItem.defaultProps }
    };

    this.addComponent(component);
    return component;
  }

  updateComponent(componentId: string, updates: Partial<H5Component>): void {
    if (!this.currentPage) return;
    
    const component = this.currentPage.components.find(c => c.id === componentId);
    if (component) {
      Object.assign(component, updates);
      this.render();
      this.updatePreview();
      this.emitter.emit('componentUpdate', component);
    }
  }

  getComponent(componentId: string): H5Component | null {
    if (!this.currentPage) return null;
    return this.currentPage.components.find(c => c.id === componentId) || null;
  }

  getComponentsByType(type: H5Component['type']): H5Component[] {
    if (!this.currentPage) return [];
    return this.currentPage.components.filter(c => c.type === type);
  }

  moveComponent(componentId: string, newIndex: number): void {
    if (!this.currentPage) return;
    
    const components = this.currentPage.components;
    const currentIndex = components.findIndex(c => c.id === componentId);
    
    if (currentIndex !== -1 && newIndex >= 0 && newIndex < components.length) {
      const [component] = components.splice(currentIndex, 1);
      if (component) {
        components.splice(newIndex, 0, component);
        
        // 更新zIndex
        components.forEach((comp, index) => {
          comp.zIndex = index;
        });
        
        this.render();
        this.updatePreview();
      }
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
  setPageBackground(background: H5Page['background'] | any): void {
    if (!this.currentPage) return;
    
    // 兼容新的背景格式
    if (typeof background === 'object' && background.type) {
      switch (background.type) {
        case 'color':
          this.currentPage.background = {
            type: 'color',
            value: background.value
          };
          break;
        case 'gradient':
          // 将新格式转换为旧格式
          this.currentPage.background = {
            type: 'gradient',
            value: JSON.stringify(background)
          };
          break;
        case 'image':
          this.currentPage.background = {
            type: 'image',
            value: background.url
          };
          break;
        default:
          this.currentPage.background = background;
      }
    } else {
      this.currentPage.background = background;
    }
    
    this.render();
    this.updatePreview();
    this.emitter.emit('backgroundChange', this.currentPage.background);
  }

  setCanvasSize(width: number, height: number): void {
    if (!this.currentPage) return;

    this.currentPage.width = width;
    this.currentPage.height = height;
    this.options.width = width;
    this.options.height = height;

    this.setupCanvas();
    this.render();
    this.updatePreview();
    this.emitter.emit('canvasSizeChange', { width, height });
  }

  // 模板系统
  loadTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    try {
      // 清空现有页面
      this.pages.clear();

      // 加载模板页面
      template.pages.forEach(page => {
        const newPage: H5Page = {
          ...page,
          id: 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          components: page.components.map(comp => ({
            ...comp,
            id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          }))
        };
        this.pages.set(newPage.id, newPage);
      });

      // 设置第一个页面为当前页面
      const firstPage = Array.from(this.pages.values())[0];
      if (firstPage) {
        this.setCurrentPage(firstPage.id);
      }

      this.emitter.emit('templateLoad', template);
      return true;
    } catch (error) {
      console.error('Failed to load template:', error);
      return false;
    }
  }

  saveAsTemplate(name: string, category: string = '自定义'): H5Template {
    const template: H5Template = {
      id: 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name,
      category,
      thumbnail: this.exportAsImage('png', 0.3), // 生成缩略图
      pages: Array.from(this.pages.values()).map(page => ({
        ...page,
        components: [...page.components]
      })),
      metadata: {
        author: 'User',
        description: `用户创建的模板: ${name}`,
        tags: [category, '用户创建'],
        createdAt: new Date()
      }
    };

    this.templates.set(template.id, template);
    return template;
  }

  getTemplates(): H5Template[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): H5Template[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  // 组件库管理
  getComponentLibrary(): H5ComponentLibraryItem[] {
    return Array.from(this.componentLibrary.values());
  }

  getComponentLibraryByCategory(category: string): H5ComponentLibraryItem[] {
    return Array.from(this.componentLibrary.values()).filter(item => item.category === category);
  }

  addToComponentLibrary(item: H5ComponentLibraryItem): void {
    this.componentLibrary.set(item.id, item);
  }

  // 渲染
  render(): void {
    if (!this.currentPage || this.isDestroyed) return;
    
    const { width, height } = this.currentPage;
    
    // 清空画布
    this.ctx.clearRect(0, 0, width, height);
    
    // 渲染背景
    this.renderBackground();
    
    // 按zIndex排序并渲染组件
    const sortedComponents = [...this.currentPage.components]
      .filter(comp => comp.visible !== false)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    
    sortedComponents.forEach(component => {
      this.renderComponent(component);
    });
  }

  // 预览功能
  updatePreview(): void {
    if (!this.options.enablePreview || !this.previewCtx || !this.currentPage) return;

    const { width, height } = this.currentPage;
    
    // 清空预览画布
    this.previewCtx.clearRect(0, 0, width, height);
    
    // 渲染预览（可以添加特殊效果，如网格、参考线等）
    this.renderPreviewGrid();
    
    // 生成预览URL并触发事件
    if (this.previewCanvasElement) {
      const previewUrl = this.previewCanvasElement.toDataURL('image/png', 0.5);
      this.emitter.emit('previewUpdate', previewUrl);
    }
  }

  private renderPreviewGrid(): void {
    if (!this.previewCtx || !this.currentPage) return;

    // 网格渲染已由Suika系统处理
    // 预览网格功能暂时禁用，由Suika系统统一管理
  }

  togglePreview(visible: boolean): void {
    if (this.previewCanvasElement) {
      this.previewCanvasElement.style.display = visible ? 'block' : 'none';
    }
  }

  getPreviewDataUrl(): string {
    if (!this.previewCanvasElement) return '';
    return this.previewCanvasElement.toDataURL('image/png', 0.8);
  }

  private renderBackground(): void {
    if (!this.currentPage) return;
    
    const { width, height } = this.currentPage;
    const { background } = this.currentPage;
    
    switch (background.type) {
      case 'color':
        this.ctx.fillStyle = background.value;
        this.ctx.fillRect(0, 0, width, height);
        break;
      case 'gradient':
        this.renderGradientBackground(background.value, width, height);
        break;
      case 'image':
        this.renderImageBackground(background.value, width, height);
        break;
    }
  }

  private renderGradientBackground(gradientData: string, width: number, height: number): void {
    try {
      // 解析渐变数据 (简化版本，实际应该支持更复杂的渐变格式)
      const gradientInfo = JSON.parse(gradientData);
      let gradient: CanvasGradient;

      if (gradientInfo.type === 'linear') {
        gradient = this.ctx.createLinearGradient(
          gradientInfo.x0 || 0,
          gradientInfo.y0 || 0,
          gradientInfo.x1 || width,
          gradientInfo.y1 || height
        );
      } else {
        gradient = this.ctx.createRadialGradient(
          gradientInfo.x0 || width / 2,
          gradientInfo.y0 || height / 2,
          gradientInfo.r0 || 0,
          gradientInfo.x1 || width / 2,
          gradientInfo.y1 || height / 2,
          gradientInfo.r1 || Math.min(width, height) / 2
        );
      }

      gradientInfo.stops.forEach((stop: { offset: number; color: string }) => {
        gradient.addColorStop(stop.offset, stop.color);
      });

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, width, height);
    } catch (error) {
      console.error('Failed to render gradient background:', error);
      // 回退到纯色背景
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, width, height);
    }
  }

  private renderImageBackground(imageUrl: string, width: number, height: number): void {
    const img = new Image();
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, width, height);
      this.updatePreview();
    };
    img.onerror = () => {
      console.error('Failed to load background image:', imageUrl);
      // 回退到纯色背景
      this.ctx.fillStyle = '#f0f0f0';
      this.ctx.fillRect(0, 0, width, height);
    };
    img.src = imageUrl;
  }

  private renderComponent(component: H5Component): void {
    if (!component.visible || component.opacity === 0) return;

    this.ctx.save();
    
    // 应用透明度
    if (component.opacity && component.opacity < 1) {
      this.ctx.globalAlpha = component.opacity;
    }
    
    // 应用变换
    this.ctx.translate(component.x + component.width / 2, component.y + component.height / 2);
    
    if (component.rotation) {
      this.ctx.rotate((component.rotation * Math.PI) / 180);
    }
    
    this.ctx.translate(-component.width / 2, -component.height / 2);
    
    // 渲染组件
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
      case 'shape':
        this.renderShapeComponent(component);
        break;
      case 'container':
        this.renderContainerComponent(component);
        break;
      default:
        this.renderDefaultComponent(component);
    }
    
    // 如果组件被锁定，绘制锁定指示器
    if (component.locked) {
      this.renderLockIndicator(component);
    }
    
    this.ctx.restore();
  }

  private renderTextComponent(component: H5Component): void {
    const { 
      text, 
      fontSize, 
      color, 
      fontFamily, 
      textAlign, 
      fontWeight, 
      fontStyle,
      textDecoration,
      lineHeight,
      letterSpacing
    } = component.props;
    
    this.ctx.fillStyle = color || '#333333';
    
    // 构建字体字符串
    let fontString = '';
    if (fontStyle) fontString += `${fontStyle} `;
    if (fontWeight) fontString += `${fontWeight} `;
    fontString += `${fontSize || 16}px `;
    fontString += fontFamily || 'Arial';
    
    this.ctx.font = fontString;
    this.ctx.textAlign = (textAlign as CanvasTextAlign) || 'left';
    this.ctx.textBaseline = 'top';
    
    if (letterSpacing) {
      // 简化的字母间距实现
      const chars = (text || 'Text').split('');
      let x = 0;
      chars.forEach((char: string) => {
        this.ctx.fillText(char, x, 0);
        x += this.ctx.measureText(char).width + letterSpacing;
      });
    } else {
      // 处理多行文本
      const lines = (text || 'Text').split('\n');
      const lineHeightPx = (lineHeight || 1.2) * (fontSize || 16);
      
      lines.forEach((line: string, index: number) => {
        this.ctx.fillText(line, 0, index * lineHeightPx);
      });
    }
    
    // 处理文本装饰
    if (textDecoration === 'underline') {
      const textWidth = this.ctx.measureText(text || 'Text').width;
      this.ctx.strokeStyle = color || '#333333';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, (fontSize || 16) + 2);
      this.ctx.lineTo(textWidth, (fontSize || 16) + 2);
      this.ctx.stroke();
    }
  }

  private renderImageComponent(component: H5Component): void {
    const { src, alt, fit, borderRadius } = component.props;
    
    if (src) {
      const img = new Image();
      img.onload = () => {
        this.ctx.save();
        
        // 处理圆角
        if (borderRadius) {
          this.createRoundedRectPath(0, 0, component.width, component.height, borderRadius);
          this.ctx.clip();
        }
        
        // 根据fit属性调整图片显示
        switch (fit) {
          case 'cover':
            this.drawImageCover(img, 0, 0, component.width, component.height);
            break;
          case 'contain':
            this.drawImageContain(img, 0, 0, component.width, component.height);
            break;
          case 'fill':
          default:
            this.ctx.drawImage(img, 0, 0, component.width, component.height);
        }
        
        this.ctx.restore();
        this.updatePreview();
      };
      img.onerror = () => {
        this.renderImagePlaceholder(component, alt || '图片加载失败');
      };
      img.src = src;
    } else {
      this.renderImagePlaceholder(component, alt || '图片');
    }
  }

  private renderImagePlaceholder(component: H5Component, text: string): void {
    // 绘制占位符背景
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, component.width, component.height);
    
    // 绘制边框
    this.ctx.strokeStyle = '#ccc';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, component.width, component.height);
    
    // 绘制占位符文本
    this.ctx.fillStyle = '#999';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, component.width / 2, component.height / 2);
  }

  private drawImageCover(img: HTMLImageElement, x: number, y: number, width: number, height: number): void {
    const imgRatio = img.width / img.height;
    const containerRatio = width / height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (imgRatio > containerRatio) {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    } else {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    }
    
    this.ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
  }

  private drawImageContain(img: HTMLImageElement, x: number, y: number, width: number, height: number): void {
    const imgRatio = img.width / img.height;
    const containerRatio = width / height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (imgRatio > containerRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    }
    
    this.ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
  }

  private createRoundedRectPath(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  private renderButtonComponent(component: H5Component): void {
    const { 
      text, 
      backgroundColor, 
      textColor, 
      borderRadius, 
      borderWidth, 
      borderColor,
      fontSize,
      fontFamily,
      fontWeight,
      shadow
    } = component.props;
    
    this.ctx.save();
    
    // 绘制阴影
    if (shadow) {
      this.ctx.shadowColor = shadow.color || 'rgba(0,0,0,0.2)';
      this.ctx.shadowBlur = shadow.blur || 4;
      this.ctx.shadowOffsetX = shadow.offsetX || 0;
      this.ctx.shadowOffsetY = shadow.offsetY || 2;
    }
    
    // 绘制按钮背景
    if (borderRadius) {
      this.createRoundedRectPath(0, 0, component.width, component.height, borderRadius);
      this.ctx.fillStyle = backgroundColor || '#007bff';
      this.ctx.fill();
      
      if (borderWidth && borderColor) {
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        this.ctx.stroke();
      }
    } else {
      this.ctx.fillStyle = backgroundColor || '#007bff';
      this.ctx.fillRect(0, 0, component.width, component.height);
      
      if (borderWidth && borderColor) {
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        this.ctx.strokeRect(0, 0, component.width, component.height);
      }
    }
    
    this.ctx.restore();
    
    // 绘制按钮文字
    this.ctx.fillStyle = textColor || '#ffffff';
    
    let fontString = '';
    if (fontWeight) fontString += `${fontWeight} `;
    fontString += `${fontSize || 16}px `;
    fontString += fontFamily || 'Arial';
    
    this.ctx.font = fontString;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      text || 'Button',
      component.width / 2,
      component.height / 2
    );
  }

  private renderShapeComponent(component: H5Component): void {
    const { 
      shapeType, 
      fillColor, 
      strokeColor, 
      strokeWidth, 
      cornerRadius 
    } = component.props;
    
    this.ctx.save();
    
    if (fillColor) {
      this.ctx.fillStyle = fillColor;
    }
    
    if (strokeColor && strokeWidth) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
    }
    
    switch (shapeType) {
      case 'rectangle':
        if (cornerRadius) {
          this.createRoundedRectPath(0, 0, component.width, component.height, cornerRadius);
          if (fillColor) this.ctx.fill();
          if (strokeColor && strokeWidth) this.ctx.stroke();
        } else {
          if (fillColor) this.ctx.fillRect(0, 0, component.width, component.height);
          if (strokeColor && strokeWidth) this.ctx.strokeRect(0, 0, component.width, component.height);
        }
        break;
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(component.width / 2, component.height / 2, Math.min(component.width, component.height) / 2, 0, 2 * Math.PI);
        if (fillColor) this.ctx.fill();
        if (strokeColor && strokeWidth) this.ctx.stroke();
        break;
      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(component.width / 2, 0);
        this.ctx.lineTo(0, component.height);
        this.ctx.lineTo(component.width, component.height);
        this.ctx.closePath();
        if (fillColor) this.ctx.fill();
        if (strokeColor && strokeWidth) this.ctx.stroke();
        break;
      default:
        // 默认矩形
        if (fillColor) this.ctx.fillRect(0, 0, component.width, component.height);
        if (strokeColor && strokeWidth) this.ctx.strokeRect(0, 0, component.width, component.height);
    }
    
    this.ctx.restore();
  }

  private renderContainerComponent(component: H5Component): void {
    const { backgroundColor, borderColor, borderWidth, borderRadius } = component.props;
    
    this.ctx.save();
    
    if (borderRadius) {
      this.createRoundedRectPath(0, 0, component.width, component.height, borderRadius);
      if (backgroundColor) {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fill();
      }
      if (borderColor && borderWidth) {
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        this.ctx.stroke();
      }
    } else {
      if (backgroundColor) {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, component.width, component.height);
      }
      if (borderColor && borderWidth) {
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = borderWidth;
        this.ctx.strokeRect(0, 0, component.width, component.height);
      }
    }
    
    this.ctx.restore();
  }

  private renderDefaultComponent(component: H5Component): void {
    // 默认渲染为带边框的矩形
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, component.width, component.height);
    this.ctx.strokeStyle = '#ccc';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, component.width, component.height);
    
    // 显示组件类型
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      component.type,
      component.width / 2,
      component.height / 2
    );
  }

  private renderLockIndicator(component: H5Component): void {
    const size = 16;
    const x = component.width - size - 4;
    const y = 4;
    
    // 绘制锁定图标背景
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.fillRect(x, y, size, size);
    
    // 绘制锁定图标
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🔒', x + size / 2, y + size / 2);
  }

  // 导出功能
  exportAsImage(format: 'png' | 'jpg' = 'png', quality: number = 1, scale: number = 1): string {
    if (!this.currentPage) return '';

    try {
      this.emitter.emit('exportStart');

      // 如果需要缩放，创建临时画布
      if (scale !== 1) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        
        const scaledWidth = this.currentPage.width * scale;
        const scaledHeight = this.currentPage.height * scale;
        
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;
        
        tempCtx.scale(scale, scale);
        
        // 在临时画布上重新渲染
        this.renderToContext(tempCtx);
        
        const dataUrl = tempCanvas.toDataURL(`image/${format}`, quality);
        const blob = this.dataURLToBlob(dataUrl);
        
        this.emitter.emit('exportComplete', {
          format,
          dataUrl,
          size: blob.size
        });
        
        return dataUrl;
      } else {
        const dataUrl = this.canvasElement.toDataURL(`image/${format}`, quality);
        const blob = this.dataURLToBlob(dataUrl);
        
        this.emitter.emit('exportComplete', {
          format,
          dataUrl,
          size: blob.size
        });
        
        return dataUrl;
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.emitter.emit('exportError', error as Error);
      return '';
    }
  }

  private renderToContext(ctx: CanvasRenderingContext2D): void {
    if (!this.currentPage) return;

    const originalCtx = this.ctx;
    this.ctx = ctx;

    try {
      const { width, height } = this.currentPage;
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 渲染背景
      this.renderBackground();
      
      // 渲染组件
      const sortedComponents = [...this.currentPage.components]
        .filter(comp => comp.visible !== false)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      sortedComponents.forEach(component => {
        this.renderComponent(component);
      });
    } finally {
      this.ctx = originalCtx;
    }
  }

  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0] ? arr[0].match(/:(.*?);/) : null;
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = arr[1] ? atob(arr[1]) : '';
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime || 'image/png' });
  }

  exportPageData(): H5Page | null {
    return this.currentPage ? JSON.parse(JSON.stringify(this.currentPage)) : null;
  }

  exportAllPagesData(): H5Page[] {
    return Array.from(this.pages.values()).map(page => 
      JSON.parse(JSON.stringify(page))
    );
  }

  exportProjectData(): { pages: H5Page[]; metadata: any } {
    return {
      pages: this.exportAllPagesData(),
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        editorVersion: 'H5Editor-1.0',
        totalPages: this.pages.size,
        currentPageId: this.currentPage?.id
      }
    };
  }

  // 导出预览
  getExportPreview(format: 'png' | 'jpg' = 'png', quality: number = 0.8, maxSize: number = 200): string {
    if (!this.currentPage) return '';

    const scale = Math.min(maxSize / this.currentPage.width, maxSize / this.currentPage.height);
    return this.exportAsImage(format, quality, scale);
  }

  // 事件管理
  on<T extends keyof H5EditorEvents>(eventName: T, listener: H5EditorEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof H5EditorEvents>(eventName: T, listener: H5EditorEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  // 销毁
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // 清理画布元素
    if (this.canvasElement && this.containerElement.contains(this.canvasElement)) {
      this.containerElement.removeChild(this.canvasElement);
    }

    if (this.previewCanvasElement && this.containerElement.contains(this.previewCanvasElement)) {
      this.containerElement.removeChild(this.previewCanvasElement);
    }

    // 清理数据
    this.pages.clear();
    this.templates.clear();
    this.componentLibrary.clear();
    this.currentPage = null;

    // 清理事件监听器
    this.emitter.removeAllListeners();

    console.log('H5Editor destroyed successfully');
  }

  // 工具方法
  isInitialized(): boolean {
    return !this.isDestroyed && !!this.canvasElement && !!this.ctx;
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.canvasElement;
  }

  getPreviewCanvasElement(): HTMLCanvasElement | null {
    return this.previewCanvasElement;
  }

  getOptions(): H5EditorOptions {
    return { ...this.options };
  }

  // 性能监控
  getPerformanceInfo(): {
    pagesCount: number;
    componentsCount: number;
    templatesCount: number;
    componentLibraryCount: number;
    canvasSize: { width: number; height: number };
    memoryUsage: string;
  } {
    const totalComponents = Array.from(this.pages.values())
      .reduce((sum, page) => sum + page.components.length, 0);

    return {
      pagesCount: this.pages.size,
      componentsCount: totalComponents,
      templatesCount: this.templates.size,
      componentLibraryCount: this.componentLibrary.size,
      canvasSize: this.currentPage ? 
        { width: this.currentPage.width, height: this.currentPage.height } :
        { width: 0, height: 0 },
      memoryUsage: `${Math.round(((performance as any).memory?.usedJSHeapSize || 0) / 1024 / 1024)}MB`
    };
  }
}