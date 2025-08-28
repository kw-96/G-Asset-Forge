// 移动端预览
import './MobilePreview.scss';

// 使用 emoji 图标替代缺失的图标组件
import { type FC, useState } from 'react';

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content: any;
  style: any;
}

interface MobilePreviewProps {
  contentBlocks: ContentBlock[];
}

export const MobilePreview: FC<MobilePreviewProps> = ({ contentBlocks }) => {
  const [deviceType, setDeviceType] = useState<'iphone' | 'android'>('iphone');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleShare = () => {
    // 分享预览链接
    console.log('分享预览链接');
  };

  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            key={block.id}
            className="preview-text-block"
            style={{
              fontSize: block.content.fontSize,
              color: block.content.color,
              textAlign: block.content.textAlign,
              ...block.style,
            }}
          >
            {block.content.text}
          </div>
        );

      case 'image':
        return (
          <div
            key={block.id}
            className="preview-image-block"
            style={block.style}
          >
            {block.content.src ? (
              <img
                src={block.content.src}
                alt={block.content.alt}
                style={{
                  width: block.content.width,
                  height: block.content.height,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div className="preview-image-placeholder">
                <div className="placeholder-icon">📷</div>
              </div>
            )}
          </div>
        );

      case 'button':
        return (
          <div
            key={block.id}
            className="preview-button-block"
            style={block.style}
          >
            <button
              type="button"
              style={{
                backgroundColor: block.content.backgroundColor,
                color: block.content.textColor,
                borderRadius: block.content.borderRadius,
                border: 'none',
                padding: '12px 24px',
                fontSize: '16px',
                width: '100%',
              }}
            >
              {block.content.text}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mobile-preview">
      {/* 预览头部 */}
      <div className="preview-header">
        <div className="header-title">
          📱
          <span>移动端预览</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="刷新预览"
          >
            🔄
          </button>

          <button type="button" onClick={handleShare} title="分享预览">
            📤
          </button>
        </div>
      </div>

      {/* 设备选择器 */}
      <div className="device-selector">
        <button
          type="button"
          className={`device-button ${deviceType === 'iphone' ? 'active' : ''}`}
          onClick={() => setDeviceType('iphone')}
        >
          iPhone
        </button>
        <button
          type="button"
          className={`device-button ${
            deviceType === 'android' ? 'active' : ''
          }`}
          onClick={() => setDeviceType('android')}
        >
          Android
        </button>
      </div>

      {/* 手机模拟器 */}
      <div className={`phone-simulator ${deviceType}`}>
        {/* 手机外壳 */}
        <div className="phone-frame">
          {/* 状态栏 */}
          <div className="status-bar">
            <div className="status-left">
              <span className="time">9:41</span>
            </div>
            <div className="status-right">
              <div className="signal-bars">
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
              </div>
              <div className="wifi-icon">📶</div>
              <div className="battery">🔋</div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="phone-content">
            {contentBlocks.length === 0 ? (
              <div className="preview-empty">
                <div className="empty-icon">📱</div>
                <div className="empty-text">预览内容将在这里显示</div>
              </div>
            ) : (
              <div className="preview-content">
                {contentBlocks.map(renderContentBlock)}
              </div>
            )}
          </div>

          {/* 底部指示器 (iPhone) */}
          {deviceType === 'iphone' && <div className="home-indicator" />}
        </div>
      </div>

      {/* 预览信息 */}
      <div className="preview-info">
        <div className="info-item">
          <span className="info-label">分辨率:</span>
          <span className="info-value">375 × 667</span>
        </div>
        <div className="info-item">
          <span className="info-label">内容块:</span>
          <span className="info-value">{contentBlocks.length} 个</span>
        </div>
        <div className="info-item">
          <span className="info-label">设备:</span>
          <span className="info-value">
            {deviceType === 'iphone' ? 'iPhone' : 'Android'}
          </span>
        </div>
      </div>
    </div>
  );
};
