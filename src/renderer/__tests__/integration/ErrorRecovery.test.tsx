/**
 * 错误恢复机制集成测试
 * 验证错误恢复机制在各种异常情况下的表现
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedErrorBoundary } from '../../components/ErrorBoundary/EnhancedErrorBoundary';
import { errorRecoveryManager } from '../../utils/ErrorRecoveryManager';
import { errorAnalyzer } from '../../utils/ErrorAnalyzer';

// Mock依赖
jest.mock('../../utils/ReactLoopFix', () => ({
  reactLoopFixToolkit: {
    debugLogger: {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
    detectInfiniteLoop: jest.fn().mockReturnValue(false),
    resetAll: jest.fn(),
    generateDiagnosticReport: jest.fn().mockReturnValue({}),
  },
}));

// 测试组件：会抛出不同类型错误的组件
const ErrorThrowingComponent: React.FC<{ 
  errorType?: 'infinite-loop' | 'render' | 'async' | 'memory' | 'network';
  shouldThrow?: boolean;
}> = ({ errorType = 'render', shouldThrow = false }) => {
  if (!shouldThrow) {
    return <div data-testid="normal-content">正常内容</div>;
  }

  switch (errorType) {
    case 'infinite-loop':
      throw new Error('Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.');
    case 'render':
      throw new Error('Cannot read property \'x\' of undefined');
    case 'async':
      throw new Error('Unhandled promise rejection');
    case 'memory':
      throw new Error('JavaScript heap out of memory');
    case 'network':
      throw new Error('Network request failed');
    default:
      throw new Error('Unknown error');
  }
};

describe('错误恢复机制集成测试', () => {
  // 抑制控制台错误输出
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('无限循环错误恢复', () => {
    it('应该检测并恢复无限循环错误', async () => {
      render(
        <EnhancedErrorBoundary enableAutoRecovery={true} showDebugInfo={true}>
          <ErrorThrowingComponent errorType="infinite-loop" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // 验证错误被捕获
      expect(screen.getByText('检测到无限循环')).toBeInTheDocument();
      
      // 验证显示了修复建议
      expect(screen.getByText('修复建议:')).toBeInTheDocument();
      
      // 验证智能恢复按钮存在
      expect(screen.getByText('智能恢复')).toBeInTheDocument();
    });

    it('应该执行智能恢复策略', async () => {
      const mockExecuteRecovery = jest.spyOn(errorRecoveryManager, 'executeRecovery')
        .mockResolvedValue({
          success: true,
          action: 'reset_state',
          duration: 500,
        });

      render(
        <EnhancedErrorBoundary enableAutoRecovery={false} showDebugInfo={true}>
          <ErrorThrowingComponent errorType="infinite-loop" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const recoveryButton = screen.getByText('智能恢复');
      fireEvent.click(recoveryButton);

      await waitFor(() => {
        expect(mockExecuteRecovery).toHaveBeenCalled();
      });

      mockExecuteRecovery.mockRestore();
    });

    it('应该在自动恢复失败时显示手动选项', async () => {
      const mockAutoRecover = jest.spyOn(errorRecoveryManager, 'autoRecover')
        .mockRejectedValue(new Error('自动恢复失败'));

      render(
        <EnhancedErrorBoundary enableAutoRecovery={true} showDebugInfo={true}>
          <ErrorThrowingComponent errorType="infinite-loop" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // 等待自动恢复尝试完成
      await waitFor(() => {
        expect(screen.getByText('智能恢复')).toBeInTheDocument();
      });

      mockAutoRecover.mockRestore();
    });
  });

  describe('渲染错误恢复', () => {
    it('应该处理渲染错误', async () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ErrorThrowingComponent errorType="render" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('渲染错误')).toBeInTheDocument();
      expect(screen.getByText('智能恢复')).toBeInTheDocument();
      expect(screen.getByText('重新加载')).toBeInTheDocument();
    });

    it('应该提供相关的修复建议', async () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ErrorThrowingComponent errorType="render" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('修复建议:')).toBeInTheDocument();
      
      // 验证建议内容
      const suggestions = screen.getByText(/检查组件props|验证状态更新/);
      expect(suggestions).toBeInTheDocument();
    });
  });

  describe('异步错误恢复', () => {
    it('应该处理异步错误', async () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ErrorThrowingComponent errorType="async" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('异步操作错误')).toBeInTheDocument();
    });
  });

  describe('内存错误恢复', () => {
    it('应该处理内存错误', async () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ErrorThrowingComponent errorType="memory" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('内存不足')).toBeInTheDocument();
    });
  });

  describe('网络错误恢复', () => {
    it('应该处理网络错误', async () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ErrorThrowingComponent errorType="network" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('网络连接错误')).toBeInTheDocument();
    });
  });

  describe('错误分析准确性', () => {
    it('应该正确分析无限循环错误', () => {
      const error = new Error('Maximum update depth exceeded');
      const errorInfo = { componentStack: '\n    in TestComponent\n    in App' };
      
      const analysis = errorAnalyzer.analyzeError(error, errorInfo);
      
      expect(analysis.pattern).toBe('infinite_loop');
      expect(analysis.category).toBe('react_error');
      expect(analysis.confidence).toBeGreaterThan(0.7);
      expect(analysis.isRecoverable).toBe(true);
    });

    it('应该正确分析渲染错误', () => {
      const error = new Error('Cannot read property \'x\' of undefined');
      const errorInfo = { componentStack: '\n    in RenderComponent\n    in App' };
      
      const analysis = errorAnalyzer.analyzeError(error, errorInfo);
      
      expect(analysis.category).toBe('javascript_error');
      expect(analysis.isRecoverable).toBe(true);
      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });

    it('应该提取相关组件信息', () => {
      const error = new Error('Test error');
      const errorInfo = { 
        componentStack: '\n    in TestComponent\n    in ParentComponent\n    in App' 
      };
      
      const analysis = errorAnalyzer.analyzeError(error, errorInfo);
      
      expect(analysis.relatedComponents).toContain('TestComponent');
      expect(analysis.relatedComponents).toContain('ParentComponent');
      expect(analysis.relatedComponents).toContain('App');
    });
  });

  describe('恢复策略选择', () => {
    it('应该为无限循环选择合适的恢复策略', () => {
      const mockAnalysis = {
        pattern: 'infinite_loop',
        category: 'react_error',
        confidence: 0.9,
        description: '无限循环错误',
        suggestions: ['检查useEffect依赖'],
        relatedComponents: ['TestComponent'],
        stackFrames: [],
        isRecoverable: true,
        recoveryComplexity: 'high',
      };

      const plan = errorRecoveryManager.createRecoveryPlan(mockAnalysis);
      
      expect(plan.recommendedStrategy.action).toBe('reset_state');
      expect(plan.recommendedStrategy.riskLevel).toBe('medium');
      expect(plan.autoRecoveryEnabled).toBe(true);
    });

    it('应该为渲染错误选择合适的恢复策略', () => {
      const mockAnalysis = {
        pattern: null,
        category: 'javascript_error',
        confidence: 0.6,
        description: '渲染错误',
        suggestions: ['检查组件props'],
        relatedComponents: ['RenderComponent'],
        stackFrames: [],
        isRecoverable: true,
        recoveryComplexity: 'low',
      };

      const plan = errorRecoveryManager.createRecoveryPlan(mockAnalysis);
      
      expect(plan.strategies.length).toBeGreaterThan(0);
      expect(plan.recommendedStrategy.riskLevel).toBe('low');
    });
  });

  describe('错误报告生成', () => {
    it('应该生成详细的错误报告', async () => {
      // Mock URL.createObjectURL
      const mockCreateObjectURL = jest.fn().mockReturnValue('mock-url');
      const mockRevokeObjectURL = jest.fn();
      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL,
        },
      });

      // Mock document.createElement
      const mockClick = jest.fn();
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ErrorThrowingComponent errorType="infinite-loop" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const downloadButton = screen.getByText('下载错误报告');
      fireEvent.click(downloadButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('多层错误边界', () => {
    it('应该支持嵌套错误边界', () => {
      render(
        <EnhancedErrorBoundary>
          <div>
            <EnhancedErrorBoundary showDebugInfo={true}>
              <ErrorThrowingComponent errorType="render" shouldThrow={true} />
            </EnhancedErrorBoundary>
          </div>
        </EnhancedErrorBoundary>
      );

      // 内层错误边界应该捕获错误
      expect(screen.getByText('渲染错误')).toBeInTheDocument();
    });
  });

  describe('错误恢复后的状态', () => {
    it('应该在恢复后重置错误状态', async () => {
      const mockExecuteRecovery = jest.spyOn(errorRecoveryManager, 'executeRecovery')
        .mockResolvedValue({
          success: true,
          action: 'restart_component',
          duration: 100,
        });

      const { rerender } = render(
        <EnhancedErrorBoundary>
          <ErrorThrowingComponent errorType="render" shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // 确认错误状态
      expect(screen.getByText('渲染错误')).toBeInTheDocument();

      // 点击恢复按钮
      const recoveryButton = screen.getByText('智能恢复');
      fireEvent.click(recoveryButton);

      // 等待恢复完成
      await waitFor(() => {
        expect(mockExecuteRecovery).toHaveBeenCalled();
      });

      // 重新渲染正常内容
      rerender(
        <EnhancedErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByTestId('normal-content')).toBeInTheDocument();

      mockExecuteRecovery.mockRestore();
    });
  });

  describe('性能影响', () => {
    it('应该不显著影响正常渲染性能', () => {
      const startTime = Date.now();
      
      render(
        <EnhancedErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </EnhancedErrorBoundary>
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
      expect(screen.getByTestId('normal-content')).toBeInTheDocument();
    });

    it('应该高效处理错误分析', () => {
      const error = new Error('Test error');
      const errorInfo = { componentStack: '\n    in TestComponent' };
      
      const startTime = Date.now();
      const analysis = errorAnalyzer.analyzeError(error, errorInfo);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // 应该在50ms内完成
      expect(analysis).toBeDefined();
    });
  });
});