import React, { useEffect, useState } from 'react';
import { Button, Alert, Spin, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface CanvasInitializationCheckerProps {
  onReady: () => void;
  onRetry: () => void;
}

const CanvasInitializationChecker: React.FC<CanvasInitializationCheckerProps> = ({ 
  onReady, 
  onRetry 
}) => {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const checkInitialization = async () => {
      try {
        // 检查Electron API是否可用
        if (typeof window === 'undefined' || !window.electronAPI) {
          throw new Error('Electron API不可用');
        }

        // 检查健康状态
        const healthCheck = await window.electronAPI.healthCheck();
        // 检查healthCheck的格式，可能是直接返回结果而不是包装对象
        const isHealthy = healthCheck && (healthCheck.success === true || healthCheck.hasOwnProperty('timestamp'));
        if (!isHealthy) {
          throw new Error('健康检查失败');
        }

        // 检查基本的API功能
        const version = await window.electronAPI.app.getVersion();
        if (!version) {
          throw new Error('无法获取应用版本');
        }

        setStatus('ready');
        onReady();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        setError(errorMessage);
        setStatus('error');
        console.error('初始化检查失败:', err);
      }
    };

    checkInitialization();

    // 如果5秒后仍未完成检查，显示错误
    const timeout = setTimeout(() => {
      if (status === 'checking') {
        setError('初始化超时，请检查网络连接或重新启动应用');
        setStatus('error');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [attempts, onReady, status]);

  const handleRetry = () => {
    setAttempts(prev => prev + 1);
    setStatus('checking');
    setError(null);
    onRetry();
  };

  if (status === 'checking') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px'
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>
          正在检查应用初始化状态...
        </Text>
        <Text style={{ marginTop: 8, color: '#888' }}>
          尝试次数: {attempts + 1}
        </Text>
      </div>
    );
  }

  if (status === 'ready') {
    return null; // 不显示任何内容，让主应用渲染
  }

  // 错误状态
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px'
    }}>
      <Alert
        message="应用初始化检查失败"
        description={error || '初始化过程中发生未知错误'}
        type="error"
        showIcon
        style={{ marginBottom: '20px', maxWidth: '400px' }}
      />
      <Button 
        type="primary"
        icon={<ReloadOutlined />}
        onClick={handleRetry}
        size="large"
      >
        重试初始化
      </Button>
      <Text style={{ marginTop: 16, color: '#888', textAlign: 'center' }}>
        如果问题持续存在，请检查控制台日志或联系技术支持
      </Text>
    </div>
  );
};

export default CanvasInitializationChecker;