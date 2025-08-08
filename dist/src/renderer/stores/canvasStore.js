import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
// 简化的游戏素材预设
const SIMPLE_GAME_ASSET_PRESETS = {
    MOBILE_PORTRAIT: { width: 1080, height: 1920, name: '手机竖屏 (1080x1920)' },
    MOBILE_LANDSCAPE: { width: 1920, height: 1080, name: '手机横屏 (1920x1080)' },
    TABLET_PORTRAIT: { width: 768, height: 1024, name: '平板竖屏 (768x1024)' },
    TABLET_LANDSCAPE: { width: 1024, height: 768, name: '平板横屏 (1024x768)' },
    DESKTOP: { width: 1920, height: 1080, name: '桌面 (1920x1080)' },
    SQUARE: { width: 1080, height: 1080, name: '正方形 (1080x1080)' },
    HD: { width: 1280, height: 720, name: 'HD (1280x720)' },
    ICON_SMALL: { width: 64, height: 64, name: '小图标 (64x64)' },
    ICON_MEDIUM: { width: 128, height: 128, name: '中图标 (128x128)' },
    ICON_LARGE: { width: 256, height: 256, name: '大图标 (256x256)' }
};
export const useCanvasStore = create()(devtools((set, get) => ({
    // 初始状态
    zoom: 100,
    panX: 0,
    panY: 0,
    showGrid: true,
    showRuler: true,
    snapToGrid: false,
    backgroundColor: '#ffffff',
    gridSize: 20,
    fps: 60,
    memoryUsage: 0,
    objectCount: 0,
    presets: SIMPLE_GAME_ASSET_PRESETS,
    // 初始化画布
    initializeCanvas: async () => {
        try {
            console.log('无限画布系统初始化成功');
            set({
                fps: 60,
                memoryUsage: 0,
                objectCount: 0,
                zoom: 100,
                panX: 0,
                panY: 0
            });
        }
        catch (error) {
            console.error('画布初始化失败:', error);
        }
    },
    // 缩放控制
    setZoom: (zoom) => {
        const clampedZoom = Math.max(25, Math.min(400, zoom));
        set({ zoom: clampedZoom });
    },
    zoomIn: () => {
        const { zoom } = get();
        const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400];
        const currentIndex = zoomLevels.findIndex(level => level >= zoom);
        const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
        const nextZoom = zoomLevels[nextIndex];
        if (nextZoom !== undefined) {
            set({ zoom: nextZoom });
        }
    },
    zoomOut: () => {
        const { zoom } = get();
        const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400];
        const currentIndex = zoomLevels.findIndex(level => level >= zoom);
        const prevIndex = Math.max(currentIndex - 1, 0);
        const prevZoom = zoomLevels[prevIndex];
        if (prevZoom !== undefined) {
            set({ zoom: prevZoom });
        }
    },
    zoomToFit: () => {
        // TODO: 根据元素范围计算合适的缩放级别
        set({ zoom: 100, panX: 0, panY: 0 });
    },
    // 平移控制
    setPan: (x, y) => {
        set({ panX: x, panY: y });
    },
    centerView: () => {
        set({ panX: 0, panY: 0 });
    },
    resetView: () => {
        set({ zoom: 100, panX: 0, panY: 0 });
    },
    // 显示选项
    setShowGrid: (show) => {
        set({ showGrid: show });
    },
    setShowRuler: (show) => {
        set({ showRuler: show });
    },
    setSnapToGrid: (snap) => {
        set({ snapToGrid: snap });
    },
    // 画布设置
    setBackgroundColor: (color) => {
        set({ backgroundColor: color });
    },
    setGridSize: (size) => {
        const clampedSize = Math.max(10, Math.min(100, size));
        set({ gridSize: clampedSize });
    },
    // 性能监控
    updatePerformanceMetrics: (fps, memory, objectCount = 0) => {
        set({ fps, memoryUsage: memory, objectCount });
    },
    // 预设操作
    applyPreset: (presetKey) => {
        const preset = SIMPLE_GAME_ASSET_PRESETS[presetKey];
        if (preset) {
            // 对于无限画布，预设主要用于参考尺寸
            console.log(`应用预设: ${preset.name} (${preset.width}x${preset.height})`);
        }
    },
    getPresetList: () => {
        return Object.entries(SIMPLE_GAME_ASSET_PRESETS).map(([key, preset]) => ({
            key,
            name: preset.name,
            width: preset.width,
            height: preset.height
        }));
    },
}), {
    name: 'infinite-canvas-store',
}));
//# sourceMappingURL=canvasStore.js.map