// Vue到React适配层 - 将Vue组件和功能适配到React环境
import { createApp, App as VueApp, Component as VueComponent } from 'vue';
import React from 'react';

export interface IVueComponentProps {
  [key: string]: any;
}

export interface IVueToReactAdapterOptions {
  enableDevtools?: boolean;
  enableErrorBoundary?: boolean;
  globalProperties?: Record<string, any>;
}

/**
 * Vue组件包装器，用于在React中使用Vue组件
 */
export class VueComponentWrapper {
  private vueApp: VueApp | null = null;
  private mountElement: HTMLElement | null = null;
  private isDestroyed = false;

  constructor(
    private vueComponent: VueComponent,
    private props: IVueComponentProps = {},
    private options: IVueToReactAdapterOptions = {}
  ) {}

  /**
   * 挂载Vue组件到指定DOM元素
   */
  mount(element: HTMLElement): void {
    if (this.isDestroyed) {
      throw new Error('VueComponentWrapper has been destroyed');
    }

    try {
      this.mountElement = element;
      this.vueApp = createApp(this.vueComponent, this.props);

      // 配置全局属性
      if (this.options.globalProperties) {
        Object.entries(this.options.globalProperties).forEach(([key, value]) => {
          this.vueApp!.config.globalProperties[key] = value;
        });
      }

      // 启用开发工具
      if (this.options.enableDevtools && process.env['NODE_ENV'] === 'development') {
        // Vue 3中devtools配置已移除，这里保留注释
        // this.vueApp.config.devtools = true;
      }

      // 错误处理
      if (this.options.enableErrorBoundary) {
        this.vueApp.config.errorHandler = (err, _instance, info) => {
          console.error('Vue component error:', err, info);
        };
      }

      this.vueApp.mount(element);
      console.log('Vue component mounted successfully');
    } catch (error) {
      console.error('Failed to mount Vue component:', error);
      throw error;
    }
  }

  /**
   * 更新Vue组件的props
   */
  updateProps(newProps: IVueComponentProps): void {
    if (this.isDestroyed || !this.vueApp) {
      return;
    }

    try {
      this.props = { ...this.props, ...newProps };
      
      // Vue 3中需要重新挂载来更新props（简化实现）
      if (this.mountElement) {
        this.unmount();
        this.mount(this.mountElement);
      }
    } catch (error) {
      console.error('Failed to update Vue component props:', error);
    }
  }

  /**
   * 卸载Vue组件
   */
  unmount(): void {
    if (this.vueApp) {
      try {
        this.vueApp.unmount();
        this.vueApp = null;
        console.log('Vue component unmounted successfully');
      } catch (error) {
        console.error('Failed to unmount Vue component:', error);
      }
    }
  }

  /**
   * 销毁包装器
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.unmount();
    this.isDestroyed = true;
    this.mountElement = null;
  }

  /**
   * 获取Vue应用实例
   */
  getVueApp(): VueApp | null {
    return this.vueApp;
  }

  /**
   * 检查是否已挂载
   */
  isMounted(): boolean {
    return !!this.vueApp && !!this.mountElement;
  }
}

/**
 * Vue到React适配器主类
 */
export class VueToReactAdapter {
  private componentWrappers: Map<string, VueComponentWrapper> = new Map();
  private options: IVueToReactAdapterOptions;

  constructor(options: IVueToReactAdapterOptions = {}) {
    this.options = {
      enableDevtools: process.env['NODE_ENV'] === 'development',
      enableErrorBoundary: true,
      ...options
    };
  }

  /**
   * 创建React组件，该组件内部使用Vue组件
   */
  createReactComponent(
    vueComponent: VueComponent,
    displayName?: string
  ): React.ComponentType<IVueComponentProps> {
    const adapter = this;
    const componentOptions = this.options;

    return class VueInReact extends React.Component<IVueComponentProps> {
      static displayName = displayName || 'VueInReact';
      
      private containerRef = React.createRef<HTMLDivElement>();
      private wrapper: VueComponentWrapper | null = null;
      private wrapperId: string;

      constructor(props: IVueComponentProps) {
        super(props);
        this.wrapperId = `vue-wrapper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      override componentDidMount(): void {
        if (this.containerRef.current) {
          try {
            this.wrapper = new VueComponentWrapper(vueComponent, this.props, componentOptions);
            this.wrapper.mount(this.containerRef.current);
            adapter.componentWrappers.set(this.wrapperId, this.wrapper);
          } catch (error) {
            console.error('Failed to mount Vue component in React:', error);
          }
        }
      }

      override componentDidUpdate(prevProps: IVueComponentProps): void {
        if (this.wrapper && prevProps !== this.props) {
          try {
            this.wrapper.updateProps(this.props);
          } catch (error) {
            console.error('Failed to update Vue component props:', error);
          }
        }
      }

      override componentWillUnmount(): void {
        if (this.wrapper) {
          this.wrapper.destroy();
          adapter.componentWrappers.delete(this.wrapperId);
          this.wrapper = null;
        }
      }

      override render(): React.ReactElement {
        return React.createElement('div', {
          ref: this.containerRef,
          style: { width: '100%', height: '100%' }
        });
      }
    };
  }

  /**
   * 创建Vue组件包装器
   */
  createWrapper(
    vueComponent: VueComponent,
    props?: IVueComponentProps
  ): VueComponentWrapper {
    return new VueComponentWrapper(vueComponent, props, this.options);
  }

  /**
   * 批量创建React组件
   */
  createReactComponents(
    vueComponents: Record<string, VueComponent>
  ): Record<string, React.ComponentType<IVueComponentProps>> {
    const reactComponents: Record<string, React.ComponentType<IVueComponentProps>> = {};

    Object.entries(vueComponents).forEach(([name, vueComponent]) => {
      reactComponents[name] = this.createReactComponent(vueComponent, name);
    });

    return reactComponents;
  }

  /**
   * 获取所有活跃的组件包装器
   */
  getActiveWrappers(): VueComponentWrapper[] {
    return Array.from(this.componentWrappers.values());
  }

  /**
   * 销毁所有组件包装器
   */
  destroyAllWrappers(): void {
    this.componentWrappers.forEach(wrapper => {
      wrapper.destroy();
    });
    this.componentWrappers.clear();
  }

  /**
   * 获取适配器统计信息
   */
  getStats(): {
    activeWrappers: number;
    totalCreated: number;
    options: IVueToReactAdapterOptions;
  } {
    return {
      activeWrappers: this.componentWrappers.size,
      totalCreated: this.componentWrappers.size, // 简化实现
      options: this.options
    };
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.destroyAllWrappers();
    console.log('VueToReactAdapter destroyed successfully');
  }
}

/**
 * 全局适配器实例
 */
export const globalVueToReactAdapter = new VueToReactAdapter();

/**
 * 便捷函数：创建React组件
 */
export function createReactFromVue(
  vueComponent: VueComponent,
  displayName?: string
): React.ComponentType<IVueComponentProps> {
  return globalVueToReactAdapter.createReactComponent(vueComponent, displayName);
}

/**
 * 便捷函数：批量创建React组件
 */
export function createReactComponentsFromVue(
  vueComponents: Record<string, VueComponent>
): Record<string, React.ComponentType<IVueComponentProps>> {
  return globalVueToReactAdapter.createReactComponents(vueComponents);
}

/**
 * Vue响应式数据适配器
 */
export class VueReactivityAdapter {
  private reactiveData: Map<string, any> = new Map();
  private subscribers: Map<string, Set<(value: any) => void>> = new Map();

  /**
   * 创建响应式数据
   */
  reactive<T>(key: string, initialValue: T): {
    get: () => T;
    set: (value: T) => void;
    subscribe: (callback: (value: T) => void) => () => void;
  } {
    this.reactiveData.set(key, initialValue);

    return {
      get: () => this.reactiveData.get(key),
      set: (value: T) => {
        this.reactiveData.set(key, value);
        this.notifySubscribers(key, value);
      },
      subscribe: (callback: (value: T) => void) => {
        if (!this.subscribers.has(key)) {
          this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key)!.add(callback);

        // 返回取消订阅函数
        return () => {
          this.subscribers.get(key)?.delete(callback);
        };
      }
    };
  }

  private notifySubscribers(key: string, value: any): void {
    const keySubscribers = this.subscribers.get(key);
    if (keySubscribers) {
      keySubscribers.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error('Error in reactivity subscriber:', error);
        }
      });
    }
  }

  /**
   * 清理所有响应式数据
   */
  clear(): void {
    this.reactiveData.clear();
    this.subscribers.clear();
  }
}

/**
 * 全局响应式适配器实例
 */
export const globalReactivityAdapter = new VueReactivityAdapter();