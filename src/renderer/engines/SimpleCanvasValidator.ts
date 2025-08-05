/**
 * Simple Canvas Validator
 * Provides basic validation without complex type dependencies
 */
export class SimpleCanvasValidator {
  /**
   * Check if canvas is supported
   */
  static isCanvasSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch {
      return false;
    }
  }

  /**
   * Check if WebGL is supported
   */
  static isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        canvas.getContext('webgl') || 
        canvas.getContext('experimental-webgl')
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if Performance API is available
   */
  static isPerformanceAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && typeof performance.now === 'function';
  }

  /**
   * Check if Memory API is available
   */
  static isMemoryAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && 'memory' in performance;
  }

  /**
   * Check if Fabric.js is available
   */
  static async isFabricJSAvailable(): Promise<boolean> {
    try {
      const fabricModule = await import('fabric');
      return !!(fabricModule as any).fabric;
    } catch {
      return false;
    }
  }

  /**
   * Get basic system info
   */
  static getBasicSystemInfo(): {
    canvas: boolean;
    webgl: boolean;
    performance: boolean;
    memory: boolean;
    userAgent: string;
  } {
    return {
      canvas: this.isCanvasSupported(),
      webgl: this.isWebGLSupported(),
      performance: this.isPerformanceAPIAvailable(),
      memory: this.isMemoryAPIAvailable(),
      userAgent: navigator.userAgent
    };
  }

  /**
   * Validate basic requirements
   */
  static async validateBasicRequirements(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check canvas support
    if (!this.isCanvasSupported()) {
      issues.push('Canvas API is not supported');
    }

    // Check Fabric.js
    if (!(await this.isFabricJSAvailable())) {
      issues.push('Fabric.js is not available');
    }

    // Check DOM readiness
    if (document.readyState === 'loading') {
      issues.push('DOM is still loading');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate simple report
   */
  static async generateSimpleReport(): Promise<string> {
    const systemInfo = this.getBasicSystemInfo();
    const validation = await this.validateBasicRequirements();

    const lines: string[] = [];
    
    lines.push('=== Simple Canvas Validation Report ===');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    lines.push('System Support:');
    lines.push(`- Canvas: ${systemInfo.canvas ? '✓' : '✗'}`);
    lines.push(`- WebGL: ${systemInfo.webgl ? '✓' : '✗'}`);
    lines.push(`- Performance API: ${systemInfo.performance ? '✓' : '✗'}`);
    lines.push(`- Memory API: ${systemInfo.memory ? '✓' : '✗'}`);
    lines.push('');

    lines.push(`Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    
    if (validation.issues.length > 0) {
      lines.push('');
      lines.push('Issues:');
      validation.issues.forEach((issue, index) => {
        lines.push(`${index + 1}. ${issue}`);
      });
    }

    return lines.join('\n');
  }
}