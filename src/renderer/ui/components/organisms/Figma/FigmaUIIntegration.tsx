import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../../theme/ThemeProvider';

// 导入所有UI增强组件
import { FigmaInteractive } from './FigmaInteractive';
import { useNotifications } from './FigmaNotification';
import { Tooltip as FigmaTooltip } from '../../atoms/Tooltip/Tooltip';
import { FigmaVirtualizedList } from './FigmaVirtualizedList';

// 导入无障碍支持
import { 
  FigmaKeyboardNavigationProvider
} from '../../../accessibility/FigmaKeyboardNavigation';
import { 
  FigmaFocusManagerProvider
} from '../../../accessibility/FigmaFocusManager';
import { 
  FigmaScreenReaderProvider
} from '../../../accessibility/FigmaScreenReader';

// 导入性能监控和批量更新
import { 
  unifiedPerformanceMonitor,
  useUnifiedPerformanceMonitor 
} from '../../../../logic/utils/performance/UnifiedPerformanceMonitor';
import { 
  figmaBatchUpdateManager
} from '../../../../logic/utils/FigmaBatchUpdateManager';

// 导入布局自定义
import { 
  LayoutConfigManager,
  type LayoutConfig 
} from '../../../business/Layout';

// UI集成状态接口
export interface UIIntegrationState {
  isInitialized: boolean;
  performanceMonitoringEnabled: boolean;
  accessibilityEnabled: boolean;
  customLayoutEnabled: boolean;
  currentLayout: LayoutConfig;
  performanceScore: number;
  lastError: string | null;
}

// UI集成配置接口
export interface UIIntegrationConfig {
  enablePerformanceMonitoring: boolean;
  enableAccessibility: boolean;
  enableCustomLayout: boolean;
  enableBatchUpdates: boolean;
  enableNotifications: boolean;
  autoOptimizePerformance: boolean;
}

// 样式组件
const IntegrationContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const IntegrationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const IntegrationTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const IntegrationStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIndicator = styled.div<{ status: 'good' | 'warning' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'good': return props.theme.colors.status.success;
      case 'warning': return props.theme.colors.status.warning;
      case 'error': return props.theme.colors.status.error;
      default: return props.theme.colors.border.default;
    }
  }};
`;

const StatusText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
`;

const IntegrationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DemoSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const DemoTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const DemoCard = styled(motion.div)`
  padding: 16px;
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.background.primary};
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.accent};
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const DemoCardTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const DemoCardDescription = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const PerformancePanel = styled.div`
  padding: 16px;
  background: ${props => props.theme.colors.background.secondary};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
`;

const PerformanceMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const MetricCard = styled.div`
  padding: 12px;
  border-radius: ${props => props.theme.borderRadius.small};
  background: ${props => props.theme.colors.background.primary};
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// 默认配置
const DEFAULT_CONFIG: UIIntegrationConfig = {
  enablePerformanceMonitoring: true,
  enableAccessibility: true,
  enableCustomLayout: true,
  enableBatchUpdates: true,
  enableNotifications: true,
  autoOptimizePerformance: true
};

/**
 * Figma UI集成组件
 * 整合所有UI增强功能并提供统一的管理界面
 */
export const FigmaUIIntegration: React.FC<{
  config?: Partial<UIIntegrationConfig>;
  onStateChange?: (state: UIIntegrationState) => void;
}> = ({ 
  config = {}, 
  onStateChange 
}) => {
  const theme = useTheme();
  const notifications = useNotifications();
  const performanceMonitor = useUnifiedPerformanceMonitor();
  // const batchUpdateManager = useBatchUpdateManager(); // 暂时未使用
  // const keyboardNavigation = useKeyboardNavigation(); // 暂时未使用
  // const focusManager = useFocusManager(); // 暂时未使用
  // const screenReader = useScreenReader(); // 暂时未使用
  
  // 合并配置
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // 状态管理
  const [state, setState] = useState<UIIntegrationState>({
    isInitialized: false,
    performanceMonitoringEnabled: false,
    accessibilityEnabled: false,
    customLayoutEnabled: false,
    currentLayout: {
      leftPanelWidth: 280,
      rightPanelWidth: 320,
      leftPanelVisible: true,
      rightPanelVisible: true,
      toolbarVisible: true,
      toolbarPosition: 'left',
      panelMode: 'docked',
      customToolbarItems: [],
      workspaceTheme: 'auto',
      gridVisible: false,
      rulersVisible: false,
      miniMapVisible: false,
    },
    performanceScore: 0,
    lastError: null
  });
  
  // 演示数据
  const [demoItems] = useState(() => 
    Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      data: {
        name: `项目 ${i + 1}`,
        description: `这是第 ${i + 1} 个演示项目`,
        category: ['基础', '高级', '工具'][i % 3]
      },
      group: ['基础', '高级', '工具'][i % 3]
    }))
  );
  
  // 初始化UI集成
  const initializeIntegration = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, lastError: null }));
      
      // 启动性能监控
      if (finalConfig.enablePerformanceMonitoring) {
        performanceMonitor.startMonitoring();
        setState(prev => ({ ...prev, performanceMonitoringEnabled: true }));
      }
      
      // 启用无障碍支持
      if (finalConfig.enableAccessibility) {
        setState(prev => ({ ...prev, accessibilityEnabled: true }));
      }
      
      // 启用自定义布局
      if (finalConfig.enableCustomLayout) {
        setState(prev => ({ ...prev, customLayoutEnabled: true }));
      }
      
      // 按需求：成功时不提示，仅在错误时提示
      
      setState(prev => ({ ...prev, isInitialized: true }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setState(prev => ({ ...prev, lastError: errorMessage }));
      
      if (finalConfig.enableNotifications) {
        notifications.show({
          type: 'error',
          title: 'UI集成失败',
          message: errorMessage,
          duration: 5000
        });
      }
    }
  }, [finalConfig, performanceMonitor, notifications]);
  
  // 性能监控回调
  const handlePerformanceReport = useCallback((report: any) => {
    setState(prev => ({ ...prev, performanceScore: report.score }));
    
    // 自动性能优化
    if (finalConfig.autoOptimizePerformance && report.score < 60) {
      // const adaptiveSettings = performanceMonitor.getAdaptiveSettings(); // 暂时未使用
      
      if (finalConfig.enableNotifications) {
        notifications.show({
          type: 'warning',
          title: '性能优化建议',
          message: `当前性能评分: ${report.score}，已自动调整设置以提升性能`,
          duration: 4000
        });
      }
    }
  }, [finalConfig, performanceMonitor, notifications]);
  
  // 演示功能
  const demonstrateFeature = useCallback((featureName: string) => {
    const endMeasurement = performanceMonitor.measureInteractionDelay(featureName);
    
    // 模拟功能执行
    setTimeout(() => {
      endMeasurement();
      
      if (finalConfig.enableNotifications) {
        notifications.show({
          type: 'info',
          title: `${featureName} 演示`,
          message: `${featureName}功能演示完成`,
          duration: 2000
        });
      }
    }, Math.random() * 1000 + 500);
  }, [performanceMonitor, notifications, finalConfig]);
  
  // // 布局配置变化处理
  // const handleLayoutConfigChange = useCallback((newConfig: LayoutConfig) => {
  //   LayoutConfigManager.saveConfig(newConfig);
  //   setState(prev => ({ ...prev, currentLayout: newConfig }));
    
  //   if (finalConfig.enableNotifications) {
  //     notifications.show({
  //       type: 'success',
  //       title: '布局已更新',
  //       message: '界面布局配置已保存',
  //       duration: 2000
  //     });
  //   }
  // }, [finalConfig, notifications]);
  
  // // 重置布局配置
  // const handleLayoutReset = useCallback(() => {
  //   const defaultConfig = LayoutConfigManager.resetConfig();
  //   setState(prev => ({ ...prev, currentLayout: defaultConfig }));
    
  //   if (finalConfig.enableNotifications) {
  //     notifications.show({
  //       type: 'info',
  //       title: '布局已重置',
  //       message: '界面布局已恢复为默认设置',
  //       duration: 2000
  //     });
  //   }
  // }, [finalConfig, notifications]);
  
  // 组件挂载时初始化
  useEffect(() => {
    initializeIntegration();
    // 异步加载布局配置
    (async () => {
      try {
        const cfg = await LayoutConfigManager.loadConfig();
        setState(prev => ({ ...prev, currentLayout: cfg }));
      } catch {}
    })();
    
    // 添加性能监控监听器
    if (finalConfig.enablePerformanceMonitoring) {
      const removeListener = unifiedPerformanceMonitor.addReportListener(handlePerformanceReport);
      return removeListener;
    }
  }, [initializeIntegration, finalConfig.enablePerformanceMonitoring, handlePerformanceReport]);
  
  // 状态变化通知
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);
  
  // 获取状态指示器
  const getStatusIndicator = () => {
    if (state.lastError) return 'error';
    if (state.performanceScore < 60) return 'warning';
    return 'good';
  };
  
  return (
    <FigmaKeyboardNavigationProvider>
      <FigmaFocusManagerProvider>
        <FigmaScreenReaderProvider>
          <IntegrationContainer>
            <IntegrationHeader>
              <IntegrationTitle>Figma UI增强功能集成</IntegrationTitle>
              <IntegrationStatus>
                <StatusIndicator status={getStatusIndicator()} />
                <StatusText>
                  {state.isInitialized ? '已初始化' : '初始化中...'}
                </StatusText>
              </IntegrationStatus>
            </IntegrationHeader>
            
            <IntegrationContent>
              {/* 功能演示区域 */}
              <DemoSection>
                <DemoTitle>UI增强功能演示</DemoTitle>
                <DemoGrid>
                  <FigmaInteractive variant="card">
                    <DemoCard
                      onClick={() => demonstrateFeature('过渡动画')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <DemoCardTitle>过渡动画</DemoCardTitle>
                      <DemoCardDescription>
                        Figma风格的流畅过渡动画效果
                      </DemoCardDescription>
                    </DemoCard>
                  </FigmaInteractive>
                  
                  <FigmaInteractive variant="card">
                    <DemoCard
                      onClick={() => demonstrateFeature('微交互')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <DemoCardTitle>微交互</DemoCardTitle>
                      <DemoCardDescription>
                        精细的悬停和点击反馈效果
                      </DemoCardDescription>
                    </DemoCard>
                  </FigmaInteractive>
                  
                  <FigmaTooltip content="点击查看加载动画演示">
                    <FigmaInteractive variant="card">
                      <DemoCard
                        onClick={() => demonstrateFeature('加载动画')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <DemoCardTitle>加载动画</DemoCardTitle>
                        <DemoCardDescription>
                          多种加载状态和骨架屏效果
                        </DemoCardDescription>
                      </DemoCard>
                    </FigmaInteractive>
                  </FigmaTooltip>
                  
                  <FigmaInteractive variant="card">
                    <DemoCard
                      onClick={() => demonstrateFeature('通知系统')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <DemoCardTitle>通知系统</DemoCardTitle>
                      <DemoCardDescription>
                        智能定位的通知和反馈系统
                      </DemoCardDescription>
                    </DemoCard>
                  </FigmaInteractive>
                </DemoGrid>
              </DemoSection>
              
              {/* 虚拟化列表演示 */}
              <DemoSection>
                <DemoTitle>虚拟化列表演示 (1000项)</DemoTitle>
                <FigmaVirtualizedList
                  items={demoItems}
                  config={{
                    itemHeight: 48,
                    containerHeight: 300,
                    enableGrouping: true,
                    enableSearch: true
                  }}
                  renderItem={(item, index) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: theme.colors.accent + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: theme.colors.text.primary 
                        }}>
                          {item.data.name}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: theme.colors.text.secondary 
                        }}>
                          {item.data.description}
                        </div>
                      </div>
                    </div>
                  )}
                  onItemClick={(item) => {
                    notifications.show({
                      type: 'info',
                      title: '项目选中',
                      message: `选中了 ${item.data.name}`,
                      duration: 1500
                    });
                  }}
                />
              </DemoSection>
            </IntegrationContent>
            
            {/* 性能监控面板 */}
            {state.performanceMonitoringEnabled && (
              <PerformancePanel>
                <DemoTitle>性能监控</DemoTitle>
                <PerformanceMetrics>
                  <MetricCard>
                    <MetricValue>{state.performanceScore}</MetricValue>
                    <MetricLabel>性能评分</MetricLabel>
                  </MetricCard>
                  <MetricCard>
                    <MetricValue>{figmaBatchUpdateManager.getQueueStatus().high}</MetricValue>
                    <MetricLabel>高优先级任务</MetricLabel>
                  </MetricCard>
                    <MetricCard>
                      <MetricValue>{Math.round(performanceMonitor.getMetrics().fps || 0)}</MetricValue>
                      <MetricLabel>当前FPS</MetricLabel>
                    </MetricCard>
                  <MetricCard>
                    <MetricValue>{Math.round(performanceMonitor.getMetrics().memoryUsage || 0)}MB</MetricValue>
                    <MetricLabel>内存使用</MetricLabel>
                  </MetricCard>
                </PerformanceMetrics>
              </PerformancePanel>
            )}
          </IntegrationContainer>
        </FigmaScreenReaderProvider>
      </FigmaFocusManagerProvider>
    </FigmaKeyboardNavigationProvider>
  );
};

export type { UIIntegrationState as FigmaUIIntegrationState, UIIntegrationConfig as FigmaUIIntegrationConfig };
export { FigmaUIIntegration as FigmaUIIntegrationProps };