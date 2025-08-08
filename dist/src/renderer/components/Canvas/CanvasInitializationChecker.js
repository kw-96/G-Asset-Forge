import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, Alert, Spin, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
const { Text } = Typography;
const CanvasInitializationChecker = ({ onReady, onRetry }) => {
    const [status, setStatus] = useState('checking');
    const [error, setError] = useState(null);
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
            }
            catch (err) {
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
        return (_jsxs("div", { style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '40px'
            }, children: [_jsx(Spin, { size: "large" }), _jsx(Text, { style: { marginTop: 16, fontSize: 16 }, children: "\u6B63\u5728\u68C0\u67E5\u5E94\u7528\u521D\u59CB\u5316\u72B6\u6001..." }), _jsxs(Text, { style: { marginTop: 8, color: '#888' }, children: ["\u5C1D\u8BD5\u6B21\u6570: ", attempts + 1] })] }));
    }
    if (status === 'ready') {
        return null; // 不显示任何内容，让主应用渲染
    }
    // 错误状态
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '40px'
        }, children: [_jsx(Alert, { message: "\u5E94\u7528\u521D\u59CB\u5316\u68C0\u67E5\u5931\u8D25", description: error || '初始化过程中发生未知错误', type: "error", showIcon: true, style: { marginBottom: '20px', maxWidth: '400px' } }), _jsx(Button, { type: "primary", icon: _jsx(ReloadOutlined, {}), onClick: handleRetry, size: "large", children: "\u91CD\u8BD5\u521D\u59CB\u5316" }), _jsx(Text, { style: { marginTop: 16, color: '#888', textAlign: 'center' }, children: "\u5982\u679C\u95EE\u9898\u6301\u7EED\u5B58\u5728\uFF0C\u8BF7\u68C0\u67E5\u63A7\u5236\u53F0\u65E5\u5FD7\u6216\u8054\u7CFB\u6280\u672F\u652F\u6301" })] }));
};
export default CanvasInitializationChecker;
//# sourceMappingURL=CanvasInitializationChecker.js.map