import React, { useEffect } from 'react';
// import { useCanvasStore } from '../../stores/canvasStore'; // 无限画布不需要
import { useAppStore } from '../../stores/appStore';
import CanvasComponent from './CanvasComponent';
import CanvasToolbar from './CanvasToolbar';
import FloatingToolbar from './FloatingToolbar';
import CanvasMinimap from './CanvasMinimap';
import InfiniteCanvasGuide from './InfiniteCanvasGuide';

import styled from 'styled-components';

const CanvasAreaContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  position: relative;
`;

const InfiniteCanvasWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #e5e7eb;
  /* 无限画布背景纹理 */
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0);
  background-size: 20px 20px;
`;

const CanvasArea: React.FC = () => {
  // 移除对canvas属性的引用，因为无限画布不需要fabric.js实例
  const { setHasUnsavedChanges } = useAppStore();

  // 监听元素变化以更新保存状态
  useEffect(() => {
    // 当有元素变化时标记为未保存
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges]);

  return (
    <CanvasAreaContainer>
      <CanvasToolbar />
      
      <InfiniteCanvasWrapper>
        <CanvasComponent />
        {/* Figma风格的悬浮工具栏 */}
        <FloatingToolbar />
        {/* 无限画布小地图 */}
        <CanvasMinimap />
        {/* 无限画布使用指南 */}
        <InfiniteCanvasGuide />
      </InfiniteCanvasWrapper>
    </CanvasAreaContainer>
  );
};

export default CanvasArea;