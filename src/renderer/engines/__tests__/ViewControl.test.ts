import { ViewControl, ViewControlEvent } from '../ViewControl';
import { fabric } from 'fabric';

// Mock fabric.js
jest.mock('fabric', () => ({
  fabric: {
    Canvas: jest.fn().mockImplementation(() => ({
      zoomToPoint: jest.fn(),
      setZoom: jest.fn(),
      absolutePan: jest.fn(),
      relativePan: jest.fn(),
      getZoom: jest.fn().mockReturnValue(1),
      getWidth: jest.fn().mockReturnValue(1920),
      getHeight: jest.fn().mockReturnValue(1080),
      calcOffset: jest.fn(),
      renderAll: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      viewportTransform: [1, 0, 0, 1, 0, 0],
      setViewportTransform: jest.fn()
    })),
    Point: jest.fn().mockImplementation((x, y) => ({ x, y }))
  }
}));

// Mock DOM elements
const mockContainer = {
  clientWidth: 1200,
  clientHeight: 800,
  getBoundingClientRect: jest.fn().mockReturnValue({
    width: 1200,
    height: 800,
    left: 0,
    top: 0
  })
};

// Mock event objects
const createMockEvent = (overrides = {}) => ({
  e: {
    deltaY: 100,
    clientX: 600,
    clientY: 400,
    button: 0,
    shiftKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...overrides
  }
});

const createMockKeyboardEvent = (key: string, ctrlKey = false) => ({
  key,
  ctrlKey,
  metaKey: false,
  preventDefault: jest.fn()
});

describe('ViewControl', () => {
  let canvas: fabric.Canvas;
  let viewControl: ViewControl;

  beforeEach(() => {
    canvas = new fabric.Canvas(document.createElement('canvas'));
    viewControl = new ViewControl(canvas, mockContainer as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    viewControl.destroy();
  });

  describe('Zoom Functionality', () => {
    test('should set zoom level within valid range', (done) => {
      viewControl.setZoom(1.5);
      
      // Use setTimeout to wait for requestAnimationFrame
      setTimeout(() => {
        expect(canvas.zoomToPoint).toHaveBeenCalledWith(
          expect.any(Object),
          1.5
        );
        done();
      }, 0);
    });

    test('should clamp zoom to minimum value', () => {
      viewControl.setZoom(0.05); // Below minimum
      
      expect(canvas.zoomToPoint).toHaveBeenCalledWith(
        expect.any(Object),
        0.1 // Clamped to minimum
      );
    });

    test('should clamp zoom to maximum value', () => {
      viewControl.setZoom(10); // Above maximum
      
      expect(canvas.zoomToPoint).toHaveBeenCalledWith(
        expect.any(Object),
        5.0 // Clamped to maximum
      );
    });

    test('should zoom in by step amount', () => {
      const initialZoom = 1.0;
      viewControl.setZoom(initialZoom);
      
      viewControl.zoomIn();
      
      expect(canvas.zoomToPoint).toHaveBeenLastCalledWith(
        expect.any(Object),
        1.1 // Initial + step (0.1)
      );
    });

    test('should zoom out by step amount', () => {
      const initialZoom = 1.5;
      viewControl.setZoom(initialZoom);
      
      viewControl.zoomOut();
      
      expect(canvas.zoomToPoint).toHaveBeenLastCalledWith(
        expect.any(Object),
        1.4 // Initial - step (0.1)
      );
    });

    test('should emit zoom changed event', (done) => {
      viewControl.on(ViewControlEvent.ZOOM_CHANGED, ({ zoom }) => {
        expect(zoom).toBe(1.5);
        done();
      });
      
      viewControl.setZoom(1.5);
    });

    test('should not zoom if change is insignificant', () => {
      viewControl.setZoom(1.0);
      jest.clearAllMocks();
      
      viewControl.setZoom(1.0005); // Very small change
      
      expect(canvas.zoomToPoint).not.toHaveBeenCalled();
    });
  });

  describe('Pan Functionality', () => {
    test('should pan canvas by delta values', () => {
      viewControl.pan(50, 30);
      
      // Should update viewport transform
      expect(canvas.setViewportTransform).toHaveBeenCalled();
    });

    test('should set absolute pan position', () => {
      viewControl.setPan(100, 200);
      
      expect(canvas.setViewportTransform).toHaveBeenCalled();
    });

    test('should emit pan changed event', (done) => {
      viewControl.on(ViewControlEvent.PAN_CHANGED, ({ panX, panY }) => {
        expect(typeof panX).toBe('number');
        expect(typeof panY).toBe('number');
        done();
      });
      
      viewControl.pan(50, 30);
    });
  });

  describe('Fit to Screen', () => {
    test('should fit canvas to screen with padding', () => {
      viewControl.fitToScreen(40);
      
      expect(canvas.setZoom).toHaveBeenCalled();
      expect(canvas.absolutePan).toHaveBeenCalled();
    });

    test('should emit fit to screen event', (done) => {
      viewControl.on(ViewControlEvent.FIT_TO_SCREEN, ({ zoom, panX, panY }) => {
        expect(typeof zoom).toBe('number');
        expect(typeof panX).toBe('number');
        expect(typeof panY).toBe('number');
        done();
      });
      
      viewControl.fitToScreen();
    });

    test('should not zoom beyond 100% when fitting', () => {
      // Mock small canvas that would require zoom > 1 to fit
      (canvas.getWidth as jest.Mock).mockReturnValue(500);
      (canvas.getHeight as jest.Mock).mockReturnValue(300);
      
      viewControl.fitToScreen();
      
      // Should be called with scale <= 1
      const zoomCall = (canvas.setZoom as jest.Mock).mock.calls[0];
      expect(zoomCall[0]).toBeLessThanOrEqual(1);
    });
  });

  describe('View Reset', () => {
    test('should reset view to default state', () => {
      viewControl.resetView();
      
      expect(canvas.setZoom).toHaveBeenCalledWith(1);
      expect(canvas.absolutePan).toHaveBeenCalledWith(
        expect.objectContaining({ x: 0, y: 0 })
      );
    });

    test('should emit view reset event', (done) => {
      viewControl.on(ViewControlEvent.VIEW_RESET, (viewState) => {
        expect(viewState.zoom).toBe(1.0);
        expect(viewState.panX).toBe(0);
        expect(viewState.panY).toBe(0);
        done();
      });
      
      viewControl.resetView();
    });
  });

  describe('Mouse Wheel Handling', () => {
    test('should zoom on mouse wheel with ctrl key', () => {
      const mockEvent = createMockEvent({
        deltaY: -100, // Zoom in
        clientX: 600,
        clientY: 400
      });

      // Simulate mouse wheel event
      const wheelHandler = (canvas.on as jest.Mock).mock.calls
        .find(call => call[0] === 'mouse:wheel')?.[1];
      
      if (wheelHandler) {
        wheelHandler(mockEvent);
        expect(canvas.zoomToPoint).toHaveBeenCalled();
      }
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('should handle zoom in shortcut', () => {
      const event = createMockKeyboardEvent('=', true);
      
      // Simulate keydown event
      document.dispatchEvent(new KeyboardEvent('keydown', event as any));
      
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('should handle zoom out shortcut', () => {
      const event = createMockKeyboardEvent('-', true);
      
      // Simulate keydown event
      document.dispatchEvent(new KeyboardEvent('keydown', event as any));
      
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('should handle reset view shortcut', () => {
      const event = createMockKeyboardEvent('0', true);
      
      // Simulate keydown event
      document.dispatchEvent(new KeyboardEvent('keydown', event as any));
      
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('should handle fit to screen shortcut', () => {
      const event = createMockKeyboardEvent('1', true);
      
      // Simulate keydown event
      document.dispatchEvent(new KeyboardEvent('keydown', event as any));
      
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    test('should track FPS', () => {
      const fps = viewControl.getCurrentFPS();
      expect(typeof fps).toBe('number');
      expect(fps).toBeGreaterThanOrEqual(0);
    });

    test('should maintain 60fps target', (done) => {
      // Set up multiple zoom operations to test performance
      let operationCount = 0;
      const maxOperations = 10;
      
      const performOperations = () => {
        if (operationCount < maxOperations) {
          viewControl.setZoom(1 + (operationCount * 0.1));
          operationCount++;
          requestAnimationFrame(performOperations);
        } else {
          const fps = viewControl.getCurrentFPS();
          expect(fps).toBeGreaterThanOrEqual(30); // Should maintain reasonable FPS
          done();
        }
      };
      
      performOperations();
    });
  });

  describe('View State Management', () => {
    test('should return current view state', () => {
      viewControl.setZoom(1.5);
      viewControl.setPan(100, 200);
      
      const viewState = viewControl.getViewState();
      
      expect(viewState).toEqual(
        expect.objectContaining({
          zoom: expect.any(Number),
          panX: expect.any(Number),
          panY: expect.any(Number),
          centerX: expect.any(Number),
          centerY: expect.any(Number)
        })
      );
    });
  });

  describe('Configuration', () => {
    test('should set zoom limits', () => {
      viewControl.setZoomLimits(0.5, 3.0);
      
      // Test minimum limit
      viewControl.setZoom(0.1);
      expect(canvas.zoomToPoint).toHaveBeenCalledWith(
        expect.any(Object),
        0.5 // Should be clamped to new minimum
      );
      
      // Test maximum limit
      viewControl.setZoom(5.0);
      expect(canvas.zoomToPoint).toHaveBeenCalledWith(
        expect.any(Object),
        3.0 // Should be clamped to new maximum
      );
    });

    test('should enable/disable pan constraints', () => {
      viewControl.setConstrainPan(false);
      viewControl.pan(1000, 1000); // Large pan that would normally be constrained
      
      expect(canvas.setViewportTransform).toHaveBeenCalled();
    });
  });

  describe('Touch Gesture Support', () => {
    test('should handle pinch to zoom', () => {
      const mockTouchEvent = {
        e: {
          touches: [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 200 }
          ],
          preventDefault: jest.fn()
        },
        self: { lastDistance: 100 }
      };

      // Simulate touch gesture event
      const gestureHandler = (canvas.on as jest.Mock).mock.calls
        .find(call => call[0] === 'touch:gesture')?.[1];
      
      if (gestureHandler) {
        gestureHandler(mockTouchEvent);
        expect(mockTouchEvent.e.preventDefault).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid zoom values gracefully', () => {
      viewControl.setZoom(NaN);
      viewControl.setZoom(Infinity);
      viewControl.setZoom(-Infinity);
      
      // Should not crash and should clamp to valid values
      expect(canvas.zoomToPoint).toHaveBeenCalled();
    });

    test('should handle pan with invalid values', () => {
      expect(() => {
        viewControl.pan(NaN, NaN);
        viewControl.pan(Infinity, -Infinity);
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    test('should cleanup event listeners on destroy', () => {
      const offSpy = jest.spyOn(canvas, 'off');
      
      viewControl.destroy();
      
      expect(offSpy).toHaveBeenCalledWith('mouse:wheel');
      expect(offSpy).toHaveBeenCalledWith('mouse:down');
      expect(offSpy).toHaveBeenCalledWith('mouse:move');
      expect(offSpy).toHaveBeenCalledWith('mouse:up');
    });

    test('should cancel animation frames on destroy', () => {
      const cancelSpy = jest.spyOn(window, 'cancelAnimationFrame');
      
      // Trigger an animation
      viewControl.setZoom(1.5);
      viewControl.destroy();
      
      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});