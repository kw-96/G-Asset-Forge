/**
 * 欢迎屏幕 - 新用户引导和快速开始
 * 参考Figma的新手引导流程，15分钟内完成首个作品
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/components/Button/Button';
// import { Card, CardContent, CardHeader, CardTitle } from '../../ui/components/Card/Card';
// import { Card, CardContent} from '../../ui/components/Card/Card';
// import { Badge } from '../../ui/components/Badge/Badge';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surface} 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, ${({ theme }) => theme.colors.primary}15 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, ${({ theme }) => theme.colors.accent}15 0%, transparent 50%);
    pointer-events: none;
  }
`;

const WelcomeContent = styled.div`
  max-width: 800px;
  width: 90%;
  position: relative;
  z-index: 1;
`;

const WelcomeHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`;

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  // margin-bottom: ${({ theme }) => theme.spacing.md};
  
  // &::after {
  //   content: '';
  //   display: block;
  //   width: 80px;
  //   height: 4px;
  //   background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  //   margin: ${({ theme }) => theme.spacing.lg} auto 0;
  //   border-radius: 2px;
  // }
`;

const WelcomeSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

// const OptionsGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//   gap: ${({ theme }) => theme.spacing.xl};
//   margin-bottom: ${({ theme }) => theme.spacing['3xl']};
// `;

// const OptionCard = styled(Card)<{ $selected?: boolean }>`
//   cursor: pointer;
//   transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.ease};
//   border: 2px solid ${({ theme, $selected }) => 
//     $selected ? theme.colors.primary : 'transparent'};
  
//   &:hover {
//     transform: translateY(-4px);
//     box-shadow: ${({ theme }) => theme.shadows.lg};
//   }
// `;

// const OptionIcon = styled.div`
//   width: 64px;
//   height: 64px;
//   border-radius: ${({ theme }) => theme.borderRadius.lg};
//   background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 32px;
//   margin-bottom: ${({ theme }) => theme.spacing.lg};
// `;



// const OptionDescription = styled.p`
//   font-size: ${({ theme }) => theme.typography.fontSize.sm};
//   color: ${({ theme }) => theme.colors.text.secondary};
//   line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
// `;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  height: 48px;
`;

// const FeatureList = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: ${({ theme }) => theme.spacing.sm};
//   justify-content: center;
//   margin-top: ${({ theme }) => theme.spacing.xl};
// `;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  // const [selectedOption, setSelectedOption] = useState<string>('new-project');
  const [selectedOption] = useState<string>('new-project');

  // const options = [
  //   {
  //     id: 'new-project',
  //     // icon: '🎨',
  //     title: '创建新项目',
  //     description: '从空白画布开始，使用我们的设计工具创建游戏资产',
  //   },
  //   {
  //     id: 'template',
  //     // icon: '📋',
  //     title: '使用模板',
  //     description: '选择预设模板快速开始，包含常见的游戏UI和图标模板',
  //   },
  //   {
  //     id: 'tutorial',
  //     // icon: '🎓',
  //     title: '交互式教程',
  //     description: '15分钟快速上手教程，学习基础操作和最佳实践',
  //   },
  // ];

  // const features = [
  //   '基于Suika引擎的高性能画布',
  //   '5种专业设计工具',
  //   'H5编辑器导出功能',
  //   '50+游戏素材库',
  //   '支持PNG/JPG导出',
  //   '团队协作支持',
  // ];

  const handleStart = () => {
    // 标记用户已经使用过应用
    localStorage.setItem('g-asset-forge-used', 'true');
    
    // 根据选择的选项执行不同的操作
    switch (selectedOption) {
      case 'tutorial':
        // 启动教程模式
        console.log('Starting tutorial mode');
        break;
      case 'template':
        // 显示模板选择
        console.log('Opening template selection');
        break;
      default:
        // 直接进入主界面
        break;
    }
    onComplete();
  };

  return (
    <WelcomeContainer>
      <WelcomeContent>
        <WelcomeHeader>
          <WelcomeTitle>G-ASSET FORGE</WelcomeTitle>
          <WelcomeSubtitle>
            快速、批量、标准化的美术素材生产
          </WelcomeSubtitle>
          
          {/* <FeatureList>
            {features.map((feature, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {feature}
              </Badge>
            ))}
          </FeatureList> */}
        </WelcomeHeader>

        {/* <OptionsGrid>
          {options.map((option) => (
            <OptionCard
              key={option.id}
              $selected={selectedOption === option.id}
              onClick={() => setSelectedOption(option.id)}
              hoverable
            >
              <CardHeader>
                <OptionIcon>{option.icon}</OptionIcon>
                <CardTitle as="h3" style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  marginBottom: '8px' 
                }}>
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OptionDescription>{option.description}</OptionDescription>
              </CardContent>
            </OptionCard>
          ))}
        </OptionsGrid> */}

        <ActionButtons>
          {/* <Button variant="outline" onClick={onComplete}>
            跳过引导
          </Button> */}
          <Button variant="primary" onClick={handleStart}>
            开始使用
          </Button>
        </ActionButtons>
      </WelcomeContent>
    </WelcomeContainer>
  );
};