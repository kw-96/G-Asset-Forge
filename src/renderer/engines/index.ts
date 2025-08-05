// 引擎统一导出文件
export * from './suika';
export * from './h5-editor';

// 引擎类型枚举
export enum EngineType {
  SUIKA = 'suika',
  H5_EDITOR = 'h5-editor'
}

// 引擎配置接口
export interface IEngineConfig {
  type: EngineType;
  width: number;
  height: number;
  containerElement: HTMLDivElement;
}

// 引擎工厂类
export class EngineFactory {
  static createEngine(config: IEngineConfig) {
    switch (config.type) {
      case EngineType.SUIKA:
        // 动态导入Suika引擎
        return import('./suika').then(({ SuikaEditor }) => {
          return new SuikaEditor({
            containerElement: config.containerElement,
            width: config.width,
            height: config.height
          });
        });
      
      case EngineType.H5_EDITOR:
        // 动态导入H5-Editor引擎
        return import('./h5-editor').then(({ H5Editor }) => {
          return new H5Editor({
            containerElement: config.containerElement,
            width: config.width,
            height: config.height
          });
        });
      
      default:
        throw new Error(`Unsupported engine type: ${config.type}`);
    }
  }
}