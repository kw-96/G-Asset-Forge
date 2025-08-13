import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

// ARIA实时区域类型
export type AriaLivePoliteness = 'off' | 'polite' | 'assertive';
export type AriaRelevant = 'additions' | 'removals' | 'text' | 'all';

// Figma风格ARIA实时区域属性
export interface FigmaAriaLiveRegionProps {
  politeness?: AriaLivePoliteness;
  atomic?: boolean;
  relevant?: AriaRelevant;
  children: React.ReactNode;
  // Figma风格增强
  context?: string;
  priority?: 'low' | 'medium' | 'high';
  className?: string;
}

// 无障碍播报器接口
export interface FigmaAccessibilityAnnouncer {
  // 基础功能
  announce: (message: string, priority?: AriaLivePoliteness) => void;
  announceStatus: (status: string) => void;
  announceError: (error: string) => void;
  announceSuccess: (message: string) => void;
  
  // Figma风格增强
  announceToolChange: (toolName: string, description?: string) => void;
  announceSelectionChange: (count: number, type?: string) => void;
  announceCanvasChange: (action: string, details?: string) => void;
  announceShortcut: (shortcut: string, action: string) => void;
  announceProgress: (percentage: number, task?: string) => void;
  announceModal: (title: string, description?: string) => void;
  announceNavigation: (location: string, context?: string) => void;
}

// 屏幕阅读器上下文
interface ScreenReaderContextType extends FigmaAccessibilityAnnouncer {
  isScreenReaderActive: boolean;
  setScreenReaderActive: (active: boolean) => void;
  registerLiveRegion: (id: string, element: HTMLElement) => void;
  unregisterLiveRegion: (id: string) => void;
}

const ScreenReaderContext = createContext<ScreenReaderContextType | undefined>(undefined);

export const useScreenReader = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader must be used within a ScreenReaderProvider');
  }
  return context;
};

// ARIA实时区域样式
const LiveRegion = styled.div<{
  $priority: 'low' | 'medium' | 'high';
  $context?: string;
}>`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  
  /* 根据优先级调整样式 */
  ${({ $priority }) => {
    switch ($priority) {
      case 'high':
        return `
          /* 高优先级区域可能需要特殊处理 */
        `;
      case 'medium':
        return `
          /* 中优先级区域 */
        `;
      default:
        return `
          /* 低优先级区域 */
        `;
    }
  }}
`;

// 屏幕阅读器检测
const detectScreenReader = (): boolean => {
  // 检测常见的屏幕阅读器
  const userAgent = navigator.userAgent.toLowerCase();
  const screenReaders = [
    'nvda', 'jaws', 'dragon', 'zoomtext', 'fusion', 'magnifier',
    'supernova', 'narrator', 'voiceover', 'talkback'
  ];
  
  // 检查用户代理字符串
  const hasScreenReaderUA = screenReaders.some(sr => userAgent.includes(sr));
  
  // 检查媒体查询
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  
  // 检查辅助技术API
  const hasAccessibilityAPI = 'speechSynthesis' in window || 'webkitSpeechSynthesis' in window;
  
  return hasScreenReaderUA || (prefersReducedMotion && prefersHighContrast) || hasAccessibilityAPI;
};

// 屏幕阅读器管理器类
class FigmaScreenReaderManager implements FigmaAccessibilityAnnouncer {
  private liveRegions: Map<string, HTMLElement> = new Map();
  private messageQueue: Array<{ message: string; priority: AriaLivePoliteness; timestamp: number }> = [];
  private isProcessing: boolean = false;
  private lastAnnouncement: string = '';
  private lastAnnouncementTime: number = 0;

  // 注册实时区域
  public registerLiveRegion(id: string, element: HTMLElement): void {
    this.liveRegions.set(id, element);
  }

  // 注销实时区域
  public unregisterLiveRegion(id: string): void {
    this.liveRegions.delete(id);
  }

  // 基础播报功能
  public announce(message: string, priority: AriaLivePoliteness = 'polite'): void {
    if (!message.trim()) return;

    // 防止重复播报
    const now = Date.now();
    if (message === this.lastAnnouncement && now - this.lastAnnouncementTime < 1000) {
      return;
    }

    this.lastAnnouncement = message;
    this.lastAnnouncementTime = now;

    // 添加到队列
    this.messageQueue.push({ message, priority, timestamp: now });
    this.processQueue();
  }

  public announceStatus(status: string): void {
    this.announce(`状态: ${status}`, 'polite');
  }

  public announceError(error: string): void {
    this.announce(`错误: ${error}`, 'assertive');
  }

  public announceSuccess(message: string): void {
    this.announce(`成功: ${message}`, 'polite');
  }

  // Figma风格的专业播报功能
  public announceToolChange(toolName: string, description?: string): void {
    const message = description 
      ? `已切换到${toolName}工具。${description}`
      : `已切换到${toolName}工具`;
    this.announce(message, 'polite');
  }

  public announceSelectionChange(count: number, type?: string): void {
    if (count === 0) {
      this.announce('已取消选择', 'polite');
    } else if (count === 1) {
      const message = type ? `已选择1个${type}` : '已选择1个对象';
      this.announce(message, 'polite');
    } else {
      const message = type ? `已选择${count}个${type}` : `已选择${count}个对象`;
      this.announce(message, 'polite');
    }
  }

  public announceCanvasChange(action: string, details?: string): void {
    const message = details ? `画布操作: ${action}。${details}` : `画布操作: ${action}`;
    this.announce(message, 'polite');
  }

  public announceShortcut(shortcut: string, action: string): void {
    this.announce(`快捷键 ${shortcut}: ${action}`, 'polite');
  }

  public announceProgress(percentage: number, task?: string): void {
    const message = task 
      ? `${task}进度: ${percentage}%`
      : `进度: ${percentage}%`;
    
    // 只在特定百分比时播报，避免过于频繁
    if (percentage % 25 === 0 || percentage === 100) {
      this.announce(message, 'polite');
    }
  }

  public announceModal(title: string, description?: string): void {
    const message = description 
      ? `对话框已打开: ${title}。${description}`
      : `对话框已打开: ${title}`;
    this.announce(message, 'assertive');
  }

  public announceNavigation(location: string, context?: string): void {
    const message = context 
      ? `导航到${location}，位于${context}`
      : `导航到${location}`;
    this.announce(message, 'polite');
  }

  // 处理消息队列
  private processQueue(): void {
    if (this.isProcessing || this.messageQueue.length === 0) return;

    this.isProcessing = true;
    const { message, priority } = this.messageQueue.shift()!;

    // 选择合适的实时区域
    const regionId = priority === 'assertive' ? 'assertive-region' : 'polite-region';
    const region = this.liveRegions.get(regionId);

    if (region) {
      // 清空区域内容
      region.textContent = '';
      
      // 短暂延迟后设置新内容，确保屏幕阅读器能够检测到变化
      setTimeout(() => {
        region.textContent = message;
        
        // 处理下一条消息
        setTimeout(() => {
          this.isProcessing = false;
          this.processQueue();
        }, 100);
      }, 50);
    } else {
      this.isProcessing = false;
      this.processQueue();
    }
  }

  // 清空消息队列
  public clearQueue(): void {
    this.messageQueue = [];
    this.isProcessing = false;
  }

  // 获取队列状态
  public getQueueStatus(): { length: number; isProcessing: boolean } {
    return {
      length: this.messageQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// 全局屏幕阅读器管理器实例
const screenReaderManager = new FigmaScreenReaderManager();

// 屏幕阅读器提供者
export const FigmaScreenReaderProvider: React.FC<{
  children: React.ReactNode;
  autoDetect?: boolean;
}> = ({ children, autoDetect = true }) => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const politeRegionRef = useRef<HTMLDivElement>(null);
  const assertiveRegionRef = useRef<HTMLDivElement>(null);

  // 自动检测屏幕阅读器
  useEffect(() => {
    if (autoDetect) {
      const detected = detectScreenReader();
      setIsScreenReaderActive(detected);
    }
  }, [autoDetect]);

  // 注册实时区域
  useEffect(() => {
    if (politeRegionRef.current) {
      screenReaderManager.registerLiveRegion('polite-region', politeRegionRef.current);
    }
    if (assertiveRegionRef.current) {
      screenReaderManager.registerLiveRegion('assertive-region', assertiveRegionRef.current);
    }

    return () => {
      screenReaderManager.unregisterLiveRegion('polite-region');
      screenReaderManager.unregisterLiveRegion('assertive-region');
    };
  }, []);

  const contextValue: ScreenReaderContextType = {
    isScreenReaderActive,
    setScreenReaderActive: setIsScreenReaderActive,
    registerLiveRegion: screenReaderManager.registerLiveRegion.bind(screenReaderManager),
    unregisterLiveRegion: screenReaderManager.unregisterLiveRegion.bind(screenReaderManager),
    // FigmaAccessibilityAnnouncer 方法
    announce: screenReaderManager.announce.bind(screenReaderManager),
    announceStatus: screenReaderManager.announceStatus.bind(screenReaderManager),
    announceError: screenReaderManager.announceError.bind(screenReaderManager),
    announceSuccess: screenReaderManager.announceSuccess.bind(screenReaderManager),
    announceToolChange: screenReaderManager.announceToolChange.bind(screenReaderManager),
    announceSelectionChange: screenReaderManager.announceSelectionChange.bind(screenReaderManager),
    announceCanvasChange: screenReaderManager.announceCanvasChange.bind(screenReaderManager),
    announceShortcut: screenReaderManager.announceShortcut.bind(screenReaderManager),
    announceProgress: screenReaderManager.announceProgress.bind(screenReaderManager),
    announceModal: screenReaderManager.announceModal.bind(screenReaderManager),
    announceNavigation: screenReaderManager.announceNavigation.bind(screenReaderManager),
  };

  return (
    <ScreenReaderContext.Provider value={contextValue}>
      {/* ARIA实时区域 */}
      <LiveRegion
        ref={politeRegionRef}
        $priority="medium"
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="text"
        role="status"
      />
      
      <LiveRegion
        ref={assertiveRegionRef}
        $priority="high"
        aria-live="assertive"
        aria-atomic="true"
        aria-relevant="text"
        role="alert"
      />

      {children}
    </ScreenReaderContext.Provider>
  );
};

// ARIA实时区域组件
export const FigmaAriaLiveRegion: React.FC<FigmaAriaLiveRegionProps> = ({
  politeness = 'polite',
  atomic = true,
  relevant = 'text',
  children,
  context,
  priority = 'medium',
  className,
}) => {
  const regionRef = useRef<HTMLDivElement>(null);
  const { registerLiveRegion, unregisterLiveRegion } = useScreenReader();

  // 注册自定义实时区域
  useEffect(() => {
    if (regionRef.current && context) {
      registerLiveRegion(context, regionRef.current);
      return () => unregisterLiveRegion(context);
    }
  }, [context, registerLiveRegion, unregisterLiveRegion]);

  return (
    <LiveRegion
      ref={regionRef}
      className={className}
      $priority={priority}
      $context={context || ''}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role={politeness === 'assertive' ? 'alert' : 'status'}
    >
      {children}
    </LiveRegion>
  );
};

// 屏幕阅读器专用组件
export const ScreenReaderOnly: React.FC<{
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  id?: string;
  [key: string]: any;
}> = ({ children, as: Component = 'span', ...props }) => {
  return (
    <Component
      {...props}
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Component>
  );
};

// 可访问性描述组件
export const AccessibleDescription: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  return (
    <ScreenReaderOnly as="div" id={id}>
      {children}
    </ScreenReaderOnly>
  );
};

// 可访问性标签组件
export const AccessibleLabel: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  return (
    <ScreenReaderOnly as="label" id={id}>
      {children}
    </ScreenReaderOnly>
  );
};

// 屏幕阅读器播报Hook
export const useScreenReaderAnnounce = () => {
  const { announce, announceStatus, announceError, announceSuccess } = useScreenReader();

  return {
    announce,
    announceStatus,
    announceError,
    announceSuccess,
  };
};

// Figma专用播报Hook
export const useFigmaAnnounce = () => {
  const {
    announceToolChange,
    announceSelectionChange,
    announceCanvasChange,
    announceShortcut,
    announceProgress,
    announceModal,
    announceNavigation,
  } = useScreenReader();

  return {
    announceToolChange,
    announceSelectionChange,
    announceCanvasChange,
    announceShortcut,
    announceProgress,
    announceModal,
    announceNavigation,
  };
};

// 屏幕阅读器状态Hook
export const useScreenReaderStatus = () => {
  const { isScreenReaderActive, setScreenReaderActive } = useScreenReader();

  return {
    isScreenReaderActive,
    setScreenReaderActive,
  };
};

// ARIA属性增强Hook
export const useAriaEnhanced = (
  elementRef: React.RefObject<HTMLElement>,
  options: {
    label?: string;
    description?: string;
    role?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    live?: AriaLivePoliteness;
  } = {}
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 设置ARIA属性
    if (options.label) {
      element.setAttribute('aria-label', options.label);
    }
    if (options.description) {
      element.setAttribute('aria-describedby', `${element.id}-description`);
    }
    if (options.role) {
      element.setAttribute('role', options.role);
    }
    if (options.expanded !== undefined) {
      element.setAttribute('aria-expanded', String(options.expanded));
    }
    if (options.selected !== undefined) {
      element.setAttribute('aria-selected', String(options.selected));
    }
    if (options.disabled !== undefined) {
      element.setAttribute('aria-disabled', String(options.disabled));
    }
    if (options.required !== undefined) {
      element.setAttribute('aria-required', String(options.required));
    }
    if (options.invalid !== undefined) {
      element.setAttribute('aria-invalid', String(options.invalid));
    }
    if (options.live) {
      element.setAttribute('aria-live', options.live);
    }

    // 清理函数
    return () => {
      const attributesToRemove = [
        'aria-label', 'aria-describedby', 'role', 'aria-expanded',
        'aria-selected', 'aria-disabled', 'aria-required', 'aria-invalid', 'aria-live'
      ];
      
      attributesToRemove.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      });
    };
  }, [
    options.label,
    options.description,
    options.role,
    options.expanded,
    options.selected,
    options.disabled,
    options.required,
    options.invalid,
    options.live,
  ]);
};