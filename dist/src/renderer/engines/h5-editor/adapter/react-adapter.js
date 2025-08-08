import { jsx as _jsx } from "react/jsx-runtime";
// H5-Editor的React适配器
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { H5Editor } from '../core/h5-editor';
export const H5EditorCanvas = forwardRef(({ width, height, mode = 'mobile', onReady, onPageChange, onComponentAdd, onComponentUpdate, onComponentRemove, className, style }, ref) => {
    const containerRef = useRef(null);
    const editorRef = useRef(null);
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
        if (!containerRef.current)
            return;
        // 创建H5Editor实例
        const options = {
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
    return (_jsx("div", { ref: containerRef, className: className, style: {
            width: `${width}px`,
            height: `${height}px`,
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #ddd',
            ...style
        } }));
});
H5EditorCanvas.displayName = 'H5EditorCanvas';
// 别名导出，用于向后兼容
export const H5EditorReactAdapter = H5EditorCanvas;
//# sourceMappingURL=react-adapter.js.map