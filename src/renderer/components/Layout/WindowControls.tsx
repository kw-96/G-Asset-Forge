import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
`;

const CtrlBtn = styled.button<{ $danger?: boolean }>`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  padding: 0;

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
        cleanup = window.electronAPI.windowControl.onMaximizeChange((v) => setIsMaximized(!!v));
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
      <CtrlBtn aria-label="最小化" title="最小化" onClick={handleMinimize}>—</CtrlBtn>
      <CtrlBtn aria-label={isMaximized ? '还原' : '最大化'} title={isMaximized ? '还原' : '最大化'} onClick={handleMaxToggle}>
        {isMaximized ? '▢' : '□'}
      </CtrlBtn>
      <CtrlBtn aria-label="关闭" title="关闭" onClick={handleClose} $danger>×</CtrlBtn>
    </Container>
  );
};

export default WindowControls;


