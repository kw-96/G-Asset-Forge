import { ToolType } from './tool-types';
export class BaseTool {
    constructor(type, config) {
        this.type = type;
        this.config = config;
        this.state = {
            isActive: false,
            isDragging: false,
            properties: {}
        };
    }
    activate() {
        this.state.isActive = true;
        this.onActivate();
    }
    deactivate() {
        this.state.isActive = false;
        this.state.isDragging = false;
        this.state.startPoint = undefined;
        this.state.currentPoint = undefined;
        this.onDeactivate();
    }
    onActivate() {
        // 子类可以重写
    }
    onDeactivate() {
        // 子类可以重写
    }
    onKeyDown(_event) {
        // 默认实现，子类可以重写
    }
    onKeyUp(_event) {
        // 默认实现，子类可以重写
    }
}
// 选择工具
export class SelectTool extends BaseTool {
    constructor() {
        super(ToolType.SELECT, {
            type: ToolType.SELECT,
            name: '选择',
            icon: 'select',
            shortcut: 'V',
            cursor: 'default'
        });
        this.selectedObjects = new Set();
        this.selectionBox = null;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.originalObjectStates = new Map();
    }
    onMouseDown(event) {
        const canvasPoint = this.getCanvasPoint(event);
        // 检查是否点击了变换手柄
        const handle = this.getResizeHandleAt(canvasPoint);
        if (handle) {
            this.startResize(handle, canvasPoint);
            return;
        }
        // 检查是否点击了对象
        const clickedObject = this.getObjectAt(canvasPoint);
        if (clickedObject) {
            this.handleObjectClick(clickedObject, event.shiftKey);
        }
        else {
            this.startSelectionBox(canvasPoint);
        }
        this.state.isDragging = true;
        this.state.startPoint = canvasPoint;
    }
    onMouseMove(event) {
        const canvasPoint = this.getCanvasPoint(event);
        this.state.currentPoint = canvasPoint;
        if (this.isResizing) {
            this.handleResize(canvasPoint);
        }
        else if (this.isDragging && this.selectedObjects.size > 0) {
            this.handleDrag(canvasPoint);
        }
        else if (this.selectionBox) {
            this.updateSelectionBox(canvasPoint);
        }
        // 更新光标
        this.updateCursor(canvasPoint);
    }
    onMouseUp(_event) {
        if (this.selectionBox) {
            this.finalizeSelectionBox();
        }
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.state.isDragging = false;
        this.state.startPoint = undefined;
        this.state.currentPoint = undefined;
    }
    // 对象选择功能
    handleObjectClick(objectId, isMultiSelect) {
        if (isMultiSelect) {
            // 多选模式
            if (this.selectedObjects.has(objectId)) {
                this.selectedObjects.delete(objectId);
            }
            else {
                this.selectedObjects.add(objectId);
            }
        }
        else {
            // 单选模式
            this.selectedObjects.clear();
            this.selectedObjects.add(objectId);
        }
        this.saveObjectStates();
        this.emitSelectionChanged();
    }
    // 框选功能
    startSelectionBox(point) {
        this.selectionBox = {
            x: point.x,
            y: point.y,
            width: 0,
            height: 0
        };
    }
    updateSelectionBox(point) {
        if (!this.selectionBox || !this.state.startPoint)
            return;
        this.selectionBox.width = point.x - this.state.startPoint.x;
        this.selectionBox.height = point.y - this.state.startPoint.y;
    }
    finalizeSelectionBox() {
        if (!this.selectionBox)
            return;
        // 获取框选区域内的对象
        const objectsInBox = this.getObjectsInBox(this.selectionBox);
        // 更新选择状态
        this.selectedObjects.clear();
        objectsInBox.forEach(obj => this.selectedObjects.add(obj.id));
        this.selectionBox = null;
        this.saveObjectStates();
        this.emitSelectionChanged();
    }
    // 对象变换功能
    startResize(handle, _point) {
        this.isResizing = true;
        this.resizeHandle = handle;
        this.saveObjectStates();
    }
    handleResize(point) {
        if (!this.resizeHandle || !this.state.startPoint)
            return;
        const deltaX = point.x - this.state.startPoint.x;
        const deltaY = point.y - this.state.startPoint.y;
        this.selectedObjects.forEach(objectId => {
            const object = this.getObjectById(objectId);
            if (object) {
                this.resizeObject(object, this.resizeHandle, deltaX, deltaY);
            }
        });
    }
    handleDrag(point) {
        if (!this.state.startPoint)
            return;
        const deltaX = point.x - this.state.startPoint.x;
        const deltaY = point.y - this.state.startPoint.y;
        this.selectedObjects.forEach(objectId => {
            const object = this.getObjectById(objectId);
            if (object) {
                this.moveObject(object, deltaX, deltaY);
            }
        });
        // 更新起始点
        this.state.startPoint = point;
    }
    // 批量操作功能
    deleteSelectedObjects() {
        this.selectedObjects.forEach(objectId => {
            this.removeObject(objectId);
        });
        this.selectedObjects.clear();
        this.emitSelectionChanged();
    }
    duplicateSelectedObjects() {
        const newObjects = [];
        this.selectedObjects.forEach(objectId => {
            const object = this.getObjectById(objectId);
            if (object) {
                const duplicatedObject = this.duplicateObject(object);
                newObjects.push(duplicatedObject.id);
            }
        });
        // 更新选择状态
        this.selectedObjects.clear();
        newObjects.forEach(id => this.selectedObjects.add(id));
        this.emitSelectionChanged();
    }
    // 选择状态管理
    clearSelection() {
        this.selectedObjects.clear();
        this.selectionBox = null;
        this.emitSelectionChanged();
    }
    selectAll() {
        const allObjects = this.getAllObjects();
        this.selectedObjects.clear();
        allObjects.forEach(obj => this.selectedObjects.add(obj.id));
        this.emitSelectionChanged();
    }
    // 渲染选择状态
    render(ctx) {
        // 渲染选择框
        if (this.selectionBox) {
            ctx.save();
            ctx.strokeStyle = '#007AFF';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(this.selectionBox.x, this.selectionBox.y, this.selectionBox.width, this.selectionBox.height);
            ctx.restore();
        }
        // 渲染选中对象的边框和变换手柄
        this.selectedObjects.forEach(objectId => {
            const object = this.getObjectById(objectId);
            if (object) {
                this.renderSelectionBorder(ctx, object);
                this.renderTransformHandles(ctx, object);
            }
        });
    }
    renderSelectionBorder(ctx, object) {
        const bounds = this.getObjectBounds(object);
        ctx.save();
        ctx.strokeStyle = '#007AFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.restore();
    }
    renderTransformHandles(ctx, object) {
        const bounds = this.getObjectBounds(object);
        const handles = this.getTransformHandles(bounds);
        handles.forEach(handle => {
            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#007AFF';
            ctx.lineWidth = 2;
            ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
            ctx.strokeRect(handle.x - 4, handle.y - 4, 8, 8);
            ctx.restore();
        });
    }
    // 辅助方法
    getCanvasPoint(event) {
        // 这里需要与画布引擎集成，获取正确的画布坐标
        return { x: event.clientX, y: event.clientY };
    }
    getObjectAt(_point) {
        // 与画布引擎集成，获取指定点的对象
        return null;
    }
    getObjectById(_id) {
        // 与画布引擎集成，获取对象
        return null;
    }
    getAllObjects() {
        // 与画布引擎集成，获取所有对象
        return [];
    }
    getObjectsInBox(_box) {
        // 与画布引擎集成，获取框选区域内的对象
        return [];
    }
    getObjectBounds(_object) {
        // 获取对象边界
        return { x: 0, y: 0, width: 100, height: 100 };
    }
    getTransformHandles(bounds) {
        return [
            { x: bounds.x, y: bounds.y, type: 'top-left' },
            { x: bounds.x + bounds.width / 2, y: bounds.y, type: 'top-center' },
            { x: bounds.x + bounds.width, y: bounds.y, type: 'top-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, type: 'right-center' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'bottom-right' },
            { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, type: 'bottom-center' },
            { x: bounds.x, y: bounds.y + bounds.height, type: 'bottom-left' },
            { x: bounds.x, y: bounds.y + bounds.height / 2, type: 'left-center' }
        ];
    }
    getResizeHandleAt(_point) {
        // 检查是否点击了变换手柄
        return null;
    }
    moveObject(object, deltaX, deltaY) {
        // 移动对象
        if (object.x !== undefined)
            object.x += deltaX;
        if (object.y !== undefined)
            object.y += deltaY;
    }
    resizeObject(object, handle, deltaX, deltaY) {
        // 根据手柄类型调整对象大小
        switch (handle) {
            case 'top-left':
                if (object.x !== undefined)
                    object.x += deltaX;
                if (object.y !== undefined)
                    object.y += deltaY;
                if (object.width !== undefined)
                    object.width -= deltaX;
                if (object.height !== undefined)
                    object.height -= deltaY;
                break;
            case 'top-right':
                if (object.y !== undefined)
                    object.y += deltaY;
                if (object.width !== undefined)
                    object.width += deltaX;
                if (object.height !== undefined)
                    object.height -= deltaY;
                break;
            // 其他手柄类型...
        }
    }
    duplicateObject(object) {
        // 复制对象
        return { ...object, id: this.generateId() };
    }
    removeObject(_objectId) {
        // 移除对象
    }
    saveObjectStates() {
        this.originalObjectStates.clear();
        this.selectedObjects.forEach(objectId => {
            const object = this.getObjectById(objectId);
            if (object) {
                this.originalObjectStates.set(objectId, { ...object });
            }
        });
    }
    updateCursor(point) {
        const handle = this.getResizeHandleAt(point);
        if (handle) {
            this.setCursor(this.getCursorForHandle(handle));
        }
        else {
            this.setCursor('default');
        }
    }
    getCursorForHandle(handle) {
        switch (handle) {
            case 'top-left':
            case 'bottom-right':
                return 'nw-resize';
            case 'top-right':
            case 'bottom-left':
                return 'ne-resize';
            case 'top-center':
            case 'bottom-center':
                return 'ns-resize';
            case 'left-center':
            case 'right-center':
                return 'ew-resize';
            default:
                return 'default';
        }
    }
    setCursor(_cursor) {
        // 设置光标样式
    }
    generateId() {
        return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    emitSelectionChanged() {
        // 发出选择变化事件
    }
}
// 矩形工具
export class RectangleTool extends BaseTool {
    constructor() {
        super(ToolType.RECTANGLE, {
            type: ToolType.RECTANGLE,
            name: '矩形',
            icon: 'rectangle',
            shortcut: 'R',
            cursor: 'crosshair'
        });
    }
    onMouseDown(event) {
        this.state.isDragging = true;
        this.state.startPoint = { x: event.clientX, y: event.clientY };
    }
    onMouseMove(event) {
        if (this.state.isDragging) {
            this.state.currentPoint = { x: event.clientX, y: event.clientY };
        }
    }
    onMouseUp(_event) {
        if (this.state.startPoint && this.state.currentPoint) {
            // 创建矩形对象
            const rect = {
                id: `rect_${Date.now()}`,
                type: 'rectangle',
                position: {
                    x: Math.min(this.state.startPoint.x, this.state.currentPoint.x),
                    y: Math.min(this.state.startPoint.y, this.state.currentPoint.y)
                },
                size: {
                    width: Math.abs(this.state.currentPoint.x - this.state.startPoint.x),
                    height: Math.abs(this.state.currentPoint.y - this.state.startPoint.y)
                },
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                zIndex: 0
            };
            // TODO: 通过画布管理器添加对象
            console.log('Created rectangle:', rect);
        }
        this.state.isDragging = false;
        this.state.startPoint = undefined;
        this.state.currentPoint = undefined;
    }
    render(ctx) {
        if (this.state.isDragging && this.state.startPoint && this.state.currentPoint) {
            const x = Math.min(this.state.startPoint.x, this.state.currentPoint.x);
            const y = Math.min(this.state.startPoint.y, this.state.currentPoint.y);
            const width = Math.abs(this.state.currentPoint.x - this.state.startPoint.x);
            const height = Math.abs(this.state.currentPoint.y - this.state.startPoint.y);
            ctx.save();
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x, y, width, height);
            ctx.restore();
        }
    }
}
// 圆形工具
export class CircleTool extends BaseTool {
    constructor() {
        super(ToolType.CIRCLE, {
            type: ToolType.CIRCLE,
            name: '圆形',
            icon: 'circle',
            shortcut: 'C',
            cursor: 'crosshair'
        });
    }
    onMouseDown(event) {
        this.state.isDragging = true;
        this.state.startPoint = { x: event.clientX, y: event.clientY };
    }
    onMouseMove(event) {
        if (this.state.isDragging) {
            this.state.currentPoint = { x: event.clientX, y: event.clientY };
        }
    }
    onMouseUp(_event) {
        if (this.state.startPoint && this.state.currentPoint) {
            const radius = Math.sqrt(Math.pow(this.state.currentPoint.x - this.state.startPoint.x, 2) +
                Math.pow(this.state.currentPoint.y - this.state.startPoint.y, 2));
            const circle = {
                id: `circle_${Date.now()}`,
                type: 'circle',
                position: {
                    x: this.state.startPoint.x - radius,
                    y: this.state.startPoint.y - radius
                },
                size: {
                    width: radius * 2,
                    height: radius * 2
                },
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                zIndex: 0
            };
            console.log('Created circle:', circle);
        }
        this.state.isDragging = false;
        this.state.startPoint = undefined;
        this.state.currentPoint = undefined;
    }
}
// 文本工具
export class TextTool extends BaseTool {
    constructor() {
        super(ToolType.TEXT, {
            type: ToolType.TEXT,
            name: '文本',
            icon: 'text',
            shortcut: 'T',
            cursor: 'text'
        });
    }
    onMouseDown(event) {
        const text = {
            id: `text_${Date.now()}`,
            type: 'text',
            position: { x: event.clientX, y: event.clientY },
            size: { width: 100, height: 30 },
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            zIndex: 0
        };
        console.log('Created text:', text);
    }
    onMouseMove(_event) {
        // 文本工具通常不需要拖拽
    }
    onMouseUp(_event) {
        // 文本工具通常不需要拖拽
    }
}
//# sourceMappingURL=tools.js.map