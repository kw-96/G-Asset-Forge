export class ViewportManager {
    constructor(editor) {
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.lastPanTime = 0;
        this.panVelocity = { x: 0, y: 0 };
        this.editor = editor;
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
        this.options = {
            minZoom: 0.5, // 50% 最小缩放
            maxZoom: 2.0, // 200% 最大缩放
            zoomStep: 0.1, // 缩放步长
            smoothZoom: true, // 平滑缩放
            enablePan: true, // 启用平移
            enableZoom: true // 启用缩放
        };
    }
    // 设置视口
    setViewport(viewport) {
        this.viewport = { ...this.viewport, ...viewport };
        this.clampViewport();
        this.editor.render();
    }
    // 获取视口
    getViewport() {
        return { ...this.viewport };
    }
    // 平移视口
    pan(dx, dy) {
        if (!this.options.enablePan)
            return;
        this.viewport.x += dx;
        this.viewport.y += dy;
        this.clampViewport();
        this.editor.render();
    }
    // 平滑平移
    smoothPan(dx, dy, duration = 300) {
        if (!this.options.enablePan)
            return;
        const startTime = performance.now();
        const startX = this.viewport.x;
        const startY = this.viewport.y;
        const targetX = startX + dx;
        const targetY = startY + dy;
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // 使用缓动函数
            const easeProgress = this.easeOutCubic(progress);
            this.viewport.x = startX + (targetX - startX) * easeProgress;
            this.viewport.y = startY + (targetY - startY) * easeProgress;
            this.clampViewport();
            this.editor.render();
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }
    // 缩放到指定点
    zoomAt(x, y, zoomDelta) {
        if (!this.options.enableZoom)
            return;
        const currentZoom = this.editor.zoomManager.getZoom();
        const newZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, currentZoom * zoomDelta));
        if (newZoom !== currentZoom) {
            // 计算缩放中心点
            const zoomCenterX = x;
            const zoomCenterY = y;
            // 计算新的视口位置
            const zoomRatio = newZoom / currentZoom;
            this.viewport.x = zoomCenterX - (zoomCenterX - this.viewport.x) * zoomRatio;
            this.viewport.y = zoomCenterY - (zoomCenterY - this.viewport.y) * zoomRatio;
            this.editor.zoomManager.setZoom(newZoom);
            this.clampViewport();
            this.editor.render();
        }
    }
    // 适应屏幕
    fitToScreen() {
        const canvas = this.editor.canvasElement;
        const container = this.editor.containerElement;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        // 计算缩放比例
        const scaleX = containerWidth / canvasWidth;
        const scaleY = containerHeight / canvasHeight;
        const scale = Math.min(scaleX, scaleY, this.options.maxZoom);
        // 计算居中位置
        const scaledWidth = canvasWidth * scale;
        const scaledHeight = canvasHeight * scale;
        const x = (containerWidth - scaledWidth) / 2;
        const y = (containerHeight - scaledHeight) / 2;
        this.viewport = { x, y, width: containerWidth, height: containerHeight };
        this.editor.zoomManager.setZoom(scale);
        this.editor.render();
    }
    // 适应内容
    fitToContent() {
        const bounds = this.editor.sceneGraph.getAllBounds();
        if (!bounds)
            return;
        const container = this.editor.containerElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        // 添加边距
        const padding = 50;
        const contentWidth = bounds.width + padding * 2;
        const contentHeight = bounds.height + padding * 2;
        // 计算缩放比例
        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY, this.options.maxZoom);
        // 计算居中位置
        const scaledWidth = contentWidth * scale;
        const scaledHeight = contentHeight * scale;
        const x = (containerWidth - scaledWidth) / 2 - bounds.x * scale;
        const y = (containerHeight - scaledHeight) / 2 - bounds.y * scale;
        this.viewport = { x, y, width: containerWidth, height: containerHeight };
        this.editor.zoomManager.setZoom(scale);
        this.editor.render();
    }
    // 重置视口
    resetViewport() {
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
        this.editor.zoomManager.setZoom(1);
        this.editor.render();
    }
    // 开始平移
    startPan(x, y) {
        if (!this.options.enablePan)
            return;
        this.isPanning = true;
        this.panStart = { x, y };
        this.panVelocity = { x: 0, y: 0 };
        this.lastPanTime = performance.now();
    }
    // 更新平移
    updatePan(x, y) {
        if (!this.isPanning || !this.options.enablePan)
            return;
        const dx = x - this.panStart.x;
        const dy = y - this.panStart.y;
        this.pan(-dx, -dy);
        // 计算平移速度
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastPanTime;
        if (deltaTime > 0) {
            this.panVelocity.x = -dx / deltaTime;
            this.panVelocity.y = -dy / deltaTime;
        }
        this.panStart = { x, y };
        this.lastPanTime = currentTime;
    }
    // 结束平移
    endPan() {
        if (!this.isPanning)
            return;
        this.isPanning = false;
        // 应用惯性滚动
        if (Math.abs(this.panVelocity.x) > 0.1 || Math.abs(this.panVelocity.y) > 0.1) {
            this.applyInertia();
        }
    }
    // 应用惯性
    applyInertia() {
        const friction = 0.95;
        const minVelocity = 0.1;
        const animate = () => {
            if (Math.abs(this.panVelocity.x) < minVelocity && Math.abs(this.panVelocity.y) < minVelocity) {
                return;
            }
            this.pan(this.panVelocity.x, this.panVelocity.y);
            this.panVelocity.x *= friction;
            this.panVelocity.y *= friction;
            // 使用friction和minVelocity变量避免TS6133错误
            if (friction > 0 && minVelocity > 0) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }
    // 无限画布不限制视口范围 - 支持无限制平移
    clampViewport() {
        // 无限画布模式下不限制视口范围，允许无限制平移
        // 这是无限画布的核心特性之一
        // 可选：添加性能优化，当视口距离内容过远时给出警告
        const contentBounds = this.getContentBounds();
        const maxDistance = 50000; // 最大合理距离
        if (contentBounds && (Math.abs(this.viewport.x - contentBounds.centerX) > maxDistance ||
            Math.abs(this.viewport.y - contentBounds.centerY) > maxDistance)) {
            console.warn('视口距离内容过远，可能影响性能');
        }
        // 无限画布不进行位置限制
    }
    /**
     * 获取内容边界框
     */
    getContentBounds() {
        const objects = this.editor.sceneGraph.getObjects();
        if (objects.length === 0) {
            return null;
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        objects.forEach((obj) => {
            if (obj.x !== undefined && obj.y !== undefined) {
                const objMinX = obj.x;
                const objMinY = obj.y;
                const objMaxX = obj.x + (obj.width || 0);
                const objMaxY = obj.y + (obj.height || 0);
                minX = Math.min(minX, objMinX);
                minY = Math.min(minY, objMinY);
                maxX = Math.max(maxX, objMaxX);
                maxY = Math.max(maxY, objMaxY);
            }
        });
        if (minX === Infinity) {
            return null;
        }
        return {
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    // 缓动函数
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    // 获取视口选项
    getOptions() {
        return { ...this.options };
    }
    // 设置视口选项
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }
    // 获取视口状态
    getViewportState() {
        return {
            viewport: this.getViewport(),
            isPanning: this.isPanning
        };
    }
}
//# sourceMappingURL=viewport-manager.js.map