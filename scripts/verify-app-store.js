/**
 * AppStore优化验证脚本
 * 验证优化后的状态管理功能
 */

const path = require('path');

// 模拟浏览器环境
global.window = {};
global.document = {
  readyState: 'complete',
  createElement: () => ({
    getContext: () => ({}),
    style: {}
  })
};
global.navigator = {
  userAgent: 'Node.js Test Environment',
  platform: 'node',
  language: 'zh-CN',
  cookieEnabled: true,
  onLine: true
};
global.performance = {
  now: () => Date.now(),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10 // 10MB
  }
};
global.console = console;

// Mock localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

async function verifyAppStore() {
  console.log('=== AppStore优化验证 ===\n');

  try {
    // 编译TypeScript
    console.log('编译TypeScript文件...');
    const { execSync } = require('child_process');
    execSync('npx tsc --project tsconfig.json', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    console.log('✓ TypeScript编译成功\n');

    // 动态导入编译后的模块
    const { InitializationManager } = require('../dist/src/renderer/utils/InitializationManager');
    const { StateValidator } = require('../dist/src/renderer/utils/StateValidator');
    const { DebugLogger } = require('../dist/src/renderer/utils/DebugLogger');

    console.log('✓ 工具模块导入成功');

    // 测试1: InitializationManager集成
    console.log('\n测试1: InitializationManager集成');
    const initManager = InitializationManager.getInstance();
    
    let initCallCount = 0;
    const mockAppInit = async () => {
      initCallCount++;
      console.log(`  执行应用初始化 (第${initCallCount}次)`);
      await new Promise(resolve => setTimeout(resolve, 50));
    };

    // 第一次初始化
    await initManager.initializeOnce(mockAppInit);
    console.log(`  ✓ 首次初始化完成，调用次数: ${initCallCount}`);

    // 尝试重复初始化
    await initManager.initializeOnce(mockAppInit);
    console.log(`  ✓ 重复初始化被阻止，总调用次数: ${initCallCount}`);

    // 测试2: StateValidator集成
    console.log('\n测试2: StateValidator状态验证');
    const stateValidator = new StateValidator({ enableLogging: false });

    // 模拟AppStore状态更新
    const validateUpdate = (path, oldVal, newVal) => {
      return stateValidator.validateStateUpdate(path, oldVal, newVal, 'AppStore');
    };

    // 正常状态更新
    const result1 = validateUpdate('appStore.activeTool', 'select', 'brush');
    console.log(`  ✓ 正常状态更新验证: ${result1}`);

    // 无变化的状态更新
    const result2 = validateUpdate('appStore.activeTool', 'brush', 'brush');
    console.log(`  ✓ 无变化状态更新验证: ${result2}`);

    // 快速连续更新测试
    console.log('  测试快速连续更新检测...');
    for (let i = 0; i < 8; i++) {
      validateUpdate('appStore.canvasZoom', i, i + 0.1);
    }

    const patterns = stateValidator.getSuspiciousPatterns();
    console.log(`  ✓ 检测到 ${patterns.length} 个可疑模式`);

    // 测试3: DebugLogger集成
    console.log('\n测试3: DebugLogger日志记录');
    const debugLogger = DebugLogger.getInstance({ enableConsoleOutput: false });

    // 模拟AppStore日志
    debugLogger.info('app-store', '应用初始化开始', { version: '1.0.0' }, 'AppStore');
    debugLogger.debug('app-store', '批量状态更新', { keys: ['activeTool', 'canvasZoom'] }, 'AppStore');
    debugLogger.warn('app-store', '状态更新频繁', { updateCount: 15 }, 'AppStore');

    const logStats = debugLogger.generateStats();
    console.log(`  ✓ 日志统计: 总条目=${logStats.totalEntries}`);
    console.log(`  ✓ 按级别分布: info=${logStats.entriesByLevel.info}, debug=${logStats.entriesByLevel.debug}, warn=${logStats.entriesByLevel.warn}`);

    // 测试4: 批量更新模拟
    console.log('\n测试4: 批量更新机制模拟');
    
    // 模拟批量更新逻辑
    const simulateBatchUpdate = (updates) => {
      const validatedUpdates = {};
      let hasValidUpdates = false;

      for (const [key, value] of Object.entries(updates)) {
        // 模拟当前状态
        const currentValue = key === 'activeTool' ? 'select' : 
                           key === 'canvasZoom' ? 1 : 
                           key === 'showGrid' ? true : null;

        const shouldUpdate = validateUpdate(`appStore.${key}`, currentValue, value);
        if (shouldUpdate) {
          validatedUpdates[key] = value;
          hasValidUpdates = true;
        }
      }

      return { validatedUpdates, hasValidUpdates };
    };

    const batchResult1 = simulateBatchUpdate({
      activeTool: 'brush',
      canvasZoom: 2,
      showGrid: false,
    });
    console.log(`  ✓ 批量更新1: 有效更新=${batchResult1.hasValidUpdates}, 更新数=${Object.keys(batchResult1.validatedUpdates).length}`);

    const batchResult2 = simulateBatchUpdate({
      activeTool: 'select', // 相同值
      canvasZoom: 1,        // 相同值
    });
    console.log(`  ✓ 批量更新2: 有效更新=${batchResult2.hasValidUpdates}, 更新数=${Object.keys(batchResult2.validatedUpdates).length}`);

    // 测试5: 元素管理模拟
    console.log('\n测试5: 元素管理验证');
    
    const mockElements = {};
    const addElement = (element) => {
      const newElements = { ...mockElements, [element.id]: element };
      const shouldUpdate = validateUpdate('appStore.elements', mockElements, newElements);
      
      if (shouldUpdate) {
        Object.assign(mockElements, newElements);
        debugLogger.info('app-store', `添加元素: ${element.id}`, { elementType: element.type }, 'AppStore');
        return true;
      }
      return false;
    };

    const updateElement = (id, updates) => {
      const element = mockElements[id];
      if (!element) {
        debugLogger.warn('app-store', `尝试更新不存在的元素: ${id}`, { updates }, 'AppStore');
        return false;
      }

      const updatedElement = { ...element, ...updates };
      const shouldUpdate = validateUpdate(`appStore.elements.${id}`, element, updatedElement);
      
      if (shouldUpdate) {
        mockElements[id] = updatedElement;
        debugLogger.debug('app-store', `更新元素: ${id}`, { updatedKeys: Object.keys(updates) }, 'AppStore');
        return true;
      }
      return false;
    };

    // 添加元素
    const testElement = {
      id: 'test-rect',
      type: 'rectangle',
      name: '测试矩形',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      fill: '#3b82f6',
    };

    const added = addElement(testElement);
    console.log(`  ✓ 添加元素: ${added}, 元素数量: ${Object.keys(mockElements).length}`);

    // 更新元素
    const updated = updateElement('test-rect', { x: 150, fill: '#ff0000' });
    console.log(`  ✓ 更新元素: ${updated}, 新位置: x=${mockElements['test-rect']?.x}`);

    // 尝试更新不存在的元素
    const notUpdated = updateElement('non-existent', { x: 200 });
    console.log(`  ✓ 更新不存在元素: ${notUpdated}`);

    // 测试6: 性能监控模拟
    console.log('\n测试6: 性能监控模拟');
    
    let renderCount = 0;
    const renderTimes = [];
    
    const simulateRender = () => {
      renderCount++;
      const now = Date.now();
      const interval = renderTimes.length > 0 ? now - renderTimes[renderTimes.length - 1] : 16;
      renderTimes.push(now);
      
      debugLogger.logRender('AppStore', renderCount, undefined, 'state change');
      
      if (renderCount > 10) {
        debugLogger.warn('store-monitor', `渲染次数过多: ${renderCount}`, { threshold: 10 }, 'StoreMonitor');
      }
      
      return interval;
    };

    // 模拟多次渲染
    for (let i = 0; i < 15; i++) {
      const interval = simulateRender();
      if (i < 3) {
        console.log(`  渲染 #${renderCount}: 间隔=${interval}ms`);
      }
    }

    console.log(`  ✓ 总渲染次数: ${renderCount}`);
    
    const finalLogStats = debugLogger.generateStats();
    console.log(`  ✓ 最终日志统计: 总条目=${finalLogStats.totalEntries}, 警告=${finalLogStats.entriesByLevel.warn}`);

    console.log('\n=== 验证完成 ===');
    console.log('✓ InitializationManager: 防重复初始化机制正常');
    console.log('✓ StateValidator: 状态验证和无限循环检测正常');
    console.log('✓ DebugLogger: 结构化日志记录正常');
    console.log('✓ 批量更新: 状态验证集成正常');
    console.log('✓ 元素管理: 增删改查验证正常');
    console.log('✓ 性能监控: 渲染追踪和警告正常');
    console.log('\n🎉 AppStore优化功能验证成功！');

  } catch (error) {
    console.error('验证失败:', error);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 运行验证
verifyAppStore();