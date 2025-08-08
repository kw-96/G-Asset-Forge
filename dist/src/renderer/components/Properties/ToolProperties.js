import { jsx as _jsx } from "react/jsx-runtime";
import { Typography } from 'antd';
const { Text } = Typography;
const ToolProperties = ({ tool }) => {
    const renderToolProperties = () => {
        switch (tool) {
            case 'select':
                return (_jsx("div", { children: _jsx(Text, { type: "secondary", children: "\u70B9\u51FB\u5E76\u62D6\u62FD\u9009\u62E9\u5BF9\u8C61\u3002\u6309\u4F4FShift\u952E\u53EF\u9009\u62E9\u591A\u4E2A\u5BF9\u8C61\u3002" }) }));
            case 'text':
                return (_jsx("div", { children: _jsx(Text, { type: "secondary", children: "\u70B9\u51FB\u753B\u5E03\u6DFB\u52A0\u6587\u672C\u3002\u9009\u4E2D\u6587\u672C\u65F6\uFF0C\u6587\u672C\u5C5E\u6027\u5C06\u5728\u6B64\u5904\u663E\u793A\u3002" }) }));
            case 'image':
                return (_jsx("div", { children: _jsx(Text, { type: "secondary", children: "\u70B9\u51FB\u4E0A\u4F20\u5E76\u6DFB\u52A0\u56FE\u7247\u5230\u753B\u5E03\u3002\u652F\u6301\u683C\u5F0F\uFF1APNG\u3001JPG\u3001GIF\u3002" }) }));
            case 'shape':
                return (_jsx("div", { children: _jsx(Text, { type: "secondary", children: "\u70B9\u51FB\u5E76\u62D6\u62FD\u521B\u5EFA\u5F62\u72B6\u3002\u9009\u4E2D\u5F62\u72B6\u65F6\uFF0C\u5F62\u72B6\u5C5E\u6027\u5C06\u5728\u6B64\u5904\u663E\u793A\u3002" }) }));
            case 'brush':
                return (_jsx("div", { children: _jsx(Text, { type: "secondary", children: "\u70B9\u51FB\u5E76\u62D6\u62FD\u4F7F\u7528\u753B\u7B14\u7ED8\u5236\u3002\u5728\u6B64\u5904\u8C03\u6574\u753B\u7B14\u5927\u5C0F\u548C\u900F\u660E\u5EA6\u3002" }) }));
            case 'crop':
                return (_jsx("div", { children: _jsx(Text, { type: "secondary", children: "\u9009\u62E9\u56FE\u7247\u5E76\u62D6\u62FD\u8FDB\u884C\u88C1\u526A\u3002\u70B9\u51FB\u5916\u90E8\u533A\u57DF\u5E94\u7528\u88C1\u526A\u3002" }) }));
            default:
                return (_jsx("div", { children: _jsx(Text, { type: "secondary", children: "\u9009\u62E9\u5DE5\u5177\u540E\uFF0C\u5DE5\u5177\u5C5E\u6027\u5C06\u5728\u6B64\u5904\u663E\u793A\u3002" }) }));
        }
    };
    return (_jsx("div", { style: { padding: '8px 0' }, children: renderToolProperties() }));
};
export default ToolProperties;
//# sourceMappingURL=ToolProperties.js.map