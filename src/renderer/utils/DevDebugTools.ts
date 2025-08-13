// 轻量级调试工具实现，满足调用方最小需求
export interface DebugReport {
  summary: {
    totalStateUpdates: number;
    totalComponents: number;
    totalWarnings: number;
    criticalWarnings: number;
    performanceIssues: number;
  };
  recommendations: string[];
  performanceMetrics: Array<{
    componentName: string;
    renderCount: number;
    averageRenderTime: number;
    memoryUsage: number;
    isPerformanceIssue: boolean;
  }>;
  recentStateUpdates: Array<{
    id: string;
    timestamp: number;
    component: string;
    action: string;
    renderCount: number;
  }>;
  recentWarnings: Array<{
    id: string;
    timestamp: number;
    component: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    renderCount: number;
    suggestions: string[];
  }>;
}

class DevDebugToolsImpl {
  private enabled = false;
  private logs: any[] = [];

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  clearLogs() {
    this.logs = [];
  }

  recordPerformanceMetrics(componentName: string, renderTime: number) {
    if (!this.enabled) return;
    this.logs.push({
      type: 'perf',
      componentName,
      renderTime,
      timestamp: Date.now(),
    });
  }

  generateDebugReport(): DebugReport {
    // 生成一个稳定的占位报告，供 UI 展示
    return {
      summary: {
        totalStateUpdates: 0,
        totalComponents: 0,
        totalWarnings: 0,
        criticalWarnings: 0,
        performanceIssues: 0,
      },
      recommendations: [],
      performanceMetrics: [],
      recentStateUpdates: [],
      recentWarnings: [],
    };
  }
}

export const devDebugTools = new DevDebugToolsImpl();


