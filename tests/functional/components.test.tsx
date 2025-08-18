/**
 * UI组件功能测试
 * @description 测试UI组件的功能是否正常工作
 * @author 开发团队
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../src/renderer/ui/theme/tokens';  

// 导入要测试的组件
import { Button } from '../../src/renderer/ui/components/atoms/Button/Button';
import { Text } from '../../src/renderer/ui/components/atoms/Text/Text';
import { Icon } from '../../src/renderer/ui/components/atoms/Icon/Icon';
import { Card } from '../../src/renderer/ui/components/molecules/Card/Card';
import { SearchBox } from '../../src/renderer/ui/components/molecules/SearchBox/SearchBox';
import { FormField } from '../../src/renderer/ui/components/molecules/FormField/FormField';
import { Flex } from '../../src/renderer/ui/components/atoms/layout/Flex/Flex';
import { Grid } from '../../src/renderer/ui/components/atoms/layout/Grid/Grid';
import { Container } from '../../src/renderer/ui/components/atoms/layout/Container/Container';

/**
 * 测试包装器组件
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

/**
 * 渲染组件的辅助函数
 */
const renderWithTheme = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('UI组件功能测试', () => {
  describe('原子组件测试', () => {
    describe('Button组件', () => {
      test('应该正确渲染按钮', () => {
        renderWithTheme(<Button>测试按钮</Button>);
        
        const button = screen.getByRole('button', { name: '测试按钮' });
        expect(button).toBeInTheDocument();
      });

      test('应该响应点击事件', () => {
        const handleClick = jest.fn();
        renderWithTheme(<Button onClick={handleClick}>点击我</Button>);
        
        const button = screen.getByRole('button', { name: '点击我' });
        fireEvent.click(button);
        
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      test('应该支持不同的变体', () => {
        const { rerender } = renderWithTheme(<Button variant="primary">主要按钮</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Button variant="secondary">次要按钮</Button>
          </TestWrapper>
        );
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Button variant="outline">轮廓按钮</Button>
          </TestWrapper>
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      test('应该支持不同的尺寸', () => {
        const { rerender } = renderWithTheme(<Button size="small">小按钮</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Button size="medium">中按钮</Button>
          </TestWrapper>
        );
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Button size="large">大按钮</Button>
          </TestWrapper>
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      test('应该支持禁用状态', () => {
        const handleClick = jest.fn();
        renderWithTheme(<Button disabled onClick={handleClick}>禁用按钮</Button>);
        
        const button = screen.getByRole('button', { name: '禁用按钮' });
        expect(button).toBeDisabled();
        
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
      });

      test('应该支持加载状态', () => {
        renderWithTheme(<Button loading>加载中</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
      });
    });

    describe('Text组件', () => {
      test('应该正确渲染文本', () => {
        renderWithTheme(<Text>测试文本</Text>);
        
        expect(screen.getByText('测试文本')).toBeInTheDocument();
      });

      test('应该支持不同的尺寸', () => {
        const { rerender } = renderWithTheme(<Text size="xs">超小文本</Text>);
        expect(screen.getByText('超小文本')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Text size="sm">小文本</Text>
          </TestWrapper>
        );
        expect(screen.getByText('小文本')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Text size="md">中文本</Text>
          </TestWrapper>
        );
        expect(screen.getByText('中文本')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Text size="lg">大文本</Text>
          </TestWrapper>
        );
        expect(screen.getByText('大文本')).toBeInTheDocument();
      });

      test('应该支持不同的权重', () => {
        renderWithTheme(<Text weight="bold">粗体文本</Text>);
        expect(screen.getByText('粗体文本')).toBeInTheDocument();
      });

      test('应该支持不同的颜色', () => {
        renderWithTheme(<Text color="primary">主色文本</Text>);
        expect(screen.getByText('主色文本')).toBeInTheDocument();
      });

      test('应该支持截断', () => {
        renderWithTheme(<Text truncate>这是一段很长的文本，应该被截断</Text>);
        expect(screen.getByText('这是一段很长的文本，应该被截断')).toBeInTheDocument();
      });
    });

    describe('Icon组件', () => {
      test('应该正确渲染图标', () => {
        renderWithTheme(<Icon name="home" />);
        
        const icon = screen.getByRole('img', { hidden: true });
        expect(icon).toBeInTheDocument();
      });

      test('应该支持不同的尺寸', () => {
        const { rerender } = renderWithTheme(<Icon name="home" size="small" />);
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Icon name="home" size="medium" />
          </TestWrapper>
        );
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <Icon name="home" size="large" />
          </TestWrapper>
        );
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      });

      test('应该支持自定义颜色', () => {
        renderWithTheme(<Icon name="home" color="primary" />);
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      });
    });
  });

  describe('分子组件测试', () => {
    describe('Card组件', () => {
      test('应该正确渲染卡片', () => {
        renderWithTheme(
          <Card>
            <Text>卡片内容</Text>
          </Card>
        );
        
        expect(screen.getByText('卡片内容')).toBeInTheDocument();
      });

      test('应该支持不同的内边距', () => {
        renderWithTheme(
          <Card padding="lg">
            <Text>大内边距卡片</Text>
          </Card>
        );
        
        expect(screen.getByText('大内边距卡片')).toBeInTheDocument();
      });

      test('应该支持阴影', () => {
        renderWithTheme(
          <Card shadow="md">
            <Text>有阴影的卡片</Text>
          </Card>
        );
        
        expect(screen.getByText('有阴影的卡片')).toBeInTheDocument();
      });

      test('应该支持边框', () => {
        renderWithTheme(
          <Card border>
            <Text>有边框的卡片</Text>
          </Card>
        );
        
        expect(screen.getByText('有边框的卡片')).toBeInTheDocument();
      });
    });

    describe('SearchBox组件', () => {
      test('应该正确渲染搜索框', () => {
        renderWithTheme(<SearchBox placeholder="搜索..." />);
        
        const searchInput = screen.getByPlaceholderText('搜索...');
        expect(searchInput).toBeInTheDocument();
      });

      test('应该响应输入事件', async () => {
        const handleChange = jest.fn();
        renderWithTheme(<SearchBox placeholder="搜索..." onChange={handleChange} />);
        
        const searchInput = screen.getByPlaceholderText('搜索...');
        fireEvent.change(searchInput, { target: { value: '测试搜索' } });
        
        await waitFor(() => {
          expect(handleChange).toHaveBeenCalledWith('测试搜索');
        });
      });

      test('应该支持清除功能', async () => {
        const handleChange = jest.fn();
        renderWithTheme(<SearchBox value="测试内容" onChange={handleChange} />);
        
        const clearButton = screen.getByRole('button', { name: /清除/i });
        fireEvent.click(clearButton);
        
        expect(handleChange).toHaveBeenCalledWith('');
      });

      test('应该支持搜索按钮', () => {
        const handleSearch = jest.fn();
        renderWithTheme(<SearchBox placeholder="搜索..." onSearch={handleSearch} />);
        
        const searchButton = screen.getByRole('button', { name: /搜索/i });
        fireEvent.click(searchButton);
        
        expect(handleSearch).toHaveBeenCalled();
      });
    });

    describe('FormField组件', () => {
      test('应该正确渲染表单字段', () => {
        renderWithTheme(<FormField label="用户名" />);
        
        expect(screen.getByLabelText('用户名')).toBeInTheDocument();
      });

      test('应该支持不同的输入类型', () => {
        const { rerender } = renderWithTheme(<FormField label="文本" type="text" />);
        expect(screen.getByLabelText('文本')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <FormField label="密码" type="password" />
          </TestWrapper>
        );
        expect(screen.getByLabelText('密码')).toBeInTheDocument();

        rerender(
          <TestWrapper>
            <FormField label="邮箱" type="email" />
          </TestWrapper>
        );
        expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
      });

      test('应该显示错误信息', () => {
        renderWithTheme(<FormField label="用户名" error="用户名不能为空" />);
        
        expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
      });

      test('应该显示帮助文本', () => {
        renderWithTheme(<FormField label="用户名" help="请输入您的用户名" />);
        
        expect(screen.getByText('请输入您的用户名')).toBeInTheDocument();
      });

      test('应该支持必填标记', () => {
        renderWithTheme(<FormField label="用户名" required />);
        
        const input = screen.getByLabelText('用户名');
        expect(input).toBeRequired();
      });
    });
  });

  describe('布局组件测试', () => {
    describe('Flex组件', () => {
      test('应该正确渲染Flex容器', () => {
        renderWithTheme(
          <Flex>
            <Text>项目1</Text>
            <Text>项目2</Text>
          </Flex>
        );
        
        expect(screen.getByText('项目1')).toBeInTheDocument();
        expect(screen.getByText('项目2')).toBeInTheDocument();
      });

      test('应该支持不同的方向', () => {
        renderWithTheme(
          <Flex direction="column">
            <Text>垂直项目1</Text>
            <Text>垂直项目2</Text>
          </Flex>
        );
        
        expect(screen.getByText('垂直项目1')).toBeInTheDocument();
        expect(screen.getByText('垂直项目2')).toBeInTheDocument();
      });

      test('应该支持对齐方式', () => {
        renderWithTheme(
          <Flex justify="center" align="center">
            <Text>居中内容</Text>
          </Flex>
        );
        
        expect(screen.getByText('居中内容')).toBeInTheDocument();
      });

      test('应该支持间距', () => {
        renderWithTheme(
          <Flex gap="md">
            <Text>间距项目1</Text>
            <Text>间距项目2</Text>
          </Flex>
        );
        
        expect(screen.getByText('间距项目1')).toBeInTheDocument();
        expect(screen.getByText('间距项目2')).toBeInTheDocument();
      });
    });

    describe('Grid组件', () => {
      test('应该正确渲染Grid容器', () => {
        renderWithTheme(
          <Grid>
            <Text>网格项目1</Text>
            <Text>网格项目2</Text>
          </Grid>
        );
        
        expect(screen.getByText('网格项目1')).toBeInTheDocument();
        expect(screen.getByText('网格项目2')).toBeInTheDocument();
      });

      test('应该支持列数设置', () => {
        renderWithTheme(
          <Grid columns={3}>
            <Text>3列项目1</Text>
            <Text>3列项目2</Text>
            <Text>3列项目3</Text>
          </Grid>
        );
        
        expect(screen.getByText('3列项目1')).toBeInTheDocument();
        expect(screen.getByText('3列项目2')).toBeInTheDocument();
        expect(screen.getByText('3列项目3')).toBeInTheDocument();
      });

      test('应该支持间距设置', () => {
        renderWithTheme(
          <Grid gap="lg">
            <Text>大间距项目1</Text>
            <Text>大间距项目2</Text>
          </Grid>
        );
        
        expect(screen.getByText('大间距项目1')).toBeInTheDocument();
        expect(screen.getByText('大间距项目2')).toBeInTheDocument();
      });
    });

    describe('Container组件', () => {
      test('应该正确渲染容器', () => {
        renderWithTheme(
          <Container>
            <Text>容器内容</Text>
          </Container>
        );
        
        expect(screen.getByText('容器内容')).toBeInTheDocument();
      });

      test('应该支持不同的尺寸', () => {
        renderWithTheme(
          <Container size="sm">
            <Text>小容器内容</Text>
          </Container>
        );
        
        expect(screen.getByText('小容器内容')).toBeInTheDocument();
      });

      test('应该支持居中', () => {
        renderWithTheme(
          <Container centered>
            <Text>居中容器内容</Text>
          </Container>
        );
        
        expect(screen.getByText('居中容器内容')).toBeInTheDocument();
      });
    });
  });

  describe('组件集成测试', () => {
    test('组件应该能够正确组合使用', () => {
      renderWithTheme(
        <Container>
          <Card padding="md">
            <Flex direction="column" gap="md">
              <Text size="lg" weight="bold">表单标题</Text>
              <FormField label="用户名" placeholder="请输入用户名" />
              <FormField label="密码" type="password" placeholder="请输入密码" />
              <SearchBox placeholder="搜索内容..." />
              <Flex gap="sm" justify="end">
                <Button variant="outline">取消</Button>
                <Button variant="primary">确定</Button>
              </Flex>
            </Flex>
          </Card>
        </Container>
      );

      // 验证所有组件都正确渲染
      expect(screen.getByText('表单标题')).toBeInTheDocument();
      expect(screen.getByLabelText('用户名')).toBeInTheDocument();
      expect(screen.getByLabelText('密码')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('搜索内容...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument();
    });

    test('组件应该能够正确传递事件', async () => {
      const handleSubmit = jest.fn();
      const handleCancel = jest.fn();
      const handleSearch = jest.fn();

      renderWithTheme(
        <Container>
          <Card>
            <Flex direction="column" gap="md">
              <SearchBox placeholder="搜索..." onSearch={handleSearch} />
              <Flex gap="sm">
                <Button onClick={handleCancel}>取消</Button>
                <Button onClick={handleSubmit}>提交</Button>
              </Flex>
            </Flex>
          </Card>
        </Container>
      );

      // 测试搜索事件
      const searchButton = screen.getByRole('button', { name: /搜索/i });
      fireEvent.click(searchButton);
      expect(handleSearch).toHaveBeenCalled();

      // 测试按钮事件
      const cancelButton = screen.getByRole('button', { name: '取消' });
      const submitButton = screen.getByRole('button', { name: '提交' });
      
      fireEvent.click(cancelButton);
      expect(handleCancel).toHaveBeenCalled();
      
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});