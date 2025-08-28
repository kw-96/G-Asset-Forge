/**
 * 通用弹窗组件 - 基于现有弹窗组件创建面板弹窗管理系统
 */
import './Modal.scss';

import React, { useCallback, useEffect } from 'react';

import { SvgIcon } from '../SvgIcon';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'large',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  // 处理ESC键关闭
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // 处理点击遮罩关闭
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose],
  );

  // 阻止滚动穿透
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`modal-overlay modal-overlay--${size} ${className || ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal modal--${size}`}>
        {(title || showCloseButton) && (
          <div className="modal__header">
            {title && <h3 className="modal__title">{title}</h3>}
            {showCloseButton && (
              <button
                type="button"
                className="modal__close-btn"
                onClick={onClose}
                title="关闭"
              >
                <SvgIcon name="icon.16.close" size={16} />
              </button>
            )}
          </div>
        )}

        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};
