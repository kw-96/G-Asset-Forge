import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { useAppStore } from '../../stores/appStore';
import { useCanvasStore } from '../../stores/canvasStore';
const MinimapContainer = styled.div `
  position: absolute;
  bottom: 80px;
  right: 16px;
  width: 120px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  z-index: 999;
`;
const MinimapViewport = styled.div `
  width: 100%;
  height: 100%;
  position: relative;
  background: #f8fafc;
`;
const MinimapElement = styled.div `
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  width: ${props => props.$width}%;
  height: ${props => props.$height}%;
  background: ${props => props.$color};
  border-radius: 1px;
`;
const MinimapViewFrame = styled.div `
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  width: ${props => props.$width}%;
  height: ${props => props.$height}%;
  border: 2px solid #667eea;
  background: rgba(102, 126, 234, 0.1);
  pointer-events: none;
`;
const CanvasMinimap = () => {
    const { elements } = useAppStore();
    const { zoom, panX, panY } = useCanvasStore();
    // 计算元素在小地图中的位置和大小
    const getMinimapBounds = () => {
        const elementList = Object.values(elements);
        if (elementList.length === 0) {
            return { minX: -500, minY: -500, maxX: 500, maxY: 500 };
        }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        elementList.forEach(element => {
            minX = Math.min(minX, element.x);
            minY = Math.min(minY, element.y);
            maxX = Math.max(maxX, element.x + element.width);
            maxY = Math.max(maxY, element.y + element.height);
        });
        // 添加一些边距
        const padding = 200;
        return {
            minX: minX - padding,
            minY: minY - padding,
            maxX: maxX + padding,
            maxY: maxY + padding
        };
    };
    const bounds = getMinimapBounds();
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;
    // 计算当前视图框在小地图中的位置
    const scale = zoom / 100;
    const viewWidth = (120 / scale) * (120 / boundsWidth);
    const viewHeight = (80 / scale) * (80 / boundsHeight);
    const viewX = 50 - (panX / boundsWidth) * 100 - viewWidth / 2;
    const viewY = 50 - (panY / boundsHeight) * 100 - viewHeight / 2;
    return (_jsx(MinimapContainer, { children: _jsxs(MinimapViewport, { children: [Object.values(elements).map(element => {
                    const x = ((element.x - bounds.minX) / boundsWidth) * 100;
                    const y = ((element.y - bounds.minY) / boundsHeight) * 100;
                    const width = (element.width / boundsWidth) * 100;
                    const height = (element.height / boundsHeight) * 100;
                    return (_jsx(MinimapElement, { "$x": x, "$y": y, "$width": Math.max(width, 1), "$height": Math.max(height, 1), "$color": element.fill || '#3b82f6' }, element.id));
                }), _jsx(MinimapViewFrame, { "$x": Math.max(0, Math.min(100 - viewWidth, viewX)), "$y": Math.max(0, Math.min(100 - viewHeight, viewY)), "$width": Math.min(viewWidth, 100), "$height": Math.min(viewHeight, 100) })] }) }));
};
export default CanvasMinimap;
//# sourceMappingURL=CanvasMinimap.js.map