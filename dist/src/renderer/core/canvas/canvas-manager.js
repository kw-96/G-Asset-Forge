// 画布管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
// import { EventEmitter } from '../../utils/EventEmitter';
// import { HistoryManager } from '../history/history-manager';
import { ToolManager } from '../tools/tool-manager';
import { SuikaCanvasEngine } from '../../engines/suika/suika-canvas-engine';
export var CanvasEngineType;
(function (CanvasEngineType) {
    CanvasEngineType["FABRIC"] = "fabric";
    CanvasEngineType["SUIKA"] = "suika";
    CanvasEngineType["H5_EDITOR"] = "h5-editor";
})(CanvasEngineType || (CanvasEngineType = {}));
export class CanvasManager extends TypedEventEmitter {
    // TODO: 实现历史管理功能
    // private historyManager: HistoryManager;
    // TODO: 实现事件发射器功能  
    // private eventEmitter = new EventEmitter();
    constructor() {
        super();
        this.engine = null;
        this.toolManager = new ToolManager();
        // TODO: 实现历史管理功能
        // this.historyManager = new HistoryManager();
    }
    async initialize(container, config) {
        // 创建画布引擎
        this.engine = new SuikaCanvasEngine();
        await this.engine.initialize(container, config);
        // 设置工具适配器
        if (this.engine instanceof SuikaCanvasEngine) {
            const toolAdapter = this.engine.getToolAdapter();
            if (toolAdapter) {
                this.toolManager.setSuikaToolAdapter(toolAdapter);
            }
        }
        // 设置事件监听
        this.setupEventListeners();
    }
    setupEventListeners() {
        if (this.engine && 'on' in this.engine) {
            this.engine.on('stateChanged', (state) => this.emit('stateChanged', state));
            this.engine.on('objectAdded', (object) => this.emit('objectAdded', object));
            this.engine.on('objectRemoved', (id) => this.emit('objectRemoved', id));
            this.engine.on('objectUpdated', (id, updates) => this.emit('objectUpdated', id, updates));
            this.engine.on('selectionChanged', (ids) => this.emit('selectionChanged', ids));
            this.engine.on('zoomChanged', (level) => this.emit('zoomChanged', level));
            this.engine.on('panChanged', (x, y) => this.emit('panChanged', x, y));
            this.engine.on('renderComplete', () => this.emit('renderComplete'));
        }
    }
    async switchEngine(engineType, container, config) {
        // 销毁当前引擎
        if (this.engine) {
            this.engine.destroy();
        }
        // 创建新引擎
        let engine;
        switch (engineType) {
            case CanvasEngineType.SUIKA:
                engine = new SuikaCanvasEngine();
                break;
            default:
                throw new Error(`Unsupported engine type: ${engineType}`);
        }
        await engine.initialize(container, config);
        this.engine = engine;
        this.emit('engineSwitched', { type: engineType });
    }
    getCurrentEngine() {
        return this.engine;
    }
    getEngineType() {
        return this.engine?.type || null;
    }
    // 代理方法到当前引擎
    getState() {
        return this.engine?.getState() || null;
    }
    setState(state) {
        this.engine?.setState(state);
    }
    addObject(object) {
        this.engine?.addObject(object);
    }
    removeObject(id) {
        this.engine?.removeObject(id);
    }
    updateObject(id, updates) {
        this.engine?.updateObject(id, updates);
    }
    selectObjects(ids) {
        this.engine?.selectObjects(ids);
    }
    clearSelection() {
        this.engine?.clearSelection();
    }
    zoom(level) {
        this.engine?.zoom(level);
    }
    pan(x, y) {
        this.engine?.pan(x, y);
    }
    render() {
        this.engine?.render();
    }
    exportImage(format = 'png', quality = 1) {
        return this.engine?.exportImage(format, quality) || null;
    }
    // 工具系统方法
    activateTool(type) {
        return this.toolManager.activateTool(type);
    }
    getActiveTool() {
        return this.toolManager.getActiveTool();
    }
    getActiveToolType() {
        return this.toolManager.getActiveToolType();
    }
    getAllToolConfigs() {
        return this.toolManager.getToolConfigs();
    }
    getToolConfig(type) {
        return this.toolManager.getToolConfigs().find((config) => config.type === type);
    }
    setToolProperties(properties) {
        this.toolManager.setProperties(properties);
    }
    getToolProperties() {
        return this.toolManager.getProperties();
    }
    // 事件处理方法
    handleMouseDown(event) {
        this.toolManager.handleMouseDown(event);
    }
    handleMouseMove(event) {
        this.toolManager.handleMouseMove(event);
    }
    handleMouseUp(event) {
        this.toolManager.handleMouseUp(event);
    }
    handleKeyDown(event) {
        this.toolManager.handleKeyDown(event);
    }
    handleKeyUp(event) {
        this.toolManager.handleKeyUp(event);
    }
    destroy() {
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }
        // 注意：ToolManager和HistoryManager没有destroy方法，需要检查
    }
}
//# sourceMappingURL=canvas-manager.js.map