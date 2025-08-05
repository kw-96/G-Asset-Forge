import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Result
            status="error"
            title="应用程序出现错误"
            subTitle={this.state.error?.message || '未知错误'}
            extra={[
              <Button 
                type="primary" 
                key="reload"
                onClick={() => window.location.reload()}
              >
                重新加载
              </Button>,
              <Button 
                key="details"
                onClick={() => {
                  console.log('Error details:', this.state.error);
                  console.log('Error info:', this.state.errorInfo);
                }}
              >
                查看详情
              </Button>
            ]}
          >
            <div style={{ textAlign: 'left', maxWidth: '600px' }}>
              <h4>错误详情：</h4>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.error?.stack}
              </pre>
            </div>
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;