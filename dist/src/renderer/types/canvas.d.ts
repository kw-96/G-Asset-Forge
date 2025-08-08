export interface CanvasElement {
    id: string;
    name: string;
    type: 'rectangle' | 'ellipse' | 'text' | 'image' | 'frame' | 'brush' | 'crop' | 'group';
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    locked: boolean;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeStyle?: 'solid' | 'dashed' | 'dotted';
    borderRadius?: number;
    opacity?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    textAlign?: 'left' | 'center' | 'right';
    imageData?: {
        src: string;
        originalWidth: number;
        originalHeight: number;
        cropArea?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
    brushData?: {
        points: Array<{
            x: number;
            y: number;
            pressure?: number;
        }>;
        settings: {
            size: number;
            opacity: number;
            color: string;
            hardness: number;
        };
    };
}
export type ToolType = 'select' | 'hand' | 'rectangle' | 'ellipse' | 'triangle' | 'star' | 'text' | 'image' | 'frame' | 'brush' | 'crop';
export interface CanvasState {
    elements: Record<string, CanvasElement>;
    selectedElements: string[];
    activeTool: ToolType;
    zoom: number;
    panX: number;
    panY: number;
    showGrid: boolean;
    showRuler: boolean;
    snapToGrid: boolean;
}
export interface HistoryItem {
    id: string;
    timestamp: number;
    action: string;
    data: any;
    elements: Record<string, CanvasElement>;
}
export interface ExportOptions {
    format: 'png' | 'jpg' | 'svg';
    quality: number;
    scale: number;
    transparent: boolean;
    selectedOnly: boolean;
}
export interface CanvasConfig {
    width: number;
    height: number;
    backgroundColor: string;
    gridSize: number;
    snapThreshold: number;
}
//# sourceMappingURL=canvas.d.ts.map