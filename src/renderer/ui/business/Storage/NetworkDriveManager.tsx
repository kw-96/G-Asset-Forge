// 网络驱动器管理组件
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  NetworkDriveManager as NetworkDriveManagerClass,
  type INetworkDriveConfig,
  type IStorageLocation
} from '../../../logic/managers/storage/NetworkDriveManager';

interface INetworkDriveManagerProps {
  onStorageLocationChange?: (location: IStorageLocation) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const NetworkDriveManager: React.FC<INetworkDriveManagerProps> = ({
  onStorageLocationChange,
  className,
  style
}) => {
  const managerRef = useRef<NetworkDriveManagerClass | null>(null);
  const [drives, setDrives] = useState<INetworkDriveConfig[]>([]);
  const [storageLocations, setStorageLocations] = useState<IStorageLocation[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showAddDriveDialog, setShowAddDriveDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<string | null>(null);

  // 新驱动器表单状态
  const [newDriveName, setNewDriveName] = useState('');
  const [newDrivePath, setNewDrivePath] = useState('');
  const [newDriveType, setNewDriveType] = useState<'smb' | 'nfs' | 'mapped'>('smb');
  const [newDrivePriority, setNewDrivePriority] = useState(10);
  const [newDriveEnabled, setNewDriveEnabled] = useState(true);

  // 初始化管理器
  useEffect(() => {
    const userDataPath = process.env['NODE_ENV'] === 'development' 
      ? './dev-user-data' 
      : require('electron').remote?.app.getPath('userData') || './user-data';
    
    managerRef.current = new NetworkDriveManagerClass(userDataPath);

    // 绑定事件
    managerRef.current.on('driveConnected', (driveId) => {
      console.log(`驱动器已连接: ${driveId}`);
      updateData();
    });

    managerRef.current.on('driveDisconnected', (driveId) => {
      console.log(`驱动器已断开: ${driveId}`);
      updateData();
    });

    managerRef.current.on('driveError', (driveId, error) => {
      console.error(`驱动器错误 ${driveId}:`, error);
      updateData();
    });

    managerRef.current.on('storageLocationUpdated', (location) => {
      onStorageLocationChange?.(location);
      updateData();
    });

    managerRef.current.on('fallbackActivated', (originalPath, fallbackPath) => {
      console.warn(`存储回退激活: ${originalPath} -> ${fallbackPath}`);
    });

    // 加载初始数据
    updateData();

    return () => {
      managerRef.current?.destroy();
    };
  }, [onStorageLocationChange]);

  // 更新数据
  const updateData = useCallback(() => {
    if (!managerRef.current) return;

    setDrives(managerRef.current.getAllDrives());
    setStorageLocations(managerRef.current.getAvailableStorageLocations());
    setStats(managerRef.current.getNetworkDriveStats());
  }, []);

  // 添加网络驱动器
  const handleAddDrive = useCallback(async () => {
    if (!managerRef.current || !newDriveName.trim() || !newDrivePath.trim()) return;

    try {
      await managerRef.current.addNetworkDrive({
        name: newDriveName.trim(),
        path: newDrivePath.trim(),
        type: newDriveType,
        enabled: newDriveEnabled,
        priority: newDrivePriority,
        options: {
          timeout: 10000,
          retryCount: 3,
          autoReconnect: true
        }
      });

      // 重置表单
      setNewDriveName('');
      setNewDrivePath('');
      setNewDriveType('smb');
      setNewDrivePriority(10);
      setNewDriveEnabled(true);
      setShowAddDriveDialog(false);

      updateData();
    } catch (error) {
      console.error('添加网络驱动器失败:', error);
    }
  }, [newDriveName, newDrivePath, newDriveType, newDrivePriority, newDriveEnabled]);

  // 移除网络驱动器
  const handleRemoveDrive = useCallback((driveId: string) => {
    if (!managerRef.current) return;

    if (confirm('确定要移除这个网络驱动器吗？')) {
      managerRef.current.removeNetworkDrive(driveId);
      updateData();
    }
  }, []);

  // 切换驱动器启用状态
  const handleToggleDrive = useCallback((driveId: string, enabled: boolean) => {
    if (!managerRef.current) return;

    managerRef.current.updateNetworkDrive(driveId, { enabled });
    updateData();
  }, []);

  // 测试驱动器连接
  const handleTestDrive = useCallback(async (drive: INetworkDriveConfig) => {
    if (!managerRef.current) return;

    setSelectedDrive(drive.id);
    
    try {
      const result = await managerRef.current.testDriveConnection(drive);
      
      if (result.success) {
        alert(`连接成功！响应时间: ${result.responseTime}ms`);
      } else {
        alert(`连接失败: ${result.error}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`测试失败: ${msg}`);
    } finally {
      setSelectedDrive(null);
    }
  }, []);

  // 刷新所有驱动器
  const handleRefreshAll = useCallback(async () => {
    if (!managerRef.current) return;

    setIsRefreshing(true);
    
    try {
      await managerRef.current.refreshAllDrives();
    } catch (error) {
      console.error('刷新驱动器失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className={className} style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      ...style
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            🌐 网络驱动器管理
          </h4>
          
          <div style={{ fontSize: '12px', color: '#666' }}>
            {stats.availableDrives}/{stats.totalDrives} 可用
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            style={{
              padding: '6px 12px',
              border: '1px solid #28a745',
              backgroundColor: 'white',
              color: '#28a745',
              borderRadius: '4px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            {isRefreshing ? '🔄 刷新中...' : '🔄 刷新'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowAddDriveDialog(true)}
            style={{
              padding: '6px 12px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ➕ 添加驱动器
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#e3f2fd',
        borderBottom: '1px solid #bbdefb',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        fontSize: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#1976d2' }}>总驱动器</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.totalDrives}</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#28a745' }}>可用驱动器</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
            {stats.availableDrives}
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#ff9800' }}>网络驱动器</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.networkDrives}</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#666' }}>本地驱动器</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.localDrives}</div>
        </div>
      </div>

      {/* 驱动器列表 */}
      <div style={{ padding: '16px' }}>
        {drives.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💾</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>还没有配置网络驱动器</div>
            <div style={{ fontSize: '12px' }}>点击"添加驱动器"开始配置</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {drives.map(drive => {
              const location = storageLocations.find(l => l.id === drive.id);
              const isLocal = drive.type === 'local';
              const isAvailable = location?.available || false;
              const isTesting = selectedDrive === drive.id;
              
              return (
                <div
                  key={drive.id}
                  style={{
                    border: `1px solid ${isAvailable ? '#28a745' : '#dc3545'}`,
                    borderRadius: '6px',
                    padding: '16px',
                    backgroundColor: isAvailable ? '#f8fff9' : '#fff5f5'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                          {isLocal ? '💻' : '🌐'} {drive.name}
                        </h5>
                        
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: isAvailable ? '#28a745' : '#dc3545',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '9px'
                        }}>
                          {isAvailable ? '在线' : '离线'}
                        </span>
                        
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '9px'
                        }}>
                          {drive.type.toUpperCase()}
                        </span>
                        
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '9px'
                        }}>
                          优先级: {drive.priority}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        路径: {drive.path}
                      </div>
                      
                      {location && (
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          最后检查: {formatDate(location.lastChecked)}
                          {location.freeSpace && location.totalSpace && (
                            <> • 可用空间: {formatFileSize(location.freeSpace)} / {formatFileSize(location.totalSpace)}</>
                          )}
                          {location.error && (
                            <> • 错误: {location.error}</>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                        <input
                          type="checkbox"
                          checked={drive.enabled}
                          onChange={(e) => handleToggleDrive(drive.id, e.target.checked)}
                          style={{ marginRight: '4px' }}
                        />
                        启用
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => handleTestDrive(drive)}
                        disabled={isTesting}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #17a2b8',
                          backgroundColor: 'white',
                          color: '#17a2b8',
                          borderRadius: '4px',
                          cursor: isTesting ? 'not-allowed' : 'pointer',
                          fontSize: '10px'
                        }}
                        aria-label={`测试连接 ${drive.name}`}
                      >
                        {isTesting ? '测试中...' : '测试'}
                      </button>
                      
                      {!isLocal && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDrive(drive.id)}
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #dc3545',
                            backgroundColor: 'white',
                            color: '#dc3545',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                          aria-label={`移除驱动器 ${drive.name}`}
                        >
                          移除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 添加驱动器对话框 */}
      {showAddDriveDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '500px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>
              添加网络驱动器
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label htmlFor="ndm-name" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  驱动器名称 *
                </label>
                <input
                  id="ndm-name"
                  type="text"
                  value={newDriveName}
                  onChange={(e) => setNewDriveName(e.target.value)}
                  placeholder="例如：公司共享盘"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="ndm-path" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  驱动器路径 *
                </label>
                <input
                  id="ndm-path"
                  type="text"
                  value={newDrivePath}
                  onChange={(e) => setNewDrivePath(e.target.value)}
                  placeholder="例如：\\\\server\\share 或 /mnt/share"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="ndm-type" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    驱动器类型
                  </label>
                  <select
                    id="ndm-type"
                    value={newDriveType}
                    onChange={(e) => setNewDriveType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  >
                    <option value="smb">SMB/CIFS</option>
                    <option value="nfs">NFS</option>
                    <option value="mapped">映射驱动器</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="ndm-priority" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    优先级
                  </label>
                  <input
                    id="ndm-priority"
                    type="number"
                    value={newDrivePriority}
                    onChange={(e) => setNewDrivePriority(parseInt(e.target.value) || 10)}
                    min="1"
                    max="999"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="ndm-enabled" style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <input
                    id="ndm-enabled"
                    type="checkbox"
                    checked={newDriveEnabled}
                    onChange={(e) => setNewDriveEnabled(e.target.checked)}
                    style={{ marginRight: '6px' }}
                  />
                  启用此驱动器
                </label>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddDriveDialog(false);
                  setNewDriveName('');
                  setNewDrivePath('');
                  setNewDriveType('smb');
                  setNewDrivePriority(10);
                  setNewDriveEnabled(true);
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                取消
              </button>
              
              <button
                type="button"
                onClick={handleAddDrive}
                disabled={!newDriveName.trim() || !newDrivePath.trim()}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: newDriveName.trim() && newDrivePath.trim() ? '#007bff' : '#6c757d',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: newDriveName.trim() && newDrivePath.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '12px'
                }}
              >
                添加驱动器
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkDriveManager;