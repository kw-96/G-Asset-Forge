import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';

// 布局配置接口
export interface LayoutConfig {
  leftPanelWidth: number;
  rightPanelWidth: number;
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  toolbarVisible: boolean;
  toolbarPosition: 'top' | 'left' | 'right';
  panelMode: 'docked' | 'floating' | 'overlay';
  customToolbarItems: string[];
  workspaceTheme: 'default' | 'dark' | 'light' | 'auto';
  gridVisible: boolean;
  rulersVisible: boolean;
  miniMapVisible: boolean;
}

// 布局自定义器属性接口
export interface FigmaLayoutCustomizerProps {
  config: LayoutConfig;
  onConfigChange: (config: LayoutConfig) => void;
  onReset: () => void;
  className?: string;
}

// 工具栏项目接口
export interface ToolbarItem {
  id: string;
  name: string;
  icon: string;
  category: 'basic' | 'advanced' | 'utility';
  enabled: boolean;
}

// 样式组件
const CustomizerContainer = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-height: 80vh;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: ${props => props.theme.shadows.strong};
  z-index: 1000;
  overflow: hidden;
`;

const CustomizerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
`;

const CustomizerTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: ${props => props.theme.borderRadius.small};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  transition: all 0.15s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const CustomizerContent = styled.div`
  padding: 24px;
  max-height: calc(80vh - 140px);
  overflow-y: auto;
  
  /* Figma风格滚动条 */
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

const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Control = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const ControlLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  flex: 1;
`;

const ControlInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Slider = styled.input`
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: ${props => props.theme.colors.background.secondary};
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => props.theme.colors.accent};
    cursor: pointer;
    border: 2px solid ${props => props.theme.colors.background.primary};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => props.theme.colors.accent};
    cursor: pointer;
    border: 2px solid ${props => props.theme.colors.background.primary};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const SliderValue = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  min-width: 40px;
  text-align: right;
`;

const Toggle = styled.button<{ active: boolean }>`
  width: 44px;
  height: 24px;
  border: none;
  border-radius: 12px;
  background: ${props => props.active ? props.theme.colors.accent : props.theme.colors.background.secondary};
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.background.primary};
    transition: left 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.small};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.accent + '20'};
  }
`;

const ToolbarCustomizer = styled.div`
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 16px;
  background: ${props => props.theme.colors.background.secondary};
`;

const ToolbarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 12px;
`;

const ToolbarItemCard = styled.div<{ enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${props => props.enabled ? props.theme.colors.accent : props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.small};
  background: ${props => props.enabled ? props.theme.colors.accent + '10' : props.theme.colors.background.primary};
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.accent};
    background: ${props => props.theme.colors.accent + '20'};
  }
`;

const ToolbarItemIcon = styled.span`
  font-size: 16px;
`;

const ToolbarItemName = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const CustomizerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return props.theme.colors.accent;
      case 'danger': return props.theme.colors.status.error;
      default: return props.theme.colors.border.default;
    }
  }};
  border-radius: ${props => props.theme.borderRadius.small};
  background: ${props => {
    switch (props.variant) {
      case 'primary': return props.theme.colors.accent;
      case 'danger': return props.theme.colors.status.error;
      default: return props.theme.colors.background.primary;
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'primary': 
      case 'danger': 
        return props.theme.colors.text.inverse;
      default: 
        return props.theme.colors.text.primary;
    }
  }};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// 默认工具栏项目
const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  { id: 'select', name: '选择', icon: '🔍', category: 'basic', enabled: true },
  { id: 'text', name: '文本', icon: '📝', category: 'basic', enabled: true },
  { id: 'shape', name: '形状', icon: '⬜', category: 'basic', enabled: true },
  { id: 'image', name: '图片', icon: '🖼️', category: 'basic', enabled: true },
  { id: 'brush', name: '画笔', icon: '🖌️', category: 'basic', enabled: true },
  { id: 'crop', name: '裁剪', icon: '✂️', category: 'basic', enabled: false },
  { id: 'zoom', name: '缩放', icon: '🔍', category: 'utility', enabled: false },
  { id: 'grid', name: '网格', icon: '⊞', category: 'utility', enabled: false },
  { id: 'ruler', name: '标尺', icon: '📏', category: 'utility', enabled: false },
  { id: 'eyedropper', name: '取色器', icon: '💧', category: 'advanced', enabled: false },
  { id: 'layers', name: '图层', icon: '📚', category: 'advanced', enabled: false },
  { id: 'history', name: '历史', icon: '⏰', category: 'advanced', enabled: false }
];

// 默认扩展布局配置
const DEFAULT_CONFIG: ExtendedLayoutConfig = {
  leftPanelWidth: 280,
  rightPanelWidth: 320,
  leftPanelVisible: true,
  rightPanelVisible: true,
  toolbarVisible: true,
  toolbarPosition: 'left',
  panelMode: 'docked',
  customToolbarItems: ['select', 'text', 'shape', 'image', 'brush'],
  workspaceTheme: 'auto',
  gridVisible: false,
  rulersVisible: false,
  miniMapVisible: false,
  // 新增的默认配置
  canvasBackgroundColor: '#f5f5f5',
  canvasBackgroundPattern: 'dots',
  snapToGrid: true,
  snapToObjects: true,
  snapTolerance: 5,
  zoomStep: 0.1,
  maxZoom: 5.0,
  minZoom: 0.1,
  autoSave: true,
  autoSaveInterval: 30000,
  showPerformanceStats: false,
  enableAnimations: true,
  animationDuration: 200,
  keyboardShortcuts: {
    'save': 'Ctrl+S',
    'undo': 'Ctrl+Z',
    'redo': 'Ctrl+Y',
    'zoom-in': 'Ctrl+=',
    'zoom-out': 'Ctrl+-',
    'fit-to-screen': 'Ctrl+0'
  },
  customCSSVariables: {}
};

/**
 * Figma风格布局自定义器组件
 */
export const FigmaLayoutCustomizer: React.FC<FigmaLayoutCustomizerProps> = ({
  config,
  onConfigChange,
  onReset,
  className
}) => {
  useTheme(); // 用于主题上下文
  const [toolbarItems, setToolbarItems] = useState<ToolbarItem[]>(DEFAULT_TOOLBAR_ITEMS);
  const [hasChanges, setHasChanges] = useState(false);
  const originalConfigRef = useRef<LayoutConfig>(config);
  
  // 检测配置变化
  useEffect(() => {
    const hasChanged = JSON.stringify(config) !== JSON.stringify(originalConfigRef.current);
    setHasChanges(hasChanged);
  }, [config]);
  
  // 更新配置
  const updateConfig = useCallback((updates: Partial<LayoutConfig>) => {
    const newConfig = { ...config, ...updates };
    onConfigChange(newConfig);
  }, [config, onConfigChange]);
  
  // 处理面板宽度变化
  const handlePanelWidthChange = useCallback((panel: 'left' | 'right', width: number) => {
    updateConfig({
      [`${panel}PanelWidth`]: Math.max(200, Math.min(600, width))
    });
  }, [updateConfig]);
  
  // 处理面板可见性切换
  const handlePanelVisibilityToggle = useCallback((panel: 'left' | 'right') => {
    updateConfig({
      [`${panel}PanelVisible`]: !config[`${panel}PanelVisible` as keyof LayoutConfig]
    });
  }, [config, updateConfig]);
  
  // 处理工具栏项目切换
  const handleToolbarItemToggle = useCallback((itemId: string) => {
    const updatedItems = toolbarItems.map(item =>
      item.id === itemId ? { ...item, enabled: !item.enabled } : item
    );
    setToolbarItems(updatedItems);
    
    const enabledItems = updatedItems.filter(item => item.enabled).map(item => item.id);
    updateConfig({ customToolbarItems: enabledItems });
  }, [toolbarItems, updateConfig]);
  
  // 重置配置
  const handleReset = useCallback(() => {
    onReset();
    setToolbarItems(DEFAULT_TOOLBAR_ITEMS);
    originalConfigRef.current = DEFAULT_CONFIG;
    setHasChanges(false);
  }, [onReset]);
  
  // 应用配置
  const handleApply = useCallback(() => {
    originalConfigRef.current = config;
    setHasChanges(false);
  }, [config]);
  
  return (
    <CustomizerContainer
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <CustomizerHeader>
        <CustomizerTitle>界面布局自定义</CustomizerTitle>
        <CloseButton onClick={() => onConfigChange(config)}>
          ✕
        </CloseButton>
      </CustomizerHeader>
      
      <CustomizerContent>
        {/* 面板设置 */}
        <Section>
          <SectionTitle>面板设置</SectionTitle>
          <ControlGroup>
            <Control>
              <ControlLabel>左侧面板</ControlLabel>
              <ControlInput>
                <Toggle
                  active={config.leftPanelVisible}
                  onClick={() => handlePanelVisibilityToggle('left')}
                />
              </ControlInput>
            </Control>
            
            {config.leftPanelVisible && (
              <Control>
                <ControlLabel>左侧面板宽度</ControlLabel>
                <ControlInput>
                  <Slider
                    type="range"
                    min="200"
                    max="600"
                    value={config.leftPanelWidth}
                    onChange={(e) => handlePanelWidthChange('left', parseInt(e.target.value))}
                  />
                  <SliderValue>{config.leftPanelWidth}px</SliderValue>
                </ControlInput>
              </Control>
            )}
            
            <Control>
              <ControlLabel>右侧面板</ControlLabel>
              <ControlInput>
                <Toggle
                  active={config.rightPanelVisible}
                  onClick={() => handlePanelVisibilityToggle('right')}
                />
              </ControlInput>
            </Control>
            
            {config.rightPanelVisible && (
              <Control>
                <ControlLabel>右侧面板宽度</ControlLabel>
                <ControlInput>
                  <Slider
                    type="range"
                    min="200"
                    max="600"
                    value={config.rightPanelWidth}
                    onChange={(e) => handlePanelWidthChange('right', parseInt(e.target.value))}
                  />
                  <SliderValue>{config.rightPanelWidth}px</SliderValue>
                </ControlInput>
              </Control>
            )}
            
            <Control>
              <ControlLabel>面板模式</ControlLabel>
              <ControlInput>
                <Select
                  value={config.panelMode}
                  onChange={(e) => updateConfig({ panelMode: e.target.value as any })}
                >
                  <option value="docked">停靠</option>
                  <option value="floating">浮动</option>
                  <option value="overlay">覆盖</option>
                </Select>
              </ControlInput>
            </Control>
          </ControlGroup>
        </Section>
        
        {/* 工具栏设置 */}
        <Section>
          <SectionTitle>工具栏设置</SectionTitle>
          <ControlGroup>
            <Control>
              <ControlLabel>显示工具栏</ControlLabel>
              <ControlInput>
                <Toggle
                  active={config.toolbarVisible}
                  onClick={() => updateConfig({ toolbarVisible: !config.toolbarVisible })}
                />
              </ControlInput>
            </Control>
            
            {config.toolbarVisible && (
              <Control>
                <ControlLabel>工具栏位置</ControlLabel>
                <ControlInput>
                  <Select
                    value={config.toolbarPosition}
                    onChange={(e) => updateConfig({ toolbarPosition: e.target.value as any })}
                  >
                    <option value="top">顶部</option>
                    <option value="left">左侧</option>
                    <option value="right">右侧</option>
                  </Select>
                </ControlInput>
              </Control>
            )}
          </ControlGroup>
          
          {config.toolbarVisible && (
            <ToolbarCustomizer>
              <ControlLabel>自定义工具栏项目</ControlLabel>
              <ToolbarGrid>
                {toolbarItems.map((item) => (
                  <ToolbarItemCard
                    key={item.id}
                    enabled={item.enabled}
                    onClick={() => handleToolbarItemToggle(item.id)}
                  >
                    <ToolbarItemIcon>{item.icon}</ToolbarItemIcon>
                    <ToolbarItemName>{item.name}</ToolbarItemName>
                  </ToolbarItemCard>
                ))}
              </ToolbarGrid>
            </ToolbarCustomizer>
          )}
        </Section>
        
        {/* 工作区设置 */}
        <Section>
          <SectionTitle>工作区设置</SectionTitle>
          <ControlGroup>
            <Control>
              <ControlLabel>工作区主题</ControlLabel>
              <ControlInput>
                <Select
                  value={config.workspaceTheme}
                  onChange={(e) => updateConfig({ workspaceTheme: e.target.value as any })}
                >
                  <option value="auto">自动</option>
                  <option value="light">亮色</option>
                  <option value="dark">暗色</option>
                  <option value="default">默认</option>
                </Select>
              </ControlInput>
            </Control>
            
            <Control>
              <ControlLabel>显示网格</ControlLabel>
              <ControlInput>
                <Toggle
                  active={config.gridVisible}
                  onClick={() => updateConfig({ gridVisible: !config.gridVisible })}
                />
              </ControlInput>
            </Control>
            
            <Control>
              <ControlLabel>显示标尺</ControlLabel>
              <ControlInput>
                <Toggle
                  active={config.rulersVisible}
                  onClick={() => updateConfig({ rulersVisible: !config.rulersVisible })}
                />
              </ControlInput>
            </Control>
            
            <Control>
              <ControlLabel>显示小地图</ControlLabel>
              <ControlInput>
                <Toggle
                  active={config.miniMapVisible}
                  onClick={() => updateConfig({ miniMapVisible: !config.miniMapVisible })}
                />
              </ControlInput>
            </Control>
          </ControlGroup>
        </Section>
      </CustomizerContent>
      
      <CustomizerFooter>
        <Button variant="danger" onClick={handleReset}>
          重置默认
        </Button>
        <div className="customizer-actions">
          <Button onClick={() => onConfigChange(originalConfigRef.current)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleApply} disabled={!hasChanges}>
            应用设置
          </Button>
        </div>
      </CustomizerFooter>
    </CustomizerContainer>
  );
};

// 配置版本信息
interface ConfigVersion {
  version: string;
  timestamp: number;
  description?: string;
}

// 扩展的配置存储格式
export interface StoredLayoutConfig {
  config: ExtendedLayoutConfig;
  version: ConfigVersion;
  metadata: {
    createdAt: number;
    updatedAt: number;
    userAgent: string;
    platform: string;
    appVersion?: string;
    configSource: 'user' | 'preset' | 'imported' | 'migrated';
    tags?: string[];
    description?: string;
  };
  checksum?: string; // 用于验证配置完整性
}

// 扩展的布局配置接口
export interface ExtendedLayoutConfig extends LayoutConfig {
  // 新增配置选项
  canvasBackgroundColor?: string;
  canvasBackgroundPattern?: 'none' | 'dots' | 'grid' | 'lines';
  snapToGrid?: boolean;
  snapToObjects?: boolean;
  snapTolerance?: number;
  zoomStep?: number;
  maxZoom?: number;
  minZoom?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  showPerformanceStats?: boolean;
  enableAnimations?: boolean;
  animationDuration?: number;
  keyboardShortcuts?: Record<string, string>;
  customCSSVariables?: Record<string, string>;
}

// 配置迁移映射
interface ConfigMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (config: any) => ExtendedLayoutConfig;
}

// 布局配置管理器
export class LayoutConfigManager {
  private static readonly STORAGE_KEY = 'figma-layout-config';
  private static readonly BACKUP_KEY = 'figma-layout-config-backup';
  private static readonly HISTORY_KEY = 'figma-layout-config-history';
  private static readonly CURRENT_VERSION = '2.0.0';
  private static readonly MAX_HISTORY_SIZE = 20;
  private static readonly ELECTRON_STORAGE_KEY = 'layout-config';
  
  // 配置迁移规则
  private static readonly MIGRATIONS: ConfigMigration[] = [
    {
      fromVersion: '1.0.0',
      toVersion: '2.0.0',
      migrate: (config: LayoutConfig): ExtendedLayoutConfig => ({
        ...config,
        canvasBackgroundColor: '#f5f5f5',
        canvasBackgroundPattern: 'dots',
        snapToGrid: true,
        snapToObjects: true,
        snapTolerance: 5,
        zoomStep: 0.1,
        maxZoom: 5.0,
        minZoom: 0.1,
        autoSave: true,
        autoSaveInterval: 30000,
        showPerformanceStats: false,
        enableAnimations: true,
        animationDuration: 200,
        keyboardShortcuts: {
          'save': 'Ctrl+S',
          'undo': 'Ctrl+Z',
          'redo': 'Ctrl+Y',
          'zoom-in': 'Ctrl+=',
          'zoom-out': 'Ctrl+-',
          'fit-to-screen': 'Ctrl+0'
        },
        customCSSVariables: {}
      })
    }
  ];
  
  /**
   * 保存布局配置
   */
  static async saveConfig(config: ExtendedLayoutConfig, source: 'user' | 'preset' | 'imported' | 'migrated' = 'user'): Promise<void> {
    try {
      // 验证配置
      const validatedConfig = this.validateConfig(config);
      
      // 生成配置校验和
      const checksum = this.generateChecksum(validatedConfig);
      
      // 创建存储格式
      const storedConfig: StoredLayoutConfig = {
        config: validatedConfig,
        version: {
          version: this.CURRENT_VERSION,
          timestamp: Date.now(),
          description: this.getConfigDescription(source)
        },
        metadata: {
          createdAt: this.getExistingCreatedAt() || Date.now(),
          updatedAt: Date.now(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          appVersion: await this.getAppVersion(),
          configSource: source,
          tags: this.generateConfigTags(validatedConfig),
          description: `${source} configuration saved at ${new Date().toLocaleString()}`
        },
        checksum
      };
      
      // 保存到历史记录
      this.saveToHistory(storedConfig);
      
      // 备份当前配置
      const currentConfig = localStorage.getItem(this.STORAGE_KEY);
      if (currentConfig) {
        localStorage.setItem(this.BACKUP_KEY, currentConfig);
      }
      
      // 保存到本地存储
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedConfig));
      
      // 同时保存到Electron用户数据目录
      await this.saveToElectronStorage(storedConfig);
      
      console.log('布局配置已保存', { 
        version: this.CURRENT_VERSION, 
        timestamp: storedConfig.version.timestamp,
        source,
        checksum: checksum.substring(0, 8) + '...'
      });
    } catch (error) {
      console.error('保存布局配置失败:', error);
      throw error;
    }
  }
  
  /**
   * 加载布局配置
   */
  static async loadConfig(): Promise<ExtendedLayoutConfig> {
    try {
      // 首先尝试从Electron存储加载
      const electronConfig = await this.loadFromElectronStorage();
      if (electronConfig) {
        return electronConfig;
      }
      
      // 回退到本地存储
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const storedConfig: StoredLayoutConfig = JSON.parse(saved);
        
        // 验证配置完整性
        if (storedConfig.checksum && !this.verifyChecksum(storedConfig.config, storedConfig.checksum)) {
          console.warn('配置校验和不匹配，可能已损坏');
          throw new Error('Configuration checksum mismatch');
        }
        
        // 检查版本兼容性
        if (this.isVersionCompatible(String(storedConfig.version.version))) {
          const validatedConfig = this.validateConfig(storedConfig.config);
          
          // 同步到Electron存储
          await this.saveToElectronStorage({
            ...storedConfig,
            config: validatedConfig
          });
          
          return validatedConfig;
        } else {
          console.warn('配置版本不兼容，尝试迁移', {
            stored: storedConfig.version.version,
            current: this.CURRENT_VERSION
          });
          
          // 尝试迁移配置
          const migratedConfig = this.migrateConfig(storedConfig);
          if (migratedConfig) {
            await this.saveConfig(migratedConfig, 'migrated');
            return migratedConfig;
          }
        }
      }
    } catch (error) {
      console.error('加载布局配置失败:', error);
      
      // 尝试从备份恢复
      try {
        const backup = localStorage.getItem(this.BACKUP_KEY);
        if (backup) {
          const backupConfig: StoredLayoutConfig = JSON.parse(backup);
          console.log('从备份恢复配置');
          const validatedConfig = this.validateConfig(backupConfig.config);
          
          // 保存恢复的配置
          await this.saveConfig(validatedConfig, 'user');
          return validatedConfig;
        }
      } catch (backupError) {
        console.error('从备份恢复失败:', backupError);
      }
    }
    
    // 保存默认配置
    await this.saveConfig(DEFAULT_CONFIG, 'preset');
    return DEFAULT_CONFIG;
  }
  
  /**
   * 重置布局配置
   */
  static async resetConfig(): Promise<ExtendedLayoutConfig> {
    try {
      // 备份当前配置到历史记录
      const currentConfig = localStorage.getItem(this.STORAGE_KEY);
      if (currentConfig) {
        const storedConfig: StoredLayoutConfig = JSON.parse(currentConfig);
        storedConfig.version.description = 'Before reset';
        this.saveToHistory(storedConfig);
      }
      
      // 清除本地存储
      localStorage.removeItem(this.STORAGE_KEY);
      
      // 清除Electron存储
      try {
        if (window.electronAPI) {
          // const configPath = `config/${this.ELECTRON_STORAGE_KEY}.json`;
          // 注意：这里我们不删除文件，而是保存默认配置
          await this.saveToElectronStorage({
            config: DEFAULT_CONFIG,
            version: {
              version: this.CURRENT_VERSION,
              timestamp: Date.now(),
              description: 'Reset to default configuration'
            },
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              appVersion: await this.getAppVersion(),
              configSource: 'preset',
              description: 'Configuration reset to defaults'
            },
            checksum: this.generateChecksum(DEFAULT_CONFIG)
          });
        }
      } catch (error) {
        console.warn('清除Electron存储失败:', error);
      }
      
      console.log('布局配置已重置为默认值');
    } catch (error) {
      console.error('重置布局配置失败:', error);
    }
    
    return DEFAULT_CONFIG;
  }
  
  /**
   * 验证布局配置
   */
  static validateConfig(config: Partial<ExtendedLayoutConfig>): ExtendedLayoutConfig {
    return {
      // 基础配置验证
      leftPanelWidth: Math.max(200, Math.min(600, config.leftPanelWidth || DEFAULT_CONFIG.leftPanelWidth)),
      rightPanelWidth: Math.max(200, Math.min(600, config.rightPanelWidth || DEFAULT_CONFIG.rightPanelWidth)),
      leftPanelVisible: config.leftPanelVisible ?? DEFAULT_CONFIG.leftPanelVisible,
      rightPanelVisible: config.rightPanelVisible ?? DEFAULT_CONFIG.rightPanelVisible,
      toolbarVisible: config.toolbarVisible ?? DEFAULT_CONFIG.toolbarVisible,
      toolbarPosition: config.toolbarPosition || DEFAULT_CONFIG.toolbarPosition,
      panelMode: config.panelMode || DEFAULT_CONFIG.panelMode,
      customToolbarItems: config.customToolbarItems || DEFAULT_CONFIG.customToolbarItems,
      workspaceTheme: config.workspaceTheme || DEFAULT_CONFIG.workspaceTheme,
      gridVisible: config.gridVisible ?? DEFAULT_CONFIG.gridVisible,
      rulersVisible: config.rulersVisible ?? DEFAULT_CONFIG.rulersVisible,
      miniMapVisible: config.miniMapVisible ?? DEFAULT_CONFIG.miniMapVisible,
      
      // 扩展配置验证
      canvasBackgroundColor: this.validateColor(config.canvasBackgroundColor) || DEFAULT_CONFIG.canvasBackgroundColor!,
      canvasBackgroundPattern: config.canvasBackgroundPattern || DEFAULT_CONFIG.canvasBackgroundPattern!,
      snapToGrid: config.snapToGrid ?? DEFAULT_CONFIG.snapToGrid!,
      snapToObjects: config.snapToObjects ?? DEFAULT_CONFIG.snapToObjects!,
      snapTolerance: Math.max(1, Math.min(20, config.snapTolerance || DEFAULT_CONFIG.snapTolerance!)),
      zoomStep: Math.max(0.01, Math.min(1.0, config.zoomStep || DEFAULT_CONFIG.zoomStep!)),
      maxZoom: Math.max(1.0, Math.min(10.0, config.maxZoom || DEFAULT_CONFIG.maxZoom!)),
      minZoom: Math.max(0.01, Math.min(1.0, config.minZoom || DEFAULT_CONFIG.minZoom!)),
      autoSave: config.autoSave ?? DEFAULT_CONFIG.autoSave!,
      autoSaveInterval: Math.max(5000, Math.min(300000, config.autoSaveInterval || DEFAULT_CONFIG.autoSaveInterval!)),
      showPerformanceStats: config.showPerformanceStats ?? DEFAULT_CONFIG.showPerformanceStats!,
      enableAnimations: config.enableAnimations ?? DEFAULT_CONFIG.enableAnimations!,
      animationDuration: Math.max(50, Math.min(1000, config.animationDuration || DEFAULT_CONFIG.animationDuration!)),
      keyboardShortcuts: this.validateKeyboardShortcuts(config.keyboardShortcuts) || DEFAULT_CONFIG.keyboardShortcuts!,
      customCSSVariables: this.validateCSSVariables(config.customCSSVariables) || DEFAULT_CONFIG.customCSSVariables!
    };
  }
  
  /**
   * 导出配置为JSON
   */
  static async exportConfig(includeMetadata: boolean = true): Promise<string> {
    try {
      const currentConfig = await this.loadConfig();
      const configInfo = this.getConfigInfo();
      
      const exportData = {
        config: currentConfig,
        version: this.CURRENT_VERSION,
        exportedAt: Date.now(),
        exportedBy: 'G-Asset Forge Layout Manager',
        ...(includeMetadata && configInfo && {
          metadata: {
            originalVersion: configInfo.version,
            lastUpdated: configInfo.lastUpdated,
            platform: configInfo.platform,
            tags: this.generateConfigTags(currentConfig)
          }
        })
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('导出配置失败:', error);
      throw error;
    }
  }
  
  /**
   * 从JSON导入配置
   */
  static async importConfig(configJson: string): Promise<boolean> {
    try {
      const importData = JSON.parse(configJson);
      
      // 验证导入数据格式
      if (!importData.config) {
        throw new Error('无效的配置格式：缺少config字段');
      }
      
      // 检查版本兼容性
      if (importData.version && !this.isVersionCompatible(String(importData.version))) {
        console.warn('导入的配置版本可能不兼容:', importData.version);
      }
      
      // 验证和保存配置
      const validatedConfig = this.validateConfig(importData.config);
      await this.saveConfig(validatedConfig, 'imported');
      
      console.log('配置导入成功', {
        version: String(importData.version || this.CURRENT_VERSION),
        exportedAt: importData.exportedAt,
        configTags: this.generateConfigTags(validatedConfig)
      });
      
      return true;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }
  
  /**
   * 导出配置到文件
   */
  static async exportConfigToFile(filename?: string): Promise<boolean> {
    try {
      const configJson = await this.exportConfig(true);
      const defaultFilename = `layout-config-${new Date().toISOString().split('T')[0]}.json`;
      const finalFilename = filename || defaultFilename;
      
      // 创建下载链接
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('配置已导出到文件:', finalFilename);
      return true;
    } catch (error) {
      console.error('导出配置到文件失败:', error);
      return false;
    }
  }
  
  /**
   * 从文件导入配置
   */
  static async importConfigFromFile(file: File): Promise<boolean> {
    try {
      const configJson = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
      
      const success = await this.importConfig(configJson);
      
      if (success) {
        console.log('从文件导入配置成功:', file.name);
      }
      
      return success;
    } catch (error) {
      console.error('从文件导入配置失败:', error);
      return false;
    }
  }
  
  /**
   * 获取配置历史记录
   */
  static getConfigHistory(): StoredLayoutConfig[] {
    try {
      const history = localStorage.getItem(this.HISTORY_KEY);
      if (history) {
        return JSON.parse(history);
      }
    } catch (error) {
      console.error('获取配置历史失败:', error);
    }
    return [];
  }
  
  /**
   * 从历史记录恢复配置
   */
  static async restoreFromHistory(index: number): Promise<boolean> {
    try {
      const history = this.getConfigHistory();
      if (index >= 0 && index < history.length) {
          const historicalConfig = history[index];
          if (!historicalConfig) return false;
          await this.saveConfig(historicalConfig.config, 'user');
        console.log('从历史记录恢复配置', {
          timestamp: historicalConfig.version.timestamp,
          description: historicalConfig.version.description,
          source: historicalConfig.metadata.configSource
        });
        return true;
      }
    } catch (error) {
      console.error('从历史记录恢复失败:', error);
    }
    return false;
  }
  
  /**
   * 获取配置统计信息
   */
  static getConfigStats(): {
    totalConfigs: number;
    oldestConfig: number | null;
    newestConfig: number | null;
    configSources: Record<string, number>;
    averageConfigSize: number;
  } {
    try {
      const history = this.getConfigHistory();
      
      if (history.length === 0) {
        return {
          totalConfigs: 0,
          oldestConfig: null,
          newestConfig: null,
          configSources: {},
          averageConfigSize: 0
        };
      }
      
      const timestamps = history.map(h => h.version.timestamp);
      const sources = history.reduce((acc, h) => {
        const source = h.metadata.configSource;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalSize = history.reduce((acc, h) => {
        return acc + JSON.stringify(h.config).length;
      }, 0);
      
      return {
        totalConfigs: history.length,
        oldestConfig: Math.min(...timestamps),
        newestConfig: Math.max(...timestamps),
        configSources: sources,
        averageConfigSize: Math.round(totalSize / history.length)
      };
    } catch (error) {
      console.error('获取配置统计失败:', error);
      return {
        totalConfigs: 0,
        oldestConfig: null,
        newestConfig: null,
        configSources: {},
        averageConfigSize: 0
      };
    }
  }
  
  /**
   * 清理配置历史记录
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
      console.log('配置历史记录已清理');
    } catch (error) {
      console.error('清理历史记录失败:', error);
    }
  }
  
  /**
   * 获取配置信息
   */
  static getConfigInfo(): { version: string; lastUpdated: number; platform: string } | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const storedConfig: StoredLayoutConfig = JSON.parse(saved);
        return {
          version: storedConfig.version.version,
          lastUpdated: storedConfig.metadata.updatedAt,
          platform: storedConfig.metadata.platform || navigator.platform
        };
      }
    } catch (error) {
      console.error('获取配置信息失败:', error);
    }
    return null;
  }
  
  // 私有方法
  
  /**
   * 保存到历史记录
   */
  private static saveToHistory(config: StoredLayoutConfig): void {
    try {
      let history = this.getConfigHistory();
      
      // 添加到历史记录开头
      history.unshift(config);
      
      // 限制历史记录大小
      if (history.length > this.MAX_HISTORY_SIZE) {
        history = history.slice(0, this.MAX_HISTORY_SIZE);
      }
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }
  
  /**
   * 获取现有配置的创建时间
   */
  private static getExistingCreatedAt(): number | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const storedConfig: StoredLayoutConfig = JSON.parse(saved);
        return storedConfig.metadata.createdAt;
      }
    } catch (error) {
      // 忽略错误
    }
    return null;
  }
  
  /**
   * 检查版本兼容性
   */
  private static isVersionCompatible(version: string): boolean {
    // 兼容空值与格式异常，确保 split 参数始终为 string
    const safeVersion = typeof version === 'string' && version.length > 0 ? version : '0.0.0';
    const currentMajor = parseInt(this.CURRENT_VERSION?.split('.')[0] || '0');
    const storedMajor = parseInt(safeVersion.split('.')[0] || '0');
    return Number.isFinite(currentMajor) && Number.isFinite(storedMajor) && currentMajor === storedMajor;
  }
  
  /**
   * 迁移配置
   */
  private static migrateConfig(storedConfig: StoredLayoutConfig): ExtendedLayoutConfig | null {
    try {
      console.log('尝试迁移配置从版本', storedConfig.version.version, '到', this.CURRENT_VERSION);
      
      let migratedConfig = storedConfig.config as any;
      
      // 应用迁移规则
      for (const migration of this.MIGRATIONS) {
        if (migration.fromVersion === storedConfig.version.version) {
          migratedConfig = migration.migrate(migratedConfig);
          console.log(`配置已迁移到版本 ${migration.toVersion}`);
          break;
        }
      }
      
      return this.validateConfig(migratedConfig);
    } catch (error) {
      console.error('配置迁移失败:', error);
      return null;
    }
  }
  
  // 新增的辅助方法
  
  /**
   * 生成配置校验和
   */
  private static generateChecksum(config: ExtendedLayoutConfig): string {
    const configString = JSON.stringify(config, Object.keys(config).sort());
    let hash = 0;
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * 验证配置校验和
   */
  private static verifyChecksum(config: ExtendedLayoutConfig, checksum: string): boolean {
    return this.generateChecksum(config) === checksum;
  }
  
  /**
   * 获取应用版本
   */
  private static async getAppVersion(): Promise<string> {
    try {
      if (window.electronAPI) {
          const result = await window.electronAPI.app.getVersion();
          if (typeof result === 'string') return result;
          if (result && typeof (result as any).data === 'string') return (result as any).data as string;
          return '1.0.0';
      }
    } catch (error) {
      console.warn('无法获取应用版本:', error);
    }
    return '1.0.0';
  }
  
  /**
   * 获取配置描述
   */
  private static getConfigDescription(source: string): string {
    const descriptions = {
      user: 'User customized configuration',
      preset: 'Preset configuration applied',
      imported: 'Configuration imported from file',
      migrated: 'Configuration migrated from previous version'
    };
    return descriptions[source as keyof typeof descriptions] || 'Configuration updated';
  }
  
  /**
   * 生成配置标签
   */
  private static generateConfigTags(config: ExtendedLayoutConfig): string[] {
    const tags: string[] = [];
    
    if (!config.leftPanelVisible && !config.rightPanelVisible) {
      tags.push('minimal');
    }
    if (config.enableAnimations) {
      tags.push('animated');
    }
    if (config.showPerformanceStats) {
      tags.push('performance');
    }
    if (config.autoSave) {
      tags.push('auto-save');
    }
    if (config.snapToGrid || config.snapToObjects) {
      tags.push('snap-enabled');
    }
    
    return tags;
  }
  
  /**
   * 验证颜色值
   */
  private static validateColor(color?: string): string | null {
    if (!color) return null;
    
    // 简单的颜色格式验证
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/;
    return colorRegex.test(color) ? color : null;
  }
  
  /**
   * 验证键盘快捷键
   */
  private static validateKeyboardShortcuts(shortcuts?: Record<string, string>): Record<string, string> | null {
    if (!shortcuts || typeof shortcuts !== 'object') return null;
    
    const validatedShortcuts: Record<string, string> = {};
    const shortcutRegex = /^(Ctrl|Alt|Shift|Meta)\+.+$/;
    
    for (const [action, shortcut] of Object.entries(shortcuts)) {
      if (typeof shortcut === 'string' && (shortcutRegex.test(shortcut) || shortcut.length === 1)) {
        validatedShortcuts[action] = shortcut;
      }
    }
    
    return Object.keys(validatedShortcuts).length > 0 ? validatedShortcuts : null;
  }
  
  /**
   * 验证CSS变量
   */
  private static validateCSSVariables(variables?: Record<string, string>): Record<string, string> | null {
    if (!variables || typeof variables !== 'object') return null;
    
    const validatedVariables: Record<string, string> = {};
    
    for (const [name, value] of Object.entries(variables)) {
      if (typeof name === 'string' && typeof value === 'string' && name.startsWith('--')) {
        validatedVariables[name] = value;
      }
    }
    
    return Object.keys(validatedVariables).length > 0 ? validatedVariables : null;
  }
  
  /**
   * 保存到Electron存储
   */
  private static async saveToElectronStorage(storedConfig: StoredLayoutConfig): Promise<void> {
    try {
      if (window.electronAPI && window.electronAPI.config) {
        const result = await window.electronAPI.config.save(this.ELECTRON_STORAGE_KEY, storedConfig);
        
        if (result.success) {
          console.log('配置已保存到Electron存储:', {
            path: result.path,
            size: result.size,
            timestamp: result.timestamp
          });
        } else {
          console.warn('保存到Electron存储失败:', result.error);
        }
      }
    } catch (error) {
      console.warn('Electron配置存储不可用，仅使用本地存储:', error);
    }
  }
  
  /**
   * 从Electron存储加载
   */
  private static async loadFromElectronStorage(): Promise<ExtendedLayoutConfig | null> {
    try {
      if (window.electronAPI && window.electronAPI.config) {
        const result = await window.electronAPI.config.load(this.ELECTRON_STORAGE_KEY);
        
        if (result.success && result.data) {
          const storedConfig: StoredLayoutConfig = result.data;
          
          // 验证配置完整性
          if (storedConfig.checksum && !this.verifyChecksum(storedConfig.config, storedConfig.checksum)) {
            console.warn('Electron存储的配置校验和不匹配');
            return null;
          }
          
          console.log('从Electron存储加载配置成功:', {
            path: result.path,
            size: result.size,
            lastModified: new Date(result.lastModified || 0).toLocaleString()
          });
          
          return this.validateConfig(storedConfig.config);
        }
      }
    } catch (error) {
      console.warn('从Electron存储加载失败:', error);
    }
    
    return null;
  }
  
  /**
   * 获取Electron存储中的配置列表
   */
  static async getElectronConfigList(): Promise<Array<{ key: string; filename: string; size: number; created: number; modified: number }>> {
    try {
      if (window.electronAPI && window.electronAPI.config) {
        const result = await window.electronAPI.config.list();
        
        if (result.success && result.configs) {
          return result.configs.filter((config: { key: string }) => config.key.includes('layout'));
        }
      }
    } catch (error) {
      console.warn('获取Electron配置列表失败:', error);
    }
    
    return [];
  }
  
  /**
   * 删除Electron存储中的配置
   */
  static async deleteElectronConfig(): Promise<boolean> {
    try {
      if (window.electronAPI && window.electronAPI.config) {
        const result = await window.electronAPI.config.delete(this.ELECTRON_STORAGE_KEY);
        
        if (result.success) {
          console.log('Electron存储中的配置已删除:', result.path);
          return true;
        } else {
          console.warn('删除Electron存储配置失败:', result.error);
        }
      }
    } catch (error) {
      console.warn('删除Electron存储配置失败:', error);
    }
    
    return false;
  }
  
  /**
   * 检查Electron存储中是否存在配置
   */
  static async electronConfigExists(): Promise<boolean> {
    try {
      if (window.electronAPI && window.electronAPI.config) {
        const result = await window.electronAPI.config.exists(this.ELECTRON_STORAGE_KEY);
        return result.success && result.data === true;
      }
    } catch (error) {
      console.warn('检查Electron配置存在性失败:', error);
    }
    
    return false;
  }
}

export default FigmaLayoutCustomizer;