/**
 * 视图控制器
 */
export interface ViewControlOptions {
  zoom: number;
  pan: { x: number; y: number };
}

export class ViewControl {
  private zoom: number = 1;
  private pan: { x: number; y: number } = { x: 0, y: 0 };

  constructor(options?: Partial<ViewControlOptions>) {
    if (options) {
      this.zoom = options.zoom || 1;
      this.pan = options.pan || { x: 0, y: 0 };
    }
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(0.1, Math.min(5, zoom));
  }

  getZoom(): number {
    return this.zoom;
  }

  setPan(x: number, y: number): void {
    this.pan = { x, y };
  }

  getPan(): { x: number; y: number } {
    return { ...this.pan };
  }
}
