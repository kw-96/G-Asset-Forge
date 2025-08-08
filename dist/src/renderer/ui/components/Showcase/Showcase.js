import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * UI组件展示页面
 * 用于开发和测试所有UI组件
 */
import { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Dropdown, DropdownItem, Slider, Switch, Progress, Tooltip, IconButton, } from '../index';
import { colors, spacing } from '../../theme/tokens';
const ShowcaseContainer = styled.div `
  padding: ${({ theme }) => theme.spacing['2xl']};
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surface} 100%);
  min-height: 100vh;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 20%, ${({ theme }) => theme.colors.primary}08 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, ${({ theme }) => theme.colors.accent}08 0%, transparent 50%);
    pointer-events: none;
  }
`;
const ShowcaseTitle = styled.h1 `
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
    border-radius: 2px;
  }
`;
const Section = styled.section `
  margin-bottom: ${spacing[8]};
`;
const SectionTitle = styled.h2 `
  font-size: 24px;
  font-weight: 600;
  color: ${colors.neutral[800]};
  margin-bottom: ${spacing[4]};
  border-bottom: 2px solid ${colors.primary[500]};
  padding-bottom: ${spacing[2]};
`;
const ComponentGrid = styled.div `
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing[4]};
`;
const ComponentDemo = styled(Card) `
  padding: ${spacing[4]};
`;
const DemoTitle = styled.h3 `
  font-size: 16px;
  font-weight: 600;
  color: ${colors.neutral[700]};
  margin-bottom: ${spacing[3]};
`;
const DemoContent = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]};
`;
const DemoRow = styled.div `
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  flex-wrap: wrap;
`;
const ProgressInfo = styled.div `
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
`;
export const Showcase = () => {
    const [sliderValue, setSliderValue] = useState(50);
    const [switchValue, setSwitchValue] = useState(false);
    const [progressValue, setProgressValue] = useState(75);
    const [inputValue, setInputValue] = useState('');
    return (_jsxs(ShowcaseContainer, { children: [_jsx(ShowcaseTitle, { children: "G-Asset Forge UI \u7EC4\u4EF6\u5E93" }), _jsxs(Section, { children: [_jsx(SectionTitle, { children: "\u6309\u94AE\u7EC4\u4EF6 (Buttons)" }), _jsxs(ComponentGrid, { children: [_jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u6309\u94AE\u53D8\u4F53" }), _jsxs(DemoContent, { children: [_jsxs(DemoRow, { children: [_jsx(Button, { variant: "primary", children: "\u4E3B\u8981\u6309\u94AE" }), _jsx(Button, { variant: "secondary", children: "\u6B21\u8981\u6309\u94AE" }), _jsx(Button, { variant: "outline", children: "\u8F6E\u5ED3\u6309\u94AE" })] }), _jsxs(DemoRow, { children: [_jsx(Button, { variant: "ghost", children: "\u5E7D\u7075\u6309\u94AE" }), _jsx(Button, { variant: "danger", children: "\u5371\u9669\u6309\u94AE" }), _jsx(Button, { disabled: true, children: "\u7981\u7528\u6309\u94AE" })] })] })] }), _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u6309\u94AE\u5C3A\u5BF8" }), _jsx(DemoContent, { children: _jsxs(DemoRow, { children: [_jsx(Button, { size: "xs", children: "\u8D85\u5C0F" }), _jsx(Button, { size: "sm", children: "\u5C0F" }), _jsx(Button, { size: "md", children: "\u4E2D" }), _jsx(Button, { size: "lg", children: "\u5927" })] }) })] }), _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u6309\u94AE\u72B6\u6001" }), _jsx(DemoContent, { children: _jsxs(DemoRow, { children: [_jsx(Button, { loading: true, children: "\u52A0\u8F7D\u4E2D" }), _jsx(Button, { icon: _jsx("span", { children: "\uD83D\uDCC1" }), children: "\u5E26\u56FE\u6807" }), _jsx(Button, { fullWidth: true, children: "\u5168\u5BBD\u6309\u94AE" })] }) })] })] })] }), _jsxs(Section, { children: [_jsx(SectionTitle, { children: "\u8F93\u5165\u7EC4\u4EF6 (Inputs)" }), _jsxs(ComponentGrid, { children: [_jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u8F93\u5165\u6846" }), _jsxs(DemoContent, { children: [_jsx(Input, { placeholder: "\u57FA\u7840\u8F93\u5165\u6846", value: inputValue, onChange: (e) => setInputValue(e.target.value) }), _jsx(Input, { placeholder: "\u5E26\u6807\u7B7E\u7684\u8F93\u5165\u6846", label: "\u9879\u76EE\u540D\u79F0", helperText: "\u8BF7\u8F93\u5165\u9879\u76EE\u540D\u79F0" }), _jsx(Input, { placeholder: "\u9519\u8BEF\u72B6\u6001", error: true, helperText: "\u8FD9\u662F\u9519\u8BEF\u4FE1\u606F" })] })] }), _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u6ED1\u5757" }), _jsxs(DemoContent, { children: [_jsx(Slider, { value: [sliderValue], onValueChange: (value) => setSliderValue(value[0] || 0), label: "\u900F\u660E\u5EA6" }), _jsx(Slider, { value: [25], onValueChange: () => { }, min: 0, max: 100, step: 5, label: "\u753B\u7B14\u5927\u5C0F", disabled: true })] })] }), _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u5F00\u5173" }), _jsxs(DemoContent, { children: [_jsx(Switch, { checked: switchValue, onCheckedChange: setSwitchValue, label: "\u542F\u7528\u7F51\u683C", description: "\u663E\u793A\u753B\u5E03\u7F51\u683C\u7EBF" }), _jsx(Switch, { checked: true, onCheckedChange: () => { }, label: "\u81EA\u52A8\u4FDD\u5B58", disabled: true })] })] })] })] }), _jsxs(Section, { children: [_jsx(SectionTitle, { children: "\u53CD\u9988\u7EC4\u4EF6 (Feedback)" }), _jsxs(ComponentGrid, { children: [_jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u5FBD\u7AE0" }), _jsxs(DemoContent, { children: [_jsxs(DemoRow, { children: [_jsx(Badge, { children: "\u9ED8\u8BA4" }), _jsx(Badge, { variant: "primary", children: "\u4E3B\u8981" }), _jsx(Badge, { variant: "success", children: "\u6210\u529F" }), _jsx(Badge, { variant: "warning", children: "\u8B66\u544A" }), _jsx(Badge, { variant: "error", children: "\u9519\u8BEF" })] }), _jsxs(DemoRow, { children: [_jsx(Badge, { size: "sm", children: "\u5C0F\u5FBD\u7AE0" }), _jsx(Badge, { size: "md", children: "\u4E2D\u5FBD\u7AE0" }), _jsx(Badge, { size: "lg", children: "\u5927\u5FBD\u7AE0" })] }), _jsxs(DemoRow, { children: [_jsx(Badge, { dot: true, variant: "success" }), _jsx(Badge, { dot: true, variant: "error" }), _jsx(Badge, { dot: true, variant: "warning" })] })] })] }), _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u8FDB\u5EA6\u6761" }), _jsxs(DemoContent, { children: [_jsx(Progress, { value: progressValue, showValue: true, label: "\u5BFC\u51FA\u8FDB\u5EA6" }), _jsx(Progress, { value: 30, variant: "success" }), _jsx(Progress, { value: 60, variant: "warning" }), _jsx(Progress, { value: 80, variant: "error" }), _jsx(Progress, { label: "\u5904\u7406\u4E2D..." })] })] }), _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u5DE5\u5177\u63D0\u793A" }), _jsx(DemoContent, { children: _jsxs(DemoRow, { children: [_jsx(Tooltip, { content: "\u8FD9\u662F\u4E00\u4E2A\u5DE5\u5177\u63D0\u793A", children: _jsx(Button, { children: "\u60AC\u505C\u67E5\u770B\u63D0\u793A" }) }), _jsx(Tooltip, { content: "\u4FDD\u5B58\u5F53\u524D\u9879\u76EE", side: "top", children: _jsx(IconButton, { icon: "\uD83D\uDCBE" }) })] }) })] })] })] }), _jsxs(Section, { children: [_jsx(SectionTitle, { children: "\u5BFC\u822A\u7EC4\u4EF6 (Navigation)" }), _jsx(ComponentGrid, { children: _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u4E0B\u62C9\u83DC\u5355" }), _jsx(DemoContent, { children: _jsxs(DemoRow, { children: [_jsxs(Dropdown, { trigger: _jsx(Button, { variant: "outline", children: "\u6587\u4EF6\u83DC\u5355" }), children: [_jsx(DropdownItem, { children: "\uD83D\uDCC1 \u65B0\u5EFA\u9879\u76EE" }), _jsx(DropdownItem, { children: "\uD83D\uDCBE \u4FDD\u5B58\u9879\u76EE" }), _jsx(DropdownItem, { children: "\uD83D\uDCE4 \u5BFC\u51FA\u56FE\u50CF" }), _jsx(DropdownItem, { destructive: true, children: "\uD83D\uDDD1\uFE0F \u5220\u9664\u9879\u76EE" })] }), _jsxs(Dropdown, { trigger: _jsx(Button, { variant: "ghost", children: "\u5DE5\u5177" }), side: "bottom", align: "end", children: [_jsx(DropdownItem, { children: "\u9009\u62E9\u5DE5\u5177" }), _jsx(DropdownItem, { children: "\u753B\u7B14\u5DE5\u5177" }), _jsx(DropdownItem, { children: "\u6587\u672C\u5DE5\u5177" }), _jsx(DropdownItem, { disabled: true, children: "\u5F62\u72B6\u5DE5\u5177 (\u5373\u5C06\u63A8\u51FA)" })] })] }) })] }) })] }), _jsxs(Section, { children: [_jsx(SectionTitle, { children: "\u5E03\u5C40\u7EC4\u4EF6 (Layout)" }), _jsx(ComponentGrid, { children: _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u5361\u7247\u7EC4\u4EF6" }), _jsx(DemoContent, { children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u9879\u76EE\u8BBE\u7F6E" }) }), _jsxs(CardContent, { children: [_jsx("p", { children: "\u8FD9\u662F\u4E00\u4E2A\u57FA\u7840\u5361\u7247\u7EC4\u4EF6\u7684\u793A\u4F8B\u5185\u5BB9\u3002" }), _jsxs(DemoRow, { children: [_jsx(Button, { size: "sm", children: "\u786E\u8BA4" }), _jsx(Button, { variant: "outline", size: "sm", children: "\u53D6\u6D88" })] })] })] }) })] }) })] }), _jsxs(Section, { children: [_jsx(SectionTitle, { children: "\u4EA4\u4E92\u6F14\u793A" }), _jsx(ComponentGrid, { children: _jsxs(ComponentDemo, { children: [_jsx(DemoTitle, { children: "\u7EFC\u5408\u793A\u4F8B" }), _jsxs(DemoContent, { children: [_jsxs(ProgressInfo, { children: [_jsx("span", { children: "\u8FDB\u5EA6:" }), _jsxs(Badge, { variant: "info", children: [progressValue, "%"] })] }), _jsx(Slider, { value: [progressValue], onValueChange: (value) => setProgressValue(value[0] || 0), label: "\u8C03\u6574\u8FDB\u5EA6" }), _jsx(Progress, { value: progressValue, variant: "default", showValue: true }), _jsxs(DemoRow, { children: [_jsx(Button, { onClick: () => setProgressValue(Math.max(0, progressValue - 10)), disabled: progressValue <= 0, children: "\u51CF\u5C11" }), _jsx(Button, { onClick: () => setProgressValue(Math.min(100, progressValue + 10)), disabled: progressValue >= 100, children: "\u589E\u52A0" }), _jsx(Button, { variant: "outline", onClick: () => setProgressValue(0), children: "\u91CD\u7F6E" })] })] })] }) })] })] }));
};
export default Showcase;
//# sourceMappingURL=Showcase.js.map