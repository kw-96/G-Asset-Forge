import styled from 'styled-components';

/**
 * Suika画布容器统一样式
 * 包含网格、标尺、参考线等容器的样式定义
 */

// 网格Canvas样式
export const GridCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  width: 100% !important;
  height: 100% !important;
  display: block;
  
  /* 网格容器标识 */
  &[data-type="grid"] {
    /* 网格特定样式 */
  }
  
  /* 网格Canvas类名样式 */
  &.suika-grid-canvas {
    /* 可以添加特定的网格样式 */
  }
`;

// 标尺Canvas样式
export const RulerCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
  width: 100% !important;
  height: 100% !important;
  display: block;
  
  /* 标尺容器标识 */
  &[data-type="ruler"] {
    /* 标尺特定样式 */
  }
  
  /* 标尺Canvas类名样式 */
  &.suika-ruler-canvas {
    /* 可以添加特定的标尺样式 */
  }
`;

// 参考线Canvas样式
export const RefLineCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
  width: 100% !important;
  height: 100% !important;
  display: block;
  
  /* 参考线容器标识 */
  &[data-type="ref-line"] {
    /* 参考线特定样式 */
  }
  
  /* 参考线Canvas类名样式 */
  &.suika-ref-line-canvas {
    /* 可以添加特定的参考线样式 */
  }
`;

// 通用Canvas容器样式
export const SuikaCanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  
  /* 网格容器 */
  .suika-grid-canvas {
    /* 网格特定样式 */
  }
  
  /* 标尺容器 */
  .suika-ruler-canvas {
    /* 标尺特定样式 */
  }
  
  /* 参考线容器 */
  .suika-ref-line-canvas {
    /* 参考线特定样式 */
  }
  
  /* 调试样式 - 开发模式下显示边框 */
  ${process.env['NODE_ENV'] === 'development' && `
    .suika-grid-canvas,
    .suika-ruler-canvas,
    .suika-ref-line-canvas {
      border: 1px solid rgba(255, 0, 0, 0.3);
    }
  `}
`;
