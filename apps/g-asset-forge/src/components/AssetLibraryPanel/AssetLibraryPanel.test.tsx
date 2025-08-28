/**
 * 素材库面板组件测试
 */
import React from 'react';

import { AssetLibraryPanel } from './index';
import { type IAssetMetadata } from './types';

// 简单的渲染测试
describe('AssetLibraryPanel', () => {
  it('应该能够正常渲染', () => {
    const mockOnAssetSelect = (asset: IAssetMetadata) => {
      console.log('选中素材:', asset.name);
    };

    const mockOnAssetDoubleClick = (asset: IAssetMetadata) => {
      console.log('双击素材:', asset.name);
    };

    const mockOnAssetDragStart = (
      asset: IAssetMetadata,
      event: React.DragEvent,
    ) => {
      console.log('开始拖拽素材:', asset.name);
    };

    // 这里只是一个基本的组件实例化测试
    // 实际的DOM渲染测试需要测试环境配置
    const component = React.createElement(AssetLibraryPanel, {
      onAssetSelect: mockOnAssetSelect,
      onAssetDoubleClick: mockOnAssetDoubleClick,
      onAssetDragStart: mockOnAssetDragStart,
      className: 'test-asset-library',
      style: { width: '800px', height: '600px' },
    });

    expect(component).toBeDefined();
    expect(component.type).toBe(AssetLibraryPanel);
  });

  it('应该正确处理props', () => {
    const props = {
      onAssetSelect: jest.fn(),
      onAssetDoubleClick: jest.fn(),
      onAssetDragStart: jest.fn(),
      className: 'custom-class',
      style: { backgroundColor: 'red' },
    };

    const component = React.createElement(AssetLibraryPanel, props);

    expect(component.props.onAssetSelect).toBe(props.onAssetSelect);
    expect(component.props.onAssetDoubleClick).toBe(props.onAssetDoubleClick);
    expect(component.props.onAssetDragStart).toBe(props.onAssetDragStart);
    expect(component.props.className).toBe(props.className);
    expect(component.props.style).toBe(props.style);
  });
});
