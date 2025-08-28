import { type ProjectData, type ProjectSettings } from './types';

/**
 * 项目工具函数
 */

/**
 * 验证项目名称
 */
export function validateProjectName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '项目名称不能为空' };
  }

  if (name.length > 50) {
    return { valid: false, error: '项目名称不能超过50个字符' };
  }

  // 检查特殊字符
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return {
      valid: false,
      error: '项目名称不能包含特殊字符 < > : " / \\ | ? *',
    };
  }

  return { valid: true };
}

/**
 * 生成项目缩略图数据URL
 */
export function generateProjectThumbnail(
  canvas: HTMLCanvasElement,
  width = 200,
  height = 150,
): string {
  try {
    // 创建临时canvas用于生成缩略图
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = width;
    thumbnailCanvas.height = height;

    const ctx = thumbnailCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取canvas上下文');
    }

    // 设置白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 计算缩放比例，保持宽高比
    const scaleX = width / canvas.width;
    const scaleY = height / canvas.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    const offsetX = (width - scaledWidth) / 2;
    const offsetY = (height - scaledHeight) / 2;

    // 绘制缩放后的内容
    ctx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight,
    );

    return thumbnailCanvas.toDataURL('image/png', 0.8);
  } catch (error) {
    console.error('生成缩略图失败:', error);
    return '';
  }
}

/**
 * 计算项目文件大小（字节）
 */
export function calculateProjectSize(project: ProjectData): number {
  return JSON.stringify(project).length * 2; // UTF-16编码，每个字符2字节
}

/**
 * 格式化文件大小显示
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间显示
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}

/**
 * 深度克隆项目数据
 */
export function cloneProjectData(project: ProjectData): ProjectData {
  return JSON.parse(JSON.stringify(project));
}

/**
 * 合并项目设置
 */
export function mergeProjectSettings(
  base: ProjectSettings,
  override: Partial<ProjectSettings>,
): ProjectSettings {
  return {
    ...base,
    ...override,
  };
}

/**
 * 检查项目数据完整性
 */
export function validateProjectData(project: any): project is ProjectData {
  if (!project || typeof project !== 'object') {
    return false;
  }

  const requiredFields = [
    'id',
    'name',
    'type',
    'editorData',
    'settings',
    'createdAt',
    'updatedAt',
    'lastOpenedAt',
    'version',
    'appVersion',
  ];

  for (const field of requiredFields) {
    if (!(field in project)) {
      console.error(`项目数据缺少必需字段: ${field}`);
      return false;
    }
  }

  // 检查类型字段
  if (!['design', 'h5'].includes(project.type)) {
    console.error('项目类型无效:', project.type);
    return false;
  }

  // 检查编辑器数据
  if (
    !project.editorData ||
    !project.editorData.paperId ||
    !Array.isArray(project.editorData.data)
  ) {
    console.error('编辑器数据格式无效');
    return false;
  }

  return true;
}

/**
 * 生成项目导出文件名
 */
export function generateExportFileName(
  projectName: string,
  format: string,
  timestamp?: Date,
): string {
  const cleanName = projectName.replace(/[<>:"/\\|?*]/g, '_');
  const timeStr = timestamp
    ? `_${timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}`
    : '';
  return `${cleanName}${timeStr}.${format}`;
}

/**
 * 检查浏览器存储空间
 */
export function checkStorageQuota(): Promise<{
  used: number;
  total: number;
  available: number;
}> {
  return new Promise((resolve) => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage
        .estimate()
        .then((estimate) => {
          const used = estimate.usage || 0;
          const total = estimate.quota || 0;
          const available = total - used;

          resolve({ used, total, available });
        })
        .catch(() => {
          // 降级处理
          resolve({
            used: 0,
            total: 5 * 1024 * 1024,
            available: 5 * 1024 * 1024,
          });
        });
    } else {
      // 降级处理，假设5MB限制
      resolve({ used: 0, total: 5 * 1024 * 1024, available: 5 * 1024 * 1024 });
    }
  });
}
