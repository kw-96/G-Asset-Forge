import React, { useEffect } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useAppStore } from '../../stores/appStore';
import CanvasComponent from './CanvasComponent';
import CanvasToolbar from './CanvasToolbar';

const CanvasArea: React.FC = () => {
  const { canvas } = useCanvasStore();
  const { setHasUnsavedChanges } = useAppStore();

  // Setup canvas event listeners for app state changes
  useEffect(() => {
    if (!canvas) return;

    const handleObjectChange = () => {
      setHasUnsavedChanges(true);
    };

    // Object modification events
    canvas.on('object:added', handleObjectChange);
    canvas.on('object:removed', handleObjectChange);
    canvas.on('object:modified', handleObjectChange);

    // Selection events for debugging
    canvas.on('selection:created', (e: any) => {
      console.log('Selection created:', e.selected);
    });

    canvas.on('selection:updated', (e: any) => {
      console.log('Selection updated:', e.selected);
    });

    canvas.on('selection:cleared', () => {
      console.log('Selection cleared');
    });

    // Path events for drawing
    canvas.on('path:created', (e: any) => {
      console.log('Path created:', e.path);
      setHasUnsavedChanges(true);
    });

    // Cleanup function
    return () => {
      canvas.off('object:added', handleObjectChange);
      canvas.off('object:removed', handleObjectChange);
      canvas.off('object:modified', handleObjectChange);
      canvas.off('selection:created');
      canvas.off('selection:updated');
      canvas.off('selection:cleared');
      canvas.off('path:created');
    };
  }, [canvas, setHasUnsavedChanges]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#f0f2f5',
        position: 'relative'
      }}
    >
      <CanvasToolbar />
      
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          padding: '20px'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '1200px',
            maxHeight: '800px',
            border: '1px solid #d9d9d9',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <CanvasComponent />
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;