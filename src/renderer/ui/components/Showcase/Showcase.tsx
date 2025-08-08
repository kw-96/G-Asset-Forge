/**
 * UI组件展示页面
 * 用于开发和测试所有UI组件
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Dropdown,
  DropdownItem,
  Slider,
  Switch,
  Progress,
  Tooltip,
  IconButton,
} from '../index';
import { colors, spacing } from '../../theme/tokens';

const ShowcaseContainer = styled.div`
  padding: ${({ theme }) => theme.spacing['2xl']};
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surface} 100%);
  min-height: 100vh;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 20%, ${({ theme }) => theme.colors.primary}08 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, ${({ theme }) => theme.colors.accent}08 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ShowcaseTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
    border-radius: 2px;
  }
`;

const Section = styled.section`
  margin-bottom: ${spacing[8]};
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.neutral[800]};
  margin-bottom: ${spacing[4]};
  border-bottom: 2px solid ${colors.primary[500]};
  padding-bottom: ${spacing[2]};
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing[4]};
`;

const ComponentDemo = styled(Card)`
  padding: ${spacing[4]};
`;

const DemoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.neutral[700]};
  margin-bottom: ${spacing[3]};
`;

const DemoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]};
`;

const DemoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  flex-wrap: wrap;
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
`;

export const Showcase: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [switchValue, setSwitchValue] = useState(false);
  const [progressValue, setProgressValue] = useState(75);
  const [inputValue, setInputValue] = useState('');

  return (
    <ShowcaseContainer>
      <ShowcaseTitle>G-Asset Forge UI 组件库</ShowcaseTitle>

      <Section>
        <SectionTitle>按钮组件 (Buttons)</SectionTitle>
        <ComponentGrid>
          <ComponentDemo>
            <DemoTitle>按钮变体</DemoTitle>
            <DemoContent>
              <DemoRow>
                <Button variant="primary">主要按钮</Button>
                <Button variant="secondary">次要按钮</Button>
                <Button variant="outline">轮廓按钮</Button>
              </DemoRow>
              <DemoRow>
                <Button variant="ghost">幽灵按钮</Button>
                <Button variant="danger">危险按钮</Button>
                <Button disabled>禁用按钮</Button>
              </DemoRow>
            </DemoContent>
          </ComponentDemo>

          <ComponentDemo>
            <DemoTitle>按钮尺寸</DemoTitle>
            <DemoContent>
              <DemoRow>
                <Button size="xs">超小</Button>
                <Button size="sm">小</Button>
                <Button size="md">中</Button>
                <Button size="lg">大</Button>
              </DemoRow>
            </DemoContent>
          </ComponentDemo>

          <ComponentDemo>
            <DemoTitle>按钮状态</DemoTitle>
            <DemoContent>
              <DemoRow>
                <Button loading>加载中</Button>
                <Button icon={<span>📁</span>}>带图标</Button>
                <Button fullWidth>全宽按钮</Button>
              </DemoRow>
            </DemoContent>
          </ComponentDemo>
        </ComponentGrid>
      </Section>

      <Section>
        <SectionTitle>输入组件 (Inputs)</SectionTitle>
        <ComponentGrid>
          <ComponentDemo>
            <DemoTitle>输入框</DemoTitle>
            <DemoContent>
              <Input
                placeholder="基础输入框"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                placeholder="带标签的输入框"
                label="项目名称"
                helperText="请输入项目名称"
              />
              <Input
                placeholder="错误状态"
                error={true}
                helperText="这是错误信息"
              />
            </DemoContent>
          </ComponentDemo>

          <ComponentDemo>
            <DemoTitle>滑块</DemoTitle>
            <DemoContent>
              <Slider
                value={[sliderValue]}
                onValueChange={(value) => setSliderValue(value[0] || 0)}
                label="透明度"
              />
              <Slider
                value={[25]}
                onValueChange={() => {}}
                min={0}
                max={100}
                step={5}
                label="画笔大小"
                disabled
              />
            </DemoContent>
          </ComponentDemo>

          <ComponentDemo>
            <DemoTitle>开关</DemoTitle>
            <DemoContent>
              <Switch
                checked={switchValue}
                onCheckedChange={setSwitchValue}
                label="启用网格"
                description="显示画布网格线"
              />
              <Switch
                checked={true}
                onCheckedChange={() => {}}
                label="自动保存"
                disabled
              />
            </DemoContent>
          </ComponentDemo>
        </ComponentGrid>
      </Section>

      <Section>
        <SectionTitle>反馈组件 (Feedback)</SectionTitle>
        <ComponentGrid>
          <ComponentDemo>
            <DemoTitle>徽章</DemoTitle>
            <DemoContent>
              <DemoRow>
                <Badge>默认</Badge>
                <Badge variant="primary">主要</Badge>
                <Badge variant="success">成功</Badge>
                <Badge variant="warning">警告</Badge>
                <Badge variant="error">错误</Badge>
              </DemoRow>
              <DemoRow>
                <Badge size="sm">小徽章</Badge>
                <Badge size="md">中徽章</Badge>
                <Badge size="lg">大徽章</Badge>
              </DemoRow>
              <DemoRow>
                <Badge dot variant="success" />
                <Badge dot variant="error" />
                <Badge dot variant="warning" />
              </DemoRow>
            </DemoContent>
          </ComponentDemo>

          <ComponentDemo>
            <DemoTitle>进度条</DemoTitle>
            <DemoContent>
              <Progress value={progressValue} showValue label="导出进度" />
              <Progress value={30} variant="success" />
              <Progress value={60} variant="warning" />
              <Progress value={80} variant="error" />
              <Progress label="处理中..." />
            </DemoContent>
          </ComponentDemo>

          <ComponentDemo>
            <DemoTitle>工具提示</DemoTitle>
            <DemoContent>
              <DemoRow>
                <Tooltip content="这是一个工具提示">
                  <Button>悬停查看提示</Button>
                </Tooltip>
                <Tooltip content="保存当前项目" side="top">
                  <IconButton icon="💾" />
                </Tooltip>
              </DemoRow>
            </DemoContent>
          </ComponentDemo>
        </ComponentGrid>
      </Section>

      <Section>
        <SectionTitle>导航组件 (Navigation)</SectionTitle>
        <ComponentGrid>
          <ComponentDemo>
            <DemoTitle>下拉菜单</DemoTitle>
            <DemoContent>
              <DemoRow>
                <Dropdown trigger={<Button variant="outline">文件菜单</Button>}>
                  <DropdownItem>📁 新建项目</DropdownItem>
                  <DropdownItem>💾 保存项目</DropdownItem>
                  <DropdownItem>📤 导出图像</DropdownItem>
                  <DropdownItem destructive>
                    🗑️ 删除项目
                  </DropdownItem>
                </Dropdown>

                <Dropdown 
                  trigger={<Button variant="ghost">工具</Button>}
                  side="bottom"
                  align="end"
                >
                  <DropdownItem>选择工具</DropdownItem>
                  <DropdownItem>画笔工具</DropdownItem>
                  <DropdownItem>文本工具</DropdownItem>
                  <DropdownItem disabled>形状工具 (即将推出)</DropdownItem>
                </Dropdown>
              </DemoRow>
            </DemoContent>
          </ComponentDemo>
        </ComponentGrid>
      </Section>

      <Section>
        <SectionTitle>布局组件 (Layout)</SectionTitle>
        <ComponentGrid>
          <ComponentDemo>
            <DemoTitle>卡片组件</DemoTitle>
            <DemoContent>
              <Card>
                <CardHeader>
                  <CardTitle>项目设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>这是一个基础卡片组件的示例内容。</p>
                  <DemoRow>
                    <Button size="sm">确认</Button>
                    <Button variant="outline" size="sm">取消</Button>
                  </DemoRow>
                </CardContent>
              </Card>
            </DemoContent>
          </ComponentDemo>
        </ComponentGrid>
      </Section>

      <Section>
        <SectionTitle>交互演示</SectionTitle>
        <ComponentGrid>
          <ComponentDemo>
            <DemoTitle>综合示例</DemoTitle>
            <DemoContent>
              <ProgressInfo>
                <span>进度:</span>
                <Badge variant="info">{progressValue}%</Badge>
              </ProgressInfo>
              
              <Slider
                value={[progressValue]}
                onValueChange={(value) => setProgressValue(value[0] || 0)}
                label="调整进度"
              />
              
              <Progress value={progressValue} variant="default" showValue />
              
              <DemoRow>
                <Button 
                  onClick={() => setProgressValue(Math.max(0, progressValue - 10))}
                  disabled={progressValue <= 0}
                >
                  减少
                </Button>
                <Button 
                  onClick={() => setProgressValue(Math.min(100, progressValue + 10))}
                  disabled={progressValue >= 100}
                >
                  增加
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setProgressValue(0)}
                >
                  重置
                </Button>
              </DemoRow>
            </DemoContent>
          </ComponentDemo>
        </ComponentGrid>
      </Section>
    </ShowcaseContainer>
  );
};

export default Showcase;