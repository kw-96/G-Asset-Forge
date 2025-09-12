/**
 * 组件系统类型定义
 * 定义组件系统的核心数据结构和接口
 */

import { GraphicsType } from '../type';

/**
 * 组件定义接口
 * 描述一个完整的组件，包含其结构和元数据
 */
export interface ComponentDefinition {
  /** 组件唯一标识符 */
  id: string;
  /** 组件名称 */
  name: string;
  /** 组件描述 */
  description: string;
  /** 组件版本 */
  version: string;
  /** 组件作者 */
  author?: string;
  /** 组件标签 */
  tags: string[];

  /** 组件图标（SVG路径或图标名称） */
  icon: string;
  /** 组件预览图 */
  thumbnail?: string;

  /** 组件根元素定义 */
  rootElement: GraphicsElementDefinition;
  /** 组件参数列表 */
  parameters: ComponentParameter[];

  /** 创建时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
}

/**
 * 图形元素定义接口
 * 描述组件中单个图形元素的结构
 */
export interface GraphicsElementDefinition {
  /** 图形类型 */
  type: GraphicsType | string;
  /** 元素唯一标识符 */
  id: string;
  /** 元素属性 */
  attrs: Record<string, any>;
  /** 子元素列表 */
  children?: GraphicsElementDefinition[];
  /** 元素约束条件 */
  constraints?: ElementConstraint[];
  /** 元素名称 */
  name?: string;
}

/**
 * 组件参数接口
 * 定义组件的可配置参数
 */
export interface ComponentParameter {
  /** 参数名称 */
  name: string;
  /** 参数显示名称 */
  displayName: string;
  /** 参数类型 */
  type: ParameterType;
  /** 参数描述 */
  description?: string;
  /** 默认值 */
  defaultValue?: any;
  /** 参数值 */
  value?: any;
  /** 是否必需 */
  required?: boolean;
  /** 目标元素ID */
  targetElementId?: string;
  /** 目标属性名 */
  targetProperty?: string;
}

/**
 * 元素约束接口
 * 定义元素的位置、大小等约束条件
 */
export interface ElementConstraint {
  /** 约束类型 */
  type: ConstraintType;
  /** 约束值 */
  value: number | string;
  /** 约束目标 */
  target?: string;
}

/**
 * 参数类型枚举
 */
export enum ParameterType {
  /** 文本 */
  TEXT = 'text',
  /** 数字 */
  NUMBER = 'number',
  /** 布尔值 */
  BOOLEAN = 'boolean',
  /** 颜色 */
  COLOR = 'color',
  /** 选择 */
  SELECT = 'select',
  /** 图片 */
  IMAGE = 'image',
}

/**
 * 约束类型枚举
 */
export enum ConstraintType {
  /** 位置约束 */
  POSITION = 'position',
  /** 大小约束 */
  SIZE = 'size',
  /** 比例约束 */
  ASPECT_RATIO = 'aspect_ratio',
  /** 对齐约束 */
  ALIGNMENT = 'alignment',
  /** 间距约束 */
  SPACING = 'spacing',
}

/**
 * 组件管理器接口
 */
export interface IComponentManager {
  /** 注册组件 */
  registerComponent(component: ComponentDefinition): Promise<void>;
  /** 注销组件 */
  unregisterComponent(componentId: string): Promise<void>;
  /** 获取组件 */
  getComponent(componentId: string): Promise<ComponentDefinition | null>;
  /** 获取所有组件 */
  getAllComponents(): Promise<ComponentDefinition[]>;
  /** 更新组件 */
  updateComponent(component: ComponentDefinition): Promise<void>;
  /** 删除组件 */
  deleteComponent(componentId: string): Promise<void>;
  /** 复制组件 */
  duplicateComponent(
    componentId: string,
    newName?: string,
  ): Promise<ComponentDefinition>;
  /** 导出组件 */
  exportComponent(componentId: string): Promise<string>;
  /** 导入组件 */
  importComponent(componentData: string): Promise<ComponentDefinition>;
}
