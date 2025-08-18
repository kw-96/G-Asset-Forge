/**
 * 设置模态框组件
 * 包含布局自定义、主题设置、性能配置等选项
 */

import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FigmaLayoutCustomizer, 
  // LayoutConfigManager, 
  LayoutPreview,
  LayoutConfigManagerComponent,
  type LayoutConfig, 
  ExtendedLayoutConfig
} from '../Layout';
import { useTheme } from '../../theme/ThemeProvider';
import { useUIIntegration } from '../UIIntegration/UIIntegrationProvider';
import { UIFeature } from '../UIIntegration/UIIntegrationProvider';
import { EnhancedButton } from '../Enhanced/EnhancedButton';
import { EnhancedIconButton } from '../Enhanced/EnhancedIconButton';
import { useLayoutConfig } from '../../../logic/contexts/LayoutContext';
import { SvgIcon } from '../../components/atoms/Icon/SvgIcon';

// 设置页面类型
type SettingsPage = 'general' | 'layout' | 'performance' | 'accessibility' | 'about';

// 组件属性接口
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: SettingsPage;
}

// 样式组件
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled(motion.div)`
  width: 90vw;
  max-width: 900px;
  height: 80vh;
  max-height: 700px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: ${props => props.theme.shadows.strong};
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 200px;
  background: ${props => props.theme.colors.background.secondary};
  border-right: 1px solid ${props => props.theme.colors.border.subtle};
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 20px 16px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const SidebarNav = styled.nav`
  flex: 1;
  padding: 16px 0;
`;

const NavItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: ${props => props.$active ? props.theme.colors.background.hover : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus {
    outline: none;
    background: ${props => props.theme.colors.background.hover};
    box-shadow: inset 2px 0 0 ${props => props.theme.colors.primary};
  }
`;

const NavIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContentHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ContentTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const CloseButton = styled(EnhancedIconButton)`
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const ContentBody = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.default};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.colors.border.strong};
    }
  }
`;

const SettingsSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 44px;
  height: 24px;
  border: none;
  border-radius: 12px;
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.background.secondary};
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.background.primary};
    transition: left 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }
`;

/**
 * 设置模态框组件
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialPage = 'general'
}) => {
  const { actualMode, toggleTheme, reducedMotion, setReducedMotion } = useTheme();
  const { isFeatureEnabled, toggleFeature, getPerformanceMetrics } = useUIIntegration();
  const { config: layoutConfig, updateConfig: updateLayoutConfig, resetConfig: resetLayoutConfig } = useLayoutConfig();
  
  const [currentPage, setCurrentPage] = useState<SettingsPage>(initialPage);
  const [showLayoutCustomizer, setShowLayoutCustomizer] = useState(false);
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);
  const [showConfigManager, setShowConfigManager] = useState(false);

  // 导航项配置
  const navItems = useMemo(() => [
    { id: 'general' as SettingsPage, icon: <SvgIcon name="icon.16.settings" size={16} title="通用" />, label: '通用设置' },
    { id: 'layout' as SettingsPage, icon: <SvgIcon name="icon.16.design" size={16} title="布局" />, label: '布局自定义' },
    { id: 'performance' as SettingsPage, icon: <SvgIcon name="icon.16.performance" size={16} title="性能" />, label: '性能设置' },
    { id: 'accessibility' as SettingsPage, icon: <SvgIcon name="icon.16.accessibility" size={16} title="无障碍" />, label: '无障碍' },
    { id: 'about' as SettingsPage, icon: <SvgIcon name="icon.16.info" size={16} title="关于" />, label: '关于' }
  ], []);

  // 页面标题映射
  const pageTitles = useMemo(() => ({
    general: '通用设置',
    layout: '布局自定义',
    performance: '性能设置',
    accessibility: '无障碍设置',
    about: '关于应用'
  }), []);

  // 处理键盘导航
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  /**
   * 处理布局配置变化
   * @param newConfig 新的布局配置
   * @returns void
   */
  const handleLayoutConfigChange = useCallback((newConfig: LayoutConfig) => {
    updateLayoutConfig(newConfig);
  }, [updateLayoutConfig]);

  /**
   * 重置布局配置
   */
  const handleLayoutReset = useCallback(() => {
    resetLayoutConfig();
  }, [resetLayoutConfig]);

  // 渲染通用设置页面
  const renderGeneralSettings = () => (
    <div>
      <SettingsSection>
        <SectionTitle>外观</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingTitle>主题模式</SettingTitle>
            <SettingDescription>切换亮色和暗色主题</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <EnhancedButton
              onClick={toggleTheme}
              enableFigmaInteractions={true}
              enableTooltip={true}
              tooltipContent={`当前: ${actualMode === 'light' ? '亮色' : '暗色'}主题`}
            >
              {actualMode === 'light' ? '🌙 暗色' : '☀️ 亮色'}
            </EnhancedButton>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>减少动画</SettingTitle>
            <SettingDescription>减少界面动画效果以提升性能</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Toggle
              $active={reducedMotion}
              onClick={() => setReducedMotion(!reducedMotion)}
              aria-label="切换减少动画"
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>UI增强功能</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingTitle>交互组件</SettingTitle>
            <SettingDescription>启用Figma风格的交互效果</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Toggle
              $active={isFeatureEnabled(UIFeature.INTERACTIVE_COMPONENTS)}
              onClick={() => toggleFeature(UIFeature.INTERACTIVE_COMPONENTS)}
              aria-label="切换交互组件"
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>工具提示</SettingTitle>
            <SettingDescription>显示详细的工具提示信息</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Toggle
              $active={isFeatureEnabled(UIFeature.TOOLTIPS)}
              onClick={() => toggleFeature(UIFeature.TOOLTIPS)}
              aria-label="切换工具提示"
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>过渡动画</SettingTitle>
            <SettingDescription>启用平滑的过渡动画效果</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Toggle
              $active={isFeatureEnabled(UIFeature.TRANSITIONS)}
              onClick={() => toggleFeature(UIFeature.TRANSITIONS)}
              aria-label="切换过渡动画"
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>
    </div>
  );

  // 渲染布局设置页面
  const renderLayoutSettings = () => (
    <div>
      <SettingsSection>
        <SectionTitle>布局配置</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingTitle>布局预设</SettingTitle>
            <SettingDescription>选择预定义的布局模板</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <EnhancedButton
              onClick={() => setShowLayoutPreview(true)}
              enableFigmaInteractions={true}
              enableTooltip={true}
              tooltipContent="选择布局预设"
            >
              选择预设
            </EnhancedButton>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>自定义布局</SettingTitle>
            <SettingDescription>调整面板宽度、位置和显示选项</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <EnhancedButton
              onClick={() => setShowLayoutCustomizer(true)}
              enableFigmaInteractions={true}
              enableTooltip={true}
              tooltipContent="打开布局自定义器"
            >
              自定义布局
            </EnhancedButton>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>配置管理</SettingTitle>
            <SettingDescription>导入、导出和管理布局配置</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <EnhancedButton
              onClick={() => setShowConfigManager(true)}
              enableFigmaInteractions={true}
              enableTooltip={true}
              tooltipContent="打开配置管理器"
            >
              管理配置
            </EnhancedButton>
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>重置布局</SettingTitle>
            <SettingDescription>恢复默认的布局配置</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <EnhancedButton
              onClick={handleLayoutReset}
              enableFigmaInteractions={true}
              enableTooltip={true}
              tooltipContent="重置为默认布局"
              variant="secondary"
            >
              重置布局
            </EnhancedButton>
          </SettingControl>
        </SettingItem>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>当前布局信息</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingTitle>左侧面板宽度</SettingTitle>
            <SettingDescription>{layoutConfig.leftPanelWidth}px</SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>右侧面板宽度</SettingTitle>
            <SettingDescription>{layoutConfig.rightPanelWidth}px</SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>工具栏位置</SettingTitle>
            <SettingDescription>{layoutConfig.toolbarPosition === 'top' ? '顶部' : layoutConfig.toolbarPosition === 'left' ? '左侧' : '右侧'}</SettingDescription>
          </SettingLabel>
        </SettingItem>
      </SettingsSection>
    </div>
  );

  // 渲染性能设置页面
  const renderPerformanceSettings = () => {
    const metrics = getPerformanceMetrics();
    
    return (
      <div>
        <SettingsSection>
          <SectionTitle>性能监控</SectionTitle>
          <SettingItem>
            <SettingLabel>
              <SettingTitle>启用性能监控</SettingTitle>
              <SettingDescription>实时监控FPS、内存使用等指标</SettingDescription>
            </SettingLabel>
            <SettingControl>
              <Toggle
                $active={isFeatureEnabled(UIFeature.PERFORMANCE_MONITORING)}
                onClick={() => toggleFeature(UIFeature.PERFORMANCE_MONITORING)}
                aria-label="切换性能监控"
              />
            </SettingControl>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>虚拟化列表</SettingTitle>
              <SettingDescription>对长列表使用虚拟化以提升性能</SettingDescription>
            </SettingLabel>
            <SettingControl>
              <Toggle
                $active={isFeatureEnabled(UIFeature.VIRTUALIZATION)}
                onClick={() => toggleFeature(UIFeature.VIRTUALIZATION)}
                aria-label="切换虚拟化列表"
              />
            </SettingControl>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>批量更新</SettingTitle>
              <SettingDescription>批量处理UI更新以提升性能</SettingDescription>
            </SettingLabel>
            <SettingControl>
              <Toggle
                $active={isFeatureEnabled(UIFeature.BATCH_UPDATES)}
                onClick={() => toggleFeature(UIFeature.BATCH_UPDATES)}
                aria-label="切换批量更新"
              />
            </SettingControl>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>当前性能指标</SectionTitle>
          <SettingItem>
            <SettingLabel>
              <SettingTitle>帧率 (FPS)</SettingTitle>
              <SettingDescription>{metrics.fps} fps</SettingDescription>
            </SettingLabel>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>内存使用</SettingTitle>
              <SettingDescription>{metrics.memoryUsage} MB</SettingDescription>
            </SettingLabel>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>渲染时间</SettingTitle>
              <SettingDescription>{metrics.renderTime.toFixed(2)} ms</SettingDescription>
            </SettingLabel>
          </SettingItem>
        </SettingsSection>
      </div>
    );
  };

  // 渲染无障碍设置页面
  const renderAccessibilitySettings = () => (
    <div>
      <SettingsSection>
        <SectionTitle>无障碍功能</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingTitle>启用无障碍支持</SettingTitle>
            <SettingDescription>启用键盘导航和屏幕阅读器支持</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Toggle
              $active={isFeatureEnabled(UIFeature.ACCESSIBILITY)}
              onClick={() => toggleFeature(UIFeature.ACCESSIBILITY)}
              aria-label="切换无障碍支持"
            />
          </SettingControl>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>减少动画</SettingTitle>
            <SettingDescription>减少动画效果以适应动作敏感用户</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <Toggle
              $active={reducedMotion}
              onClick={() => setReducedMotion(!reducedMotion)}
              aria-label="切换减少动画"
            />
          </SettingControl>
        </SettingItem>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>键盘快捷键</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingTitle>Ctrl + 1</SettingTitle>
            <SettingDescription>切换左侧面板</SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>Ctrl + 2</SettingTitle>
            <SettingDescription>切换右侧面板</SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>Ctrl + ,</SettingTitle>
            <SettingDescription>打开设置</SettingDescription>
          </SettingLabel>
        </SettingItem>
      </SettingsSection>
    </div>
  );

  // 渲染关于页面
  const renderAboutSettings = () => (
    <div>
      <SettingsSection>
        <SectionTitle>应用信息</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingTitle>G-Asset Forge</SettingTitle>
            <SettingDescription>专业的游戏资产创建工具</SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>版本</SettingTitle>
            <SettingDescription>1.0.0-beta</SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>UI增强系统</SettingTitle>
            <SettingDescription>基于Figma设计系统的现代化界面</SettingDescription>
          </SettingLabel>
        </SettingItem>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>技术栈</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <SettingTitle>Electron</SettingTitle>
            <SettingDescription>跨平台桌面应用框架</SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>React</SettingTitle>
            <SettingDescription>用户界面构建库</SettingDescription>
          </SettingLabel>
        </SettingItem>
        
        <SettingItem>
          <SettingLabel>
            <SettingTitle>TypeScript</SettingTitle>
            <SettingDescription>类型安全的JavaScript</SettingDescription>
          </SettingLabel>
        </SettingItem>
      </SettingsSection>
    </div>
  );

  // 渲染当前页面内容
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'general':
        return renderGeneralSettings();
      case 'layout':
        return renderLayoutSettings();
      case 'performance':
        return renderPerformanceSettings();
      case 'accessibility':
        return renderAccessibilitySettings();
      case 'about':
        return renderAboutSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <ModalContainer
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar>
            <SidebarHeader>
              <SidebarTitle>设置</SidebarTitle>
            </SidebarHeader>
            
            <SidebarNav>
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  $active={currentPage === item.id}
                  onClick={() => setCurrentPage(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setCurrentPage(item.id);
                    }
                  }}
                  aria-label={`切换到${item.label}`}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  {item.label}
                </NavItem>
              ))}
            </SidebarNav>
          </Sidebar>

          <MainContent>
            <ContentHeader>
              <ContentTitle>{pageTitles[currentPage]}</ContentTitle>
              <CloseButton
                icon={<SvgIcon name="icon.16.close" size={16} title="关闭" />}
                onClick={onClose}
                enableFigmaInteractions={true}
                enableTooltip={true}
                tooltipContent="关闭设置"
                aria-label="关闭设置"
              />
            </ContentHeader>
            
            <ContentBody>
              {renderCurrentPage()}
            </ContentBody>
          </MainContent>
        </ModalContainer>

        {/* 布局预览 */}
        {showLayoutPreview && (
          <LayoutPreview
            isOpen={showLayoutPreview}
            onClose={() => setShowLayoutPreview(false)}
          />
        )}

        {/* 布局自定义器 */}
        {showLayoutCustomizer && (
          <FigmaLayoutCustomizer
            config={layoutConfig as unknown as ExtendedLayoutConfig}
            onConfigChange={handleLayoutConfigChange}
            onReset={handleLayoutReset}
          />
        )}

        {/* 配置管理器 */}
        {showConfigManager && (
          <LayoutConfigManagerComponent
            onClose={() => setShowConfigManager(false)}
          />
        )}
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default SettingsModal;