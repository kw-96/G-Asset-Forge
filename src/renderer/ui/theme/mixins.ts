/**
 * 主题混合函数 - 统一导出入口
 * 
 * 这个文件作为混合函数的统一导出入口，避免 TypeScript 编译问题
 * 实际的实现分为两个文件：
 * - mixins.utils.ts: 纯 TypeScript 工具函数
 * - mixins.styled.ts: styled-components CSS-in-JS 实现
 */

// 导出类型定义
export type { Mixins } from './mixins.types';

// 导出工具函数版本（用于非 styled-components 场景）
export { mixinsUtils } from './mixins.utils';

// 导出 styled-components 版本（用于 CSS-in-JS）
export { mixins } from './mixins.styled';

// 默认导出 styled-components 版本（保持向后兼容）
export { default } from './mixins.styled';