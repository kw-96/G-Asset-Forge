/**
 * 测试项目创建功能的简单脚本
 * 在浏览器控制台中运行此脚本来测试项目创建功能
 */

// 测试项目创建功能
async function testProjectCreation() {
  console.log('开始测试项目创建功能...');

  try {
    // 检查是否有项目管理服务
    if (window.projectManagementService) {
      console.log('✓ 项目管理服务已初始化');

      // 测试创建项目
      const projectResult = await window.projectManagementService.createProject(
        {
          name: '测试项目',
          description: '这是一个测试项目',
          type: 'design',
        },
      );

      if (projectResult) {
        console.log('✓ 项目创建成功:', projectResult);

        // 测试打开项目
        const openSuccess = await window.projectManagementService.openProject(
          projectResult.id,
        );
        if (openSuccess) {
          console.log('✓ 项目打开成功');

          // 检查标签页
          const tabs = window.projectManagementService.getOpenTabs();
          console.log('✓ 当前打开的标签页:', tabs);

          if (tabs.length > 0) {
            console.log('✓ 项目标签页显示正常');
          } else {
            console.log('✗ 项目标签页未显示');
          }
        } else {
          console.log('✗ 项目打开失败');
        }
      } else {
        console.log('✗ 项目创建失败');
      }
    } else {
      console.log('✗ 项目管理服务未初始化');
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 测试从首页进入编辑器时的自动项目创建
function testAutoProjectCreation() {
  console.log('测试自动项目创建功能...');
  console.log(
    '请在首页点击"设计模式"或"H5模式"按钮，观察是否自动创建项目并显示标签页',
  );
}

// 测试新建项目按钮
function testNewProjectButton() {
  console.log('测试新建项目按钮功能...');
  console.log(
    '请在编辑器界面点击Header中的"+"按钮，观察是否创建新项目并显示标签页',
  );
}

console.log('项目创建功能测试脚本已加载');
console.log('运行 testProjectCreation() 来测试项目创建功能');
console.log('运行 testAutoProjectCreation() 来测试自动项目创建');
console.log('运行 testNewProjectButton() 来测试新建项目按钮');
