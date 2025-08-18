/**
 * 布局预览组件
 * 提供实时的布局配置预览功能
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLayoutConfig, LAYOUT_PRESETS } from '../../../logic/contexts/LayoutContext';
import { EnhancedButton } from '../Enhanced/EnhancedButton';
import { EnhancedIconButton } from '../Enhanced/EnhancedIconButton';
import { SvgIcon } from '../../components/atoms/Icon/SvgIcon';

// 样式组件
const PreviewContainer = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 400px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: ${props => props.theme.shadows.strong};
  z-index: 1001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const PreviewContent = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const PresetCard = styled(motion.div)<{ $active: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.$active ? props.theme.colors.primary + '10' : props.theme.colors.background.secondary};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary + '20'};
  }
`;

const PresetName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const PresetDescription = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const PreviewMiniLayout = styled.div`
  width: 100%;
  height: 60px;
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: 4px;
  margin-top: 8px;
  display: flex;
  overflow: hidden;
`;

const MiniPanel = styled.div<{ $width: number; $visible: boolean }>`
  width: ${props => props.$visible ? `${props.$width}px` : '0px'};
  background: ${props => props.theme.colors.background.hover};
  border-right: 1px solid ${props => props.theme.colors.border.subtle};
  transition: width 0.2s ease;
  flex-shrink: 0;
`;

const MiniCanvas = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${props => props.theme.colors.text.secondary};
`;

const PreviewActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

// 组件属性
interface LayoutPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 布局预览组件
 */
export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    applyPreset, 
    setPreviewMode,
    setPreviewConfig,
  } = useLayoutConfig();
  
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof LAYOUT_PRESETS | null>(null);

  // 处理预设选择
  const handlePresetSelect = useCallback((presetName: keyof typeof LAYOUT_PRESETS) => {
    setSelectedPreset(presetName);
    const preset = LAYOUT_PRESETS[presetName];
    setPreviewConfig(preset.config);
  }, [setPreviewConfig]);

  // 应用预设
  const handleApplyPreset = useCallback(() => {
    if (selectedPreset) {
      applyPreset(selectedPreset);
      setPreviewMode(false);
      onClose();
    }
  }, [selectedPreset, applyPreset, setPreviewMode, onClose]);

  // 取消预览
  const handleCancel = useCallback(() => {
    setPreviewConfig(null);
    setPreviewMode(false);
    setSelectedPreset(null);
    onClose();
  }, [setPreviewConfig, setPreviewMode, onClose]);

  // 渲染迷你布局预览
  const renderMiniLayout = (layoutConfig: any) => (
    <PreviewMiniLayout>
      <MiniPanel 
        $width={layoutConfig.leftPanelWidth / 4} 
        $visible={layoutConfig.leftPanelVisible}
      />
      <MiniCanvas>画布</MiniCanvas>
      <MiniPanel 
        $width={layoutConfig.rightPanelWidth / 4} 
        $visible={layoutConfig.rightPanelVisible}
      />
    </PreviewMiniLayout>
  );

  if (!isOpen) return null;

  return (
    <PreviewContainer
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <PreviewHeader>
        <PreviewTitle>布局预设</PreviewTitle>
        <EnhancedIconButton
          icon={<SvgIcon name="icon.16.close" size={16} title="关闭" />}
          onClick={handleCancel}
          enableFigmaInteractions={true}
          enableTooltip={true}
          tooltipContent="关闭预览"
          aria-label="关闭预览"
        />
      </PreviewHeader>

      <PreviewContent>
        <PresetGrid>
          {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => (
            <PresetCard
              key={key}
              $active={selectedPreset === key}
              onClick={() => handlePresetSelect(key as keyof typeof LAYOUT_PRESETS)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PresetName>{preset.name}</PresetName>
              <PresetDescription>{preset.description}</PresetDescription>
              {renderMiniLayout(preset.config)}
            </PresetCard>
          ))}
        </PresetGrid>

        {selectedPreset && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PresetName>预览: {LAYOUT_PRESETS[selectedPreset].name}</PresetName>
            <PresetDescription>
              {LAYOUT_PRESETS[selectedPreset].description}
            </PresetDescription>
          </motion.div>
        )}
      </PreviewContent>

      <PreviewActions>
        <ActionGroup>
          <EnhancedButton
            onClick={handleCancel}
            enableFigmaInteractions={true}
            variant="secondary"
          >
            取消
          </EnhancedButton>
        </ActionGroup>
        
        <ActionGroup>
          {selectedPreset && (
            <EnhancedButton
              onClick={handleApplyPreset}
              enableFigmaInteractions={true}
              variant="primary"
            >
              应用 {LAYOUT_PRESETS[selectedPreset].name}
            </EnhancedButton>
          )}
        </ActionGroup>
      </PreviewActions>
    </PreviewContainer>
  );
};

export default LayoutPreview;