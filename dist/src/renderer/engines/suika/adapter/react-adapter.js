import { jsx as _jsx } from "react/jsx-runtime";
// Suika引擎的React适配器
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { SuikaEditor } from '../core/editor';
export const SuikaCanvas = forwardRef(({ width, height, onReady, onSelectionChange, className, style }, ref) => {
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
        }
    }));
    useEffect(() => {
        if (!containerRef.current)
            return;
        // 创建Suika编辑器实例
        const options = {
            containerElement: containerRef.current,
            width,
            height,
            showPerfMonitor: process.env['NODE_ENV'] === 'development'
        };
        const editor = new SuikaEditor(options);
        editorRef.current = editor;
        // 绑定事件
        if (onSelectionChange) {
            editor.on('selectionChange', onSelectionChange);
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
    }, [width, height, onReady, onSelectionChange]);
    // 当尺寸变化时更新视口
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.viewportManager.setViewport({
                x: -width / 2,
                y: -height / 2,
                width,
                height
            });
        }
    }, [width, height]);
    return (_jsx("div", { ref: containerRef, className: className, style: {
            width: `${width}px`,
            height: `${height}px`,
            position: 'relative',
            overflow: 'hidden',
            ...style
        } }));
});
SuikaCanvas.displayName = 'SuikaCanvas';
//# sourceMappingURL=react-adapter.js.map