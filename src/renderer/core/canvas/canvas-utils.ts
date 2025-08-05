// 画布工具函数
import type { ICanvasSize, ICanvasPosition, ICanvasBounds } from './canvas-types';

// 常见游戏素材尺寸预设
export const GAME_ASSET_PRESETS: Record<string, ICanvasSize> = {
  // 移动端游戏
  'mobile-portrait': { width: 750, height: 1334 },
  'mobile-landscape': { width: 1334, height: 750 },
  'mobile-square': { width: 1080, height: 1080 },
  
  // 桌面游戏
  'desktop-hd': { width: 1920, height: 1080 },
  'desktop-4k': { width: 3840, height: 2160 },
  
  // 游戏UI元素
  'ui-button': { width: 200, height: 60 },
  'ui-icon': { width: 64, height: 64 },
  'ui-banner': { width: 800, height: 200 },
  
  // 游戏角色
  'character-portrait': { width: 512, height: 512 },
  'character-full': { width: 512, height: 1024 },
  
  // 游戏场景
  'scene-background': { width: 1920, height: 1080 },
  'scene-tile': { width: 256, height: 256 }
};

// 坐标转换工具
export class CoordinateUtils {
  static screenToCanvas(
    screenPos: ICanvasPosition, 
    canvasPos: ICanvasPosition, 
    zoom: number
  ): ICanvasPosition {
    return {
      x: (screenPos.x - canvasPos.x) / zoom,
      y: (screenPos.y - canvasPos.y) / zoom
    };
  }

  static canvasToScreen(
    canvasPos: ICanvasPosition, 
    canvasOffset: ICanvasPosition, 
    zoom: number
  ): ICanvasPosition {
    return {
      x: canvasPos.x * zoom + canvasOffset.x,
      y: canvasPos.y * zoom + canvasOffset.y
    };
  }

  static getBounds(positions: ICanvasPosition[]): ICanvasBounds | null {
    if (positions.length === 0) return null;

    let minX = positions[0].x;
    let minY = positions[0].y;
    let maxX = positions[0].x;
    let maxY = positions[0].y;

    for (const pos of positions) {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}

// 缩放工具
export class ZoomUtils {
  static readonly MIN_ZOOM = 0.1;
  static readonly MAX_ZOOM = 10;
  static readonly ZOOM_STEP = 0.1;

  static clampZoom(zoom: number): number {
    return Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, zoom));
  }

  static getZoomToFit(
    contentSize: ICanvasSize, 
    containerSize: ICanvasSize, 
    padding: number = 50
  ): number {
    const availableWidth = containerSize.width - padding * 2;
    const availableHeight = containerSize.height - padding * 2;
    
    const scaleX = availableWidth / contentSize.width;
    const scaleY = availableHeight / contentSize.height;
    
    return this.clampZoom(Math.min(scaleX, scaleY));
  }

  static getZoomLevels(): number[] {
    return [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];
  }
}

// 颜色工具
export class ColorUtils {
  static hexToRgba(hex: string, alpha: number = 1): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  static rgbaToHex(rgba: string): string {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

// 性能工具
export class PerformanceUtils {
  private static performanceMarks: Map<string, number> = new Map();

  static startMark(name: string): void {
    this.performanceMarks.set(name, performance.now());
  }

  static endMark(name: string): number {
    const startTime = this.performanceMarks.get(name);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.performanceMarks.delete(name);
    return duration;
  }

  static measureFPS(callback: (fps: number) => void): () => void {
    let lastTime = performance.now();
    let frameCount = 0;
    let running = true;

    const measure = () => {
      if (!running) return;
      
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        callback(fps);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measure);
    };

    requestAnimationFrame(measure);

    return () => {
      running = false;
    };
  }
}