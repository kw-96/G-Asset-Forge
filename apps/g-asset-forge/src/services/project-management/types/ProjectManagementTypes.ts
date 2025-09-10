/**
 * 项目管理相关类型定义
 */

import type {
  ProjectData,
  ProjectMetadata,
  ProjectType,
  ProjectTypeIdentificationResult,
} from '@g-asset-forge/core';

/**
 * 项目管理事件接口
 */
export interface ProjectManagementEvents {
  projectOpened: (project: ProjectData) => void;
  projectClosed: (projectId: string) => void;
  projectSaved: (project: ProjectData) => void;
  projectRenamed: (projectId: string, newName: string) => void;
  projectDeleted: (projectId: string) => void;
  projectCreated: (project: ProjectData) => void;
  projectAutoExported: (project: ProjectData) => void;
  autoExportError: (projectId: string, error: any) => void;
  projectTypeChanged: (
    projectId: string,
    oldType: ProjectType | null,
    newType: ProjectType,
  ) => void;
  projectTypeIdentified: (
    projectId: string,
    result: ProjectTypeIdentificationResult,
  ) => void;
  projectModeChanged: (mode: string) => void;
  projectsListUpdated: (projects: ProjectMetadata[]) => void;
  error: (error: Error) => void;
}

/**
 * 项目生命周期状态
 */
export enum ProjectLifecycleState {
  IDLE = 'idle',
  LOADING = 'loading',
  SAVING = 'saving',
  DELETING = 'deleting',
  RENAMING = 'renaming',
  ERROR = 'error',
}

/**
 * 项目操作结果
 */
export interface ProjectOperationResult {
  success: boolean;
  error?: Error;
  data?: any;
}

/**
 * 项目初始化配置
 */
export interface ProjectInitConfig {
  projectId: string;
  projectData: ProjectData;
  projectType: ProjectType;
  editor?: any;
}

/**
 * 项目状态信息
 */
export interface ProjectStateInfo {
  projectId: string | null;
  projectType: ProjectType | null;
  lifecycleState: ProjectLifecycleState;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
}

/**
 * 自动保存配置
 */
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number;
  maxRetries: number;
}

/**
 * 自动导出配置
 */
export interface AutoExportConfig {
  enabled: boolean;
  format: string[];
  quality: number;
  includeMetadata: boolean;
}
