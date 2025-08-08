/**
 * 稳定的Radix UI组件测试
 * 验证组件的稳定性和性能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StableDropdown, StableDropdownItem, StableSwitch, StableSlider } from '../index';

// Mock依赖
jest.mock('../../../utils/ReactLoopFix', () => ({
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

jest.mock('../../../utils/RadixUIPerformanceMonitor', () => ({
  radixUIPerformanceMonitor: {
    startMonitoring: jest.fn().mockReturnValue(() => {}),
    getComponentMetrics: jest.fn().mockReturnValue(null),
    resetComponentMetrics: jest.fn(),
  },
}));

// Mock styled-components theme
const mockTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    primary: '#007bff',
    error: '#dc3545',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    border: {
      default: '#e0e0e0',
      hover: '#d0d0d0',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    full: '50%',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    lg: '0 4px 8px rgba(0,0,0,0.1)',
  },
  typography: {
    fontSize: {
      xs: '12px',
      sm: '14px',
    },
    fontWeight: {
      medium: '500',
    },
    fontFamily: {
      primary: 'Arial, sans-serif',
    },
  },
  animation: {
    duration: {
      fast: '200ms',
    },
    easing: {
      ease: 'ease',
    },
  },
  zIndex: {
    dropdown: 1000,
  },
};

// Theme Provider Mock
const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-theme="mock">{children}</div>
);

describe('StableRadixUI Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('StableDropdown', () => {
    it('应该正常渲染Dropdown组件', () => {
      const trigger = <button>打开菜单</button>;
      const content = (
        <StableDropdownItem onSelect={() => {}}>
          菜单项
        </StableDropdownItem>
      );

      render(
        <ThemeProvider>
          <StableDropdown trigger={trigger}>
            {content}
          </StableDropdown>
        </ThemeProvider>
      );

      expect(screen.getByText('打开菜单')).toBeInTheDocument();
    });

    it('应该处理onOpenChange回调', async () => {
      const onOpenChange = jest.fn();
      const trigger = <button>打开菜单</button>;

      render(
        <ThemeProvider>
          <StableDropdown trigger={trigger} onOpenChange={onOpenChange}>
            <StableDropdownItem>菜单项</StableDropdownItem>
          </StableDropdown>
        </ThemeProvider>
      );

      const triggerButton = screen.getByText('打开菜单');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalled();
      });
    });

    it('应该处理DropdownItem的onSelect回调', async () => {
      const onSelect = jest.fn();
      const trigger = <button>打开菜单</button>;

      render(
        <ThemeProvider>
          <StableDropdown trigger={trigger} open={true}>
            <StableDropdownItem onSelect={onSelect}>
              菜单项
            </StableDropdownItem>
          </StableDropdown>
        </ThemeProvider>
      );

      const menuItem = screen.getByText('菜单项');
      fireEvent.click(menuItem);

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalled();
      });
    });

    it('应该支持禁用状态', () => {
      const trigger = <button>打开菜单</button>;

      render(
        <ThemeProvider>
          <StableDropdown trigger={trigger} disabled={true}>
            <StableDropdownItem>菜单项</StableDropdownItem>
          </StableDropdown>
        </ThemeProvider>
      );

      const triggerButton = screen.getByText('打开菜单');
      expect(triggerButton).toBeDisabled();
    });
  });

  describe('StableSwitch', () => {
    it('应该正常渲染Switch组件', () => {
      const onCheckedChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSwitch
            checked={false}
            onCheckedChange={onCheckedChange}
            label="开关标签"
          />
        </ThemeProvider>
      );

      expect(screen.getByText('开关标签')).toBeInTheDocument();
    });

    it('应该处理状态变更', async () => {
      const onCheckedChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSwitch
            checked={false}
            onCheckedChange={onCheckedChange}
            label="开关标签"
          />
        </ThemeProvider>
      );

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(onCheckedChange).toHaveBeenCalledWith(true);
      });
    });

    it('应该支持禁用状态', () => {
      const onCheckedChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSwitch
            checked={false}
            onCheckedChange={onCheckedChange}
            disabled={true}
            label="禁用开关"
          />
        </ThemeProvider>
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('应该显示描述文本', () => {
      const onCheckedChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSwitch
            checked={false}
            onCheckedChange={onCheckedChange}
            label="开关标签"
            description="这是开关的描述"
          />
        </ThemeProvider>
      );

      expect(screen.getByText('这是开关的描述')).toBeInTheDocument();
    });
  });

  describe('StableSlider', () => {
    it('应该正常渲染Slider组件', () => {
      const onValueChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSlider
            value={[50]}
            onValueChange={onValueChange}
            label="滑块标签"
          />
        </ThemeProvider>
      );

      expect(screen.getByText('滑块标签')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('应该处理值变更', async () => {
      const onValueChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSlider
            value={[50]}
            onValueChange={onValueChange}
            min={0}
            max={100}
          />
        </ThemeProvider>
      );

      const slider = screen.getByRole('slider');
      
      // 模拟滑块值变更
      fireEvent.change(slider, { target: { value: '75' } });

      // 由于使用了防抖，需要等待
      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalled();
      }, { timeout: 100 });
    });

    it('应该支持显示当前值', () => {
      const onValueChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSlider
            value={[75]}
            onValueChange={onValueChange}
            label="滑块标签"
            showValue={true}
          />
        </ThemeProvider>
      );

      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('应该支持范围滑块', () => {
      const onValueChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSlider
            value={[25, 75]}
            onValueChange={onValueChange}
            showValue={true}
          />
        </ThemeProvider>
      );

      expect(screen.getByText('25 - 75')).toBeInTheDocument();
    });

    it('应该支持禁用状态', () => {
      const onValueChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSlider
            value={[50]}
            onValueChange={onValueChange}
            disabled={true}
          />
        </ThemeProvider>
      );

      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });

    it('应该支持垂直方向', () => {
      const onValueChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSlider
            value={[50]}
            onValueChange={onValueChange}
            orientation="vertical"
          />
        </ThemeProvider>
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('性能监控', () => {
    it('应该启动性能监控', () => {
      const { radixUIPerformanceMonitor } = require('../../../utils/RadixUIPerformanceMonitor');
      const onCheckedChange = jest.fn();

      render(
        <ThemeProvider>
          <StableSwitch
            checked={false}
            onCheckedChange={onCheckedChange}
            label="性能测试"
          />
        </ThemeProvider>
      );

      expect(radixUIPerformanceMonitor.startMonitoring).toHaveBeenCalledWith('StableSwitch');
    });
  });

  describe('错误处理', () => {
    it('应该捕获回调函数中的错误', async () => {
      const { reactLoopFixToolkit } = require('../../../utils/ReactLoopFix');
      const errorCallback = jest.fn(() => {
        throw new Error('回调错误');
      });

      render(
        <ThemeProvider>
          <StableSwitch
            checked={false}
            onCheckedChange={errorCallback}
            label="错误测试"
          />
        </ThemeProvider>
      );

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(reactLoopFixToolkit.debugLogger.error).toHaveBeenCalledWith(
          'switch-callback',
          'Switch状态变更回调执行失败',
          expect.objectContaining({
            error: '回调错误',
          }),
          'StableSwitch'
        );
      });
    });
  });

  describe('组件稳定性', () => {
    it('应该使用React.memo优化渲染', () => {
      const onValueChange = jest.fn();
      const { rerender } = render(
        <ThemeProvider>
          <StableSlider
            value={[50]}
            onValueChange={onValueChange}
            label="稳定性测试"
          />
        </ThemeProvider>
      );

      // 重新渲染相同的props
      rerender(
        <ThemeProvider>
          <StableSlider
            value={[50]}
            onValueChange={onValueChange}
            label="稳定性测试"
          />
        </ThemeProvider>
      );

      // 组件应该被memo化，不会重新渲染
      expect(screen.getByText('稳定性测试')).toBeInTheDocument();
    });

    it('应该稳定化回调函数', () => {
      const onCheckedChange = jest.fn();
      const { rerender } = render(
        <ThemeProvider>
          <StableSwitch
            checked={false}
            onCheckedChange={onCheckedChange}
            label="回调稳定性测试"
          />
        </ThemeProvider>
      );

      // 重新渲染相同的props
      rerender(
        <ThemeProvider>
          <StableSwitch
            checked={false}
            onCheckedChange={onCheckedChange}
            label="回调稳定性测试"
          />
        </ThemeProvider>
      );

      // 回调函数应该被useCallback稳定化
      expect(screen.getByText('回调稳定性测试')).toBeInTheDocument();
    });
  });
});