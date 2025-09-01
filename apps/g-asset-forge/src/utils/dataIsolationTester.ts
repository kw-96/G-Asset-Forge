/**
 * 数据隔离测试工具 - 简化版本
 */
import { type GAssetForgeEditor } from '@g-asset-forge/core';

import { type ProjectManagementService } from '../services/ProjectManagementService';

export interface DataIsolationTestResult {
  success: boolean;
  message: string;
  details: any;
}

/**
 * 数据隔离测试器
 */
export class DataIsolationTester {
  private editor: GAssetForgeEditor;
  private projectService: ProjectManagementService;

  constructor(
    editor: GAssetForgeEditor,
    projectService: ProjectManagementService,
  ) {
    this.editor = editor;
    this.projectService = projectService;
  }

  /**
   * 运行完整的数据隔离测试套件
   */
  async runFullIsolationTest(): Promise<{
    success: boolean;
    results: DataIsolationTestResult[];
    summary: string;
  }> {
    const results: DataIsolationTestResult[] = [];
    const openTabs = this.projectService.getOpenTabs();

    if (openTabs.length < 1) {
      return {
        success: false,
        results: [],
        summary: '需要至少1个打开的项目才能进行数据隔离测试',
      };
    }

    console.log('开始完整数据隔离测试，项目数量:', openTabs.length);

    // 获取详细的诊断信息
    const isolationStatus = this.projectService.getDataIsolationStatus();
    console.log('数据隔离状态详情:', isolationStatus);

    // 测试1：验证项目文档管理器的隔离状态
    const isolationValid = this.projectService.validateTrueDataIsolation();

    // 获取当前编辑器状态
    const sceneGraphData = JSON.parse(this.editor.sceneGraph.toJSON());
    const actualDataCount = sceneGraphData.data?.length || 0;

    // 获取项目文档管理器中的预期数据
    const activeTabId = this.projectService.getActiveTabId();
    const projectDocumentManager = (
      this.projectService as any
    ).getProjectDocumentManager();
    const projectDocument =
      projectDocumentManager?.getProjectDocument(activeTabId);
    const expectedDataCount = projectDocument?.editorData?.data?.length || 0;

    const detailedMessage = isolationValid
      ? '数据隔离验证通过'
      : `数据隔离验证失败 - 场景图对象数: ${actualDataCount}, 项目文档对象数: ${expectedDataCount}`;

    results.push({
      success: isolationValid,
      message: detailedMessage,
      details: {
        isolationStatus,
        activeTabId,
        actualDataCount,
        expectedDataCount,
        dataMatched: actualDataCount === expectedDataCount,
        projectDocumentExists: !!projectDocument,
      },
    });

    // 如果有多个项目，测试项目切换
    if (openTabs.length >= 2) {
      console.log('测试项目切换数据隔离...');

      const currentTab = openTabs.find((tab) => tab.isActive);
      const otherTab = openTabs.find((tab) => !tab.isActive);

      if (currentTab && otherTab) {
        // 记录切换前状态
        const beforeSwitch = {
          activeTab: currentTab.id,
          sceneGraphCount:
            JSON.parse(this.editor.sceneGraph.toJSON()).data?.length || 0,
        };

        // 执行切换
        const switchSuccess = await this.projectService.switchToTab(
          otherTab.id,
        );

        // 等待切换完成
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 记录切换后状态
        const afterSwitch = {
          activeTab: this.projectService.getActiveTabId(),
          sceneGraphCount:
            JSON.parse(this.editor.sceneGraph.toJSON()).data?.length || 0,
        };

        const switchTestSuccess =
          switchSuccess && afterSwitch.activeTab === otherTab.id;

        results.push({
          success: switchTestSuccess,
          message: switchTestSuccess ? '项目切换测试通过' : '项目切换测试失败',
          details: {
            beforeSwitch,
            afterSwitch,
            switchSuccess,
          },
        });

        // 切换回原来的项目
        await this.projectService.switchToTab(currentTab.id);
      }
    }

    const success = results.every((r) => r.success);
    const passedCount = results.filter((r) => r.success).length;
    const summary = `数据隔离测试完成: ${passedCount}/${
      results.length
    } 个测试通过 (${success ? '全部通过' : '存在失败'})`;

    return {
      success,
      results,
      summary,
    };
  }
}

/**
 * 创建数据隔离测试器
 */
export const createDataIsolationTester = (
  editor: GAssetForgeEditor,
  projectService: ProjectManagementService,
): DataIsolationTester => {
  return new DataIsolationTester(editor, projectService);
};

/**
 * 全局测试函数（用于控制台调试）
 */
export const testDataIsolation = async (): Promise<void> => {
  const editor = (window as any).editor;
  const projectService = (window as any).__PROJECT_MANAGEMENT_SERVICE__;

  if (!editor || !projectService) {
    console.error('编辑器或项目管理服务未找到');
    return;
  }

  const tester = createDataIsolationTester(editor, projectService);
  const result = await tester.runFullIsolationTest();

  console.log('=== 数据隔离测试结果 ===');
  console.log(result.summary);
  console.log('详细结果:', result.results);

  if (!result.success) {
    console.error('数据隔离测试失败，请检查实现');
  } else {
    console.log('数据隔离测试全部通过！');
  }
};

// 将测试函数暴露到全局，方便调试
if (typeof window !== 'undefined') {
  (window as any).testDataIsolation = testDataIsolation;
}
