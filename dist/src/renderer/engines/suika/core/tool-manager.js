export class SelectTool {
    constructor(editor) {
        this.name = 'select';
        this.type = 'select';
        this.isActive = false;
        this.selectedObjects = [];
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragOffset = { x: 0, y: 0 };
        this.editor = editor;
    }
    activate() {
        this.isActive = true;
    }
    deactivate() {
        this.isActive = false;
        this.clearSelection();
    }
    handleMouseDown(x, y, event) {
        if (!this.isActive)
            return;
        const sceneGraph = this.editor.sceneGraph;
        const clickedObject = sceneGraph.findObjectAtPoint(x, y);
        if (clickedObject) {
            // 选择对象
            if (!event.ctrlKey && !event.metaKey) {
                this.clearSelection();
            }
            this.selectObject(clickedObject.id);
            // 开始拖拽
            this.isDragging = true;
            this.dragStart = { x, y };
            this.dragOffset = { x: 0, y: 0 };
        }
        else {
            // 点击空白区域，清除选择
            if (!event.ctrlKey && !event.metaKey) {
                this.clearSelection();
            }
        }
    }
    handleMouseMove(x, y, _event) {
        if (!this.isActive || !this.isDragging)
            return;
        // 计算拖拽偏移
        this.dragOffset = {
            x: x - this.dragStart.x,
            y: y - this.dragStart.y
        };
        // 移动选中的对象
        this.moveSelectedObjects(this.dragOffset.x, this.dragOffset.y);
        // 更新拖拽起始点
        this.dragStart = { x, y };
    }
    handleMouseUp(_x, _y, _event) {
        if (!this.isActive)
            return;
        this.isDragging = false;
    }
    render(ctx) {
        if (!this.isActive)
            return;
        // 渲染选择框
        this.renderSelectionBoxes(ctx);
    }
    // 选择对象
    selectObject(id) {
        if (!this.selectedObjects.includes(id)) {
            this.selectedObjects.push(id);
        }
    }
    // 取消选择对象
    deselectObject(id) {
        const index = this.selectedObjects.indexOf(id);
        if (index > -1) {
            this.selectedObjects.splice(index, 1);
        }
    }
    // 清除所有选择
    clearSelection() {
        this.selectedObjects = [];
    }
    // 获取选中的对象
    getSelectedObjects() {
        return [...this.selectedObjects];
    }
    // 移动选中的对象
    moveSelectedObjects(dx, dy) {
        const sceneGraph = this.editor.sceneGraph;
        for (const id of this.selectedObjects) {
            const object = sceneGraph.getObject(id);
            if (object) {
                sceneGraph.updateObject(id, {
                    x: object.x + dx,
                    y: object.y + dy
                });
            }
        }
    }
    // 渲染选择框
    renderSelectionBoxes(ctx) {
        const sceneGraph = this.editor.sceneGraph;
        ctx.save();
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        for (const id of this.selectedObjects) {
            const bounds = sceneGraph.getObjectBounds(id);
            if (bounds) {
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            }
        }
        ctx.restore();
    }
}
export class ToolManager {
    constructor(editor) {
        this.tools = new Map();
        this.activeTool = null;
        this.editor = editor;
        this.initializeTools();
    }
    // 初始化工具
    initializeTools() {
        const selectTool = new SelectTool(this.editor);
        this.tools.set('select', selectTool);
        // 默认激活选择工具
        this.setActiveTool('select');
    }
    // 设置活动工具
    setActiveTool(toolName) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            console.warn(`Tool ${toolName} not found`);
            return;
        }
        if (this.activeTool) {
            this.activeTool.deactivate();
        }
        this.activeTool = tool;
        this.activeTool.activate();
    }
    // 获取活动工具
    getActiveTool() {
        return this.activeTool;
    }
    // 获取所有工具
    getTools() {
        return Array.from(this.tools.values());
    }
    // 鼠标事件处理
    handleMouseDown(x, y, event) {
        if (this.activeTool) {
            this.activeTool.handleMouseDown(x, y, event);
        }
    }
    handleMouseMove(x, y, event) {
        if (this.activeTool) {
            this.activeTool.handleMouseMove(x, y, event);
        }
    }
    handleMouseUp(x, y, event) {
        if (this.activeTool) {
            this.activeTool.handleMouseUp(x, y, event);
        }
    }
    // 渲染工具
    render(ctx) {
        if (this.activeTool) {
            this.activeTool.render(ctx);
        }
    }
    // 选择对象
    selectObjects(ids) {
        const selectTool = this.tools.get('select');
        if (selectTool) {
            selectTool.clearSelection();
            ids.forEach(id => selectTool.selectObject(id));
        }
    }
    // 清除选择
    clearSelection() {
        const selectTool = this.tools.get('select');
        if (selectTool) {
            selectTool.clearSelection();
        }
    }
    // 获取选中的对象
    getSelectedObjects() {
        const selectTool = this.tools.get('select');
        return selectTool ? selectTool.getSelectedObjects() : [];
    }
    // 键盘事件处理（可选）
    handleKeyDown(event) {
        // 默认为空，子类可以重写
        if (this.activeTool && typeof this.activeTool.handleKeyDown === 'function') {
            this.activeTool.handleKeyDown(event);
        }
    }
    handleKeyUp(event) {
        // 默认为空，子类可以重写
        if (this.activeTool && typeof this.activeTool.handleKeyUp === 'function') {
            this.activeTool.handleKeyUp(event);
        }
    }
    // 添加工具
    addTool(tool) {
        this.tools.set(tool.name, tool);
    }
    // 移除工具
    removeTool(toolName) {
        if (this.activeTool && this.activeTool.name === toolName) {
            this.activeTool.deactivate();
            this.activeTool = null;
        }
        this.tools.delete(toolName);
    }
}
//# sourceMappingURL=tool-manager.js.map