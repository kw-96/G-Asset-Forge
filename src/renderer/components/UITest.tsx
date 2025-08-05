// UI组件库测试组件
import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Tooltip,
  IconButton,
  useTheme
} from '../ui';
import { 
  MagnifyingGlassIcon, 
  HeartIcon, 
  StarIcon,
  SunIcon,
  MoonIcon,
  PlusIcon
} from '@radix-ui/react-icons';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ComponentDemo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ThemeToggle = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: 1000;
`;

export const UITest: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Container>
      <ThemeToggle>
        <Tooltip content={`切换到${mode === 'light' ? '暗色' : '亮色'}主题`}>
          <IconButton
            icon={mode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleTheme}
            variant="ghost"
          />
        </Tooltip>
      </ThemeToggle>

      <Section>
        <SectionTitle>G-Asset Forge UI 组件库</SectionTitle>
        <p>基于 Figma 和 Penpot 设计语言的现代化 UI 组件系统</p>
      </Section>

      <Section>
        <SectionTitle>按钮组件</SectionTitle>
        <ComponentGrid>
          <Card>
            <CardHeader>
              <CardTitle>按钮变体</CardTitle>
              <CardDescription>不同样式的按钮组件</CardDescription>
            </CardHeader>
            <CardContent>
              <ComponentDemo>
                <ButtonGroup>
                  <Button variant="primary">主要按钮</Button>
                  <Button variant="secondary">次要按钮</Button>
                  <Button variant="outline">轮廓按钮</Button>
                  <Button variant="ghost">幽灵按钮</Button>
                  <Button variant="danger">危险按钮</Button>
                </ButtonGroup>
                
                <ButtonGroup>
                  <Button size="sm">小按钮</Button>
                  <Button size="md">中按钮</Button>
                  <Button size="lg">大按钮</Button>
                </ButtonGroup>
                
                <ButtonGroup>
                  <Button icon={<PlusIcon />}>带图标</Button>
                  <Button loading={loading} onClick={handleLoadingTest}>
                    {loading ? '加载中...' : '加载测试'}
                  </Button>
                  <Button disabled>禁用状态</Button>
                </ButtonGroup>
              </ComponentDemo>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>图标按钮</CardTitle>
              <CardDescription>紧凑的图标按钮组件</CardDescription>
            </CardHeader>
            <CardContent>
              <ComponentDemo>
                <ButtonGroup>
                  <Tooltip content="搜索">
                    <IconButton icon={<MagnifyingGlassIcon />} />
                  </Tooltip>
                  <Tooltip content="收藏">
                    <IconButton icon={<HeartIcon />} variant="primary" />
                  </Tooltip>
                  <Tooltip content="评分">
                    <IconButton icon={<StarIcon />} variant="ghost" />
                  </Tooltip>
                  <Tooltip content="删除">
                    <IconButton icon={<PlusIcon />} variant="danger" />
                  </Tooltip>
                </ButtonGroup>
                
                <ButtonGroup>
                  <IconButton icon={<PlusIcon />} size="sm" />
                  <IconButton icon={<PlusIcon />} size="md" />
                  <IconButton icon={<PlusIcon />} size="lg" />
                </ButtonGroup>
              </ComponentDemo>
            </CardContent>
          </Card>
        </ComponentGrid>
      </Section>

      <Section>
        <SectionTitle>输入组件</SectionTitle>
        <ComponentGrid>
          <Card>
            <CardHeader>
              <CardTitle>输入框</CardTitle>
              <CardDescription>各种样式的输入框组件</CardDescription>
            </CardHeader>
            <CardContent>
              <ComponentDemo>
                <Input
                  label="标准输入框"
                  placeholder="请输入内容..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                
                <Input
                  label="带图标的输入框"
                  placeholder="搜索..."
                  leftIcon={<MagnifyingGlassIcon />}
                />
                
                <Input
                  label="填充样式"
                  variant="filled"
                  placeholder="填充样式输入框"
                />
                
                <Input
                  label="错误状态"
                  error
                  helperText="这是一个错误提示"
                  placeholder="错误状态输入框"
                />
                
                <Input
                  label="禁用状态"
                  disabled
                  placeholder="禁用状态输入框"
                />
              </ComponentDemo>
            </CardContent>
          </Card>
        </ComponentGrid>
      </Section>

      <Section>
        <SectionTitle>卡片组件</SectionTitle>
        <ComponentGrid>
          <Card variant="default">
            <CardHeader>
              <CardTitle>默认卡片</CardTitle>
              <CardDescription>这是一个默认样式的卡片组件</CardDescription>
            </CardHeader>
            <CardContent>
              <p>卡片内容区域，可以放置任何内容。</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">操作</Button>
              <Button variant="ghost" size="sm">取消</Button>
            </CardFooter>
          </Card>

          <Card variant="outlined" hoverable>
            <CardHeader>
              <CardTitle>轮廓卡片</CardTitle>
              <CardDescription>带边框的卡片，支持悬停效果</CardDescription>
            </CardHeader>
            <CardContent>
              <p>鼠标悬停时会有轻微的上升动画效果。</p>
            </CardContent>
          </Card>

          <Card variant="elevated" clickable onClick={() => alert('卡片被点击了！')}>
            <CardHeader>
              <CardTitle>阴影卡片</CardTitle>
              <CardDescription>带阴影的卡片，可点击</CardDescription>
            </CardHeader>
            <CardContent>
              <p>点击这个卡片会触发点击事件。</p>
            </CardContent>
          </Card>
        </ComponentGrid>
      </Section>

      <Section>
        <SectionTitle>主题系统</SectionTitle>
        <Card>
          <CardHeader>
            <CardTitle>主题切换</CardTitle>
            <CardDescription>
              当前主题: {mode === 'light' ? '亮色模式' : '暗色模式'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              UI 组件库支持亮色和暗色两种主题模式，可以通过右上角的按钮进行切换。
              主题设置会自动保存到本地存储中。
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={toggleTheme}>
              切换到{mode === 'light' ? '暗色' : '亮色'}主题
            </Button>
          </CardFooter>
        </Card>
      </Section>
    </Container>
  );
};