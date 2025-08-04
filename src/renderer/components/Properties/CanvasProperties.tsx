import React from 'react';
import { Form, InputNumber, ColorPicker, Button, Space, Select } from 'antd';
import { useCanvasStore } from '../../stores/canvasStore';

const { Option } = Select;

const CanvasProperties: React.FC = () => {
  const {
    width,
    height,
    backgroundColor,
    zoom,
    setCanvasSize,
    setBackgroundColor,
    setZoom,
    fitToScreen
  } = useCanvasStore();

  const [form] = Form.useForm();

  const handleSizeChange = (field: 'width' | 'height', value: number | null) => {
    if (value && value > 0) {
      const newWidth = field === 'width' ? value : width;
      const newHeight = field === 'height' ? value : height;
      setCanvasSize(newWidth, newHeight);
    }
  };

  const handleBackgroundColorChange = (color: any) => {
    const hexColor = typeof color === 'string' ? color : color.toHexString();
    setBackgroundColor(hexColor);
  };

  const handleZoomChange = (value: number | null) => {
    if (value && value > 0) {
      setZoom(value / 100);
    }
  };

  const handlePresetSize = (preset: string) => {
    const presets: Record<string, [number, number]> = {
      'mobile-portrait': [375, 667],
      'mobile-landscape': [667, 375],
      'tablet-portrait': [768, 1024],
      'tablet-landscape': [1024, 768],
      'desktop': [1920, 1080],
      'square': [1080, 1080],
      'instagram-post': [1080, 1080],
      'instagram-story': [1080, 1920],
      'facebook-cover': [1200, 630],
      'twitter-header': [1500, 500]
    };

    const [newWidth, newHeight] = presets[preset] || [width, height];
    setCanvasSize(newWidth, newHeight);
    form.setFieldsValue({ width: newWidth, height: newHeight });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      size="small"
      initialValues={{
        width,
        height,
        backgroundColor,
        zoom: Math.round(zoom * 100)
      }}
    >
      <Form.Item label="预设尺寸">
        <Select
          placeholder="选择预设尺寸"
          onChange={handlePresetSize}
          style={{ width: '100%' }}
        >
          <Option value="mobile-portrait">手机竖屏 (375×667)</Option>
          <Option value="mobile-landscape">手机横屏 (667×375)</Option>
          <Option value="tablet-portrait">平板竖屏 (768×1024)</Option>
          <Option value="tablet-landscape">平板横屏 (1024×768)</Option>
          <Option value="desktop">桌面 (1920×1080)</Option>
          <Option value="square">正方形 (1080×1080)</Option>
          <Option value="instagram-post">Instagram帖子 (1080×1080)</Option>
          <Option value="instagram-story">Instagram故事 (1080×1920)</Option>
          <Option value="facebook-cover">Facebook封面 (1200×630)</Option>
          <Option value="twitter-header">Twitter头图 (1500×500)</Option>
        </Select>
      </Form.Item>

      <Space.Compact style={{ width: '100%' }}>
        <Form.Item label="宽度" name="width" style={{ flex: 1, marginRight: 8 }}>
          <InputNumber
            min={1}
            max={10000}
            value={width}
            onChange={(value) => handleSizeChange('width', value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="高度" name="height" style={{ flex: 1 }}>
          <InputNumber
            min={1}
            max={10000}
            value={height}
            onChange={(value) => handleSizeChange('height', value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Space.Compact>

      <Form.Item label="背景颜色" name="backgroundColor">
        <ColorPicker
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
          showText
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item label="缩放 (%)" name="zoom">
        <InputNumber
          min={10}
          max={500}
          value={Math.round(zoom * 100)}
          onChange={handleZoomChange}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%' }}>
          <Button onClick={fitToScreen} size="small">
            适应屏幕
          </Button>
          <Button onClick={() => setZoom(1)} size="small">
            100%
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CanvasProperties;