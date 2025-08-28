/**
 * 素材上传对话框组件
 */
import React, { useCallback, useState } from 'react';
import { AssetCategory } from './types';

interface IAssetUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    files: File[],
    category: AssetCategory,
    tags: string[],
  ) => Promise<void>;
}

export const AssetUploadDialog: React.FC<IAssetUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<AssetCategory>('ui');
  const [tags, setTags] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        setSelectedFiles(Array.from(files));
      }
    },
    [],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const tagList = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      await onUpload(selectedFiles, category, tagList);

      // 重置表单
      setSelectedFiles([]);
      setTags('');
      onClose();
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, category, tags, onUpload, onClose]);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="asset-upload-dialog-overlay">
      <div className="asset-upload-dialog">
        <div className="dialog-header">
          <h3>上传素材</h3>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isUploading}
          >
            ×
          </button>
        </div>

        <div className="dialog-content">
          {/* 文件选择区域 */}
          <div
            className="file-drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
              id="asset-file-input"
            />
            <label htmlFor="asset-file-input" className="file-input-label">
              <div className="drop-zone-content">
                <div className="upload-icon">📁</div>
                <p>点击选择文件或拖拽文件到此处</p>
                <p className="file-hint">支持 PNG、JPG、GIF、SVG 格式</p>
              </div>
            </label>
          </div>

          {/* 已选择的文件列表 */}
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>已选择的文件 ({selectedFiles.length})</h4>
              <div className="file-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      className="remove-file-button"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 分类选择 */}
          <div className="form-group">
            <label htmlFor="category-select">分类</label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              disabled={isUploading}
            >
              <option value="ui">UI元素</option>
              <option value="icon">图标</option>
              <option value="background">背景</option>
              <option value="decoration">装饰</option>
              <option value="character">角色</option>
              <option value="effect">特效</option>
              <option value="texture">纹理</option>
            </select>
          </div>

          {/* 标签输入 */}
          <div className="form-group">
            <label htmlFor="tags-input">标签（用逗号分隔）</label>
            <input
              id="tags-input"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如：按钮, UI, 游戏"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="dialog-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={isUploading}
          >
            取消
          </button>
          <button
            type="button"
            className="upload-button"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? '上传中...' : `上传 ${selectedFiles.length} 个文件`}
          </button>
        </div>
      </div>
    </div>
  );
};
