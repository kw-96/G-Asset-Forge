// 架构测试应用
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from './ui/theme/ThemeProvider';
import { GlobalStyles } from './ui/styles/GlobalStyles';
import { Button, Card, CardHeader, CardTitle, CardContent } from './ui';
import { CanvasManager, CanvasEngineType } from './core/canvas/canvas-manager';
import { GAME_ASSET_PRESETS } from './core/canvas/canvas-utils';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CanvasContainer = styled.div`
  width: 800px;
  height: 600px;
  border: 2px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin: ${({ theme }) => theme.spacing.md} 0;
  position: relative;
  overflow: hidden;
`;

const ControlPanel = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const TestArchitectureApp: React.FC = () => {
  const [currentEngine, setCurrentEngine] = useState<CanvasEngineType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const canvasManagerRef = useRef<CanvasManager | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initializeCanvasManager = () => {
    if (!canvasManagerRef.current) {
      canvasManagerRef.current = new CanvasManager();
      
      canvasManagerRef.current.on('engineSwitched', (data) => {
        const { type } = data;
        setCurrentEngine(type);
        setIsInitialized(true);
        console.log(`Switched to ${type} engine`);
      });
    }
  };

  const switchEngine = async (engineType: CanvasEngineType) => {
    if (!containerRef.current) return;

    initializeCanvasManager();

    try {
      await canvasManagerRef.current!.switchEngine(engineType, containerRef.current, {
        size: { width: 800, height: 600 },
        background: '#ffffff',
        dpi: 1,
        enableGrid: true,
        enableRuler: true
      });
    } catch (error) {
      
    }
  };

  const addTestObject = () => {
    if (!canvasManagerRef.current) return;

    const testObject = {
      id: `object_${Date.now()}`,
      type: 'rectangle',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      size: { width: 100, height: 80 },
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0
    };

    canvasManagerRef.current.addObject(testObject);
  };

  const zoomIn = () => {
    if (!canvasManagerRef.current) return;
    const state = canvasManagerRef.current.getState();
    if (state) {
      canvasManagerRef.current.zoom(state.zoom * 1.2);
    }
  };

  const zoomOut = () => {
    if (!canvasManagerRef.current) return;
    const state = canvasManagerRef.current.getState();
    if (state) {
      canvasManagerRef.current.zoom(state.zoom / 1.2);
    }
  };

  const exportImage = () => {
    if (!canvasManagerRef.current) return;
    const dataUrl = canvasManagerRef.current.exportImage('png', 1);
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `canvas-export-${currentEngine}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <ThemeProvider defaultMode="light">
      <GlobalStyles />
      <Container>
        <Section>
          <h1>G-Asset Forge 架构测试</h1>
          <p>测试重构后的多引擎画布架构和核心系统</p>
        </Section>

        <Section>
          <Card>
            <CardHeader>
              <CardTitle>引擎切换测试</CardTitle>
            </CardHeader>
            <CardContent>
              <ControlPanel>
                <Button 
                  variant={currentEngine === CanvasEngineType.SUIKA ? 'primary' : 'secondary'}
                  onClick={() => switchEngine(CanvasEngineType.SUIKA)}
                >
                  Suika 引擎
                </Button>
                <Button 
                  variant={currentEngine === CanvasEngineType.H5_EDITOR ? 'primary' : 'secondary'}
                  onClick={() => switchEngine(CanvasEngineType.H5_EDITOR)}
                >
                  H5-Editor 引擎
                </Button>
                <Button 
                  variant={currentEngine === CanvasEngineType.FABRIC ? 'primary' : 'secondary'}
                  onClick={() => switchEngine(CanvasEngineType.FABRIC)}
                >
                  Fabric.js 引擎
                </Button>
              </ControlPanel>

              <CanvasContainer ref={containerRef}>
                {!isInitialized && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#666'
                  }}>
                    请选择一个引擎来初始化画布
                  </div>
                )}
              </CanvasContainer>

              {isInitialized && (
                <ControlPanel>
                  <Button onClick={addTestObject}>添加测试对象</Button>
                  <Button onClick={zoomIn}>放大</Button>
                  <Button onClick={zoomOut}>缩小</Button>
                  <Button onClick={exportImage}>导出图片</Button>
                </ControlPanel>
              )}

              {currentEngine && (
                <p>当前引擎: <strong>{currentEngine}</strong></p>
              )}
            </CardContent>
          </Card>
        </Section>

        <Section>
          <Card>
            <CardHeader>
              <CardTitle>游戏素材尺寸预设</CardTitle>
            </CardHeader>
            <CardContent>
              <PresetGrid>
                {Object.entries(GAME_ASSET_PRESETS).map(([key, size]) => (
                  <Card key={key} variant="outlined" padding="sm">
                    <CardContent>
                      <h4>{key.replace(/-/g, ' ').toUpperCase()}</h4>
                      <p>{size.width} × {size.height}</p>
                    </CardContent>
                  </Card>
                ))}
              </PresetGrid>
            </CardContent>
          </Card>
        </Section>

        <Section>
          <Card>
            <CardHeader>
              <CardTitle>架构特性</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                <li>✅ 统一的画布管理器接口</li>
                <li>✅ 多引擎支持（Suika、H5-Editor、Fabric.js）</li>
                <li>✅ 模块化的核心系统（画布、工具、历史、素材）</li>
                <li>✅ TypeScript路径映射和别名配置</li>
                <li>✅ 现代化的UI组件系统</li>
                <li>✅ 游戏素材尺寸预设</li>
                <li>✅ 性能工具和坐标转换工具</li>
              </ul>
            </CardContent>
          </Card>
        </Section>
      </Container>
    </ThemeProvider>
  );
};

export default TestArchitectureApp;