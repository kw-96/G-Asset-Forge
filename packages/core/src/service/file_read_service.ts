/**
 * 文件读取服务 - 封装通用的文件读取逻辑
 * 复用 ImportService 的实现，提供纯文件读取功能
 */
export class FileReadService {
  /**
   * 读取文本文件内容
   * @param file 要读取的文件
   * @returns Promise<string> 文件内容
   */
  async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const contents = e.target?.result as string;
        if (contents) {
          resolve(contents);
        } else {
          reject(new Error('文件读取失败：无法获取文件内容'));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败：读取过程中发生错误'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 读取 JSON 文件并解析
   * @param file 要读取的 JSON 文件
   * @returns Promise<T> 解析后的 JSON 对象
   */
  async readJSONFile<T>(file: File): Promise<T> {
    try {
      const content = await this.readTextFile(file);
      return JSON.parse(content) as T;
    } catch (error) {
      throw new Error(
        `JSON 文件解析失败：${
          error instanceof Error ? error.message : '未知错误'
        }`,
      );
    }
  }

  /**
   * 批量读取多个文件
   * @param files 要读取的文件列表
   * @returns Promise<string[]> 文件内容列表
   */
  async readMultipleFiles(files: File[]): Promise<string[]> {
    const readPromises = files.map((file) => this.readTextFile(file));
    return Promise.all(readPromises);
  }

  /**
   * 创建文件选择器并读取选中的文件
   * @param accept 接受的文件类型
   * @param multiple 是否允许多选
   * @returns Promise<File[]> 选中的文件列表
   */
  async selectAndReadFiles(
    accept: string,
    multiple: boolean = false,
  ): Promise<File[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.multiple = multiple;
      input.style.display = 'none';

      input.addEventListener('change', (event) => {
        const files = Array.from(
          (event.target as HTMLInputElement).files || [],
        );
        if (files.length > 0) {
          resolve(files);
        } else {
          reject(new Error('未选择任何文件'));
        }
      });

      input.addEventListener('cancel', () => {
        reject(new Error('用户取消了文件选择'));
      });

      input.click();
    });
  }

  /**
   * 创建文件选择器并读取单个文本文件
   * @param accept 接受的文件类型
   * @returns Promise<string> 文件内容
   */
  async selectAndReadTextFile(accept: string): Promise<string> {
    const files = await this.selectAndReadFiles(accept, false);
    return this.readTextFile(files[0]);
  }

  /**
   * 创建文件选择器并读取单个 JSON 文件
   * @param accept 接受的文件类型
   * @returns Promise<T> 解析后的 JSON 对象
   */
  async selectAndReadJSONFile<T>(accept: string): Promise<T> {
    const files = await this.selectAndReadFiles(accept, false);
    return this.readJSONFile<T>(files[0]);
  }
}
