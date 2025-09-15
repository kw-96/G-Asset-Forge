import { ProjectManagementService } from './ProjectManagementService';

/**
 * ProjectManagementService 全局单例
 * 确保整个应用只有一个实例，避免重复初始化
 */
class ProjectManagementServiceSingleton {
  private static instance: ProjectManagementService | null = null;

  /**
   * 获取 ProjectManagementService 单例实例
   */
  static getInstance(): ProjectManagementService {
    if (!this.instance) {
      this.instance = new ProjectManagementService();
    }
    return this.instance;
  }

  /**
   * 重置单例（仅用于测试）
   */
  static reset(): void {
    this.instance = null;
  }
}

// 导出单例实例
export const projectManagementService =
  ProjectManagementServiceSingleton.getInstance();
export default projectManagementService;
