/**
 * 数据隔离修复测试脚本
 * 在浏览器控制台中运行此脚本来测试数据隔离修复效果
 */

declare global {
  interface Window {
    editor: any;
    __PROJECT_MANAGEMENT_SERVICE__: any;
    __ISOLATION_TESTER__: any;
    testDataIsolationFix?: () => Promise<any>;
    quickTestIsolation: () => boolean;
  }
}

// 测试数据隔离修复效果
const testDataIsolationFix = async function (): Promise<any> {
  console.log('=== 开始数据隔离修复测试 ===');

  const editor = window.editor;
  const projectService = window.__PROJECT_MANAGEMENT_SERVICE__;

  if (!editor || !projectService) {
    console.error('❌ 编辑器或项目管理服务未找到');
    return;
  }

  console.log('✅ 编辑器和项目管理服务已找到');

  // 1. 检查当前项目状态
  console.log('\\n--- 步骤1: 检查当前项目状态 ---');
  const activeTabId = projectService.getActiveTabId();
  const openTabs = projectService.getOpenTabs();

  console.log('当前活动项目:', activeTabId);
  console.log('打开的项目数量:', openTabs.length);
  console.log(
    '项目列表:',
    openTabs.map((tab: any) => ({ id: tab.id, name: tab.name })),
  );

  // 2. 强制同步当前编辑器状态
  console.log('\\n--- 步骤2: 强制同步编辑器状态 ---');
  const projectDocumentManager = projectService.getProjectDocumentManager();
  if (projectDocumentManager && projectDocumentManager.syncCurrentEditorState) {
    projectDocumentManager.syncCurrentEditorState();
    console.log('✅ 编辑器状态已强制同步');
  } else {
    console.warn('⚠️ 无法访问项目文档管理器的同步方法');
  }

  // 3. 验证数据隔离状态
  console.log('\\n--- 步骤3: 验证数据隔离状态 ---');
  const isolationValid = projectService.validateTrueDataIsolation();
  console.log('数据隔离验证结果:', isolationValid ? '✅ 通过' : '❌ 失败');

  // 4. 获取详细的隔离状态信息
  console.log('\\n--- 步骤4: 获取详细隔离状态 ---');
  const isolationStatus = projectService.getDataIsolationStatus();
  console.log('详细隔离状态:', isolationStatus);

  // 5. 如果有多个项目，测试项目切换
  if (openTabs.length >= 2) {
    console.log('\\n--- 步骤5: 测试项目切换数据隔离 ---');

    const currentTab = openTabs.find((tab: any) => tab.id === activeTabId);
    const otherTab = openTabs.find((tab: any) => tab.id !== activeTabId);

    if (otherTab) {
      console.log(
        `准备从项目 \"${currentTab?.name}\" 切换到项目 \"${otherTab.name}\"`,
      );

      // 记录切换前的状态
      const beforeSwitch = {
        activeTabId: projectService.getActiveTabId(),
        sceneObjectCount:
          JSON.parse(editor.sceneGraph.toJSON()).data?.length || 0,
        documentId: editor.doc?.attrs?.id,
      };
      console.log('切换前状态:', beforeSwitch);

      // 执行切换
      const switchSuccess = await projectService.switchToTab(otherTab.id);

      if (switchSuccess) {
        console.log('✅ 项目切换成功');

        // 等待切换完成
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 记录切换后的状态
        const afterSwitch = {
          activeTabId: projectService.getActiveTabId(),
          sceneObjectCount:
            JSON.parse(editor.sceneGraph.toJSON()).data?.length || 0,
          documentId: editor.doc?.attrs?.id,
        };
        console.log('切换后状态:', afterSwitch);

        // 验证切换后的数据隔离
        const postSwitchIsolationValid =
          projectService.validateTrueDataIsolation();
        console.log(
          '切换后数据隔离验证:',
          postSwitchIsolationValid ? '✅ 通过' : '❌ 失败',
        );

        // 分析切换效果
        const switchAnalysis = {
          tabIdChanged: beforeSwitch.activeTabId !== afterSwitch.activeTabId,
          documentIdChanged: beforeSwitch.documentId !== afterSwitch.documentId,
          objectCountChanged:
            beforeSwitch.sceneObjectCount !== afterSwitch.sceneObjectCount,
        };
        console.log('切换效果分析:', switchAnalysis);

        if (switchAnalysis.tabIdChanged && switchAnalysis.documentIdChanged) {
          console.log('✅ 项目切换数据隔离正常工作');
        } else {
          console.log('❌ 项目切换数据隔离可能存在问题');
        }

        // 切换回原项目
        if (currentTab) {
          console.log(`切换回原项目 \"${currentTab.name}\"`);
          await projectService.switchToTab(currentTab.id);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } else {
        console.error('❌ 项目切换失败');
      }
    }
  } else {
    console.log('\\n--- 步骤5: 跳过项目切换测试 ---');
    console.log('⚠️ 需要至少2个项目才能测试项目切换数据隔离');
  }

  // 6. 运行自动化测试
  console.log('\\n--- 步骤6: 运行自动化测试 ---');
  if (window.__ISOLATION_TESTER__) {
    try {
      const testResult =
        await window.__ISOLATION_TESTER__.runFullIsolationTest();
      console.log('自动化测试结果:', testResult);

      if (testResult.success) {
        console.log('🎉 所有自动化测试通过！');
      } else {
        console.log('❌ 部分自动化测试失败');
        testResult.results.forEach((result: any, index: number) => {
          console.log(
            `测试 ${index + 1}: ${result.success ? '✅' : '❌'} ${
              result.message
            }`,
          );
        });
      }
    } catch (error) {
      console.error('自动化测试执行失败:', error);
    }
  } else {
    console.warn('⚠️ 自动化测试器未找到');
  }

  console.log('\\n=== 数据隔离修复测试完成 ===');

  // 返回测试摘要
  return {
    editorFound: !!editor,
    projectServiceFound: !!projectService,
    activeTabId,
    openTabsCount: openTabs.length,
    isolationValid,
    testCompleted: true,
    timestamp: new Date().toISOString(),
  };
};

// 简化版测试函数
const quickTestIsolation = function (): boolean {
  console.log('=== 快速数据隔离测试 ===');

  const projectService = window.__PROJECT_MANAGEMENT_SERVICE__;
  if (!projectService) {
    console.error('❌ 项目管理服务未找到');
    return false;
  }

  const result = projectService.validateTrueDataIsolation();
  console.log('数据隔离验证结果:', result ? '✅ 通过' : '❌ 失败');

  return result;
};

// 导出函数到全局作用域
if (typeof window !== 'undefined') {
  window.testDataIsolationFix = testDataIsolationFix;
  window.quickTestIsolation = quickTestIsolation;

  console.log('数据隔离测试脚本已加载');
  console.log('使用方法:');
  console.log('- 运行完整测试: testDataIsolationFix()');
  console.log('- 运行快速测试: quickTestIsolation()');
  console.log('- 运行原有测试: testDataIsolation()');
}

export { testDataIsolationFix, quickTestIsolation };
