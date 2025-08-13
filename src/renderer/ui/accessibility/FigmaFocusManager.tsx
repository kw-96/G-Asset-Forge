import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { css } from 'styled-components';
import { useTheme } from '../theme/ThemeProvider';

// Figma风格焦点指示器变体
export type FigmaFocusVariant = 'default' | 'tool' | 'panel' | 'canvas' | 'prominent' | 'subtle';

// 焦点管理配置
export interface FigmaFocusManagerConfig {
  highlightFocus?: boolean;
  focusRing?: FigmaFocusVariant;
  skipToContent?: boolean;
  announceChanges?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  roving?: boolean; // 漫游焦点
}

// 焦点指示器属性
export interface FigmaFocusIndicatorProps {
  visible: boolean;
  element: HTMLElement | null;
  variant?: FigmaFocusVariant;
  offset?: number;
}

// 焦点管理上下文
interface FocusManagerContextType {
  registerFocusable: (element: HTMLElement, options?: FocusableOptions) => () => void;
  setFocusVisible: (visible: boolean) => void;
  moveFocus: (direction: 'next' | 'previous' | 'first' | 'last') => void;
  trapFocus: (container: HTMLElement) => () => void;
  restoreFocus: () => void;
  announceFocusChange: (message: string) => void;
  focusVisible: boolean;
  currentFocus: HTMLElement | null;
}

interface FocusableOptions {
  priority?: number;
  group?: string;
  skipable?: boolean;
}

const FocusManagerContext = createContext<FocusManagerContextType | undefined>(undefined);

export const useFocusManager = () => {
  const context = useContext(FocusManagerContext);
  if (!context) {
    throw new Error('useFocusManager must be used within a FocusManagerProvider');
  }
  return context;
};

// 焦点指示器样式
const getFocusIndicatorStyles = (variant: FigmaFocusVariant, theme: any) => {
  const baseStyles = css`
    position: absolute;
    pointer-events: none;
    border-radius: 4px;
    z-index: ${theme.zIndex.overlay};
    transition: all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut};
  `;

  const variantStyles = {
    default: css`
      border: 2px solid ${theme.colors.interaction?.focus || theme.colors.primary};
      box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
    `,
    
    tool: css`
      border: 2px solid ${theme.colors.tool?.select || theme.colors.primary};
      border-radius: 6px;
      box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
      background: rgba(9, 105, 218, 0.05);
    `,
    
    panel: css`
      border: 2px solid ${theme.colors.primary};
      border-radius: 8px;
      box-shadow: 0 0 0 4px rgba(9, 105, 218, 0.1);
    `,
    
    canvas: css`
      border: 2px dashed ${theme.colors.primary};
      border-radius: 2px;
      background: rgba(9, 105, 218, 0.02);
    `,
    
    prominent: css`
      border: 3px solid ${theme.colors.primary};
      border-radius: 6px;
      box-shadow: 
        0 0 0 1px white,
        0 0 0 4px rgba(9, 105, 218, 0.3),
        0 4px 12px rgba(9, 105, 218, 0.2);
    `,
    
    subtle: css`
      border: 1px solid ${theme.colors.primary};
      border-radius: 3px;
      opacity: 0.6;
    `,
  };

  return css`
    ${baseStyles}
    ${variantStyles[variant]}
  `;
};

// 焦点指示器组件
const FocusIndicator = styled(motion.div)<{
  $variant: FigmaFocusVariant;
  $offset: number;
}>`
  ${({ $variant, theme }) => getFocusIndicatorStyles($variant, theme)}
  
  /* 偏移调整 */
  margin: -${({ $offset }) => $offset}px;
`;

// 焦点公告区域
const FocusAnnouncer = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

// 跳转到内容按钮
const SkipToContentButton = styled.button`
  position: fixed;
  top: -100px;
  left: 16px;
  z-index: ${({ theme }) => theme.zIndex.skipLink};
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} 
              ${({ theme }) => theme.animation.easing.easeOut};
  
  &:focus {
    top: 16px;
    outline: 2px solid white;
    outline-offset: 2px;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

// 焦点管理器类
class FigmaFocusManager {
  private focusableElements: Map<HTMLElement, FocusableOptions> = new Map();
  private focusHistory: HTMLElement[] = [];
  private currentFocus: HTMLElement | null = null;
  private focusVisible: boolean = false;
  private listeners: Set<(focus: HTMLElement | null, visible: boolean) => void> = new Set();
  private announcer: HTMLElement | null = null;

  public registerFocusable(element: HTMLElement, options: FocusableOptions = {}): () => void {
    this.focusableElements.set(element, options);
    
    return () => {
      this.focusableElements.delete(element);
    };
  }

  public setFocusVisible(visible: boolean): void {
    this.focusVisible = visible;
    this.notifyListeners();
  }

  public setCurrentFocus(element: HTMLElement | null): void {
    if (this.currentFocus !== element) {
      this.currentFocus = element;
      if (element) {
        this.addToHistory(element);
      }
      this.notifyListeners();
    }
  }

  public getCurrentFocus(): HTMLElement | null {
    return this.currentFocus;
  }

  public getFocusVisible(): boolean {
    return this.focusVisible;
  }

  public moveFocus(direction: 'next' | 'previous' | 'first' | 'last'): void {
    const focusableArray = Array.from(this.focusableElements.keys())
      .filter(el => this.isFocusable(el))
      .sort((a, b) => {
        const aOptions = this.focusableElements.get(a) || {};
        const bOptions = this.focusableElements.get(b) || {};
        return (aOptions.priority || 0) - (bOptions.priority || 0);
      });

    if (focusableArray.length === 0) return;

    let targetIndex = 0;
    const currentIndex = this.currentFocus ? focusableArray.indexOf(this.currentFocus) : -1;

    switch (direction) {
      case 'next':
        targetIndex = currentIndex < focusableArray.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'previous':
        targetIndex = currentIndex > 0 ? currentIndex - 1 : focusableArray.length - 1;
        break;
      case 'first':
        targetIndex = 0;
        break;
      case 'last':
        targetIndex = focusableArray.length - 1;
        break;
    }

    const targetElement = focusableArray[targetIndex];
    if (targetElement) {
      targetElement.focus();
      this.setFocusVisible(true);
    }
  }

  public trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  public restoreFocus(): void {
    if (this.focusHistory.length > 0) {
      const lastFocus = this.focusHistory[this.focusHistory.length - 1];
      if (lastFocus && document.contains(lastFocus)) {
        lastFocus.focus();
        this.setFocusVisible(true);
      }
    }
  }

  public announceFocusChange(message: string): void {
    if (this.announcer) {
      this.announcer.textContent = message;
      // 清空后重新设置，确保屏幕阅读器读取
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = '';
        }
      }, 1000);
    }
  }

  public setAnnouncer(announcer: HTMLElement): void {
    this.announcer = announcer;
  }

  private isFocusable(element: HTMLElement): boolean {
    if (element.hasAttribute('disabled') || element.getAttribute('tabindex') === '-1') {
      return false;
    }
    
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    
    return true;
  }

  private addToHistory(element: HTMLElement): void {
    // 移除重复项
    this.focusHistory = this.focusHistory.filter(el => el !== element);
    // 添加到历史记录
    this.focusHistory.push(element);
    // 限制历史记录长度
    if (this.focusHistory.length > 10) {
      this.focusHistory.shift();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => 
      listener(this.currentFocus, this.focusVisible)
    );
  }

  public addListener(listener: (focus: HTMLElement | null, visible: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// 全局焦点管理器实例
const focusManager = new FigmaFocusManager();

// 焦点管理提供者
export const FigmaFocusManagerProvider: React.FC<{
  children: React.ReactNode;
  config?: FigmaFocusManagerConfig;
}> = ({ children, config = {} }) => {
  const { reducedMotion } = useTheme();
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);
  const [focusVisible, setFocusVisible] = useState(false);
  const [focusRect, setFocusRect] = useState<DOMRect | null>(null);
  const announcerRef = useRef<HTMLDivElement>(null);

  // 设置公告器
  useEffect(() => {
    if (announcerRef.current) {
      focusManager.setAnnouncer(announcerRef.current);
    }
  }, []);

  // 监听焦点变化
  useEffect(() => {
    return focusManager.addListener((focus, visible) => {
      setCurrentFocus(focus);
      setFocusVisible(visible);
      
      if (focus && visible) {
        const rect = focus.getBoundingClientRect();
        setFocusRect(rect);
        
        if (config.announceChanges) {
          const label = focus.getAttribute('aria-label') || 
                       focus.getAttribute('title') || 
                       focus.textContent || 
                       focus.tagName.toLowerCase();
          focusManager.announceFocusChange(`焦点移动到 ${label}`);
        }
      } else {
        setFocusRect(null);
      }
    });
  }, [config.announceChanges]);

  // 全局焦点事件监听
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      focusManager.setCurrentFocus(target);
      focusManager.setFocusVisible(true);
    };

    const handleFocusOut = () => {
      // 延迟检查，确保焦点真的离开了
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          focusManager.setCurrentFocus(null);
          focusManager.setFocusVisible(false);
        }
      }, 0);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab键显示焦点指示器
      if (event.key === 'Tab') {
        focusManager.setFocusVisible(true);
      }
      
      // 方向键导航
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        if (config.roving) {
          event.preventDefault();
          const direction = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? 'previous' : 'next';
          focusManager.moveFocus(direction);
        }
      }
    };

    const handleMouseDown = () => {
      // 鼠标点击隐藏焦点指示器
      focusManager.setFocusVisible(false);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [config.roving]);

  const contextValue: FocusManagerContextType = {
    registerFocusable: focusManager.registerFocusable.bind(focusManager),
    setFocusVisible: focusManager.setFocusVisible.bind(focusManager),
    moveFocus: focusManager.moveFocus.bind(focusManager),
    trapFocus: focusManager.trapFocus.bind(focusManager),
    restoreFocus: focusManager.restoreFocus.bind(focusManager),
    announceFocusChange: focusManager.announceFocusChange.bind(focusManager),
    focusVisible,
    currentFocus,
  };

  const skipToMainContent = () => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      focusManager.setFocusVisible(true);
    }
  };

  return (
    <FocusManagerContext.Provider value={contextValue}>
      {/* 跳转到内容按钮 */}
      {config.skipToContent && (
        <SkipToContentButton onClick={skipToMainContent}>
          跳转到主要内容
        </SkipToContentButton>
      )}

      {/* 焦点公告器 */}
      <FocusAnnouncer
        ref={announcerRef}
        aria-live="polite"
        aria-atomic="true"
      />

      {children}

      {/* 焦点指示器 */}
      {config.highlightFocus && (
        <AnimatePresence>
          {focusVisible && focusRect && (
            <FocusIndicator
              $variant={config.focusRing || 'default'}
              $offset={2}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: reducedMotion ? 0 : 0.15,
                ease: 'easeOut'
              }}
              style={{
                position: 'fixed',
                left: focusRect.left - 2,
                top: focusRect.top - 2,
                width: focusRect.width + 4,
                height: focusRect.height + 4,
              }}
            />
          )}
        </AnimatePresence>
      )}
    </FocusManagerContext.Provider>
  );
};

// 焦点指示器组件
export const FigmaFocusIndicator: React.FC<FigmaFocusIndicatorProps> = ({
  visible,
  element,
  variant = 'default',
  offset = 2,
}) => {
  const { reducedMotion } = useTheme();
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (visible && element) {
      const updateRect = () => {
        setRect(element.getBoundingClientRect());
      };

      updateRect();
      
      // 监听元素位置变化
      const resizeObserver = new ResizeObserver(updateRect);
      resizeObserver.observe(element);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      setRect(null);
    }
  }, [visible, element]);

  return (
    <AnimatePresence>
      {visible && rect && (
        <FocusIndicator
          $variant={variant}
          $offset={offset}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: reducedMotion ? 0 : 0.15,
            ease: 'easeOut'
          }}
          style={{
            position: 'fixed',
            left: rect.left - offset,
            top: rect.top - offset,
            width: rect.width + offset * 2,
            height: rect.height + offset * 2,
          }}
        />
      )}
    </AnimatePresence>
  );
};

// 焦点陷阱Hook
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  active: boolean = true
) => {
  const { trapFocus } = useFocusManager();

  useEffect(() => {
    if (active && containerRef.current) {
      return trapFocus(containerRef.current);
    }
  }, [active, trapFocus]);
};

// 焦点恢复Hook
export const useFocusRestore = (shouldRestore: boolean = true) => {
  const { restoreFocus } = useFocusManager();
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (shouldRestore) {
      previousFocus.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (shouldRestore && previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [shouldRestore]);

  return restoreFocus;
};

// 可聚焦元素注册Hook
export const useFocusable = (
  elementRef: React.RefObject<HTMLElement>,
  options: FocusableOptions = {}
) => {
  const { registerFocusable } = useFocusManager();

  useEffect(() => {
    if (elementRef.current) {
      return registerFocusable(elementRef.current, options);
    }
  }, [registerFocusable, options.priority, options.group, options.skipable]);
};