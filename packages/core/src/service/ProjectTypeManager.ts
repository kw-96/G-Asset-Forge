/**
 * 项目类型管理器
 * 负责项目类型识别、管理和缓存，替代全局 window 对象标记方式
 */

import { EventEmitter } from '@g-asset-forge/common';

import type { IEditorPaperData } from '../type';

/**
 * 项目类型枚举
 */
export enum ProjectType {
  DESIGN = 'design',
  H5 = 'h5',
}

/**
 * 项目类型识别结果
 */
export interface ProjectTypeIdentificationResult {
  type: ProjectType;
  confidence: number; // 识别置信度 0-1
  evidence: string[]; // 识别依据
  metadata?: Record<string, any>; // 额外元数据
}

/**
 * 项目类型管理器事件
 */
interface ProjectTypeManagerEvents {
  typeChanged: (oldType: ProjectType | null, newType: ProjectType) => void;
  typeIdentified: (result: ProjectTypeIdentificationResult) => void;
  cacheUpdated: (projectId: string, type: ProjectType) => void;
}

/**
 * 项目类型识别器
 * 提供多种识别策略来确定项目类型
 */
export class ProjectTypeIdentifier {
  /**
   * 从项目数据识别项目类型
   */
  static identifyFromProjectData(
    projectData: any,
  ): ProjectTypeIdentificationResult {
    const evidence: string[] = [];
    let confidence = 0;
    let type = ProjectType.DESIGN; // 默认为设计项目

    // 策略1: 检查明确的类型标识
    if (projectData?.type) {
      if (projectData.type === 'h5' || projectData.type === ProjectType.H5) {
        evidence.push('项目数据包含明确的H5类型标识');
        confidence += 0.9;
        type = ProjectType.H5;
      } else if (
        projectData.type === 'design' ||
        projectData.type === ProjectType.DESIGN
      ) {
        evidence.push('项目数据包含明确的设计类型标识');
        confidence += 0.9;
        type = ProjectType.DESIGN;
      }
    }

    // 策略2: 检查H5Container存在性
    if (this.hasH5Container(projectData)) {
      evidence.push('项目数据包含H5Container元素');
      confidence += 0.8;
      type = ProjectType.H5;
    }

    // 策略3: 检查H5特定字段
    if (projectData?.h5Container || projectData?.contentBlocks) {
      evidence.push('项目数据包含H5特定字段');
      confidence += 0.7;
      type = ProjectType.H5;
    }

    // 策略4: 检查编辑器数据结构
    if (projectData?.editorData) {
      const editorTypeResult = this.identifyFromEditorData(
        projectData.editorData,
      );
      if (editorTypeResult.type === ProjectType.H5) {
        evidence.push(...editorTypeResult.evidence);
        confidence = Math.max(confidence, editorTypeResult.confidence);
        type = ProjectType.H5;
      }
    }

    // 确保置信度在合理范围内
    confidence = Math.min(confidence, 1.0);
    if (confidence === 0) {
      confidence = 0.5; // 默认置信度
      evidence.push('使用默认项目类型识别');
    }

    return {
      type,
      confidence,
      evidence,
      metadata: {
        hasExplicitType: !!projectData?.type,
        hasH5Container: this.hasH5Container(projectData),
        hasH5Fields: !!(projectData?.h5Container || projectData?.contentBlocks),
      },
    };
  }

  /**
   * 从编辑器数据识别项目类型
   */
  static identifyFromEditorData(
    editorData: IEditorPaperData | any,
  ): ProjectTypeIdentificationResult {
    const evidence: string[] = [];
    let confidence = 0;
    let type = ProjectType.DESIGN;

    if (!editorData || !editorData.data || !Array.isArray(editorData.data)) {
      return {
        type: ProjectType.DESIGN,
        confidence: 0.3,
        evidence: ['编辑器数据结构无效，使用默认类型'],
      };
    }

    // 检查数据中的元素类型
    const elementTypes = editorData.data.map(
      (item: any) => item.type || item.attrs?.type,
    );
    const h5ContainerCount = elementTypes.filter(
      (type: string) =>
        type === 'H5Container' ||
        type === 'H5TextBlock' ||
        type === 'H5ImageBlock' ||
        type === 'H5ButtonBlock',
    ).length;

    if (h5ContainerCount > 0) {
      evidence.push(`发现${h5ContainerCount}个H5相关元素`);
      confidence = 0.9;
      type = ProjectType.H5;
    }

    // 检查特定的H5Container
    const hasH5Container = editorData.data.some((item: any) => {
      return (
        item.type === 'H5Container' ||
        item.attrs?.type === 'H5Container' ||
        (item.type && item.type.toString() === 'H5Container')
      );
    });

    if (hasH5Container) {
      evidence.push('编辑器数据包含H5Container');
      confidence = Math.max(confidence, 0.95);
      type = ProjectType.H5;
    }

    // 如果没有H5元素，检查是否有标准设计元素
    if (confidence === 0) {
      const designElements = elementTypes.filter((type: string) =>
        ['Rect', 'Ellipse', 'Text', 'Image', 'Group', 'Path'].includes(type),
      ).length;

      if (designElements > 0) {
        evidence.push(`发现${designElements}个标准设计元素`);
        confidence = 0.7;
        type = ProjectType.DESIGN;
      }
    }

    return {
      type,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        elementCount: editorData.data.length,
        elementTypes: [...new Set(elementTypes)],
        h5ElementCount: h5ContainerCount,
      },
    };
  }

  /**
   * 从文件名或路径识别项目类型
   */
  static identifyFromFileName(
    fileName: string,
  ): ProjectTypeIdentificationResult {
    const evidence: string[] = [];
    let confidence = 0;
    let type = ProjectType.DESIGN;

    // H5项目文件名模式
    const h5Patterns = [/h5/i, /mobile/i, /长图/i, /longpage/i, /landing/i];

    for (const pattern of h5Patterns) {
      if (pattern.test(fileName)) {
        evidence.push(`文件名匹配H5模式: ${pattern.source}`);
        confidence = 0.6;
        type = ProjectType.H5;
        break;
      }
    }

    // 设计项目文件名模式
    const designPatterns = [/design/i, /ui/i, /界面/i, /设计/i];

    if (confidence === 0) {
      for (const pattern of designPatterns) {
        if (pattern.test(fileName)) {
          evidence.push(`文件名匹配设计模式: ${pattern.source}`);
          confidence = 0.5;
          type = ProjectType.DESIGN;
          break;
        }
      }
    }

    if (confidence === 0) {
      evidence.push('文件名无明确类型指示，使用默认类型');
      confidence = 0.3;
    }

    return {
      type,
      confidence,
      evidence,
      metadata: {
        fileName,
        matchedPatterns: evidence.length > 0,
      },
    };
  }

  /**
   * 检查项目数据是否包含H5Container
   */
  private static hasH5Container(projectData: any): boolean {
    // 检查顶层H5Container字段
    if (projectData?.h5Container) {
      return true;
    }

    // 检查编辑器数据中的H5Container
    if (projectData?.editorData?.data) {
      return projectData.editorData.data.some((item: any) => {
        return (
          item.type === 'H5Container' ||
          item.attrs?.type === 'H5Container' ||
          (item.type && item.type.toString() === 'H5Container')
        );
      });
    }

    // 检查直接的data字段
    if (Array.isArray(projectData?.data)) {
      return projectData.data.some((item: any) => {
        return (
          item.type === 'H5Container' ||
          item.attrs?.type === 'H5Container' ||
          (item.type && item.type.toString() === 'H5Container')
        );
      });
    }

    return false;
  }
}

/**
 * 项目类型管理器
 * 负责项目类型的识别、管理、缓存和验证
 */
export class ProjectTypeManager extends EventEmitter<ProjectTypeManagerEvents> {
  private currentProjectType: ProjectType | null = null;
  private currentProjectId: string | null = null;
  private typeCache = new Map<string, ProjectType>();
  private identificationHistory = new Map<
    string,
    ProjectTypeIdentificationResult
  >();

  constructor() {
    super();
  }

  /**
   * 识别项目类型
   */
  identifyProjectType(
    projectData: any,
    projectId?: string,
    fileName?: string,
  ): ProjectTypeIdentificationResult {
    // 优先从缓存获取
    if (projectId && this.typeCache.has(projectId)) {
      const cachedType = this.typeCache.get(projectId)!;
      return {
        type: cachedType,
        confidence: 1.0,
        evidence: ['从缓存获取项目类型'],
        metadata: { fromCache: true },
      };
    }

    // 综合多种识别策略
    const results: ProjectTypeIdentificationResult[] = [];

    // 策略1: 从项目数据识别
    results.push(ProjectTypeIdentifier.identifyFromProjectData(projectData));

    // 策略2: 从文件名识别（如果提供）
    if (fileName) {
      results.push(ProjectTypeIdentifier.identifyFromFileName(fileName));
    }

    // 选择置信度最高的结果
    const bestResult = results.reduce((best, current) =>
      current.confidence > best.confidence ? current : best,
    );

    // 合并所有证据
    const combinedEvidence = results.flatMap((r) => r.evidence);
    const finalResult: ProjectTypeIdentificationResult = {
      ...bestResult,
      evidence: [...new Set(combinedEvidence)], // 去重
      metadata: {
        ...bestResult.metadata,
        strategiesUsed: results.length,
        allResults: results,
      },
    };

    // 缓存结果
    if (projectId) {
      this.cacheProjectType(projectId, finalResult.type);
      this.identificationHistory.set(projectId, finalResult);
    }

    // 发射识别事件
    this.emit('typeIdentified', finalResult);

    return finalResult;
  }

  /**
   * 设置当前项目类型
   */
  setCurrentProjectType(projectId: string, type: ProjectType): void {
    const oldType = this.currentProjectType;

    this.currentProjectId = projectId;
    this.currentProjectType = type;

    // 更新缓存
    this.cacheProjectType(projectId, type);

    // 发射类型变更事件
    if (oldType !== type) {
      this.emit('typeChanged', oldType, type);
    }
  }

  /**
   * 获取当前项目类型
   */
  getCurrentProjectType(): ProjectType | null {
    return this.currentProjectType;
  }

  /**
   * 获取当前项目ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }

  /**
   * 检查是否为H5项目
   */
  isH5Project(projectId?: string): boolean {
    if (projectId) {
      return this.typeCache.get(projectId) === ProjectType.H5;
    }
    return this.currentProjectType === ProjectType.H5;
  }

  /**
   * 检查是否为设计项目
   */
  isDesignProject(projectId?: string): boolean {
    if (projectId) {
      return this.typeCache.get(projectId) === ProjectType.DESIGN;
    }
    return this.currentProjectType === ProjectType.DESIGN;
  }

  /**
   * 缓存项目类型
   */
  private cacheProjectType(projectId: string, type: ProjectType): void {
    this.typeCache.set(projectId, type);
    this.emit('cacheUpdated', projectId, type);
  }

  /**
   * 获取项目类型（从缓存或识别）
   */
  getProjectType(projectId: string, projectData?: any): ProjectType | null {
    // 先尝试从缓存获取
    if (this.typeCache.has(projectId)) {
      return this.typeCache.get(projectId)!;
    }

    // 如果有项目数据，进行识别
    if (projectData) {
      const result = this.identifyProjectType(projectData, projectId);
      return result.type;
    }

    return null;
  }

  /**
   * 验证项目类型
   */
  validateProjectType(
    projectId: string,
    expectedType: ProjectType,
    projectData?: any,
  ): boolean {
    const actualType = this.getProjectType(projectId, projectData);

    if (actualType === null) {
      return false;
    }

    const isValid = actualType === expectedType;

    if (!isValid) {
      console.warn(
        `项目类型验证失败: 期望 ${expectedType}, 实际 ${actualType}`,
        {
          projectId,
          expectedType,
          actualType,
        },
      );
    }

    return isValid;
  }

  /**
   * 清除项目类型缓存
   */
  clearCache(projectId?: string): void {
    if (projectId) {
      this.typeCache.delete(projectId);
      this.identificationHistory.delete(projectId);
    } else {
      this.typeCache.clear();
      this.identificationHistory.clear();
    }
  }

  /**
   * 获取识别历史
   */
  getIdentificationHistory(
    projectId: string,
  ): ProjectTypeIdentificationResult | null {
    return this.identificationHistory.get(projectId) || null;
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    totalCached: number;
    h5Projects: number;
    designProjects: number;
    cacheHitRate: number;
  } {
    const totalCached = this.typeCache.size;
    let h5Projects = 0;
    let designProjects = 0;

    for (const type of this.typeCache.values()) {
      if (type === ProjectType.H5) {
        h5Projects++;
      } else if (type === ProjectType.DESIGN) {
        designProjects++;
      }
    }

    return {
      totalCached,
      h5Projects,
      designProjects,
      cacheHitRate:
        totalCached > 0 ? (h5Projects + designProjects) / totalCached : 0,
    };
  }

  /**
   * 重置当前项目状态
   */
  resetCurrentProject(): void {
    const oldType = this.currentProjectType;
    this.currentProjectType = null;
    this.currentProjectId = null;

    if (oldType !== null) {
      this.emit('typeChanged', oldType, null as any);
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearCache();
    this.resetCurrentProject();
    // 清理所有事件监听器
    (this as any).eventMap = {};
  }
}

/**
 * 全局项目类型管理器实例
 */
export const globalProjectTypeManager = new ProjectTypeManager();
