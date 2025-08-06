import React from 'react';
import styled from 'styled-components';
import { IconButton, Button, Tooltip } from '../../ui';
import { useAppStore } from '../../stores/appStore';
import { useCanvasStore } from '../../stores/canvasStore';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CopyIcon,
  ClipboardCopyIcon,
  TrashIcon,
  GroupIcon,
  AlignLeftIcon,
  AlignCenterHorizontallyIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignCenterVerticallyIcon,
  AlignBottomIcon,
  StretchHorizontallyIcon,
  StretchVerticallyIcon
} from '@radix-ui/react-icons';

const MainToolbarContainer = styled.div`
  height: 48px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ToolbarSeparator = styled.div`
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 8px;
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const ZoomDisplay = styled.div`
  font-size: 12px;
  color: #6b7280;
  min-width: 48px;
  text-align: center;
`;

const ZoomIcon = styled.span`
  font-size: 14px;
  font-weight: bold;
`;

const MainToolbar: React.FC = () => {
  const { 
    selectedElements, 
    clearSelection,
    // TODO: 添加这些操作函数
    // duplicateElements,
    // deleteElements,
    // groupElements,
    // ungroupElements,
    // alignElements,
    // distributeElements
  } = useAppStore();
  
  const { 
    zoom, 
    zoomIn, 
    zoomOut, 
    resetView, 
    zoomToFit 
  } = useCanvasStore();

  const hasSelection = selectedElements.length > 0;
  const hasMultipleSelection = selectedElements.length > 1;

  // 历史操作
  const handleUndo = () => {
    // TODO: 实现撤销功能
    console.log('Undo');
  };

  const handleRedo = () => {
    // TODO: 实现重做功能
    console.log('Redo');
  };

  // 编辑操作
  const handleCopy = () => {
    if (hasSelection) {
      // TODO: 实现复制功能
      console.log('Copy selected elements:', selectedElements);
    }
  };

  const handlePaste = () => {
    // TODO: 实现粘贴功能
    console.log('Paste');
  };

  const handleDelete = () => {
    if (hasSelection) {
      // TODO: 实现删除功能
      console.log('Delete selected elements:', selectedElements);
      clearSelection();
    }
  };

  const handleDuplicate = () => {
    if (hasSelection) {
      // TODO: 实现复制功能
      console.log('Duplicate selected elements:', selectedElements);
    }
  };

  // 分组操作
  const handleGroup = () => {
    if (hasMultipleSelection) {
      // TODO: 实现分组功能
      console.log('Group selected elements:', selectedElements);
    }
  };

  const handleUngroup = () => {
    if (hasSelection) {
      // TODO: 实现取消分组功能
      console.log('Ungroup selected elements:', selectedElements);
    }
  };

  // 对齐操作
  const handleAlign = (type: string) => {
    if (hasMultipleSelection) {
      // TODO: 实现对齐功能
      console.log(`Align ${type}:`, selectedElements);
    }
  };

  // 分布操作
  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (selectedElements.length >= 3) {
      // TODO: 实现分布功能
      console.log(`Distribute ${direction}:`, selectedElements);
    }
  };

  return (
    <MainToolbarContainer>
      {/* 历史操作 */}
      <ToolbarSection>
        <Tooltip content="撤销 (Ctrl+Z)">
          <IconButton
            icon={<ArrowLeftIcon />}
            onClick={handleUndo}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <Tooltip content="重做 (Ctrl+Y)">
          <IconButton
            icon={<ArrowRightIcon />}
            onClick={handleRedo}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
      </ToolbarSection>

      <ToolbarSeparator />

      {/* 编辑操作 */}
      <ToolbarSection>
        <Tooltip content="复制 (Ctrl+C)">
          <IconButton
            icon={<CopyIcon />}
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            disabled={!hasSelection}
          />
        </Tooltip>
        <Tooltip content="粘贴 (Ctrl+V)">
          <IconButton
            icon={<ClipboardCopyIcon />}
            onClick={handlePaste}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <Tooltip content="复制 (Ctrl+D)">
          <IconButton
            icon={<CopyIcon />}
            onClick={handleDuplicate}
            variant="ghost"
            size="sm"
            disabled={!hasSelection}
          />
        </Tooltip>
        <Tooltip content="删除 (Delete)">
          <IconButton
            icon={<TrashIcon />}
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            disabled={!hasSelection}
          />
        </Tooltip>
      </ToolbarSection>

      <ToolbarSeparator />

      {/* 分组操作 */}
      <ToolbarSection>
        <Tooltip content="分组 (Ctrl+G)">
          <IconButton
            icon={<GroupIcon />}
            onClick={handleGroup}
            variant="ghost"
            size="sm"
            disabled={!hasMultipleSelection}
          />
        </Tooltip>
        <Tooltip content="取消分组 (Ctrl+Shift+G)">
          <IconButton
            icon={<GroupIcon />}
            onClick={handleUngroup}
            variant="ghost"
            size="sm"
            disabled={!hasSelection}
          />
        </Tooltip>
      </ToolbarSection>

      <ToolbarSeparator />

      {/* 对齐操作 */}
      <ToolbarSection>
        <Tooltip content="左对齐">
          <IconButton
            icon={<AlignLeftIcon />}
            onClick={() => handleAlign('left')}
            variant="ghost"
            size="sm"
            disabled={!hasMultipleSelection}
          />
        </Tooltip>
        <Tooltip content="水平居中">
          <IconButton
            icon={<AlignCenterHorizontallyIcon />}
            onClick={() => handleAlign('center-horizontal')}
            variant="ghost"
            size="sm"
            disabled={!hasMultipleSelection}
          />
        </Tooltip>
        <Tooltip content="右对齐">
          <IconButton
            icon={<AlignRightIcon />}
            onClick={() => handleAlign('right')}
            variant="ghost"
            size="sm"
            disabled={!hasMultipleSelection}
          />
        </Tooltip>
        <Tooltip content="顶部对齐">
          <IconButton
            icon={<AlignTopIcon />}
            onClick={() => handleAlign('top')}
            variant="ghost"
            size="sm"
            disabled={!hasMultipleSelection}
          />
        </Tooltip>
        <Tooltip content="垂直居中">
          <IconButton
            icon={<AlignCenterVerticallyIcon />}
            onClick={() => handleAlign('center-vertical')}
            variant="ghost"
            size="sm"
            disabled={!hasMultipleSelection}
          />
        </Tooltip>
        <Tooltip content="底部对齐">
          <IconButton
            icon={<AlignBottomIcon />}
            onClick={() => handleAlign('bottom')}
            variant="ghost"
            size="sm"
            disabled={!hasMultipleSelection}
          />
        </Tooltip>
      </ToolbarSection>

      <ToolbarSeparator />

      {/* 分布操作 */}
      <ToolbarSection>
        <Tooltip content="水平分布">
          <IconButton
            icon={<StretchHorizontallyIcon />}
            onClick={() => handleDistribute('horizontal')}
            variant="ghost"
            size="sm"
            disabled={selectedElements.length < 3}
          />
        </Tooltip>
        <Tooltip content="垂直分布">
          <IconButton
            icon={<StretchVerticallyIcon />}
            onClick={() => handleDistribute('vertical')}
            variant="ghost"
            size="sm"
            disabled={selectedElements.length < 3}
          />
        </Tooltip>
      </ToolbarSection>

      {/* 缩放控制 */}
      <ZoomControls>
        <Tooltip content="缩小">
          <IconButton
            icon={<ZoomIcon>-</ZoomIcon>}
            onClick={zoomOut}
            variant="ghost"
            size="sm"
            disabled={zoom <= 25}
          />
        </Tooltip>
        
        <ZoomDisplay>{zoom}%</ZoomDisplay>
        
        <Tooltip content="放大">
          <IconButton
            icon={<ZoomIcon>+</ZoomIcon>}
            onClick={zoomIn}
            variant="ghost"
            size="sm"
            disabled={zoom >= 400}
          />
        </Tooltip>
        
        <Tooltip content="适应窗口">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomToFit}
          >
            适应
          </Button>
        </Tooltip>
        
        <Tooltip content="重置视图">
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
          >
            100%
          </Button>
        </Tooltip>
      </ZoomControls>
    </MainToolbarContainer>
  );
};

export default MainToolbar;