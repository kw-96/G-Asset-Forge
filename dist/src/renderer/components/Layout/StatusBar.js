import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styled from 'styled-components';
import { Badge } from '../../ui/components/Badge/Badge';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Progress } from '../../ui/components/Progress/Progress';
const StatusBarContainer = styled.div `
  height: 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
const StatusSection = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;
const StatusItem = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;
const PerformanceIndicator = styled.div `
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme, $level }) => {
    switch ($level) {
        case 'good': return theme.colors.success;
        case 'warning': return theme.colors.warning;
        case 'error': return theme.colors.error;
        default: return theme.colors.text.disabled;
    }
}};
`;
const Divider = styled.div `
  width: 1px;
  height: 16px;
  background: ${({ theme }) => theme.colors.border.default};
`;
const ProgressContainer = styled.div `
  width: 120px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;
export const StatusBar = () => {
    // 模拟状态数据
    const performanceData = {
        memory: 85, // MB
        fps: 60,
        cpu: 15, // %
    };
    const getPerformanceLevel = (value, thresholds) => {
        if (value <= thresholds[0])
            return 'good';
        if (value <= thresholds[1])
            return 'warning';
        return 'error';
    };
    const memoryLevel = getPerformanceLevel(performanceData.memory, [100, 200]);
    const fpsLevel = performanceData.fps >= 55 ? 'good' : performanceData.fps >= 30 ? 'warning' : 'error';
    const cpuLevel = getPerformanceLevel(performanceData.cpu, [30, 60]);
    return (_jsxs(StatusBarContainer, { children: [_jsxs(StatusSection, { children: [_jsxs(StatusItem, { children: [_jsx(Badge, { variant: "success", size: "sm", children: "\u5C31\u7EEA" }), _jsx("span", { children: "\u9009\u62E9\u5DE5\u5177\u5F00\u59CB\u521B\u4F5C" })] }), _jsx(Divider, {}), _jsx(StatusItem, { children: _jsx("span", { children: "\u753B\u5E03: 800\u00D7600" }) }), _jsx(StatusItem, { children: _jsx("span", { children: "\u7F29\u653E: 100%" }) }), _jsx(Divider, {}), _jsx(StatusItem, { children: _jsx("span", { children: "\u56FE\u5C42: 3" }) }), _jsx(StatusItem, { children: _jsx("span", { children: "\u9009\u4E2D: 1" }) })] }), _jsxs(StatusSection, { children: [false && (_jsxs(_Fragment, { children: [_jsxs(ProgressContainer, { children: [_jsx(Progress, { value: 65, size: "sm" }), _jsx("span", { children: "\u5BFC\u51FA\u4E2D..." })] }), _jsx(Divider, {})] })), _jsxs(StatusItem, { children: [_jsx(PerformanceIndicator, { "$level": memoryLevel }), _jsxs("span", { children: ["\u5185\u5B58: ", performanceData.memory, "MB"] })] }), _jsxs(StatusItem, { children: [_jsx(PerformanceIndicator, { "$level": fpsLevel }), _jsxs("span", { children: ["FPS: ", performanceData.fps] })] }), _jsxs(StatusItem, { children: [_jsx(PerformanceIndicator, { "$level": cpuLevel }), _jsxs("span", { children: ["CPU: ", performanceData.cpu, "%"] })] }), _jsx(Divider, {}), _jsx(StatusItem, { children: _jsx("span", { children: "Ctrl+Z \u64A4\u9500 | Ctrl+Y \u91CD\u505A | V \u9009\u62E9" }) }), _jsx(Divider, {}), _jsxs(StatusItem, { children: [_jsx(PerformanceIndicator, { "$level": "good" }), _jsx("span", { children: "\u5728\u7EBF" })] }), _jsx(IconButton, { variant: "ghost", size: "xs", icon: "\uD83C\uDF19", onClick: () => console.log('Toggle theme') })] })] }));
};
//# sourceMappingURL=StatusBar.js.map