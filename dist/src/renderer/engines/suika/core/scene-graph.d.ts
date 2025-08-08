import { SuikaEditor } from './editor';
export interface ISuikaObject {
    id: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    src?: string;
    visible?: boolean;
    locked?: boolean;
    name?: string;
}
export declare class SceneGraph {
    private objects;
    private renderOrder;
    private spatialIndex;
    private editor;
    constructor(editor: SuikaEditor);
    addObject(object: ISuikaObject): void;
    removeObject(id: string): void;
    getObject(id: string): ISuikaObject | undefined;
    getObjects(): ISuikaObject[];
    updateObject(id: string, updates: Partial<ISuikaObject>): void;
    render(ctx: CanvasRenderingContext2D): void;
    private renderObject;
    private renderRect;
    private renderCircle;
    private renderText;
    private renderImage;
    getObjectBounds(id: string): {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    getAllBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    findObjectAtPoint(x: number, y: number): ISuikaObject | null;
    private pointInBounds;
    clear(): void;
    private calculateObjectBounds;
    getVisibleObjects(viewportBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): ISuikaObject[];
    getSpatialIndexStats(): {
        totalObjects: number;
        indexedObjects: number;
    };
    getStats(): {
        objectCount: number;
        visibleCount: number;
        lockedCount: number;
    };
}
//# sourceMappingURL=scene-graph.d.ts.map