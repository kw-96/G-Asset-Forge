/**
 * 数据隔离修复工具
 * 专门用于修复场景图数据不匹配的问题
 */

export interface DataMismatchInfo {
  projectId: string;
  expectedCount: number;
  actualCount: number;
  expectedTypes: string[];
  actualTypes: string[];
  mismatchType: 'count' | 'types' | 'both';
}

export interface FixResult {
  success: boolean;
  message: string;
  beforeFix: DataMismatchInfo;
  afterFix?: {
    expectedCount: number;
    actualCount: number;
    isMatched: boolean;
  };
  details?: any;
}

export class DataIsolationFixer {
  private editor: any;
  private projectDocumentManager: any;

  constructor(editor: any, projectDocumentManager: any) {
    this.editor = editor;
    this.projectDocumentManager = projectDocumentManager;
  }

  /**
   * 检测数据不匹配
   */
  detectDataMismatch(projectId: string): DataMismatchInfo | null {
    try {
      const projectState =
        this.projectDocumentManager.getProjectDocument(projectId);
      if (!projectState) {
        return null;
      }

      const sceneGraphData = JSON.parse(
        this.editor.sceneGraph.toJSON() || '{}',
      );
      const expectedCount = projectState.editorData.data?.length || 0;
      const actualCount = sceneGraphData.data?.length || 0;

      const expectedTypes = (projectState.editorData.data || []).map(
        (item: any) => item.type,
      );
      const actualTypes = (sceneGraphData.data || []).map(
        (item: any) => item.type,
      );

      const countMismatch = expectedCount !== actualCount;
      const typesMismatch =
        JSON.stringify(expectedTypes.sort()) !==
        JSON.stringify(actualTypes.sort());

      if (countMismatch || typesMismatch) {
        let mismatchType: 'count' | 'types' | 'both';
        if (countMismatch && typesMismatch) {
          mismatchType = 'both';
        } else if (countMismatch) {
          mismatchType = 'count';
        } else {
          mismatchType = 'types';
        }

        return {
          projectId,
          expectedCount,
          actualCount,
          expectedTypes,
          actualTypes,
          mismatchType,
        };
      }

      return null;
    } catch (error) {
      console.error('检测数据不匹配失败:', error);
      return null;
    }
  }

  /**
   * 修复数据不匹配 - 方法1：同步场景图到项目状态
   */
  fixBySyncingSceneGraphToProject(projectId: string): FixResult {
    try {
      const mismatchInfo = this.detectDataMismatch(projectId);
      if (!mismatchInfo) {
        return {
          success: true,
          message: '数据已匹配，无需修复',
          beforeFix: {
            projectId,
            expectedCount: 0,
            actualCount: 0,
            expectedTypes: [],
            actualTypes: [],
            mismatchType: 'count',
          },
        };
      }

      console.log('开始修复数据不匹配（同步场景图到项目）:', mismatchInfo);

      // 强制同步当前编辑器状态到项目文档管理器
      this.projectDocumentManager.syncCurrentEditorState();

      // 验证修复结果
      const afterFixMismatch = this.detectDataMismatch(projectId);
      const success = afterFixMismatch === null;

      const result: FixResult = {
        success,
        message: success
          ? '修复成功：场景图数据已同步到项目状态'
          : '修复失败：数据仍不匹配',
        beforeFix: mismatchInfo,
        details: {
          method: 'syncSceneGraphToProject',
          afterFixMismatch,
        },
      };

      if (success) {
        const projectState =
          this.projectDocumentManager.getProjectDocument(projectId);
        result.afterFix = {
          expectedCount: projectState?.editorData.data?.length || 0,
          actualCount: mismatchInfo.actualCount,
          isMatched: true,
        };
      }

      console.log('修复结果:', result);
      return result;
    } catch (error) {
      console.error('修复数据不匹配失败:', error);
      return {
        success: false,
        message: `修复失败: ${error}`,
        beforeFix: {
          projectId,
          expectedCount: 0,
          actualCount: 0,
          expectedTypes: [],
          actualTypes: [],
          mismatchType: 'count',
        },
        details: { error },
      };
    }
  }

  /**
   * 修复数据不匹配 - 方法2：重新加载项目数据到场景图
   */
  fixByReloadingProjectToSceneGraph(projectId: string): FixResult {
    try {
      const mismatchInfo = this.detectDataMismatch(projectId);
      if (!mismatchInfo) {
        return {
          success: true,
          message: '数据已匹配，无需修复',
          beforeFix: {
            projectId,
            expectedCount: 0,
            actualCount: 0,
            expectedTypes: [],
            actualTypes: [],
            mismatchType: 'count',
          },
        };
      }

      console.log('开始修复数据不匹配（重新加载项目到场景图）:', mismatchInfo);

      const projectState =
        this.projectDocumentManager.getProjectDocument(projectId);
      if (!projectState) {
        throw new Error('项目状态不存在');
      }

      // 清空场景图
      this.editor.sceneGraph.clear();

      // 重新加载项目数据
      if (
        projectState.editorData.data &&
        Array.isArray(projectState.editorData.data)
      ) {
        this.editor.sceneGraph.load(projectState.editorData.data, false);
        console.log(
          '项目数据已重新加载到场景图:',
          projectState.editorData.data.length,
          '个对象',
        );
      }

      // 强制渲染
      this.editor.render();

      // 验证修复结果
      const afterFixMismatch = this.detectDataMismatch(projectId);
      const success = afterFixMismatch === null;

      const result: FixResult = {
        success,
        message: success
          ? '修复成功：项目数据已重新加载到场景图'
          : '修复失败：数据仍不匹配',
        beforeFix: mismatchInfo,
        details: {
          method: 'reloadProjectToSceneGraph',
          afterFixMismatch,
        },
      };

      if (success) {
        const sceneGraphData = JSON.parse(
          this.editor.sceneGraph.toJSON() || '{}',
        );
        result.afterFix = {
          expectedCount: mismatchInfo.expectedCount,
          actualCount: sceneGraphData.data?.length || 0,
          isMatched: true,
        };
      }

      console.log('修复结果:', result);
      return result;
    } catch (error) {
      console.error('修复数据不匹配失败:', error);
      return {
        success: false,
        message: `修复失败: ${error}`,
        beforeFix: {
          projectId,
          expectedCount: 0,
          actualCount: 0,
          expectedTypes: [],
          actualTypes: [],
          mismatchType: 'count',
        },
        details: { error },
      };
    }
  }

  /**
   * 智能修复 - 自动选择最佳修复方法
   */
  smartFix(projectId: string): FixResult {
    const mismatchInfo = this.detectDataMismatch(projectId);
    if (!mismatchInfo) {
      return {
        success: true,
        message: '数据已匹配，无需修复',
        beforeFix: {
          projectId,
          expectedCount: 0,
          actualCount: 0,
          expectedTypes: [],
          actualTypes: [],
          mismatchType: 'count',
        },
      };
    }

    console.log('开始智能修复数据不匹配:', mismatchInfo);

    // 策略1：如果场景图有数据而项目状态为空，同步场景图到项目
    if (mismatchInfo.actualCount > 0 && mismatchInfo.expectedCount === 0) {
      console.log('策略1：同步场景图到项目状态');
      return this.fixBySyncingSceneGraphToProject(projectId);
    }

    // 策略2：如果项目状态有数据而场景图为空，重新加载项目到场景图
    if (mismatchInfo.expectedCount > 0 && mismatchInfo.actualCount === 0) {
      console.log('策略2：重新加载项目到场景图');
      return this.fixByReloadingProjectToSceneGraph(projectId);
    }

    // 策略3：如果两者都有数据但不匹配，优先保留场景图数据（用户当前操作）
    if (mismatchInfo.actualCount > 0 && mismatchInfo.expectedCount > 0) {
      console.log('策略3：优先保留场景图数据，同步到项目状态');
      return this.fixBySyncingSceneGraphToProject(projectId);
    }

    // 默认策略：同步场景图到项目
    console.log('默认策略：同步场景图到项目状态');
    return this.fixBySyncingSceneGraphToProject(projectId);
  }

  /**
   * 批量修复所有项目的数据不匹配
   */
  fixAllProjects(): { [projectId: string]: FixResult } {
    const results: { [projectId: string]: FixResult } = {};

    try {
      const projectsStatus = this.projectDocumentManager.getProjectsStatus();

      for (const project of projectsStatus.projects) {
        const mismatchInfo = this.detectDataMismatch(project.id);
        if (mismatchInfo) {
          console.log(`发现项目 ${project.id} 数据不匹配，开始修复...`);
          results[project.id] = this.smartFix(project.id);
        } else {
          results[project.id] = {
            success: true,
            message: '数据已匹配',
            beforeFix: {
              projectId: project.id,
              expectedCount: 0,
              actualCount: 0,
              expectedTypes: [],
              actualTypes: [],
              mismatchType: 'count',
            },
          };
        }
      }
    } catch (error) {
      console.error('批量修复失败:', error);
    }

    return results;
  }
}

/**
 * 创建数据隔离修复工具
 */
export const createDataIsolationFixer = (
  editor: any,
  projectDocumentManager: any,
): DataIsolationFixer => {
  return new DataIsolationFixer(editor, projectDocumentManager);
};

// 导出到全局作用域（开发环境）
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  (window as any).__DATA_ISOLATION_FIXER__ = {
    createDataIsolationFixer,
    DataIsolationFixer,
  };
  console.log('数据隔离修复工具已加载到全局作用域');
}
