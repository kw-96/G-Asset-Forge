import React, { useState, useEffect } from 'react';
import { FileOperationMonitor } from './FileOperationMonitor';
import { NetworkDriveStatus } from './NetworkDriveStatus';
import { unifiedPerformanceMonitor, UnifiedPerformanceMetrics, PerformanceReport } from '../../../logic/utils/performance/UnifiedPerformanceMonitor';
import { startupPerformanceMonitor } from '../../../logic/utils/performance/StartupPerformanceMonitor';
import { runtimePerformanceMonitor } from '../../../logic/utils/performance/RuntimePerformanceMonitor';
import { NetworkDriveManager } from '../Storage/NetworkDriveManager';
import { performanceTestRunner, PerformanceTestSuite } from '../../../logic/utils/performance/PerformanceTestRunner';

interface PerformancePanelProps {
  className?: string;
  isVisible?: boolean;
  onToggle?: () => void;
}

/**
 * 性能监控面板
 * 集成启动性能、运行时性能和文件操作性能监控
 */
export const PerformancePanel: React.FC<PerformancePanelProps> = ({ 
  className, 
  isVisible = false, 
  onToggle 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'unified' | 'startup' | 'runtime' | 'fileops' | 'network' | 'test'>('overview');
  const [networkDriveManager, setNetworkDriveManager] = useState<typeof NetworkDriveManager | null>(null);
  const [testResults, setTestResults] = useState<PerformanceTestSuite | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [unifiedMetrics, setUnifiedMetrics] = useState<UnifiedPerformanceMetrics | null>(null);
  const [isUnifiedMonitoring, setIsUnifiedMonitoring] = useState(false);

  // 初始化网络驱动器管理器和统一性能监控
  useEffect(() => {
    const initNetworkDriveManager = async () => {
      try {
        // 使用简化的路径，避免API调用错误
        const userDataPath = './userData';
        const manager = new (NetworkDriveManager as any)({ userDataPath });
        setNetworkDriveManager(manager);
      } catch (error) {
        console.error('初始化网络驱动器管理器失败:', error);
      }
    };

    const initUnifiedMonitoring = () => {
      if (!isUnifiedMonitoring) {
        unifiedPerformanceMonitor.startMonitoring();
        setIsUnifiedMonitoring(true);
        
        // 添加监听器
        const removeListener = unifiedPerformanceMonitor.addReportListener((report: PerformanceReport) => {
          setUnifiedMetrics(report.metrics);
        });
        
        return removeListener;
      }
    };

    if (isVisible) {
      initNetworkDriveManager();
      const removeListener = initUnifiedMonitoring();
      
      return () => {
        if (removeListener) removeListener();
      };
    }
  }, [isVisible, isUnifiedMonitoring]);

  const handleClearAllMetrics = () => {
    if (confirm('确定要清除所有性能指标吗？')) {
      // 清除测试结果
      setTestResults(null);
      
      alert('所有性能指标已清除');
    }
  };

  const handleRunPerformanceTests = async () => {
    if (isRunningTests) return;
    
    setIsRunningTests(true);
    setTestResults(null);
    
    try {
      console.log('开始运行性能测试...');
      const results = await performanceTestRunner.runFullTestSuite();
      setTestResults(results);
      
      // 显示测试结果摘要
      const passedCount = results.results.filter(r => r.passed).length;
      const totalCount = results.results.length;
      const message = `性能测试完成!\n通过: ${passedCount}/${totalCount}\n执行时间: ${results.executionTime.toFixed(2)}ms`;
      
      if (results.overallPassed) {
        alert(`✅ ${message}`);
      } else {
        alert(`❌ ${message}\n\n请查看详细结果以了解失败原因。`);
      }
    } catch (error) {
      console.error('性能测试失败:', error);
      alert(`性能测试执行失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getOverviewData = () => {
    const startupMetrics = startupPerformanceMonitor.getMetrics();
    const runtimeMetrics = runtimePerformanceMonitor.getCurrentMetrics();
    const unified = unifiedMetrics || unifiedPerformanceMonitor.getMetrics();
    
    return {
      startupTime: startupMetrics?.totalStartupTime || 0,
      memoryUsage: unified.memoryUsage || runtimeMetrics?.memoryUsage || 0,
      cpuUsage: runtimeMetrics?.cpuUsage || 0,
      fps: unified.fps || 0,
      healthScore: unifiedPerformanceMonitor.generateReport().healthScore,
      isHealthy: (startupMetrics?.totalStartupTime || 0) < 5000 && 
                 (unified.memoryUsage || 0) < 500 &&
                 (unified.fps || 0) > 30
    };
  };

  const overview = getOverviewData();

  if (!isVisible) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          type="button"
          onClick={onToggle}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
          title="打开性能监控"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${overview.isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <h3 className="text-sm font-medium text-gray-900">性能监控</h3>
          <span className={`text-xs px-2 py-1 rounded ${overview.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {overview.isHealthy ? '健康' : '需要关注'}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="关闭性能监控"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'overview', label: '概览' },
          { key: 'unified', label: '统一监控' },
          { key: 'startup', label: '启动' },
          { key: 'runtime', label: '运行时' },
          { key: 'fileops', label: '文件操作' },
          { key: 'network', label: '网络驱动器' },
          { key: 'test', label: '性能测试' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="p-3 max-h-96 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">启动时间:</span>
                  <span className={overview.startupTime > 5000 ? 'text-red-500' : 'text-green-500'}>
                    {(overview.startupTime / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">内存使用:</span>
                  <span className={overview.memoryUsage > 500 ? 'text-red-500' : 'text-green-500'}>
                    {overview.memoryUsage.toFixed(0)}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">帧率:</span>
                  <span className={overview.fps < 30 ? 'text-red-500' : 'text-green-500'}>
                    {overview.fps.toFixed(0)}fps
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">CPU使用率:</span>
                  <span className={overview.cpuUsage > 80 ? 'text-red-500' : 'text-green-500'}>
                    {overview.cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">健康评分:</span>
                  <span className={overview.healthScore < 60 ? 'text-red-500' : overview.healthScore < 80 ? 'text-yellow-500' : 'text-green-500'}>
                    {overview.healthScore.toFixed(0)}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">整体状态:</span>
                  <span className={overview.isHealthy ? 'text-green-500' : 'text-red-500'}>
                    {overview.isHealthy ? '良好' : '需要优化'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600 mb-2">性能目标达成情况:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>启动时间 &lt; 5秒:</span>
                  <span className={overview.startupTime < 5000 ? 'text-green-500' : 'text-red-500'}>
                    {overview.startupTime < 5000 ? '✓ 已达成' : '✗ 未达成'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>内存使用 &lt; 500MB:</span>
                  <span className={overview.memoryUsage < 500 ? 'text-green-500' : 'text-red-500'}>
                    {overview.memoryUsage < 500 ? '✓ 已达成' : '✗ 未达成'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'unified' && (
          <div className="space-y-3">
            {unifiedMetrics && (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">FPS:</span>
                      <span className={unifiedMetrics.fps < 30 ? 'text-red-500' : 'text-green-500'}>
                        {unifiedMetrics.fps.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">内存使用:</span>
                      <span className={unifiedMetrics.memoryUsage > 500 ? 'text-red-500' : 'text-green-500'}>
                        {unifiedMetrics.memoryUsage.toFixed(1)}MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">渲染时间:</span>
                      <span className={unifiedMetrics.canvasRenderTime > 33 ? 'text-red-500' : 'text-green-500'}>
                        {unifiedMetrics.canvasRenderTime.toFixed(1)}ms
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">工具切换:</span>
                      <span className={unifiedMetrics.toolSwitchTime > 300 ? 'text-red-500' : 'text-green-500'}>
                        {unifiedMetrics.toolSwitchTime.toFixed(1)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">交互延迟:</span>
                      <span className={unifiedMetrics.userInteractionDelay > 200 ? 'text-red-500' : 'text-green-500'}>
                        {unifiedMetrics.userInteractionDelay.toFixed(1)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">长任务数:</span>
                      <span className={unifiedMetrics.longTaskCount > 10 ? 'text-red-500' : 'text-green-500'}>
                        {unifiedMetrics.longTaskCount}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-gray-600">设备信息:</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>CPU核心: {unifiedMetrics.hardwareConcurrency}</div>
                    <div>设备像素比: {unifiedMetrics.devicePixelRatio}</div>
                    <div>网络类型: {unifiedMetrics.connectionType}</div>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => unifiedPerformanceMonitor.forceGarbageCollection()}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              >
                强制GC
              </button>
              <button
                type="button"
                onClick={() => unifiedPerformanceMonitor.clearAlerts()}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
              >
                清除警告
              </button>
            </div>
          </div>
        )}

        {activeTab === 'startup' && (
          <div className="text-xs text-gray-600">
            启动性能监控功能正在开发中...
          </div>
        )}

        {activeTab === 'runtime' && (
          <div className="text-xs text-gray-600">
            运行时性能监控功能正在开发中...
          </div>
        )}

        {activeTab === 'fileops' && (
          <FileOperationMonitor />
        )}

        {activeTab === 'network' && (
          <div className="space-y-3">
            {networkDriveManager ? (
              <NetworkDriveStatus manager={networkDriveManager} />
            ) : (
              <div className="text-xs text-gray-600 text-center py-4">
                正在初始化网络驱动器管理器...
              </div>
            )}
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-3">
            {/* 测试控制 */}
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700">性能测试</div>
              <button
                type="button"
                onClick={handleRunPerformanceTests}
                disabled={isRunningTests}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  isRunningTests
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
              >
                {isRunningTests ? '测试中...' : '运行测试'}
              </button>
            </div>

            {/* 测试结果 */}
            {testResults && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">测试套件:</span>
                  <span className={testResults.overallPassed ? 'text-green-600' : 'text-red-600'}>
                    {testResults.overallPassed ? '✓ 通过' : '✗ 失败'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600">
                  执行时间: {testResults.executionTime.toFixed(2)}ms
                </div>

                <div className="space-y-1">
                  {testResults.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`w-1 h-1 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-gray-700">{result.testName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                          {result.actualValue.toFixed(0)}{result.unit}
                        </span>
                        <span className="text-gray-400">
                          /≤{result.expectedValue}{result.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 失败的测试详情 */}
                {!testResults.overallPassed && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs font-medium text-red-700 mb-1">失败详情:</div>
                    <div className="space-y-1">
                      {testResults.results
                        .filter(result => !result.passed)
                        .map((result, index) => (
                          <div key={index} className="text-xs text-red-600">
                            <div className="font-medium">{result.testName}:</div>
                            <div className="text-gray-600 ml-2">{result.details}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 测试说明 */}
            <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
              <div className="font-medium mb-1">测试项目:</div>
              <ul className="space-y-1 ml-2">
                <li>• 文件保存性能 (≤1秒)</li>
                <li>• 文件加载性能 (≤2秒)</li>
                <li>• 大文件处理 (≤3秒)</li>
                <li>• 并发操作 (≤2秒)</li>
                <li>• 缓存效率 (≥50%提升)</li>
                <li>• 错误恢复 (≤3秒)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="flex justify-between items-center p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          实时监控 • 自动更新
        </div>
        <div className="flex space-x-2">
          {activeTab === 'test' && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await performanceTestRunner.cleanupTestFiles();
                  alert('测试文件已清理');
                } catch (error) {
                  alert(`清理失败: ${error instanceof Error ? error.message : String(error)}`);
                }
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            >
              清理测试文件
            </button>
          )}
          <button
            type="button"
            onClick={handleClearAllMetrics}
            className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
          >
            清除指标
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformancePanel;