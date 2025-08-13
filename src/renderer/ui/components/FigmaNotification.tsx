import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { css } from 'styled-components';
import { useTheme } from '../theme/ThemeProvider';

// Figma风格通知类型
export type FigmaNotificationType = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type FigmaNotificationPosition = 
  | 'top-right' 
  | 'top-center' 
  | 'top-left'
  | 'bottom-right' 
  | 'bottom-center'
  | 'bottom-left';

export interface FigmaNotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  shortcut?: string;
}

export interface FigmaNotificationProps {
  id?: string;
  type: FigmaNotificationType;
  title: string;
  message?: string;
  duration?: number;
  position?: FigmaNotificationPosition;
  actions?: FigmaNotificationAction[];
  icon?: React.ReactNode;
  dismissible?: boolean;
  compact?: boolean;
  showProgress?: boolean;
  onClose?: () => void;
  onAction?: (actionIndex: number) => void;
}

// 通知容器位置样式
const getPositionStyles = (position: FigmaNotificationPosition) => {
  const positions = {
    'top-right': css`
      top: 16px;
      right: 16px;
      align-items: flex-end;
    `,
    'top-center': css`
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      align-items: center;
    `,
    'top-left': css`
      top: 16px;
      left: 16px;
      align-items: flex-start;
    `,
    'bottom-right': css`
      bottom: 16px;
      right: 16px;
      align-items: flex-end;
    `,
    'bottom-center': css`
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      align-items: center;
    `,
    'bottom-left': css`
      bottom: 16px;
      left: 16px;
      align-items: flex-start;
    `,
  };
  
  return positions[position];
};

// 通知类型样式
const getTypeStyles = (type: FigmaNotificationType, theme: any) => {
  const styles = {
    success: css`
      background: ${theme.colors.semantic.success[50]};
      border-color: ${theme.colors.semantic.success[200]};
      color: ${theme.colors.semantic.success[800]};
      
      .notification-icon {
        color: ${theme.colors.semantic.success[600]};
      }
    `,
    error: css`
      background: ${theme.colors.semantic.error[50]};
      border-color: ${theme.colors.semantic.error[200]};
      color: ${theme.colors.semantic.error[800]};
      
      .notification-icon {
        color: ${theme.colors.semantic.error[600]};
      }
    `,
    warning: css`
      background: ${theme.colors.semantic.warning[50]};
      border-color: ${theme.colors.semantic.warning[200]};
      color: ${theme.colors.semantic.warning[800]};
      
      .notification-icon {
        color: ${theme.colors.semantic.warning[600]};
      }
    `,
    info: css`
      background: ${theme.colors.semantic.info[50]};
      border-color: ${theme.colors.semantic.info[200]};
      color: ${theme.colors.semantic.info[800]};
      
      .notification-icon {
        color: ${theme.colors.semantic.info[600]};
      }
    `,
    neutral: css`
      background: ${theme.colors.surface};
      border-color: ${theme.colors.border.default};
      color: ${theme.colors.text.primary};
      
      .notification-icon {
        color: ${theme.colors.text.secondary};
      }
    `,
  };
  
  return styles[type];
};

// 通知容器
const NotificationContainer = styled.div<{ $position: FigmaNotificationPosition }>`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.toast};
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
  pointer-events: none;
  
  ${({ $position }) => getPositionStyles($position)}
`;

// 单个通知
const NotificationCard = styled(motion.div)<{ 
  $type: FigmaNotificationType; 
  $compact: boolean;
}>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: ${({ $compact }) => $compact ? '12px' : '16px'};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  max-width: 400px;
  min-width: 300px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  
  ${({ $type, theme }) => getTypeStyles($type, theme)}
`;

// 通知图标
const NotificationIcon = styled.div`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
`;

// 通知内容
const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.div<{ $compact: boolean }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ $compact, theme }) => 
    $compact ? theme.typography.fontSize.sm : theme.typography.fontSize.base};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  margin-bottom: ${({ $compact }) => $compact ? '2px' : '4px'};
`;

const NotificationMessage = styled.div<{ $compact: boolean }>`
  font-size: ${({ $compact, theme }) => 
    $compact ? theme.typography.fontSize.xs : theme.typography.fontSize.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  opacity: 0.8;
`;

// 通知操作按钮
const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const NotificationAction = styled.button<{ $variant: 'primary' | 'secondary' | 'ghost' }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} 
              ${({ theme }) => theme.animation.easing.easeOut};
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: ${theme.colors.primary};
          color: white;
          border: 1px solid ${theme.colors.primary};
          
          &:hover {
            background: ${theme.colors.secondary};
            border-color: ${theme.colors.secondary};
          }
        `;
      case 'secondary':
        return css`
          background: ${theme.colors.surface};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border.default};
          
          &:hover {
            background: ${theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
            border-color: ${theme.colors.border.hover};
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text.secondary};
          border: 1px solid transparent;
          
          &:hover {
            background: ${theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
            color: ${theme.colors.text.primary};
          }
        `;
      default:
        return css``;
    }
  }}
`;

// 关闭按钮
const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  opacity: 0.6;
  transition: all ${({ theme }) => theme.animation.duration.fast} 
              ${({ theme }) => theme.animation.easing.easeOut};
  
  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.colors.interaction?.hover || 'rgba(0, 0, 0, 0.04)'};
  }
`;

// 进度条
const ProgressBar = styled(motion.div)<{ $type: FigmaNotificationType }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${({ $type, theme }) => {
    switch ($type) {
      case 'success': return theme.colors.semantic.success[500];
      case 'error': return theme.colors.semantic.error[500];
      case 'warning': return theme.colors.semantic.warning[500];
      case 'info': return theme.colors.semantic.info[500];
      default: return theme.colors.primary;
    }
  }};
  transform-origin: left;
`;

// 默认图标
const getDefaultIcon = (type: FigmaNotificationType) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    neutral: '○',
  };
  
  return icons[type];
};

// 单个通知组件
export const FigmaNotification: React.FC<FigmaNotificationProps & { 
  onRemove: () => void;
}> = ({
  id: _id, // 用于外部引用，组件内部不需要使用
  type,
  title,
  message,
  duration = 5000,
  actions = [],
  icon,
  dismissible = true,
  compact = false,
  showProgress = false,
  onClose,
  onAction,
  onRemove,
}) => {
  const { reducedMotion } = useTheme();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            onRemove();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration, onRemove]);

  const handleClose = useCallback(() => {
    onClose?.();
    onRemove();
  }, [onClose, onRemove]);

  const handleAction = useCallback((index: number, action: FigmaNotificationAction) => {
    action.onClick();
    onAction?.(index);
    onRemove();
  }, [onAction, onRemove]);

  return (
    <NotificationCard
      $type={type}
      $compact={compact}
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{
        duration: reducedMotion ? 0 : 0.2,
        ease: 'easeOut'
      }}
      layout={!reducedMotion}
    >
      {/* 图标 */}
      <NotificationIcon className="notification-icon">
        {icon || getDefaultIcon(type)}
      </NotificationIcon>

      {/* 内容 */}
      <NotificationContent>
        <NotificationTitle $compact={compact}>
          {title}
        </NotificationTitle>
        
        {message && (
          <NotificationMessage $compact={compact}>
            {message}
          </NotificationMessage>
        )}

        {/* 操作按钮 */}
        {actions.length > 0 && (
          <NotificationActions>
            {actions.map((action, index) => (
              <NotificationAction
                key={index}
                $variant={action.variant || 'secondary'}
                onClick={() => handleAction(index, action)}
                title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
              >
                {action.label}
                {action.shortcut && (
                  <span style={{ opacity: 0.6, marginLeft: '4px' }}>
                    {action.shortcut}
                  </span>
                )}
              </NotificationAction>
            ))}
          </NotificationActions>
        )}
      </NotificationContent>

      {/* 关闭按钮 */}
      {dismissible && (
        <CloseButton onClick={handleClose} title="关闭 (Esc)">
          ✕
        </CloseButton>
      )}

      {/* 进度条 */}
      {showProgress && duration > 0 && (
        <ProgressBar
          $type={type}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      )}
    </NotificationCard>
  );
};

// 通知管理器上下文
interface NotificationContextType {
  notifications: (FigmaNotificationProps & { id: string })[];
  show: (notification: Omit<FigmaNotificationProps, 'id'>) => string;
  hide: (id: string) => void;
  clear: () => void;
  update: (id: string, updates: Partial<FigmaNotificationProps>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// 通知提供者
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<(FigmaNotificationProps & { id: string })[]>([]);

  const show = useCallback((notification: Omit<FigmaNotificationProps, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const hide = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  const update = useCallback((id: string, updates: Partial<FigmaNotificationProps>) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, ...updates } : n)
    );
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    show,
    hide,
    clear,
    update,
  };

  // 连接全局通知管理器
  useEffect(() => {
    figmaNotifications.setContext(contextValue);
  }, [contextValue]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationRenderer />
    </NotificationContext.Provider>
  );
};

// 通知渲染器
const NotificationRenderer: React.FC = () => {
  const { notifications, hide } = useNotifications();

  // 按位置分组通知
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const position = notification.position || 'top-right';
    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(notification);
    return groups;
  }, {} as Record<FigmaNotificationPosition, typeof notifications>);

  return (
    <>
      {Object.entries(groupedNotifications).map(([position, positionNotifications]) => (
        <NotificationContainer key={position} $position={position as FigmaNotificationPosition}>
          <AnimatePresence>
            {positionNotifications.map((notification) => (
              <FigmaNotification
                key={notification.id}
                {...notification}
                onRemove={() => hide(notification.id)}
              />
            ))}
          </AnimatePresence>
        </NotificationContainer>
      ))}
    </>
  );
};

// 便捷方法
export const createNotificationManager = () => {
  let contextRef: NotificationContextType | null = null;

  const setContext = (context: NotificationContextType) => {
    contextRef = context;
  };

  const getContext = () => {
    if (!contextRef) {
      throw new Error('Notification manager not initialized. Make sure to wrap your app with NotificationProvider.');
    }
    return contextRef;
  };

  return {
    setContext,
    show: (notification: Omit<FigmaNotificationProps, 'id'>) => getContext().show(notification),
    showSuccess: (title: string, options?: Partial<FigmaNotificationProps>) => 
      getContext().show({ type: 'success', title, ...options }),
    showError: (title: string, options?: Partial<FigmaNotificationProps>) => 
      getContext().show({ type: 'error', title, ...options }),
    showWarning: (title: string, options?: Partial<FigmaNotificationProps>) => 
      getContext().show({ type: 'warning', title, ...options }),
    showInfo: (title: string, options?: Partial<FigmaNotificationProps>) => 
      getContext().show({ type: 'info', title, ...options }),
    showProgress: (title: string, progress: number, options?: Partial<FigmaNotificationProps>) => 
      getContext().show({ type: 'info', title, showProgress: true, duration: 0, message: `${progress}%`, ...options }),
    hide: (id: string) => getContext().hide(id),
    clear: () => getContext().clear(),
    update: (id: string, updates: Partial<FigmaNotificationProps>) => 
      getContext().update(id, updates),
  };
};

// 全局通知管理器实例
export const figmaNotifications = createNotificationManager();

// Hook for connecting the manager to the context
export const useNotificationManager = () => {
  const context = useNotifications();
  
  useEffect(() => {
    figmaNotifications.setContext(context);
  }, [context]);

  return context;
};