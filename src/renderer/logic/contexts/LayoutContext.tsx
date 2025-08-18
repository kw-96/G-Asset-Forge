/**
 * 布局配置上下文
 * @description 提供全局的布局配置管理和实时预览功能
 * @author 开发团队
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  leftPanelWidth: number;
  rightPanelWidth: number;
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  toolbarVisible: boolean;
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right';
  panelMode: 'docked' | 'floating' | 'overlay';
  customToolbarItems: string[];
  workspaceTheme: 'light' | 'dark' | 'auto' | 'default';
  gridVisible: boolean;
  rulersVisible: boolean;
  miniMapVisible: boolean;
}

/**
 * 布局配置管理器
 */
export class LayoutConfigManager {
  private static readonly STORAGE_KEY = 'layout-config';
  private static readonly DEFAULT_CONFIG: LayoutConfig = {
    leftPanelWidth: 280,
    rightPanelWidth: 320,
    leftPanelVisible: true,
    rightPanelVisible: true,
    toolbarVisible: true,
    toolbarPosition: 'top',
    panelMode: 'docked',
    customToolbarItems: ['select', 'text', 'shape', 'image', 'brush'],
    workspaceTheme: 'auto',
    gridVisible: false,
    rulersVisible: false,
    miniMapVisible: false,
  };

  /**
   * 加载配置
   */
  static async loadConfig(): Promise<LayoutConfig> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        return this.validateConfig(config);
      }
    } catch (error) {
      console.warn('[layout-config] 加载配置失败，使用默认配置', error);
    }
    return { ...this.DEFAULT_CONFIG };
  }

  /**
   * 保存配置
   */
  static async saveConfig(config: LayoutConfig, source = 'user'): Promise<void> {
    try {
      const validatedConfig = this.validateConfig(config);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validatedConfig));
      console.debug('[layout-config] 配置已保存', { source, config: validatedConfig });
    } catch (error) {
      console.error('[layout-config] 保存配置失败', error);
      throw error;
    }
  }

  /**
   * 重置配置
   */
  static async resetConfig(): Promise<LayoutConfig> {
    const defaultConfig = { ...this.DEFAULT_CONFIG };
    await this.saveConfig(defaultConfig, 'reset');
    return defaultConfig;
  }

  /**
   * 验证配置
   */
  static validateConfig(config: Partial<LayoutConfig>): LayoutConfig {
    const validated: LayoutConfig = { ...this.DEFAULT_CONFIG };

    // 验证数值类型
    if (typeof config.leftPanelWidth === 'number' && config.leftPanelWidth >= 200 && config.leftPanelWidth <= 500) {
      validated.leftPanelWidth = config.leftPanelWidth;
    }
    if (typeof config.rightPanelWidth === 'number' && config.rightPanelWidth >= 200 && config.rightPanelWidth <= 500) {
      validated.rightPanelWidth = config.rightPanelWidth;
    }

    // 验证布尔类型
    if (typeof config.leftPanelVisible === 'boolean') {
      validated.leftPanelVisible = config.leftPanelVisible;
    }
    if (typeof config.rightPanelVisible === 'boolean') {
      validated.rightPanelVisible = config.rightPanelVisible;
    }
    if (typeof config.toolbarVisible === 'boolean') {
      validated.toolbarVisible = config.toolbarVisible;
    }
    if (typeof config.gridVisible === 'boolean') {
      validated.gridVisible = config.gridVisible;
    }
    if (typeof config.rulersVisible === 'boolean') {
      validated.rulersVisible = config.rulersVisible;
    }
    if (typeof config.miniMapVisible === 'boolean') {
      validated.miniMapVisible = config.miniMapVisible;
    }

    // 验证枚举类型
    if (['top', 'bottom', 'left', 'right'].includes(config.toolbarPosition as string)) {
      validated.toolbarPosition = config.toolbarPosition as LayoutConfig['toolbarPosition'];
    }
    if (['docked', 'floating', 'overlay'].includes(config.panelMode as string)) {
      validated.panelMode = config.panelMode as LayoutConfig['panelMode'];
    }
    if (['light', 'dark', 'auto', 'default'].includes(config.workspaceTheme as string)) {
      validated.workspaceTheme = config.workspaceTheme as LayoutConfig['workspaceTheme'];
    }

    // 验证数组类型
    if (Array.isArray(config.customToolbarItems)) {
      validated.customToolbarItems = config.customToolbarItems.filter(item => typeof item === 'string');
    }

    return validated;
  }

  /**
   * 导出配置
   */
  static async exportConfig(): Promise<string> {
    const config = await this.loadConfig();
    return JSON.stringify(config, null, 2);
  }

  /**
   * 导入配置
   */
  static async importConfig(configJson: string): Promise<boolean> {
    try {
      const config = JSON.parse(configJson);
      const validatedConfig = this.validateConfig(config);
      await this.saveConfig(validatedConfig, 'import');
      return true;
    } catch (error) {
      console.error('[layout-config] 导入配置失败', error);
      return false;
    }
  }
}

// 布局预设模板
export const LAYOUT_PRESETS = {
  compact: {
    name: '紧凑',
    description: '适合小屏幕的紧凑布局',
    config: {
      leftPanelWidth: 200,
      rightPanelWidth: 250,
      leftPanelVisible: true,
      rightPanelVisible: true,
      toolbarVisible: true,
      toolbarPosition: 'top' as const,
      panelMode: 'docked' as const,
      customToolbarItems: ['select', 'text', 'shape'],
      workspaceTheme: 'auto' as const,
      gridVisible: false,
      rulersVisible: false,
      miniMapVisible: false
    }
  },
  standard: {
    name: '标准',
    description: '默认的标准布局',
    config: {
      leftPanelWidth: 280,
      rightPanelWidth: 320,
      leftPanelVisible: true,
      rightPanelVisible: true,
      toolbarVisible: true,
      toolbarPosition: 'top' as const,
      panelMode: 'docked' as const,
      customToolbarItems: ['select', 'text', 'shape', 'image', 'brush'],
      workspaceTheme: 'auto' as const,
      gridVisible: false,
      rulersVisible: false,
      miniMapVisible: false
    }
  },
  spacious: {
    name: '宽松',
    description: '适合大屏幕的宽松布局',
    config: {
      leftPanelWidth: 350,
      rightPanelWidth: 400,
      leftPanelVisible: true,
      rightPanelVisible: true,
      toolbarVisible: true,
      toolbarPosition: 'top' as const,
      panelMode: 'docked' as const,
      customToolbarItems: ['select', 'text', 'shape', 'image', 'brush', 'crop'],
      workspaceTheme: 'auto' as const,
      gridVisible: true,
      rulersVisible: true,
      miniMapVisible: true
    }
  }
};

// 布局上下文类型
interface LayoutContextType {
  config: LayoutConfig;
  updateConfig: (updates: Partial<LayoutConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  applyPreset: (presetName: keyof typeof LAYOUT_PRESETS) => Promise<void>;
  validateConfig: (config: Partial<LayoutConfig>) => LayoutConfig;
  isPreviewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
  previewConfig: LayoutConfig | null;
  setPreviewConfig: (config: LayoutConfig | null) => void;
  saveConfig: () => Promise<void>;
  exportConfig: () => Promise<string>;
  importConfig: (configJson: string) => Promise<boolean>;
  isLoading: boolean;
}

// 创建上下文
const LayoutContext = createContext<LayoutContextType | null>(null);

// 自定义Hook
export const useLayoutConfig = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutConfig must be used within a LayoutProvider');
  }
  return context;
};

// 布局提供者属性
interface LayoutProviderProps {
  children: React.ReactNode;
}

/**
 * 布局配置提供者
 */
export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<LayoutConfig>(LAYOUT_PRESETS.standard.config);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<LayoutConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 异步加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const loadedConfig = await LayoutConfigManager.loadConfig();
        setConfig(loadedConfig);
      } catch (error) {
        console.error('[layout-context] 加载布局配置失败', error);
        setConfig(LAYOUT_PRESETS.standard.config);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  // 更新配置
  const updateConfig = useCallback(async (updates: Partial<LayoutConfig>) => {
    const newConfig = LayoutConfigManager.validateConfig({ ...config, ...updates });
    setConfig(newConfig);
    
    // 如果不在预览模式，立即保存
    if (!isPreviewMode) {
      try {
        await LayoutConfigManager.saveConfig(newConfig);
      } catch (error) {
        console.error('[layout-context] 保存配置失败', error);
      }
    }
  }, [config, isPreviewMode]);

  // 重置配置
  const resetConfig = useCallback(async () => {
    try {
      const defaultConfig = await LayoutConfigManager.resetConfig();
      setConfig(defaultConfig);
      setPreviewConfig(null);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('[layout-context] 重置配置失败', error);
    }
  }, []);

  // 应用预设
  const applyPreset = useCallback(async (presetName: keyof typeof LAYOUT_PRESETS) => {
    const preset = LAYOUT_PRESETS[presetName];
    if (preset) {
      const newConfig = LayoutConfigManager.validateConfig(preset.config);
      setConfig(newConfig);
      
      if (!isPreviewMode) {
        try {
          await LayoutConfigManager.saveConfig(newConfig, 'preset');
        } catch (error) {
          console.error('[layout-context] 保存预设配置失败', error);
        }
      }
    }
  }, [isPreviewMode]);

  // 验证配置
  const validateConfig = useCallback((config: Partial<LayoutConfig>): LayoutConfig => {
    return LayoutConfigManager.validateConfig(config);
  }, []);

  // 保存配置
  const saveConfig = useCallback(async () => {
    try {
      await LayoutConfigManager.saveConfig(config);
      setIsPreviewMode(false);
      setPreviewConfig(null);
    } catch (error) {
      console.error('[layout-context] 保存配置失败', error);
    }
  }, [config]);

  // 导出配置
  const exportConfig = useCallback(async (): Promise<string> => {
    try {
      return await LayoutConfigManager.exportConfig();
    } catch (error) {
      console.error('[layout-context] 导出配置失败', error);
      return JSON.stringify(config, null, 2);
    }
  }, [config]);

  // 导入配置
  const importConfig = useCallback(async (configJson: string): Promise<boolean> => {
    try {
      const success = await LayoutConfigManager.importConfig(configJson);
      if (success) {
        const newConfig = await LayoutConfigManager.loadConfig();
        setConfig(newConfig);
        
        if (!isPreviewMode) {
          setIsPreviewMode(false);
          setPreviewConfig(null);
        }
      }
      return success;
    } catch (error) {
      console.error('[layout-context] 导入配置失败', error);
      return false;
    }
  }, [isPreviewMode]);

  // 设置预览模式
  const handleSetPreviewMode = useCallback((enabled: boolean) => {
    setIsPreviewMode(enabled);
    if (!enabled) {
      setPreviewConfig(null);
    }
  }, []);

  // 设置预览配置
  const handleSetPreviewConfig = useCallback((newPreviewConfig: LayoutConfig | null) => {
    setPreviewConfig(newPreviewConfig);
    if (newPreviewConfig) {
      setIsPreviewMode(true);
    }
  }, []);

  // 获取当前有效配置（预览配置优先）
  const effectiveConfig = useMemo(() => {
    return previewConfig || config;
  }, [previewConfig, config]);

  // 上下文值
  const contextValue: LayoutContextType = useMemo(() => ({
    config: effectiveConfig,
    updateConfig,
    resetConfig,
    applyPreset,
    validateConfig,
    isPreviewMode,
    setPreviewMode: handleSetPreviewMode,
    previewConfig,
    setPreviewConfig: handleSetPreviewConfig,
    saveConfig,
    exportConfig,
    importConfig,
    isLoading
  }), [
    effectiveConfig,
    updateConfig,
    resetConfig,
    applyPreset,
    validateConfig,
    isPreviewMode,
    handleSetPreviewMode,
    previewConfig,
    handleSetPreviewConfig,
    saveConfig,
    exportConfig,
    importConfig,
    isLoading
  ]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutProvider;