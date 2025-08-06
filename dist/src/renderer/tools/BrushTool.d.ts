import { CanvasElement } from '../types/canvas';
export interface BrushSettings {
    size: number;
    opacity: number;
    color: string;
    hardness: number;
}
export interface BrushStroke {
    id: string;
    points: Array<{
        x: number;
        y: number;
        pressure?: number;
    }>;
    settings: BrushSettings;
    timestamp: number;
}
export declare class BrushTool {
    private currentStroke;
    private isDrawing;
    private settings;
    constructor(initialSettings?: Partial<BrushSettings>);
    startDrawing(x: number, y: number, pressure?: number): void;
    continueDrawing(x: number, y: number, pressure?: number): void;
    finishDrawing(): BrushStroke | null;
    cancelDrawing(): void;
    getCurrentStroke(): BrushStroke | null;
    updateSettings(newSettings: Partial<BrushSettings>): void;
    getSettings(): BrushSettings;
    strokeToCanvasElement(stroke: BrushStroke): CanvasElement;
    generateSVGPath(stroke: BrushStroke): string;
    get drawing(): boolean;
}
export default BrushTool;
//# sourceMappingURL=BrushTool.d.ts.map