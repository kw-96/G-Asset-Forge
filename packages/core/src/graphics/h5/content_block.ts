// H5 内容块
import { type Optional } from '../../type';
import {
  GAssetForgeGraphics,
  type GraphicsAttrs,
  type IGraphicsOpts,
} from '../graphics';

// H5 内容块基础属性
export interface H5ContentBlockAttrs extends GraphicsAttrs {
  blockType: 'text' | 'image' | 'button';
  order: number; // 在长图中的排序
  marginTop?: number;
  marginBottom?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  // H5 特有内容属性
  content?: string; // 文本内容
  src?: string; // 图片源
  alt?: string; // 图片替代文本
  text?: string; // 按钮文字
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  textColor?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  borderRadius?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  href?: string; // 链接地址
  target?: '_blank' | '_self';
}

// H5 文本块属性
export interface H5TextBlockAttrs extends H5ContentBlockAttrs {
  blockType: 'text';
  content: string;
}

// H5 图片块属性
export interface H5ImageBlockAttrs extends H5ContentBlockAttrs {
  blockType: 'image';
  src: string;
}

// H5 按钮块属性
export interface H5ButtonBlockAttrs extends H5ContentBlockAttrs {
  blockType: 'button';
  text: string;
}

// H5 内容块基类
export abstract class H5ContentBlock<
  ATTRS extends H5ContentBlockAttrs = H5ContentBlockAttrs,
> extends GAssetForgeGraphics<ATTRS> {
  constructor(attrs: ATTRS, opts: IGraphicsOpts) {
    super(attrs, opts);
  }

  // 获取内容块在长图中的实际位置
  getBlockPosition(): { x: number; y: number } {
    const parent = this.getParent();
    if (!parent)
      return { x: (this.attrs as any).x || 0, y: (this.attrs as any).y || 0 };

    // 计算基于父容器和排序的位置
    const siblings = parent.getChildren() as H5ContentBlock[];
    const sortedSiblings = siblings
      .filter((child) => child.attrs.order < this.attrs.order)
      .sort((a, b) => a.attrs.order - b.attrs.order);

    let yOffset = 0;
    for (const sibling of sortedSiblings) {
      yOffset +=
        (sibling.attrs.height || 0) + (sibling.attrs.marginBottom || 0);
    }

    return {
      x: (this.attrs as any).x || 0,
      y: yOffset + (this.attrs.marginTop || 0),
    };
  }

  // 获取内容块的完整样式
  getBlockStyle(): Record<string, any> {
    return {
      marginTop: this.attrs.marginTop || 0,
      marginBottom: this.attrs.marginBottom || 0,
      paddingTop: this.attrs.paddingTop || 0,
      paddingBottom: this.attrs.paddingBottom || 0,
      paddingLeft: this.attrs.paddingLeft || 0,
      paddingRight: this.attrs.paddingRight || 0,
    };
  }

  // 获取图层图标路径 - 与设计模式统一
  override getLayerIconPath(): string {
    // 基于icon.24.plugin.svg，缩放到12x12尺寸
    return 'M6 1.5A1.25 1.25 0 0 1 7.07 2.896c-.028.046-.045.079-.057.104H8.5a.5.5 0 0 1 .5.5v.94a.5.5 0 0 1-.667.472.625.625 0 1 0-.208 1.214c.07 0 .139-.013.208-.037a.5.5 0 0 1 .667.471V8a.5.5 0 0 1-.5.5H7.013c.012.025.029.058.057.104A1.25 1.25 0 1 1 4.987 8.896c.028-.046.045-.079.057-.104H3.5a.5.5 0 0 1-.5-.5v-.941l.004-.06a.5.5 0 0 1 .664-.411c.069.025.139.037.208.037l.064-.004a.625.625 0 0 0 .558-.558L4.5 6a.625.625 0 0 0-.561-.622l-.064-.004c-.071 0-.14.013-.208.037A.5.5 0 0 1 3 5.94V4a.5.5 0 0 1 .5-.5h1.487a.946.946 0 0 0-.057-.104A1.25 1.25 0 0 1 6 1.5Zm0 .5a.75.75 0 0 0-.642 1.137c.074.122.142.253.142.395V4H3.5v.94a1.125 1.125 0 1 1 .375 2.185c-.132 0-.258-.025-.375-.066V8h2v.47c0 .142-.069.273-.142.394a.75.75 0 1 0 1.284 0c-.074-.121-.142-.252-.142-.394V8h2v-.941a1.122 1.122 0 0 1-.375.066A1.125 1.125 0 1 1 8.5 4.94V4h-2v-.469c0-.142.069-.273.142-.395A.75.75 0 0 0 6 2Z';
  }
}

// H5 文本块实现
export class H5TextBlock extends H5ContentBlock<H5TextBlockAttrs> {
  override type = 'H5TextBlock' as any;

  constructor(attrs: Optional<H5TextBlockAttrs, 'type'>, opts: IGraphicsOpts) {
    super(
      {
        ...attrs,
        type: 'H5TextBlock' as any,
        blockType: 'text',
        content: attrs.content || '请输入文本内容',
        fontSize: attrs.fontSize || 16,
        textAlign: attrs.textAlign || 'left',
        textColor: attrs.textColor || '#333333',
      },
      opts,
    );
  }

  // 使用基类的plugin图标

  render(
    ctx: CanvasRenderingContext2D,
    _: { scaleX: number; scaleY: number },
  ): void {
    const { x, y } = this.getBlockPosition();
    const style = this.getBlockStyle();

    ctx.save();

    // 设置文本样式
    ctx.font = `${this.attrs.fontWeight || 'normal'} ${this.attrs.fontSize}px ${
      this.attrs.fontFamily || 'Arial, sans-serif'
    }`;
    ctx.fillStyle = this.attrs.textColor || '#333333';
    ctx.textAlign = this.attrs.textAlign || 'left';

    // 计算文本渲染位置
    const textX = x + style.paddingLeft;
    const textY = y + style.paddingTop + (this.attrs.fontSize || 16);

    // 处理多行文本
    const lines = this.wrapText(
      ctx,
      this.attrs.content || '',
      (this.attrs.width || 300) - style.paddingLeft - style.paddingRight,
    );

    const lineHeight = this.attrs.lineHeight || this.attrs.fontSize! * 1.2;

    lines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * lineHeight);
    });

    ctx.restore();
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
}

// H5 图片块实现
export class H5ImageBlock extends H5ContentBlock<H5ImageBlockAttrs> {
  override type = 'H5ImageBlock' as any;
  private image: HTMLImageElement | null = null;

  constructor(attrs: Optional<H5ImageBlockAttrs, 'type'>, opts: IGraphicsOpts) {
    super(
      {
        ...attrs,
        type: 'H5ImageBlock' as any,
        blockType: 'image',
        src: attrs.src || '',
        alt: attrs.alt || '图片',
        objectFit: attrs.objectFit || 'cover',
      },
      opts,
    );

    this.loadImage();
  }

  // 使用基类的plugin图标

  private async loadImage(): Promise<void> {
    if (!this.attrs.src) return;

    try {
      this.image = new Image();
      this.image.crossOrigin = 'anonymous';
      this.image.onload = () => {
        // 图片加载完成后重新渲染
        if ((this as any).editor) {
          (this as any).editor.render();
        }
      };
      this.image.src = this.attrs.src;
    } catch (error) {
      console.error('加载图片失败:', error);
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    _: { scaleX: number; scaleY: number },
  ): void {
    const { x, y } = this.getBlockPosition();
    const style = this.getBlockStyle();

    ctx.save();

    const contentX = x + style.paddingLeft;
    const contentY = y + style.paddingTop;
    const contentWidth =
      (this.attrs.width || 300) - style.paddingLeft - style.paddingRight;
    const contentHeight =
      (this.attrs.height || 200) - style.paddingTop - style.paddingBottom;

    if (this.image && this.image.complete) {
      // 绘制图片
      this.drawImageWithObjectFit(
        ctx,
        this.image,
        contentX,
        contentY,
        contentWidth,
        contentHeight,
      );
    } else {
      // 绘制占位符
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(contentX, contentY, contentWidth, contentHeight);

      ctx.strokeStyle = '#dee2e6';
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(contentX, contentY, contentWidth, contentHeight);

      // 绘制占位符图标和文字
      ctx.fillStyle = '#6c757d';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        '📷',
        contentX + contentWidth / 2,
        contentY + contentHeight / 2 - 10,
      );

      ctx.font = '14px Arial';
      ctx.fillText(
        this.attrs.alt || '图片加载中...',
        contentX + contentWidth / 2,
        contentY + contentHeight / 2 + 20,
      );
    }

    ctx.restore();
  }

  private drawImageWithObjectFit(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const imageAspect = image.width / image.height;
    const containerAspect = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let drawX = x;
    let drawY = y;

    switch (this.attrs.objectFit) {
      case 'cover':
        if (imageAspect > containerAspect) {
          drawWidth = height * imageAspect;
          drawX = x - (drawWidth - width) / 2;
        } else {
          drawHeight = width / imageAspect;
          drawY = y - (drawHeight - height) / 2;
        }
        break;
      case 'contain':
        if (imageAspect > containerAspect) {
          drawHeight = width / imageAspect;
          drawY = y + (height - drawHeight) / 2;
        } else {
          drawWidth = height * imageAspect;
          drawX = x + (width - drawWidth) / 2;
        }
        break;
      case 'fill':
        // 使用默认值，拉伸填充
        break;
      case 'scale-down':
        if (image.width <= width && image.height <= height) {
          drawWidth = image.width;
          drawHeight = image.height;
          drawX = x + (width - drawWidth) / 2;
          drawY = y + (height - drawHeight) / 2;
        } else {
          // 按 contain 模式处理
          if (imageAspect > containerAspect) {
            drawHeight = width / imageAspect;
            drawY = y + (height - drawHeight) / 2;
          } else {
            drawWidth = height * imageAspect;
            drawX = x + (width - drawWidth) / 2;
          }
        }
        break;
      case 'none':
        drawWidth = image.width;
        drawHeight = image.height;
        drawX = x + (width - drawWidth) / 2;
        drawY = y + (height - drawHeight) / 2;
        break;
    }

    // 应用边框圆角
    if (this.attrs.borderRadius && this.attrs.borderRadius > 0) {
      ctx.save();
      this.roundRect(ctx, x, y, width, height, this.attrs.borderRadius);
      ctx.clip();
    }

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    if (this.attrs.borderRadius && this.attrs.borderRadius > 0) {
      ctx.restore();
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // 更新图片源
  updateImageSrc(src: string): void {
    this.attrs.src = src;
    this.loadImage();
  }
}

// H5 按钮块实现
export class H5ButtonBlock extends H5ContentBlock<H5ButtonBlockAttrs> {
  override type = 'H5ButtonBlock' as any;

  constructor(
    attrs: Optional<H5ButtonBlockAttrs, 'type'>,
    opts: IGraphicsOpts,
  ) {
    super(
      {
        ...attrs,
        type: 'H5ButtonBlock' as any,
        blockType: 'button',
        text: attrs.text || '点击按钮',
        backgroundColor: attrs.backgroundColor || '#007AFF',
        textColor: attrs.textColor || '#FFFFFF',
        borderRadius: attrs.borderRadius || 8,
        fontSize: attrs.fontSize || 16,
      },
      opts,
    );
  }

  // 使用基类的plugin图标

  render(
    ctx: CanvasRenderingContext2D,
    _: { scaleX: number; scaleY: number },
  ): void {
    const { x, y } = this.getBlockPosition();
    const style = this.getBlockStyle();

    ctx.save();

    const buttonX = x + style.paddingLeft;
    const buttonY = y + style.paddingTop;
    const buttonWidth =
      (this.attrs.width || 300) - style.paddingLeft - style.paddingRight;
    const buttonHeight =
      (this.attrs.height || 44) - style.paddingTop - style.paddingBottom;

    // 绘制按钮背景
    ctx.fillStyle = this.attrs.backgroundColor || '#007AFF';
    this.roundRect(
      ctx,
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      this.attrs.borderRadius || 8,
    );
    ctx.fill();

    // 绘制边框（如果有）
    if (this.attrs.borderWidth && this.attrs.borderWidth > 0) {
      ctx.strokeStyle =
        this.attrs.borderColor || this.attrs.backgroundColor || '#007AFF';
      ctx.lineWidth = this.attrs.borderWidth;
      ctx.stroke();
    }

    // 绘制按钮文字
    ctx.fillStyle = this.attrs.textColor || '#FFFFFF';
    ctx.font = `${this.attrs.fontWeight || 'normal'} ${
      this.attrs.fontSize
    }px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(
      this.attrs.text || '',
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
    );

    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // 处理按钮点击事件
  handleClick(): void {
    if (this.attrs.href) {
      if (this.attrs.target === '_blank') {
        window.open(this.attrs.href, '_blank');
      } else {
        window.location.href = this.attrs.href;
      }
    }
  }
}
