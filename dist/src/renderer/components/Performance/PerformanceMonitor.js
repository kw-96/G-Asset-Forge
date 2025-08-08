import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, Progress, Alert, Button, Space, Tooltip } from 'antd';
import { DashboardOutlined, DatabaseOutlined, EyeOutlined, DeleteOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { useCanvasStore } from '../../stores/canvasStore';
import { memoryManager, MemoryEvent } from '../../engines/MemoryManager';
import './PerformanceMonitor.less';
const PerformanceMonitor = ({ visible = true, onClose }) => {
    const { fps, memoryUsage, objectCount } = useCanvasStore();
    const [performanceData, setPerformanceData] = useState({
        fps: 60,
        memoryUsage: 0,
        objectCount: 0,
        cacheSize: 0,
        lastGC: null,
        warnings: []
    });
    const [isMonitoring, setIsMonitoring] = useState(true);
    useEffect(() => {
        if (!isMonitoring)
            return;
        // Update performance data from store
        setPerformanceData(prev => ({
            ...prev,
            fps,
            memoryUsage,
            objectCount
        }));
        // Get memory manager stats
        const memoryStats = memoryManager.getMemoryStats();
        setPerformanceData(prev => ({
            ...prev,
            cacheSize: memoryStats.cacheSize,
            lastGC: memoryStats.lastGC
        }));
    }, [fps, memoryUsage, objectCount, isMonitoring]);
    useEffect(() => {
        // Listen to memory events
        const handleMemoryWarning = (stats) => {
            setPerformanceData(prev => ({
                ...prev,
                warnings: [...prev.warnings, `内存使用警告: ${stats.totalMemory.toFixed(1)}MB`]
            }));
        };
        const handleMemoryCritical = (stats) => {
            setPerformanceData(prev => ({
                ...prev,
                warnings: [...prev.warnings, `内存使用严重警告: ${stats.totalMemory.toFixed(1)}MB`]
            }));
        };
        const handleGarbageCollected = (stats) => {
            setPerformanceData(prev => ({
                ...prev,
                lastGC: stats.lastGC,
                warnings: prev.warnings.filter(w => !w.includes('内存使用'))
            }));
        };
        memoryManager.on(MemoryEvent.MEMORY_WARNING, handleMemoryWarning);
        memoryManager.on(MemoryEvent.MEMORY_CRITICAL, handleMemoryCritical);
        memoryManager.on(MemoryEvent.GARBAGE_COLLECTED, handleGarbageCollected);
        return () => {
            memoryManager.off(MemoryEvent.MEMORY_WARNING, handleMemoryWarning);
            memoryManager.off(MemoryEvent.MEMORY_CRITICAL, handleMemoryCritical);
            memoryManager.off(MemoryEvent.GARBAGE_COLLECTED, handleGarbageCollected);
        };
    }, []);
    const handleForceGC = () => {
        memoryManager.forceGarbageCollection();
    };
    const handleClearCache = () => {
        memoryManager.clearAll();
        setPerformanceData(prev => ({
            ...prev,
            cacheSize: 0,
            warnings: []
        }));
    };
    const handleClearWarnings = () => {
        setPerformanceData(prev => ({
            ...prev,
            warnings: []
        }));
    };
    const getFPSStatus = () => {
        if (performanceData.fps >= 55)
            return 'success';
        if (performanceData.fps >= 30)
            return 'normal';
        return 'exception';
    };
    const getMemoryStatus = () => {
        if (performanceData.memoryUsage <= 50)
            return 'success';
        if (performanceData.memoryUsage <= 80)
            return 'normal';
        return 'exception';
    };
    const formatLastGC = () => {
        if (!performanceData.lastGC)
            return '从未执行';
        const now = new Date();
        const diff = now.getTime() - performanceData.lastGC.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        if (minutes > 0) {
            return `${minutes}分${seconds}秒前`;
        }
        return `${seconds}秒前`;
    };
    if (!visible)
        return null;
    return (_jsx("div", { className: "performance-monitor", children: _jsxs(Card, { title: _jsxs(Space, { children: [_jsx(DashboardOutlined, {}), "\u6027\u80FD\u76D1\u63A7", _jsx(Button, { type: "text", size: "small", onClick: () => setIsMonitoring(!isMonitoring), style: { marginLeft: 'auto' }, children: isMonitoring ? '暂停' : '开始' }), onClose && (_jsx(Button, { type: "text", size: "small", onClick: onClose, children: "\u00D7" }))] }), size: "small", className: "performance-card", children: [_jsxs("div", { className: "metric-section", children: [_jsxs("div", { className: "metric-header", children: [_jsx(EyeOutlined, {}), _jsx("span", { children: "\u5E27\u7387 (FPS)" }), _jsx("span", { className: `metric-value ${getFPSStatus()}`, children: performanceData.fps })] }), _jsx(Progress, { percent: Math.min((performanceData.fps / 60) * 100, 100), status: getFPSStatus(), size: "small", showInfo: false }), _jsxs("div", { className: "metric-info", children: ["\u76EE\u6807: 60 FPS | \u5F53\u524D: ", performanceData.fps, " FPS"] })] }), _jsxs("div", { className: "metric-section", children: [_jsxs("div", { className: "metric-header", children: [_jsx(DatabaseOutlined, {}), _jsx("span", { children: "\u5185\u5B58\u4F7F\u7528" }), _jsxs("span", { className: `metric-value ${getMemoryStatus()}`, children: [performanceData.memoryUsage.toFixed(1), "MB"] })] }), _jsx(Progress, { percent: Math.min((performanceData.memoryUsage / 100) * 100, 100), status: getMemoryStatus(), size: "small", showInfo: false }), _jsxs("div", { className: "metric-info", children: ["\u9650\u5236: 100MB | \u7F13\u5B58: ", performanceData.cacheSize.toFixed(1), "MB"] })] }), _jsxs("div", { className: "metric-section", children: [_jsxs("div", { className: "metric-header", children: [_jsx("span", { children: "\u5BF9\u8C61\u6570\u91CF" }), _jsx("span", { className: "metric-value", children: performanceData.objectCount })] }), _jsx("div", { className: "metric-info", children: "\u753B\u5E03\u4E2D\u7684\u5BF9\u8C61\u603B\u6570" })] }), _jsxs("div", { className: "metric-section", children: [_jsxs("div", { className: "metric-header", children: [_jsx("span", { children: "\u5783\u573E\u56DE\u6536" }), _jsx("span", { className: "metric-value", children: formatLastGC() })] }), _jsxs(Space, { size: "small", style: { marginTop: 8 }, children: [_jsx(Tooltip, { title: "\u5F3A\u5236\u6267\u884C\u5783\u573E\u56DE\u6536", children: _jsx(Button, { size: "small", icon: _jsx(DeleteOutlined, {}), onClick: handleForceGC, children: "\u5F3A\u5236GC" }) }), _jsx(Tooltip, { title: "\u6E05\u7A7A\u6240\u6709\u7F13\u5B58", children: _jsx(Button, { size: "small", icon: _jsx(ReloadOutlined, {}), onClick: handleClearCache, children: "\u6E05\u7A7A\u7F13\u5B58" }) })] })] }), performanceData.warnings.length > 0 && (_jsxs("div", { className: "warnings-section", children: [_jsxs("div", { className: "warnings-header", children: [_jsx(WarningOutlined, {}), _jsx("span", { children: "\u6027\u80FD\u8B66\u544A" }), _jsx(Button, { type: "text", size: "small", onClick: handleClearWarnings, style: { marginLeft: 'auto' }, children: "\u6E05\u9664" })] }), performanceData.warnings.slice(-3).map((warning, index) => (_jsx(Alert, { message: warning, type: "warning", showIcon: true, style: { marginBottom: 4 } }, index)))] })), _jsxs("div", { className: "suggestions-section", children: [_jsx("div", { className: "suggestions-header", children: "\u6027\u80FD\u5EFA\u8BAE" }), _jsxs("ul", { className: "suggestions-list", children: [performanceData.fps < 30 && (_jsx("li", { children: "\u5E27\u7387\u8FC7\u4F4E\uFF0C\u8003\u8651\u51CF\u5C11\u753B\u5E03\u5BF9\u8C61\u6570\u91CF\u6216\u964D\u4F4E\u6E32\u67D3\u8D28\u91CF" })), performanceData.memoryUsage > 80 && (_jsx("li", { children: "\u5185\u5B58\u4F7F\u7528\u8FC7\u9AD8\uFF0C\u5EFA\u8BAE\u6267\u884C\u5783\u573E\u56DE\u6536\u6216\u6E05\u7A7A\u7F13\u5B58" })), performanceData.objectCount > 1000 && (_jsx("li", { children: "\u5BF9\u8C61\u6570\u91CF\u8FC7\u591A\uFF0C\u8003\u8651\u4F7F\u7528\u5BF9\u8C61\u6C60\u6216\u5206\u7EC4\u7BA1\u7406" })), performanceData.cacheSize > 30 && (_jsx("li", { children: "\u7F13\u5B58\u5360\u7528\u8FC7\u591A\uFF0C\u5EFA\u8BAE\u6E05\u7406\u4E0D\u5FC5\u8981\u7684\u7EB9\u7406\u7F13\u5B58" })), performanceData.warnings.length === 0 &&
                                    performanceData.fps >= 55 &&
                                    performanceData.memoryUsage <= 50 && (_jsx("li", { style: { color: '#52c41a' }, children: "\u6027\u80FD\u72B6\u6001\u826F\u597D" }))] })] })] }) }));
};
export default PerformanceMonitor;
//# sourceMappingURL=PerformanceMonitor.js.map