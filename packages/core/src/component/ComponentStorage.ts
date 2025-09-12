import { ComponentDefinition } from './ComponentTypes';

// 在浏览器环境中，path 模块不可用，所以我们需要一个简单的实现
const path = {
  join: (...paths: string[]) => paths.join('\\'),
};

export class ComponentStorage {
  private readonly basePath =
    '\\\\Fs44\\渠道美术素材\\promot资产\\GAF\\Components';
  private readonly componentsPath = `${this.basePath}\\components`;
  private readonly thumbnailsPath = `${this.basePath}\\thumbnails`;

  constructor() {
    this.ensureDirectories();
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectories(): Promise<void> {
    // 在浏览器环境中，目录创建需要通过 Electron IPC 处理
    // 这里暂时跳过，实际使用时需要在 Electron 主进程中处理
  }

  /**
   * 保存组件到网盘路径
   */
  async saveComponent(component: ComponentDefinition): Promise<void> {
    // 只在 Electron 环境中保存
    if (!window.electronAPI) {
      console.warn('浏览器环境不支持组件存储');
      return;
    }

    // 检查是否有重复的组件名称
    const existingComponent = await this.findComponentByName(component.name);
    if (existingComponent && existingComponent.id !== component.id) {
      throw new Error(
        `组件名称 "${component.name}" 已存在，请选择其他名称或确认是否覆盖现有组件`,
      );
    }

    // 生成安全的文件名
    const safeFileName = this.sanitizeFileName(component.name);

    await window.electronAPI.saveFile!({
      filename: `${safeFileName}.json`,
      data: JSON.stringify(component, null, 2),
      directory: this.componentsPath,
    });

    // 保存预览图（如果有）
    if (component.thumbnail) {
      await this.saveThumbnail(component.id, component.thumbnail);
    }

    // 更新索引文件
    await this.updateIndex(component);

    // 生成组件管理文档
    await this.generateManagementDocument();
  }

  /**
   * 从网盘路径加载组件
   */
  async loadComponent(
    componentId: string,
  ): Promise<ComponentDefinition | null> {
    // 只在 Electron 环境中加载
    if (!window.electronAPI) {
      console.warn('浏览器环境不支持组件加载');
      return null;
    }

    try {
      // 通过索引文件查找组件文件名
      const indexResult = await window.electronAPI.readFile!({
        filename: 'index.json',
        directory: this.basePath,
      });

      if (!indexResult.success) {
        return null;
      }

      const index = JSON.parse(indexResult.data || indexResult.content || '{}');
      const componentInfo = index[componentId];

      if (!componentInfo) {
        return null;
      }

      // 使用组件名称作为文件名
      const safeFileName = this.sanitizeFileName(componentInfo.name);
      const result = await window.electronAPI.readFile!({
        filename: `${safeFileName}.json`,
        directory: this.componentsPath,
      });

      if (result.success) {
        const component = JSON.parse(
          result.data || result.content || '',
        ) as ComponentDefinition;

        // 加载缩略图（如果组件定义中没有缩略图）
        if (!component.thumbnail) {
          const thumbnail = await this.loadThumbnail(componentId);
          if (thumbnail) {
            component.thumbnail = thumbnail;
          }
        }

        return component;
      }
      return null;
    } catch (error) {
      console.error(`加载组件失败: ${componentId}`, error);
      return null;
    }
  }

  /**
   * 获取所有组件
   */
  async getAllComponents(): Promise<ComponentDefinition[]> {
    // 只在 Electron 环境中获取
    if (!window.electronAPI) {
      console.warn('浏览器环境不支持组件获取');
      return [];
    }

    const components: ComponentDefinition[] = [];

    try {
      // 通过索引文件获取所有组件
      const indexResult = await window.electronAPI.readFile!({
        filename: 'index.json',
        directory: this.basePath,
      });

      if (indexResult.success) {
        const index = JSON.parse(
          indexResult.data || indexResult.content || '{}',
        );

        for (const componentId of Object.keys(index)) {
          const component = await this.loadComponent(componentId);
          if (component) {
            components.push(component);
          }
        }
      }
    } catch (error) {
      console.error('获取所有组件失败:', error);
    }

    return components;
  }

  /**
   * 删除组件
   */
  async deleteComponent(componentId: string): Promise<void> {
    // 只在 Electron 环境中删除
    if (!window.electronAPI) {
      console.warn('浏览器环境不支持组件删除');
      return;
    }

    try {
      // 通过索引文件查找组件文件名
      const indexResult = await window.electronAPI.readFile!({
        filename: 'index.json',
        directory: this.basePath,
      });

      if (indexResult.success) {
        const index = JSON.parse(
          indexResult.data || indexResult.content || '{}',
        );
        const componentInfo = index[componentId];

        if (componentInfo) {
          // 使用组件名称作为文件名
          const safeFileName = this.sanitizeFileName(componentInfo.name);
          await window.electronAPI.deleteFile!({
            filename: `${safeFileName}.json`,
            directory: this.componentsPath,
          });
        }
      }

      // 删除缩略图
      await this.deleteThumbnail(componentId);

      // 更新索引文件
      await this.removeFromIndex(componentId);

      // 生成组件管理文档
      await this.generateManagementDocument();
    } catch (error) {
      console.error(`删除组件失败: ${componentId}`, error);
    }
  }

  /**
   * 更新组件索引
   */
  private async updateIndex(component: ComponentDefinition): Promise<void> {
    // 只在 Electron 环境中更新索引
    if (!window.electronAPI) {
      return;
    }

    try {
      let index: any = {};

      const result = await window.electronAPI.readFile!({
        filename: 'index.json',
        directory: this.basePath,
      });
      if (result.success) {
        index = JSON.parse(result.data || result.content || '{}');
      }

      index[component.id] = {
        name: component.name,
        description: component.description,
        tags: component.tags,
        createdAt: component.createdAt,
        updatedAt: component.updatedAt,
      };

      await window.electronAPI.saveFile!({
        filename: 'index.json',
        data: JSON.stringify(index, null, 2),
        directory: this.basePath,
      });
    } catch (error) {
      console.error('更新组件索引失败:', error);
    }
  }

  /**
   * 从索引中移除组件
   */
  private async removeFromIndex(componentId: string): Promise<void> {
    // 只在 Electron 环境中移除索引
    if (!window.electronAPI) {
      return;
    }

    try {
      const result = await window.electronAPI.readFile!({
        filename: 'index.json',
        directory: this.basePath,
      });
      if (result.success) {
        const index = JSON.parse(result.data || result.content || '{}');
        delete index[componentId];
        await window.electronAPI.saveFile!({
          filename: 'index.json',
          data: JSON.stringify(index, null, 2),
          directory: this.basePath,
        });
      }
    } catch (error) {
      console.error('更新索引文件失败', error);
    }
  }

  /**
   * 保存组件缩略图
   */
  private async saveThumbnail(
    componentId: string,
    thumbnailData: string,
  ): Promise<void> {
    // 只在 Electron 环境中保存缩略图
    if (!window.electronAPI) {
      return;
    }

    try {
      // 创建缩略图目录
      const thumbnailsPath = path.join(this.basePath, 'thumbnails');
      await this.ensureDirectoryExists(thumbnailsPath);

      // 处理缩略图数据
      let imageData: string;
      const filename = `${componentId}.png`;

      if (thumbnailData.startsWith('data:image/')) {
        // Base64 数据
        const base64Data = thumbnailData.split(',')[1];
        imageData = base64Data;
      } else if (
        thumbnailData.startsWith('http://') ||
        thumbnailData.startsWith('https://')
      ) {
        // URL 数据，需要下载
        console.warn('URL 缩略图暂不支持，跳过保存');
        return;
      } else {
        // 假设是 base64 数据（没有 data: 前缀）
        imageData = thumbnailData;
      }

      // 保存缩略图文件（直接传递 Base64 数据）
      await window.electronAPI.saveFile!({
        filename: filename,
        data: imageData, // 直接使用 Base64 数据
        directory: thumbnailsPath,
      });

      console.log(`缩略图保存成功: ${filename}`);
    } catch (error) {
      console.error('保存缩略图失败:', error);
    }
  }

  /**
   * 加载组件缩略图
   */
  private async loadThumbnail(componentId: string): Promise<string | null> {
    // 只在 Electron 环境中加载缩略图
    if (!window.electronAPI) {
      return null;
    }

    try {
      const thumbnailsPath = path.join(this.basePath, 'thumbnails');
      const filename = `${componentId}.png`;

      const result = await window.electronAPI.readFile!({
        filename: filename,
        directory: thumbnailsPath,
      });

      if (result.success && result.data) {
        // 将 base64 数据转换为 data URL
        return `data:image/png;base64,${result.data}`;
      }

      return null;
    } catch (error) {
      console.error('加载缩略图失败:', error);
      return null;
    }
  }

  /**
   * 删除组件缩略图
   */
  private async deleteThumbnail(componentId: string): Promise<void> {
    // 只在 Electron 环境中删除缩略图
    if (!window.electronAPI) {
      return;
    }

    try {
      const thumbnailsPath = path.join(this.basePath, 'thumbnails');
      const filename = `${componentId}.png`;

      await window.electronAPI.deleteFile!({
        filename: filename,
        directory: thumbnailsPath,
      });

      console.log(`缩略图删除成功: ${filename}`);
    } catch (error) {
      console.error('删除缩略图失败:', error);
    }
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    // 这里可以添加目录创建逻辑
    // 由于我们使用的是网盘路径，通常目录已经存在
    console.log(`确保目录存在: ${dirPath}`);
  }

  /**
   * 将组件名称转换为安全的文件名
   */
  private sanitizeFileName(name: string): string {
    // 移除或替换文件名中不允许的字符
    return (
      name
        .replace(/[<>:"/\\|?*]/g, '_') // 替换 Windows 不允许的字符
        .replace(/\s+/g, '_') // 将空格替换为下划线
        .replace(/_{2,}/g, '_') // 将多个连续下划线替换为单个下划线
        .replace(/^_+|_+$/g, '') // 移除开头和结尾的下划线
        .substring(0, 100) || // 限制文件名长度
      'unnamed_component'
    ); // 如果名称为空，使用默认名称
  }

  /**
   * 根据组件名称查找组件
   */
  private async findComponentByName(
    name: string,
  ): Promise<ComponentDefinition | null> {
    // 只在 Electron 环境中查找
    if (!window.electronAPI) {
      return null;
    }

    try {
      // 通过索引文件查找所有组件
      const indexResult = await window.electronAPI.readFile!({
        filename: 'index.json',
        directory: this.basePath,
      });

      if (indexResult.success) {
        const index = JSON.parse(
          indexResult.data || indexResult.content || '{}',
        );

        // 查找名称匹配的组件
        for (const componentId of Object.keys(index)) {
          const componentInfo = index[componentId];
          if (componentInfo && componentInfo.name === name) {
            return await this.loadComponent(componentId);
          }
        }
      }
    } catch (error) {
      console.error(`查找组件失败: ${name}`, error);
    }

    return null;
  }

  /**
   * 生成组件管理文档
   */
  private async generateManagementDocument(): Promise<void> {
    // 只在 Electron 环境中生成文档
    if (!window.electronAPI) {
      return;
    }

    try {
      // 获取所有组件信息
      const allComponents = await this.getAllComponents();

      // 生成文档内容
      const documentContent = this.generateDocumentContent(allComponents);

      // 保存文档到组件库目录
      await window.electronAPI.saveFile!({
        filename: '组件管理指南.txt',
        data: documentContent,
        directory: this.componentsPath,
      });
    } catch (error) {
      console.error('生成组件管理文档失败:', error);
    }
  }

  /**
   * 生成文档内容
   */
  private generateDocumentContent(components: ComponentDefinition[]): string {
    const now = new Date().toLocaleString('zh-CN');

    let content = `组件管理指南
生成时间: ${now}
组件库路径: ${this.componentsPath}

========================================
1. 手动清除组件的方法步骤
========================================

1.1 删除组件 JSON 文件
位置: ${this.componentsPath}
文件格式: {组件名称}.json
示例: 如果组件名称为 "按钮组件"，则文件名为 "按钮组件.json"
注意: 文件名中的特殊字符会被替换为下划线

1.2 删除组件缩略图
位置: ${this.thumbnailsPath}
文件格式: {组件ID}.png
示例: 如果组件 ID 为 "comp_1234567890"，则文件名为 "comp_1234567890.png"

1.3 删除索引文件相关内容
位置: ${this.basePath}\\index.json
操作: 打开 index.json 文件，找到对应的组件 ID 条目并删除
格式示例:
{
  "comp_1234567890": {
    "name": "按钮组件",
    "description": "一个可复用的按钮组件",
    "tags": ["按钮", "UI"],
    "createdAt": 1694567890000,
    "updatedAt": 1694567890000
  }
}

1.4 完整清除步骤
1. 打开 ${this.componentsPath} 目录
2. 找到要删除的组件 JSON 文件（文件名与组件名称相同）
3. 删除该 JSON 文件
4. 进入 thumbnails 子目录
5. 找到对应的缩略图文件（文件名与组件 ID 相同）
6. 删除该缩略图文件
7. 返回上级目录，打开 index.json 文件
8. 找到对应的组件 ID 条目并删除整个对象
9. 保存 index.json 文件

========================================
2. 索引文件中的 ID 与组件名称对应关系
========================================

2.1 索引文件结构
索引文件 index.json 位于组件库根目录，用于维护组件 ID 与组件名称的映射关系。

2.2 文件格式
{
  "组件ID": {
    "name": "组件名称",
    "description": "组件描述",
    "tags": ["标签1", "标签2"],
    "createdAt": 创建时间戳,
    "updatedAt": 更新时间戳
  }
}

2.3 更新机制
- 添加组件: 当创建新组件时，会在索引文件中添加新的条目
- 更新组件: 当修改组件信息时，会更新对应条目的内容
- 删除组件: 当删除组件时，会从索引文件中移除对应条目
- 覆盖组件: 当覆盖同名组件时，会先删除旧条目，再添加新条目

2.4 当前组件列表
组件总数: ${components.length}

`;

    // 添加当前所有组件的信息
    components.forEach((component, index) => {
      const createdDate = new Date(component.createdAt).toLocaleString('zh-CN');
      const updatedDate = new Date(component.updatedAt).toLocaleString('zh-CN');

      content += `${index + 1}. 组件名称: ${component.name}
   组件 ID: ${component.id}
   组件描述: ${component.description || '无描述'}
   组件标签: ${component.tags.join(', ') || '无标签'}
   创建时间: ${createdDate}
   更新时间: ${updatedDate}
   JSON 文件: ${this.sanitizeFileName(component.name)}.json
   缩略图文件: ${component.id}.png

`;
    });

    content += `========================================
3. 故障排除
========================================

3.1 常见问题
- 组件无法加载: 检查索引文件中是否存在对应条目
- 缩略图不显示: 检查 thumbnails 目录中是否存在对应 PNG 文件
- 文件名冲突: 检查是否有同名但不同 ID 的组件

3.2 数据恢复
如果索引文件损坏，可以：
1. 扫描 Components 目录中的所有 JSON 文件
2. 根据 JSON 文件内容重建索引文件
3. 确保缩略图文件与组件 ID 对应

========================================
文档说明
========================================
此文档由系统自动生成，包含当前组件库的完整信息。
每次组件操作（添加、更新、删除）后，此文档会自动更新。
最后更新: ${now}
`;

    return content;
  }
}
