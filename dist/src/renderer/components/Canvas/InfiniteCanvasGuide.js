import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IconButton } from '../../ui';
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';
const GuideOverlay = styled.div `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;
const GuidePanel = styled.div `
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
`;
const GuideTitle = styled.h2 `
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
`;
const GuideContent = styled.div `
  color: #475569;
  line-height: 1.6;
`;
const GuideSection = styled.div `
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;
const GuideSubtitle = styled.h3 `
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
`;
const GuideList = styled.ul `
  margin: 0;
  padding-left: 16px;
  
  li {
    margin-bottom: 4px;
    font-size: 13px;
  }
`;
const CloseButton = styled(IconButton) `
  position: absolute;
  top: 12px;
  right: 12px;
`;
const GuideToggle = styled(IconButton) `
  position: absolute;
  top: 16px;
  right: 140px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  z-index: 100;
`;
const InfiniteCanvasGuide = ({ className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);
    // 首次访问时显示指南
    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('infinite-canvas-guide-seen');
        if (!hasSeenGuide && !hasShown) {
            setTimeout(() => {
                setIsVisible(true);
                setHasShown(true);
            }, 1000);
        }
    }, [hasShown]);
    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('infinite-canvas-guide-seen', 'true');
    };
    const handleToggle = () => {
        setIsVisible(!isVisible);
    };
    return (_jsxs(_Fragment, { children: [_jsx(GuideToggle, { icon: _jsx(InfoCircledIcon, {}), onClick: handleToggle, variant: "ghost", size: "sm", className: className, title: "\u65E0\u9650\u753B\u5E03\u4F7F\u7528\u6307\u5357" }), _jsx(GuideOverlay, { "$visible": isVisible, children: _jsxs(GuidePanel, { children: [_jsx(CloseButton, { icon: _jsx(Cross2Icon, {}), onClick: handleClose, variant: "ghost", size: "sm" }), _jsx(GuideTitle, { children: "\uD83C\uDFA8 \u65E0\u9650\u753B\u5E03\u4F7F\u7528\u6307\u5357" }), _jsxs(GuideContent, { children: [_jsxs(GuideSection, { children: [_jsx(GuideSubtitle, { children: "\u753B\u5E03\u5BFC\u822A" }), _jsxs(GuideList, { children: [_jsxs("li", { children: [_jsx("strong", { children: "\u62D6\u62FD\u79FB\u52A8" }), ": \u6309\u4F4F\u9F20\u6807\u5DE6\u952E\u62D6\u62FD\u753B\u5E03"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u7F29\u653E" }), ": \u6EDA\u8F6E\u7F29\u653E\uFF0C\u6216\u4F7F\u7528\u5DE5\u5177\u680F\u7F29\u653E\u6309\u94AE"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u53CC\u51FB\u91CD\u7F6E" }), ": \u53CC\u51FB\u7A7A\u767D\u533A\u57DF\u56DE\u5230\u539F\u70B9"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u6293\u624B\u5DE5\u5177 (H)" }), ": \u4E13\u95E8\u7684\u753B\u5E03\u79FB\u52A8\u5DE5\u5177"] })] })] }), _jsxs(GuideSection, { children: [_jsx(GuideSubtitle, { children: "\u521B\u5EFA\u5BF9\u8C61" }), _jsxs(GuideList, { children: [_jsxs("li", { children: [_jsx("strong", { children: "\u5F62\u72B6\u5DE5\u5177" }), ": \u9009\u62E9\u5DE5\u5177\u540E\u70B9\u51FB\u753B\u5E03\u521B\u5EFA"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u753B\u7B14\u5DE5\u5177 (B)" }), ": \u81EA\u7531\u7ED8\u5236"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u6587\u672C\u5DE5\u5177 (T)" }), ": \u6DFB\u52A0\u6587\u672C"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u88C1\u526A\u5DE5\u5177 (C)" }), ": \u88C1\u526A\u9009\u4E2D\u5BF9\u8C61"] })] })] }), _jsxs(GuideSection, { children: [_jsx(GuideSubtitle, { children: "\u89C6\u56FE\u63A7\u5236" }), _jsxs(GuideList, { children: [_jsxs("li", { children: [_jsx("strong", { children: "\u7F51\u683C\u663E\u793A" }), ": \u5E2E\u52A9\u5BF9\u9F50\u548C\u5B9A\u4F4D"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u5C0F\u5730\u56FE" }), ": \u53F3\u4E0B\u89D2\u663E\u793A\u6574\u4F53\u5E03\u5C40"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u7F29\u653E\u6307\u793A\u5668" }), ": \u5DE6\u4E0A\u89D2\u663E\u793A\u5F53\u524D\u7F29\u653E\u7EA7\u522B"] }), _jsxs("li", { children: [_jsx("strong", { children: "\u5750\u6807\u539F\u70B9" }), ": \u7EA2\u8272\u5341\u5B57\u6807\u8BB0 (0,0) \u4F4D\u7F6E"] })] })] }), _jsxs(GuideSection, { children: [_jsx(GuideSubtitle, { children: "\u5FEB\u6377\u952E" }), _jsxs(GuideList, { children: [_jsxs("li", { children: [_jsx("strong", { children: "V" }), " - \u9009\u62E9\u5DE5\u5177 | ", _jsx("strong", { children: "H" }), " - \u6293\u624B\u5DE5\u5177"] }), _jsxs("li", { children: [_jsx("strong", { children: "R" }), " - \u77E9\u5F62 | ", _jsx("strong", { children: "O" }), " - \u692D\u5706 | ", _jsx("strong", { children: "T" }), " - \u6587\u672C"] }), _jsxs("li", { children: [_jsx("strong", { children: "B" }), " - \u753B\u7B14 | ", _jsx("strong", { children: "C" }), " - \u88C1\u526A"] }), _jsxs("li", { children: [_jsx("strong", { children: "Escape" }), " - \u53D6\u6D88\u9009\u62E9"] })] })] })] })] }) })] }));
};
export default InfiniteCanvasGuide;
//# sourceMappingURL=InfiniteCanvasGuide.js.map