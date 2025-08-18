export interface ErrorAnalysisResult {
  pattern: string | null;
  category: 'performance_error' | 'react_error' | 'javascript_error' | 'network_error' | 'unknown';
  description?: string;
  isRecoverable: boolean;
  confidence: number; // 0-1
  relatedComponents: string[];
  suggestions: string[];
}

class ErrorAnalyzerImpl {
  analyzeError(error: Error, _errorInfo?: any): ErrorAnalysisResult {
    const message = error?.message || '';
    const isRenderError = /render|jsx|component/i.test(message);
    const category = isRenderError ? 'react_error' : 'javascript_error';
    return {
      pattern: isRenderError ? 'render_error' : 'unknown',
      category,
      description: message,
      isRecoverable: true,
      confidence: 0.6,
      relatedComponents: [],
      suggestions: ['检查最近的组件改动', '在关键区域添加错误边界'],
    };
  }
}

export const errorAnalyzer = new ErrorAnalyzerImpl();


