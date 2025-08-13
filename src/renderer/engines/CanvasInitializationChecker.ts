export interface InitializationIssue {
  type: 'error' | 'warning';
  component: string;
  message: string;
}

export class CanvasInitializationChecker {
  static async performCheck(): Promise<{
    isValid: boolean;
    issues: InitializationIssue[];
    recommendations: string[];
  }> {
    const issues: InitializationIssue[] = [];
    const recommendations: string[] = [];

    if (typeof document === 'undefined') {
      issues.push({ type: 'error', component: 'environment', message: 'Document not available' });
    }

    if (typeof window === 'undefined') {
      issues.push({ type: 'error', component: 'environment', message: 'Window not available' });
    }

    if (issues.length === 0) {
      recommendations.push('系统准备就绪');
    }

    return { isValid: issues.length === 0, issues, recommendations };
  }
}


