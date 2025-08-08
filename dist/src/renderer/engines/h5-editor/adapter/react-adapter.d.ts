import React from 'react';
import { H5Editor, type IH5Page, type IH5Component } from '../core/h5-editor';
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
export declare const H5EditorCanvas: React.ForwardRefExoticComponent<IH5EditorCanvasProps & React.RefAttributes<IH5EditorCanvasRef>>;
export declare const H5EditorReactAdapter: React.ForwardRefExoticComponent<IH5EditorCanvasProps & React.RefAttributes<IH5EditorCanvasRef>>;
//# sourceMappingURL=react-adapter.d.ts.map