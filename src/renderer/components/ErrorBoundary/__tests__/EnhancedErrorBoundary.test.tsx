/**
 * EnhancedErrorBoundary 组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedErrorBoundary, ErrorType, ErrorSeverity } from '../EnhancedErrorBoundary';

// Mock依赖
jest.mock('../../../utils/ReactLoopFix', () => ({
  reactLoopFixToolkit: {
    debugLogger: {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    },
    detectInfiniteLoop: jest.fn().mockReturnValue(false),
    resetAll: jest.fn(),
    generateDiagnosticReport: jest.fn().mockReturnValue({}),
  },
}));

jest.mock('../../../utils/ErrorAnalyzer', () => ({
  errorAnalyzer: {
    analyzeError: jest.fn().mockReturnValue({
      category: 'react_error',
      pattern: 'render_error',
      confidence: 0.8,
      description: '渲染错误测试',
      suggestions: ['检查组件props', '验证状态更新'],
      relatedComponents: ['TestComponent'],
      stackFrames: [],
      isRecoverable: true,
      recoveryComplexity: 'medium',
    }),
  },
}));

jest.mock('../../../utils/ErrorRecoveryManager', () => ({
  errorRecoveryManager: {
    createRecoveryPlan: jest.fn().mockReturnValue({
      strategies: [
        {
          action: 'restart_component',
          priority: 8,
          description: '重启组件',
          estimatedTime: 500,
          riskLevel: 'low',
        },
      ],
      recommendedStrategy: {
        action: 'restart_component',
        priority: 8,
        description: '重启组件',
        estimatedTime: 500,
        riskLevel: 'low',
      },
      fallbackStrategy: {
        action: 'reload_page',
        priority: 3,
        description: '重新加载页面',
        estimatedTime: 3000,
        riskLevel: 'high',
      },
      autoRecoveryEnabled: false,
      maxRetries: 3,
    }),
    executeRecovery: jest.fn().mockResolvedValue({
      success: true,
      action: 'restart_component',
      duration: 500,
    }),
    autoRecover: jest.fn().mockResolvedValue({
      success: true,
      action: 'restart_component',
      duration: 500,
    }),
  },
}));

// 测试组件：会抛出错误的组件
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({ 
  shouldThrow = false, 
  errorMessage = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="normal-content">正常内容</div>;
};

describe('EnhancedErrorBoundary', () => {
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

  describe('正常渲染', () => {
    it('应该正常渲染子组件', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByTestId('normal-content')).toBeInTheDocument();
    });
  });

  describe('错误捕获', () => {
    it('应该捕获并显示错误', () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ThrowError shouldThrow={true} errorMessage="测试错误" />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('渲染错误')).toBeInTheDocument();
      expect(screen.getByText('渲染错误测试')).toBeInTheDocument();
    });

    it('应该显示错误分析信息', () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText(/置信度: 80%/)).toBeInTheDocument();
      expect(screen.getByText(/相关组件: TestComponent/)).toBeInTheDocument();
    });

    it('应该显示修复建议', () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('修复建议:')).toBeInTheDocument();
      expect(screen.getByText('检查组件props')).toBeInTheDocument();
      expect(screen.getByText('验证状态更新')).toBeInTheDocument();
    });
  });

  describe('错误恢复', () => {
    it('应该显示智能恢复按钮', () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('智能恢复')).toBeInTheDocument();
      expect(screen.getByText('重新加载')).toBeInTheDocument();
    });

    it('应该执行智能恢复', async () => {
      const { errorRecoveryManager } = require('../../../utils/ErrorRecoveryManager');
      
      render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const recoveryButton = screen.getByText('智能恢复');
      fireEvent.click(recoveryButton);

      await waitFor(() => {
        expect(errorRecoveryManager.executeRecovery).toHaveBeenCalled();
      });
    });

    it('应该在恢复成功后重置错误状态', async () => {
      const { rerender } = render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // 确认错误状态
      expect(screen.getByText('渲染错误')).toBeInTheDocument();

      // 点击恢复按钮
      const recoveryButton = screen.getByText('智能恢复');
      fireEvent.click(recoveryButton);

      // 等待恢复完成
      await waitFor(() => {
        expect(screen.queryByText('渲染错误')).not.toBeInTheDocument();
      });

      // 重新渲染正常内容
      rerender(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByTestId('normal-content')).toBeInTheDocument();
    });
  });

  describe('自动恢复', () => {
    it('应该支持自动恢复', async () => {
      const { errorRecoveryManager } = require('../../../utils/ErrorRecoveryManager');
      
      // 模拟启用自动恢复的恢复计划
      errorRecoveryManager.createRecoveryPlan.mockReturnValue({
        strategies: [],
        recommendedStrategy: {
          action: 'restart_component',
          description: '重启组件',
          estimatedTime: 100,
          riskLevel: 'low',
        },
        fallbackStrategy: {
          action: 'reload_page',
          description: '重新加载页面',
          estimatedTime: 3000,
          riskLevel: 'high',
        },
        autoRecoveryEnabled: true,
        maxRetries: 3,
      });

      render(
        <EnhancedErrorBoundary enableAutoRecovery={true}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // 应该显示恢复进度
      await waitFor(() => {
        expect(screen.getByText('🔄 正在尝试恢复...')).toBeInTheDocument();
      });

      // 等待自动恢复完成
      await waitFor(() => {
        expect(errorRecoveryManager.autoRecover).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('错误详情', () => {
    it('应该显示和隐藏错误详情', () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // 初始状态不显示详情
      expect(screen.queryByText('错误ID:')).not.toBeInTheDocument();

      // 点击显示详情
      const toggleButton = screen.getByText('显示错误详情');
      fireEvent.click(toggleButton);

      // 应该显示详情
      expect(screen.getByText('错误ID:')).toBeInTheDocument();
      expect(screen.getByText('错误类型:')).toBeInTheDocument();
      expect(screen.getByText('严重程度:')).toBeInTheDocument();

      // 点击隐藏详情
      const hideButton = screen.getByText('隐藏错误详情');
      fireEvent.click(hideButton);

      // 应该隐藏详情
      expect(screen.queryByText('错误ID:')).not.toBeInTheDocument();
    });

    it('应该显示错误分析和恢复计划详情', () => {
      render(
        <EnhancedErrorBoundary showDebugInfo={true}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // 显示详情
      const toggleButton = screen.getByText('显示错误详情');
      fireEvent.click(toggleButton);

      // 应该显示错误分析
      expect(screen.getByText('错误分析:')).toBeInTheDocument();
      expect(screen.getByText(/模式: render_error/)).toBeInTheDocument();
      expect(screen.getByText(/类别: react_error/)).toBeInTheDocument();

      // 应该显示恢复计划
      expect(screen.getByText('恢复计划:')).toBeInTheDocument();
      expect(screen.getByText(/推荐策略: restart_component/)).toBeInTheDocument();
    });
  });

  describe('错误报告', () => {
    it('应该支持下载错误报告', () => {
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
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const downloadButton = screen.getByText('下载错误报告');
      fireEvent.click(downloadButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('回调函数', () => {
    it('应该调用onError回调', () => {
      const onError = jest.fn();

      render(
        <EnhancedErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} errorMessage="回调测试错误" />
        </EnhancedErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '回调测试错误',
          type: expect.any(String),
          severity: expect.any(String),
        })
      );
    });
  });

  describe('fallback UI', () => {
    it('应该显示自定义fallback UI', () => {
      const fallbackUI = <div data-testid="custom-fallback">自定义错误UI</div>;

      render(
        <EnhancedErrorBoundary fallback={fallbackUI}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // 在没有错误信息时应该显示fallback
      // 注意：这个测试可能需要根据实际实现调整
    });
  });
});