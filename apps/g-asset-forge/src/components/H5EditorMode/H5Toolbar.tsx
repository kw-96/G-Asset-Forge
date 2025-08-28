import './H5Toolbar.scss';

import { Button } from '@g-asset-forge/components';
import { type FC } from 'react';

import { SvgIcon } from '../../components/SvgIcon';

interface H5ToolbarProps {
  onAddTextBlock: () => void;
  onAddImageBlock: () => void;
  onAddButtonBlock: () => void;
  onDeleteSelected: () => void;
  onTogglePreview: () => void;
  onExport: () => void;
  onSettings: () => void;
  hasSelection: boolean;
  isPreviewMode: boolean;
}

export const H5Toolbar: FC<H5ToolbarProps> = ({
  onAddTextBlock,
  onAddImageBlock,
  onAddButtonBlock,
  onDeleteSelected,
  onTogglePreview,
  onExport,
  onSettings,
  hasSelection,
  isPreviewMode,
}) => {
  return (
    <div className="h5-toolbar">
      {/* 添加内容块组 */}
      <div className="toolbar-group">
        <div className="group-label">添加内容</div>
        <div className="group-buttons">
          <Button onClick={onAddTextBlock}>
            <SvgIcon name="icon.24.text" />
            文本
          </Button>

          <Button onClick={onAddImageBlock}>
            <SvgIcon name="icon.24.image" />
            图片
          </Button>

          <Button onClick={onAddButtonBlock}>
            <SvgIcon name="icon.24.button" />
            按钮
          </Button>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="toolbar-divider" />

      {/* 编辑操作组 */}
      <div className="toolbar-group">
        <div className="group-label">编辑操作</div>
        <div className="group-buttons">
          <Button
            onClick={onDeleteSelected}
            style={{
              opacity: hasSelection ? 1 : 0.5,
              pointerEvents: hasSelection ? 'auto' : 'none',
            }}
          >
            <SvgIcon name="icon.24.delete" />
            删除
          </Button>

          <Button onClick={onSettings}>
            <SvgIcon name="icon.24.settings" />
            设置
          </Button>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="toolbar-divider" />

      {/* 预览和导出组 */}
      <div className="toolbar-group">
        <div className="group-label">预览导出</div>
        <div className="group-buttons">
          <Button
            onClick={onTogglePreview}
            style={{
              backgroundColor: isPreviewMode ? '#007AFF' : 'transparent',
              color: isPreviewMode ? 'white' : 'inherit',
            }}
          >
            <SvgIcon name="icon.24.preview" />
            {isPreviewMode ? '退出预览' : '预览'}
          </Button>

          <Button onClick={onExport}>
            <SvgIcon name="icon.24.download" />
            导出
          </Button>
        </div>
      </div>

      {/* 快捷键提示 */}
      <div className="toolbar-shortcuts">
        <div className="shortcuts-item">
          <kbd>T</kbd> 文本块
        </div>
        <div className="shortcuts-item">
          <kbd>I</kbd> 图片块
        </div>
        <div className="shortcuts-item">
          <kbd>B</kbd> 按钮块
        </div>
        <div className="shortcuts-item">
          <kbd>Del</kbd> 删除
        </div>
        <div className="shortcuts-item">
          <kbd>P</kbd> 预览
        </div>
      </div>
    </div>
  );
};
