import { FileReadService } from '@g-asset-forge/core';

/**
 * 模板导入导出工具函数
 * 提供文件下载和上传的便捷方法
 * 使用 FileReadService 进行文件读取操作
 */

/**
 * 下载模板文件
 */
export const downloadTemplateFile = (
  content: string,
  filename: string,
  mimeType: string = 'application/json',
): void => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('下载文件失败:', error);
    throw new Error('下载文件失败');
  }
};

/**
 * 选择并读取模板文件
 * 使用 FileReadService 进行文件读取
 */
export const selectAndReadTemplateFile = async (): Promise<{
  file: File;
  content: string;
}> => {
  const fileReadService = new FileReadService();

  try {
    // 选择文件
    const files = await fileReadService.selectAndReadFiles('.json,.gaf', false);
    const file = files[0];

    // 读取文件内容
    const content = await fileReadService.readTextFile(file);

    return { file, content };
  } catch (error) {
    throw new Error(
      `读取模板文件失败: ${
        error instanceof Error ? error.message : '未知错误'
      }`,
    );
  }
};

/**
 * 批量下载模板文件
 */
export const downloadMultipleTemplateFiles = async (
  templates: Array<{
    name: string;
    content: string;
  }>,
): Promise<void> => {
  try {
    // 如果只有一个文件，直接下载
    if (templates.length === 1) {
      downloadTemplateFile(templates[0].content, `${templates[0].name}.json`);
      return;
    }

    // 多个文件时，创建ZIP包（简化版本，实际可使用JSZip库）
    const combinedContent = {
      templates: templates.map((t) => ({
        name: t.name,
        data: JSON.parse(t.content),
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    downloadTemplateFile(
      JSON.stringify(combinedContent, null, 2),
      `templates_batch_${Date.now()}.json`,
    );
  } catch (error) {
    console.error('批量下载失败:', error);
    throw new Error('批量下载失败');
  }
};

/**
 * 验证模板文件格式
 */
export const validateTemplateFile = (
  content: string,
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  };

  try {
    const data = JSON.parse(content);

    // 检查基本结构
    if (!data || typeof data !== 'object') {
      result.errors.push('文件格式不正确');
      result.isValid = false;
      return result;
    }

    // 检查是否为单个模板
    if (data.template) {
      const template = data.template;

      // 必需字段检查
      const requiredFields = ['id', 'name', 'type', 'editorData'];
      for (const field of requiredFields) {
        if (!template[field]) {
          result.errors.push(`缺少必需字段: ${field}`);
          result.isValid = false;
        }
      }

      // 类型检查
      if (template.type && !['design', 'h5'].includes(template.type)) {
        result.warnings.push('模板类型不在预期范围内');
      }

      // 编辑器数据检查
      if (template.editorData && !template.editorData.data) {
        result.warnings.push('编辑器数据格式可能不正确');
      }
    }
    // 检查是否为批量模板
    else if (data.templates && Array.isArray(data.templates)) {
      if (data.templates.length === 0) {
        result.warnings.push('批量文件中没有模板');
      }

      for (let i = 0; i < data.templates.length; i++) {
        const template = data.templates[i];
        if (!template.name || !template.data) {
          result.warnings.push(`第${i + 1}个模板数据不完整`);
        }
      }
    } else {
      result.errors.push('无法识别的文件格式');
      result.isValid = false;
    }
  } catch (error) {
    result.errors.push('JSON格式错误');
    result.isValid = false;
  }

  return result;
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 生成安全的文件名
 */
export const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '_') // 空格替换为下划线
    .toLowerCase();
};
