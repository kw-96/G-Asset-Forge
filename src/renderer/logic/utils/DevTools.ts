// 开发工具和调试辅助
import { unifiedPerformanceMonitor } from './performance/UnifiedPerformanceMonitor';

// 是否启用应用内调试面板（默认关闭，仅保留系统 DevTools）
const ENABLE_IN_APP_DEBUG_PANEL = process.env['ENABLE_IN_APP_DEBUG_PANEL'] === 'true';

export class DevTools {
  private static instance: DevTools;
  private performanceMonitor = unifiedPerformanceMonitor;
  private debugPanel: HTMLElement | null = null;
  private isVisible = false;

  static getInstance(): DevTools {
    if (!DevTools.instance) {
      DevTools.instance = new DevTools();
    }
    return DevTools.instance;
  }

  constructor() {
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    if (!ENABLE_IN_APP_DEBUG_PANEL) return;
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+D 切换调试面板
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        this.toggleDebugPanel();
      }
      
      // Ctrl+Shift+P 显示性能报告
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        console.log(this.performanceMonitor.generateReport());
      }
      
      // Ctrl+Shift+M 显示内存使用情况
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        this.logMemoryUsage();
      }
    });
  }

  toggleDebugPanel(): void {
    if (!ENABLE_IN_APP_DEBUG_PANEL) return;
    if (this.isVisible) {
      this.hideDebugPanel();
    } else {
      this.showDebugPanel();
    }
  }

  private showDebugPanel(): void {
    if (!ENABLE_IN_APP_DEBUG_PANEL) return;
    if (this.debugPanel) {
      this.debugPanel.style.display = 'block';
      this.isVisible = true;
      return;
    }

    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'dev-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 10000;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    `;
    header.innerHTML = `
      <span style="font-weight: bold;">Debug Panel</span>
      <button id="close-debug-panel" style="
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 10px;
      ">×</button>
    `;

    const content = document.createElement('div');
    content.id = 'debug-content';

    this.debugPanel.appendChild(header);
    this.debugPanel.appendChild(content);
    document.body.appendChild(this.debugPanel);

    // 关闭按钮事件
    document.getElementById('close-debug-panel')?.addEventListener('click', () => {
      this.hideDebugPanel();
    });

    this.isVisible = true;
    this.updateDebugPanel();
    
    // 每秒更新一次
    const updateInterval = setInterval(() => {
      if (this.isVisible) {
        this.updateDebugPanel();
      } else {
        clearInterval(updateInterval);
      }
    }, 1000);
  }

  private hideDebugPanel(): void {
    if (!ENABLE_IN_APP_DEBUG_PANEL) return;
    if (this.debugPanel) {
      this.debugPanel.style.display = 'none';
    }
    this.isVisible = false;
  }

  private updateDebugPanel(): void {
    if (!ENABLE_IN_APP_DEBUG_PANEL) return;
    const content = document.getElementById('debug-content');
    if (!content) return;

    const metrics = this.performanceMonitor.getMetrics();
    let html = '';

    // 性能指标
    html += '<div style="margin-bottom: 10px;"><strong>Performance:</strong></div>';
    
    {
      const fpsVal = metrics.fps ?? 0;
      const fpsColor = fpsVal >= 60 ? '#4CAF50' : fpsVal >= 30 ? '#FF9800' : '#F44336';
      html += `<div>FPS: <span style="color: ${fpsColor};">${Math.round(fpsVal)}</span></div>`;
    }

    {
      const memVal = metrics.memoryUsage ?? 0;
      const memColor = memVal < 100 ? '#4CAF50' : memVal < 200 ? '#FF9800' : '#F44336';
      html += `<div>Memory: <span style=\"color: ${memColor};\">${memVal.toFixed(1)}MB</span></div>`;
    }

    html += `<div>Long Tasks: ${metrics.longTaskDuration?.toFixed(1) ?? 0}ms (${metrics.longTaskCount ?? 0} 次)</div>`;

    // 系统信息
    html += '<div style="margin: 10px 0; padding-top: 10px; border-top: 1px solid #333;"><strong>System:</strong></div>';
    html += `<div>User Agent: ${navigator.userAgent.split(' ')[0]}</div>`;
    html += `<div>Platform: ${navigator.platform}</div>`;
    html += `<div>Language: ${navigator.language}</div>`;
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      html += `<div>Connection: ${connection.effectiveType || 'unknown'}</div>`;
    }

    // 快捷键提示
    html += '<div style="margin: 10px 0; padding-top: 10px; border-top: 1px solid #333; font-size: 10px; color: #ccc;"><strong>Shortcuts:</strong></div>';
    html += '<div style="font-size: 10px; color: #ccc;">Ctrl+Shift+D: Toggle Panel</div>';
    html += '<div style="font-size: 10px; color: #ccc;">Ctrl+Shift+P: Performance Report</div>';
    html += '<div style="font-size: 10px; color: #ccc;">Ctrl+Shift+M: Memory Usage</div>';

    content.innerHTML = html;
  }

  private logMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.group('Memory Usage');
      console.log(`Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Usage: ${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`);
      console.groupEnd();
    } else {
      console.log('Memory information not available');
    }
  }

  // 启动开发工具
  start(): void {
    if (process.env['NODE_ENV'] === 'development') {
      this.performanceMonitor.startMonitoring();
      if (ENABLE_IN_APP_DEBUG_PANEL) {
        console.log('DevTools started. Press Ctrl+Shift+D to toggle debug panel.');
      }
    }
  }

  // 停止开发工具
  stop(): void {
    this.performanceMonitor.stopMonitoring();
    if (ENABLE_IN_APP_DEBUG_PANEL) {
      this.hideDebugPanel();
    }
  }

  // 记录自定义事件
  logEvent(name: string, data?: any): void {
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`[DevTools] ${name}`, data);
    }
  }

  // 性能标记
  mark(name: string): void {
    performance.mark(name);
  }

  // 性能测量
  measure(name: string, startMark: string, endMark?: string): number {
    performance.measure(name, startMark, endMark);
    // 这里返回 0 作为占位，真实耗时可通过 PerformanceObserver 或 getEntriesByName 获取
    return 0;
  }
}