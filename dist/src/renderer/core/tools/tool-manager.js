// 工具管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
export class ToolManager extends TypedEventEmitter {
    constructor() {
        super();
        this.tools = new Map();
        this.activeTool = null;
        this.properties = {};
        // Suika工具适配器
        this.suikaToolAdapter = null;
    }
    /**
     * 设置Suika工具适配器
     */
    setSuikaToolAdapter(adapter) {
        this.suikaToolAdapter = adapter;
    }
    registerTool(tool) {
        this.tools.set(tool.type, tool);
    }
    unregisterTool(type) {
        const tool = this.tools.get(type);
        if (tool && tool === this.activeTool) {
            this.deactivateTool();
        }
        this.tools.delete(type);
    }
    activateTool(type) {
        // 优先使用Suika工具适配器
        if (this.suikaToolAdapter) {
            const success = this.suikaToolAdapter.activateTool(type);
            if (success) {
                this.activeTool = this.suikaToolAdapter.getActiveTool();
                this.emit('toolChanged', this.activeTool);
                return true;
            }
        }
        // 回退到本地工具
        const tool = this.tools.get(type);
        if (!tool) {
            console.warn(`Tool ${type} not found`);
            return false;
        }
        // 停用当前工具
        if (this.activeTool) {
            this.activeTool.deactivate();
        }
        // 激活新工具
        this.activeTool = tool;
        tool.activate();
        this.emit('toolChanged', tool);
        return true;
    }
    deactivateTool() {
        if (this.activeTool) {
            this.activeTool.deactivate();
            this.activeTool = null;
        }
    }
    getActiveTool() {
        return this.activeTool;
    }
    getActiveToolType() {
        return this.activeTool?.type || null;
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    getToolConfigs() {
        // 优先从Suika适配器获取配置
        if (this.suikaToolAdapter) {
            return this.suikaToolAdapter.getAllToolConfigs();
        }
        return Array.from(this.tools.values()).map(tool => tool.config);
    }
    // 工具属性管理
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        // 同步到Suika适配器
        if (this.suikaToolAdapter) {
            this.suikaToolAdapter.setToolProperties(properties);
        }
        this.emit('propertiesChanged', this.properties);
    }
    getProperties() {
        // 优先从Suika适配器获取属性
        if (this.suikaToolAdapter) {
            return this.suikaToolAdapter.getToolProperties();
        }
        return { ...this.properties };
    }
    getProperty(key) {
        const properties = this.getProperties();
        return properties[key];
    }
    setProperty(key, value) {
        this.properties[key] = value;
        // 同步到Suika适配器
        if (this.suikaToolAdapter) {
            this.suikaToolAdapter.setToolProperties({ [key]: value });
        }
        this.emit('propertiesChanged', this.properties);
    }
    // 事件代理到活动工具
    handleMouseDown(event) {
        // 优先使用Suika适配器
        if (this.suikaToolAdapter) {
            this.suikaToolAdapter.handleMouseDown(event);
            return;
        }
        this.activeTool?.onMouseDown(event);
    }
    handleMouseMove(event) {
        // 优先使用Suika适配器
        if (this.suikaToolAdapter) {
            this.suikaToolAdapter.handleMouseMove(event);
            return;
        }
        this.activeTool?.onMouseMove(event);
    }
    handleMouseUp(event) {
        // 优先使用Suika适配器
        if (this.suikaToolAdapter) {
            this.suikaToolAdapter.handleMouseUp(event);
            return;
        }
        this.activeTool?.onMouseUp(event);
    }
    handleKeyDown(event) {
        // 优先使用Suika适配器
        if (this.suikaToolAdapter) {
            this.suikaToolAdapter.handleKeyDown(event);
            return;
        }
        this.activeTool?.onKeyDown(event);
    }
    handleKeyUp(event) {
        // 优先使用Suika适配器
        if (this.suikaToolAdapter) {
            this.suikaToolAdapter.handleKeyUp(event);
            return;
        }
        this.activeTool?.onKeyUp(event);
    }
    render(ctx) {
        this.activeTool?.render?.(ctx);
    }
}
//# sourceMappingURL=tool-manager.js.map