/**
 * Suika管理器Hook - 管理Suika编辑器与各个管理器的集成
 * @description 提供Suika编辑器与页面、图层、属性管理器的统一集成
 * @author 开发团队
 */

import { useEffect, useState } from 'react';
import type { SuikaEditor } from '../logic/engines/suika';
import { pageManager, layerManager, propertyManager } from '../logic/managers';
import type { Page, Layer, ObjectProperties } from '../logic/managers';

export interface SuikaManagersState {
  pages: Page[];
  layers: Layer[];
  selectedLayerIds: string[];
  currentProperties: ObjectProperties[];
  isInitialized: boolean;
}

export interface SuikaManagersActions {
  // 页面操作
  createPage: (name?: string, switchToNew?: boolean) => Page | null;
  deletePage: (pageId: string) => boolean;
  renamePage: (pageId: string, newName: string) => boolean;
  switchToPage: (pageId: string) => boolean;
  
  // 图层操作
  selectLayers: (layerIds: string[], addToSelection?: boolean) => void;
  clearSelection: () => void;
  toggleLayerVisibility: (layerId: string) => boolean | null;
  toggleLayerLock: (layerId: string) => boolean | null;
  renameLayer: (layerId: string, newName: string) => boolean;
  deleteLayers: (layerIds: string[]) => boolean;
  refreshLayers?: () => void;
  
  // 属性操作
  updateTransform: (objectId: string, transform: any) => void;
  updateFill: (objectId: string, fill: any) => void;
  updateStroke: (objectId: string, stroke: any) => void;
  updateOpacity: (objectId: string, opacity: number) => void;
  updateObjectName: (objectId: string, name: string) => void;
  updateTextContent: (objectId: string, content: string) => void;
  updateTextStyle: (objectId: string, textStyle: any) => void;
  updateCornerRadius: (objectId: string, cornerRadius: number) => void;
}

/**
 * Suika管理器Hook
 * @param suikaEditor Suika编辑器实例
 * @returns 管理器状态和操作方法
 */
export const useSuikaManagers = (suikaEditor: SuikaEditor | null): [SuikaManagersState, SuikaManagersActions] => {
  const [state, setState] = useState<SuikaManagersState>({
    pages: [],
    layers: [],
    selectedLayerIds: [],
    currentProperties: [],
    isInitialized: false,
  });

  // 初始化管理器
  useEffect(() => {
    if (!suikaEditor) {
      setState(prev => ({ ...prev, isInitialized: false }));
      return;
    }

    // 设置Suika编辑器到各个管理器
    pageManager.setSuikaEditor(suikaEditor);
    layerManager.setSuikaEditor(suikaEditor);
    propertyManager.setSuikaEditor(suikaEditor);

    // 初始化状态
    setState({
      pages: pageManager.getPages(),
      layers: layerManager.getLayers(),
      selectedLayerIds: layerManager.getSelectedLayerIds(),
      currentProperties: propertyManager.getCurrentProperties(),
      isInitialized: true,
    });

    // 定期同步状态，确保UI与Suika编辑器保持一致
    const syncInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        pages: pageManager.getPages(),
        layers: layerManager.getLayers(),
        selectedLayerIds: layerManager.getSelectedLayerIds(),
        currentProperties: propertyManager.getCurrentProperties(),
      }));
    }, 1000); // 每秒同步一次

    return () => {
      clearInterval(syncInterval);
      // 清理管理器
      pageManager.setSuikaEditor(null);
      layerManager.setSuikaEditor(null);
      propertyManager.setSuikaEditor(null);
    };
  }, [suikaEditor]);

  // 监听页面变化
  useEffect(() => {
    const handlePageAdded = (page: Page) => {
      setState(prev => ({ ...prev, pages: [...prev.pages, page] }));
    };

    const handlePageRemoved = (pageId: string) => {
      setState(prev => ({ ...prev, pages: prev.pages.filter(p => p.id !== pageId) }));
    };

    const handlePageRenamed = (pageId: string, newName: string) => {
      setState(prev => ({
        ...prev,
        pages: prev.pages.map(p => p.id === pageId ? { ...p, name: newName } : p)
      }));
    };

    const handlePageActivated = (pageId: string) => {
      setState(prev => ({
        ...prev,
        pages: prev.pages.map(p => ({ ...p, isActive: p.id === pageId })),
        layers: layerManager.getLayers(), // 页面切换时更新图层列表
      }));
    };

    pageManager.on('pageAdded', handlePageAdded);
    pageManager.on('pageRemoved', handlePageRemoved);
    pageManager.on('pageRenamed', handlePageRenamed);
    pageManager.on('pageActivated', handlePageActivated);

    return () => {
      pageManager.off('pageAdded', handlePageAdded);
      pageManager.off('pageRemoved', handlePageRemoved);
      pageManager.off('pageRenamed', handlePageRenamed);
      pageManager.off('pageActivated', handlePageActivated);
    };
  }, []);

  // 监听图层变化
  useEffect(() => {
    const handleLayerSelected = (layerIds: string[]) => {
      setState(prev => ({ ...prev, selectedLayerIds: layerIds }));
    };

    const handleLayerVisibilityChanged = () => {
      setState(prev => ({ ...prev, layers: layerManager.getLayers() }));
    };

    const handleLayerLockChanged = () => {
      setState(prev => ({ ...prev, layers: layerManager.getLayers() }));
    };

    const handleLayerRenamed = () => {
      setState(prev => ({ ...prev, layers: layerManager.getLayers() }));
    };

    const handleLayerAdded = () => {
      // 图层添加时，刷新图层列表和属性
      setState(prev => ({ 
        ...prev, 
        layers: layerManager.getLayers(),
        currentProperties: propertyManager.getCurrentProperties()
      }));
    };

    const handleLayerRemoved = () => {
      // 图层删除时，刷新图层列表和属性
      setState(prev => ({ 
        ...prev, 
        layers: layerManager.getLayers(),
        currentProperties: propertyManager.getCurrentProperties()
      }));
    };

    layerManager.on('layerSelected', handleLayerSelected);
    layerManager.on('layerVisibilityChanged', handleLayerVisibilityChanged);
    layerManager.on('layerLockChanged', handleLayerLockChanged);
    layerManager.on('layerRenamed', handleLayerRenamed);
    layerManager.on('layerAdded', handleLayerAdded);
    layerManager.on('layerRemoved', handleLayerRemoved);

    return () => {
      layerManager.off('layerSelected', handleLayerSelected);
      layerManager.off('layerVisibilityChanged', handleLayerVisibilityChanged);
      layerManager.off('layerLockChanged', handleLayerLockChanged);
      layerManager.off('layerRenamed', handleLayerRenamed);
      layerManager.off('layerAdded', handleLayerAdded);
      layerManager.off('layerRemoved', handleLayerRemoved);
    };
  }, []);

  // 监听属性变化
  useEffect(() => {
    const handlePropertiesChanged = (properties: ObjectProperties[]) => {
      setState(prev => ({ ...prev, currentProperties: properties }));
    };

    propertyManager.on('propertiesChanged', handlePropertiesChanged);

    return () => {
      propertyManager.off('propertiesChanged', handlePropertiesChanged);
    };
  }, []);

  // 操作方法
  const actions: SuikaManagersActions = {
    // 页面操作
    createPage: (name?: string, switchToNew: boolean = true) => {
      return pageManager.createPage(name, switchToNew);
    },
    
    deletePage: (pageId: string) => {
      return pageManager.deletePage(pageId);
    },
    
    renamePage: (pageId: string, newName: string) => {
      return pageManager.renamePage(pageId, newName);
    },
    
    switchToPage: (pageId: string) => {
      return pageManager.switchToPage(pageId);
    },

    // 图层操作
    selectLayers: (layerIds: string[], addToSelection: boolean = false) => {
      layerManager.selectLayers(layerIds, addToSelection);
    },
    
    clearSelection: () => {
      layerManager.clearSelection();
    },
    
    toggleLayerVisibility: (layerId: string) => {
      return layerManager.toggleLayerVisibility(layerId);
    },
    
    toggleLayerLock: (layerId: string) => {
      return layerManager.toggleLayerLock(layerId);
    },
    
    renameLayer: (layerId: string, newName: string) => {
      return layerManager.renameLayer(layerId, newName);
    },
    
    deleteLayers: (layerIds: string[]) => {
      return layerManager.deleteLayers(layerIds);
    },
    
    refreshLayers: () => {
      layerManager.refreshLayers();
    },

    // 属性操作
    updateTransform: (objectId: string, transform: any) => {
      propertyManager.updateTransform(objectId, transform);
    },
    
    updateFill: (objectId: string, fill: any) => {
      propertyManager.updateFill(objectId, fill);
    },
    
    updateStroke: (objectId: string, stroke: any) => {
      propertyManager.updateStroke(objectId, stroke);
    },
    
    updateOpacity: (objectId: string, opacity: number) => {
      propertyManager.updateOpacity(objectId, opacity);
    },
    
    updateObjectName: (objectId: string, name: string) => {
      propertyManager.updateObjectName(objectId, name);
    },
    
    updateTextContent: (objectId: string, content: string) => {
      propertyManager.updateTextContent(objectId, content);
    },
    
    updateTextStyle: (objectId: string, textStyle: any) => {
      propertyManager.updateTextStyle(objectId, textStyle);
    },
    
    updateCornerRadius: (objectId: string, cornerRadius: number) => {
      propertyManager.updateCornerRadius(objectId, cornerRadius);
    },
  };

  return [state, actions];
};