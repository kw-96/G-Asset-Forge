/**
 * 状态栏组件 - 显示应用状态信息
 * 包含性能监控、操作提示、快捷键等信息
 */

import React from 'react';
import styled from 'styled-components';
import { Badge } from '../../ui/components/Badge/Badge';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Progress } from '../../ui/components/Progress/Progress';

const StatusBarContainer = styled.div`
  height: 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PerformanceIndicator = styled.div<{ $level: 'good' | 'warning' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme, $level }) => {
    switch ($level) {
      case 'good': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.text.disabled;
    }
  }};
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background: ${({ theme }) => theme.colors.border.default};
`;

const ProgressContainer = styled.div`
  width: 120px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const StatusBar: React.FC = () => {
  // 模拟状态数据
  const performanceData = {
    memory: 85, // MB
    fps: 60,
    cpu: 15, // %
  };

  const getPerformanceLevel = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'warning';
    return 'error';
  };

  const memoryLevel = getPerformanceLevel(performanceData.memory, [100, 200]);
  const fpsLevel = performanceData.fps >= 55 ? 'good' : performanceData.fps >= 30 ? 'warning' : 'error';
  const cpuLevel = getPerformanceLevel(performanceData.cpu, [30, 60]);

  return (
    <StatusBarContainer>
      {/* 左侧：操作状态和提示 */}
      <StatusSection>
        <StatusItem>
          <Badge variant="success" size="sm">就绪</Badge>
          <span>选择工具开始创作</span>
        </StatusItem>

        <Divider />

        <StatusItem>
          <span>画布: 800×600</span>
        </StatusItem>

        <StatusItem>
          <span>缩放: 100%</span>
        </StatusItem>

        <Divider />

        <StatusItem>
          <span>图层: 3</span>
        </StatusItem>

        <StatusItem>
          <span>选中: 1</span>
        </StatusItem>
      </StatusSection>

      {/* 右侧：性能监控和系统信息 */}
      <StatusSection>
        {/* 导出进度（仅在导出时显示） */}
        {false && (
          <>
            <ProgressContainer>
              <Progress value={65} size="sm" />
              <span>导出中...</span>
            </ProgressContainer>
            <Divider />
          </>
        )}

        {/* 性能指标 */}
        <StatusItem>
          <PerformanceIndicator $level={memoryLevel} />
          <span>内存: {performanceData.memory}MB</span>
        </StatusItem>

        <StatusItem>
          <PerformanceIndicator $level={fpsLevel} />
          <span>FPS: {performanceData.fps}</span>
        </StatusItem>

        <StatusItem>
          <PerformanceIndicator $level={cpuLevel} />
          <span>CPU: {performanceData.cpu}%</span>
        </StatusItem>

        <Divider />

        {/* 快捷键提示 */}
        <StatusItem>
          <span>Ctrl+Z 撤销 | Ctrl+Y 重做 | V 选择</span>
        </StatusItem>

        <Divider />

        {/* 网络状态 */}
        <StatusItem>
          <PerformanceIndicator $level="good" />
          <span>在线</span>
        </StatusItem>

        {/* 主题切换 */}
        <IconButton
          variant="ghost"
          size="xs"
          icon="🌙"
          onClick={() => console.log('Toggle theme')}
        />
      </StatusSection>
    </StatusBarContainer>
  );
};