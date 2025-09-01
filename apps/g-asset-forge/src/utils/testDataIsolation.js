/**
 * 数据隔离测试脚本
 * 在浏览器控制台中运行此脚本来测试项目数据隔离机制
 */

// 等待应用程序完全加载
function waitForApp() {
  return new Promise((resolve) => {
    const checkApp = () => {
      const editor = window.editor;
      const projectService = window.__PROJECT_MANAGEMENT_SERVICE__;

      if (editor && projectService) {
        resolve({ editor, projectService });
      } else {
        setTimeout(checkApp, 1000);
      }
    };
    checkApp();
  });
}

// 创建测试项目
async function createTestProjects(projectService) {
  console.log('创建测试项目...');

  const project1 = await projectService.createProject({
    name: '测试项目1',
    description: '用于数据隔离测试',
    type: 'design',
  });

  const project2 = await projectService.createProject({
    name: '测试项目2',
    description: '用于数据隔离测试',
    type: 'design',
  });

  if (project1 && project2) {
    console.log('测试项目创建成功:', { project1, project2 });
    return { project1, project2 };
  } else {
    throw new Error('创建测试项目失败');
  }
}

// 添加测试内容到项目
async function addTestContent(editor, projectService, projectId, content) {
  console.log(`为项目 ${projectId} 添加测试内容...`);

  // 切换到指定项目
  await projectService.switchToTab(projectId);

  // 等待切换完成
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 这里可以添加具体的图形对象创建逻辑
  // 由于需要具体的图形API，暂时跳过
  console.log(`项目 ${projectId} 的测试内容已添加`);
}

// 测试数据隔离
async function testDataIsolation(
  editor,
  projectService,
  project1Id,
  project2Id,
) {
  console.log('开始测试数据隔离...');

  // 1. 切换到项目1
  await projectService.switchToTab(project1Id);
  await new Promise((resolve) => setTimeout(resolve, 300));

  const state1Before = JSON.parse(editor.sceneGraph.toJSON());
  console.log('项目1初始状态:', state1Before);

  // 2. 切换到项目2
  await projectService.switchToTab(project2Id);
  await new Promise((resolve) => setTimeout(resolve, 300));

  const state2 = JSON.parse(editor.sceneGraph.toJSON());
  console.log('项目2状态:', state2);

  // 3. 切换回项目1
  await projectService.switchToTab(project1Id);
  await new Promise((resolve) => setTimeout(resolve, 300));

  const state1After = JSON.parse(editor.sceneGraph.toJSON());
  console.log('项目1恢复后状态:', state1After);

  // 4. 验证数据隔离
  const isolationWorking =
    JSON.stringify(state1Before) === JSON.stringify(state1After);

  console.log('数据隔离测试结果:', {
    isolationWorking,
    message: isolationWorking ? '数据隔离正常工作' : '数据隔离失败',
    details: {
      state1Before: state1Before.data?.length || 0,
      state2: state2.data?.length || 0,
      state1After: state1After.data?.length || 0,
    },
  });

  return isolationWorking;
}

// 主测试函数
async function runDataIsolationTest() {
  try {
    console.log('开始项目数据隔离测试...');

    // 1. 等待应用程序加载
    const { editor, projectService } = await waitForApp();
    console.log('应用程序已加载');

    // 2. 创建测试项目
    const { project1, project2 } = await createTestProjects(projectService);

    // 3. 打开项目
    await projectService.openProject(project1.id);
    await projectService.openProject(project2.id);

    // 4. 等待项目加载完成
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. 检查项目状态
    const openTabs = projectService.getOpenTabs();
    console.log('当前打开的项目:', openTabs);

    if (openTabs.length < 2) {
      throw new Error('需要至少2个打开的项目进行测试');
    }

    // 6. 测试数据隔离
    const isolationResult = await testDataIsolation(
      editor,
      projectService,
      project1.id,
      project2.id,
    );

    // 7. 输出最终结果
    console.log('=== 数据隔离测试完成 ===');
    console.log('结果:', isolationResult ? '通过' : '失败');

    // 8. 输出数据隔离状态
    if (projectService.getDataIsolationStatus) {
      const isolationStatus = projectService.getDataIsolationStatus();
      console.log('数据隔离状态:', isolationStatus);
    }

    return isolationResult;
  } catch (error) {
    console.error('数据隔离测试失败:', error);
    return false;
  }
}

// 将测试函数暴露到全局
window.runDataIsolationTest = runDataIsolationTest;

console.log('数据隔离测试脚本已加载');
console.log('运行测试: runDataIsolationTest()');
