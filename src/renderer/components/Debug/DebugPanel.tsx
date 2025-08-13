/**
 * 调试面板组件
 * 显示应用状态、性能指标和调试信息
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { devDebugTools } from '../../utils/DevDebugTools';
import { reactLoopFixToolkit } from '../../utils/ReactLoopFix';

interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

// 样式组件
const DebugPanelContainer = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  right: ${({ $visible }) => $visible ? '0' : '-400px'};
  width: 400px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  color: #fff;
  z-index: 10000;
  transition: right 0.3s ease;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
`;

const DebugHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DebugTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: #00ff00;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  
  &:hover {
    color: #ff0000;
  }
`;

const DebugSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #ffff00;
`;

const MetricItem = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
`;

const MetricLabel = styled.span`
  color: #ccc;
`;

const MetricValue = styled.span<{ $warning?: boolean }>`
  color: ${({ $warning }) => $warning ? '#ff6b6b' : '#00ff00'};
  font-weight: bold;
`;

const LogItem = styled.div<{ $severity?: string }>`
  margin-bottom: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  border-left: 3px solid ${({ $severity }) => {
    switch ($severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa500';
      case 'low': return '#ffff00';
      default: return '#00ff00';
    }
  }};
`;

const LogTime = styled.div`
  font-size: 10px;
  color: #888;
  margin-bottom: 4px;
`;

const LogMessage = styled.div`
  color: #fff;
  margin-bottom: 4px;
`;

const LogDetails = styled.div`
  font-size: 10px;
  color: #ccc;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  background: #333;
  border: 1px solid #555;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  
  &:hover {
    background: #555;
  }
  
  &:active {
    background: #222;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  background: ${({ $active }) => $active ? '#333' : 'transparent'};
  border: none;
  color: ${({ $active }) => $active ? '#00ff00' : '#ccc'};
  cursor: pointer;
  font-size: 11px;
  
  &:hover {
    background: #222;
  }
`;

const ScrollableContent = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'logs' | 'warnings'>('overview');
  const [debugReport, setDebugReport] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 刷新调试数据
  const refreshDebugData = useCallback(() => {
    const report = devDebugTools.generateDebugReport();
    setDebugReport(report);
  }, []);

  // 自动刷新
  useEffect(() => {
    if (!isVisible || !autoRefresh) return;

    const interval = setInterval(refreshDebugData, 1000);
    return () => clearInterval(interval);
  }, [isVisible, autoRefresh, refreshDebugData]);

  // 初始加载
  useEffect(() => {
    if (isVisible) {
      refreshDebugData();
    }
  }, [isVisible, refreshDebugData]);

  // 清除日志
  const handleClearLogs = useCallback(() => {
    devDebugTools.clearLogs();
    refreshDebugData();
  }, [refreshDebugData]);

  // 生成诊断报告
  const handleGenerateReport = useCallback(() => {
    const diagnosticReport = reactLoopFixToolkit.generateDiagnosticReport();
    const debugReport = devDebugTools.generateDebugReport();
    
    const fullReport = {
      timestamp: new Date().toISOString(),
      diagnosticReport,
      debugReport,
    };

    const blob = new Blob([JSON.stringify(fullReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!debugReport) {
    return null;
  }

  const renderOverview = () => (
    <DebugSection>
      <SectionTitle>系统概览</SectionTitle>
      <MetricItem>
        <MetricLabel>状态更新总数:</MetricLabel>
        <MetricValue $warning={debugReport.summary.totalStateUpdates > 500}>
          {debugReport.summary.totalStateUpdates}
        </MetricValue>
      </MetricItem>
      <MetricItem>
        <MetricLabel>监控组件数:</MetricLabel>
        <MetricValue>{debugReport.summary.totalComponents}</MetricValue>
      </MetricItem>
      <MetricItem>
        <MetricLabel>警告总数:</MetricLabel>
        <MetricValue $warning={debugReport.summary.totalWarnings > 0}>
          {debugReport.summary.totalWarnings}
        </MetricValue>
      </MetricItem>
      <MetricItem>
        <MetricLabel>严重警告:</MetricLabel>
        <MetricValue $warning={debugReport.summary.criticalWarnings > 0}>
          {debugReport.summary.criticalWarnings}
        </MetricValue>
      </MetricItem>
      <MetricItem>
        <MetricLabel>性能问题:</MetricLabel>
        <MetricValue $warning={debugReport.summary.performanceIssues > 0}>
          {debugReport.summary.performanceIssues}
        </MetricValue>
      </MetricItem>
      
      {debugReport.recommendations.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: '16px' }}>优化建议</SectionTitle>
          {debugReport.recommendations.map((rec: string, index: number) => (
            <LogItem key={index} $severity="medium">
              <LogMessage>{rec}</LogMessage>
            </LogItem>
          ))}
        </>
      )}
    </DebugSection>
  );

  const renderPerformance = () => (
    <DebugSection>
      <SectionTitle>性能指标</SectionTitle>
      <ScrollableContent>
        {debugReport.performanceMetrics.map((metric: any) => (
          <LogItem key={metric.componentName} $severity={metric.isPerformanceIssue ? 'high' : 'low'}>
            <LogMessage>{metric.componentName}</LogMessage>
            <LogDetails>
              渲染次数: {metric.renderCount} | 
              平均时间: {metric.averageRenderTime.toFixed(2)}ms | 
              内存: {metric.memoryUsage.toFixed(2)}MB
            </LogDetails>
          </LogItem>
        ))}
      </ScrollableContent>
    </DebugSection>
  );

  const renderLogs = () => (
    <DebugSection>
      <SectionTitle>状态更新日志</SectionTitle>
      <ScrollableContent>
        {debugReport.recentStateUpdates.map((log: any) => (
          <LogItem key={log.id}>
            <LogTime>{new Date(log.timestamp).toLocaleTimeString()}</LogTime>
            <LogMessage>{log.component} - {log.action}</LogMessage>
            <LogDetails>渲染次数: {log.renderCount}</LogDetails>
          </LogItem>
        ))}
      </ScrollableContent>
    </DebugSection>
  );

  const renderWarnings = () => (
    <DebugSection>
      <SectionTitle>警告信息</SectionTitle>
      <ScrollableContent>
        {debugReport.recentWarnings.map((warning: any) => (
          <LogItem key={warning.id} $severity={warning.severity}>
            <LogTime>{new Date(warning.timestamp).toLocaleTimeString()}</LogTime>
            <LogMessage>{warning.component} - {warning.message}</LogMessage>
            <LogDetails>
              严重程度: {warning.severity} | 渲染次数: {warning.renderCount}
            </LogDetails>
            {warning.suggestions.length > 0 && (
              <LogDetails style={{ marginTop: '4px' }}>
                建议: {warning.suggestions.join(', ')}
              </LogDetails>
            )}
          </LogItem>
        ))}
      </ScrollableContent>
    </DebugSection>
  );

  return (
    <DebugPanelContainer $visible={isVisible}>
      <DebugHeader>
        <DebugTitle>React调试面板</DebugTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </DebugHeader>

      <TabContainer>
        <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          概览
        </Tab>
        <Tab $active={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
          性能
        </Tab>
        <Tab $active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
          日志
        </Tab>
        <Tab $active={activeTab === 'warnings'} onClick={() => setActiveTab('warnings')}>
          警告
        </Tab>
      </TabContainer>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'performance' && renderPerformance()}
      {activeTab === 'logs' && renderLogs()}
      {activeTab === 'warnings' && renderWarnings()}

      <DebugSection>
        <ButtonGroup>
          <ActionButton onClick={refreshDebugData}>
            刷新数据
          </ActionButton>
          <ActionButton onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? '停止自动刷新' : '开启自动刷新'}
          </ActionButton>
          <ActionButton onClick={handleClearLogs}>
            清除日志
          </ActionButton>
          <ActionButton onClick={handleGenerateReport}>
            导出报告
          </ActionButton>
        </ButtonGroup>
      </DebugSection>
    </DebugPanelContainer>
  );
};