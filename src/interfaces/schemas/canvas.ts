/**
 * 画布数据验证模式
 * @description 定义画布相关数据的验证规则
 * @author 开发团队
 */
import { ValidationSchema, CommonRules } from './base';
import { ElementType, ShapeType, TextAlign, BlendMode } from '../types/canvas';

/**
 * 画布配置验证模式
 */
export const CanvasConfigSchema: ValidationSchema = {
  rules: [
    CommonRules.size('width'),
    CommonRules.size('height'),
    CommonRules.color(),
    {
      field: 'gridEnabled',
      required: true,
      type: 'boolean',
    },
    {
      field: 'gridSize',
      required: true,
      type: 'number',
      min: 1,
      max: 100,
    },
    {
      field: 'snapToGrid',
      required: true,
      type: 'boolean',
    },
    {
      field: 'showRulers',
      required: true,
      type: 'boolean',
    },
    {
      field: 'zoomLevel',
      required: true,
      type: 'number',
      min: 0.1,
      max: 10,
    },
    {
      field: 'engineType',
      required: true,
      type: 'string',
      enum: ['suika', 'h5-editor'],
    },
  ],
  strict: true,
};

/**
 * 变换验证模式
 */
export const TransformSchema: ValidationSchema = {
  rules: [
    CommonRules.coordinate('x'),
    CommonRules.coordinate('y'),
    CommonRules.size('width'),
    CommonRules.size('height'),
    {
      field: 'rotation',
      required: false,
      type: 'number',
      min: -360,
      max: 360,
    },
    {
      field: 'scaleX',
      required: false,
      type: 'number',
      min: 0.01,
      max: 100,
    },
    {
      field: 'scaleY',
      required: false,
      type: 'number',
      min: 0.01,
      max: 100,
    },
  ],
};

/**
 * 颜色验证模式
 */
export const ColorSchema: ValidationSchema = {
  rules: [
    {
      field: 'r',
      required: true,
      type: 'number',
      min: 0,
      max: 255,
    },
    {
      field: 'g',
      required: true,
      type: 'number',
      min: 0,
      max: 255,
    },
    {
      field: 'b',
      required: true,
      type: 'number',
      min: 0,
      max: 255,
    },
    {
      field: 'a',
      required: false,
      type: 'number',
      min: 0,
      max: 1,
    },
  ],
};

/**
 * 文本样式验证模式
 */
export const TextStyleSchema: ValidationSchema = {
  rules: [
    {
      field: 'fontFamily',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    {
      field: 'fontSize',
      required: true,
      type: 'number',
      min: 1,
      max: 1000,
    },
    {
      field: 'fontWeight',
      required: true,
      custom: (value: any) => {
        if (typeof value === 'number') {
          return value >= 100 && value <= 900 && value % 100 === 0;
        }
        return ['normal', 'bold'].includes(value);
      },
    },
    {
      field: 'fontStyle',
      required: true,
      type: 'string',
      enum: ['normal', 'italic', 'oblique'],
    },
    {
      field: 'textAlign',
      required: true,
      type: 'string',
      enum: Object.values(TextAlign),
    },
    {
      field: 'lineHeight',
      required: true,
      type: 'number',
      min: 0.5,
      max: 10,
    },
    {
      field: 'letterSpacing',
      required: true,
      type: 'number',
      min: -10,
      max: 10,
    },
  ],
};

/**
 * 基础元素验证模式
 */
export const BaseElementSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    CommonRules.name(),
    {
      field: 'type',
      required: true,
      type: 'string',
      enum: Object.values(ElementType),
    },
    {
      field: 'visible',
      required: true,
      type: 'boolean',
    },
    {
      field: 'locked',
      required: true,
      type: 'boolean',
    },
    CommonRules.opacity(),
    {
      field: 'blendMode',
      required: true,
      type: 'string',
      enum: Object.values(BlendMode),
    },
    {
      field: 'transform',
      required: true,
      type: 'object',
      nested: TransformSchema,
    },
    CommonRules.timestamp('createdAt'),
    CommonRules.timestamp('updatedAt'),
  ],
};

/**
 * 文本元素验证模式
 */
export const TextElementSchema: ValidationSchema = {
  rules: [
    ...BaseElementSchema.rules,
    {
      field: 'content',
      required: true,
      type: 'string',
      maxLength: 10000,
    },
    {
      field: 'style',
      required: true,
      type: 'object',
      nested: TextStyleSchema,
    },
    {
      field: 'autoResize',
      required: false,
      type: 'boolean',
    },
    {
      field: 'maxWidth',
      required: false,
      type: 'number',
      min: 1,
    },
    {
      field: 'maxHeight',
      required: false,
      type: 'number',
      min: 1,
    },
  ],
};

/**
 * 图片数据验证模式
 */
export const ImageDataSchema: ValidationSchema = {
  rules: [
    CommonRules.url(),
    CommonRules.size('originalWidth'),
    CommonRules.size('originalHeight'),
    {
      field: 'cropArea',
      required: false,
      type: 'object',
      nested: {
        rules: [
          CommonRules.coordinate('x'),
          CommonRules.coordinate('y'),
          CommonRules.size('width'),
          CommonRules.size('height'),
        ],
      },
    },
  ],
};

/**
 * 图片元素验证模式
 */
export const ImageElementSchema: ValidationSchema = {
  rules: [
    ...BaseElementSchema.rules,
    {
      field: 'imageData',
      required: true,
      type: 'object',
      nested: ImageDataSchema,
    },
    {
      field: 'preserveAspectRatio',
      required: false,
      type: 'boolean',
    },
  ],
};

/**
 * 形状数据验证模式
 */
export const ShapeDataSchema: ValidationSchema = {
  rules: [
    {
      field: 'type',
      required: true,
      type: 'string',
      enum: Object.values(ShapeType),
    },
    {
      field: 'points',
      required: false,
      type: 'array',
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return true;
        return value.every(point =>
          typeof point === 'object' &&
          typeof point.x === 'number' &&
          typeof point.y === 'number'
        );
      },
    },
    {
      field: 'radius',
      required: false,
      type: 'number',
      min: 0,
    },
    {
      field: 'sides',
      required: false,
      type: 'number',
      min: 3,
      max: 100,
    },
    {
      field: 'cornerRadius',
      required: false,
      type: 'number',
      min: 0,
    },
  ],
};

/**
 * 形状元素验证模式
 */
export const ShapeElementSchema: ValidationSchema = {
  rules: [
    ...BaseElementSchema.rules,
    {
      field: 'shapeData',
      required: true,
      type: 'object',
      nested: ShapeDataSchema,
    },
  ],
};

/**
 * 画笔数据验证模式
 */
export const BrushDataSchema: ValidationSchema = {
  rules: [
    {
      field: 'points',
      required: true,
      type: 'array',
      minLength: 2,
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return '画笔点必须是数组';
        return value.every(point =>
          typeof point === 'object' &&
          typeof point.x === 'number' &&
          typeof point.y === 'number'
        ) || '画笔点格式不正确';
      },
    },
    {
      field: 'settings',
      required: true,
      type: 'object',
      nested: {
        rules: [
          {
            field: 'size',
            required: true,
            type: 'number',
            min: 1,
            max: 1000,
          },
          CommonRules.opacity(),
          {
            field: 'hardness',
            required: true,
            type: 'number',
            min: 0,
            max: 100,
          },
          CommonRules.color(),
          {
            field: 'blendMode',
            required: true,
            type: 'string',
            enum: Object.values(BlendMode),
          },
        ],
      },
    },
  ],
};

/**
 * 画笔元素验证模式
 */
export const BrushElementSchema: ValidationSchema = {
  rules: [
    ...BaseElementSchema.rules,
    {
      field: 'brushData',
      required: true,
      type: 'object',
      nested: BrushDataSchema,
    },
  ],
};

/**
 * 组合元素验证模式
 */
export const GroupElementSchema: ValidationSchema = {
  rules: [
    ...BaseElementSchema.rules,
    {
      field: 'children',
      required: true,
      type: 'array',
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return '子元素必须是数组';
        return value.every(id => typeof id === 'string') || '子元素ID必须是字符串';
      },
    },
    {
      field: 'clipToBounds',
      required: false,
      type: 'boolean',
    },
  ],
};

/**
 * 视口变换验证模式
 */
export const ViewportTransformSchema: ValidationSchema = {
  rules: [
    CommonRules.coordinate('x'),
    CommonRules.coordinate('y'),
    {
      field: 'zoom',
      required: true,
      type: 'number',
      min: 0.01,
      max: 100,
    },
    {
      field: 'rotation',
      required: false,
      type: 'number',
      min: -360,
      max: 360,
    },
  ],
};

/**
 * 画布状态验证模式
 */
export const CanvasStateSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    CommonRules.name(),
    {
      field: 'config',
      required: true,
      type: 'object',
      nested: CanvasConfigSchema,
    },
    {
      field: 'elements',
      required: true,
      type: 'array',
    },
    {
      field: 'selectedElementIds',
      required: true,
      type: 'array',
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return '选中元素ID必须是数组';
        return value.every(id => typeof id === 'string') || '元素ID必须是字符串';
      },
    },
    {
      field: 'viewport',
      required: true,
      type: 'object',
      nested: ViewportTransformSchema,
    },
    {
      field: 'isModified',
      required: true,
      type: 'boolean',
    },
    CommonRules.timestamp('createdAt'),
    CommonRules.timestamp('updatedAt'),
  ],
};

/**
 * 元素创建参数验证模式
 */
export const CreateElementParamsSchema: ValidationSchema = {
  rules: [
    {
      field: 'type',
      required: true,
      type: 'string',
      enum: Object.values(ElementType),
    },
    CommonRules.coordinate('x'),
    CommonRules.coordinate('y'),
    CommonRules.size('width'),
    CommonRules.size('height'),
    {
      field: 'properties',
      required: false,
      type: 'object',
    },
  ],
};

/**
 * 元素更新参数验证模式
 */
export const UpdateElementParamsSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    {
      field: 'updates',
      required: true,
      type: 'object',
      custom: (value: any) => {
        if (typeof value !== 'object' || value === null) return '更新数据必须是对象';
        if (Object.keys(value).length === 0) return '更新数据不能为空';
        return true;
      },
    },
  ],
};

/**
 * 验证画布元素
 */
export async function validateCanvasElement(element: any): Promise<import('./base').ValidationResult> {
  // 根据元素类型选择对应的验证模式
  let schema: ValidationSchema;

  switch (element.type) {
    case ElementType.TEXT:
      schema = TextElementSchema;
      break;
    case ElementType.IMAGE:
      schema = ImageElementSchema;
      break;
    case ElementType.SHAPE:
      schema = ShapeElementSchema;
      break;
    case ElementType.BRUSH:
      schema = BrushElementSchema;
      break;
    case ElementType.GROUP:
      schema = GroupElementSchema;
      break;
    default:
      schema = BaseElementSchema;
  }

  const { Validator } = await import('./base');
  return Validator.validate(element, schema);
}

/**
 * 验证画布配置
 */
export async function validateCanvasConfig(config: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(config, CanvasConfigSchema);
}

/**
 * 验证画布状态
 */
export async function validateCanvasState(state: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(state, CanvasStateSchema);
}

/**
 * 验证元素创建参数
 */
export async function validateCreateElementParams(params: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(params, CreateElementParamsSchema);
}

/**
 * 验证元素更新参数
 */
export async function validateUpdateElementParams(params: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(params, UpdateElementParamsSchema);
}