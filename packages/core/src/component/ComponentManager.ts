/**
 * 组件管理器
 * 负责组件的注册、存储、检索和管理
 */

import { ComponentStorage } from './ComponentStorage';
import { ComponentDefinition, IComponentManager } from './ComponentTypes';

/**
 * 组件管理器实现类
 * 提供组件的完整生命周期管理
 */
export class ComponentManager implements IComponentManager {
  private componentStorage: ComponentStorage;

  constructor() {
    this.componentStorage = new ComponentStorage();
  }

  /**
   * 注册组件
   */
  async registerComponent(component: ComponentDefinition): Promise<void> {
    // 验证组件定义
    if (!this.validateComponentDefinition(component)) {
      throw new Error(`无效的组件定义: ${component.id}`);
    }

    // 检查组件是否已存在
    const existingComponent = await this.componentStorage.loadComponent(
      component.id,
    );
    if (existingComponent) {
      throw new Error(`组件已存在: ${component.id}`);
    }

    // 直接保存到网盘路径
    await this.componentStorage.saveComponent(component);
  }

  /**
   * 注销组件
   */
  async unregisterComponent(componentId: string): Promise<void> {
    const existingComponent = await this.componentStorage.loadComponent(
      componentId,
    );
    if (!existingComponent) {
      throw new Error(`组件不存在: ${componentId}`);
    }

    await this.componentStorage.deleteComponent(componentId);
  }

  /**
   * 获取组件
   */
  async getComponent(componentId: string): Promise<ComponentDefinition | null> {
    return await this.componentStorage.loadComponent(componentId);
  }

  /**
   * 获取所有组件
   */
  async getAllComponents(): Promise<ComponentDefinition[]> {
    return await this.componentStorage.getAllComponents();
  }

  /**
   * 更新组件
   */
  async updateComponent(component: ComponentDefinition): Promise<void> {
    const existingComponent = await this.componentStorage.loadComponent(
      component.id,
    );
    if (!existingComponent) {
      throw new Error(`组件不存在: ${component.id}`);
    }

    // 验证组件定义
    if (!this.validateComponentDefinition(component)) {
      throw new Error(`无效的组件定义: ${component.id}`);
    }

    // 更新组件并保存到网盘路径
    const updatedComponent = {
      ...component,
      updatedAt: Date.now(),
    };
    await this.componentStorage.saveComponent(updatedComponent);
  }

  /**
   * 删除组件
   */
  async deleteComponent(componentId: string): Promise<void> {
    const existingComponent = await this.componentStorage.loadComponent(
      componentId,
    );
    if (!existingComponent) {
      throw new Error(`组件不存在: ${componentId}`);
    }

    await this.componentStorage.deleteComponent(componentId);
  }

  /**
   * 复制组件
   */
  async duplicateComponent(
    componentId: string,
    newName?: string,
  ): Promise<ComponentDefinition> {
    const originalComponent = await this.getComponent(componentId);
    if (!originalComponent) {
      throw new Error(`组件不存在: ${componentId}`);
    }

    const duplicatedComponent: ComponentDefinition = {
      ...originalComponent,
      id: `duplicate_${Date.now()}_${originalComponent.id}`,
      name: newName || `${originalComponent.name} (副本)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.registerComponent(duplicatedComponent);
    return duplicatedComponent;
  }

  /**
   * 导出组件
   */
  async exportComponent(componentId: string): Promise<string> {
    const component = await this.getComponent(componentId);
    if (!component) {
      throw new Error(`组件不存在: ${componentId}`);
    }

    return JSON.stringify(component, null, 2);
  }

  /**
   * 导入组件
   */
  async importComponent(componentData: string): Promise<ComponentDefinition> {
    try {
      const component: ComponentDefinition = JSON.parse(componentData);

      // 验证组件定义
      if (!this.validateComponentDefinition(component)) {
        throw new Error('无效的组件数据格式');
      }

      // 生成新的ID避免冲突
      component.id = `imported_${Date.now()}_${component.id}`;
      component.createdAt = Date.now();
      component.updatedAt = Date.now();

      await this.registerComponent(component);
      return component;
    } catch (error) {
      throw new Error(
        `导入组件失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  }

  /**
   * 获取组件数量
   */
  async getComponentCount(): Promise<number> {
    const components = await this.componentStorage.getAllComponents();
    return components.length;
  }

  /**
   * 清空所有组件
   */
  clearAllComponents(): void {
    // 在简化架构中，这个方法不再需要
    // 因为组件直接存储在网盘路径中
    console.warn('clearAllComponents 方法已弃用，组件直接存储在网盘路径中');
  }

  /**
   * 验证组件定义
   */
  private validateComponentDefinition(component: ComponentDefinition): boolean {
    // 检查必需字段
    if (!component.id || !component.name) {
      return false;
    }

    // 检查根元素
    if (
      !component.rootElement ||
      !component.rootElement.type ||
      !component.rootElement.id
    ) {
      return false;
    }

    // 检查参数数组
    if (!Array.isArray(component.parameters)) {
      return false;
    }

    // 检查时间戳
    if (
      typeof component.createdAt !== 'number' ||
      typeof component.updatedAt !== 'number'
    ) {
      return false;
    }

    return true;
  }
}

/**
 * 创建组件管理器实例
 */
export function createComponentManager(): ComponentManager {
  return new ComponentManager();
}

/**
 * 默认组件管理器实例
 */
export const defaultComponentManager = new ComponentManager();
