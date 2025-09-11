import { isWindows } from '@g-asset-forge/common';

// 工具栏配置
export const TOOLBAR_CONFIG = {
  ICON_SIZE: 30, // 工具图标大小
  DROPDOWN_ARROW_SIZE: 30, // 下拉箭头大小
} as const;

// 工具分类配置
export const TOOL_CATEGORIES = [
  {
    id: 'navigation',
    name: '移动工具',
    defaultTool: 'select',
    tools: [
      { id: 'select', name: '移动', hotkey: 'V', icon: 'icon.24.move' },
      { id: 'dragCanvas', name: '抓手', hotkey: 'H', icon: 'icon.24.hand' },
      { id: 'zoom', name: '缩放', hotkey: 'K', icon: 'icon.24.scale' },
    ],
  },
  {
    id: 'frame',
    name: '区域工具',
    defaultTool: 'drawFrame',
    tools: [
      { id: 'drawFrame', name: '画框', hotkey: 'F', icon: 'icon.24.frame' },
      { id: 'slice', name: '切片', hotkey: 'S', icon: 'icon.24.slice' },
      {
        id: 'section',
        name: '分区',
        hotkey: 'Shift+S',
        icon: 'icon.24.section',
      },
    ],
  },
  {
    id: 'shapes',
    name: '形状工具',
    defaultTool: 'drawRect',
    tools: [
      { id: 'drawRect', name: '矩形', hotkey: 'R', icon: 'icon.24.rectangle' },
      { id: 'drawLine', name: '直线', hotkey: 'L', icon: 'icon.24.line' },
      {
        id: 'drawArrow',
        name: '箭头',
        hotkey: 'Shift+L',
        icon: 'icon.24.arrow',
      },
      { id: 'drawEllipse', name: '椭圆', hotkey: 'O', icon: 'icon.24.ellipse' },
      {
        id: 'drawRegularPolygon',
        name: '多边形',
        hotkey: 'P',
        icon: 'icon.24.polygon',
      },
      { id: 'drawStar', name: '星形', hotkey: 'Shift+P', icon: 'icon.24.star' },
      { id: 'drawImg', name: '图片', hotkey: 'I', icon: 'icon.24.image' },
    ],
  },
  {
    id: 'drawing',
    name: '绘制工具',
    defaultTool: 'pen',
    tools: [
      { id: 'pen', name: '钢笔', hotkey: 'P', icon: 'icon.24.pen' },
      {
        id: 'pencil',
        name: '铅笔',
        hotkey: `${isWindows() ? 'Shift+' : '⇧'}P`,
        icon: 'icon.24.pencil',
      },
    ],
  },
  {
    id: 'text',
    name: '文本工具',
    defaultTool: 'drawText',
    tools: [
      { id: 'drawText', name: '文本', hotkey: 'T', icon: 'icon.24.text' },
    ],
  },
];

// 工具国际化ID映射
export const TOOL_INTL_IDS: Record<string, string> = {
  select: 'tool.select',
  dragCanvas: 'tool.hand',
  zoom: 'tool.zoom',
  drawFrame: 'tool.frame',
  slice: 'tool.slice',
  section: 'tool.section',
  drawRect: 'tool.rectangle',
  drawLine: 'tool.line',
  drawArrow: 'tool.arrow',
  drawEllipse: 'tool.ellipse',
  drawRegularPolygon: 'tool.polygon',
  drawStar: 'tool.star',
  drawImg: 'tool.image',
  pen: 'tool.pen',
  pencil: 'tool.pencil',
  drawText: 'tool.text',
};

// 根据工具ID获取工具信息
export const getToolInfo = (toolId: string) => {
  for (const category of TOOL_CATEGORIES) {
    const tool = category.tools.find((t) => t.id === toolId);
    if (tool) {
      return {
        ...tool,
        categoryId: category.id,
        categoryName: category.name,
        intlId: TOOL_INTL_IDS[toolId] || `tool.${toolId}`,
      };
    }
  }
  return null;
};

// 根据工具ID获取分类信息
export const getCategoryByToolId = (toolId: string) => {
  return TOOL_CATEGORIES.find((category) =>
    category.tools.some((tool) => tool.id === toolId),
  );
};
