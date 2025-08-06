import { BrushSettings } from './BrushTool';
import { CropSettings } from './CropTool';
/**
 * 工具默认配置
 */
export declare const TOOL_DEFAULTS: {
    brush: BrushSettings;
    crop: CropSettings;
};
/**
 * 工具快捷键映射
 */
export declare const TOOL_SHORTCUTS: {
    readonly select: "V";
    readonly hand: "H";
    readonly rectangle: "R";
    readonly ellipse: "O";
    readonly triangle: "Shift+T";
    readonly star: "Shift+S";
    readonly text: "T";
    readonly image: "Shift+I";
    readonly frame: "F";
    readonly brush: "B";
    readonly crop: "C";
};
/**
 * 工具分组配置
 */
export declare const TOOL_GROUPS: readonly [{
    readonly name: "selection";
    readonly label: "选择工具";
    readonly tools: readonly ["select", "hand"];
}, {
    readonly name: "shapes";
    readonly label: "形状工具";
    readonly tools: readonly ["rectangle", "ellipse", "triangle", "star"];
}, {
    readonly name: "content";
    readonly label: "内容工具";
    readonly tools: readonly ["text", "image", "frame"];
}, {
    readonly name: "drawing";
    readonly label: "绘制工具";
    readonly tools: readonly ["brush", "crop"];
}];
/**
 * 工具类型定义
 */
export type ToolType = keyof typeof TOOL_SHORTCUTS;
/**
 * 获取工具的快捷键
 */
export declare const getToolShortcut: (tool: ToolType) => string;
/**
 * 获取工具的默认设置
 */
export declare const getToolDefaults: (tool: "brush" | "crop") => BrushSettings | CropSettings;
//# sourceMappingURL=toolConfig.d.ts.map