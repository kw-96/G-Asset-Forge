/**
 * 基础数据验证模式
 * @description 提供通用的数据验证规则和工具函数
 * @author 开发团队
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
  constraint?: any;
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  value?: any;
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
  nested?: ValidationSchema;
}

/**
 * 验证模式接口
 */
export interface ValidationSchema {
  rules: ValidationRule[];
  strict?: boolean;
  allowUnknown?: boolean;
}

/**
 * 验证器类
 */
export class Validator {
  /**
   * 验证数据
   */
  public static validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 检查必填字段
    for (const rule of schema.rules) {
      const value = this.getFieldValue(data, rule.field);

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          code: 'REQUIRED',
          message: `字段 ${rule.field} 是必填的`,
          value,
        });
        continue;
      }

      if (value === undefined || value === null) {
        continue;
      }

      // 类型验证
      if (rule.type && !this.validateType(value, rule.type)) {
        errors.push({
          field: rule.field,
          code: 'INVALID_TYPE',
          message: `字段 ${rule.field} 类型应为 ${rule.type}`,
          value,
          constraint: rule.type,
        });
        continue;
      }

      // 长度验证
      if (rule.minLength !== undefined && this.getLength(value) < rule.minLength) {
        errors.push({
          field: rule.field,
          code: 'MIN_LENGTH',
          message: `字段 ${rule.field} 长度不能少于 ${rule.minLength}`,
          value,
          constraint: rule.minLength,
        });
      }

      if (rule.maxLength !== undefined && this.getLength(value) > rule.maxLength) {
        errors.push({
          field: rule.field,
          code: 'MAX_LENGTH',
          message: `字段 ${rule.field} 长度不能超过 ${rule.maxLength}`,
          value,
          constraint: rule.maxLength,
        });
      }

      // 数值范围验证
      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push({
          field: rule.field,
          code: 'MIN_VALUE',
          message: `字段 ${rule.field} 值不能小于 ${rule.min}`,
          value,
          constraint: rule.min,
        });
      }

      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push({
          field: rule.field,
          code: 'MAX_VALUE',
          message: `字段 ${rule.field} 值不能大于 ${rule.max}`,
          value,
          constraint: rule.max,
        });
      }

      // 正则表达式验证
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push({
          field: rule.field,
          code: 'PATTERN_MISMATCH',
          message: `字段 ${rule.field} 格式不正确`,
          value,
          constraint: rule.pattern.source,
        });
      }

      // 枚举值验证
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          field: rule.field,
          code: 'INVALID_ENUM',
          message: `字段 ${rule.field} 值必须是 ${rule.enum.join(', ')} 中的一个`,
          value,
          constraint: rule.enum,
        });
      }

      // 自定义验证
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          errors.push({
            field: rule.field,
            code: 'CUSTOM_VALIDATION',
            message: typeof customResult === 'string' ? customResult : `字段 ${rule.field} 验证失败`,
            value,
          });
        }
      }

      // 嵌套对象验证
      if (rule.nested && typeof value === 'object' && value !== null) {
        const nestedResult = this.validate(value, rule.nested);
        errors.push(...nestedResult.errors.map(error => ({
          ...error,
          field: `${rule.field}.${error.field}`,
        })));
        if (nestedResult.warnings) {
          warnings.push(...nestedResult.warnings.map(warning => ({
            ...warning,
            field: `${rule.field}.${warning.field}`,
          })));
        }
      }
    }

    // 检查未知字段
    if (schema.strict && !schema.allowUnknown) {
      const knownFields = schema.rules.map(rule => rule.field);
      const dataFields = Object.keys(data || {});
      const unknownFields = dataFields.filter(field => !knownFields.includes(field));

      for (const field of unknownFields) {
        warnings.push({
          field,
          code: 'UNKNOWN_FIELD',
          message: `未知字段 ${field}`,
          value: data[field],
        });
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  }

  /**
   * 获取字段值
   */
  private static getFieldValue(data: any, field: string): any {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    const parts = field.split('.');
    let value = data;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * 验证类型
   */
  private static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      default:
        return true;
    }
  }

  /**
   * 获取长度
   */
  private static getLength(value: any): number {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length;
    }
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length;
    }
    return 0;
  }
}

/**
 * 常用验证规则
 */
export const CommonRules = {
  /**
   * ID验证规则
   */
  id: (required = true): ValidationRule => ({
    field: 'id',
    required,
    type: 'string',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9_-]+$/,
  }),

  /**
   * 名称验证规则
   */
  name: (required = true): ValidationRule => ({
    field: 'name',
    required,
    type: 'string',
    minLength: 1,
    maxLength: 255,
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s_-]+$/,
  }),

  /**
   * 描述验证规则
   */
  description: (required = false): ValidationRule => ({
    field: 'description',
    required,
    type: 'string',
    maxLength: 1000,
  }),

  /**
   * 邮箱验证规则
   */
  email: (required = true): ValidationRule => ({
    field: 'email',
    required,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }),

  /**
   * URL验证规则
   */
  url: (required = true): ValidationRule => ({
    field: 'url',
    required,
    type: 'string',
    pattern: /^https?:\/\/.+/,
  }),

  /**
   * 颜色验证规则
   */
  color: (required = true): ValidationRule => ({
    field: 'color',
    required,
    type: 'string',
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  }),

  /**
   * 坐标验证规则
   */
  coordinate: (field: string, required = true): ValidationRule => ({
    field,
    required,
    type: 'number',
    min: -999999,
    max: 999999,
  }),

  /**
   * 尺寸验证规则
   */
  size: (field: string, required = true): ValidationRule => ({
    field,
    required,
    type: 'number',
    min: 0,
    max: 999999,
  }),

  /**
   * 透明度验证规则
   */
  opacity: (required = true): ValidationRule => ({
    field: 'opacity',
    required,
    type: 'number',
    min: 0,
    max: 1,
  }),

  /**
   * 标签验证规则
   */
  tags: (required = false): ValidationRule => ({
    field: 'tags',
    required,
    type: 'array',
    maxLength: 20,
    custom: (value: any[]) => {
      if (!Array.isArray(value)) return '标签必须是数组';
      if (value.some(tag => typeof tag !== 'string')) return '标签必须是字符串';
      if (value.some(tag => tag.length > 50)) return '标签长度不能超过50个字符';
      return true;
    },
  }),

  /**
   * 时间戳验证规则
   */
  timestamp: (field: string, required = true): ValidationRule => ({
    field,
    required,
    type: 'string',
    pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
  }),
};

/**
 * 验证装饰器
 */
export function validate(schema: ValidationSchema) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const data = args[0];
      const result = Validator.validate(data, schema);

      if (!result.isValid) {
        throw new ValidationException('数据验证失败', result.errors);
      }

      return method.apply(this, args);
    };
  };
}

/**
 * 验证异常类
 */
export class ValidationException extends Error {
  public readonly errors: ValidationError[];

  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = 'ValidationException';
    this.errors = errors;
  }

  public getErrorMessages(): string[] {
    return this.errors.map(error => error.message);
  }

  public getFieldErrors(field: string): ValidationError[] {
    return this.errors.filter(error => error.field === field);
  }
}