import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useTheme } from '../theme/ThemeProvider';

// Figma风格快捷键接口
export interface FigmaShortcut {
  key: string;
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  action: () => void;
  description: string;
  context?: string;
  global?: boolean;
  preventDefault?: boolean;
}

// 键盘导航配置
export interface FigmaKeyboardNavigationConfig {
  // 基础配置
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: HTMLElement | string;
  
  // Figma风格的键盘导航
  shortcuts?: FigmaShortcut[];
  contextualShortcuts?: boolean;
  visualFeedback?: boolean;
  announceShortcuts?: boolean;
  
  // 导航行为
  skipLinks?: SkipLink[];
  roving?: boolean; // 漫游焦点
  wrap?: boolean; // 焦点循环
}

export interface SkipLink {
  label: string;
  target: string;
  shortcut?: string;
}

// 键盘导航上下文
interface KeyboardNavigationContextType {
  registerShortcut: (shortcut: FigmaShortcut) => () => void;
  unregisterShortcut: (key: string) => void;
  pushContext: (context: string) => void;
  popContext: () => void;
  getAvailableShortcuts: (context?: string) => FigmaShortcut[];
  showShortcutHelp: () => void;
  hideShortcutHelp: () => void;
  currentContext: string[];
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined);

export const useKeyboardNavigation = () => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
  }
  return context;
};

// 快捷键帮助面板样式
const ShortcutHelpOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
`;

const ShortcutHelpPanel = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.modal};
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ShortcutHelpHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  
  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  p {
    margin: 4px 0 0;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const ShortcutHelpContent = styled.div`
  padding: 16px 24px 24px;
  overflow-y: auto;
`;

const ShortcutGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ShortcutGroupTitle = styled.h3`
  margin: 0 0 12px;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default}20;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ShortcutDescription = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ShortcutKeys = styled.div`
  display: flex;
  gap: 4px;
`;

const ShortcutKey = styled.span`
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.neutral[100]};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 24px;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} 
              ${({ theme }) => theme.animation.easing.easeOut};
  
  &:hover {
    background: ${({ theme }) => theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// 跳转链接组件
const SkipLinksContainer = styled.div`
  position: fixed;
  top: -100px;
  left: 16px;
  z-index: ${({ theme }) => theme.zIndex.skipLink};
  
  &:focus-within {
    top: 16px;
  }
`;

const SkipLink = styled.a`
  display: inline-block;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-right: 8px;
  transition: all ${({ theme }) => theme.animation.duration.fast} 
              ${({ theme }) => theme.animation.easing.easeOut};
  
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.secondary};
    outline: 2px solid ${({ theme }) => theme.colors.interaction?.focus || theme.colors.primary};
    outline-offset: 2px;
  }
`;

// 键盘导航管理器类
class FigmaKeyboardNavigationManager {
  private shortcuts: Map<string, FigmaShortcut> = new Map();
  private contextStack: string[] = ['global'];
  private listeners: Set<(shortcuts: FigmaShortcut[]) => void> = new Set();

  public registerShortcut(shortcut: FigmaShortcut): () => void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
    this.notifyListeners();
    
    return () => {
      this.shortcuts.delete(key);
      this.notifyListeners();
    };
  }

  public unregisterShortcut(key: string): void {
    this.shortcuts.delete(key);
    this.notifyListeners();
  }

  public pushContext(context: string): void {
    this.contextStack.push(context);
    this.notifyListeners();
  }

  public popContext(): void {
    if (this.contextStack.length > 1) {
      this.contextStack.pop();
      this.notifyListeners();
    }
  }

  public getCurrentContext(): string[] {
    return [...this.contextStack];
  }

  public getAvailableShortcuts(context?: string): FigmaShortcut[] {
    const targetContext = context || this.contextStack[this.contextStack.length - 1];
    return Array.from(this.shortcuts.values()).filter(shortcut => 
      shortcut.global || !shortcut.context || shortcut.context === targetContext
    );
  }

  public handleKeyDown(event: KeyboardEvent): boolean {
    const shortcut = this.findMatchingShortcut(event);
    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      shortcut.action();
      return true;
    }
    return false;
  }

  private getShortcutKey(shortcut: FigmaShortcut): string {
    const modifiers = (shortcut.modifiers || []).sort().join('+');
    return modifiers ? `${modifiers}+${shortcut.key}` : shortcut.key;
  }

  private findMatchingShortcut(event: KeyboardEvent): FigmaShortcut | null {
    const pressedModifiers: string[] = [];
    if (event.ctrlKey) pressedModifiers.push('ctrl');
    if (event.shiftKey) pressedModifiers.push('shift');
    if (event.altKey) pressedModifiers.push('alt');
    if (event.metaKey) pressedModifiers.push('meta');

    const key = event.key.toLowerCase();
    const shortcutKey = pressedModifiers.length > 0 
      ? `${pressedModifiers.sort().join('+')}+${key}` 
      : key;

    const shortcut = this.shortcuts.get(shortcutKey);
    if (!shortcut) return null;

    // 检查上下文
    const currentContext = this.contextStack[this.contextStack.length - 1];
    if (!shortcut.global && shortcut.context && shortcut.context !== currentContext) {
      return null;
    }

    return shortcut;
  }

  private notifyListeners(): void {
    const shortcuts = this.getAvailableShortcuts();
    this.listeners.forEach(listener => listener(shortcuts));
  }

  public addListener(listener: (shortcuts: FigmaShortcut[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// 全局管理器实例
const keyboardNavigationManager = new FigmaKeyboardNavigationManager();

// 键盘导航提供者
export const FigmaKeyboardNavigationProvider: React.FC<{
  children: React.ReactNode;
  config?: FigmaKeyboardNavigationConfig;
}> = ({ children, config = {} }) => {
  const { reducedMotion } = useTheme();
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [availableShortcuts, setAvailableShortcuts] = useState<FigmaShortcut[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 注册默认快捷键
  useEffect(() => {
    const defaultShortcuts: FigmaShortcut[] = [
      {
        key: '?',
        modifiers: ['shift'],
        action: () => setShowShortcutHelp(true),
        description: '显示快捷键帮助',
        global: true,
      },
      {
        key: 'escape',
        action: () => setShowShortcutHelp(false),
        description: '关闭对话框',
        global: true,
      },
      {
        key: 'f1',
        action: () => setShowShortcutHelp(true),
        description: '帮助',
        global: true,
      },
    ];

    const unregisterFunctions = defaultShortcuts.map(shortcut => 
      keyboardNavigationManager.registerShortcut(shortcut)
    );

    // 注册配置中的快捷键
    const configUnregisterFunctions = (config.shortcuts || []).map(shortcut =>
      keyboardNavigationManager.registerShortcut(shortcut)
    );

    return () => {
      unregisterFunctions.forEach(fn => fn());
      configUnregisterFunctions.forEach(fn => fn());
    };
  }, [config.shortcuts]);

  // 监听快捷键变化
  useEffect(() => {
    return keyboardNavigationManager.addListener(setAvailableShortcuts);
  }, []);

  // 全局键盘事件监听
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keyboardNavigationManager.handleKeyDown(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 焦点陷阱
  useEffect(() => {
    if (config.trapFocus && containerRef.current) {
      const container = containerRef.current;
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
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

      container.addEventListener('keydown', handleTabKey);
      return () => container.removeEventListener('keydown', handleTabKey);
    }
  }, [config.trapFocus]);

  const contextValue: KeyboardNavigationContextType = {
    registerShortcut: keyboardNavigationManager.registerShortcut.bind(keyboardNavigationManager),
    unregisterShortcut: keyboardNavigationManager.unregisterShortcut.bind(keyboardNavigationManager),
    pushContext: keyboardNavigationManager.pushContext.bind(keyboardNavigationManager),
    popContext: keyboardNavigationManager.popContext.bind(keyboardNavigationManager),
    getAvailableShortcuts: keyboardNavigationManager.getAvailableShortcuts.bind(keyboardNavigationManager),
    showShortcutHelp: () => setShowShortcutHelp(true),
    hideShortcutHelp: () => setShowShortcutHelp(false),
    currentContext: keyboardNavigationManager.getCurrentContext(),
  };

  // 格式化快捷键显示
  const formatShortcut = (shortcut: FigmaShortcut) => {
    const keys = [...(shortcut.modifiers || []), shortcut.key];
    return keys.map(key => {
      switch (key) {
        case 'ctrl': return 'Ctrl';
        case 'shift': return 'Shift';
        case 'alt': return 'Alt';
        case 'meta': return 'Cmd';
        case ' ': return 'Space';
        case 'escape': return 'Esc';
        case 'arrowup': return '↑';
        case 'arrowdown': return '↓';
        case 'arrowleft': return '←';
        case 'arrowright': return '→';
        default: return key.toUpperCase();
      }
    });
  };

  // 按上下文分组快捷键
  const groupedShortcuts = availableShortcuts.reduce((groups, shortcut) => {
    const context = shortcut.context || 'global';
    if (!groups[context]) {
      groups[context] = [];
    }
    groups[context].push(shortcut);
    return groups;
  }, {} as Record<string, FigmaShortcut[]>);

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      <div ref={containerRef}>
        {/* 跳转链接 */}
        {config.skipLinks && config.skipLinks.length > 0 && (
          <SkipLinksContainer>
            {config.skipLinks.map((link, index) => (
              <SkipLink
                key={index}
                href={`#${link.target}`}
                title={link.shortcut ? `${link.label} (${link.shortcut})` : link.label}
              >
                {link.label}
              </SkipLink>
            ))}
          </SkipLinksContainer>
        )}

        {children}

        {/* 快捷键帮助面板 */}
        <AnimatePresence>
          {showShortcutHelp && (
            <ShortcutHelpOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              onClick={() => setShowShortcutHelp(false)}
            >
              <ShortcutHelpPanel
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ShortcutHelpHeader>
                  <h2>键盘快捷键</h2>
                  <p>使用这些快捷键来提高工作效率</p>
                  <CloseButton onClick={() => setShowShortcutHelp(false)}>
                    ✕
                  </CloseButton>
                </ShortcutHelpHeader>

                <ShortcutHelpContent>
                  {Object.entries(groupedShortcuts).map(([context, shortcuts]) => (
                    <ShortcutGroup key={context}>
                      <ShortcutGroupTitle>
                        {context === 'global' ? '全局' : context}
                      </ShortcutGroupTitle>
                      {shortcuts.map((shortcut, index) => (
                        <ShortcutItem key={index}>
                          <ShortcutDescription>
                            {shortcut.description}
                          </ShortcutDescription>
                          <ShortcutKeys>
                            {formatShortcut(shortcut).map((key, keyIndex) => (
                              <ShortcutKey key={keyIndex}>{key}</ShortcutKey>
                            ))}
                          </ShortcutKeys>
                        </ShortcutItem>
                      ))}
                    </ShortcutGroup>
                  ))}
                </ShortcutHelpContent>
              </ShortcutHelpPanel>
            </ShortcutHelpOverlay>
          )}
        </AnimatePresence>
      </div>
    </KeyboardNavigationContext.Provider>
  );
};

// 快捷键注册Hook
export const useShortcut = (shortcut: Omit<FigmaShortcut, 'action'>, action: () => void) => {
  const { registerShortcut } = useKeyboardNavigation();

  useEffect(() => {
    return registerShortcut({ ...shortcut, action });
  }, [registerShortcut, action, shortcut.key, shortcut.modifiers?.join(','), shortcut.context]);
};

// 上下文管理Hook
export const useKeyboardContext = (context: string) => {
  const { pushContext, popContext } = useKeyboardNavigation();

  useEffect(() => {
    pushContext(context);
    return () => popContext();
  }, [context, pushContext, popContext]);
};

// 焦点管理Hook
export const useFocusManagement = (
  containerRef: React.RefObject<HTMLElement>,
  options: {
    autoFocus?: boolean;
    restoreFocus?: boolean;
    trapFocus?: boolean;
  } = {}
) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (options.restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    if (options.autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    return () => {
      if (options.restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [options.autoFocus, options.restoreFocus]);
};