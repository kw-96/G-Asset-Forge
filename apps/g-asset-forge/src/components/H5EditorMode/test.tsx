// 简单的测试文件，验证 H5EditorMode 组件能正常导入和使用
import React from 'react';
import { H5EditorMode } from './H5EditorMode';

// 测试组件能否正常导入
const TestComponent = () => {
  const handleModeSwitch = (mode: 'design' | 'h5') => {
    console.log('模式切换到:', mode);
  };

  return (
    <div>
      <H5EditorMode onModeSwitch={handleModeSwitch} />
    </div>
  );
};

export default TestComponent;
