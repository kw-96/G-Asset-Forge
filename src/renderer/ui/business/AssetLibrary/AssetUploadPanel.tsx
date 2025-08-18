// 素材上传面板组件
import React, { useState, useCallback, useRef } from 'react';
import { 
  type AssetCategoryInfo
} from '../../../logic/managers/assets/AssetLibraryManager';

export interface UploadAssetData {
  success: any;
  metadata: any;
  originalUrl: string;
  previewUrl: any;
  file: File;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  license: 'free' | 'premium' | 'custom';
  author?: string;
}

interface AssetUploadPanelProps {
  categories: AssetCategoryInfo[];
  onUpload: (assets: UploadAssetData[]) => Promise<void>;
  onClose?: () => void;
  maxFileSize?: number; // 最大文件大小（字节）
  allowedTypes?: string[]; // 允许的文件类型
  className?: string;
  style?: React.CSSProperties;
}

export const AssetUploadPanel: React.FC<AssetUploadPanelProps> = ({
  categories,
  onUpload,
  onClose,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'],
  className,
  style
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadData, setUploadData] = useState<Map<string, Partial<UploadAssetData>>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证文件
  const validateFile = useCallback((file: File): string | null => {
    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
      return `不支持的文件类型: ${file.type}`;
    }
    
    // 检查文件大小
    if (file.size > maxFileSize) {
      return `文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB (最大 ${(maxFileSize / 1024 / 1024).toFixed(2)}MB)`;
    }
    
    return null;
  }, [allowedTypes, maxFileSize]);

  // 自动识别分类和标签
  const autoDetectMetadata = useCallback((file: File): { category: string; tags: string[] } => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    let category: string = 'ui';
    const tags: string[] = [];
    
    // 基于文件名识别分类
    if (fileName.includes('background') || fileName.includes('bg') || fileName.includes('backdrop')) {
      category = 'background';
      tags.push('背景');
    } else if (fileName.includes('character') || fileName.includes('char') || fileName.includes('avatar')) {
      category = 'character';
      tags.push('角色');
    } else if (fileName.includes('icon') || fileName.includes('ico')) {
      category = 'icon';
      tags.push('图标');
    } else if (fileName.includes('effect') || fileName.includes('fx') || fileName.includes('particle')) {
      category = 'effect';
      tags.push('特效');
    } else if (fileName.includes('button') || fileName.includes('btn') || fileName.includes('ui')) {
      category = 'ui';
      tags.push('UI');
    }
    
    // 基于文件名识别标签
    if (fileName.includes('game')) tags.push('游戏');
    if (fileName.includes('fantasy') || fileName.includes('magic')) tags.push('魔幻');
    if (fileName.includes('sci-fi') || fileName.includes('scifi') || fileName.includes('space')) tags.push('科幻');
    if (fileName.includes('medieval') || fileName.includes('castle')) tags.push('中世纪');
    if (fileName.includes('modern') || fileName.includes('city')) tags.push('现代');
    if (fileName.includes('pixel') || fileName.includes('8bit')) tags.push('像素');
    if (fileName.includes('cartoon') || fileName.includes('cute')) tags.push('卡通');
    if (fileName.includes('realistic') || fileName.includes('photo')) tags.push('写实');
    
    // 基于文件类型添加标签
    if (fileType === 'image/png') tags.push('PNG');
    if (fileType === 'image/jpeg' || fileType === 'image/jpg') tags.push('JPG');
    if (fileType === 'image/gif') tags.push('GIF');
    if (fileType === 'image/svg+xml') tags.push('SVG');
    
    return { category, tags };
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newErrors = new Map<string, string>();
    const newUploadData = new Map(uploadData);
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.set(file.name, error);
      } else {
        validFiles.push(file);
        
        // 自动识别元数据
        const { category, tags } = autoDetectMetadata(file);
        
        newUploadData.set(file.name, {
          file,
          name: file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
          category,
          tags,
          license: 'custom'
        });
      }
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setUploadData(newUploadData);
    setErrors(newErrors);
  }, [validateFile, autoDetectMetadata, uploadData]);

  // 处理拖拽
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // 更新上传数据
  const updateUploadData = useCallback((fileName: string, updates: Partial<UploadAssetData>) => {
    setUploadData(prev => {
      const newData = new Map(prev);
      const current = newData.get(fileName) || {};
      newData.set(fileName, { ...current, ...updates });
      return newData;
    });
  }, []);

  // 移除文件
  const removeFile = useCallback((fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadData(prev => {
      const newData = new Map(prev);
      newData.delete(fileName);
      return newData;
    });
    setErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(fileName);
      return newErrors;
    });
  }, []);

  // 添加标签
  const addTag = useCallback((fileName: string, tag: string) => {
    const current = uploadData.get(fileName);
    if (current && tag.trim()) {
      const currentTags = current.tags || [];
      if (!currentTags.includes(tag.trim())) {
        updateUploadData(fileName, {
          tags: [...currentTags, tag.trim()]
        });
      }
    }
  }, [uploadData, updateUploadData]);

  // 移除标签
  const removeTag = useCallback((fileName: string, tagToRemove: string) => {
    const current = uploadData.get(fileName);
    if (current) {
      const currentTags = current.tags || [];
      updateUploadData(fileName, {
        tags: currentTags.filter(tag => tag !== tagToRemove)
      });
    }
  }, [uploadData, updateUploadData]);

  // 执行上传
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(new Map());
    
    try {
      const assetsToUpload: UploadAssetData[] = [];
      
      for (const file of selectedFiles) {
        const data = uploadData.get(file.name);
        if (data && data.name && data.category) {
          assetsToUpload.push({
            file,
            name: data.name,
            description: data.description || '',
            category: data.category,
            subcategory: data.subcategory || '',
            tags: data.tags || [],
            license: data.license || 'custom',
            author: data.author || '',
            success: false,
            metadata: {},
            originalUrl: '',
            previewUrl: ''
          });
          
          // 模拟上传进度
          setUploadProgress(prev => new Map(prev).set(file.name, 50));
        }
      }
      
      await onUpload(assetsToUpload);
      
      // 完成上传
      selectedFiles.forEach(file => {
        setUploadProgress(prev => new Map(prev).set(file.name, 100));
      });
      
      // 清理状态
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadData(new Map());
        setUploadProgress(new Map());
        onClose?.();
      }, 1000);
      
    } catch (error) {
      console.error('上传失败:', error);
      setErrors(prev => new Map(prev).set('upload', '上传失败，请重试'));
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, uploadData, onUpload, onClose]);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className} style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxHeight: '80vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          📤 上传素材
        </h4>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedFiles.length > 0 && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                padding: '6px 12px',
                border: 'none',
                backgroundColor: isUploading ? '#6c757d' : '#007bff',
                color: 'white',
                borderRadius: '4px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isUploading ? '上传中...' : `上传 ${selectedFiles.length} 个文件`}
            </button>
          )}
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              关闭
            </button>
          )}
        </div>
      </div>

      {/* 拖拽上传区域 */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          margin: '16px',
          padding: '32px',
          border: `2px dashed ${dragActive ? '#007bff' : '#ddd'}`,
          borderRadius: '8px',
          backgroundColor: dragActive ? '#f0f8ff' : '#f8f9fa',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {dragActive ? '📥' : '📁'}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          {dragActive ? '释放文件以上传' : '拖拽文件到此处或点击选择'}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          支持 PNG、JPG、GIF、WebP、SVG 格式，最大 {(maxFileSize / 1024 / 1024).toFixed(0)}MB
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* 错误信息 */}
      {errors.size > 0 && (
        <div style={{ margin: '0 16px 16px 16px' }}>
          {Array.from(errors.entries()).map(([fileName, error]) => (
            <div key={fileName} style={{
              padding: '8px 12px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              color: '#721c24',
              fontSize: '12px',
              marginBottom: '4px'
            }}>
              <strong>{fileName}:</strong> {error}
            </div>
          ))}
        </div>
      )}

      {/* 文件列表 */}
      {selectedFiles.length > 0 && (
        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px 16px' }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
            待上传文件 ({selectedFiles.length})
          </h5>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedFiles.map(file => {
              const data = uploadData.get(file.name) || {};
              const progress = uploadProgress.get(file.name) || 0;
              
              return (
                <div key={file.name} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa'
                }}>
                  {/* 文件信息 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {formatFileSize(file.size)} • {file.type}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      disabled={isUploading}
                      style={{
                        padding: '4px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#dc3545',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* 上传进度 */}
                  {progress > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          backgroundColor: progress === 100 ? '#28a745' : '#007bff',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                        {progress === 100 ? '上传完成' : `上传中... ${progress}%`}
                      </div>
                    </div>
                  )}

                  {/* 元数据编辑 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
                        素材名称
                      </label>
                      <input
                        type="text"
                        value={data.name || ''}
                        onChange={(e) => updateUploadData(file.name, { name: e.target.value })}
                        disabled={isUploading}
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
                        分类
                      </label>
                      <select
                        value={data.category || 'ui'}
                        onChange={(e) => updateUploadData(file.name, { category: e.target.value as string })}
                        disabled={isUploading}
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
                      描述
                    </label>
                    <textarea
                      value={data.description || ''}
                      onChange={(e) => updateUploadData(file.name, { description: e.target.value })}
                      disabled={isUploading}
                      placeholder="可选：添加素材描述..."
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        fontSize: '11px',
                        resize: 'vertical',
                        minHeight: '40px'
                      }}
                    />
                  </div>

                  {/* 标签管理 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                      标签
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                      {(data.tags || []).map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: '2px 6px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '10px',
                            fontSize: '9px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          {tag}
                          {!isUploading && (
                            <button
                              type="button"
                              onClick={() => removeTag(file.name, tag)}
                              style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '8px',
                                padding: 0
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="输入标签后按回车添加..."
                      disabled={isUploading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            addTag(file.name, input.value.trim());
                            input.value = '';
                          }
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetUploadPanel;