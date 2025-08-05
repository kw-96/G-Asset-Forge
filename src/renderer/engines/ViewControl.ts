import { EventEmitter } from '../utils/EventEmitter';

// Define fabric Point type
interface FabricPoint {
  x: number;
  y: number;
}

// Mock fabric Point constructor
const MockPoint = (x: number, y: number): FabricPoint => ({ x, y });

// View control configuration
export interface ViewControlOptions {
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  panSensitivity: number;
  smoothPanning: boolean;
  constrainPan: boolean;
}

// View state interface
export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  centerX: number;
  centerY: number;
}

// View control events
export enum ViewControlEvent {
  ZOOM_CHANGED = 'zoom:changed',
  PAN_CHANGED = 'pan:changed',
  VIEW_RESET = 'view:reset',
  FIT_TO_SCREEN = 'fit:screen'
}

/**
 * View Control Manager for Canvas
 * Handles zoom, pan, and fit-to-screen functionality with performance optimization
 */
export class ViewControl extends EventEmitter {
  private canvas: any;
  private container: HTMLElement;
  private options: ViewControlOptions;
  private viewState: ViewState;
  private animationFrame: number | null = null;
  private isDragging = false;
  private lastPanPoint: any | null = null;

  // Performance tracking
  private frameCount = 0;
  private lastFpsTime = performance.now();
  private currentFps = 60;

  // Bound event handlers for proper cleanup
  private boundKeyDown: ((evt: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((evt: KeyboardEvent) => void) | null = null;

  constructor(canvas: any, container: HTMLElement, options?: Partial<ViewControlOptions>) {
    super();
    
    this.canvas = canvas;
    this.container = container;
    this.options = {
      minZoom: 0.1,
      maxZoom: 5.0,
      zoomStep: 0.1,
      panSensitivity: 1.0,
      smoothPanning: true,
      constrainPan: true,
      ...options
    };

    this.viewState = {
      zoom: 1.0,
      panX: 0,
      panY: 0,
      centerX: canvas.getWidth() / 2,
      centerY: canvas.getHeight() / 2
    };

    this.setupEventHandlers();
    this.startPerformanceMonitoring();
  }

  /**
   * Set zoom level with performance optimization
   */
  setZoom(zoom: number, center?: any): void {
    // Validate zoom input
    if (typeof zoom !== 'number' || isNaN(zoom) || !isFinite(zoom)) {
      console.warn('Invalid zoom value provided, ignoring:', zoom);
      return;
    }

    const clampedZoom = this.clampZoom(zoom);
    
    if (Math.abs(clampedZoom - this.viewState.zoom) < 0.001) {
      return; // No significant change
    }

    const zoomPoint = center || MockPoint(
      this.container.clientWidth / 2,
      this.container.clientHeight / 2
    );

    // Use requestAnimationFrame for smooth zoom
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      try {
        this.canvas.zoomToPoint(zoomPoint, clampedZoom);
        this.viewState.zoom = clampedZoom;
        
        // Update performance counter
        this.updateFrameCount();
        
        this.emit(ViewControlEvent.ZOOM_CHANGED, {
          zoom: clampedZoom,
          center: zoomPoint,
          fps: this.currentFps
        });
      } catch (error) {
        console.error('Failed to set zoom:', error);
      }
    });
  }

  /**
   * Zoom in by step amount
   */
  zoomIn(center?: any): void {
    this.setZoom(this.viewState.zoom + this.options.zoomStep, center);
  }

  /**
   * Zoom out by step amount
   */
  zoomOut(center?: any): void {
    this.setZoom(this.viewState.zoom - this.options.zoomStep, center);
  }

  /**
   * Pan canvas with smooth movement
   */
  pan(deltaX: number, deltaY: number): void {
    if (this.options.smoothPanning) {
      this.smoothPan(deltaX, deltaY);
    } else {
      this.directPan(deltaX, deltaY);
    }
  }

  /**
   * Set absolute pan position
   */
  setPan(x: number, y: number): void {
    const deltaX = x - this.viewState.panX;
    const deltaY = y - this.viewState.panY;
    this.pan(deltaX, deltaY);
  }

  /**
   * Fit canvas to screen with optimal zoom
   */
  fitToScreen(padding: number = 40): void {
    if (!this.container || !this.canvas) {
      console.warn('Container or canvas not available for fitToScreen');
      return;
    }

    const containerRect = this.container.getBoundingClientRect();
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    
    // Validate container dimensions
    if (containerRect.width <= 0 || containerRect.height <= 0) {
      console.warn('Invalid container dimensions for fitToScreen');
      return;
    }

    // Validate canvas dimensions
    if (canvasWidth <= 0 || canvasHeight <= 0) {
      console.warn('Invalid canvas dimensions for fitToScreen');
      return;
    }
    
    // Calculate available space
    const availableWidth = Math.max(containerRect.width - padding * 2, 100);
    const availableHeight = Math.max(containerRect.height - padding * 2, 100);
    
    // Calculate scale to fit
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    // Calculate center position
    const centerX = (containerRect.width - canvasWidth * scale) / 2;
    const centerY = (containerRect.height - canvasHeight * scale) / 2;
    
    try {
      // Apply zoom and pan
      this.canvas.setZoom(scale);
      this.canvas.absolutePan(MockPoint(centerX, centerY));
      
      // Update view state
      this.viewState.zoom = scale;
      this.viewState.panX = centerX;
      this.viewState.panY = centerY;
      
      this.emit(ViewControlEvent.FIT_TO_SCREEN, {
        zoom: scale,
        panX: centerX,
        panY: centerY
      });
    } catch (error) {
      console.error('Failed to fit canvas to screen:', error);
    }
  }

  /**
   * Reset view to default state
   */
  resetView(): void {
    this.canvas.setZoom(1);
    this.canvas.absolutePan(MockPoint(0, 0));
    
    this.viewState = {
      zoom: 1.0,
      panX: 0,
      panY: 0,
      centerX: this.canvas.getWidth() / 2,
      centerY: this.canvas.getHeight() / 2
    };
    
    this.emit(ViewControlEvent.VIEW_RESET, this.viewState);
  }

  /**
   * Get current view state
   */
  getViewState(): ViewState {
    return { ...this.viewState };
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.currentFps;
  }

  /**
   * Enable/disable pan constraints
   */
  setConstrainPan(constrain: boolean): void {
    this.options.constrainPan = constrain;
  }

  /**
   * Set zoom limits
   */
  setZoomLimits(minZoom: number, maxZoom: number): void {
    this.options.minZoom = Math.max(0.01, minZoom);
    this.options.maxZoom = Math.min(10, maxZoom);
    
    // Clamp current zoom if needed
    if (this.viewState.zoom < this.options.minZoom || this.viewState.zoom > this.options.maxZoom) {
      this.setZoom(this.clampZoom(this.viewState.zoom));
    }
  }

  /**
   * Destroy view control and cleanup
   */
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.removeEventHandlers();
    this.removeAllListeners();
  }

  /**
   * Setup event handlers for mouse/touch interactions
   */
  private setupEventHandlers(): void {
    // Mouse wheel zoom
    this.canvas.on('mouse:wheel', this.handleMouseWheel.bind(this));
    
    // Pan with middle mouse or space+drag
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
    
    // Keyboard shortcuts
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    document.addEventListener('keydown', this.boundKeyDown);
    document.addEventListener('keyup', this.boundKeyUp);
    
    // Touch events for mobile support
    this.canvas.on('touch:gesture', this.handleTouchGesture.bind(this));
  }

  /**
   * Remove event handlers
   */
  private removeEventHandlers(): void {
    this.canvas.off('mouse:wheel');
    this.canvas.off('mouse:down');
    this.canvas.off('mouse:move');
    this.canvas.off('mouse:up');
    this.canvas.off('touch:gesture');
    
    // Store bound functions to properly remove them
    if (this.boundKeyDown) {
      document.removeEventListener('keydown', this.boundKeyDown);
    }
    if (this.boundKeyUp) {
      document.removeEventListener('keyup', this.boundKeyUp);
    }
  }

  /**
   * Handle mouse wheel for zooming
   */
  private handleMouseWheel(opt: any): void {
    const delta = (opt.e as WheelEvent).deltaY;
    const zoom = this.canvas.getZoom();
    const zoomStep = this.options.zoomStep;
    
    let newZoom;
    if (delta > 0) {
      newZoom = zoom - zoomStep;
    } else {
      newZoom = zoom + zoomStep;
    }
    
    const pointer = this.canvas.getPointer(opt.e);
    this.setZoom(newZoom, MockPoint(pointer.x, pointer.y));
    
    opt.e.preventDefault();
    opt.e.stopPropagation();
  }

  /**
   * Handle mouse down for panning
   */
  private handleMouseDown(opt: any): void {
    const evt = opt.e as MouseEvent;
    
    // Middle mouse button or space+left click for panning
    if (evt.button === 1 || (evt.button === 0 && evt.shiftKey)) {
      this.isDragging = true;
      this.canvas.selection = false;
      this.lastPanPoint = MockPoint(evt.clientX, evt.clientY);
      evt.preventDefault();
    }
  }

  /**
   * Handle mouse move for panning
   */
  private handleMouseMove(opt: any): void {
    if (this.isDragging && this.lastPanPoint) {
      const evt = opt.e as MouseEvent;
      const currentPoint = MockPoint(evt.clientX, evt.clientY);
      
      const deltaX = (currentPoint.x - this.lastPanPoint.x) * this.options.panSensitivity;
      const deltaY = (currentPoint.y - this.lastPanPoint.y) * this.options.panSensitivity;
      
      this.pan(deltaX, deltaY);
      this.lastPanPoint = currentPoint;
    }
  }

  /**
   * Handle mouse up to stop panning
   */
  private handleMouseUp(): void {
    this.isDragging = false;
    this.canvas.selection = true;
    this.lastPanPoint = null;
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyDown(evt: KeyboardEvent): void {
    // Zoom shortcuts
    if (evt.ctrlKey || evt.metaKey) {
      switch (evt.key) {
        case '=':
        case '+':
          this.zoomIn();
          evt.preventDefault();
          break;
        case '-':
          this.zoomOut();
          evt.preventDefault();
          break;
        case '0':
          this.resetView();
          evt.preventDefault();
          break;
        case '1':
          this.fitToScreen();
          evt.preventDefault();
          break;
      }
    }
  }

  /**
   * Handle key up events
   */
  private handleKeyUp(): void {
    // Currently no key up handling needed
  }

  /**
   * Handle touch gestures for mobile
   */
  private handleTouchGesture(opt: any): void {
    if (opt.e.touches && opt.e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = opt.e.touches[0];
      const touch2 = opt.e.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Simple pinch zoom implementation
      if (opt.self.lastDistance) {
        const scale = distance / opt.self.lastDistance;
        const newZoom = this.viewState.zoom * scale;
        
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        this.setZoom(newZoom, MockPoint(centerX, centerY));
      }
      
      opt.self.lastDistance = distance;
      opt.e.preventDefault();
    }
  }

  /**
   * Smooth panning with animation
   */
  private smoothPan(deltaX: number, deltaY: number): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      const vpt = this.canvas.viewportTransform;
      if (vpt) {
        vpt[4] += deltaX;
        vpt[5] += deltaY;
        
        if (this.options.constrainPan) {
          this.constrainViewport(vpt);
        }
        
        this.canvas.setViewportTransform(vpt);
        this.updateViewState();
        this.updateFrameCount();
        
        this.emit(ViewControlEvent.PAN_CHANGED, {
          panX: this.viewState.panX,
          panY: this.viewState.panY,
          fps: this.currentFps
        });
      }
    });
  }

  /**
   * Direct panning without animation
   */
  private directPan(deltaX: number, deltaY: number): void {
    this.canvas.relativePan(MockPoint(deltaX, deltaY));
    this.updateViewState();
    
    this.emit(ViewControlEvent.PAN_CHANGED, {
      panX: this.viewState.panX,
      panY: this.viewState.panY,
      fps: this.currentFps
    });
  }

  /**
   * Constrain viewport to prevent panning too far
   */
  private constrainViewport(vpt: number[]): void {
    const zoom = this.canvas.getZoom();
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;
    
    // Calculate bounds
    const maxPanX = 0;
    const minPanX = containerWidth - canvasWidth * zoom;
    const maxPanY = 0;
    const minPanY = containerHeight - canvasHeight * zoom;
    
    // Constrain horizontal pan
    if (canvasWidth * zoom > containerWidth) {
      vpt[4] = Math.max(minPanX, Math.min(maxPanX, vpt[4] || 0));
    } else {
      vpt[4] = (containerWidth - canvasWidth * zoom) / 2;
    }
    
    // Constrain vertical pan
    if (canvasHeight * zoom > containerHeight) {
      vpt[5] = Math.max(minPanY, Math.min(maxPanY, vpt[5] || 0));
    } else {
      vpt[5] = (containerHeight - canvasHeight * zoom) / 2;
    }
  }

  /**
   * Update internal view state
   */
  private updateViewState(): void {
    const vpt = this.canvas.viewportTransform;
    if (vpt) {
      this.viewState.zoom = this.canvas.getZoom();
      this.viewState.panX = vpt[4];
      this.viewState.panY = vpt[5];
      this.viewState.centerX = -vpt[4] / this.viewState.zoom + this.container.clientWidth / 2 / this.viewState.zoom;
      this.viewState.centerY = -vpt[5] / this.viewState.zoom + this.container.clientHeight / 2 / this.viewState.zoom;
    }
  }

  /**
   * Clamp zoom to valid range
   */
  private clampZoom(zoom: number): number {
    return Math.max(this.options.minZoom, Math.min(this.options.maxZoom, zoom));
  }

  /**
   * Update frame count for FPS calculation
   */
  private updateFrameCount(): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = currentTime;
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    this.lastFpsTime = performance.now();
    this.frameCount = 0;
  }
}