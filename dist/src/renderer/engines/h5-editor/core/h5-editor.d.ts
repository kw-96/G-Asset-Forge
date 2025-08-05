export interface IH5EditorOptions {
    containerElement: HTMLDivElement;
    width: number;
    height: number;
    mode?: 'mobile' | 'desktop';
}
export interface IH5Page {
    id: string;
    name: string;
    width: number;
    height: number;
    background: {
        type: 'color' | 'gradient' | 'image';
        value: string;
    };
    components: IH5Component[];
}
export interface IH5Component {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    props: Record<string, any>;
}
export interface IH5EditorEvents extends Record<string, (...args: any[]) => void> {
    pageChange(page: IH5Page): void;
    componentAdd(component: IH5Component): void;
    componentUpdate(component: IH5Component): void;
    componentRemove(componentId: string): void;
}
export declare class H5Editor {
    private containerElement;
    private canvasElement;
    private ctx;
    private emitter;
    private currentPage;
    private pages;
    private options;
    constructor(options: IH5EditorOptions);
    private setupCanvas;
    private createDefaultPage;
    createPage(name: string): IH5Page;
    setCurrentPage(pageId: string): void;
    getCurrentPage(): IH5Page | null;
    getAllPages(): IH5Page[];
    addComponent(component: IH5Component): void;
    updateComponent(componentId: string, updates: Partial<IH5Component>): void;
    removeComponent(componentId: string): void;
    setPageBackground(background: IH5Page['background']): void;
    render(): void;
    private renderBackground;
    private renderComponent;
    private renderTextComponent;
    private renderImageComponent;
    private renderButtonComponent;
    exportAsImage(format?: 'png' | 'jpg', quality?: number): string;
    exportPageData(): IH5Page | null;
    on<T extends keyof IH5EditorEvents>(eventName: T, listener: IH5EditorEvents[T]): void;
    off<T extends keyof IH5EditorEvents>(eventName: T, listener: IH5EditorEvents[T]): void;
    destroy(): void;
}
//# sourceMappingURL=h5-editor.d.ts.map