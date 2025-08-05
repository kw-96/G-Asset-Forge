export * from './suika';
export * from './h5-editor';
export declare enum EngineType {
    SUIKA = "suika",
    H5_EDITOR = "h5-editor"
}
export interface IEngineConfig {
    type: EngineType;
    width: number;
    height: number;
    containerElement: HTMLDivElement;
}
export declare class EngineFactory {
    static createEngine(config: IEngineConfig): Promise<import("./suika").SuikaEditor> | Promise<import("./h5-editor").H5Editor>;
}
//# sourceMappingURL=index.d.ts.map