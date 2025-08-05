import React from 'react';
import { SuikaEditor } from '../core/editor';
export interface ISuikaCanvasProps {
    width: number;
    height: number;
    onReady?: (editor: SuikaEditor) => void;
    onSelectionChange?: () => void;
    className?: string;
    style?: React.CSSProperties;
}
export interface ISuikaCanvasRef {
    getEditor: () => SuikaEditor | null;
    render: () => void;
    destroy: () => void;
}
export declare const SuikaCanvas: React.ForwardRefExoticComponent<ISuikaCanvasProps & React.RefAttributes<ISuikaCanvasRef>>;
//# sourceMappingURL=react-adapter.d.ts.map