import {
  type TemplateCategory,
  type TemplateData,
  TemplateIntegrationService,
  type TemplateType,
} from '@g-asset-forge/core';
import { useCallback, useEffect, useState } from 'react';

/**
 * 模板库管理 Hook
 * 提供模板库相关的状态管理和操作方法
 */
export const useTemplateLibrary = () => {
  const [templateService] = useState(() =>
    TemplateIntegrationService.getInstance(),
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模板数据状态
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // 初始化服务
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        await templateService.initialize();
        setIsInitialized(true);

        // 加载初始数据
        await Promise.all([
          loadCategories(),
          loadAvailableTags(),
          searchTemplates(), // 加载默认模板列表
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : '初始化模板服务失败');
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
  }, []);

  // 加载分类列表
  const loadCategories = useCallback(
    async (type?: TemplateType) => {
      try {
        const categoryList = await templateService.getTemplateCategories(type);
        setCategories(categoryList);
        return categoryList;
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载分类失败');
        return [];
      }
    },
    [templateService],
  );

  // 加载可用标签
  const loadAvailableTags = useCallback(async () => {
    try {
      const tags = await templateService.getAvailableTags();
      setAvailableTags(tags);
      return tags;
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载标签失败');
      return [];
    }
  }, [templateService]);

  // 搜索模板
  const searchTemplates = useCallback(
    async (
      options: {
        keyword?: string;
        type?: TemplateType;
        categoryId?: string;
        tags?: string[];
        sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';
        sortOrder?: 'asc' | 'desc';
        limit?: number;
      } = {},
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await templateService.searchTemplates(options);
        setTemplates(result.templates);
        setTotalCount(result.total);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '搜索模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService],
  );

  // 获取热门模板
  const getPopularTemplates = useCallback(
    async (limit: number = 10) => {
      try {
        const result = await templateService.getPopularTemplates(limit);
        return result.templates;
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取热门模板失败');
        return [];
      }
    },
    [templateService],
  );

  // 获取最新模板
  const getRecentTemplates = useCallback(
    async (limit: number = 10) => {
      try {
        const result = await templateService.getRecentTemplates(limit);
        return result.templates;
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取最新模板失败');
        return [];
      }
    },
    [templateService],
  );

  // 获取模板详情
  const getTemplateDetail = useCallback(
    async (templateId: string) => {
      try {
        const template = await templateService.getTemplateDetail(templateId);
        return template;
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取模板详情失败');
        return undefined;
      }
    },
    [templateService],
  );

  // 应用模板到新项目
  const applyTemplateToNewProject = useCallback(
    async (
      templateId: string,
      variableValues: Record<string, any> = {},
      projectName?: string,
    ) => {
      try {
        setIsLoading(true);
        const result = await templateService.applyTemplateToNewProject(
          templateId,
          variableValues,
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '应用模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService],
  );

  // 应用模板到当前项目
  const applyTemplateToCurrentProject = useCallback(
    async (
      templateId: string,
      currentEditorData: any,
      variableValues: Record<string, any> = {},
      mergeMode: 'replace' | 'append' = 'replace',
    ) => {
      try {
        setIsLoading(true);
        const result = await templateService.applyTemplateToCurrentProject(
          templateId,
          currentEditorData,
          variableValues,
          mergeMode,
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '应用模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService],
  );

  // 批量应用模板
  const batchApplyTemplate = useCallback(
    async (
      templateId: string,
      batchParams: Array<{
        variableValues: Record<string, any>;
        outputName: string;
      }>,
    ) => {
      try {
        setIsLoading(true);
        const results = await templateService.batchApplyTemplate(
          templateId,
          batchParams,
        );
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '批量应用模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService],
  );

  // 从当前项目创建模板
  const createTemplateFromProject = useCallback(
    async (
      editorData: any,
      templateInfo: {
        name: string;
        description: string;
        type: 'design' | 'h5';
        categoryId: string;
        tags?: string[];
        author?: string;
      },
      variableDefinitions: Array<{
        name: string;
        type: 'text' | 'image' | 'color';
        targetObjectIds: string[];
        targetProperty: string;
        description?: string;
        defaultValue?: any;
      }> = [],
    ) => {
      try {
        setIsLoading(true);
        const template = await templateService.createTemplateFromProject(
          editorData,
          templateInfo,
          variableDefinitions,
        );

        // 刷新模板列表
        await searchTemplates();

        return template;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '创建模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService, searchTemplates],
  );

  // 识别可变元素
  const identifyVariableElements = useCallback(
    async (editorData: any) => {
      try {
        const elements = await templateService.identifyVariableElements(
          editorData,
        );
        return elements;
      } catch (err) {
        setError(err instanceof Error ? err.message : '识别可变元素失败');
        return [];
      }
    },
    [templateService],
  );

  // 导出模板
  const exportTemplate = useCallback(
    async (templateId: string, exportedBy?: string) => {
      try {
        setIsLoading(true);
        const exportData = await templateService.exportTemplate(
          templateId,
          exportedBy,
        );
        return exportData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '导出模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService],
  );

  // 批量导出模板
  const exportTemplates = useCallback(
    async (templateIds: string[], exportedBy?: string) => {
      try {
        setIsLoading(true);
        const exportData = await templateService.exportTemplates(
          templateIds,
          exportedBy,
        );
        return exportData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '批量导出模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService],
  );

  // 导入模板文件
  const importTemplateFile = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);
        const result = await templateService.importTemplateFile(file);

        // 刷新模板列表
        await searchTemplates();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '导入模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService, searchTemplates],
  );

  // 删除模板
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        setIsLoading(true);
        await templateService.deleteTemplate(templateId);

        // 刷新模板列表
        await searchTemplates();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '删除模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService, searchTemplates],
  );

  // 批量删除模板
  const deleteTemplates = useCallback(
    async (templateIds: string[]) => {
      try {
        setIsLoading(true);
        const result = await templateService.deleteTemplates(templateIds);

        // 刷新模板列表
        await searchTemplates();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '批量删除模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService, searchTemplates],
  );

  // 复制模板
  const duplicateTemplate = useCallback(
    async (templateId: string, newName?: string) => {
      try {
        setIsLoading(true);
        const duplicatedTemplate = await templateService.duplicateTemplate(
          templateId,
          newName,
        );

        // 刷新模板列表
        await searchTemplates();

        return duplicatedTemplate;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '复制模板失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [templateService, searchTemplates],
  );

  // 获取模板统计
  const getTemplateStats = useCallback(async () => {
    try {
      const stats = await templateService.getTemplateStats();
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取模板统计失败');
      return null;
    }
  }, [templateService]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 状态
    isInitialized,
    isLoading,
    error,
    templates,
    categories,
    availableTags,
    totalCount,

    // 查询方法
    searchTemplates,
    getPopularTemplates,
    getRecentTemplates,
    getTemplateDetail,
    loadCategories,
    loadAvailableTags,

    // 应用方法
    applyTemplateToNewProject,
    applyTemplateToCurrentProject,
    batchApplyTemplate,

    // 创建方法
    createTemplateFromProject,
    identifyVariableElements,

    // 导入导出方法
    exportTemplate,
    exportTemplates,
    importTemplateFile,

    // 管理方法
    deleteTemplate,
    deleteTemplates,
    duplicateTemplate,

    // 统计方法
    getTemplateStats,

    // 工具方法
    clearError,
  };
};
