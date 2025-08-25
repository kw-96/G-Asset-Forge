/**
 * 窗口控制组件
 * 提供窗口最小化、最大化、关闭等操作
 */

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../components/atoms/Icon/SvgIcon';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
`;

const CtrlBtn = styled.button<{ $danger?: boolean }>`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 12px;

  &:hover {
    background: ${({ theme }) => theme.colors.interaction?.hover || 'rgba(0,0,0,0.04)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  ${({ $danger, theme }) => $danger && `
    &:hover { color: ${theme.colors.status.error}; }
  `}
`;

export const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const init = async () => {
      try {
        const res = await window.electronAPI.windowControl.isMaximized();
        if (res && (res as any).success) setIsMaximized(!!(res as any).data);
      } catch {}
      try {
        // NOTE: onMaximizeChange 可能未返回清理函数，需兼容处理
        const unsubscribe = window.electronAPI.windowControl.onMaximizeChange((v: boolean) => setIsMaximized(!!v));
        if (typeof unsubscribe === 'function') {
          cleanup = unsubscribe;
        } else {
          cleanup = undefined;
        }
      } catch {}
    };
    init();
    return () => { cleanup?.(); };
  }, []);

  const handleMinimize = useCallback(() => {
    window.electronAPI.windowControl.minimize();
  }, []);

  const handleMaxToggle = useCallback(() => {
    if (isMaximized) {
      window.electronAPI.windowControl.restore();
    } else {
      window.electronAPI.windowControl.maximize();
    }
  }, [isMaximized]);

  const handleClose = useCallback(() => {
    window.electronAPI.windowControl.close();
  }, []);

  return (
    <Container>
      <CtrlBtn aria-label="最小化" title="最小化" onClick={handleMinimize}>
        <SvgIcon name="icon.24.stroke-solid" size={20} title="最小化" />
      </CtrlBtn>
      <CtrlBtn aria-label={isMaximized ? '还原' : '最大化'} title={isMaximized ? '还原' : '最大化'} onClick={handleMaxToggle}>
        {isMaximized
          ? <SvgIcon name="icon.24.collapse" size={20} title="还原" />
          : <SvgIcon name="icon.24.expand" size={20} title="最大化" />}
      </CtrlBtn>
      <CtrlBtn aria-label="关闭" title="关闭" onClick={handleClose} $danger>
        <SvgIcon name="icon.24.close" size={20} title="关闭" />
      </CtrlBtn>
    </Container>
  );
};

export default WindowControls;


