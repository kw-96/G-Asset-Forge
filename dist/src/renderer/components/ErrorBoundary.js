import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { style: {
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    background: '#fff',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }, children: _jsxs("div", { style: {
                        textAlign: 'center',
                        maxWidth: '600px'
                    }, children: [_jsx("h1", { style: {
                                color: '#d32f2f',
                                marginBottom: '16px',
                                fontSize: '24px'
                            }, children: "\u5E94\u7528\u7A0B\u5E8F\u51FA\u73B0\u9519\u8BEF" }), _jsx("p", { style: {
                                color: '#666',
                                marginBottom: '20px',
                                fontSize: '16px'
                            }, children: this.state.error?.message || '未知错误' }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("button", { style: {
                                        background: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginRight: '8px'
                                    }, onClick: () => window.location.reload(), children: "\u91CD\u65B0\u52A0\u8F7D" }), _jsx("button", { style: {
                                        background: 'transparent',
                                        color: '#1976d2',
                                        border: '1px solid #1976d2',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }, onClick: () => {
                                        console.log('Error details:', this.state.error);
                                        console.log('Error info:', this.state.errorInfo);
                                    }, children: "\u67E5\u770B\u8BE6\u60C5" })] }), _jsxs("details", { style: { textAlign: 'left' }, children: [_jsx("summary", { style: { cursor: 'pointer', marginBottom: '10px' }, children: "\u9519\u8BEF\u5806\u6808" }), _jsx("pre", { style: {
                                        background: '#f5f5f5',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        overflow: 'auto',
                                        maxHeight: '200px',
                                        border: '1px solid #ddd'
                                    }, children: this.state.error?.stack })] })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map