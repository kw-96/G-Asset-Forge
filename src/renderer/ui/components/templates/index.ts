/**
 * 模板组件统一导出
 * @description 由有机体、分子和原子组件组合而成的页面级模板组件
 */

// 布局模板
// export { FigmaMainLayout as MainLayout } from './Layout/MainLayout';

// 对话框模板
export { FigmaModal as Modal } from './Dialog/Modal';

// 重新导出类型
// export type { MainLayoutProps as FigmaMainLayoutProps } from './Layout/MainLayout';
export type { ModalProps as FigmaModalProps } from './Dialog/Modal';