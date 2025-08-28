import { GraphicsType } from '../../type';
import { TemplateStorageService } from '../template_storage_service';
import { TemplateType, TemplateVariableType } from '../types';

/**
 * 模板存储服务测试
 * 验证基本的CRUD操作和数据完整性
 */
describe('TemplateStorageService', () => {
  let service: TemplateStorageService;

  beforeEach(async () => {
    service = new TemplateStorageService();
    await service.initialize();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('模板创建和查询', () => {
    test('应该能够创建新模板', async () => {
      const templateParams = {
        name: '测试模板',
        description: '这是一个测试模板',
        type: TemplateType.Design,
        categoryId: 'test-category',
        tags: ['测试', '模板'],
        editorData: {
          appVersion: '1.0.0',
          paperId: 'test-paper',
          data: [
            {
              id: 'rect-1',
              type: 'rect',
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              fill: '#ff0000',
            },
          ],
        },
        variables: [
          {
            id: 'var-1',
            name: '标题文本',
            type: TemplateVariableType.Text,
            defaultValue: '默认标题',
            targetObjectIds: ['rect-1'],
            targetProperty: 'text',
          },
        ],
      };

      const template = await service.createTemplate(templateParams);

      expect(template.id).toBeDefined();
      expect(template.name).toBe(templateParams.name);
      expect(template.description).toBe(templateParams.description);
      expect(template.type).toBe(templateParams.type);
      expect(template.variables).toHaveLength(1);
      expect(template.usageCount).toBe(0);
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    test('应该能够查询模板', async () => {
      // 创建测试模板
      const template = await service.createTemplate({
        name: '查询测试模板',
        description: '用于测试查询功能',
        type: TemplateType.H5,
        categoryId: 'test-category',
        editorData: { appVersion: '1.0.0', paperId: 'test', data: [] },
      });

      // 查询模板
      const result = await service.queryTemplates({
        keyword: '查询测试',
        type: TemplateType.H5,
      });

      expect(result.templates).toHaveLength(1);
      expect(result.templates[0].id).toBe(template.id);
      expect(result.total).toBe(1);
    });

    test('应该能够更新模板', async () => {
      // 创建模板
      const template = await service.createTemplate({
        name: '原始名称',
        description: '原始描述',
        type: TemplateType.Design,
        categoryId: 'test-category',
        editorData: { appVersion: '1.0.0', paperId: 'test', data: [] },
      });

      // 更新模板
      const updatedTemplate = await service.updateTemplate(template.id, {
        name: '更新后的名称',
        description: '更新后的描述',
      });

      expect(updatedTemplate.name).toBe('更新后的名称');
      expect(updatedTemplate.description).toBe('更新后的描述');
      expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThan(
        template.updatedAt.getTime(),
      );
    });

    test('应该能够删除模板', async () => {
      // 创建模板
      const template = await service.createTemplate({
        name: '待删除模板',
        description: '这个模板将被删除',
        type: TemplateType.Design,
        categoryId: 'test-category',
        editorData: { appVersion: '1.0.0', paperId: 'test', data: [] },
      });

      // 删除模板
      await service.deleteTemplate(template.id);

      // 验证模板已被删除
      const deletedTemplate = await service.getTemplate(template.id);
      expect(deletedTemplate).toBeUndefined();
    });
  });

  describe('分类管理', () => {
    test('应该能够创建分类', async () => {
      const category = await service.createCategory({
        name: '测试分类',
        templateType: TemplateType.Design,
        order: 1,
      });

      expect(category.id).toBeDefined();
      expect(category.name).toBe('测试分类');
      expect(category.templateType).toBe(TemplateType.Design);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    test('应该能够获取分类树', async () => {
      // 创建父分类
      const parentCategory = await service.createCategory({
        name: '父分类',
        templateType: TemplateType.Design,
        order: 1,
      });

      // 创建子分类
      await service.createCategory({
        name: '子分类',
        templateType: TemplateType.Design,
        parentId: parentCategory.id,
        order: 1,
      });

      const categoryTree = await service.getCategoryTree(TemplateType.Design);

      expect(categoryTree).toHaveLength(1);
      expect(categoryTree[0].name).toBe('父分类');
      expect(categoryTree[0].children).toHaveLength(1);
      expect(categoryTree[0].children[0].name).toBe('子分类');
    });
  });

  describe('模板应用', () => {
    test('应该能够应用模板', async () => {
      // 创建带变量的模板
      const template = await service.createTemplate({
        name: '可变模板',
        description: '包含变量的模板',
        type: TemplateType.Design,
        categoryId: 'test-category',
        editorData: {
          appVersion: '1.0.0',
          paperId: 'test',
          data: [
            {
              id: 'text-1',
              type: GraphicsType.Text,
              text: '{{title}}',
              x: 0,
              y: 0,
            },
          ],
        },
        variables: [
          {
            id: 'title-var',
            name: '标题',
            type: TemplateVariableType.Text,
            defaultValue: '默认标题',
            targetObjectIds: ['text-1'],
            targetProperty: 'text',
          },
        ],
      });

      // 应用模板
      const result = await service.applyTemplate({
        templateId: template.id,
        variableValues: {
          'title-var': '自定义标题',
        },
      });

      expect(result.editorData).toBeDefined();
      expect(result.templateInfo.id).toBe(template.id);

      // 验证使用次数增加
      const updatedTemplate = await service.getTemplate(template.id);
      expect(updatedTemplate?.usageCount).toBe(1);
    });
  });

  describe('导入导出', () => {
    test('应该能够导出和导入模板', async () => {
      // 创建模板
      const originalTemplate = await service.createTemplate({
        name: '导出测试模板',
        description: '用于测试导出功能',
        type: TemplateType.Design,
        categoryId: 'test-category',
        editorData: { appVersion: '1.0.0', paperId: 'test', data: [] },
      });

      // 导出模板
      const exportedData = await service.exportTemplate(
        originalTemplate.id,
        '测试用户',
      );

      // 导入模板
      const importResult = await service.importTemplates(exportedData);

      expect(importResult.success).toHaveLength(1);
      expect(importResult.failed).toHaveLength(0);
      expect(importResult.success[0].name).toBe(originalTemplate.name);
      expect(importResult.success[0].description).toBe(
        originalTemplate.description,
      );
    });
  });
});
