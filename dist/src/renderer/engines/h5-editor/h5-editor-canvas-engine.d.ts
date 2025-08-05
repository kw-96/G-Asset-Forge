import { H5Editor } from './core/h5-editor';
import type { ICanvasEngine } from '../../core/canvas/canvas-manager';
import type { ICanvasConfig, ICanvasState, ICanvasObject } from '../../core/canvas/canvas-types';
import { CanvasEngineType } from '../../core/canvas/canvas-manager';
export declare class H5EditorCanvasEngine implements ICanvasEngine {
    readonly type = CanvasEngineType.H5_EDITOR;
    private editor;
    initialize(container: HTMLElement, config: ICanvasConfig): Promise<void>;
    destroy(): void;
    getState(): ICanvasState;
    setState(state: Partial<ICanvasState>): void;
    addObject(object: ICanvasObject): void;
    removeObject(id: string): void;
    updateObject(id: string, updates: Partial<ICanvasObject>): void;
    selectObjects(ids: string[]): void;
    clearSelection(): void;
    zoom(level: number): void;
    pan(x: number, y: number): void;
    render(): void;
    exportImage(format: 'png' | 'jpg', quality?: number): string;
    getH5Editor(): H5Editor | null;
    setPageBackground(background: any): void;
    createPage(name: string): any;
    setCurrentPage(pageId: string): void;
}
//# sourceMappingURL=h5-editor-canvas-engine.d.ts.map