/**
 * 工具默认配置
 */
export const TOOL_DEFAULTS = {
    brush: {
        size: 10,
        opacity: 1,
        color: '#000000',
        hardness: 0.8
    },
    crop: {
        maintainAspectRatio: false,
        minWidth: 10,
        minHeight: 10
    }
};
/**
 * 工具快捷键映射
 */
export const TOOL_SHORTCUTS = {
    select: 'V',
    hand: 'H',
    rectangle: 'R',
    ellipse: 'O',
    triangle: 'Shift+T',
    star: 'Shift+S',
    text: 'T',
    image: 'Shift+I',
    frame: 'F',
    brush: 'B',
    crop: 'C'
};
/**
 * 工具分组配置
 */
export const TOOL_GROUPS = [
    {
        name: 'selection',
        label: '选择工具',
        tools: ['select', 'hand']
    },
    {
        name: 'shapes',
        label: '形状工具',
        tools: ['rectangle', 'ellipse', 'triangle', 'star']
    },
    {
        name: 'content',
        label: '内容工具',
        tools: ['text', 'image', 'frame']
    },
    {
        name: 'drawing',
        label: '绘制工具',
        tools: ['brush', 'crop']
    }
];
/**
 * 获取工具的快捷键
 */
export const getToolShortcut = (tool) => {
    return TOOL_SHORTCUTS[tool];
};
/**
 * 获取工具的默认设置
 */
export const getToolDefaults = (tool) => {
    return TOOL_DEFAULTS[tool];
};
//# sourceMappingURL=toolConfig.js.map