import {
  type GAssetForgeEditor,
  TemplateIntegrationService,
} from '@g-asset-forge/core';

/**
 * 模板创建服务
 * 提供从编辑器创建模板的功能
 */
export class TemplateCreationService {
  private templateService: TemplateIntegrationService;

  constructor() {
    this.templateService = TemplateIntegrationService.getInstance();
  }

  /**
   * 从当前编辑器状态创建模板
   */
  async createTemplateFromEditor(
    editor: GAssetForgeEditor,
    templateInfo: {
      name: string;
      description: string;
      type: 'design' | 'h5';
      categoryId: string;
      tags?: string[];
      author?: string;
    },
  ) {
    try {
      // 获取当前编辑器数据
      const editorData = this.getEditorData(editor);

      // 识别可变元素
      const variableElements =
        await this.templateService.identifyVariableElements(editorData);

      // 创建模板
      const template = await this.templateService.createTemplateFromProject(
        editorData,
        templateInfo,
        [], // 暂时不添加变量，可以后续扩展
      );

      return {
        template,
        variableElements,
      };
    } catch (error) {
      throw new Error(`创建模板失败: ${error}`);
    }
  }

  /**
   * 获取编辑器数据
   */
  private getEditorData(editor: GAssetForgeEditor) {
    // 获取当前画布数据（已通过画布状态管理器验证）
    const currentCanvas = editor.doc.getCurrentCanvas();
    if (!currentCanvas) {
      throw new Error('没有活动画布');
    }

    // 构建编辑器数据格式
    const editorData = {
      appVersion: '1.0.0', // 添加必需的 appVersion 字段
      paperId: editor.doc.attrs.id,
      data: this.serializeCanvasObjects(currentCanvas),
    };

    return editorData;
  }

  /**
   * 序列化画布对象
   */
  private serializeCanvasObjects(canvas: any): any[] {
    const objects: any[] = [];

    // 遍历画布中的所有对象
    const children = canvas.getChildren();
    for (const child of children) {
      const serialized = this.serializeObject(child);
      if (serialized) {
        objects.push(serialized);
      }
    }

    return objects;
  }

  /**
   * 序列化单个对象
   */
  private serializeObject(obj: any): any {
    if (!obj || !obj.attrs) {
      return null;
    }

    // 基础属性
    const serialized = {
      id: obj.attrs.id,
      type: obj.attrs.type,
      ...obj.attrs,
    };

    // 处理子对象
    const children = obj.getChildren();
    if (children && children.length > 0) {
      serialized.childrenIds = children.map((child: any) => child.attrs.id);
    }

    return serialized;
  }

  /**
   * 生成模板缩略图
   */
  async generateTemplateThumbnail(editor: GAssetForgeEditor): Promise<string> {
    try {
      // 获取画布元素
      const canvas = editor.canvasElement;
      if (!canvas) {
        throw new Error('画布元素不存在');
      }

      // 创建缩略图画布
      const thumbnailCanvas = document.createElement('canvas');
      const thumbnailCtx = thumbnailCanvas.getContext('2d');
      if (!thumbnailCtx) {
        throw new Error('无法创建缩略图上下文');
      }

      // 设置缩略图尺寸
      const thumbnailWidth = 200;
      const thumbnailHeight = 150;
      thumbnailCanvas.width = thumbnailWidth;
      thumbnailCanvas.height = thumbnailHeight;

      // 计算缩放比例
      const scaleX = thumbnailWidth / canvas.width;
      const scaleY = thumbnailHeight / canvas.height;
      const scale = Math.min(scaleX, scaleY);

      // 绘制缩略图
      thumbnailCtx.scale(scale, scale);
      thumbnailCtx.drawImage(canvas, 0, 0);

      // 转换为DataURL
      return thumbnailCanvas.toDataURL('image/png');
    } catch (error) {
      console.warn('生成缩略图失败:', error);
      return this.getDefaultThumbnail();
    }
  }

  /**
   * 获取默认缩略图
   */
  private getDefaultThumbnail(): string {
    const svg = `
      <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="150" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
        <text x="100" y="75" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
          模板预览
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}
