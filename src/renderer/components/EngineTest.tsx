// 引擎测试组件
import React, { useRef } from 'react';
import { SuikaCanvas, type ISuikaCanvasRef } from '@suika/adapter/react-adapter';
import { H5EditorCanvas, type IH5EditorCanvasRef } from '@h5-editor/adapter/react-adapter';

export const EngineTest: React.FC = () => {
  const suikaRef = useRef<ISuikaCanvasRef>(null);
  const h5EditorRef = useRef<IH5EditorCanvasRef>(null);

  const handleSuikaReady = (editor: any) => {
    console.log('Suika编辑器已准备就绪:', editor);
  };

  const handleH5EditorReady = (editor: any) => {
    console.log('H5编辑器已准备就绪:', editor);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>引擎集成测试</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Suika引擎测试</h3>
        <SuikaCanvas
          ref={suikaRef}
          width={400}
          height={300}
          onReady={handleSuikaReady}
          style={{ border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>H5-Editor引擎测试</h3>
        <H5EditorCanvas
          ref={h5EditorRef}
          width={375}
          height={667}
          mode="mobile"
          onReady={handleH5EditorReady}
          style={{ border: '1px solid #ccc' }}
        />
      </div>

      <div>
        <button onClick={() => suikaRef.current?.render()}>
          重新渲染Suika
        </button>
        <button onClick={() => h5EditorRef.current?.render()} style={{ marginLeft: '10px' }}>
          重新渲染H5Editor
        </button>
        <button 
          onClick={() => {
            const dataUrl = h5EditorRef.current?.exportAsImage('png', 1);
            if (dataUrl) {
              const link = document.createElement('a');
              link.download = 'h5-export.png';
              link.href = dataUrl;
              link.click();
            }
          }} 
          style={{ marginLeft: '10px' }}
        >
          导出H5页面
        </button>
      </div>
    </div>
  );
};