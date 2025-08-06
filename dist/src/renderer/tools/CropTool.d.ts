import { CanvasElement } from '../types/canvas';
export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface CropSettings {
    aspectRatio?: number;
    maintainAspectRatio: boolean;
    minWidth: number;
    minHeight: number;
}
export declare class CropTool {
    private targetElement;
    private cropArea;
    private isActive;
    private settings;
    constructor(initialSettings?: Partial<CropSettings>);
    startCrop(element: CanvasElement): void;
    updateCropArea(area: Partial<CropArea>): void;
    setAspectRatio(ratio: number | null): void;
    applyCrop(): CanvasElement | null;
    cancelCrop(): void;
    getCropArea(): CropArea | null;
    getTargetElement(): CanvasElement | null;
    updateSettings(newSettings: Partial<CropSettings>): void;
    getSettings(): CropSettings;
    get active(): boolean;
    getCropHandles(): Array<{
        x: number;
        y: number;
        type: string;
    }>;
    static readonly ASPECT_RATIOS: {
        FREE: null;
        SQUARE: number;
        LANDSCAPE_16_9: number;
        LANDSCAPE_4_3: number;
        LANDSCAPE_3_2: number;
        PORTRAIT_9_16: number;
        PORTRAIT_3_4: number;
        PORTRAIT_2_3: number;
    };
}
export default CropTool;
//# sourceMappingURL=CropTool.d.ts.map