/**
 * 数据验证模式统一导出
 * @description 提供所有验证模式的统一入口
 * @author 开发团队
 */

// 导出基础验证工具
export * from './base';

// 导出画布验证模式
export * from './canvas';

// 导出项目验证模式
export * from './project';

// 导出素材验证模式
export * from './asset';

/**
 * 统一验证器接口
 */
export interface UnifiedValidator {
  // 画布相关验证
  validateCanvasElement: typeof import('./canvas').validateCanvasElement;
  validateCanvasConfig: typeof import('./canvas').validateCanvasConfig;
  validateCanvasState: typeof import('./canvas').validateCanvasState;

  // 项目相关验证
  validateProject: typeof import('./project').validateProject;
  validateCreateProjectParams: typeof import('./project').validateCreateProjectParams;
  validateUpdateProjectParams: typeof import('./project').validateUpdateProjectParams;

  // 素材相关验证
  validateAsset: typeof import('./asset').validateAsset;
  validateCreateAssetParams: typeof import('./asset').validateCreateAssetParams;
  validateUpdateAssetParams: typeof import('./asset').validateUpdateAssetParams;
}

/**
 * 验证器工厂类
 */
export class ValidatorFactory {
  private static instance: ValidatorFactory | null = null;
  private validators: Map<string, any> = new Map();

  private constructor() { }

  /**
   * 获取验证器工厂单例实例
   */
  public static getInstance(): ValidatorFactory {
    if (!ValidatorFactory.instance) {
      ValidatorFactory.instance = new ValidatorFactory();
    }
    return ValidatorFactory.instance;
  }

  /**
   * 注册验证器
   */
  public registerValidator(name: string, validator: any): void {
    this.validators.set(name, validator);
  }

  /**
   * 获取验证器
   */
  public getValidator(name: string): any {
    return this.validators.get(name);
  }

  /**
   * 获取所有验证器
   */
  public getAllValidators(): Map<string, any> {
    return new Map(this.validators);
  }

  /**
   * 批量验证
   */
  public async batchValidate(
    data: Array<{ name: string; value: any; schema: import('./base').ValidationSchema }>
  ): Promise<Array<{ name: string; result: import('./base').ValidationResult }>> {
    const { Validator } = await import('./base');

    return data.map(item => ({
      name: item.name,
      result: Validator.validate(item.value, item.schema),
    }));
  }

  /**
   * 验证并抛出异常
   */
  public async validateAndThrow(
    data: any,
    schema: import('./base').ValidationSchema,
    errorMessage?: string
  ): Promise<void> {
    const { Validator, ValidationException } = await import('./base');
    const result = Validator.validate(data, schema);

    if (!result.isValid) {
      throw new ValidationException(
        errorMessage || '数据验证失败',
        result.errors
      );
    }
  }
}

/**
 * 验证中间件
 */
export function createValidationMiddleware(schema: import('./base').ValidationSchema) {
  return async function validationMiddleware(data: any, next?: () => void) {
    const { Validator, ValidationException } = await import('./base');
    const result = Validator.validate(data, schema);

    if (!result.isValid) {
      throw new ValidationException('请求数据验证失败', result.errors);
    }

    if (next) {
      next();
    }

    return result;
  };
}

/**
 * 验证装饰器工厂
 */
export function createValidationDecorator(schema: import('./base').ValidationSchema) {
  return function validationDecorator(_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const { Validator, ValidationException } = await import('./base');
      const data = args[0];
      const result = Validator.validate(data, schema);

      if (!result.isValid) {
        throw new ValidationException(
          `方法 ${_propertyName} 参数验证失败`,
          result.errors
        );
      }

      return method.apply(this, args);
    };
  };
}

/**
 * 常用验证函数
 */
export const ValidationUtils = {
  /**
   * 验证邮箱格式
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 验证URL格式
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 验证颜色格式
   */
  isValidColor(color: string): boolean {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return colorRegex.test(color);
  },

  /**
   * 验证ID格式
   */
  isValidId(id: string): boolean {
    const idRegex = /^[a-zA-Z0-9_-]+$/;
    return idRegex.test(id) && id.length > 0 && id.length <= 100;
  },

  /**
   * 验证版本号格式
   */
  isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  },

  /**
   * 验证文件大小
   */
  isValidFileSize(size: number, maxSize: number = 50 * 1024 * 1024): boolean {
    return size > 0 && size <= maxSize;
  },

  /**
   * 验证图片尺寸
   */
  isValidImageDimensions(width: number, height: number, maxWidth: number = 10000, maxHeight: number = 10000): boolean {
    return width > 0 && height > 0 && width <= maxWidth && height <= maxHeight;
  },

  /**
   * 验证坐标范围
   */
  isValidCoordinate(value: number, min: number = -999999, max: number = 999999): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
  },

  /**
   * 验证透明度值
   */
  isValidOpacity(opacity: number): boolean {
    return typeof opacity === 'number' && opacity >= 0 && opacity <= 1;
  },

  /**
   * 验证角度值
   */
  isValidAngle(angle: number): boolean {
    return typeof angle === 'number' && angle >= -360 && angle <= 360;
  },
};

// 导出验证器工厂实例
export const validatorFactory = ValidatorFactory.getInstance();