/**
 * 项目存储服务使用示例
 *
 * 这个文件展示了如何使用 ProjectStorageService 和 ProjectAutoSave
 */

import { type GAssetForgeEditor } from '../editor';
import { ProjectAutoSave, ProjectStorageService } from './index';

/**
 * 基础使用示例
 */
export async function basicUsageExample() {
  // 创建项目存储服务
  const projectStorage = new ProjectStorageService();

  // 创建新项目
  const project = await projectStorage.createProject({
    name: '我的第一个项目',
    description: '这是一个测试项目',
    type: 'design',
    settings: {
      canvasWidth: 1920,
      canvasHeight: 1080,
      backgroundColor: '#f0f0f0',
    },
  });

  console.log('项目创建成功:', project.id);

  // 获取项目列表
  const projects = await projectStorage.getProjectsList();
  console.log('项目列表:', projects);

  // 加载项目
  const loadedProject = await projectStorage.loadProject(project.id);
  console.log('项目加载成功:', loadedProject?.name);

  // 更新项目
  const updatedProject = await projectStorage.updateProject(project.id, {
    name: '更新后的项目名称',
    description: '更新后的描述',
  });
  console.log('项目更新成功:', updatedProject?.name);

  // 创建备份
  const backup = await projectStorage.createBackup(project.id, '手动备份');
  console.log('备份创建成功:', backup?.id);

  // 获取备份列表
  const backups = await projectStorage.getProjectBackups(project.id);
  console.log('备份列表:', backups.length);

  return project;
}

/**
 * 自动保存使用示例
 */
export function autoSaveExample(editor: GAssetForgeEditor) {
  // 创建项目存储服务
  const projectStorage = new ProjectStorageService({
    autoSaveInterval: 5000, // 5秒自动保存
    enableAutoBackup: true,
    autoBackupInterval: 300000, // 5分钟自动备份
    maxBackupCount: 5,
  });

  // 创建自动保存实例
  const autoSave = new ProjectAutoSave(editor, projectStorage);

  // 设置当前项目（假设已有项目ID）
  const projectId = 'existing-project-id';
  autoSave.setCurrentProject(projectId);

  // 手动保存
  autoSave.saveCurrentProject().then((success) => {
    console.log('手动保存结果:', success);
  });

  // 创建手动备份
  autoSave.createBackup('重要节点备份').then((success) => {
    console.log('手动备份结果:', success);
  });

  // 获取项目统计信息
  autoSave.getProjectStats().then((stats) => {
    console.log('项目统计:', stats);
  });

  // 监听事件
  projectStorage.on('projectSaved', (project) => {
    console.log('项目已保存:', project.name);
  });

  projectStorage.on('backupCreated', (backup) => {
    console.log('备份已创建:', backup.name);
  });

  return autoSave;
}

/**
 * 项目管理示例
 */
export async function projectManagementExample() {
  const projectStorage = new ProjectStorageService();

  // 创建多个项目
  const designProject = await projectStorage.createProject({
    name: '设计项目',
    type: 'design',
  });

  const h5Project = await projectStorage.createProject({
    name: 'H5活动页面',
    type: 'h5',
    settings: {
      canvasWidth: 375,
      canvasHeight: 667,
    },
  });

  // 获取存储使用情况
  const usage = projectStorage.getStorageUsage();
  console.log('存储使用情况:', {
    used: `${(usage.used / 1024).toFixed(2)} KB`,
    total: `${(usage.total / 1024 / 1024).toFixed(2)} MB`,
    projects: usage.projects,
    backups: usage.backups,
  });

  // 删除项目
  await projectStorage.deleteProject(designProject.id);
  console.log('设计项目已删除');

  return h5Project;
}

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  const projectStorage = new ProjectStorageService();

  // 监听错误事件
  projectStorage.on('projectSaveError', ({ project, error }: { project: any; error: any }) => {
    console.error('项目保存失败:', project.name, error);
  });

  projectStorage.on('projectLoadError', ({ projectId, error }: { projectId: string; error: any }) => {
    console.error('项目加载失败:', projectId, error);
  });

  try {
    // 尝试加载不存在的项目
    const result = await projectStorage.loadProject('non-existent-id');
    console.log('加载结果:', result); // 应该是 null
  } catch (error) {
    console.error('加载项目时发生错误:', error);
  }

  try {
    // 尝试从不存在的备份恢复
    const result = await projectStorage.restoreFromBackup(
      'non-existent-backup',
    );
    console.log('恢复结果:', result); // 应该是 null
  } catch (error) {
    console.error('恢复备份时发生错误:', error);
  }
}

/**
 * 完整的工作流程示例
 */
export async function completeWorkflowExample(editor: GAssetForgeEditor) {
  console.log('=== 完整工作流程示例 ===');

  // 1. 初始化服务
  const projectStorage = new ProjectStorageService();
  const autoSave = new ProjectAutoSave(editor, projectStorage);

  // 2. 创建新项目
  const project = await projectStorage.createProject({
    name: '完整工作流程测试项目',
    description: '演示完整的项目管理工作流程',
    type: 'design',
  });

  console.log('✓ 项目创建成功:', project.name);

  // 3. 设置自动保存
  autoSave.setCurrentProject(project.id);
  console.log('✓ 自动保存已启用');

  // 4. 模拟编辑操作（实际使用中会通过编辑器操作触发）
  await autoSave.saveCurrentProject();
  console.log('✓ 项目已保存');

  // 5. 创建备份
  await autoSave.createBackup('工作流程测试备份');
  console.log('✓ 备份已创建');

  // 6. 获取项目统计
  const stats = await autoSave.getProjectStats();
  console.log('✓ 项目统计:', stats);

  // 7. 清理（可选）
  // await projectStorage.deleteProject(project.id);
  // console.log('✓ 项目已清理');

  return {
    project,
    autoSave,
    projectStorage,
  };
}
