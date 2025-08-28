import { type IEditorPaperData, GraphicsType } from '../../type';
import { TemplateStorageService } from '../template_storage_service';
import { type TemplateData, type TemplateVariable } from '../types';

/**
 * 模板应用服务
 * 负责模板的应用、变量替换和批量处理功能
 */
export class TemplateApplicationService {
  private storageService: TemplateStorageService;

  constructor(storageService: TemplateStorageService) {
    this.storageService = storageService;
  }

  /**
   * 应用模板到新项目
   */
  async applyTemplateToNewProject(
    templateId: string,
    variableValues: Record<string, any> = {},
  ): Promise<{
    editorData: IEditorPaperData;
    templateInfo: {
      id: string;
      name: string;
      type: string;
      appliedAt: Date;
    };
  }> {
    const template = await this.storageService.getTemplate(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 深度克隆编辑器数据，避免修改原模板
    const editorData = JSON.parse(JSON.stringify(template.editorData));

    // 应用变量替换
    this.applyVariableValues(editorData, template.variables, variableValues);

    // 记录模板使用
    await this.storageService.recordTemplateUsage(templateId);

    return {
      editorData,
      templateInfo: {
        id: template.id,
        name: template.name,
        type: template.type,
        appliedAt: new Date(),
      },
    };
  }

  /**
   * 应用模板到当前项目
   */
  async applyTemplateToCurrentProject(
    templateId: string,
    currentEditorData: IEditorPaperData,
    variableValues: Record<string, any> = {},
    mergeMode: 'replace' | 'append' = 'replace',
  ): Promise<IEditorPaperData> {
    const template = await this.storageService.getTemplate(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 克隆模板数据
    const templateData = JSON.parse(JSON.stringify(template.editorData));

    // 应用变量替换
    this.applyVariableValues(templateData, template.variables, variableValues);

    let resultData: IEditorPaperData;

    if (mergeMode === 'replace') {
      // 替换模式：完全使用模板数据
      resultData = templateData;
    } else {
      // 追加模式：将模板内容添加到当前项目
      resultData = {
        ...currentEditorData,
        data: [...currentEditorData.data, ...templateData.data],
      };

      // 重新生成ID避免冲突
      this.regenerateObjectIds(resultData, currentEditorData.data.length);
    }

    // 记录模板使用
    await this.storageService.recordTemplateUsage(templateId);

    return resultData;
  }

  /**
   * 批量应用模板
   */
  async batchApplyTemplate(
    templateId: string,
    batchParams: Array<{
      variableValues: Record<string, any>;
      outputName: string;
    }>,
  ): Promise<
    Array<{
      editorData: IEditorPaperData;
      outputName: string;
      templateInfo: {
        id: string;
        name: string;
        type: string;
      };
    }>
  > {
    const template = await this.storageService.getTemplate(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    const results = [];

    for (const params of batchParams) {
      // 为每个批次克隆模板数据
      const editorData = JSON.parse(JSON.stringify(template.editorData));

      // 应用变量替换
      this.applyVariableValues(
        editorData,
        template.variables,
        params.variableValues,
      );

      results.push({
        editorData,
        outputName: params.outputName,
        templateInfo: {
          id: template.id,
          name: template.name,
          type: template.type,
        },
      });
    }

    // 记录模板使用
    await this.storageService.recordTemplateUsage(templateId);

    return results;
  }

  /**
   * 从当前项目创建模板
   */
  async createTemplateFromProject(
    editorData: IEditorPaperData,
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
  ): Promise<TemplateData> {
    // 生成模板变量
    const variables: TemplateVariable[] = variableDefinitions.map(
      (def, index) => ({
        id: `var_${Date.now()}_${index}`,
        name: def.name,
        type: def.type as any,
        defaultValue: def.defaultValue || this.getDefaultValueForType(def.type),
        targetObjectIds: def.targetObjectIds,
        targetProperty: def.targetProperty,
        description: def.description,
        required: true,
      }),
    );

    // 创建模板
    const template = await this.storageService.createTemplate({
      name: templateInfo.name,
      description: templateInfo.description,
      type: templateInfo.type as any,
      categoryId: templateInfo.categoryId,
      tags: templateInfo.tags || [],
      editorData: editorData,
      variables: variables,
      author: templateInfo.author,
    });

    return template;
  }

  /**
   * 识别可变元素
   * 分析编辑器数据，识别可以作为变量的元素
   */
  identifyVariableElements(editorData: IEditorPaperData): Array<{
    objectId: string;
    objectType: string;
    suggestedVariables: Array<{
      property: string;
      type: 'text' | 'image' | 'color';
      currentValue: any;
      description: string;
    }>;
  }> {
    const variableElements = [];

    for (const obj of editorData.data) {
      const suggestedVariables = [];

      // 文本对象的文本内容
      if (obj.type === GraphicsType.Text && (obj as any).content) {
        suggestedVariables.push({
          property: 'content',
          type: 'text' as const,
          currentValue: (obj as any).content,
          description: '文本内容',
        });
      }

      // 图形对象的填充颜色
      if (obj.fill && Array.isArray(obj.fill) && obj.fill.length > 0) {
        const firstFill = obj.fill[0];
        if (
          firstFill &&
          typeof firstFill === 'object' &&
          'color' in firstFill
        ) {
          suggestedVariables.push({
            property: 'fill',
            type: 'color' as const,
            currentValue: firstFill.color,
            description: '填充颜色',
          });
        }
      }

      // 图形对象的描边颜色
      if (obj.stroke && Array.isArray(obj.stroke) && obj.stroke.length > 0) {
        const firstStroke = obj.stroke[0];
        if (
          firstStroke &&
          typeof firstStroke === 'object' &&
          'color' in firstStroke
        ) {
          suggestedVariables.push({
            property: 'stroke',
            type: 'color' as const,
            currentValue: firstStroke.color,
            description: '描边颜色',
          });
        }
      }

      // 图片对象的图片源 (注意：当前系统可能没有Image类型，先注释掉)
      // if (obj.type === GraphicsType.Image && (obj as any).src) {
      //   suggestedVariables.push({
      //     property: 'src',
      //     type: 'image' as const,
      //     currentValue: (obj as any).src,
      //     description: '图片源',
      //   });
      // }

      if (suggestedVariables.length > 0) {
        variableElements.push({
          objectId: obj.id,
          objectType: obj.type || 'Unknown',
          suggestedVariables,
        });
      }
    }

    return variableElements;
  }

  /**
   * 批量内容替换
   */
  async batchContentReplace(
    editorData: IEditorPaperData,
    replacements: Array<{
      objectId: string;
      property: string;
      newValue: any;
    }>,
  ): Promise<IEditorPaperData> {
    // 克隆数据
    const resultData = JSON.parse(JSON.stringify(editorData));

    // 创建对象映射
    const objectMap = new Map();
    for (const obj of resultData.data) {
      objectMap.set(obj.id, obj);
    }

    // 应用替换
    for (const replacement of replacements) {
      const targetObject = objectMap.get(replacement.objectId);
      if (targetObject) {
        targetObject[replacement.property] = replacement.newValue;
      }
    }

    return resultData;
  }

  /**
   * 预览模板应用效果
   */
  async previewTemplateApplication(
    templateId: string,
    variableValues: Record<string, any> = {},
  ): Promise<{
    previewData: IEditorPaperData;
    variablePreview: Array<{
      variableId: string;
      variableName: string;
      oldValue: any;
      newValue: any;
      affectedObjects: string[];
    }>;
  }> {
    const template = await this.storageService.getTemplate(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 克隆数据用于预览
    const previewData = JSON.parse(JSON.stringify(template.editorData));

    // 记录变量变化
    const variablePreview = [];

    for (const variable of template.variables) {
      const newValue = variableValues[variable.id];
      if (newValue !== undefined) {
        variablePreview.push({
          variableId: variable.id,
          variableName: variable.name,
          oldValue: variable.defaultValue,
          newValue: newValue,
          affectedObjects: variable.targetObjectIds,
        });
      }
    }

    // 应用变量替换到预览数据
    this.applyVariableValues(previewData, template.variables, variableValues);

    return {
      previewData,
      variablePreview,
    };
  }

  /**
   * 应用变量值到编辑器数据
   */
  private applyVariableValues(
    editorData: IEditorPaperData,
    variables: TemplateVariable[],
    variableValues: Record<string, any>,
  ): void {
    // 创建对象ID到对象的映射
    const objectMap = new Map();
    for (const obj of editorData.data) {
      objectMap.set(obj.id, obj);
    }

    // 应用每个变量的值
    for (const variable of variables) {
      const value = variableValues[variable.id];
      if (value === undefined) {
        continue;
      }

      // 对每个目标对象应用变量值
      for (const targetObjectId of variable.targetObjectIds) {
        const targetObject = objectMap.get(targetObjectId);
        if (targetObject) {
          this.applyVariableToObject(targetObject, variable, value);
        }
      }
    }
  }

  /**
   * 将变量值应用到特定对象
   */
  private applyVariableToObject(
    targetObject: any,
    variable: TemplateVariable,
    value: any,
  ): void {
    switch (variable.type) {
      case 'text':
        if (variable.targetProperty === 'content') {
          targetObject[variable.targetProperty] = String(value);
        }
        break;
      case 'color':
        if (
          variable.targetProperty === 'fill' &&
          Array.isArray(targetObject.fill)
        ) {
          // 更新填充颜色数组中的第一个颜色
          if (targetObject.fill.length > 0 && targetObject.fill[0]) {
            targetObject.fill[0].color = String(value);
          }
        } else if (
          variable.targetProperty === 'stroke' &&
          Array.isArray(targetObject.stroke)
        ) {
          // 更新描边颜色数组中的第一个颜色
          if (targetObject.stroke.length > 0 && targetObject.stroke[0]) {
            targetObject.stroke[0].color = String(value);
          }
        }
        break;
      case 'image':
        if (
          variable.targetProperty === 'src' ||
          variable.targetProperty === 'url'
        ) {
          targetObject[variable.targetProperty] = String(value);
        }
        break;
    }
  }

  /**
   * 重新生成对象ID避免冲突
   */
  private regenerateObjectIds(
    editorData: IEditorPaperData,
    startIndex: number,
  ): void {
    const idMap = new Map<string, string>();

    // 为所有对象生成新ID
    for (let i = 0; i < editorData.data.length; i++) {
      const obj = editorData.data[i];
      if (i >= startIndex) {
        const newId = `obj_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        idMap.set(obj.id, newId);
        obj.id = newId;
      }
    }

    // 更新父子关系中的ID引用（如果存在的话）
    for (const obj of editorData.data) {
      const objAny = obj as any;
      if (objAny.parentId && idMap.has(objAny.parentId)) {
        objAny.parentId = idMap.get(objAny.parentId);
      }
      if (objAny.childrenIds && Array.isArray(objAny.childrenIds)) {
        objAny.childrenIds = objAny.childrenIds.map(
          (id: string) => idMap.get(id) || id,
        );
      }
    }
  }

  /**
   * 获取变量类型的默认值
   */
  private getDefaultValueForType(type: string): any {
    switch (type) {
      case 'text':
        return '';
      case 'color':
        return '#000000';
      case 'image':
        return '';
      default:
        return null;
    }
  }
}
