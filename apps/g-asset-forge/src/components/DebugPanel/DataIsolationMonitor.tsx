/**
 * 数据隔离监控器 - 实时监控数据隔离状态
 */
import { type FC, useCallback, useEffect, useState } from 'react';

import { EditorContext } from '../../context';
import { useContext } from 'react';
import { useProjectManagement } from '../../hooks/useProjectManagement';

interface IsolationStatus {
  currentProjectId: string | null;
  documentId: string | null;
  sceneGraphObjectCount: number;
  expectedObjectCount: number;
  isIsolationValid: boolean;
  lastUpdate: Date;
  errors: string[];
}

export const DataIsolationMonitor: FC = () => {
  const { editor } = useContext(EditorContext);
  const { openTabs, activeTabId, getDataIsolationStatus } =
    useProjectManagement();
  const [isolationStatus, setIsolationStatus] =
    useState<IsolationStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 更新隔离状态
  const updateIsolationStatus = useCallback(() => {
    if (!editor || !activeTabId) {
      setIsolationStatus(null);
      return;
    }

    try {
      const errors: string[] = [];

      // 获取当前编辑器状态
      const documentId = editor.doc?.attrs?.id || null;
      const sceneGraphJson = editor.sceneGraph.toJSON();
      const sceneGraphData = JSON.parse(sceneGraphJson);
      const sceneGraphObjectCount = sceneGraphData.data?.length || 0;

      // 获取项目管理服务的数据隔离状态
      const serviceStatus = getDataIsolationStatus();
      const projectInfo = serviceStatus?.projects?.find(
        (p: any) => p.id === activeTabId,
      );

      const expectedObjectCount = projectInfo?.hasDocumentInstance
        ? serviceStatus?.documentManager?.projects?.find(
            (p: any) => p.id === activeTabId,
          )?.objectCount || 0
        : 0;

      // 验证数据隔离
      let isIsolationValid = true;

      // 检查文档实例是否存在
      if (!documentId) {
        errors.push('文档实例不存在');
        isIsolationValid = false;
      }

      // 检查场景图数据是否匹配预期
      if (sceneGraphObjectCount !== expectedObjectCount) {
        errors.push(
          `场景图数据不匹配: 期望 ${expectedObjectCount}, 实际 ${sceneGraphObjectCount}`,
        );
        isIsolationValid = false;
      }

      // 检查项目文档管理器的隔离验证
      if (serviceStatus?.isolationValid === false) {
        errors.push('项目文档管理器隔离验证失败');
        isIsolationValid = false;
      }

      setIsolationStatus({
        currentProjectId: activeTabId,
        documentId,
        sceneGraphObjectCount,
        expectedObjectCount,
        isIsolationValid,
        lastUpdate: new Date(),
        errors,
      });
    } catch (error) {
      console.error('更新隔离状态失败:', error);
      setIsolationStatus({
        currentProjectId: activeTabId,
        documentId: null,
        sceneGraphObjectCount: -1,
        expectedObjectCount: -1,
        isIsolationValid: false,
        lastUpdate: new Date(),
        errors: [
          `更新状态时出错: ${
            error instanceof Error ? error.message : '未知错误'
          }`,
        ],
      });
    }
  }, [editor, activeTabId, getDataIsolationStatus]);

  // 定期更新状态
  useEffect(() => {
    updateIsolationStatus();

    const interval = setInterval(updateIsolationStatus, 2000);
    return () => clearInterval(interval);
  }, [updateIsolationStatus]);

  // 运行数据隔离测试
  const runIsolationTest = useCallback(async () => {
    const tester = (window as any).__ISOLATION_TESTER__;
    if (!tester) {
      console.error('数据隔离测试器未找到');
      return;
    }

    console.log('开始运行数据隔离测试...');
    const result = await tester.runFullIsolationTest();
    console.log('数据隔离测试结果:', result);

    alert(`数据隔离测试完成\n${result.summary}\n详细结果请查看控制台`);
  }, []);

  // 如果不是开发环境，不显示监控器
  if (!import.meta.env?.DEV) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '100px',
        right: '10px',
        width: '300px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 10000,
        fontFamily: 'monospace',
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
        <strong>数据隔离监控器</strong>
        <div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            style={{
              marginRight: '5px',
              padding: '2px 6px',
              fontSize: '10px',
            }}
          >
            {isVisible ? '隐藏' : '显示'}
          </button>
          <button
            onClick={runIsolationTest}
            style={{
              padding: '2px 6px',
              fontSize: '10px',
            }}
          >
            测试
          </button>
        </div>
      </div>

      {isVisible && (
        <div>
          <div style={{ marginBottom: '5px' }}>
            <strong>项目标签页:</strong> {openTabs.length} 个
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>当前项目:</strong> {activeTabId || '无'}
          </div>

          {isolationStatus && (
            <>
              <div style={{ marginBottom: '5px' }}>
                <strong>文档ID:</strong> {isolationStatus.documentId || '无'}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>场景图对象:</strong>{' '}
                {isolationStatus.sceneGraphObjectCount}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>预期对象:</strong> {isolationStatus.expectedObjectCount}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>隔离状态:</strong>{' '}
                <span
                  style={{
                    color: isolationStatus.isIsolationValid
                      ? '#4CAF50'
                      : '#F44336',
                  }}
                >
                  {isolationStatus.isIsolationValid ? '✓ 正常' : '✗ 异常'}
                </span>
              </div>

              {isolationStatus.errors.length > 0 && (
                <div style={{ marginBottom: '5px' }}>
                  <strong>错误:</strong>
                  <ul style={{ margin: '2px 0', paddingLeft: '15px' }}>
                    {isolationStatus.errors.map((error, index) => (
                      <li
                        key={index}
                        style={{ color: '#F44336', fontSize: '10px' }}
                      >
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ fontSize: '10px', color: '#999' }}>
                最后更新: {isolationStatus.lastUpdate.toLocaleTimeString()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
