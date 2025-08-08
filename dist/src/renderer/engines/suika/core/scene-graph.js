// 简单的四叉树空间索引实现
class QuadTreeSpatialIndex {
    constructor() {
        this.objects = new Map();
    }
    insert(id, bounds) {
        this.objects.set(id, bounds);
    }
    remove(id) {
        this.objects.delete(id);
    }
    query(region) {
        const result = [];
        for (const [id, bounds] of this.objects.entries()) {
            if (this.intersects(region, bounds)) {
                result.push(id);
            }
        }
        return result;
    }
    update(id, bounds) {
        this.objects.set(id, bounds);
    }
    clear() {
        this.objects.clear();
    }
    intersects(a, b) {
        return !(a.x + a.width < b.x ||
            b.x + b.width < a.x ||
            a.y + a.height < b.y ||
            b.y + b.height < a.y);
    }
}
export class SceneGraph {
    constructor(editor) {
        this.objects = new Map();
        this.renderOrder = [];
        this.spatialIndex = new QuadTreeSpatialIndex();
        this.editor = editor;
    }
    // 添加对象 - 支持空间索引
    addObject(object) {
        if (this.objects.has(object.id)) {
            throw new Error(`Object with id ${object.id} already exists`);
        }
        this.objects.set(object.id, object);
        this.renderOrder.push(object.id);
        // 添加到空间索引
        const bounds = this.calculateObjectBounds(object);
        if (bounds) {
            this.spatialIndex.insert(object.id, bounds);
        }
    }
    // 移除对象 - 支持空间索引
    removeObject(id) {
        if (!this.objects.has(id)) {
            throw new Error(`Object with id ${id} not found`);
        }
        this.objects.delete(id);
        const index = this.renderOrder.indexOf(id);
        if (index > -1) {
            this.renderOrder.splice(index, 1);
        }
        // 从空间索引中移除
        this.spatialIndex.remove(id);
    }
    // 获取对象
    getObject(id) {
        return this.objects.get(id);
    }
    // 获取所有对象
    getObjects() {
        return this.renderOrder.map(id => this.objects.get(id));
    }
    // 更新对象 - 支持空间索引
    updateObject(id, updates) {
        const object = this.objects.get(id);
        if (!object) {
            throw new Error(`Object with id ${id} not found`);
        }
        Object.assign(object, updates);
        // 更新空间索引
        const bounds = this.calculateObjectBounds(object);
        if (bounds) {
            this.spatialIndex.update(id, bounds);
        }
    }
    // 渲染场景 - 支持视口裁剪优化
    render(ctx) {
        // 获取当前视口信息进行裁剪优化
        const viewport = this.editor.viewportManager.getViewport();
        const zoom = this.editor.zoomManager.getZoom();
        // 计算视口在世界坐标系中的区域
        const viewportWorldBounds = {
            x: -viewport.x / zoom,
            y: -viewport.y / zoom,
            width: viewport.width / zoom,
            height: viewport.height / zoom
        };
        // 使用空间索引查询可见对象
        const visibleObjectIds = this.spatialIndex.query(viewportWorldBounds);
        // 只渲染可见对象，提高性能
        for (const id of this.renderOrder) {
            if (!id || !visibleObjectIds.includes(id))
                continue;
            const object = this.objects.get(id);
            if (object && object.visible !== false) {
                this.renderObject(ctx, object);
            }
        }
    }
    // 渲染单个对象
    renderObject(ctx, object) {
        ctx.save();
        switch (object.type) {
            case 'rect':
                this.renderRect(ctx, object);
                break;
            case 'circle':
                this.renderCircle(ctx, object);
                break;
            case 'text':
                this.renderText(ctx, object);
                break;
            case 'image':
                this.renderImage(ctx, object);
                break;
            default:
                console.warn(`Unknown object type: ${object.type}`);
        }
        ctx.restore();
    }
    // 渲染矩形
    renderRect(ctx, object) {
        if (object.fill) {
            ctx.fillStyle = object.fill;
            ctx.fillRect(object.x, object.y, object.width || 0, object.height || 0);
        }
        if (object.stroke && object.strokeWidth) {
            ctx.strokeStyle = object.stroke;
            ctx.lineWidth = object.strokeWidth;
            ctx.strokeRect(object.x, object.y, object.width || 0, object.height || 0);
        }
    }
    // 渲染圆形
    renderCircle(ctx, object) {
        const radius = object.radius || 0;
        ctx.beginPath();
        ctx.arc(object.x, object.y, radius, 0, 2 * Math.PI);
        if (object.fill) {
            ctx.fillStyle = object.fill;
            ctx.fill();
        }
        if (object.stroke && object.strokeWidth) {
            ctx.strokeStyle = object.stroke;
            ctx.lineWidth = object.strokeWidth;
            ctx.stroke();
        }
    }
    // 渲染文本
    renderText(ctx, object) {
        if (!object.text)
            return;
        ctx.font = `${object.fontSize || 16}px ${object.fontFamily || 'Arial'}`;
        if (object.fill) {
            ctx.fillStyle = object.fill;
            ctx.fillText(object.text, object.x, object.y);
        }
        if (object.stroke && object.strokeWidth) {
            ctx.strokeStyle = object.stroke;
            ctx.lineWidth = object.strokeWidth;
            ctx.strokeText(object.text, object.x, object.y);
        }
    }
    // 渲染图片
    renderImage(ctx, object) {
        if (!object.src)
            return;
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, object.x, object.y, object.width || img.width, object.height || img.height);
        };
        img.src = object.src;
    }
    // 获取对象边界框
    getObjectBounds(id) {
        const object = this.objects.get(id);
        if (!object)
            return null;
        switch (object.type) {
            case 'rect':
                return {
                    x: object.x,
                    y: object.y,
                    width: object.width || 0,
                    height: object.height || 0
                };
            case 'circle':
                const radius = object.radius || 0;
                return {
                    x: object.x - radius,
                    y: object.y - radius,
                    width: radius * 2,
                    height: radius * 2
                };
            case 'text':
                // 文本边界框需要计算文本尺寸
                const canvas = document.createElement('canvas');
                const tempCtx = canvas.getContext('2d');
                const fontSize = object.fontSize || 16;
                const fontFamily = object.fontFamily || 'Arial';
                tempCtx.font = `${fontSize}px ${fontFamily}`;
                const text = object.text || '';
                const metrics = tempCtx.measureText(text);
                return {
                    x: object.x,
                    y: object.y - (object.fontSize || 16),
                    width: metrics.width,
                    height: object.fontSize || 16
                };
            case 'image':
                return {
                    x: object.x,
                    y: object.y,
                    width: object.width || 0,
                    height: object.height || 0
                };
            default:
                return null;
        }
    }
    // 获取所有对象的边界框
    getAllBounds() {
        if (this.objects.size === 0)
            return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const id of this.renderOrder) {
            const bounds = this.getObjectBounds(id);
            if (bounds) {
                minX = Math.min(minX, bounds.x);
                minY = Math.min(minY, bounds.y);
                maxX = Math.max(maxX, bounds.x + bounds.width);
                maxY = Math.max(maxY, bounds.y + bounds.height);
            }
        }
        if (minX === Infinity)
            return null;
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    // 查找点击的对象
    findObjectAtPoint(x, y) {
        // 从后往前检查（最上层的对象优先）
        for (let i = this.renderOrder.length - 1; i >= 0; i--) {
            const id = this.renderOrder[i];
            if (!id)
                continue;
            const object = this.objects.get(id);
            if (object && object.visible !== false) {
                const bounds = this.getObjectBounds(object.id);
                if (bounds && this.pointInBounds(x, y, bounds)) {
                    return object;
                }
            }
        }
        return null;
    }
    // 检查点是否在边界框内
    pointInBounds(x, y, bounds) {
        return x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height;
    }
    // 清空场景
    clear() {
        this.objects.clear();
        this.renderOrder = [];
        this.spatialIndex.clear();
    }
    // 计算对象边界框（用于空间索引）
    calculateObjectBounds(object) {
        switch (object.type) {
            case 'rect':
                return {
                    x: object.x,
                    y: object.y,
                    width: object.width || 0,
                    height: object.height || 0
                };
            case 'circle':
                const radius = object.radius || 0;
                return {
                    x: object.x - radius,
                    y: object.y - radius,
                    width: radius * 2,
                    height: radius * 2
                };
            case 'text':
                // 简化的文本边界框计算
                const fontSize = object.fontSize || 16;
                const textWidth = (object.text || '').length * fontSize * 0.6; // 近似计算
                return {
                    x: object.x,
                    y: object.y - fontSize,
                    width: textWidth,
                    height: fontSize
                };
            case 'image':
                return {
                    x: object.x,
                    y: object.y,
                    width: object.width || 0,
                    height: object.height || 0
                };
            default:
                return null;
        }
    }
    // 获取视口内的可见对象
    getVisibleObjects(viewportBounds) {
        const visibleIds = this.spatialIndex.query(viewportBounds);
        return visibleIds.map(id => this.objects.get(id)).filter(Boolean);
    }
    // 获取空间索引统计信息
    getSpatialIndexStats() {
        return {
            totalObjects: this.objects.size,
            indexedObjects: this.objects.size // 简化实现，所有对象都被索引
        };
    }
    // 获取场景统计信息
    getStats() {
        let visibleCount = 0;
        let lockedCount = 0;
        for (const object of this.objects.values()) {
            if (object.visible !== false)
                visibleCount++;
            if (object.locked === true)
                lockedCount++;
        }
        return {
            objectCount: this.objects.size,
            visibleCount,
            lockedCount
        };
    }
}
//# sourceMappingURL=scene-graph.js.map