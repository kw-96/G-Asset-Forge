import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import PerformanceMonitor from '../Performance/PerformanceMonitor';
import './CanvasPerformanceOverlay.less';
const CanvasPerformanceOverlay = () => {
    const [showMonitor, setShowMonitor] = useState(false);
    return (_jsxs("div", { className: "canvas-performance-overlay", children: [!showMonitor && (_jsx(Tooltip, { title: "\u663E\u793A\u6027\u80FD\u76D1\u63A7", placement: "left", children: _jsx(Button, { type: "primary", shape: "circle", icon: _jsx(DashboardOutlined, {}), onClick: () => setShowMonitor(true), className: "performance-toggle" }) })), showMonitor && (_jsx(PerformanceMonitor, { visible: showMonitor, onClose: () => setShowMonitor(false) }))] }));
};
export default CanvasPerformanceOverlay;
//# sourceMappingURL=CanvasPerformanceOverlay.js.map