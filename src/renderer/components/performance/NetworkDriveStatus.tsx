import React, { useState, useEffect } from 'react';
import { NetworkDriveManager } from '../../managers/storage/NetworkDriveManager';

interface NetworkDriveStatusProps {
  className?: string;
  manager: NetworkDriveManager;
}

interface DriveStatus {
  id: string;
  name: string;
  path: string;
  isAvailable: boolean;
  lastCheck: Date;
  responseTime: number;
  errorMessage?: string | undefined;
}

/**
 * 网络驱动器状态监控组件
 * 显示网络驱动器的可用性和性能状态
 */
export const NetworkDriveStatus: React.FC<NetworkDriveStatusProps> = ({ 
  className, 
  manager 
}) => {
  const [driveStatuses, setDriveStatuses] = useState<DriveStatus[]>([]);
  const [overallAvailability, setOverallAvailability] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateDriveStatuses = async () => {
      try {
        const drives = manager.getAllDrives();
        const statuses: DriveStatus[] = [];
        let availableCount = 0;

        for (const drive of drives) {
          try {
            const testResult = await manager.testDriveConnection(drive);
            const status: DriveStatus = {
              id: drive.id,
              name: drive.name,
              path: drive.path,
              isAvailable: testResult.success,
              lastCheck: new Date(),
              responseTime: testResult.responseTime || 0,
              errorMessage: testResult.error
            };
            
            statuses.push(status);
            if (testResult.success) {
              availableCount++;
            }
          } catch (error) {
            statuses.push({
              id: drive.id,
              name: drive.name,
              path: drive.path,
              isAvailable: false,
              lastCheck: new Date(),
              responseTime: 0,
              errorMessage: error instanceof Error ? error.message : '未知错误'
            });
          }
        }

        setDriveStatuses(statuses);
        
        // 计算整体可用率
        const availability = drives.length > 0 ? (availableCount / drives.length) * 100 : 100;
        setOverallAvailability(availability);
        
      } catch (error) {
        console.error('更新网络驱动器状态失败:', error);
      }
    };

    // 初始更新
    updateDriveStatuses();

    // 每30秒更新一次
    const interval = setInterval(updateDriveStatuses, 30000);

    return () => clearInterval(interval);
  }, [manager]);

  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getAvailabilityColor = (availability: number): string => {
    if (availability >= 99) return 'text-green-500';
    if (availability >= 95) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAvailabilityStatus = (availability: number): string => {
    if (availability >= 99) return '优秀';
    if (availability >= 95) return '良好';
    if (availability >= 90) return '一般';
    return '需要关注';
  };

  if (driveStatuses.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>未配置网络驱动器</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div 
        className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            overallAvailability >= 99 ? 'bg-green-500' : 
            overallAvailability >= 95 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">网络驱动器</span>
          <span className={`text-xs ${getAvailabilityColor(overallAvailability)}`}>
            {getAvailabilityStatus(overallAvailability)}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>可用率: {overallAvailability.toFixed(1)}%</span>
          <span>({driveStatuses.filter(d => d.isAvailable).length}/{driveStatuses.length})</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-3">
          {/* 整体统计 */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-600">总数</div>
              <div className="font-medium text-gray-900">{driveStatuses.length}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">可用</div>
              <div className="font-medium text-green-600">
                {driveStatuses.filter(d => d.isAvailable).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">不可用</div>
              <div className="font-medium text-red-600">
                {driveStatuses.filter(d => !d.isAvailable).length}
              </div>
            </div>
          </div>

          {/* 驱动器详情 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">驱动器状态</div>
            <div className="space-y-1">
              {driveStatuses.map((drive) => (
                <div key={drive.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-1 h-1 rounded-full ${
                      drive.isAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-gray-700 font-medium">{drive.name}</span>
                    <span className="text-gray-500 truncate max-w-32">{drive.path}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {drive.isAvailable ? (
                      <span className="text-green-600">
                        {formatResponseTime(drive.responseTime)}
                      </span>
                    ) : (
                      <span className="text-red-600" title={drive.errorMessage}>
                        离线
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 性能目标状态 */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">99%可用率目标:</span>
              <span className={overallAvailability >= 99 ? 'text-green-500' : 'text-red-500'}>
                {overallAvailability >= 99 ? '✓ 已达成' : '✗ 未达成'}
              </span>
            </div>
            {overallAvailability < 99 && (
              <div className="mt-1 text-xs text-red-600">
                需要提升 {(99 - overallAvailability).toFixed(1)}% 才能达到目标
              </div>
            )}
          </div>

          {/* 最后更新时间 */}
          <div className="text-xs text-gray-500 text-center">
            最后检查: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkDriveStatus;