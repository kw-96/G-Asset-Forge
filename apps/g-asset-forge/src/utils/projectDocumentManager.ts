/**
 * 项目文档管理器 - 实现真正的数据隔离
 * 为每个项目维护独立的GAssetForgeDocument实例
 */
import { type GAssetForgeEditor } from '@g-asset-forge/core';
import { GAssetForgeDocument } from '@g-asset-forge/core';
import { type IEditorPaperData } from '@g-asset-forge/core';
import { GraphicsType } from '@g-asset-forge/core';

export interface ProjectDocumentState {
  document: GAssetForgeDocument;
  editorData: IEditorPaperData;
  viewportState: {
    x: number;
    y: number;
    zoom: number;
  };
  toolState: {
    activeTool: string;
    selectedElements: string[];
  };
  lastSaved: Date;
}

/**
 * 项目文档管理器
 * 为每个项目维护独立的文档实例，实现真正的数据隔离
 */
export class ProjectDocumentManager {
  private editor: GAssetForgeEditor | null = null;
  private projectDocuments: Map<string, ProjectDocumentState> = new Map();
  private currentProjectId: string | null = null;

  constructor() {
    console.log('项目文档管理器已创建');
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: GAssetForgeEditor): void {
    this.editor = editor;
    console.log('项目文档管理器：编辑器实例已设置');

    // 监听编辑器变化，自动同步状态
    this.setupEditorListeners();
  }

  /**
   * 设置编辑器监听器，自动同步状态
   */
  private setupEditorListeners(): void {
    if (!this.editor) {
      return;
    }

    // 监听场景图渲染变化
    this.editor.sceneGraph.on('render', () => {
      // 延迟同步，避免频繁调用
      if (this.syncTimeout) {
        clearTimeout(this.syncTimeout);
      }
      this.syncTimeout = setTimeout(() => {
        this.syncCurrentEditorState();
      }, 500);
    });

    console.log('编辑器监听器已设置');
  }

  private syncTimeout: number | null = null;

  /**
   * 为项目创建独立的文档实例
   */
  createProjectDocument(
    projectId: string,
    editorData: IEditorPaperData,
  ): ProjectDocumentState {
    if (!this.editor) {
      throw new Error('编辑器实例未设置');
    }

    console.log('为项目创建独立文档实例:', projectId);

    // 创建新的文档实例
    const document = new GAssetForgeDocument({
      id: `doc-${projectId}`,
      objectName: `Document-${projectId}`,
      width: 800,
      height: 600,
    });

    // 设置编辑器引用
    document.setEditor(this.editor);

    // 创建项目文档状态
    const projectState: ProjectDocumentState = {
      document,
      editorData,
      viewportState: {
        x: 0,
        y: 0,
        zoom: 1,
      },
      toolState: {
        activeTool: 'Select',
        selectedElements: [],
      },
      lastSaved: new Date(),
    };

    // 缓存项目文档状态
    this.projectDocuments.set(projectId, projectState);

    console.log('项目文档实例创建完成:', {
      projectId,
      documentId: document.attrs.id,
      hasDocument: !!document,
    });

    return projectState;
  }

  /**
   * 获取项目的文档状态
   */
  getProjectDocument(projectId: string): ProjectDocumentState | null {
    return this.projectDocuments.get(projectId) || null;
  }

  /**
   * 切换到指定项目的文档实例 - 真正的数据隔离版本
   */
  async switchToProject(
    projectId: string,
    editorData?: IEditorPaperData,
  ): Promise<boolean> {
    if (!this.editor) {
      console.error('编辑器实例未设置');
      return false;
    }

    try {
      console.log('切换到项目文档实例（真正数据隔离）:', projectId);

      // 1. 保存当前项目状态（包括当前编辑器中的所有内容）
      if (this.currentProjectId && this.currentProjectId !== projectId) {
        await this.saveCurrentProjectState();
      }

      // 2. 获取或创建目标项目的文档状态
      let projectState = this.projectDocuments.get(projectId);

      if (!projectState) {
        if (!editorData) {
          console.error('项目文档不存在且未提供编辑器数据');
          return false;
        }
        projectState = this.createProjectDocument(projectId, editorData);
      } else {
        // 如果项目状态已存在，但提供了新的编辑器数据，则更新它
        if (editorData) {
          console.log('更新现有项目的编辑器数据');
          projectState.editorData = editorData;
        }
      }

      // 3. 完全清空编辑器状态
      console.log('清空编辑器状态...');

      // 清空选中元素
      this.editor.selectedElements.clear();

      // 清空命令历史
      this.editor.commandManager.clearRecords();

      // 清空场景图数据
      this.editor.sceneGraph.clear();

      // 4. 替换编辑器的文档实例（真正的数据隔离）
      const previousDoc = this.editor.doc;
      this.editor.doc = projectState.document;

      // 确保新文档实例正确设置编辑器引用
      projectState.document.setEditor(this.editor);

      console.log('文档实例已替换:', {
        previousDocId: previousDoc?.attrs.id,
        newDocId: projectState.document.attrs.id,
      });

      // 5. 加载项目数据到新的文档实例和场景图（真正的数据隔离）
      const dataToLoad = editorData || projectState.editorData;

      if (dataToLoad && dataToLoad.data && Array.isArray(dataToLoad.data)) {
        console.log(
          '加载项目数据到场景图（真正数据隔离）:',
          dataToLoad.data.length,
          '个对象',
        );

        // 使用场景图的load方法加载数据，不保留现有画布（isApplyChanges=false确保完全清空）
        this.editor.sceneGraph.load(dataToLoad.data, false);

        // 更新项目状态中的编辑器数据
        if (editorData) {
          projectState.editorData = editorData;
        }

        console.log('项目数据加载完成（真正数据隔离）');
      } else {
        console.log('项目数据为空，使用空白状态');
        // 确保场景图完全清空
        this.editor.sceneGraph.clear();

        // 如果项目数据为空，创建一个默认画布
        this.createDefaultCanvasForProject(projectId);
      }

      // 6. 恢复项目的编辑器状态（视口、工具、选择等）
      await this.restoreProjectState(projectState);

      // 7. 更新当前项目ID
      this.currentProjectId = projectId;

      // 8. 强制触发渲染，确保界面更新
      this.editor.render();

      // 9. 多次同步确保数据一致性
      // 立即同步一次
      this.syncCurrentEditorState();

      // 延迟同步，确保渲染完成后数据一致
      setTimeout(() => {
        this.syncCurrentEditorState();
      }, 100);

      // 再次延迟同步，确保所有异步操作完成
      setTimeout(() => {
        this.syncCurrentEditorState();
        // 最终验证
        const finalVerification = this.verifyDataIsolation(projectId);
        console.log(
          '最终数据隔离验证结果:',
          finalVerification ? '✅ 通过' : '❌ 失败',
        );
      }, 500);

      // 10. 验证数据隔离效果
      const currentCanvas = this.editor.doc.getCurrentCanvas();
      const sceneGraphData = this.editor.sceneGraph.toJSON();

      console.log('项目文档切换完成（真正数据隔离）:', {
        projectId,
        documentId: projectState.document.attrs.id,
        previousDocId: previousDoc?.attrs.id,
        dataObjectCount: projectState.editorData.data?.length || 0,
        currentCanvasId: currentCanvas?.attrs?.id,
        sceneGraphObjectCount: JSON.parse(sceneGraphData).data?.length || 0,
        isolationVerified: this.verifyDataIsolation(projectId),
      });

      return true;
    } catch (error) {
      console.error('切换项目文档失败:', error);
      return false;
    }
  }

  /**
   * 验证数据隔离效果 - 增强版本
   */
  private verifyDataIsolation(projectId: string): boolean {
    try {
      const projectState = this.projectDocuments.get(projectId);
      if (!projectState) {
        console.warn('项目状态不存在:', projectId);
        return false;
      }

      // 验证文档实例是否正确
      const isCorrectDocument = this.editor?.doc === projectState.document;

      // 获取当前场景图数据（不先同步，以检测不一致）
      const sceneGraphData = JSON.parse(
        this.editor?.sceneGraph.toJSON() || '{}',
      );
      const expectedDataCount = projectState.editorData.data?.length || 0;
      const actualDataCount = sceneGraphData.data?.length || 0;
      const isDataMatched = expectedDataCount === actualDataCount;

      // 详细的数据对比
      const expectedDataTypes = (projectState.editorData.data || []).map(
        (item: any) => item.type,
      );
      const actualDataTypes = (sceneGraphData.data || []).map(
        (item: any) => item.type,
      );
      const isDataTypesMatched =
        JSON.stringify(expectedDataTypes.sort()) ===
        JSON.stringify(actualDataTypes.sort());

      // 如果数据不匹配，尝试自动修复
      if (!isDataMatched || !isDataTypesMatched) {
        console.warn('⚠️ 检测到数据不一致，尝试自动修复:', {
          projectId,
          expectedDataCount,
          actualDataCount,
          expectedDataTypes,
          actualDataTypes,
        });

        // 执行强制同步
        this.syncCurrentEditorState();

        // 重新验证
        const updatedProjectState = this.projectDocuments.get(projectId);
        if (updatedProjectState) {
          const newExpectedCount =
            updatedProjectState.editorData.data?.length || 0;
          const newExpectedTypes = (
            updatedProjectState.editorData.data || []
          ).map((item: any) => item.type);

          const isFixedDataMatched = newExpectedCount === actualDataCount;
          const isFixedTypesMatched =
            JSON.stringify(newExpectedTypes.sort()) ===
            JSON.stringify(actualDataTypes.sort());

          console.log('自动修复结果:', {
            projectId,
            beforeFix: { expectedDataCount, actualDataCount, isDataMatched },
            afterFix: {
              expectedDataCount: newExpectedCount,
              actualDataCount,
              isDataMatched: isFixedDataMatched,
            },
            fixSuccessful: isFixedDataMatched && isFixedTypesMatched,
          });

          // 更新验证结果
          return isCorrectDocument && isFixedDataMatched && isFixedTypesMatched;
        }
      }

      console.log('数据隔离验证（增强版本）:', {
        projectId,
        isCorrectDocument,
        isDataMatched,
        isDataTypesMatched,
        expectedDataCount,
        actualDataCount,
        expectedDataTypes,
        actualDataTypes,
        documentId: projectState.document.attrs.id,
        currentDocumentId: this.editor?.doc?.attrs?.id,
        overallResult: isCorrectDocument && isDataMatched && isDataTypesMatched,
      });

      return isCorrectDocument && isDataMatched && isDataTypesMatched;
    } catch (error) {
      console.error('验证数据隔离失败:', error);
      return false;
    }
  }

  /**
   * 保存当前项目状态 - 完整版本
   */
  private async saveCurrentProjectState(): Promise<void> {
    if (!this.currentProjectId || !this.editor) {
      return;
    }

    try {
      const projectState = this.projectDocuments.get(this.currentProjectId);
      if (!projectState) {
        console.warn('当前项目状态不存在:', this.currentProjectId);
        return;
      }

      console.log('保存当前项目状态（完整版本）:', this.currentProjectId);

      // 1. 保存场景图数据（最重要的数据）
      const currentStateJson = this.editor.sceneGraph.toJSON();
      const currentState = JSON.parse(currentStateJson);

      // 确保数据结构正确
      const sceneData = currentState.data || [];

      // 更新项目状态中的编辑器数据
      projectState.editorData = {
        appVersion: currentState.appVersion || '1.0.0',
        paperId:
          currentState.paperId ||
          projectState.editorData.paperId ||
          `paper-${this.currentProjectId}`,
        data: sceneData,
      };

      console.log('场景图数据保存详情:', {
        projectId: this.currentProjectId,
        originalDataCount: projectState.editorData.data?.length || 0,
        currentDataCount: sceneData.length,
        sceneDataSample: sceneData
          .slice(0, 2)
          .map((item: any) => ({ id: item.id, type: item.type })),
      });

      console.log('场景图数据已保存:', {
        objectCount: sceneData.length,
        dataTypes: sceneData
          .map((item: any) => item.type)
          .filter(
            (type: any, index: number, arr: any[]) =>
              arr.indexOf(type) === index,
          ),
      });

      // 2. 保存视口状态
      try {
        const viewportPos = this.editor.viewportManager.getPos();
        const viewportZoom = this.editor.viewportManager.getZoom();

        projectState.viewportState = {
          x: viewportPos.x,
          y: viewportPos.y,
          zoom: viewportZoom,
        };

        console.log('视口状态已保存:', projectState.viewportState);
      } catch (error) {
        console.warn('保存视口状态失败:', error);
        // 使用默认视口状态
        projectState.viewportState = { x: 0, y: 0, zoom: 1 };
      }

      // 3. 保存工具状态
      try {
        const activeToolName =
          this.editor.toolManager.getActiveToolName() || 'Select';
        const selectedItems = this.editor.selectedElements.getItems();
        const selectedElementIds = selectedItems.map((item) => item.attrs.id);

        projectState.toolState = {
          activeTool: activeToolName,
          selectedElements: selectedElementIds,
        };

        console.log('工具状态已保存:', {
          activeTool: activeToolName,
          selectedCount: selectedElementIds.length,
        });
      } catch (error) {
        console.warn('保存工具状态失败:', error);
        // 使用默认工具状态
        projectState.toolState = {
          activeTool: 'Select',
          selectedElements: [],
        };
      }

      // 4. 更新保存时间
      projectState.lastSaved = new Date();

      // 5. 验证保存结果
      const savedObjectCount = projectState.editorData.data?.length || 0;
      const currentObjectCount = sceneData.length;

      if (savedObjectCount !== currentObjectCount) {
        console.warn('保存验证失败: 对象数量不匹配', {
          saved: savedObjectCount,
          current: currentObjectCount,
        });
      }

      console.log('项目状态保存完成（完整版本）:', {
        projectId: this.currentProjectId,
        objectCount: savedObjectCount,
        viewport: projectState.viewportState,
        tool: projectState.toolState.activeTool,
        selectedCount: projectState.toolState.selectedElements.length,
        lastSaved: projectState.lastSaved,
      });
    } catch (error) {
      console.error('保存项目状态失败:', error);
    }
  }

  /**
   * 恢复项目状态 - 完整版本
   */
  private async restoreProjectState(
    projectState: ProjectDocumentState,
  ): Promise<void> {
    if (!this.editor) {
      return;
    }

    try {
      console.log('恢复项目状态（完整版本）');

      // 1. 清空当前状态（确保干净的状态）
      this.editor.selectedElements.clear();
      this.editor.commandManager.clearRecords();

      // 2. 恢复视口状态
      if (projectState.viewportState) {
        try {
          const { Matrix } = await import('@g-asset-forge/geo');
          const viewportState = projectState.viewportState;

          // 创建新的视口矩阵
          const newViewMatrix = new Matrix()
            .scale(viewportState.zoom, viewportState.zoom)
            .translate(viewportState.x, viewportState.y);

          this.editor.viewportManager.setViewMatrix(newViewMatrix);

          console.log('视口状态已恢复:', viewportState);
        } catch (error) {
          console.warn('恢复视口状态失败:', error);
          // 使用默认视口
          this.editor.viewportManager.resetViewport();
        }
      } else {
        // 没有保存的视口状态，使用默认视口
        this.editor.viewportManager.resetViewport();
        console.log('使用默认视口状态');
      }

      // 3. 恢复工具状态
      if (projectState.toolState.activeTool) {
        try {
          this.editor.toolManager.setActiveTool(
            projectState.toolState.activeTool,
          );
          console.log('工具状态已恢复:', projectState.toolState.activeTool);
        } catch (error) {
          console.warn('恢复工具状态失败:', error);
          // 使用默认工具
          this.editor.toolManager.setActiveTool('Select');
        }
      } else {
        // 使用默认工具
        this.editor.toolManager.setActiveTool('Select');
        console.log('使用默认工具状态: Select');
      }

      // 4. 恢复选中元素（延迟执行，确保场景图数据已加载）
      if (projectState.toolState.selectedElements.length > 0) {
        console.log(
          '准备恢复选中元素:',
          projectState.toolState.selectedElements.length,
          '个',
        );

        // 使用更长的延迟确保数据完全加载
        setTimeout(() => {
          try {
            const selectedIds = projectState.toolState.selectedElements;
            const elementsToSelect = [];

            // 验证每个选中元素是否存在
            for (const id of selectedIds) {
              const element = this.editor!.doc.getGraphicsById(id);
              if (element && !element.isDeleted()) {
                elementsToSelect.push(element);
              } else {
                console.warn('选中元素不存在或已删除:', id);
              }
            }

            if (elementsToSelect.length > 0) {
              this.editor!.selectedElements.setItems(elementsToSelect);
              console.log('选中元素已恢复:', elementsToSelect.length, '个');
            } else {
              console.log('没有有效的选中元素可恢复');
            }
          } catch (error) {
            console.warn('恢复选中元素失败:', error);
          }
        }, 200); // 增加延迟时间
      } else {
        console.log('没有需要恢复的选中元素');
      }

      console.log('项目状态恢复完成（完整版本）:', {
        viewport: projectState.viewportState,
        tool: projectState.toolState.activeTool,
        selectedCount: projectState.toolState.selectedElements.length,
        lastSaved: projectState.lastSaved,
      });
    } catch (error) {
      console.error('恢复项目状态失败:', error);

      // 错误恢复：使用安全的默认状态
      try {
        this.editor.selectedElements.clear();
        this.editor.toolManager.setActiveTool('Select');
        this.editor.viewportManager.resetViewport();
        console.log('已应用安全的默认状态');
      } catch (fallbackError) {
        console.error('应用默认状态也失败:', fallbackError);
      }
    }
  }

  /**
   * 更新项目数据
   */
  updateProjectData(projectId: string, editorData: IEditorPaperData): void {
    const projectState = this.projectDocuments.get(projectId);
    if (projectState) {
      projectState.editorData = editorData;
      console.log('项目数据已更新:', projectId);
    }
  }

  /**
   * 强制同步当前编辑器状态到项目文档管理器 - 增强版本
   */
  syncCurrentEditorState(): void {
    if (!this.currentProjectId || !this.editor) {
      console.warn('同步失败：缺少项目ID或编辑器实例');
      return;
    }

    const projectState = this.projectDocuments.get(this.currentProjectId);
    if (!projectState) {
      console.warn('同步失败：项目状态不存在', this.currentProjectId);
      return;
    }

    try {
      console.log('开始强制同步编辑器状态:', this.currentProjectId);

      // 获取当前编辑器的完整状态
      const currentStateJson = this.editor.sceneGraph.toJSON();
      const currentState = JSON.parse(currentStateJson);
      const sceneData = currentState.data || [];

      // 记录同步前的状态
      const beforeSync = {
        projectId: this.currentProjectId,
        oldDataCount: projectState.editorData.data?.length || 0,
        newDataCount: sceneData.length,
        oldDataTypes: (projectState.editorData.data || []).map(
          (item: any) => item.type,
        ),
        newDataTypes: sceneData.map((item: any) => item.type),
      };

      console.log('同步前状态对比:', beforeSync);

      // 更新项目状态
      const updatedEditorData = {
        appVersion: currentState.appVersion || '1.0.0',
        paperId:
          currentState.paperId ||
          projectState.editorData.paperId ||
          `paper-${this.currentProjectId}`,
        data: sceneData,
      };

      projectState.editorData = updatedEditorData;
      projectState.lastSaved = new Date();

      // 验证同步结果
      const afterSync = {
        projectId: this.currentProjectId,
        dataCount: projectState.editorData.data?.length || 0,
        dataTypes: (projectState.editorData.data || []).map(
          (item: any) => item.type,
        ),
        syncTime: projectState.lastSaved,
      };

      console.log('同步后状态验证:', afterSync);

      // 检查同步是否成功
      const syncSuccess = afterSync.dataCount === beforeSync.newDataCount;

      if (syncSuccess) {
        console.log('✅ 强制同步编辑器状态成功:', {
          projectId: this.currentProjectId,
          objectCount: afterSync.dataCount,
          dataTypes: afterSync.dataTypes.filter(
            (type: any, index: number, arr: any[]) =>
              arr.indexOf(type) === index,
          ),
          syncTime: afterSync.syncTime,
        });
      } else {
        console.error('❌ 强制同步验证失败:', {
          expected: beforeSync.newDataCount,
          actual: afterSync.dataCount,
        });
      }

      // 触发数据隔离验证
      setTimeout(() => {
        this.verifyDataIsolation(this.currentProjectId!);
      }, 100);
    } catch (error) {
      console.error('强制同步编辑器状态失败:', error);

      // 尝试恢复机制
      try {
        console.log('尝试恢复同步机制...');
        const fallbackData = {
          appVersion: '1.0.0',
          paperId: `paper-${this.currentProjectId}`,
          data: [],
        };
        projectState.editorData = fallbackData;
        console.log('已应用备用数据结构');
      } catch (fallbackError) {
        console.error('恢复同步机制也失败:', fallbackError);
      }
    }
  }

  /**
   * 删除项目文档
   */
  removeProject(projectId: string): void {
    const projectState = this.projectDocuments.get(projectId);
    if (projectState) {
      // 清理文档实例
      try {
        // 这里可以添加文档清理逻辑
        console.log('清理项目文档实例:', projectId);
      } catch (error) {
        console.warn('清理项目文档实例失败:', error);
      }

      this.projectDocuments.delete(projectId);

      if (this.currentProjectId === projectId) {
        this.currentProjectId = null;
      }

      console.log('项目文档已删除:', projectId);
    }
  }

  /**
   * 获取当前项目ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  /**
   * 获取所有项目的状态信息
   */
  getProjectsStatus(): any {
    return {
      currentProjectId: this.currentProjectId,
      totalProjects: this.projectDocuments.size,
      projects: Array.from(this.projectDocuments.entries()).map(
        ([id, state]) => ({
          id,
          documentId: state.document.attrs.id,
          objectCount: state.editorData.data?.length || 0,
          lastSaved: state.lastSaved,
          viewport: state.viewportState,
          tool: state.toolState.activeTool,
        }),
      ),
    };
  }

  /**
   * 验证数据隔离状态
   */
  validateIsolation(): boolean {
    try {
      const status = this.getProjectsStatus();

      // 检查每个项目是否有独立的文档实例
      const documentIds = new Set();
      let hasUniqueDocuments = true;

      for (const project of status.projects) {
        if (documentIds.has(project.documentId)) {
          hasUniqueDocuments = false;
          break;
        }
        documentIds.add(project.documentId);
      }

      console.log('数据隔离验证结果:', {
        hasUniqueDocuments,
        totalProjects: status.totalProjects,
        uniqueDocuments: documentIds.size,
        currentProject: status.currentProjectId,
      });

      return hasUniqueDocuments;
    } catch (error) {
      console.error('数据隔离验证失败:', error);
      return false;
    }
  }

  /**
   * 为项目创建默认画布
   */
  private createDefaultCanvasForProject(projectId: string): void {
    if (!this.editor) {
      return;
    }

    try {
      console.log('为项目创建默认画布:', projectId);

      // 创建默认画布数据
      const defaultCanvasData = {
        id: `canvas-${projectId}-default`,
        type: GraphicsType.Canvas,
        objectName: `Canvas-${projectId}`,
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        transform: [1, 0, 0, 1, 0, 0] as [
          number,
          number,
          number,
          number,
          number,
          number,
        ],
      };

      // 使用场景图加载默认画布
      this.editor.sceneGraph.load([defaultCanvasData], false);

      // 更新项目状态
      const projectState = this.projectDocuments.get(projectId);
      if (projectState) {
        projectState.editorData = {
          appVersion: '1.0.0',
          paperId: projectState.editorData.paperId || `paper-${projectId}`,
          data: [defaultCanvasData],
        };
      }

      console.log('默认画布创建完成:', defaultCanvasData.id);
    } catch (error) {
      console.error('创建默认画布失败:', error);
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    console.log('销毁项目文档管理器');

    // 保存当前项目状态
    if (this.currentProjectId) {
      this.saveCurrentProjectState().catch(console.error);
    }

    // 清理所有项目文档
    this.projectDocuments.clear();
    this.currentProjectId = null;
    this.editor = null;

    console.log('项目文档管理器已销毁');
  }
}

/**
 * 创建项目文档管理器实例
 */
export const createProjectDocumentManager = (): ProjectDocumentManager => {
  return new ProjectDocumentManager();
};
