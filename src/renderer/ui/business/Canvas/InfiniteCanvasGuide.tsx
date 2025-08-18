import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { IconButton } from '../../index';
import { Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';

const GuideOverlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const GuidePanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const GuideTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
`;

const GuideContent = styled.div`
  color: #475569;
  line-height: 1.6;
`;

const GuideSection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const GuideSubtitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
`;

const GuideList = styled.ul`
  margin: 0;
  padding-left: 16px;
  
  li {
    margin-bottom: 4px;
    font-size: 13px;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 12px;
  right: 12px;
`;

const GuideToggle = styled(IconButton)`
  position: absolute;
  top: 16px;
  right: 140px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  z-index: 100;
`;

interface InfiniteCanvasGuideProps {
  className?: string;
}

const InfiniteCanvasGuide: React.FC<InfiniteCanvasGuideProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // 首次访问时显示指南
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('infinite-canvas-guide-seen');
    if (!hasSeenGuide && !hasShown) {
      setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, 1000);
    }
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('infinite-canvas-guide-seen', 'true');
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <GuideToggle
        icon={<InfoCircledIcon />}
        onClick={handleToggle}
        variant="ghost"
        size="sm"
        className={className}
        title="无限画布使用指南"
      />
      
      <GuideOverlay $visible={isVisible}>
        <GuidePanel>
          <CloseButton
            icon={<Cross2Icon />}
            onClick={handleClose}
            variant="ghost"
            size="sm"
          />
          
          <GuideTitle>🎨 无限画布使用指南</GuideTitle>
          
          <GuideContent>
            <GuideSection>
              <GuideSubtitle>画布导航</GuideSubtitle>
              <GuideList>
                <li><strong>拖拽移动</strong>: 按住鼠标左键拖拽画布</li>
                <li><strong>缩放</strong>: 滚轮缩放，或使用工具栏缩放按钮</li>
                <li><strong>双击重置</strong>: 双击空白区域回到原点</li>
                <li><strong>抓手工具 (H)</strong>: 专门的画布移动工具</li>
              </GuideList>
            </GuideSection>

            <GuideSection>
              <GuideSubtitle>创建对象</GuideSubtitle>
              <GuideList>
                <li><strong>形状工具</strong>: 选择工具后点击画布创建</li>
                <li><strong>画笔工具 (B)</strong>: 自由绘制</li>
                <li><strong>文本工具 (T)</strong>: 添加文本</li>
                <li><strong>裁剪工具 (C)</strong>: 裁剪选中对象</li>
              </GuideList>
            </GuideSection>

            <GuideSection>
              <GuideSubtitle>视图控制</GuideSubtitle>
              <GuideList>
                <li><strong>网格显示</strong>: 帮助对齐和定位</li>
                <li><strong>小地图</strong>: 右下角显示整体布局</li>
                <li><strong>缩放指示器</strong>: 左上角显示当前缩放级别</li>
                <li><strong>坐标原点</strong>: 红色十字标记 (0,0) 位置</li>
              </GuideList>
            </GuideSection>

            <GuideSection>
              <GuideSubtitle>快捷键</GuideSubtitle>
              <GuideList>
                <li><strong>V</strong> - 选择工具 | <strong>H</strong> - 抓手工具</li>
                <li><strong>R</strong> - 矩形 | <strong>O</strong> - 椭圆 | <strong>T</strong> - 文本</li>
                <li><strong>B</strong> - 画笔 | <strong>C</strong> - 裁剪</li>
                <li><strong>Escape</strong> - 取消选择</li>
              </GuideList>
            </GuideSection>
          </GuideContent>
        </GuidePanel>
      </GuideOverlay>
    </>
  );
};

export default InfiniteCanvasGuide;