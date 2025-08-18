// 备份管理组件
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Header,
  Title,
  ButtonPrimary,
  StatsGrid,
  StatItem,
  StatTitle,
  StatValue,
  TabsBar,
  TabButton,
  Section,
  Empty,
  Card,
  CardHeader,
  CardTitle,
  CardMeta,
  Tag,
  Actions,
  OutlineButton,
  DangerButton,
  SuccessButton,
  PrimaryButton,
  // FormRow,
  Label,
  NumberInput,
  TextInput
} from './BackupManager.styles';
import { 
  BackupManager as BackupManagerClass,
  type IBackupMetadata,
  type IFileConflict,
  type IBackupConfig
} from '../../../logic/managers/storage/BackupManager';

interface IBackupManagerProps {
  onBackupCreated?: (backup: IBackupMetadata) => void;
  onConflictDetected?: (conflict: IFileConflict) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const BackupManager: React.FC<IBackupManagerProps> = ({
  onBackupCreated,
  onConflictDetected,
  className,
  style
}) => {
  const managerRef = useRef<BackupManagerClass | null>(null);
  const [backups, setBackups] = useState<IBackupMetadata[]>([]);
  const [conflicts, setConflicts] = useState<IFileConflict[]>([]);
  const [config, setConfig] = useState<IBackupConfig | null>(null);
  const [stats, setStats] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'backups' | 'conflicts' | 'settings'>('backups');
  // NOTE: 保留以备后续交互扩展
  // 仅读取选中项，不需要 setter，避免未使用变量告警
  const [selectedBackup] = useState<string | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // 初始化管理器
  useEffect(() => {
    managerRef.current = new BackupManagerClass();

    // 绑定事件
    managerRef.current.on('backupCreated', (backup) => {
      onBackupCreated?.(backup);
      updateData();
    });

    managerRef.current.on('conflictDetected', (conflict) => {
      onConflictDetected?.(conflict);
      updateData();
    });

    managerRef.current.on('conflictResolved', () => {
      updateData();
    });

    managerRef.current.on('autoBackupCompleted', (count) => {
      console.log(`自动备份完成，创建了 ${count} 个备份`);
      updateData();
    });

    // 加载初始数据
    updateData();

    return () => {
      managerRef.current?.destroy();
    };
  }, [onBackupCreated, onConflictDetected]);

  // 更新数据
  const updateData = useCallback(() => {
    if (!managerRef.current) return;

    setBackups(managerRef.current.getAllBackups());
    setConflicts(managerRef.current.getAllConflicts());
    setConfig(managerRef.current.getConfig());
    setStats(managerRef.current.getBackupStats());
  }, []);

  // 创建备份
  const handleCreateBackup = useCallback(async (filePath: string) => {
    if (!managerRef.current) return;

    setIsCreatingBackup(true);
    
    try {
      await managerRef.current.createBackup(filePath, {
        description: '手动备份',
        tags: ['manual']
      });
    } catch (error) {
      console.error('创建备份失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(`创建备份失败: ${msg}`);
    } finally {
      setIsCreatingBackup(false);
    }
  }, []);

  // 恢复备份
  const handleRestoreBackup = useCallback(async (backupId: string) => {
    if (!managerRef.current) return;

    if (confirm('确定要恢复这个备份吗？当前文件将被覆盖。')) {
      try {
        await managerRef.current.restoreBackup(backupId);
        alert('备份恢复成功！');
      } catch (error) {
        console.error('恢复备份失败:', error);
        const msg = error instanceof Error ? error.message : String(error);
        alert(`恢复备份失败: ${msg}`);
      }
    }
  }, []);

  // 删除备份
  const handleDeleteBackup = useCallback(async (backupId: string) => {
    if (!managerRef.current) return;

    if (confirm('确定要删除这个备份吗？此操作不可撤销。')) {
      try {
        await managerRef.current.deleteBackup(backupId);
      } catch (error) {
        console.error('删除备份失败:', error);
        const msg = error instanceof Error ? error.message : String(error);
        alert(`删除备份失败: ${msg}`);
      }
    }
  }, []);

  // 解决冲突
  const handleResolveConflict = useCallback(async (
    conflictId: string,
    resolution: NonNullable<IFileConflict['resolution']>
  ) => {
    if (!managerRef.current) return;

    try {
      await managerRef.current.resolveConflict(conflictId, resolution);
    } catch (error) {
      console.error('解决冲突失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(`解决冲突失败: ${msg}`);
    }
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleString('zh-CN');
  };

  if (!config) {
    return <div>加载中...</div>;
  }

  return (
    <Container className={className} style={style}>
      {/* 头部 */}
      <Header>
        <Title>💾 备份管理</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonPrimary
            type="button"
            aria-label="创建备份"
            disabled={isCreatingBackup}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  void handleCreateBackup(file.path || file.name);
                }
              };
              input.click();
            }}
          >
            {isCreatingBackup ? '创建中...' : '📁 创建备份'}
          </ButtonPrimary>
        </div>
      </Header>

      {/* 统计信息 */}
      <StatsGrid>
        <StatItem>
          <StatTitle>总备份</StatTitle>
          <StatValue>{stats.totalBackups}</StatValue>
        </StatItem>
        <StatItem>
          <StatTitle color="#28a745">总大小</StatTitle>
          <StatValue size={14}>{formatFileSize(stats.totalSize)}</StatValue>
        </StatItem>
        <StatItem>
          <StatTitle color="#ff9800">自动备份</StatTitle>
          <StatValue>{stats.autoBackups}</StatValue>
        </StatItem>
        <StatItem>
          <StatTitle color="#dc3545">冲突</StatTitle>
          <StatValue>{conflicts.filter(c => !c.resolved).length}</StatValue>
        </StatItem>
      </StatsGrid>

      {/* 标签页导航 */}
      <TabsBar role="tablist" aria-label="备份管理选项卡">
        {[
          { key: 'backups', label: '备份列表' },
          { key: 'conflicts', label: '冲突管理' },
          { key: 'settings', label: '设置' }
        ].map(tab => (
          <TabButton
            key={tab.key}
            type="button"
            active={activeTab === (tab.key as any)}
            aria-pressed={activeTab === (tab.key as any)}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsBar>

      {/* 内容区域 */}
      <Section>
        {/* 备份列表 */}
        {activeTab === 'backups' && (
          <div>
            {backups.length === 0 ? (
              <Empty>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💾</div>
                <div>还没有备份文件</div>
              </Empty>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {backups.map(backup => (
                  <Card key={backup.id} bgColor={selectedBackup === backup.id ? '#f0f8ff' : '#f8f9fa'}>
                    <CardHeader>
                      <div style={{ flex: 1 }}>
                        <CardTitle>{backup.originalPath}</CardTitle>
                        <CardMeta>版本 {backup.version} • {formatDate(backup.timestamp)} • {formatFileSize(backup.fileSize)}</CardMeta>
                        {backup.description && (
                          <CardMeta style={{ color: '#999' }}>{backup.description}</CardMeta>
                        )}
                        <div style={{ display: 'flex', gap: 4 }}>
                          {backup.tags.map(tag => (
                            <Tag key={tag} color={backup.isAutoBackup ? '#28a745' : '#007bff'}>{tag}</Tag>
                          ))}
                        </div>
                      </div>
                      
                      <Actions>
                        <SuccessButton type="button" onClick={() => handleRestoreBackup(backup.id)} aria-label="恢复备份">
                          恢复
                        </SuccessButton>
                        <DangerButton type="button" onClick={() => handleDeleteBackup(backup.id)} aria-label="删除备份">
                          删除
                        </DangerButton>
                      </Actions>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 冲突管理 */}
        {activeTab === 'conflicts' && (
          <div>
            {conflicts.length === 0 ? (
              <Empty>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <div>没有文件冲突</div>
              </Empty>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {conflicts.map(conflict => (
                  <Card
                    key={conflict.id}
                    borderColor={conflict.resolved ? '#28a745' : '#dc3545'}
                    bgColor={conflict.resolved ? '#f8fff9' : '#fff5f5'}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <CardTitle>{conflict.filePath}</CardTitle>
                      <CardMeta>冲突类型: {conflict.conflictType} • 检测时间: {formatDate(conflict.detectedAt)}</CardMeta>
                    </div>
                    
                    {!conflict.resolved ? (
                      <Actions>
                        <PrimaryButton type="button" onClick={() => handleResolveConflict(conflict.id, 'keep_local')} aria-label="保留本地">
                          保留本地
                        </PrimaryButton>
                        <SuccessButton type="button" onClick={() => handleResolveConflict(conflict.id, 'keep_remote')} aria-label="保留远程">
                          保留远程
                        </SuccessButton>
                        <OutlineButton color="#ffc107" type="button" onClick={() => handleResolveConflict(conflict.id, 'rename')} aria-label="重命名">
                          重命名
                        </OutlineButton>
                      </Actions>
                    ) : (
                      <CardMeta style={{ color: '#28a745' }}>已解决: {conflict.resolution}</CardMeta>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 设置 */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => {
                    managerRef.current?.updateConfig({ enabled: e.target.checked });
                    updateData();
                  }}
                  style={{ marginRight: 8 }}
                />
                启用备份功能
              </label>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={config.autoBackup}
                  onChange={(e) => {
                    managerRef.current?.updateConfig({ autoBackup: e.target.checked });
                    updateData();
                  }}
                  style={{ marginRight: 8 }}
                />
                启用自动备份
              </label>
            </div>
            
            <div>
              <Label htmlFor="max-backups">最大备份数量</Label>
              <NumberInput
                id="max-backups"
                type="number"
                value={config.maxBackups}
                onChange={(e) => {
                  managerRef.current?.updateConfig({ maxBackups: parseInt(e.target.value) || 10 });
                  updateData();
                }}
                min="1"
                max="100"
              />
            </div>
            
            <div>
              <Label htmlFor="backup-interval">自动备份间隔（分钟）</Label>
              <NumberInput
                id="backup-interval"
                type="number"
                value={config.backupInterval}
                onChange={(e) => {
                  managerRef.current?.updateConfig({ backupInterval: parseInt(e.target.value) || 30 });
                  updateData();
                }}
                min="5"
                max="1440"
              />
            </div>
            
            <div>
              <Label htmlFor="backup-path">备份路径</Label>
              <TextInput
                id="backup-path"
                type="text"
                value={config.backupPath}
                readOnly
              />
            </div>
          </div>
        )}
      </Section>
    </Container>
  );
};

export default BackupManager;