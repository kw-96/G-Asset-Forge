// Suika画布引擎适配器
import { SuikaEditor } from './core/editor';
import { SuikaToolAdapter } from './adapter/tool-adapter';
import { CanvasEngineType } from '../../core/canvas/canvas-manager';
import { EventEmitter } from '../../utils/EventEmitter';
// 游戏素材尺寸预设
export const GAME_ASSET_PRESETS = {
    // 移动游戏常用尺寸
    MOBILE_PORTRAIT: { width: 1080, height: 1920, name: 'Mobile Portrait (1080x1920)' },
    MOBILE_LANDSCAPE: { width: 1920, height: 1080, name: 'Mobile Landscape (1920x1080)' },
    IPHONE_X: { width: 1125, height: 2436, name: 'iPhone X (1125x2436)' },
    IPHONE_14: { width: 1170, height: 2532, name: 'iPhone 14 (1170x2532)' },
    // 平板尺寸
    IPAD: { width: 1536, height: 2048, name: 'iPad (1536x2048)' },
    IPAD_PRO: { width: 2048, height: 2732, name: 'iPad Pro (2048x2732)' },
    // 常用UI元素尺寸
    ICON_SMALL: { width: 64, height: 64, name: 'Small Icon (64x64)' },
    ICON_MEDIUM: { width: 128, height: 128, name: 'Medium Icon (128x128)' },
    ICON_LARGE: { width: 256, height: 256, name: 'Large Icon (256x256)' },
    // 背景尺寸
    HD: { width: 1280, height: 720, name: 'HD (1280x720)' },
    FULL_HD: { width: 1920, height: 1080, name: 'Full HD (1920x1080)' },
    QUAD_HD: { width: 2560, height: 1440, name: '2K (2560x1440)' },
    // 方形格式
    SQUARE_512: { width: 512, height: 512, name: 'Square 512x512' },
    SQUARE_1024: { width: 1024, height: 1024, name: 'Square 1024x1024' },
    // 自定义宽高比
    ASPECT_16_9: { width: 1600, height: 900, name: '16:9 Aspect (1600x900)' },
    ASPECT_4_3: { width: 1024, height: 768, name: '4:3 Aspect (1024x768)' },
    ASPECT_3_2: { width: 1080, height: 720, name: '3:2 Aspect (1080x720)' }
};
export class SuikaCanvasEngine {
    constructor(options = {}) {
        this.type = CanvasEngineType.SUIKA;
        this.editor = null;
        this.container = null;
        this.eventEmitter = new EventEmitter();
        this.isInitialized = false;
        this.layers = new Map();
        this.activeLayerId = 'default';
        // 工具适配器
        this.toolAdapter = null;
        this.options = {
            showPerfMonitor: process.env['NODE_ENV'] === 'development',
            enableGrid: true,
            enableRuler: true,
            backgroundColor: '#ffffff',
            ...options
        };
        // 创建默认图层
        this.createDefaultLayer();
    }
    async initialize(container, config) {
        if (this.isInitialized) {
            throw new Error('SuikaCanvasEngine is already initialized');
        }
        this.container = container;
        try {
            // 清理容器
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            // 创建容器div
            const editorContainer = document.createElement('div');
            editorContainer.style.width = '100%';
            editorContainer.style.height = '100%';
            editorContainer.style.backgroundColor = this.options.backgroundColor || '#ffffff';
            editorContainer.setAttribute('data-editor-container', 'true');
            container.appendChild(editorContainer);
            this.editor = new SuikaEditor({
                containerElement: editorContainer,
                width: config.size.width,
                height: config.size.height,
                showPerfMonitor: this.options.showPerfMonitor ?? false,
                userPreference: this.options.userPreference ?? {}
            });
            // 初始化工具适配器
            this.toolAdapter = new SuikaToolAdapter(this.editor);
            // 监听编辑器事件
            this.setupEventListeners();
            this.isInitialized = true;
            this.eventEmitter.emit('canvas:created', { type: this.type });
        }
        catch (error) {
            console.error('Failed to initialize SuikaCanvasEngine:', error);
            throw error;
        }
    }
    destroy() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
        if (this.container) {
            // 更安全的DOM清理方式
            try {
                while (this.container.firstChild) {
                    this.container.removeChild(this.container.firstChild);
                }
            }
            catch (error) {
                console.warn('Error clearing container:', error);
                // 如果removeChild失败，尝试innerHTML
                try {
                    this.container.innerHTML = '';
                }
                catch (innerError) {
                    console.warn('Error clearing container with innerHTML:', innerError);
                }
            }
            this.container = null;
        }
        this.isInitialized = false;
        this.layers.clear();
        this.eventEmitter.emit('canvas:destroyed', { type: this.type });
    }
    getState() {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        const editorState = this.editor.getState();
        const zoom = editorState.zoom;
        const viewport = editorState.viewport;
        return {
            layers: Array.from(this.layers.values()),
            selectedObjects: editorState.selectedObjects.map((obj) => obj.id),
            activeLayer: this.activeLayerId,
            zoom,
            pan: { x: viewport.x, y: viewport.y }
        };
    }
    setState(state) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        const editorState = {};
        if (state.zoom !== undefined) {
            editorState.zoom = state.zoom;
        }
        if (state.pan !== undefined) {
            const currentViewport = this.editor.viewportManager.getViewport();
            editorState.viewport = {
                ...currentViewport,
                x: state.pan.x,
                y: state.pan.y
            };
        }
        if (state.activeLayer !== undefined) {
            this.activeLayerId = state.activeLayer;
        }
        this.editor.setState(editorState);
    }
    addObject(object) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        // 将统一对象格式转换为Suika对象
        const suikaObject = this.convertToSuikaObject(object);
        this.editor.sceneGraph.addObject(suikaObject);
        // 添加到当前活动图层
        const activeLayer = this.layers.get(this.activeLayerId);
        if (activeLayer) {
            activeLayer.objects.push(object);
        }
        this.editor.render();
        this.eventEmitter.emit('object:added', { object });
    }
    removeObject(id) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        this.editor.sceneGraph.removeObject(id);
        // 从所有图层中移除对象
        for (const layer of this.layers.values()) {
            layer.objects = layer.objects.filter(obj => obj.id !== id);
        }
        this.editor.render();
        this.eventEmitter.emit('object:removed', { id });
    }
    updateObject(id, updates) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        const object = this.editor.sceneGraph.getObject(id);
        if (object) {
            // 更新对象属性
            Object.assign(object, updates);
            this.editor.render();
            this.eventEmitter.emit('object:modified', { id, updates });
        }
    }
    selectObjects(ids) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        this.editor.toolManager.selectObjects(ids);
        this.editor.render();
        this.eventEmitter.emit('selection:created', { ids });
    }
    clearSelection() {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        this.editor.toolManager.clearSelection();
        this.editor.render();
        this.eventEmitter.emit('selection:cleared', {});
    }
    // 无限画布视图控制功能实现
    /**
     * 设置缩放级别 - 支持10%-500%缩放范围和60fps性能优化
     */
    zoom(level, centerPoint) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        // 扩展缩放范围到10%-500%
        const clampedLevel = Math.max(0.1, Math.min(5.0, level));
        if (centerPoint) {
            // 以指定点为中心进行缩放
            this.editor.zoomManager.zoomAt(centerPoint.x, centerPoint.y, clampedLevel / this.editor.zoomManager.getZoom());
        }
        else {
            this.editor.zoomManager.setZoom(clampedLevel);
        }
        this.editor.render();
        this.eventEmitter.emit('zoom:changed', {
            level: clampedLevel,
            centerPoint,
            performance: this.getPerformanceInfo()
        });
    }
    /**
     * 平移画布 - 支持无限制平移功能，支持平滑的增量移动
     */
    pan(deltaX, deltaY, smooth = true) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        if (smooth) {
            // 平滑平移
            this.editor.viewportManager.smoothPan(deltaX, deltaY);
        }
        else {
            // 直接平移
            this.editor.viewportManager.pan(deltaX, deltaY);
        }
        this.editor.render();
        this.eventEmitter.emit('pan:changed', {
            deltaX,
            deltaY,
            smooth,
            viewport: this.editor.viewportManager.getViewport()
        });
    }
    /**
     * 适应内容功能 - 自动调整到所有对象的最佳查看尺寸
     */
    fitToContent(padding = 50) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        try {
            this.editor.viewportManager.fitToContent();
            this.editor.render();
            this.eventEmitter.emit('fit:content', {
                padding,
                viewport: this.editor.viewportManager.getViewport()
            });
        }
        catch (error) {
            console.warn('Failed to fit to content:', error);
            // 回退到适应屏幕
            this.fitToScreen();
        }
    }
    /**
     * 适应屏幕功能
     */
    fitToScreen() {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        this.editor.viewportManager.fitToScreen();
        this.editor.render();
        this.eventEmitter.emit('fit:screen', {
            viewport: this.editor.viewportManager.getViewport()
        });
    }
    /**
     * 重置视图到默认状态
     */
    resetView() {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        this.editor.viewportManager.resetViewport();
        this.editor.zoomManager.resetZoom();
        this.editor.render();
        this.eventEmitter.emit('view:reset', {
            viewport: this.editor.viewportManager.getViewport(),
            zoom: this.editor.zoomManager.getZoom()
        });
    }
    /**
     * 获取当前视口信息
     */
    getViewportInfo() {
        if (!this.editor) {
            return { x: 0, y: 0, zoom: 1, width: 0, height: 0 };
        }
        const viewport = this.editor.viewportManager.getViewport();
        const zoom = this.editor.zoomManager.getZoom();
        return {
            x: viewport.x,
            y: viewport.y,
            zoom,
            width: viewport.width,
            height: viewport.height
        };
    }
    /**
     * 设置视口信息
     */
    setViewportInfo(viewportInfo) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        if (viewportInfo.zoom !== undefined) {
            this.zoom(viewportInfo.zoom);
        }
        if (viewportInfo.x !== undefined || viewportInfo.y !== undefined) {
            const currentViewport = this.editor.viewportManager.getViewport();
            this.editor.viewportManager.setViewport({
                x: viewportInfo.x ?? currentViewport.x,
                y: viewportInfo.y ?? currentViewport.y,
                width: currentViewport.width,
                height: currentViewport.height
            });
        }
        this.editor.render();
        this.eventEmitter.emit('viewport:changed', this.getViewportInfo());
    }
    /**
     * 智能网格系统
     */
    enableGrid(enabled, gridSize = 20) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        // 这里需要扩展Suika编辑器的网格功能
        // 暂时通过选项设置
        const options = this.editor.viewportManager.getOptions();
        // 假设有网格选项
        this.editor.viewportManager.setOptions({
            ...options,
            // gridEnabled: enabled,
            // gridSize: gridSize
        });
        this.editor.render();
        this.eventEmitter.emit('grid:changed', { enabled, gridSize });
    }
    /**
     * 参考线对齐功能
     */
    addGuide(type, position) {
        const guideId = `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // 这里需要实现参考线功能
        // 暂时存储在内部状态中
        this.eventEmitter.emit('guide:added', {
            id: guideId,
            type,
            position
        });
        return guideId;
    }
    /**
     * 移除参考线
     */
    removeGuide(guideId) {
        this.eventEmitter.emit('guide:removed', { id: guideId });
    }
    /**
     * 视口边界检测
     */
    isPointInViewport(worldX, worldY) {
        if (!this.editor) {
            return false;
        }
        const viewport = this.editor.viewportManager.getViewport();
        const zoom = this.editor.zoomManager.getZoom();
        // 转换世界坐标到屏幕坐标
        const screenX = worldX * zoom + viewport.x;
        const screenY = worldY * zoom + viewport.y;
        return screenX >= 0 &&
            screenX <= viewport.width &&
            screenY >= 0 &&
            screenY <= viewport.height;
    }
    /**
     * 内容定位功能
     */
    getVisibleObjects() {
        if (!this.editor) {
            return [];
        }
        // const viewport = this.editor.viewportManager.getViewport();
        const allObjects = this.editor.sceneGraph.getObjects();
        // 过滤出在视口内可见的对象
        return allObjects.filter((obj) => {
            if (!obj.x || !obj.y || !obj.width || !obj.height) {
                return false;
            }
            // 简单的边界框检测
            return this.isRectIntersectingViewport(obj.x, obj.y, obj.width, obj.height);
        });
    }
    /**
     * 检查矩形是否与视口相交
     */
    isRectIntersectingViewport(x, y, width, height) {
        if (!this.editor) {
            return false;
        }
        const viewport = this.editor.viewportManager.getViewport();
        const zoom = this.editor.zoomManager.getZoom();
        // 转换到屏幕坐标
        const screenLeft = x * zoom + viewport.x;
        const screenTop = y * zoom + viewport.y;
        const screenRight = screenLeft + width * zoom;
        const screenBottom = screenTop + height * zoom;
        // 检查是否与视口相交
        return !(screenRight < 0 ||
            screenLeft > viewport.width ||
            screenBottom < 0 ||
            screenTop > viewport.height);
    }
    /**
     * 坐标转换：屏幕坐标到世界坐标
     */
    screenToWorld(screenX, screenY) {
        if (!this.editor) {
            return { x: screenX, y: screenY };
        }
        const viewport = this.editor.viewportManager.getViewport();
        const zoom = this.editor.zoomManager.getZoom();
        return {
            x: (screenX - viewport.x) / zoom,
            y: (screenY - viewport.y) / zoom
        };
    }
    /**
     * 坐标转换：世界坐标到屏幕坐标
     */
    worldToScreen(worldX, worldY) {
        if (!this.editor) {
            return { x: worldX, y: worldY };
        }
        const viewport = this.editor.viewportManager.getViewport();
        const zoom = this.editor.zoomManager.getZoom();
        return {
            x: worldX * zoom + viewport.x,
            y: worldY * zoom + viewport.y
        };
    }
    render() {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        this.editor.render();
    }
    exportImage(format, quality = 1) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        const canvas = this.editor.canvasElement;
        return canvas.toDataURL(`image/${format}`, quality);
    }
    // 获取性能信息
    getPerformanceInfo() {
        if (!this.editor) {
            return { fps: 0, frameCount: 0 };
        }
        return this.editor.getPerformanceInfo();
    }
    // 获取画布尺寸
    getCanvasSize() {
        if (!this.editor) {
            return { width: 0, height: 0 };
        }
        return {
            width: this.editor.canvasElement.width,
            height: this.editor.canvasElement.height
        };
    }
    // 设置画布尺寸
    setCanvasSize(size) {
        if (!this.editor) {
            throw new Error('Suika editor not initialized');
        }
        this.editor.canvasElement.width = size.width;
        this.editor.canvasElement.height = size.height;
        this.editor.render();
        this.eventEmitter.emit('canvas:resized', { size });
    }
    // 创建图层
    createLayer(id, name) {
        const layer = {
            id,
            name,
            visible: true,
            locked: false,
            opacity: 1,
            objects: []
        };
        this.layers.set(id, layer);
        return layer;
    }
    // 获取图层
    getLayer(id) {
        return this.layers.get(id);
    }
    // 获取所有图层
    getLayers() {
        return Array.from(this.layers.values());
    }
    // 设置活动图层
    setActiveLayer(id) {
        if (this.layers.has(id)) {
            this.activeLayerId = id;
        }
    }
    // 获取活动图层
    getActiveLayer() {
        return this.layers.get(this.activeLayerId);
    }
    // 事件监听
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
    // 设置事件监听器
    setupEventListeners() {
        if (!this.editor)
            return;
        this.editor.on('render', () => {
            this.eventEmitter.emit('canvas:rendered', {});
        });
        this.editor.on('selectionChange', () => {
            const selectedObjects = this.editor.toolManager.getSelectedObjects();
            this.eventEmitter.emit('selection:changed', { selectedObjects });
        });
    }
    // 创建默认图层
    createDefaultLayer() {
        this.createLayer('default', 'Default Layer');
    }
    // 转换对象格式
    convertToSuikaObject(object) {
        // 根据对象类型创建相应的Suika对象
        switch (object.type) {
            case 'rectangle':
                return {
                    id: object.id,
                    type: 'rect',
                    x: object.position.x,
                    y: object.position.y,
                    width: object.size.width,
                    height: object.size.height,
                    fill: '#cccccc',
                    stroke: '#666666',
                    strokeWidth: 1,
                    rotation: object.rotation,
                    opacity: object.opacity,
                    visible: object.visible,
                    locked: object.locked
                };
            case 'circle':
                return {
                    id: object.id,
                    type: 'circle',
                    x: object.position.x,
                    y: object.position.y,
                    radius: Math.min(object.size.width, object.size.height) / 2,
                    fill: '#cccccc',
                    stroke: '#666666',
                    strokeWidth: 1,
                    rotation: object.rotation,
                    opacity: object.opacity,
                    visible: object.visible,
                    locked: object.locked
                };
            case 'text':
                return {
                    id: object.id,
                    type: 'text',
                    x: object.position.x,
                    y: object.position.y,
                    text: 'Text',
                    fontSize: 16,
                    fontFamily: 'Arial',
                    fill: '#333333',
                    rotation: object.rotation,
                    opacity: object.opacity,
                    visible: object.visible,
                    locked: object.locked
                };
            case 'image':
                return {
                    id: object.id,
                    type: 'image',
                    x: object.position.x,
                    y: object.position.y,
                    width: object.size.width,
                    height: object.size.height,
                    src: '',
                    rotation: object.rotation,
                    opacity: object.opacity,
                    visible: object.visible,
                    locked: object.locked
                };
            default:
                throw new Error(`Unsupported object type: ${object.type}`);
        }
    }
    // Suika特有的方法
    getSuikaEditor() {
        return this.editor;
    }
    // 获取预设尺寸
    static getPresetSizes() {
        return GAME_ASSET_PRESETS;
    }
    // 工具系统集成方法
    getToolAdapter() {
        return this.toolAdapter;
    }
    activateTool(type) {
        return this.toolAdapter?.activateTool(type) || false;
    }
    getActiveTool() {
        return this.toolAdapter?.getActiveTool() || null;
    }
    getActiveToolType() {
        return this.toolAdapter?.getActiveToolType() || null;
    }
    getAllToolConfigs() {
        return this.toolAdapter?.getAllToolConfigs() || [];
    }
    getToolConfig(type) {
        return this.toolAdapter?.getToolConfig(type);
    }
    setToolProperties(properties) {
        this.toolAdapter?.setToolProperties(properties);
    }
    getToolProperties() {
        return this.toolAdapter?.getToolProperties() || {};
    }
    // 事件处理方法
    handleMouseDown(event) {
        this.toolAdapter?.handleMouseDown(event);
    }
    handleMouseMove(event) {
        this.toolAdapter?.handleMouseMove(event);
    }
    handleMouseUp(event) {
        this.toolAdapter?.handleMouseUp(event);
    }
    handleKeyDown(event) {
        this.toolAdapter?.handleKeyDown(event);
    }
    handleKeyUp(event) {
        this.toolAdapter?.handleKeyUp(event);
    }
}
//# sourceMappingURL=suika-canvas-engine.js.map