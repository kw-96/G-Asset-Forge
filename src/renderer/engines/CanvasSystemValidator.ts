import { CanvasInitializationChecker } from './CanvasInitializationChecker';
import { canvasInitializer } from './CanvasInitializer';

/**
 * Canvas System Validator
 * Provides validation and diagnostic tools for the canvas system
 */
export class CanvasSystemValidator {
  /**
   * Validate canvas system readiness
   */
  static async validateSystem(): Promise<{
    isReady: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check initialization requirements
      const checkResult = await CanvasInitializationChecker.performCheck();

      if (!checkResult.isValid) {
        issues.push('Canvas initialization check failed');
        checkResult.issues.forEach(issue => {
          if (issue.type === 'error') {
            issues.push(`${issue.component}: ${issue.message}`);
          }
        });

        recommendations.push(...checkResult.recommendations);
      }

      // Check if fabric.js is available
      if (typeof window !== 'undefined') {
        try {
          const fabricModule = await import('fabric');
          const fabric = (fabricModule as any).fabric;
          if (!fabric || !fabric.Canvas) {
            issues.push('Fabric.js is not properly loaded');
            recommendations.push('Ensure Fabric.js is included in your build');
          }
        } catch (error) {
          issues.push('Failed to import Fabric.js');
          recommendations.push('Check Fabric.js installation and imports');
        }
      }

      // Check DOM readiness
      if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
          issues.push('DOM is still loading');
          recommendations.push('Wait for DOM to be ready before initializing canvas');
        }
      } else {
        issues.push('Document is not available');
        recommendations.push('Ensure code runs in browser environment');
      }

      return {
        isReady: issues.length === 0,
        issues,
        recommendations
      };

    } catch (error) {
      issues.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      recommendations.push('Check console for detailed error information');

      return {
        isReady: false,
        issues,
        recommendations
      };
    }
  }

  /**
   * Test canvas creation
   */
  static async testCanvasCreation(containerId: string = 'test-canvas-container'): Promise<{
    success: boolean;
    error?: string;
    canvasId?: string;
  }> {
    try {
      // Create a temporary container if it doesn't exist
      let container = document.getElementById(containerId);
      let createdContainer = false;

      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.width = '800px';
        container.style.height = '600px';
        container.style.position = 'absolute';
        container.style.left = '-9999px'; // Hide off-screen
        document.body.appendChild(container);
        createdContainer = true;
      }

      // Try to initialize canvas system
      await canvasInitializer.initializeCanvasSystem({
        containerId,
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        enablePerformanceMonitoring: false,
        enableHealthChecking: false
      });

      // Clean up
      canvasInitializer.destroyCanvasSystem(containerId);

      if (createdContainer && container.parentNode) {
        container.parentNode.removeChild(container);
      }

      return {
        success: true,
        canvasId: containerId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get system diagnostics
   */
  static async getDiagnostics(): Promise<{
    environment: {
      userAgent: string;
      platform: string;
      language: string;
      cookieEnabled: boolean;
      onLine: boolean;
    };
    performance: {
      memoryAvailable: boolean;
      memoryUsage?: number;
      timing: boolean;
    };
    canvas: {
      supported: boolean;
      webglSupported: boolean;
      maxTextureSize?: number;
    };
    fabricjs: {
      available: boolean;
      version?: string;
    };
  }> {
    const diagnostics: {
      environment: {
        userAgent: string;
        platform: string;
        language: string;
        cookieEnabled: boolean;
        onLine: boolean;
      };
      performance: {
        memoryAvailable: boolean;
        memoryUsage?: number;
        timing: boolean;
      };
      canvas: {
        supported: boolean;
        webglSupported: boolean;
        maxTextureSize?: number;
      };
      fabricjs: {
        available: boolean;
        version?: string;
      };
    } = {
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      performance: {
        memoryAvailable: false,
        timing: typeof performance !== 'undefined' && !!performance.now
      },
      canvas: {
        supported: false,
        webglSupported: false
      },
      fabricjs: {
        available: false
      }
    };

    // Check memory API
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      diagnostics.performance.memoryAvailable = true;
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize) {
        diagnostics.performance.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
      }
    }

    // Check Canvas support
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      diagnostics.canvas.supported = !!ctx;
    } catch (error) {
      // Canvas not supported
    }

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      diagnostics.canvas.webglSupported = !!gl;

      if (gl && 'getParameter' in gl && 'MAX_TEXTURE_SIZE' in gl) {
        const webglContext = gl as WebGLRenderingContext;
        const maxTextureSize = webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE);
        if (typeof maxTextureSize === 'number') {
          diagnostics.canvas.maxTextureSize = maxTextureSize;
        }
      }
    } catch (error) {
      // WebGL not supported
    }

    // Check Fabric.js
    try {
      const fabricModule = await import('fabric');
      const fabric = (fabricModule as any).fabric;
      diagnostics.fabricjs.available = !!fabric;
      if (fabric && (fabric as any).version) {
        diagnostics.fabricjs.version = (fabric as any).version;
      }
    } catch (error) {
      // Fabric.js not available
    }

    return diagnostics;
  }

  /**
   * Generate diagnostic report
   */
  static async generateDiagnosticReport(): Promise<string> {
    const validation = await this.validateSystem();
    const diagnostics = await this.getDiagnostics();
    const testResult = await this.testCanvasCreation();

    const lines: string[] = [];

    lines.push('=== Canvas System Diagnostic Report ===');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // System Status
    lines.push('System Status:');
    lines.push(`- Ready: ${validation.isReady ? '✓' : '✗'}`);
    lines.push(`- Canvas Creation Test: ${testResult.success ? '✓' : '✗'}`);
    lines.push('');

    // Environment
    lines.push('Environment:');
    lines.push(`- User Agent: ${diagnostics.environment.userAgent}`);
    lines.push(`- Platform: ${diagnostics.environment.platform}`);
    lines.push(`- Language: ${diagnostics.environment.language}`);
    lines.push(`- Online: ${diagnostics.environment.onLine ? '✓' : '✗'}`);
    lines.push('');

    // Canvas Support
    lines.push('Canvas Support:');
    lines.push(`- 2D Canvas: ${diagnostics.canvas.supported ? '✓' : '✗'}`);
    lines.push(`- WebGL: ${diagnostics.canvas.webglSupported ? '✓' : '✗'}`);
    if (diagnostics.canvas.maxTextureSize) {
      lines.push(`- Max Texture Size: ${diagnostics.canvas.maxTextureSize}px`);
    }
    lines.push('');

    // Performance
    lines.push('Performance:');
    lines.push(`- High Resolution Timing: ${diagnostics.performance.timing ? '✓' : '✗'}`);
    lines.push(`- Memory API: ${diagnostics.performance.memoryAvailable ? '✓' : '✗'}`);
    if (diagnostics.performance.memoryUsage) {
      lines.push(`- Current Memory Usage: ${diagnostics.performance.memoryUsage.toFixed(1)}MB`);
    }
    lines.push('');

    // Fabric.js
    lines.push('Fabric.js:');
    lines.push(`- Available: ${diagnostics.fabricjs.available ? '✓' : '✗'}`);
    if (diagnostics.fabricjs.version) {
      lines.push(`- Version: ${diagnostics.fabricjs.version}`);
    }
    lines.push('');

    // Issues
    if (validation.issues.length > 0) {
      lines.push('Issues:');
      validation.issues.forEach((issue, index) => {
        lines.push(`${index + 1}. ${issue}`);
      });
      lines.push('');
    }

    // Recommendations
    if (validation.recommendations.length > 0) {
      lines.push('Recommendations:');
      validation.recommendations.forEach((rec, index) => {
        lines.push(`${index + 1}. ${rec}`);
      });
      lines.push('');
    }

    // Test Results
    if (!testResult.success && testResult.error) {
      lines.push('Canvas Creation Test Error:');
      lines.push(testResult.error);
    }

    return lines.join('\n');
  }
}