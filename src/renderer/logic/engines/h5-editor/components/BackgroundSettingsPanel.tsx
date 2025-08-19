// H5编辑器背景设置面板组件
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BackgroundManager, type BackgroundSettings, type BackgroundPreset } from '../background/BackgroundManager';

interface IBackgroundSettingsPanelProps {
  onBackgroundChange?: (background: BackgroundSettings) => void;
  onPreviewUpdate?: (previewUrl: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const BackgroundSettingsPanel: React.FC<IBackgroundSettingsPanelProps> = ({
  onBackgroundChange,
  onPreviewUpdate,
  className,
  style
}) => {
  const backgroundManagerRef = useRef<BackgroundManager | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'color' | 'gradient' | 'image' | 'presets'>('color');
  const [currentBackground, setCurrentBackground] = useState<BackgroundSettings | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [presets, setPresets] = useState<BackgroundPreset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('纯色');
  const [categories, setCategories] = useState<string[]>([]);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  // 颜色背景状态
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  
  // 渐变背景状态
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientAngle, setGradientAngle] = useState(0);
  const [gradientStops, setGradientStops] = useState([
    { offset: 0, color: '#ff0000' },
    { offset: 1, color: '#0000ff' }
  ]);
  
  // 图片背景状态
  const [imageFit, setImageFit] = useState<'cover' | 'contain' | 'fill' | 'repeat' | 'center'>('cover');
  const [imageOpacity, setImageOpacity] = useState(1);
  const [imageBlur, setImageBlur] = useState(0);
  const [imageBrightness, setImageBrightness] = useState(1);
  const [imageContrast, setImageContrast] = useState(1);
  const [imageSaturation, setImageSaturation] = useState(1);

  // 初始化背景管理器
  useEffect(() => {
    if (!backgroundManagerRef.current) {
      backgroundManagerRef.current = new BackgroundManager();
      
      // 绑定事件
      backgroundManagerRef.current.on('backgroundChange', (background) => {
        setCurrentBackground(background);
        onBackgroundChange?.(background);
      });
      
      backgroundManagerRef.current.on('previewUpdate', (url) => {
        setPreviewUrl(url);
        onPreviewUpdate?.(url);
      });
      
      backgroundManagerRef.current.on('error', (error) => {
        console.error('背景管理器错误:', error);
      });
      
      // 加载预设和分类
      const allPresets = backgroundManagerRef.current.getAllPresets();
      setPresets(allPresets);
      
      const allCategories = backgroundManagerRef.current.getCategories();
      setCategories(allCategories);
      
      if (allCategories.length > 0) {
        setSelectedCategory(allCategories[0] || '纯色');
      }
    }

    return () => {
      backgroundManagerRef.current?.destroy();
    };
  }, [onBackgroundChange, onPreviewUpdate]);

  // 同步 aria-selected（避免静态扫描将 JSX 表达式判为无效值）
  useEffect(() => {
    ['color', 'gradient', 'image', 'presets'].forEach((key) => {
      const el = tabRefs.current[key];
      if (el) {
        el.setAttribute('aria-selected', key === activeTab ? 'true' : 'false');
      }
    });
  }, [activeTab]);

  // 设置纯色背景
  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
    backgroundManagerRef.current?.setColorBackground(color);
  }, []);

  // 设置渐变背景
  const handleGradientChange = useCallback(() => {
    if (!backgroundManagerRef.current) return;
    
    const gradientConfig: any = {
      gradientType,
      stops: gradientStops
    };

    if (gradientType === 'linear') {
      gradientConfig.angle = gradientAngle;
    } else {
      gradientConfig.centerX = 0.5;
      gradientConfig.centerY = 0.5;
      gradientConfig.radius = 0.8;
    }

    backgroundManagerRef.current.setGradientBackground(gradientConfig);
  }, [gradientType, gradientAngle, gradientStops]);

  // 更新渐变色标
  const updateGradientStop = useCallback((index: number, field: 'offset' | 'color', value: number | string) => {
    const newStops = [...gradientStops];
    if (newStops[index]) {
      if (field === 'offset') {
        newStops[index].offset = value as number;
      } else {
        newStops[index].color = value as string;
      }
      setGradientStops(newStops);
    }
  }, [gradientStops]);

  // 添加渐变色标
  const addGradientStop = useCallback(() => {
    let newOffset = 0.5;
    if (gradientStops.length > 0) {
      const lastStop = gradientStops[gradientStops.length - 1];
      const firstStop = gradientStops[0];
      if (lastStop && firstStop) {
        newOffset = (lastStop.offset + firstStop.offset) / 2;
      }
    }
    setGradientStops([...gradientStops, { offset: newOffset, color: '#888888' }]);
  }, [gradientStops]);

  // 删除渐变色标
  const removeGradientStop = useCallback((index: number) => {
    if (gradientStops.length > 2) {
      const newStops = gradientStops.filter((_, i) => i !== index);
      setGradientStops(newStops);
    }
  }, [gradientStops]);

  // 上传图片背景
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !backgroundManagerRef.current) return;

    try {
      await backgroundManagerRef.current.uploadImageBackground(file);
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请检查文件格式');
    }
  }, []);

  // 更新图片背景设置
  const handleImageSettingsChange = useCallback(() => {
    if (!backgroundManagerRef.current || !currentBackground || currentBackground.type !== 'image') return;
    
    const imageBackground = currentBackground as any;
    if (imageBackground.url) {
      backgroundManagerRef.current.setImageBackground(imageBackground.url, {
        fit: imageFit,
        opacity: imageOpacity,
        blur: imageBlur,
        brightness: imageBrightness,
        contrast: imageContrast,
        saturation: imageSaturation
      });
    }
  }, [currentBackground, imageFit, imageOpacity, imageBlur, imageBrightness, imageContrast, imageSaturation]);

  // 应用预设
  const handlePresetApply = useCallback((presetId: string) => {
    backgroundManagerRef.current?.applyPreset(presetId);
  }, []);

  // 过滤预设
  const filteredPresets = presets.filter(preset => preset.category === selectedCategory);

  return (
    <div className={className} style={{ padding: '16px', ...style }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>
        背景设置
      </h3>

      {/* 预览区域 */}
      {previewUrl && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>预览</div>
          <div style={{
            width: '200px',
            height: '120px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundImage: `url(${previewUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        </div>
      )}

      {/* 标签页 */}
      <div style={{ marginBottom: '16px' }}>
        <div role="tablist" aria-label="背景设置选项" style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
          {[
            { key: 'color', label: '纯色' },
            { key: 'gradient', label: '渐变' },
            { key: 'image', label: '图片' },
            { key: 'presets', label: '预设' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              role="tab"
              aria-controls={`panel-${tab.key}`}
              id={`tab-${tab.key}`}
              title={`切换到${tab.label}选项卡`}
              ref={(el) => { tabRefs.current[tab.key] = el; }}
              style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab.key ? '2px solid #007bff' : '2px solid transparent',
                color: activeTab === tab.key ? '#007bff' : '#666',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 纯色设置 */}
      {activeTab === 'color' && (
        <div id="panel-color" role="tabpanel" aria-labelledby="tab-color">
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="bg-color-input" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              选择颜色
            </label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              id="bg-color-input"
              aria-label="选择背景颜色"
              style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          {/* 常用颜色 */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>常用颜色</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
              {[
                '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
                '#f0f0f0', '#808080', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'
              ].map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  type="button"
                  title={`选择颜色 ${color}`}
                  aria-label={`选择颜色 ${color}`}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color,
                    border: selectedColor === color ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 渐变设置 */}
      {activeTab === 'gradient' && (
        <div id="panel-gradient" role="tabpanel" aria-labelledby="tab-gradient">
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="gradient-type-select" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              渐变类型
            </label>
            <select
              value={gradientType}
              onChange={(e) => setGradientType(e.target.value as 'linear' | 'radial')}
              id="gradient-type-select"
              aria-label="渐变类型"
              style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="linear">线性渐变</option>
              <option value="radial">径向渐变</option>
            </select>
          </div>

          {gradientType === 'linear' && (
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="gradient-angle-range" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                角度: {gradientAngle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={gradientAngle}
                onChange={(e) => setGradientAngle(Number(e.target.value))}
                id="gradient-angle-range"
                aria-label="渐变角度"
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>渐变色标</span>
              <button
                onClick={addGradientStop}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #007bff',
                  backgroundColor: 'white',
                  color: '#007bff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                aria-label="添加色标"
              >
                添加
              </button>
            </div>
            
            {gradientStops.map((stop, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                  aria-label={`第 ${index + 1} 个色标颜色`}
                  style={{ width: '40px', height: '30px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stop.offset}
                  onChange={(e) => updateGradientStop(index, 'offset', Number(e.target.value))}
                  aria-label={`第 ${index + 1} 个色标位置`}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '12px', minWidth: '30px' }}>{Math.round(stop.offset * 100)}%</span>
                {gradientStops.length > 2 && (
                  <button
                    onClick={() => removeGradientStop(index)}
                    style={{
                      padding: '4px',
                      border: '1px solid #dc3545',
                      backgroundColor: 'white',
                      color: '#dc3545',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    aria-label={`删除第 ${index + 1} 个色标`}
                    title={`删除第 ${index + 1} 个色标`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

            <button
            onClick={handleGradientChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #007bff',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
              aria-label="应用渐变"
          >
            应用渐变
          </button>
        </div>
      )}

      {/* 图片设置 */}
      {activeTab === 'image' && (
        <div id="panel-image" role="tabpanel" aria-labelledby="tab-image">
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px dashed #007bff',
                backgroundColor: 'transparent',
                color: '#007bff',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              aria-label="点击上传图片"
              title="点击上传图片"
            >
              点击上传图片
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              aria-hidden="true"
              tabIndex={-1}
              style={{ display: 'none' }}
            />
          </div>

          {currentBackground?.type === 'image' && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="image-fit-select" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  适应方式
                </label>
                <select
                  value={imageFit}
                  onChange={(e) => setImageFit(e.target.value as any)}
                  id="image-fit-select"
                  aria-label="图片适应方式"
                  title="图片适应方式"
                  style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="cover">覆盖</option>
                  <option value="contain">包含</option>
                  <option value="fill">填充</option>
                  <option value="repeat">重复</option>
                  <option value="center">居中</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="image-opacity-range" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  透明度: {Math.round(imageOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={imageOpacity}
                  onChange={(e) => setImageOpacity(Number(e.target.value))}
                  id="image-opacity-range"
                  aria-label="图片透明度"
                  title="图片透明度"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="image-blur-range" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  模糊: {imageBlur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={imageBlur}
                  onChange={(e) => setImageBlur(Number(e.target.value))}
                  id="image-blur-range"
                  aria-label="图片模糊"
                  title="图片模糊"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="image-brightness-range" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  亮度: {Math.round(imageBrightness * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={imageBrightness}
                  onChange={(e) => setImageBrightness(Number(e.target.value))}
                  id="image-brightness-range"
                  aria-label="图片亮度"
                  title="图片亮度"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="image-contrast-range" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  对比度: {Math.round(imageContrast * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={imageContrast}
                  onChange={(e) => setImageContrast(Number(e.target.value))}
                  id="image-contrast-range"
                  aria-label="图片对比度"
                  title="图片对比度"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="image-saturation-range" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  饱和度: {Math.round(imageSaturation * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={imageSaturation}
                  onChange={(e) => setImageSaturation(Number(e.target.value))}
                  id="image-saturation-range"
                  aria-label="图片饱和度"
                  title="图片饱和度"
                  style={{ width: '100%' }}
                />
              </div>

              <button
                onClick={handleImageSettingsChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #007bff',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                aria-label="应用图片设置"
              >
                应用设置
              </button>
            </>
          )}
        </div>
      )}

      {/* 预设设置 */}
      {activeTab === 'presets' && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              分类
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {filteredPresets.map(preset => (
              <div
                key={preset.id}
                onClick={() => handlePresetApply(preset.id)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  backgroundColor: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{
                  width: '100%',
                  height: '60px',
                  marginBottom: '4px',
                  borderRadius: '4px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {preset.thumbnail ? (
                    <img 
                      src={preset.thumbnail} 
                      alt={preset.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    '预览'
                  )}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{preset.name}</div>
                {preset.description && (
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                    {preset.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSettingsPanel;