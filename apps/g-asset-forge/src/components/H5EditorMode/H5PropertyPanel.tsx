import './H5PropertyPanel.scss';

import { Button, ColorPicker, Input, Select } from '@g-asset-forge/components';
import { type FC, useEffect, useState } from 'react';

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content: any;
  style: any;
}

interface H5PropertyPanelProps {
  selectedBlock: ContentBlock | null;
  onUpdateBlock: (blockId: string, updates: any) => void;
  onClose: () => void;
}

export const H5PropertyPanel: FC<H5PropertyPanelProps> = ({
  selectedBlock,
  onUpdateBlock,
  onClose,
}) => {
  const [localValues, setLocalValues] = useState<any>({});

  useEffect(() => {
    if (selectedBlock) {
      setLocalValues({
        ...selectedBlock.content,
        ...selectedBlock.style,
      });
    }
  }, [selectedBlock]);

  if (!selectedBlock) {
    return (
      <div className="h5-property-panel empty">
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <div className="empty-text">选择一个内容块来编辑属性</div>
        </div>
      </div>
    );
  }

  const handleValueChange = (key: string, value: any) => {
    const newValues = { ...localValues, [key]: value };
    setLocalValues(newValues);

    // 实时更新
    onUpdateBlock(selectedBlock.id, { [key]: value });
  };

  const renderTextProperties = () => (
    <div className="property-section">
      <div className="section-title">文本属性</div>

      <div className="property-item">
        <label>文本内容</label>
        <textarea
          value={localValues.text || ''}
          onChange={(e) => handleValueChange('text', e.target.value)}
          placeholder="请输入文本内容"
          rows={3}
        />
      </div>

      <div className="property-row">
        <div className="property-item">
          <label>字体大小</label>
          <Input
            type="number"
            value={localValues.fontSize || 16}
            onChange={(e) =>
              handleValueChange('fontSize', parseInt(e.target.value) || 16)
            }
            min={12}
            max={72}
            suffix="px"
          />
        </div>

        <div className="property-item">
          <label>文本颜色</label>
          <ColorPicker
            value={localValues.color || '#333333'}
            onChange={(color) => handleValueChange('color', color)}
          />
        </div>
      </div>

      <div className="property-item">
        <label>对齐方式</label>
        <Select
          value={localValues.textAlign || 'left'}
          onSelect={(value) => handleValueChange('textAlign', value)}
          options={[
            { label: '左对齐', value: 'left' },
            { label: '居中', value: 'center' },
            { label: '右对齐', value: 'right' },
          ]}
        />
      </div>

      <div className="property-row">
        <div className="property-item">
          <label>行高</label>
          <Input
            type="number"
            value={localValues.lineHeight || 1.2}
            onChange={(e) =>
              handleValueChange('lineHeight', parseFloat(e.target.value) || 1.2)
            }
            min={1}
            max={3}
            step={0.1}
          />
        </div>

        <div className="property-item">
          <label>字间距</label>
          <Input
            type="number"
            value={localValues.letterSpacing || 0}
            onChange={(e) =>
              handleValueChange('letterSpacing', parseInt(e.target.value) || 0)
            }
            suffix="px"
          />
        </div>
      </div>
    </div>
  );

  const renderImageProperties = () => (
    <div className="property-section">
      <div className="section-title">图片属性</div>

      <div className="property-item">
        <label>图片地址</label>
        <Input
          value={localValues.src || ''}
          onChange={(e) => handleValueChange('src', e.target.value)}
          placeholder="请输入图片URL或选择本地图片"
        />
        <Button
          onClick={() => {
            // TODO: 实现图片选择功能
            console.log('选择图片');
          }}
          style={{ marginTop: '8px' }}
        >
          选择图片
        </Button>
      </div>

      <div className="property-item">
        <label>替代文本</label>
        <Input
          value={localValues.alt || ''}
          onChange={(e) => handleValueChange('alt', e.target.value)}
          placeholder="图片描述"
        />
      </div>

      <div className="property-row">
        <div className="property-item">
          <label>适应方式</label>
          <Select
            value={localValues.objectFit || 'cover'}
            onSelect={(value) => handleValueChange('objectFit', value)}
            options={[
              { label: '覆盖', value: 'cover' },
              { label: '包含', value: 'contain' },
              { label: '填充', value: 'fill' },
              { label: '缩小', value: 'scale-down' },
              { label: '原始', value: 'none' },
            ]}
          />
        </div>

        <div className="property-item">
          <label>圆角</label>
          <Input
            type="number"
            value={localValues.borderRadius || 0}
            onChange={(e) =>
              handleValueChange('borderRadius', parseInt(e.target.value) || 0)
            }
            min={0}
            max={50}
            suffix="px"
          />
        </div>
      </div>
    </div>
  );

  const renderButtonProperties = () => (
    <div className="property-section">
      <div className="section-title">按钮属性</div>

      <div className="property-item">
        <label>按钮文字</label>
        <Input
          value={localValues.text || ''}
          onChange={(e) => handleValueChange('text', e.target.value)}
          placeholder="按钮文字"
        />
      </div>

      <div className="property-row">
        <div className="property-item">
          <label>背景色</label>
          <ColorPicker
            value={localValues.backgroundColor || '#007AFF'}
            onChange={(color) => handleValueChange('backgroundColor', color)}
          />
        </div>

        <div className="property-item">
          <label>文字颜色</label>
          <ColorPicker
            value={localValues.textColor || '#FFFFFF'}
            onChange={(color) => handleValueChange('textColor', color)}
          />
        </div>
      </div>

      <div className="property-row">
        <div className="property-item">
          <label>圆角</label>
          <Input
            type="number"
            value={localValues.borderRadius || 8}
            onChange={(e) =>
              handleValueChange('borderRadius', parseInt(e.target.value) || 8)
            }
            min={0}
            max={50}
            suffix="px"
          />
        </div>

        <div className="property-item">
          <label>字体大小</label>
          <Input
            type="number"
            value={localValues.fontSize || 16}
            onChange={(e) =>
              handleValueChange('fontSize', parseInt(e.target.value) || 16)
            }
            min={12}
            max={24}
            suffix="px"
          />
        </div>
      </div>

      <div className="property-item">
        <label>链接地址</label>
        <Input
          value={localValues.href || ''}
          onChange={(e) => handleValueChange('href', e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="property-item">
        <label>打开方式</label>
        <Select
          value={localValues.target || '_self'}
          onSelect={(value) => handleValueChange('target', value)}
          options={[
            { label: '当前窗口', value: '_self' },
            { label: '新窗口', value: '_blank' },
          ]}
        />
      </div>
    </div>
  );

  const renderSpacingProperties = () => (
    <div className="property-section">
      <div className="section-title">间距设置</div>

      <div className="property-row">
        <div className="property-item">
          <label>上边距</label>
          <Input
            type="number"
            value={localValues.marginTop || 0}
            onChange={(e) =>
              handleValueChange('marginTop', parseInt(e.target.value) || 0)
            }
            min={0}
            max={100}
            suffix="px"
          />
        </div>

        <div className="property-item">
          <label>下边距</label>
          <Input
            type="number"
            value={localValues.marginBottom || 0}
            onChange={(e) =>
              handleValueChange('marginBottom', parseInt(e.target.value) || 0)
            }
            min={0}
            max={100}
            suffix="px"
          />
        </div>
      </div>

      <div className="property-row">
        <div className="property-item">
          <label>左内边距</label>
          <Input
            type="number"
            value={localValues.paddingLeft || 0}
            onChange={(e) =>
              handleValueChange('paddingLeft', parseInt(e.target.value) || 0)
            }
            min={0}
            max={50}
            suffix="px"
          />
        </div>

        <div className="property-item">
          <label>右内边距</label>
          <Input
            type="number"
            value={localValues.paddingRight || 0}
            onChange={(e) =>
              handleValueChange('paddingRight', parseInt(e.target.value) || 0)
            }
            min={0}
            max={50}
            suffix="px"
          />
        </div>
      </div>

      <div className="property-row">
        <div className="property-item">
          <label>上内边距</label>
          <Input
            type="number"
            value={localValues.paddingTop || 0}
            onChange={(e) =>
              handleValueChange('paddingTop', parseInt(e.target.value) || 0)
            }
            min={0}
            max={50}
            suffix="px"
          />
        </div>

        <div className="property-item">
          <label>下内边距</label>
          <Input
            type="number"
            value={localValues.paddingBottom || 0}
            onChange={(e) =>
              handleValueChange('paddingBottom', parseInt(e.target.value) || 0)
            }
            min={0}
            max={50}
            suffix="px"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h5-property-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="block-type-icon">
            {selectedBlock.type === 'text' && '📝'}
            {selectedBlock.type === 'image' && '🖼️'}
            {selectedBlock.type === 'button' && '🔘'}
          </span>
          <span className="block-type-name">
            {selectedBlock.type === 'text' && '文本块'}
            {selectedBlock.type === 'image' && '图片块'}
            {selectedBlock.type === 'button' && '按钮块'}
          </span>
        </div>

        <Button onClick={onClose}>✕</Button>
      </div>

      <div className="panel-content">
        {selectedBlock.type === 'text' && renderTextProperties()}
        {selectedBlock.type === 'image' && renderImageProperties()}
        {selectedBlock.type === 'button' && renderButtonProperties()}

        {renderSpacingProperties()}
      </div>
    </div>
  );
};
