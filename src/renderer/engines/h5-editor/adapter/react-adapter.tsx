// H5-Editor的React适配器
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { H5Editor, type IH5EditorOptions, type IH5Page, type IH5Component } from '../core/h5-editor';

export interface IH5EditorCanvasProps {
  width: number;
  height: number;
  mode?: 'mobile' | 'desktop';
  onReady?: (editor: H5Editor) => void;
  onPageChange?: (page: IH5Page) => void;
  onComponentAdd?: (component: IH5Component) => void;
  onComponentUpdate?: (component: IH5Component) => void;
  onComponentRemove?: (componentId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface IH5EditorCanvasRef {
  getEditor: () => H5Editor | null;
  render: () => void;
  destroy: () => void;
  exportAsImage: (format?: 'png' | 'jpg', quality?: number) => string;
}

export const H5EditorCanvas = forwardRef<IH5EditorCanvasRef, IH5EditorCanvasProps>(
  ({ 
    width, 
    height, 
    mode = 'mobile',
    onReady, 
    onPageChange,
    onComponentAdd,
    onComponentUpdate,
    onComponentRemove,
    className, 
    style 
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<H5Editor | null>(null);

    useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
      render: () => editorRef.current?.render(),
      destroy: () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      },
      exportAsImage: (format = 'png', quality = 1) => {
        return editorRef.current?.exportAsImage(format, quality) || '';
      }
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      // 创建H5Editor实例
      const options: IH5EditorOptions = {
        containerElement: containerRef.current,
        width,
        height,
        mode
      };

      const editor = new H5Editor(options);
      editorRef.current = editor;

      // 绑定事件
      if (onPageChange) {
        editor.on('pageChange', onPageChange);
      }
      if (onComponentAdd) {
        editor.on('componentAdd', onComponentAdd);
      }
      if (onComponentUpdate) {
        editor.on('componentUpdate', onComponentUpdate);
      }
      if (onComponentRemove) {
        editor.on('componentRemove', onComponentRemove);
      }

      // 通知父组件编辑器已准备就绪
      if (onReady) {
        onReady(editor);
      }

      // 清理函数
      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, [width, height, mode, onReady, onPageChange, onComponentAdd, onComponentUpdate, onComponentRemove]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #ddd',
          ...style
        }}
      />
    );
  }
);

H5EditorCanvas.displayName = 'H5EditorCanvas';