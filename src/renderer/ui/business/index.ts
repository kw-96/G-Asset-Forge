/**
 * 业务组件统一导出 - 应用特定的业务组件
 * @description 导出所有业务相关的组件，这些组件包含具体的业务逻辑
 * @author 开发团队
 */

// 这些导入仅用于导出验证，在生产环境中会被tree-shaking优化

// 应用级别组件
export { AppContainer } from './App';

// 画布相关组件 - CanvasWorkspace已废弃，使用SuikaCanvasComponent
// export { CanvasWorkspace } from './Canvas/CanvasWorkspace'; // 已删除

// 素材库相关组件
export { AssetLibraryPanel } from './AssetLibrary';

// 布局相关组件
export { FigmaToolbar } from './Layout/FigmaToolbar';

// 工具相关组件
export { ToolPanel } from './Tools/ToolPanel';

// 增强组件
export { EnhancedButton } from './Enhanced/EnhancedButton';

// 默认导出不再提供，使用具名导出
// export default {
//     App: AppContainer,
//     Canvas: CanvasWorkspace,
//     AssetLibrary: AssetLibraryPanel,
//     Layout: FigmaToolbar,
//     Tools: ToolPanel,
//     Enhanced: EnhancedButton,
// };