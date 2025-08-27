/**
 * 窗口控制组件
 * 提供窗口最小化、最大化、关闭等操作
 */

import React, { useEffect, useState, useCallback } from 'react';
import { SvgIcon } from '../SvgIcon';
import './WindowControls.scss';

// 声明全局类型
declare global {
  interface Window {
    electronAPI: {
      windowControl: {
        minimize: () => void;
        maximize: () => void;
        restore: () => void;
        close: () => void;
        isMaximized: () => Promise<any>;
        onMaximizeChange: (callback: (value: boolean) => void) => (() => void) | void;
        resize: (width: number, height: number, resizable?: boolean) => Promise<any>;
      };
    };
  }
}

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
    <div className="window-controls">
      <button className="ctrl-btn" aria-label="最小化" title="最小化" onClick={handleMinimize}>
        <SvgIcon name="icon.24.stroke-solid" size={24} title="最小化" />
      </button>
      <button className="ctrl-btn" aria-label={isMaximized ? '还原' : '最大化'} title={isMaximized ? '还原' : '最大化'} onClick={handleMaxToggle}>
        <SvgIcon 
          name={isMaximized ? "icon.24.collapse" : "icon.24.expand"} 
          size={24} 
          title={isMaximized ? '还原' : '最大化'} 
        />
      </button>
      <button className="ctrl-btn danger" aria-label="关闭" title="关闭" onClick={handleClose}>
        <SvgIcon name="icon.24.close" size={24} title="关闭" />
      </button>
    </div>
  );
};

export default WindowControls;
