/**
 * 布局配置管理组件
 * 提供配置的导入、导出、历史记录管理等功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutConfigManager, StoredLayoutConfig } from './FigmaLayoutCustomizer';
import { useLayoutConfig } from '../../contexts/LayoutContext';

// 样式组件
const ManagerContainer = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  max-height: 80vh;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: ${props => props.theme.shadows.strong};
  z-index: 1001;
  overflow: hidden;
`;

const ManagerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
`;

const ManagerTitle = styled.h2`
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

const ManagerContent = styled.div`
  padding: 24px;
  max-height: calc(80vh - 140px);
  overflow-y: auto;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  margin-bottom: 24px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: ${props => props.active ? props.theme.colors.accent : props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.accent : 'transparent'};
  transition: all 0.15s ease;
  
  &:hover {
    color: ${props => props.theme.colors.text.primary};
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

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ActionCard = styled.div`
  padding: 16px;
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.background.secondary};
`;

const ActionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ActionDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
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
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.small};
  background: ${props => props.theme.colors.background.secondary};
`;

const HistoryInfo = styled.div`
  flex: 1;
`;

const HistoryTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const HistoryMeta = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const HistoryActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 4px 8px;
  border: 1px solid ${props => props.variant === 'primary' ? props.theme.colors.accent : props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.small};
  background: ${props => props.variant === 'primary' ? props.theme.colors.accent : props.theme.colors.background.primary};
  color: ${props => props.variant === 'primary' ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  padding: 16px;
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.background.secondary};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.accent};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

// 组件属性接口
interface LayoutConfigManagerProps {
  onClose: () => void;
  className?: string;
}

/**
 * 布局配置管理组件
 */
export const LayoutConfigManagerComponent: React.FC<LayoutConfigManagerProps> = ({
  onClose,
  className
}) => {
  const { importConfig } = useLayoutConfig();
  const [activeTab, setActiveTab] = useState<'import-export' | 'history' | 'stats'>('import-export');
  const [history, setHistory] = useState<StoredLayoutConfig[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 加载历史记录和统计信息
  useEffect(() => {
    const loadData = () => {
      const configHistory = LayoutConfigManager.getConfigHistory();
      const configStats = LayoutConfigManager.getConfigStats();
      
      setHistory(configHistory);
      setStats(configStats);
    };

    loadData();
  }, []);

  // 导出配置
  const handleExport = useCallback(async () => {
    try {
      setIsLoading(true);
      await LayoutConfigManager.exportConfigToFile();
    } catch (error) {
      console.error('导出配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 导入配置
  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const success = await LayoutConfigManager.importConfigFromFile(file);
      
      if (success) {
        // 重新加载配置到上下文
        const configJson = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
        
        await importConfig(configJson);
        
        // 刷新历史记录
        const newHistory = LayoutConfigManager.getConfigHistory();
        setHistory(newHistory);
        
        console.log('配置导入并应用成功');
      }
    } catch (error) {
      console.error('导入配置失败:', error);
    } finally {
      setIsLoading(false);
      // 清除文件输入
      event.target.value = '';
    }
  }, [importConfig]);

  // 从历史记录恢复
  const handleRestoreFromHistory = useCallback(async (index: number) => {
    try {
      setIsLoading(true);
      const success = await LayoutConfigManager.restoreFromHistory(index);
      
      if (success) {
        // 刷新历史记录
        const newHistory = LayoutConfigManager.getConfigHistory();
        setHistory(newHistory);
        
        console.log('从历史记录恢复配置成功');
      }
    } catch (error) {
      console.error('从历史记录恢复失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 清理历史记录
  const handleClearHistory = useCallback(() => {
    if (window.confirm('确定要清除所有配置历史记录吗？此操作不可撤销。')) {
      LayoutConfigManager.clearHistory();
      setHistory([]);
      
      // 更新统计信息
      const newStats = LayoutConfigManager.getConfigStats();
      setStats(newStats);
    }
  }, []);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ManagerContainer
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <ManagerHeader>
        <ManagerTitle>布局配置管理</ManagerTitle>
        <CloseButton onClick={onClose}>
          ✕
        </CloseButton>
      </ManagerHeader>

      <TabContainer>
        <Tab
          active={activeTab === 'import-export'}
          onClick={() => setActiveTab('import-export')}
        >
          导入/导出
        </Tab>
        <Tab
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          历史记录
        </Tab>
        <Tab
          active={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
        >
          统计信息
        </Tab>
      </TabContainer>

      <ManagerContent>
        <AnimatePresence mode="wait">
          {activeTab === 'import-export' && (
            <motion.div
              key="import-export"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Section>
                <SectionTitle>配置管理</SectionTitle>
                <ActionGrid>
                  <ActionCard>
                    <ActionTitle>导出配置</ActionTitle>
                    <ActionDescription>
                      将当前的布局配置导出为JSON文件，可以在其他设备上导入使用。
                    </ActionDescription>
                    <Button
                      variant="primary"
                      onClick={handleExport}
                      disabled={isLoading}
                    >
                      {isLoading ? '导出中...' : '导出配置'}
                    </Button>
                  </ActionCard>

                  <ActionCard>
                    <ActionTitle>导入配置</ActionTitle>
                    <ActionDescription>
                      从JSON文件导入布局配置，将替换当前配置。
                    </ActionDescription>
                    <Button
                      variant="secondary"
                      onClick={() => document.getElementById('config-file-input')?.click()}
                      disabled={isLoading}
                    >
                      {isLoading ? '导入中...' : '选择文件'}
                    </Button>
                    <FileInput
                      id="config-file-input"
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                    />
                  </ActionCard>

                  <ActionCard>
                    <ActionTitle>重置配置</ActionTitle>
                    <ActionDescription>
                      将所有配置重置为默认值，当前配置将保存到历史记录中。
                    </ActionDescription>
                    <Button
                      variant="danger"
                      onClick={async () => {
                        if (window.confirm('确定要重置所有配置吗？')) {
                          await LayoutConfigManager.resetConfig();
                          window.location.reload();
                        }
                      }}
                      disabled={isLoading}
                    >
                      重置配置
                    </Button>
                  </ActionCard>
                </ActionGrid>
              </Section>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <SectionTitle>配置历史记录</SectionTitle>
                  <Button
                    variant="danger"
                    onClick={handleClearHistory}
                    disabled={history.length === 0}
                    style={{ width: 'auto', padding: '6px 12px' }}
                  >
                    清除历史
                  </Button>
                </div>
                
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    暂无配置历史记录
                  </div>
                ) : (
                  <HistoryList>
                    {history.map((item, index) => (
                      <HistoryItem key={`${item.version.timestamp}-${index}`}>
                        <HistoryInfo>
                          <HistoryTitle>
                            {item.version.description || '配置更新'}
                          </HistoryTitle>
                          <HistoryMeta>
                            {formatTime(item.version.timestamp)} • 
                            来源: {item.metadata.configSource} • 
                            版本: {item.version.version}
                            {item.metadata.tags && item.metadata.tags.length > 0 && (
                              <> • 标签: {item.metadata.tags.join(', ')}</>
                            )}
                          </HistoryMeta>
                        </HistoryInfo>
                        <HistoryActions>
                      <SmallButton
                            variant="primary"
                            onClick={() => handleRestoreFromHistory(index)}
                            disabled={isLoading}
                          >
                        恢复
                          </SmallButton>
                        </HistoryActions>
                      </HistoryItem>
                    ))}
                  </HistoryList>
                )}
              </Section>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Section>
                <SectionTitle>配置统计信息</SectionTitle>
                {stats && (
                  <StatsGrid>
                    <StatCard>
                      <StatValue>{stats.totalConfigs}</StatValue>
                      <StatLabel>总配置数</StatLabel>
                    </StatCard>
                    
                    <StatCard>
                      <StatValue>{formatSize(stats.averageConfigSize)}</StatValue>
                      <StatLabel>平均配置大小</StatLabel>
                    </StatCard>
                    
                    <StatCard>
                      <StatValue>
                        {stats.oldestConfig ? formatTime(stats.oldestConfig).split(' ')[0] : 'N/A'}
                      </StatValue>
                      <StatLabel>最早配置</StatLabel>
                    </StatCard>
                    
                    <StatCard>
                      <StatValue>
                        {stats.newestConfig ? formatTime(stats.newestConfig).split(' ')[0] : 'N/A'}
                      </StatValue>
                      <StatLabel>最新配置</StatLabel>
                    </StatCard>
                  </StatsGrid>
                )}
                
                {stats && Object.keys(stats.configSources).length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>
                      配置来源分布
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(stats.configSources).map(([source, count]) => (
                        <div
                          key={source}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: '#f5f5f5',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <span>{source}</span>
                          <span style={{ fontWeight: '600' }}>{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            </motion.div>
          )}
        </AnimatePresence>
      </ManagerContent>
    </ManagerContainer>
  );
};

export default LayoutConfigManagerComponent;