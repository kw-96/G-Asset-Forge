// H5编辑器模式面板组件 - 展示H5编辑器的完整功能
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RulerGuides } from '../../../../ui/business/common/RulerGuides';
import { ZoomPanContainer } from '../../../../ui/business/common/ZoomPanContainer';
import { H5EditorCanvas, type H5EditorCanvasRef } from '../adapter/react-adapter';
import { type H5Page } from '../core/h5-editor';
import { type H5Project } from '../core/h5-editor-manager';

interface IH5EditorModePanelProps {
  width?: number;
  height?: number;
  onModeChange?: (mode: 'h5' | 'suika') => void;
  onProjectChange?: (project: H5Project | null) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const H5EditorModePanel: React.FC<IH5EditorModePanelProps> = ({
  width = 375,
  height = 667,
  onModeChange,
  onProjectChange,
  className,
  style
}) => {
  const editorRef = useRef<H5EditorCanvasRef>(null);
  const [currentMode, setCurrentMode] = useState<'h5' | 'suika'>('h5');
  const [currentProject, setCurrentProject] = useState<H5Project | null>(null);
  const [pages, setPagesInfo] = useState<Array<H5Page>>([]);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('mobile-portrait');

  // 获取可用的预设尺寸
  const [availablePresets, setAvailablePresets] = useState<Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    category: string;
  }>>([]);

  // 编辑器准备就绪回调
  const handleEditorReady = useCallback((_editor: any, _manager: any) => {
    console.log('H5编辑器已准备就绪');
    
    // 获取可用预设
    const presets = editorRef.current?.getAvailablePresets() || [];
    setAvailablePresets(presets);

    // 创建默认项目
    const defaultProject = editorRef.current?.createNewProject('新建H5项目', {
      settings: {
        defaultCanvasSize: { width, height },
        mode: 'mobile',
        theme: 'light',
        gridEnabled: true,
        snapToGrid: true
      }
    });

    if (defaultProject) {
      setCurrentProject(defaultProject);
      onProjectChange?.(defaultProject);
    }

    // 更新页面信息
    updatePagesInfo();

    // 启用实时预览
    editorRef.current?.enableRealTimePreview();
    setIsPreviewEnabled(true);
  }, [width, height, onProjectChange]);

  // 更新页面信息
  /**
   * 更新页面信息
   * NOTE: 由于getAllPagesInfo返回的对象与H5Page类型不完全一致，这里需要进行类型转换
   */
  const updatePagesInfo = useCallback(() => {
    const pagesInfo = editorRef.current?.getAllPagesInfo() || [];
    // 将pagesInfo转换为H5Page类型，补全缺失字段
    const normalizedPages: H5Page[] = pagesInfo.map((page: any) => ({
      ...page,
      isCurrentPage: page.isCurrent ?? false,
      components: page.components ?? [],
    }));
    setPagesInfo(normalizedPages);
  }, []);

  // 模式切换回调
  const handleModeChange = useCallback((mode: 'h5' | 'suika') => {
    setCurrentMode(mode); 
    onModeChange?.(mode);
    console.log(`模式已切换到: ${mode}`);
  }, [onModeChange]);

  // 项目变更回调
  const handleProjectChange = useCallback((project: H5Project) => {
    setCurrentProject(project);
    onProjectChange?.(project);
    updatePagesInfo();
  }, [onProjectChange, updatePagesInfo]);

  // 预览更新回调
  const handlePreviewUpdate = useCallback((previewUrl: string) => {
    setPreviewUrl(previewUrl);
  }, []);

  // 画布尺寸变更回调
  const handleCanvasSizeChange = useCallback((size: { width: number; height: number }) => {
    setCanvasSize(size);
    console.log(`画布尺寸已变更: ${size.width}x${size.height}`);
  }, []);

  // 页面变更回调
  const handlePageChange = useCallback((page: H5Page) => {
    console.log(`当前页面已切换: ${page.name}`);
    updatePagesInfo();
  }, [updatePagesInfo]);

  // 切换到Suika模式
  const switchToSuikaMode = useCallback(async () => {
    try {
      await editorRef.current?.switchToSuikaMode();
      console.log('已切换到Suika模式');
    } catch (error) {
      console.error('切换到Suika模式失败:', error);
    }
  }, []);

  // 切换到H5模式
  const switchToH5Mode = useCallback(async () => {
    try {
      await editorRef.current?.switchToH5Mode();
      console.log('已切换到H5模式');
    } catch (error) {
      console.error('切换到H5模式失败:', error);
    }
  }, []);

  // 设置预设尺寸
  const handlePresetChange = useCallback((presetId: string) => {
    try {
      setSelectedPreset(presetId);
      editorRef.current?.setPresetCanvasSize(presetId);
      
      // 更新当前画布尺寸显示
      const newSize = editorRef.current?.getCurrentCanvasSize();
      if (newSize) {
        setCanvasSize(newSize);
      }
    } catch (error) {
      console.error('设置预设尺寸失败:', error);
    }
  }, []);

  // 设置自定义尺寸
  const handleCustomSizeChange = useCallback((width: number, height: number) => {
    try {
      editorRef.current?.setCustomCanvasSize(width, height);
      setCanvasSize({ width, height });
      setSelectedPreset('custom');
    } catch (error) {
      console.error('设置自定义尺寸失败:', error);
    }
  }, []);

  // 创建新页面
  const createNewPage = useCallback((name: string, templateId?: string) => {
    try {
      const newPage = editorRef.current?.createPageWithTemplate(name, templateId);
      if (newPage) {
        console.log(`新页面创建成功: ${name}`);
        updatePagesInfo();
      }
    } catch (error) {
      console.error('创建页面失败:', error);
    }
  }, [updatePagesInfo]);

  // 复制当前页面
  const duplicateCurrentPage = useCallback(() => {
    try {
      const duplicatedPage = editorRef.current?.duplicateCurrentPage();
      if (duplicatedPage) {
        console.log(`页面复制成功: ${duplicatedPage.name}`);
        updatePagesInfo();
      }
    } catch (error) {
      console.error('复制页面失败:', error);
    }
  }, [updatePagesInfo]);

  // 删除页面
  const deletePage = useCallback((pageId: string) => {
    try {
      const success = editorRef.current?.deletePageById(pageId);
      if (success) {
        console.log('页面删除成功');
        updatePagesInfo();
      }
    } catch (error) {
      console.error('删除页面失败:', error);
    }
  }, [updatePagesInfo]);

  // 切换预览
  const togglePreview = useCallback(() => {
    try {
      if (isPreviewEnabled) {
        editorRef.current?.disableRealTimePreview();
        setIsPreviewEnabled(false);
      } else {
        editorRef.current?.enableRealTimePreview();
        setIsPreviewEnabled(true);
      }
    } catch (error) {
      console.error('切换预览失败:', error);
    }
  }, [isPreviewEnabled]);

  // 获取最终效果预览
  const getFinalPreview = useCallback(() => {
    try {
      const finalPreview = editorRef.current?.getFinalEffectPreview({
        format: 'png',
        quality: 1,
        scale: 1,
        includeBackground: true
      });
      
      if (finalPreview) {
        // 在新窗口中显示最终预览
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>最终效果预览</title></head>
              <body style="margin:0;padding:20px;text-align:center;">
                <h2>最终效果预览</h2>
                <img src="${finalPreview}" style="max-width:100%;height:auto;border:1px solid #ddd;" />
              </body>
            </html>
          `);
        }
      }
    } catch (error) {
      console.error('获取最终预览失败:', error);
    }
  }, []);

  // 设置预览更新回调
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setPreviewUpdateCallback(handlePreviewUpdate);
    }
  }, [handlePreviewUpdate]);

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {/* 控制面板 */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
            H5编辑器模式控制面板
          </h3>
          
          {/* 模式切换 */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>当前模式:</label>
            <span style={{ 
              padding: '4px 8px', 
              backgroundColor: currentMode === 'h5' ? '#007bff' : '#6c757d',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {currentMode === 'h5' ? 'H5编辑器' : 'Suika画布'}
            </span>
            <button 
              onClick={currentMode === 'h5' ? switchToSuikaMode : switchToH5Mode}
              style={{ 
                marginLeft: '8px',
                padding: '4px 12px',
                border: '1px solid #007bff',
                backgroundColor: 'white',
                color: '#007bff',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              切换到{currentMode === 'h5' ? 'Suika' : 'H5'}模式
            </button>
          </div>

          {/* 画布尺寸设置 */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>画布尺寸:</label>
            <select 
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              style={{ 
                marginRight: '8px',
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              {availablePresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.width}x{preset.height})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '12px', color: '#666' }}>
              当前: {canvasSize.width}x{canvasSize.height}
            </span>
          </div>

          {/* 自定义尺寸输入 */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>自定义尺寸:</label>
            <input 
              type="number" 
              placeholder="宽度"
              style={{ 
                width: '80px',
                marginRight: '4px',
                padding: '4px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              onChange={(e) => {
                const width = parseInt(e.target.value) || canvasSize.width;
                handleCustomSizeChange(width, canvasSize.height);
              }}
            />
            <span style={{ margin: '0 4px' }}>x</span>
            <input 
              type="number" 
              placeholder="高度"
              style={{ 
                width: '80px',
                marginRight: '8px',
                padding: '4px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              onChange={(e) => {
                const height = parseInt(e.target.value) || canvasSize.height;
                handleCustomSizeChange(canvasSize.width, height);
              }}
            />
          </div>

          {/* 页面管理 */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>页面管理:</label>
            <button 
              onClick={() => createNewPage('新页面')}
              style={{ 
                marginRight: '8px',
                padding: '4px 8px',
                border: '1px solid #28a745',
                backgroundColor: 'white',
                color: '#28a745',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              新建页面
            </button>
            <button 
              onClick={duplicateCurrentPage}
              style={{ 
                marginRight: '8px',
                padding: '4px 8px',
                border: '1px solid #ffc107',
                backgroundColor: 'white',
                color: '#ffc107',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              复制页面
            </button>
            <span style={{ fontSize: '12px', color: '#666' }}>
              共 {pages.length} 个页面
            </span>
          </div>

          {/* 预览控制 */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>预览控制:</label>
            <button 
              onClick={togglePreview}
              style={{ 
                marginRight: '8px',
                padding: '4px 8px',
                border: '1px solid #17a2b8',
                backgroundColor: isPreviewEnabled ? '#17a2b8' : 'white',
                color: isPreviewEnabled ? 'white' : '#17a2b8',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isPreviewEnabled ? '禁用' : '启用'}实时预览
            </button>
            <button 
              onClick={getFinalPreview}
              style={{ 
                padding: '4px 8px',
                border: '1px solid #6f42c1',
                backgroundColor: 'white',
                color: '#6f42c1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              查看最终效果
            </button>
          </div>
        </div>

        {/* 页面列表 */}
        {pages.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>页面列表:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {pages.map(page => (
                <div 
                  key={page.id}
                  style={{
                    padding: '8px',
                    border: page.isCurrentPage ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: page.isCurrentPage ? '#e3f2fd' : 'white',
                    fontSize: '12px',
                    minWidth: '120px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{page.name}</div>
                  <div style={{ color: '#666' }}>
                    {page.width}x{page.height}
                  </div>
                  <div style={{ color: '#666' }}>
                    {page.components.length} 个组件
                  </div>
                  {!page.isCurrentPage && pages.length > 1 && (
                    <button 
                      onClick={() => deletePage(page.id)}
                      style={{ 
                        marginTop: '4px',
                        padding: '2px 6px',
                        border: '1px solid #dc3545',
                        backgroundColor: 'white',
                        color: '#dc3545',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* H5编辑器画布 */}
      <ZoomPanContainer 
        className="h5-mode-zoom" 
        enableShortcuts
        initialGridSize={1}
        initialShowGrid={true}
        initialShowRuler={true}
      >
        <H5EditorCanvas
          ref={editorRef}
          width={canvasSize.width}
          height={canvasSize.height}
          mode="mobile"
          enablePreview={true}
          enableMultiPage={true}
          enableComponentLibrary={true}
          enableTemplateSystem={true}
          onReady={handleEditorReady}
          onModeChange={handleModeChange}
          onProjectLoad={handleProjectChange}
          onProjectSave={handleProjectChange}
          onCanvasSizeChange={handleCanvasSizeChange}
          onPageChange={handlePageChange}
          onPreviewUpdate={handlePreviewUpdate}
          onError={(error) => console.error('H5编辑器错误:', error)}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}
        />
        <RulerGuides />
      </ZoomPanContainer>

      {/* 状态信息 */}
      <div style={{ 
        padding: '12px 16px', 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
        fontSize: '12px',
        color: '#666'
      }}>
        <div>项目: {currentProject?.name || '未加载'}</div>
        <div>模式: {currentMode}</div>
        <div>画布: {canvasSize.width}x{canvasSize.height}</div>
        <div>预览: {isPreviewEnabled ? '已启用' : '已禁用'}</div>
        {previewUrl && <div>预览URL: 已生成</div>}
      </div>
    </div>
  );
};

export default H5EditorModePanel;