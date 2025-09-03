/**
 * 设置面板组件
 * 包含自动导出设置和其他应用设置
 */

import React, { useEffect, useState } from 'react';

// import { FormattedMessage } from 'react-intl'; // 暂时未使用
import { SvgIcon } from '../SvgIcon';

export interface SettingsPanelProps {
  onAutoExportToggle?: (enabled: boolean) => void;
  onRequestFileSystemPermission?: () => Promise<boolean>;
  autoExportInfo?: {
    isSupported: boolean;
    method: 'electron' | 'directory' | 'download';
    description: string;
    isOptimal: boolean;
    browserInfo: any;
  };
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onAutoExportToggle,
  onRequestFileSystemPermission,
  autoExportInfo,
}) => {
  const [autoExportEnabled, setAutoExportEnabled] = useState(false);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);

  useEffect(() => {
    // 从本地存储加载设置
    const saved = localStorage.getItem('autoExportEnabled');
    if (saved !== null) {
      setAutoExportEnabled(JSON.parse(saved));
    }
  }, []);

  const handleAutoExportToggle = (enabled: boolean) => {
    setAutoExportEnabled(enabled);
    localStorage.setItem('autoExportEnabled', JSON.stringify(enabled));
    onAutoExportToggle?.(enabled);
  };

  const handleRequestPermission = async () => {
    if (onRequestFileSystemPermission) {
      const success = await onRequestFileSystemPermission();
      if (success) {
        setShowPermissionRequest(false);
        alert('文件系统访问权限已获取！');
      } else {
        alert('无法获取文件系统访问权限，将使用下载模式。');
      }
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'electron':
        return 'icon.24.desktop';
      case 'directory':
        return 'icon.24.folder';
      case 'download':
        return 'icon.24.download';
      default:
        return 'icon.24.info';
    }
  };

  const getMethodColor = (method: string, isOptimal: boolean) => {
    if (isOptimal) {
      return '#52c41a'; // 绿色
    } else {
      return '#faad14'; // 橙色
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-section">
        <h3 className="settings-section__title">
          <SvgIcon name="icon.24.export" size={16} />
          自动导出设置
        </h3>

        <div className="settings-item">
          <div className="settings-item__content">
            <div className="settings-item__label">
              <span>启用自动导出</span>
              <span className="settings-item__description">
                项目保存时自动导出 GAF 文件
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoExportEnabled}
                onChange={(e) => handleAutoExportToggle(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        {autoExportInfo && (
          <div className="settings-item">
            <div className="settings-item__content">
              <div className="settings-item__label">
                <span>导出方式</span>
                <span className="settings-item__description">
                  {autoExportInfo.description}
                </span>
              </div>
              <div
                className="export-method-indicator"
                style={{
                  color: getMethodColor(
                    autoExportInfo.method,
                    autoExportInfo.isOptimal,
                  ),
                }}
              >
                <SvgIcon
                  name={getMethodIcon(autoExportInfo.method)}
                  size={16}
                />
                <span>{autoExportInfo.method}</span>
              </div>
            </div>
          </div>
        )}

        {autoExportInfo &&
          autoExportInfo.method === 'directory' &&
          !showPermissionRequest && (
            <div className="settings-item">
              <button
                className="permission-button"
                onClick={() => setShowPermissionRequest(true)}
              >
                <SvgIcon name="icon.24.key" size={16} />
                请求文件系统权限
              </button>
            </div>
          )}

        {showPermissionRequest && (
          <div className="settings-item">
            <div className="permission-request">
              <p>需要获取文件系统访问权限以启用目录导出功能。</p>
              <div className="permission-actions">
                <button
                  className="permission-button permission-button--primary"
                  onClick={handleRequestPermission}
                >
                  授权
                </button>
                <button
                  className="permission-button permission-button--secondary"
                  onClick={() => setShowPermissionRequest(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {autoExportInfo && autoExportInfo.browserInfo && (
          <div className="settings-item">
            <div className="settings-item__content">
              <div className="settings-item__label">
                <span>浏览器信息</span>
                <span className="settings-item__description">
                  {autoExportInfo.browserInfo.browser}
                  {autoExportInfo.browserInfo.warning && (
                    <span className="warning-text">
                      {' - '}
                      {autoExportInfo.browserInfo.warning}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3 className="settings-section__title">
          <SvgIcon name="icon.24.settings" size={16} />
          其他设置
        </h3>

        <div className="settings-item">
          <div className="settings-item__content">
            <div className="settings-item__label">
              <span>主题设置</span>
              <span className="settings-item__description">切换应用主题</span>
            </div>
            <div className="theme-selector">
              <button className="theme-button theme-button--active">
                浅色主题
              </button>
              <button className="theme-button">深色主题</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
