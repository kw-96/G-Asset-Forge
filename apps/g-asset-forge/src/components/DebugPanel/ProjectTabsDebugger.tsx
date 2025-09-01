/**
 * 项目标签页调试器组件
 * 用于调试和监控项目标签页的状态和数据隔离机制
 */
import React, { useCallback, useEffect, useState } from 'react';

import { useProjectManagement } from '../../hooks/useProjectManagement';

interface ProjectTabsDebuggerProps {
  className?: string;
}

export const ProjectTabsDebugger: React.FC<ProjectTabsDebuggerProps> = ({
  className,
}) => {
  const { openTabs, activeTabId, getDataIsolationStatus } =
    useProjectManagement();

  const [isolationStatus, setIsolationStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 定期更新隔离状态
  useEffect(() => {
    const updateStatus = () => {
      const status = getDataIsolationStatus();
      setIsolationStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, [getDataIsolationStatus]);

  const handleTestIsolation = useCallback(async () => {
    const tester = (window as any).__ISOLATION_TESTER__;
    if (tester) {
      console.log('开始数据隔离测试...');
      const result = await tester.testDataIsolation();
      console.log('数据隔离测试结果:', result);
      alert(`测试结果: ${result.success ? '通过' : '失败'}\n${result.message}`);
    } else {
      alert('数据隔离测试工具未找到');
    }
  }, []);

  const handleRunFullTest = useCallback(async () => {
    const tester = (window as any).__ISOLATION_TESTER__;
    if (tester) {
      console.log('开始完整测试套件...');
      const results = await tester.runFullTestSuite();
      console.log('完整测试结果:', results);

      const summary = results
        .map(
          (r: any, i: number) => `测试${i + 1}: ${r.success ? '通过' : '失败'}`,
        )
        .join('\n');
      alert(`测试套件结果:\n${summary}`);
    } else {
      alert('数据隔离测试工具未找到');
    }
  }, []);

  if (!isVisible) {
    return (
      <div className={`project-tabs-debugger-toggle ${className || ''}`}>
        <button
          type="button"
          onClick={() => setIsVisible(true)}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 10000,
            padding: '5px 10px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            fontSize: '12px',
          }}
        >
          调试面板
        </button>
      </div>
    );
  }

  return (
    <div
      className={`project-tabs-debugger ${className || ''}`}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '600px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px' }}>项目标签页调试器</h3>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '12px',
          }}
        >
          ×
        </button>
      </div>

      {/* 基本状态信息 */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#ffd700' }}>
          基本状态
        </h4>
        <div>打开的标签页数量: {openTabs.length}</div>
        <div>当前活动标签页: {activeTabId || '无'}</div>
        <div>标签页列表:</div>
        <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
          {openTabs.map((tab) => (
            <li
              key={tab.id}
              style={{ color: tab.isActive ? '#00ff00' : '#cccccc' }}
            >
              {tab.name} ({tab.id.substring(0, 8)}...)
              {tab.isDirty && ' [已修改]'}
              {tab.isActive && ' [活动]'}
            </li>
          ))}
        </ul>
      </div>

      {/* 数据隔离状态 */}
      {isolationStatus && (
        <div style={{ marginBottom: '15px' }}>
          <h4
            style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#ffd700' }}
          >
            数据隔离状态
          </h4>
          <div>缓存项目数: {isolationStatus.cachedProjectsCount}</div>
          <div>画布状态数: {isolationStatus.canvasStatesCount}</div>
          <div>编辑器状态数: {isolationStatus.editorStatesCount}</div>
          <div>项目详情:</div>
          <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
            {isolationStatus.projects?.map((project: any) => (
              <li key={project.id} style={{ fontSize: '11px' }}>
                {project.name}:
                <span
                  style={{ color: project.hasData ? '#00ff00' : '#ff0000' }}
                >
                  {' '}
                  数据
                </span>
                <span
                  style={{
                    color: project.hasCanvasState ? '#00ff00' : '#ff0000',
                  }}
                >
                  {' '}
                  画布
                </span>
                <span
                  style={{
                    color: project.hasEditorState ? '#00ff00' : '#ff0000',
                  }}
                >
                  {' '}
                  编辑器
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 测试按钮 */}
      <div style={{ marginBottom: '10px' }}>
        <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#ffd700' }}>
          测试工具
        </h4>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleTestIsolation}
            style={{
              padding: '5px 8px',
              fontSize: '11px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            测试数据隔离
          </button>
          <button
            type="button"
            onClick={handleRunFullTest}
            style={{
              padding: '5px 8px',
              fontSize: '11px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            完整测试套件
          </button>
          <button
            type="button"
            onClick={() => {
              const status = getDataIsolationStatus();
              console.log('当前数据隔离状态:', status);
            }}
            style={{
              padding: '5px 8px',
              fontSize: '11px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            输出状态
          </button>
        </div>
      </div>

      {/* 说明文字 */}
      <div style={{ fontSize: '10px', color: '#cccccc', lineHeight: '1.4' }}>
        <div>• 绿色表示正常，红色表示异常</div>
        <div>• 数据隔离确保每个项目的画布内容独立</div>
        <div>• 切换标签页时应保持各自的编辑器状态</div>
      </div>
    </div>
  );
};
