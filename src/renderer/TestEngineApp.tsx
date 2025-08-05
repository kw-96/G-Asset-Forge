// 临时的引擎测试应用
import React from 'react';
import { EngineTest } from './components/EngineTest';

const TestEngineApp: React.FC = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#f5f5f5',
      overflow: 'auto'
    }}>
      <EngineTest />
    </div>
  );
};

export default TestEngineApp;