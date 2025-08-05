import { Component, ErrorInfo, ReactNode } from 'react';

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

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          background: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <h1 style={{ 
              color: '#d32f2f', 
              marginBottom: '16px',
              fontSize: '24px' 
            }}>
              应用程序出现错误
            </h1>
            
            <p style={{ 
              color: '#666', 
              marginBottom: '20px',
              fontSize: '16px'
            }}>
              {this.state.error?.message || '未知错误'}
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <button 
                style={{
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
                onClick={() => window.location.reload()}
              >
                重新加载
              </button>
              
              <button 
                style={{
                  background: 'transparent',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  console.log('Error details:', this.state.error);
                  console.log('Error info:', this.state.errorInfo);
                }}
              >
                查看详情
              </button>
            </div>

            <details style={{ textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                错误堆栈
              </summary>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px',
                border: '1px solid #ddd'
              }}>
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
