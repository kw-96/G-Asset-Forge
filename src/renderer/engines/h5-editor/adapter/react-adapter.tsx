// H5-Editor的React适配器 - 增强版本
import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { H5Editor, type IH5EditorOptions, type IH5Page, type IH5Component, type IH5Template } from '../core/h5-editor';
import { H5EditorManager, type IH5EditorManagerOptions, type IH5Project } from '../core/h5-editor-manager';
import { type IBackgroundSettings, type IBackgroundPreset } from '../background/BackgroundManager';
import { type IImageExportOptions, type IImageExportResult } from '../export/ImageExportEngine';

export interface IH5EditorCanvasProps {
  width: number;
  height: number;
  mode?: 'mobile' | 'desktop';
  enablePreview?: boolean;
  enableMultiPage?: boolean;
  enableComponentLibrary?: boolean;
  enableTemplateSystem?: boolean;
  managerOptions?: IH5EditorManagerOptions;
  
  // 事件回调
  onReady?: (editor: H5Editor, manager: H5EditorManager) => void;
  onPageChange?: (page: IH5Page) => void;
  onComponentAdd?: (component: IH5Component) => void;
  onComponentUpdate?: (component: IH5Component) => void;
  onComponentRemove?: (componentId: string) => void;
  onBackgroundChange?: (background: IH5Page['background']) => void;
  onCanvasSizeChange?: (size: { width: number; height: number }) => void;
  onTemplateLoad?: (template: IH5Template) => void;
  onExportStart?: () => void;
  onExportComplete?: (result: { format: string; dataUrl: string; size: number }) => void;
  onExportError?: (error: Error) => void;
  onPreviewUpdate?: (previewUrl: string) => void;
  onModeChange?: (mode: 'h5' | 'suika') => void;
  onProjectLoad?: (project: IH5Project) => void;
  onProjectSave?: (project: IH5Project) => void;
  onPerformanceWarning?: (info: any) => void;
  onError?: (error: Error) => void;
  
  className?: string;
  style?: React.CSSProperties;
}

export interface IH5EditorCanvasRef {
  // 编辑器访问
  getEditor: () => H5Editor | null;
  getManager: () => H5EditorManager | null;
  
  // 基础操作
  render: () => void;
  destroy: () => void;
  
  // 导出功能
  exportAsImage: (format?: 'png' | 'jpg', quality?: number, scale?: number) => string;
  getExportPreview: (format?: 'png' | 'jpg', quality?: number, maxSize?: number) => string;
  
  // 页面管理
  createPage: (name: string, options?: Partial<IH5Page>) => IH5Page | null;
  deletePage: (pageId: string) => boolean;
  setCurrentPage: (pageId: string) => void;
  getAllPages: () => IH5Page[];
  
  // 组件管理
  addComponent: (component: IH5Component) => void;
  addComponentFromLibrary: (libraryItemId: string, position?: { x: number; y: number }) => IH5Component | null;
  updateComponent: (componentId: string, updates: Partial<IH5Component>) => void;
  removeComponent: (componentId: string) => void;
  
  // 背景设置
  setPageBackground: (background: IH5Page['background']) => void;
  setCanvasSize: (width: number, height: number) => void;
  
  // 模板系统
  loadTemplate: (templateId: string) => boolean;
  saveAsTemplate: (name: string, category?: string) => IH5Template | null;
  getTemplates: () => IH5Template[];
  
  // 项目管理
  createNewProject: (name: string, options?: Partial<IH5Project>) => IH5Project | null;
  loadProject: (projectData: IH5Project) => Promise<void>;
  saveCurrentProject: () => Promise<IH5Project | null>;
  
  // 撤销重做
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // 模式切换
  switchToSuikaMode: () => Promise<void>;
  switchToH5Mode: () => Promise<H5Editor>;
  enterH5Mode: () => Promise<H5Editor>;
  exitH5Mode: () => Promise<void>;
  getCurrentMode: () => 'h5' | 'suika';

  // 自定义画布尺寸
  setCustomCanvasSize: (width: number, height: number) => void;
  getCurrentCanvasSize: () => { width: number; height: number };
  setPresetCanvasSize: (preset: string, customSize?: { width: number; height: number }) => void;
  getAvailablePresets: () => Array<{ id: string; name: string; width: number; height: number; category: string }>;

  // 实时预览功能
  enableRealTimePreview: () => void;
  disableRealTimePreview: () => void;
  getRealTimePreviewUrl: () => string;
  updateRealTimePreview: () => void;
  getFinalEffectPreview: (options?: any) => string;
  setPreviewUpdateCallback: (callback: (previewUrl: string) => void) => void;

  // 增强页面管理
  createPageWithTemplate: (name: string, templateId?: string, options?: Partial<IH5Page>) => IH5Page | null;
  duplicateCurrentPage: (newName?: string) => IH5Page | null;
  deletePageById: (pageId: string) => boolean;
  getAllPagesInfo: () => Array<any>;
  reorderPages: (pageIds: string[]) => boolean;

  // 背景设置功能
  setColorBackground: (color: string) => void;
  setGradientBackground: (gradient: any) => void;
  setImageBackground: (imageUrl: string, options?: any) => void;
  uploadImageBackground: (file: File) => Promise<string>;
  applyBackgroundPreset: (presetId: string) => boolean;
  createCustomBackgroundPreset: (name: string, category?: string, description?: string, tags?: string[]) => IBackgroundPreset | null;
  getAllBackgroundPresets: () => IBackgroundPreset[];
  getBackgroundPresetsByCategory: (category: string) => IBackgroundPreset[];
  searchBackgroundPresets: (query: string) => IBackgroundPreset[];
  getBackgroundCategories: () => string[];
  getCurrentBackground: () => IBackgroundSettings | null;
  getBackgroundPreviewUrl: () => string;
  setBackgroundPreviewCallback: (callback: (previewUrl: string) => void) => void;

  // 图片导出功能
  exportImage: (options?: Partial<IImageExportOptions>) => Promise<IImageExportResult>;
  exportImageAsFile: (filename: string, options?: Partial<IImageExportOptions>) => Promise<File | null>;
  exportMultipleFormats: (formats: Array<{ format: 'png' | 'jpg' | 'webp'; quality?: number; scale?: number }>) => Promise<IImageExportResult[]>;
  getExportRecommendedSettings: (purpose: 'web' | 'print' | 'social' | 'icon') => Partial<IImageExportOptions>;
  getSupportedExportFormats: () => Array<{ format: string; name: string; extensions: string[]; supportsTransparency: boolean }>;
  cancelImageExport: () => void;
  setImageExportProgressCallback: (callback: (progress: any) => void) => void;
  setImageExportCompleteCallback: (callback: (result: IImageExportResult) => void) => void;
  setImageExportErrorCallback: (callback: (error: Error) => void) => void;
  
  // 预览功能
  togglePreview: (visible: boolean) => void;
  getPreviewDataUrl: () => string;
  
  // 工具方法
  getPerformanceInfo: () => any;
  getManagerInfo: () => any;
}

export const H5EditorCanvas = forwardRef<IH5EditorCanvasRef, IH5EditorCanvasProps>(
  ({ 
    width, 
    height, 
    mode = 'mobile',
    enablePreview = true,
    enableMultiPage = true,
    enableComponentLibrary = true,
    enableTemplateSystem = true,
    managerOptions = {},
    onReady, 
    onPageChange,
    onComponentAdd,
    onComponentUpdate,
    onComponentRemove,
    onBackgroundChange,
    onCanvasSizeChange,
    onTemplateLoad,
    onExportStart,
    onExportComplete,
    onExportError,
    onPreviewUpdate,
    onModeChange,
    onProjectLoad,
    onProjectSave,
    onPerformanceWarning,
    onError,
    className, 
    style 
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<H5Editor | null>(null);
    const managerRef = useRef<H5EditorManager | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // 初始化管理器
    useEffect(() => {
      if (!managerRef.current) {
        managerRef.current = new H5EditorManager(managerOptions);
        
        // 绑定管理器事件
        if (onModeChange) {
          managerRef.current.on('modeChange', onModeChange);
        }
        if (onProjectLoad) {
          managerRef.current.on('projectLoad', onProjectLoad);
        }
        if (onProjectSave) {
          managerRef.current.on('projectSave', onProjectSave);
        }
        if (onPerformanceWarning) {
          managerRef.current.on('performanceWarning', onPerformanceWarning);
        }
        if (onError) {
          managerRef.current.on('error', onError);
        }
      }

      return () => {
        if (managerRef.current) {
          managerRef.current.destroy();
          managerRef.current = null;
        }
      };
    }, [managerOptions, onModeChange, onProjectLoad, onProjectSave, onPerformanceWarning, onError]);

    // 初始化编辑器
    useEffect(() => {
      if (!containerRef.current || !managerRef.current || isInitialized) return;

      const initializeEditor = async () => {
        try {
          const options: IH5EditorOptions = {
            containerElement: containerRef.current!,
            width,
            height,
            mode,
            enablePreview,
            enableMultiPage,
            enableComponentLibrary,
            enableTemplateSystem
          };

          const editor = await managerRef.current!.initializeH5Editor(containerRef.current!, options);
          editorRef.current = editor;

          // 绑定编辑器事件
          bindEditorEvents(editor);

          setIsInitialized(true);

          // 通知父组件编辑器已准备就绪
          if (onReady) {
            onReady(editor, managerRef.current!);
          }
        } catch (error) {
          console.error('Failed to initialize H5Editor:', error);
          if (onError) {
            onError(error as Error);
          }
        }
      };

      initializeEditor();
    }, [width, height, mode, enablePreview, enableMultiPage, enableComponentLibrary, enableTemplateSystem, isInitialized]);

    // 绑定编辑器事件
    const bindEditorEvents = useCallback((editor: H5Editor) => {
      if (onPageChange) {
        editor.on('pageChange', onPageChange);
      }
      if (onComponentAdd) {
        editor.on('componentAdd', onComponentAdd);
      }
      if (onComponentUpdate) {
        editor.on('componentUpdate', onComponentUpdate);
      }
      if (onComponentRemove) {
        editor.on('componentRemove', onComponentRemove);
      }
      if (onBackgroundChange) {
        editor.on('backgroundChange', onBackgroundChange);
      }
      if (onCanvasSizeChange) {
        editor.on('canvasSizeChange', onCanvasSizeChange);
      }
      if (onTemplateLoad) {
        editor.on('templateLoad', onTemplateLoad);
      }
      if (onExportStart) {
        editor.on('exportStart', onExportStart);
      }
      if (onExportComplete) {
        editor.on('exportComplete', onExportComplete);
      }
      if (onExportError) {
        editor.on('exportError', onExportError);
      }
      if (onPreviewUpdate) {
        editor.on('previewUpdate', onPreviewUpdate);
      }
    }, [
      onPageChange, onComponentAdd, onComponentUpdate, onComponentRemove,
      onBackgroundChange, onCanvasSizeChange, onTemplateLoad,
      onExportStart, onExportComplete, onExportError, onPreviewUpdate
    ]);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      // 编辑器访问
      getEditor: () => editorRef.current,
      getManager: () => managerRef.current,
      
      // 基础操作
      render: () => editorRef.current?.render(),
      destroy: () => {
        if (managerRef.current) {
          managerRef.current.destroy();
        }
        setIsInitialized(false);
      },
      
      // 导出功能
      exportAsImage: (format = 'png', quality = 1, scale = 1) => {
        return editorRef.current?.exportAsImage(format, quality, scale) || '';
      },
      getExportPreview: (format = 'png', quality = 0.8, maxSize = 200) => {
        return editorRef.current?.getExportPreview(format, quality, maxSize) || '';
      },
      
      // 页面管理
      createPage: (name: string, options?: Partial<IH5Page>) => {
        return editorRef.current?.createPage(name, options) || null;
      },
      deletePage: (pageId: string) => {
        return editorRef.current?.deletePage(pageId) || false;
      },
      setCurrentPage: (pageId: string) => {
        editorRef.current?.setCurrentPage(pageId);
      },
      getAllPages: () => {
        return editorRef.current?.getAllPages() || [];
      },
      
      // 组件管理
      addComponent: (component: IH5Component) => {
        editorRef.current?.addComponent(component);
      },
      addComponentFromLibrary: (libraryItemId: string, position?: { x: number; y: number }) => {
        return editorRef.current?.addComponentFromLibrary(libraryItemId, position) || null;
      },
      updateComponent: (componentId: string, updates: Partial<IH5Component>) => {
        editorRef.current?.updateComponent(componentId, updates);
      },
      removeComponent: (componentId: string) => {
        editorRef.current?.removeComponent(componentId);
      },
      
      // 背景设置
      setPageBackground: (background: IH5Page['background']) => {
        editorRef.current?.setPageBackground(background);
      },
      setCanvasSize: (width: number, height: number) => {
        editorRef.current?.setCanvasSize(width, height);
      },
      
      // 模板系统
      loadTemplate: (templateId: string) => {
        return editorRef.current?.loadTemplate(templateId) || false;
      },
      saveAsTemplate: (name: string, category = '自定义') => {
        return editorRef.current?.saveAsTemplate(name, category) || null;
      },
      getTemplates: () => {
        return editorRef.current?.getTemplates() || [];
      },
      
      // 项目管理
      createNewProject: (name: string, options?: Partial<IH5Project>) => {
        return managerRef.current?.createNewProject(name, options) || null;
      },
      loadProject: async (projectData: IH5Project) => {
        if (managerRef.current) {
          await managerRef.current.loadProject(projectData);
        }
      },
      saveCurrentProject: async () => {
        return managerRef.current?.saveCurrentProject() || null;
      },
      
      // 撤销重做
      undo: () => {
        return managerRef.current?.undo() || false;
      },
      redo: () => {
        return managerRef.current?.redo() || false;
      },
      canUndo: () => {
        return managerRef.current?.canUndo() || false;
      },
      canRedo: () => {
        return managerRef.current?.canRedo() || false;
      },
      
      // 模式切换
      switchToSuikaMode: async () => {
        if (managerRef.current) {
          await managerRef.current.switchToSuikaMode();
          setIsInitialized(false);
        }
      },
      switchToH5Mode: async () => {
        if (managerRef.current && containerRef.current) {
          const options: IH5EditorOptions = {
            containerElement: containerRef.current,
            width,
            height,
            mode,
            enablePreview,
            enableMultiPage,
            enableComponentLibrary,
            enableTemplateSystem
          };
          const editor = await managerRef.current.switchToH5Mode(containerRef.current, options);
          editorRef.current = editor;
          bindEditorEvents(editor);
          setIsInitialized(true);
          return editor;
        }
        throw new Error('Cannot switch to H5 mode: missing manager or container');
      },
      enterH5Mode: async () => {
        if (managerRef.current && containerRef.current) {
          const options: IH5EditorOptions = {
            containerElement: containerRef.current,
            width,
            height,
            mode,
            enablePreview,
            enableMultiPage,
            enableComponentLibrary,
            enableTemplateSystem
          };
          const editor = await managerRef.current.enterH5Mode(containerRef.current, options);
          editorRef.current = editor;
          bindEditorEvents(editor);
          setIsInitialized(true);
          return editor;
        }
        throw new Error('Cannot enter H5 mode: missing manager or container');
      },
      exitH5Mode: async () => {
        if (managerRef.current) {
          await managerRef.current.exitH5Mode();
          setIsInitialized(false);
        }
      },
      getCurrentMode: () => {
        return managerRef.current?.getCurrentMode() || 'h5';
      },

      // 自定义画布尺寸
      setCustomCanvasSize: (width: number, height: number) => {
        managerRef.current?.setCustomCanvasSize(width, height);
      },
      getCurrentCanvasSize: () => {
        return managerRef.current?.getCurrentCanvasSize() || { width: 375, height: 667 };
      },
      setPresetCanvasSize: (preset: string, customSize?: { width: number; height: number }) => {
        managerRef.current?.setPresetCanvasSize(preset as any, customSize);
      },
      getAvailablePresets: () => {
        return managerRef.current?.getAvailablePresets() || [];
      },

      // 实时预览功能
      enableRealTimePreview: () => {
        managerRef.current?.enableRealTimePreview();
      },
      disableRealTimePreview: () => {
        managerRef.current?.disableRealTimePreview();
      },
      getRealTimePreviewUrl: () => {
        return managerRef.current?.getRealTimePreviewUrl() || '';
      },
      updateRealTimePreview: () => {
        managerRef.current?.updateRealTimePreview();
      },
      getFinalEffectPreview: (options?: any) => {
        return managerRef.current?.getFinalEffectPreview(options) || '';
      },
      setPreviewUpdateCallback: (callback: (previewUrl: string) => void) => {
        managerRef.current?.setPreviewUpdateCallback(callback);
      },

      // 增强页面管理
      createPageWithTemplate: (name: string, templateId?: string, options?: Partial<IH5Page>) => {
        return managerRef.current?.createPageWithTemplate(name, templateId, options) || null;
      },
      duplicateCurrentPage: (newName?: string) => {
        return managerRef.current?.duplicateCurrentPage(newName) || null;
      },
      deletePageById: (pageId: string) => {
        return managerRef.current?.deletePageById(pageId) || false;
      },
      getAllPagesInfo: () => {
        return managerRef.current?.getAllPagesInfo() || [];
      },
      reorderPages: (pageIds: string[]) => {
        return managerRef.current?.reorderPages(pageIds) || false;
      },

      // 背景设置功能
      setColorBackground: (color: string) => {
        managerRef.current?.setColorBackground(color);
      },
      setGradientBackground: (gradient: any) => {
        managerRef.current?.setGradientBackground(gradient);
      },
      setImageBackground: (imageUrl: string, options?: any) => {
        managerRef.current?.setImageBackground(imageUrl, options);
      },
      uploadImageBackground: async (file: File) => {
        if (!managerRef.current) {
          throw new Error('Manager not initialized');
        }
        return await managerRef.current.uploadImageBackground(file);
      },
      applyBackgroundPreset: (presetId: string) => {
        return managerRef.current?.applyBackgroundPreset(presetId) || false;
      },
      createCustomBackgroundPreset: (name: string, category?: string, description?: string, tags?: string[]) => {
        return managerRef.current?.createCustomBackgroundPreset(name, category || '自定义', description || '', tags || []) || null;
      },
      getAllBackgroundPresets: () => {
        return managerRef.current?.getAllBackgroundPresets() || [];
      },
      getBackgroundPresetsByCategory: (category: string) => {
        return managerRef.current?.getBackgroundPresetsByCategory(category) || [];
      },
      searchBackgroundPresets: (query: string) => {
        return managerRef.current?.searchBackgroundPresets(query) || [];
      },
      getBackgroundCategories: () => {
        return managerRef.current?.getBackgroundCategories() || [];
      },
      getCurrentBackground: () => {
        return managerRef.current?.getCurrentBackground() || null;
      },
      getBackgroundPreviewUrl: () => {
        return managerRef.current?.getBackgroundPreviewUrl() || '';
      },
      setBackgroundPreviewCallback: (callback: (previewUrl: string) => void) => {
        managerRef.current?.setBackgroundPreviewCallback(callback);
      },

      // 图片导出功能
      exportImage: async (options?: Partial<IImageExportOptions>) => {
        if (!managerRef.current) {
          throw new Error('Manager not initialized');
        }
        return await managerRef.current.exportImage(options);
      },
      exportImageAsFile: async (filename: string, options?: Partial<IImageExportOptions>) => {
        if (!managerRef.current) {
          throw new Error('Manager not initialized');
        }
        return await managerRef.current.exportImageAsFile(filename, options);
      },
      exportMultipleFormats: async (formats: Array<{ format: 'png' | 'jpg' | 'webp'; quality?: number; scale?: number }>) => {
        if (!managerRef.current) {
          throw new Error('Manager not initialized');
        }
        return await managerRef.current.exportMultipleFormats(formats);
      },
      getExportRecommendedSettings: (purpose: 'web' | 'print' | 'social' | 'icon') => {
        if (!managerRef.current) {
          return {};
        }
        return managerRef.current.getExportRecommendedSettings(purpose);
      },
      getSupportedExportFormats: () => {
        return managerRef.current?.getSupportedExportFormats() || [];
      },
      cancelImageExport: () => {
        managerRef.current?.cancelImageExport();
      },
      setImageExportProgressCallback: (callback: (progress: any) => void) => {
        managerRef.current?.setImageExportProgressCallback(callback);
      },
      setImageExportCompleteCallback: (callback: (result: IImageExportResult) => void) => {
        managerRef.current?.setImageExportCompleteCallback(callback);
      },
      setImageExportErrorCallback: (callback: (error: Error) => void) => {
        managerRef.current?.setImageExportErrorCallback(callback);
      },
      
      // 预览功能
      togglePreview: (visible: boolean) => {
        editorRef.current?.togglePreview(visible);
      },
      getPreviewDataUrl: () => {
        return editorRef.current?.getPreviewDataUrl() || '';
      },
      
      // 工具方法
      getPerformanceInfo: () => {
        return editorRef.current?.getPerformanceInfo() || {};
      },
      getManagerInfo: () => {
        return managerRef.current?.getManagerInfo() || {};
      }
    }), [width, height, mode, enablePreview, enableMultiPage, enableComponentLibrary, enableTemplateSystem, bindEditorEvents]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #ddd',
          backgroundColor: '#f5f5f5',
          ...style
        }}
      >
        {!isInitialized && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#666',
              fontSize: '14px'
            }}
          >
            正在初始化H5编辑器...
          </div>
        )}
      </div>
    );
  }
);

H5EditorCanvas.displayName = 'H5EditorCanvas';

// 别名导出，用于向后兼容
export const H5EditorReactAdapter = H5EditorCanvas;
