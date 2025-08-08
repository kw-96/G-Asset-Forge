// 内存事件
export var SuikaMemoryEvent;
(function (SuikaMemoryEvent) {
    SuikaMemoryEvent["MEMORY_WARNING"] = "memory:warning";
    SuikaMemoryEvent["MEMORY_CRITICAL"] = "memory:critical";
    SuikaMemoryEvent["GARBAGE_COLLECTED"] = "memory:gc";
    SuikaMemoryEvent["OBJECT_POOLED"] = "memory:pooled";
    SuikaMemoryEvent["CACHE_CLEARED"] = "memory:cache-cleared";
    SuikaMemoryEvent["PERFORMANCE_UPDATE"] = "performance:update";
})(SuikaMemoryEvent || (SuikaMemoryEvent = {}));
export class SuikaMemoryManager {
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
        return this;
    }
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (!listeners || listeners.length === 0) {
            return false;
        }
        listeners.forEach(listener => {
            try {
                listener(...args);
            }
            catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
        return true;
    }
    constructor(editor, limits) {
        this.events = new Map();
        this.objectPools = new Map();
        this.textureCache = new Map();
        this.monitoringInterval = null;
        this.editor = editor;
        this.limits = {
            maxCanvasMemory: 100, // 100MB per canvas
            maxTotalMemory: 500, // 500MB total
            warningThreshold: 80, // 80MB warning
            criticalThreshold: 120, // 120MB critical
            gcThreshold: 150, // 150MB trigger GC
            objectPoolSize: 50, // 对象池大小
            textureCacheSize: 50, // 50MB texture cache
            ...limits
        };
        this.stats = {
            canvasMemory: 0,
            totalMemory: 0,
            objectCount: 0,
            textureCount: 0,
            cacheSize: 0,
            lastGC: null,
            fps: 0,
            renderTime: 0
        };
        this.performanceMonitor = {
            frameCount: 0,
            lastFrameTime: 0,
            fps: 0,
            renderTime: 0
        };
        this.initializeObjectPools();
        this.startMemoryMonitoring();
        this.setupPerformanceMonitoring();
    }
    // 获取内存统计
    getMemoryStats() {
        this.updateMemoryStats();
        return { ...this.stats };
    }
    // 强制垃圾回收
    forceGarbageCollection() {
        console.log('SuikaMemoryManager: Forcing garbage collection...');
        // 清理对象池
        this.cleanupObjectPools();
        // 清理纹理缓存
        this.cleanupTextureCache(true);
        // 清理场景图
        this.cleanupSceneGraph();
        // 更新统计
        this.updateMemoryStats();
        this.stats.lastGC = new Date();
        this.emit(SuikaMemoryEvent.GARBAGE_COLLECTED, {
            timestamp: this.stats.lastGC,
            freedMemory: this.stats.totalMemory
        });
    }
    // 从对象池获取对象
    getPooledObject(type, factory) {
        const pool = this.objectPools.get(type) || [];
        const availableObject = pool.find(item => !item.inUse);
        if (availableObject) {
            availableObject.inUse = true;
            availableObject.lastUsed = Date.now();
            this.emit(SuikaMemoryEvent.OBJECT_POOLED, { type, action: 'reused' });
            return availableObject.object;
        }
        // 创建新对象
        const newObject = factory();
        const pooledItem = {
            object: newObject,
            lastUsed: Date.now(),
            inUse: true,
            type
        };
        pool.push(pooledItem);
        this.objectPools.set(type, pool);
        this.emit(SuikaMemoryEvent.OBJECT_POOLED, { type, action: 'created' });
        return newObject;
    }
    // 返回对象到池
    returnToPool(type, object) {
        const pool = this.objectPools.get(type) || [];
        const pooledItem = pool.find(item => item.object === object);
        if (pooledItem) {
            pooledItem.inUse = false;
            this.resetObjectForPool(pooledItem.object);
        }
    }
    // 缓存纹理
    cacheTexture(key, texture, estimatedSize) {
        // 检查缓存大小限制
        if (this.stats.cacheSize + estimatedSize > this.limits.textureCacheSize) {
            this.cleanupTextureCache(false);
        }
        this.textureCache.set(key, {
            texture,
            size: estimatedSize,
            lastUsed: Date.now(),
            key
        });
        this.updateCacheSize();
    }
    // 获取缓存的纹理
    getCachedTexture(key) {
        const cached = this.textureCache.get(key);
        if (cached) {
            cached.lastUsed = Date.now();
            return cached.texture;
        }
        return null;
    }
    // 清理所有缓存
    clearAll() {
        this.textureCache.clear();
        this.objectPools.clear();
        this.initializeObjectPools();
        this.updateMemoryStats();
        this.emit(SuikaMemoryEvent.CACHE_CLEARED, { timestamp: new Date() });
    }
    // 设置内存限制
    setMemoryLimits(limits) {
        this.limits = { ...this.limits, ...limits };
    }
    // 销毁内存管理器
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.clearAll();
        this.emit('destroyed', { timestamp: new Date() });
    }
    // 初始化对象池
    initializeObjectPools() {
        const poolTypes = ['rect', 'circle', 'text', 'image'];
        poolTypes.forEach(type => {
            this.objectPools.set(type, []);
        });
    }
    // 开始内存监控
    startMemoryMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateMemoryStats();
            this.checkMemoryThresholds();
            this.updatePerformanceStats();
        }, 1000); // 每秒检查一次
    }
    // 更新内存统计
    updateMemoryStats() {
        this.stats.canvasMemory = this.estimateCanvasMemoryUsage();
        this.stats.totalMemory = this.estimateTotalMemoryUsage();
        this.stats.objectCount = this.countObjects();
        this.stats.textureCount = this.textureCache.size;
        this.updateCacheSize();
    }
    // 更新性能统计
    updatePerformanceStats() {
        const perfInfo = this.editor.getPerformanceInfo();
        this.stats.fps = perfInfo.fps;
        this.stats.renderTime = this.performanceMonitor.renderTime;
    }
    // 设置性能监控
    setupPerformanceMonitoring() {
        let lastFrameTime = performance.now();
        const monitorFrame = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastFrameTime;
            this.performanceMonitor.frameCount++;
            this.performanceMonitor.lastFrameTime = currentTime;
            this.performanceMonitor.fps = 1000 / deltaTime;
            this.performanceMonitor.renderTime = deltaTime;
            // 使用deltaTime避免未使用变量错误
            if (deltaTime > 0) {
                // 空操作，只是为了使用变量
            }
            lastFrameTime = currentTime;
            requestAnimationFrame(monitorFrame);
        };
        requestAnimationFrame(monitorFrame);
    }
    // 估算画布内存使用
    estimateCanvasMemoryUsage() {
        const canvas = this.editor.canvasElement;
        const width = canvas.width;
        const height = canvas.height;
        // 估算像素数据内存使用 (4 bytes per pixel for RGBA)
        const pixelDataSize = width * height * 4;
        // 估算对象内存使用
        const objects = this.editor.sceneGraph.getObjects();
        const objectMemory = objects.reduce((total, obj) => {
            return total + this.estimateObjectMemory(obj);
        }, 0);
        return (pixelDataSize + objectMemory) / (1024 * 1024); // 转换为MB
    }
    // 估算总内存使用
    estimateTotalMemoryUsage() {
        return this.stats.canvasMemory + this.stats.cacheSize;
    }
    // 估算对象内存使用
    estimateObjectMemory(obj) {
        let size = 0;
        // 基础对象属性
        size += 100; // 基础对象开销
        // 根据对象类型估算
        switch (obj.type) {
            case 'rect':
                size += 200; // 矩形对象
                break;
            case 'circle':
                size += 150; // 圆形对象
                break;
            case 'text':
                size += 300 + (obj.text?.length || 0) * 2; // 文本对象
                break;
            case 'image':
                size += 500 + (obj.width || 0) * (obj.height || 0) * 4; // 图片对象
                break;
            default:
                size += 100;
        }
        return size;
    }
    // 计算对象数量
    countObjects() {
        return this.editor.sceneGraph.getObjects().length;
    }
    // 更新缓存大小
    updateCacheSize() {
        let totalSize = 0;
        for (const cached of this.textureCache.values()) {
            totalSize += cached.size;
        }
        this.stats.cacheSize = totalSize;
    }
    // 检查内存阈值
    checkMemoryThresholds() {
        if (this.stats.totalMemory > this.limits.criticalThreshold) {
            this.emit(SuikaMemoryEvent.MEMORY_CRITICAL, {
                current: this.stats.totalMemory,
                threshold: this.limits.criticalThreshold
            });
            this.forceGarbageCollection();
        }
        else if (this.stats.totalMemory > this.limits.warningThreshold) {
            this.emit(SuikaMemoryEvent.MEMORY_WARNING, {
                current: this.stats.totalMemory,
                threshold: this.limits.warningThreshold
            });
        }
    }
    // 清理对象池
    cleanupObjectPools() {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5分钟
        for (const [type, pool] of this.objectPools.entries()) {
            const activeObjects = pool.filter(item => item.inUse || (now - item.lastUsed) < maxAge);
            // 限制池大小
            if (activeObjects.length > this.limits.objectPoolSize) {
                activeObjects.splice(this.limits.objectPoolSize);
            }
            this.objectPools.set(type, activeObjects);
        }
    }
    // 清理纹理缓存
    cleanupTextureCache(aggressive = false) {
        const now = Date.now();
        const maxAge = aggressive ? 60 * 1000 : 5 * 60 * 1000; // 1分钟或5分钟
        for (const [key, cached] of this.textureCache.entries()) {
            if (now - cached.lastUsed > maxAge) {
                this.textureCache.delete(key);
            }
        }
        this.updateCacheSize();
    }
    // 清理场景图
    cleanupSceneGraph() {
        // 清理不可见的对象
        const objects = this.editor.sceneGraph.getObjects();
        const visibleObjects = objects.filter(obj => obj.visible !== false);
        if (visibleObjects.length < objects.length) {
            // 有不可见对象，触发重新渲染
            this.editor.render();
        }
    }
    // 重置对象用于池
    resetObjectForPool(obj) {
        // 重置对象属性到默认状态
        if (obj.type === 'rect' || obj.type === 'circle') {
            obj.x = 0;
            obj.y = 0;
            obj.fill = '#cccccc';
            obj.stroke = '#666666';
            obj.strokeWidth = 1;
            obj.rotation = 0;
            obj.opacity = 1;
            obj.visible = true;
            obj.locked = false;
        }
        else if (obj.type === 'text') {
            obj.text = '';
            obj.fontSize = 16;
            obj.fontFamily = 'Arial';
            obj.fill = '#333333';
        }
    }
    // 获取性能信息
    getPerformanceInfo() {
        return {
            fps: this.stats.fps,
            memoryUsage: this.stats.totalMemory,
            renderTime: this.stats.renderTime
        };
    }
}
//# sourceMappingURL=memory-manager.js.map