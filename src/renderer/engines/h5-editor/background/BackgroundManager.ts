// H5编辑器背景管理器 - 增强版背景设置功能
import { EventEmitter } from '../utils/event-emitter';

export interface IBackgroundColor {
  type: 'color';
  value: string; // 十六进制颜色值，如 '#ffffff'
}

export interface IBackgroundGradient {
  type: 'gradient';
  gradientType: 'linear' | 'radial';
  angle?: number; // 线性渐变角度（度）
  centerX?: number; // 径向渐变中心X（0-1）
  centerY?: number; // 径向渐变中心Y（0-1）
  radius?: number; // 径向渐变半径（0-1）
  stops: Array<{
    offset: number; // 0-1
    color: string; // 十六进制颜色值
    opacity?: number; // 0-1
  }>;
}

export interface IBackgroundImage {
  type: 'image';
  url: string;
  fit: 'cover' | 'contain' | 'fill' | 'repeat' | 'center';
  opacity?: number; // 0-1
  blur?: number; // 模糊半径（像素）
  brightness?: number; // 亮度调整（0-2，1为正常）
  contrast?: number; // 对比度调整（0-2，1为正常）
  saturation?: number; // 饱和度调整（0-2，1为正常）
}

export type IBackgroundSettings = IBackgroundColor | IBackgroundGradient | IBackgroundImage;

export interface IBackgroundPreset {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  background: IBackgroundSettings;
  description: string;
  tags: string[];
}

export interface IBackgroundManagerEvents extends Record<string, (...args: any[]) => void> {
  backgroundChange(background: IBackgroundSettings): void;
  previewUpdate(previewUrl: string): void;
  presetLoad(preset: IBackgroundPreset): void;
  imageUpload(imageUrl: string): void;
  error(error: Error): void;
}

/**
 * H5编辑器背景管理器
 * 提供纯色、渐变、图片背景的创建、编辑和预览功能
 */
export class BackgroundManager {
  private emitter = new EventEmitter<IBackgroundManagerEvents>();
  private presets: Map<string, IBackgroundPreset> = new Map();
  private currentBackground: IBackgroundSettings | null = null;
  private previewCanvas: HTMLCanvasElement | null = null;
  private previewCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.initializePresets();
    this.initializePreviewCanvas();
  }

  /**
   * 初始化背景预设
   */
  private initializePresets(): void {
    const defaultPresets: IBackgroundPreset[] = [
      // 纯色预设
      {
        id: 'color-white',
        name: '纯白色',
        category: '纯色',
        thumbnail: '',
        background: { type: 'color', value: '#ffffff' },
        description: '经典白色背景，适合大多数设计',
        tags: ['白色', '纯色', '经典']
      },
      {
        id: 'color-black',
        name: '纯黑色',
        category: '纯色',
        thumbnail: '',
        background: { type: 'color', value: '#000000' },
        description: '深邃黑色背景，适合高端设计',
        tags: ['黑色', '纯色', '高端']
      },
      {
        id: 'color-blue',
        name: '天空蓝',
        category: '纯色',
        thumbnail: '',
        background: { type: 'color', value: '#87CEEB' },
        description: '清新天空蓝，适合清爽设计',
        tags: ['蓝色', '纯色', '清新']
      },
      {
        id: 'color-green',
        name: '自然绿',
        category: '纯色',
        thumbnail: '',
        background: { type: 'color', value: '#90EE90' },
        description: '自然绿色，适合环保主题',
        tags: ['绿色', '纯色', '自然']
      },
      {
        id: 'color-purple',
        name: '优雅紫',
        category: '纯色',
        thumbnail: '',
        background: { type: 'color', value: '#DDA0DD' },
        description: '优雅紫色，适合时尚设计',
        tags: ['紫色', '纯色', '优雅']
      },

      // 渐变预设
      {
        id: 'gradient-sunset',
        name: '日落渐变',
        category: '渐变',
        thumbnail: '',
        background: {
          type: 'gradient',
          gradientType: 'linear',
          angle: 45,
          stops: [
            { offset: 0, color: '#ff7e5f' },
            { offset: 1, color: '#feb47b' }
          ]
        },
        description: '温暖的日落色彩渐变',
        tags: ['渐变', '温暖', '日落']
      },
      {
        id: 'gradient-ocean',
        name: '海洋渐变',
        category: '渐变',
        thumbnail: '',
        background: {
          type: 'gradient',
          gradientType: 'linear',
          angle: 180,
          stops: [
            { offset: 0, color: '#2196F3' },
            { offset: 1, color: '#21CBF3' }
          ]
        },
        description: '清凉的海洋蓝色渐变',
        tags: ['渐变', '蓝色', '海洋']
      },
      {
        id: 'gradient-forest',
        name: '森林渐变',
        category: '渐变',
        thumbnail: '',
        background: {
          type: 'gradient',
          gradientType: 'linear',
          angle: 135,
          stops: [
            { offset: 0, color: '#134E5E' },
            { offset: 1, color: '#71B280' }
          ]
        },
        description: '深邃的森林绿色渐变',
        tags: ['渐变', '绿色', '森林']
      },
      {
        id: 'gradient-radial-center',
        name: '中心径向渐变',
        category: '渐变',
        thumbnail: '',
        background: {
          type: 'gradient',
          gradientType: 'radial',
          centerX: 0.5,
          centerY: 0.5,
          radius: 0.8,
          stops: [
            { offset: 0, color: '#ffffff' },
            { offset: 1, color: '#000000' }
          ]
        },
        description: '从中心向外的径向渐变',
        tags: ['渐变', '径向', '中心']
      },

      // 图片背景预设（占位符）
      {
        id: 'image-paper',
        name: '纸质纹理',
        category: '纹理',
        thumbnail: '',
        background: {
          type: 'image',
          url: '/assets/backgrounds/paper-texture.jpg',
          fit: 'repeat'
        },
        description: '经典纸质纹理背景',
        tags: ['纹理', '纸质', '经典']
      },
      {
        id: 'image-fabric',
        name: '布料纹理',
        category: '纹理',
        thumbnail: '',
        background: {
          type: 'image',
          url: '/assets/backgrounds/fabric-texture.jpg',
          fit: 'repeat'
        },
        description: '柔和的布料纹理背景',
        tags: ['纹理', '布料', '柔和']
      }
    ];

    defaultPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });
  }

  /**
   * 初始化预览画布
   */
  private initializePreviewCanvas(): void {
    this.previewCanvas = document.createElement('canvas');
    this.previewCanvas.width = 200;
    this.previewCanvas.height = 150;
    this.previewCtx = this.previewCanvas.getContext('2d');
  }

  /**
   * 设置纯色背景
   */
  setColorBackground(color: string): void {
    const background: IBackgroundColor = {
      type: 'color',
      value: color
    };

    this.currentBackground = background;
    this.emitter.emit('backgroundChange', background);
    this.updatePreview();
  }

  /**
   * 设置渐变背景
   */
  setGradientBackground(gradient: Omit<IBackgroundGradient, 'type'>): void {
    const background: IBackgroundGradient = {
      type: 'gradient',
      ...gradient
    };

    this.currentBackground = background;
    this.emitter.emit('backgroundChange', background);
    this.updatePreview();
  }

  /**
   * 设置图片背景
   */
  setImageBackground(imageUrl: string, options?: Partial<Omit<IBackgroundImage, 'type' | 'url'>>): void {
    const background: IBackgroundImage = {
      type: 'image',
      url: imageUrl,
      fit: options?.fit || 'cover',
      opacity: options?.opacity || 1,
      blur: options?.blur || 0,
      brightness: options?.brightness || 1,
      contrast: options?.contrast || 1,
      saturation: options?.saturation || 1
    };

    this.currentBackground = background;
    this.emitter.emit('backgroundChange', background);
    this.updatePreview();
  }

  /**
   * 上传图片作为背景
   */
  async uploadImageBackground(file: File): Promise<string> {
    try {
      // 创建文件URL
      const imageUrl = URL.createObjectURL(file);
      
      // 验证图片
      await this.validateImage(imageUrl);
      
      // 设置为背景
      this.setImageBackground(imageUrl);
      
      this.emitter.emit('imageUpload', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Failed to upload image background:', error);
      this.emitter.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 验证图片是否有效
   */
  private validateImage(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = imageUrl;
    });
  }

  /**
   * 应用背景预设
   */
  applyPreset(presetId: string): boolean {
    const preset = this.presets.get(presetId);
    if (!preset) {
      console.warn(`Background preset not found: ${presetId}`);
      return false;
    }

    this.currentBackground = preset.background;
    this.emitter.emit('backgroundChange', preset.background);
    this.emitter.emit('presetLoad', preset);
    this.updatePreview();
    return true;
  }

  /**
   * 创建自定义预设
   */
  createCustomPreset(name: string, category: string = '自定义', description: string = '', tags: string[] = []): IBackgroundPreset | null {
    if (!this.currentBackground) {
      console.warn('No current background to create preset from');
      return null;
    }

    const preset: IBackgroundPreset = {
      id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name,
      category,
      thumbnail: this.generatePreviewThumbnail(),
      background: JSON.parse(JSON.stringify(this.currentBackground)),
      description,
      tags
    };

    this.presets.set(preset.id, preset);
    return preset;
  }

  /**
   * 获取所有预设
   */
  getAllPresets(): IBackgroundPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * 按分类获取预设
   */
  getPresetsByCategory(category: string): IBackgroundPreset[] {
    return Array.from(this.presets.values()).filter(preset => preset.category === category);
  }

  /**
   * 搜索预设
   */
  searchPresets(query: string): IBackgroundPreset[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.presets.values()).filter(preset => 
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery) ||
      preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取预设分类列表
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.presets.forEach(preset => categories.add(preset.category));
    return Array.from(categories).sort();
  }

  /**
   * 更新预览
   */
  private updatePreview(): void {
    if (!this.previewCanvas || !this.previewCtx || !this.currentBackground) return;

    const { width, height } = this.previewCanvas;
    
    // 清空画布
    this.previewCtx.clearRect(0, 0, width, height);
    
    // 渲染背景
    this.renderBackgroundToCanvas(this.previewCtx, this.currentBackground, width, height);
    
    // 生成预览URL
    const previewUrl = this.previewCanvas.toDataURL('image/png', 0.8);
    this.emitter.emit('previewUpdate', previewUrl);
  }

  /**
   * 渲染背景到指定画布
   */
  renderBackgroundToCanvas(
    ctx: CanvasRenderingContext2D, 
    background: IBackgroundSettings, 
    width: number, 
    height: number
  ): void {
    switch (background.type) {
      case 'color':
        ctx.fillStyle = background.value;
        ctx.fillRect(0, 0, width, height);
        break;
      
      case 'gradient':
        this.renderGradientToCanvas(ctx, background, width, height);
        break;
      
      case 'image':
        this.renderImageToCanvas(ctx, background, width, height);
        break;
    }
  }

  /**
   * 渲染渐变到画布
   */
  private renderGradientToCanvas(
    ctx: CanvasRenderingContext2D, 
    gradient: IBackgroundGradient, 
    width: number, 
    height: number
  ): void {
    let canvasGradient: CanvasGradient;

    if (gradient.gradientType === 'linear') {
      const angle = (gradient.angle || 0) * Math.PI / 180;
      const x1 = width / 2 - Math.cos(angle) * width / 2;
      const y1 = height / 2 - Math.sin(angle) * height / 2;
      const x2 = width / 2 + Math.cos(angle) * width / 2;
      const y2 = height / 2 + Math.sin(angle) * height / 2;
      
      canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      const centerX = (gradient.centerX || 0.5) * width;
      const centerY = (gradient.centerY || 0.5) * height;
      const radius = (gradient.radius || 0.5) * Math.min(width, height);
      
      canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    }

    gradient.stops.forEach(stop => {
      const color = stop.opacity !== undefined 
        ? this.addOpacityToColor(stop.color, stop.opacity)
        : stop.color;
      canvasGradient.addColorStop(stop.offset, color);
    });

    ctx.fillStyle = canvasGradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * 渲染图片到画布
   */
  private renderImageToCanvas(
    ctx: CanvasRenderingContext2D, 
    imageBackground: IBackgroundImage, 
    width: number, 
    height: number
  ): void {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      
      // 应用透明度
      if (imageBackground.opacity && imageBackground.opacity < 1) {
        ctx.globalAlpha = imageBackground.opacity;
      }
      
      // 应用滤镜效果
      if (imageBackground.blur || imageBackground.brightness !== 1 || 
          imageBackground.contrast !== 1 || imageBackground.saturation !== 1) {
        const filters = [];
        if (imageBackground.blur) filters.push(`blur(${imageBackground.blur}px)`);
        if (imageBackground.brightness !== 1) filters.push(`brightness(${imageBackground.brightness})`);
        if (imageBackground.contrast !== 1) filters.push(`contrast(${imageBackground.contrast})`);
        if (imageBackground.saturation !== 1) filters.push(`saturate(${imageBackground.saturation})`);
        ctx.filter = filters.join(' ');
      }
      
      // 根据fit模式绘制图片
      switch (imageBackground.fit) {
        case 'cover':
          this.drawImageCover(ctx, img, 0, 0, width, height);
          break;
        case 'contain':
          this.drawImageContain(ctx, img, 0, 0, width, height);
          break;
        case 'fill':
          ctx.drawImage(img, 0, 0, width, height);
          break;
        case 'repeat':
          this.drawImageRepeat(ctx, img, width, height);
          break;
        case 'center':
          this.drawImageCenter(ctx, img, width, height);
          break;
      }
      
      ctx.restore();
      this.updatePreview();
    };
    
    img.onerror = () => {
      console.error('Failed to load background image:', imageBackground.url);
      // 回退到灰色背景
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
    };
    
    img.src = imageBackground.url;
  }

  /**
   * 以cover模式绘制图片
   */
  private drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number): void {
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
    
    ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
  }

  /**
   * 以contain模式绘制图片
   */
  private drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number): void {
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
    
    ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
  }

  /**
   * 以repeat模式绘制图片
   */
  private drawImageRepeat(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number): void {
    const pattern = ctx.createPattern(img, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * 以center模式绘制图片
   */
  private drawImageCenter(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number): void {
    const offsetX = (width - img.width) / 2;
    const offsetY = (height - img.height) / 2;
    ctx.drawImage(img, offsetX, offsetY);
  }

  /**
   * 为颜色添加透明度
   */
  private addOpacityToColor(color: string, opacity: number): string {
    // 简化实现，假设颜色是十六进制格式
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  }

  /**
   * 生成预览缩略图
   */
  private generatePreviewThumbnail(): string {
    if (!this.previewCanvas) return '';
    return this.previewCanvas.toDataURL('image/png', 0.5);
  }

  /**
   * 获取当前背景设置
   */
  getCurrentBackground(): IBackgroundSettings | null {
    return this.currentBackground ? JSON.parse(JSON.stringify(this.currentBackground)) : null;
  }

  /**
   * 获取预览画布数据URL
   */
  getPreviewDataUrl(): string {
    if (!this.previewCanvas) return '';
    return this.previewCanvas.toDataURL('image/png', 0.8);
  }

  /**
   * 事件管理
   */
  on<T extends keyof IBackgroundManagerEvents>(eventName: T, listener: IBackgroundManagerEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof IBackgroundManagerEvents>(eventName: T, listener: IBackgroundManagerEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.emitter.removeAllListeners();
    this.presets.clear();
    this.currentBackground = null;
    
    if (this.previewCanvas) {
      this.previewCanvas.remove();
      this.previewCanvas = null;
      this.previewCtx = null;
    }
  }
}