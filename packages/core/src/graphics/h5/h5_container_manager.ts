/**
 * H5容器管理器
 * 统一管理H5容器的创建、查找、序列化等操作
 */

import type { GAssetForgeEditor } from '../../editor';
import { GraphicsType } from '../../type';
import type { GAssetForgeCanvas } from '../canvas';
import type { GAssetForgeGraphics } from '../graphics';
import { H5Container, type H5ContainerAttrs } from './h5_container';

export interface H5ContainerCreateOptions {
  id?: string;
  objectName?: string;
  width?: number;
  height?: number;
  // H5Container不再定义特有属性，这些都是通用布局属性
  padding?: number;
  gap?: number;
  autoLayout?: boolean;
  layoutType?: 'vertical' | 'horizontal' | 'grid' | 'smart';
  gridColumns?: number;
}

/**
 * H5容器管理器
 * 提供统一的H5容器创建、查找、管理接口
 */
export class H5ContainerManager {
  private static instance: H5ContainerManager | null = null;
  private containers = new Map<string, H5Container>();

  /**
   * 获取单例实例
   */
  static getInstance(): H5ContainerManager {
    if (!H5ContainerManager.instance) {
      H5ContainerManager.instance = new H5ContainerManager();
    }
    return H5ContainerManager.instance;
  }

  /**
   * 创建H5容器
   */
  createH5Container(
    editor: GAssetForgeEditor,
    options: H5ContainerCreateOptions = {},
  ): H5Container {
    // 生成唯一ID
    const containerId = options.id || this.generateContainerId();

    // 检查是否已存在相同ID的容器
    if (this.containers.has(containerId)) {
      console.warn(`H5ContainerManager: 容器 ${containerId} 已存在`);
      return this.containers.get(containerId)!;
    }

    // 创建H5容器属性（只包含真正需要的Frame属性）
    const containerAttrs: H5ContainerAttrs = {
      id: containerId,
      objectName: options.objectName || 'H5容器',
      width: options.width || 1080,
      height: options.height || 2220,
      transform: [1, 0, 0, 1, 0, 0], // H5特有：固定位置(0,0)
      resizeToFit: false, // H5特有：不自动调整尺寸
      // 添加其他必需的GraphicsAttrs属性
      type: GraphicsType.H5Container,
      visible: true,
      lock: false,
    };

    // 通用布局属性通过动态属性设置（这些不在类型定义中）
    if (options.padding !== undefined) {
      (containerAttrs as any).padding = options.padding;
    }
    if (options.gap !== undefined) {
      (containerAttrs as any).gap = options.gap;
    }
    if (options.autoLayout !== undefined) {
      (containerAttrs as any).autoLayout = options.autoLayout;
    }
    if (options.layoutType !== undefined) {
      (containerAttrs as any).layoutType = options.layoutType;
    }
    if (options.gridColumns !== undefined) {
      (containerAttrs as any).gridColumns = options.gridColumns;
    }

    // 创建H5容器实例
    const container = new H5Container(containerAttrs, { doc: editor.doc });

    // 注册到管理器
    this.containers.set(containerId, container);

    console.log('H5ContainerManager: 创建H5容器', containerId);
    return container;
  }

  /**
   * 查找H5容器
   * 支持从Canvas或Document中查找
   */
  findH5Container(
    parent: GAssetForgeCanvas | GAssetForgeGraphics,
  ): H5Container | null {
    const children = parent.getChildren();

    for (const child of children) {
      // 检查是否是H5Container类型
      if (this.isH5Container(child)) {
        const containerId = child.attrs?.id;
        if (containerId && !this.containers.has(containerId)) {
          // 注册到管理器（处理序列化后的容器）
          this.containers.set(containerId, child as H5Container);
        }
        return child as H5Container;
      }

      // 递归查找子元素
      if (child.getChildren && child.getChildren().length > 0) {
        const found = this.findH5Container(child);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * 检查是否是H5容器
   * 兼容序列化后可能变成Frame类型的情况
   */
  isH5Container(graphics: GAssetForgeGraphics): boolean {
    const type = graphics.type || (graphics as any).attrs?.type;
    const id = graphics.attrs?.id || (graphics as any).id;

    // 直接类型检查
    if (
      type === GraphicsType.H5Container ||
      (type as string) === 'H5Container'
    ) {
      return true;
    }

    // 构造函数名检查
    if (graphics.constructor?.name === 'H5Container') {
      return true;
    }

    // ID前缀检查（兼容序列化后的Frame类型）
    if (type === GraphicsType.Frame || (type as string) === 'Frame') {
      if (id && (id.includes('h5-container') || id.startsWith('H5Container'))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取已注册的H5容器
   */
  getContainer(containerId: string): H5Container | null {
    return this.containers.get(containerId) || null;
  }

  /**
   * 获取所有已注册的H5容器
   */
  getAllContainers(): H5Container[] {
    return Array.from(this.containers.values());
  }

  /**
   * 将H5容器添加到画布
   */
  addContainerToCanvas(
    container: H5Container,
    canvas: GAssetForgeCanvas,
    editor: GAssetForgeEditor,
  ): boolean {
    try {
      // 检查是否已存在H5容器
      const existingContainer = this.findH5Container(canvas);
      if (existingContainer && existingContainer !== container) {
        console.warn('H5ContainerManager: 画布中已存在H5容器，跳过添加');
        return false;
      }

      // 添加到场景图
      if (
        editor.sceneGraph &&
        typeof editor.sceneGraph.addItems === 'function'
      ) {
        editor.sceneGraph.addItems([container]);
      }

      // 添加到画布
      canvas.insertChild(container);

      // 选中容器
      if (
        editor.selectedElements &&
        typeof editor.selectedElements.setItems === 'function'
      ) {
        editor.selectedElements.setItems([container]);
      }

      // 触发渲染
      if (typeof editor.render === 'function') {
        editor.render();
      }

      console.log(
        'H5ContainerManager: H5容器已添加到画布',
        container.attrs?.id,
      );
      return true;
    } catch (error) {
      console.error('H5ContainerManager: 添加H5容器到画布失败:', error);
      return false;
    }
  }

  /**
   * 移除H5容器
   */
  removeContainer(containerId: string): boolean {
    const container = this.containers.get(containerId);
    if (!container) {
      return false;
    }

    // 从管理器中移除
    this.containers.delete(containerId);

    // 销毁容器
    if (typeof container.destroy === 'function') {
      container.destroy();
    }

    console.log('H5ContainerManager: 移除H5容器', containerId);
    return true;
  }

  /**
   * 序列化H5容器
   */
  serializeContainer(container: H5Container): any {
    return {
      id: container.attrs?.id,
      type: GraphicsType.H5Container,
      attrs: container.attrs,
      // 确保类型信息正确保存
      __h5ContainerVersion: '1.0.0',
    };
  }

  /**
   * 反序列化H5容器
   */
  deserializeContainer(
    data: any,
    editor: GAssetForgeEditor,
  ): H5Container | null {
    try {
      // 验证数据格式
      if (!data || !data.id || !data.attrs) {
        console.warn('H5ContainerManager: 无效的序列化数据');
        return null;
      }

      // 创建H5容器
      const container = new H5Container(data.attrs, { doc: editor.doc });

      // 注册到管理器
      this.containers.set(data.id, container);

      console.log('H5ContainerManager: 反序列化H5容器', data.id);
      return container;
    } catch (error) {
      console.error('H5ContainerManager: 反序列化H5容器失败:', error);
      return null;
    }
  }

  /**
   * 生成唯一的容器ID
   */
  private generateContainerId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `h5-container-${timestamp}-${random}`;
  }

  /**
   * 重置管理器（用于测试或清理）
   */
  reset(): void {
    this.containers.clear();
  }

  /**
   * 获取容器统计信息
   */
  getStats(): { totalContainers: number; activeContainers: number } {
    const totalContainers = this.containers.size;
    const activeContainers = Array.from(this.containers.values()).filter(
      (container) => container && typeof container.getChildren === 'function',
    ).length;

    return {
      totalContainers,
      activeContainers,
    };
  }
}

// 导出单例实例
export const h5ContainerManager = H5ContainerManager.getInstance();
