/**
 * 素材数据验证模式
 * @description 定义素材相关数据的验证规则
 * @author 开发团队
 */
import { ValidationSchema, CommonRules } from './base';
import { AssetType, AssetCategory, AssetStatus, AssetLicense } from '../types/asset';

/**
 * 文件信息验证模式
 */
export const FileInfoSchema: ValidationSchema = {
  rules: [
    CommonRules.name(),
    {
      field: 'originalName',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
    },
    {
      field: 'extension',
      required: true,
      type: 'string',
      pattern: /^\.[a-zA-Z0-9]+$/,
    },
    {
      field: 'mimeType',
      required: true,
      type: 'string',
      pattern: /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/,
    },
    {
      field: 'size',
      required: true,
      type: 'number',
      min: 0,
      max: 1024 * 1024 * 1024, // 1GB
    },
    {
      field: 'checksum',
      required: true,
      type: 'string',
      pattern: /^[a-fA-F0-9]{32,64}$/,
    },
  ],
};

/**
 * 图片元数据验证模式
 */
export const ImageMetadataSchema: ValidationSchema = {
  rules: [
    CommonRules.size('width'),
    CommonRules.size('height'),
    {
      field: 'aspectRatio',
      required: true,
      type: 'number',
      min: 0.01,
      max: 100,
    },
    {
      field: 'colorSpace',
      required: true,
      type: 'string',
      enum: ['sRGB', 'Adobe RGB', 'ProPhoto RGB', 'CMYK', 'Grayscale'],
    },
    {
      field: 'hasAlpha',
      required: true,
      type: 'boolean',
    },
    {
      field: 'dpi',
      required: false,
      type: 'number',
      min: 1,
      max: 10000,
    },
    {
      field: 'dominantColors',
      required: false,
      type: 'array',
      maxLength: 10,
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return true;
        return value.every(color => typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color));
      },
    },
  ],
};

/**
 * 音频元数据验证模式
 */
export const AudioMetadataSchema: ValidationSchema = {
  rules: [
    {
      field: 'duration',
      required: true,
      type: 'number',
      min: 0,
      max: 86400, // 24小时
    },
    {
      field: 'bitrate',
      required: true,
      type: 'number',
      min: 8,
      max: 10000,
    },
    {
      field: 'sampleRate',
      required: true,
      type: 'number',
      min: 8000,
      max: 192000,
    },
    {
      field: 'channels',
      required: true,
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      field: 'format',
      required: true,
      type: 'string',
      enum: ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A'],
    },
    {
      field: 'title',
      required: false,
      type: 'string',
      maxLength: 200,
    },
    {
      field: 'artist',
      required: false,
      type: 'string',
      maxLength: 200,
    },
  ],
};

/**
 * 视频元数据验证模式
 */
export const VideoMetadataSchema: ValidationSchema = {
  rules: [
    CommonRules.size('width'),
    CommonRules.size('height'),
    {
      field: 'duration',
      required: true,
      type: 'number',
      min: 0,
      max: 86400, // 24小时
    },
    {
      field: 'frameRate',
      required: true,
      type: 'number',
      min: 1,
      max: 120,
    },
    {
      field: 'bitrate',
      required: true,
      type: 'number',
      min: 100,
      max: 100000,
    },
    {
      field: 'codec',
      required: true,
      type: 'string',
      enum: ['H.264', 'H.265', 'VP8', 'VP9', 'AV1'],
    },
    {
      field: 'hasAudio',
      required: true,
      type: 'boolean',
    },
    {
      field: 'aspectRatio',
      required: true,
      type: 'number',
      min: 0.1,
      max: 10,
    },
  ],
};

/**
 * 字体元数据验证模式
 */
export const FontMetadataSchema: ValidationSchema = {
  rules: [
    {
      field: 'family',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    {
      field: 'style',
      required: true,
      type: 'string',
      enum: ['normal', 'italic', 'oblique'],
    },
    {
      field: 'weight',
      required: true,
      type: 'number',
      min: 100,
      max: 900,
      custom: (value: number) => value % 100 === 0 || '字体粗细必须是100的倍数',
    },
    {
      field: 'format',
      required: true,
      type: 'string',
      enum: ['TTF', 'OTF', 'WOFF', 'WOFF2', 'EOT'],
    },
    {
      field: 'glyphCount',
      required: true,
      type: 'number',
      min: 1,
      max: 100000,
    },
    {
      field: 'languages',
      required: true,
      type: 'array',
      minLength: 1,
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return '语言列表必须是数组';
        return value.every(lang => typeof lang === 'string' && lang.length >= 2);
      },
    },
  ],
};

/**
 * 素材使用统计验证模式
 */
export const AssetUsageStatsSchema: ValidationSchema = {
  rules: [
    {
      field: 'totalUsage',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'recentUsage',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'projectUsage',
      required: true,
      type: 'array',
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return '项目使用记录必须是数组';
        return value.every(usage =>
          typeof usage === 'object' &&
          typeof usage.projectId === 'string' &&
          typeof usage.projectName === 'string' &&
          typeof usage.usageCount === 'number' &&
          typeof usage.lastUsed === 'string'
        );
      },
    },
    {
      field: 'popularityScore',
      required: true,
      type: 'number',
      min: 0,
      max: 100,
    },
    {
      field: 'trendingScore',
      required: true,
      type: 'number',
      min: 0,
      max: 100,
    },
  ],
};

/**
 * 素材评分验证模式
 */
export const AssetRatingSchema: ValidationSchema = {
  rules: [
    {
      field: 'average',
      required: true,
      type: 'number',
      min: 0,
      max: 5,
    },
    {
      field: 'count',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'distribution',
      required: true,
      type: 'object',
      nested: {
        rules: [
          { field: '1', required: true, type: 'number', min: 0 },
          { field: '2', required: true, type: 'number', min: 0 },
          { field: '3', required: true, type: 'number', min: 0 },
          { field: '4', required: true, type: 'number', min: 0 },
          { field: '5', required: true, type: 'number', min: 0 },
        ],
      },
    },
    {
      field: 'userRating',
      required: false,
      type: 'number',
      min: 1,
      max: 5,
    },
  ],
};

/**
 * 素材版本验证模式
 */
export const AssetVersionSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    {
      field: 'version',
      required: true,
      type: 'string',
      pattern: /^\d+\.\d+\.\d+$/,
    },
    CommonRules.description(false),
    {
      field: 'fileInfo',
      required: true,
      type: 'object',
      nested: FileInfoSchema,
    },
    CommonRules.url(),
    {
      field: 'thumbnailUrl',
      required: false,
      type: 'string',
      pattern: /^https?:\/\/.+/,
    },
    CommonRules.timestamp('createdAt'),
    {
      field: 'createdBy',
      required: true,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'isActive',
      required: true,
      type: 'boolean',
    },
  ],
};

/**
 * 素材主验证模式
 */
export const AssetSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    CommonRules.name(),
    CommonRules.description(false),
    {
      field: 'type',
      required: true,
      type: 'string',
      enum: Object.values(AssetType),
    },
    {
      field: 'category',
      required: true,
      type: 'string',
      enum: Object.values(AssetCategory),
    },
    {
      field: 'status',
      required: true,
      type: 'string',
      enum: Object.values(AssetStatus),
    },
    {
      field: 'fileInfo',
      required: true,
      type: 'object',
      nested: FileInfoSchema,
    },
    CommonRules.url(),
    {
      field: 'thumbnailUrl',
      required: false,
      type: 'string',
      pattern: /^https?:\/\/.+/,
    },
    CommonRules.tags(),
    {
      field: 'keywords',
      required: true,
      type: 'array',
      maxLength: 50,
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return '关键词必须是数组';
        return value.every(keyword => typeof keyword === 'string' && keyword.length <= 50);
      },
    },
    {
      field: 'license',
      required: true,
      type: 'string',
      enum: Object.values(AssetLicense),
    },
    {
      field: 'currentVersion',
      required: true,
      type: 'string',
      pattern: /^\d+\.\d+\.\d+$/,
    },
    {
      field: 'versions',
      required: true,
      type: 'array',
      minLength: 1,
    },
    {
      field: 'usageStats',
      required: true,
      type: 'object',
      nested: AssetUsageStatsSchema,
    },
    {
      field: 'rating',
      required: true,
      type: 'object',
      nested: AssetRatingSchema,
    },
    {
      field: 'isFavorite',
      required: true,
      type: 'boolean',
    },
    {
      field: 'favoriteCount',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'downloadCount',
      required: true,
      type: 'number',
      min: 0,
    },
    {
      field: 'viewCount',
      required: true,
      type: 'number',
      min: 0,
    },
    CommonRules.timestamp('createdAt'),
    CommonRules.timestamp('updatedAt'),
    {
      field: 'createdBy',
      required: true,
      type: 'string',
      minLength: 1,
    },
    {
      field: 'isPublic',
      required: true,
      type: 'boolean',
    },
    {
      field: 'isVerified',
      required: true,
      type: 'boolean',
    },
    {
      field: 'isPremium',
      required: true,
      type: 'boolean',
    },
  ],
};

/**
 * 素材创建参数验证模式
 */
export const CreateAssetParamsSchema: ValidationSchema = {
  rules: [
    CommonRules.name(),
    CommonRules.description(false),
    {
      field: 'type',
      required: true,
      type: 'string',
      enum: Object.values(AssetType),
    },
    {
      field: 'category',
      required: true,
      type: 'string',
      enum: Object.values(AssetCategory),
    },
    {
      field: 'url',
      required: false,
      type: 'string',
      pattern: /^https?:\/\/.+/,
    },
    CommonRules.tags(false),
    {
      field: 'keywords',
      required: false,
      type: 'array',
      maxLength: 50,
    },
    {
      field: 'license',
      required: false,
      type: 'string',
      enum: Object.values(AssetLicense),
    },
    {
      field: 'isPublic',
      required: false,
      type: 'boolean',
    },
  ],
};

/**
 * 素材更新参数验证模式
 */
export const UpdateAssetParamsSchema: ValidationSchema = {
  rules: [
    CommonRules.id(),
    CommonRules.name(false),
    CommonRules.description(false),
    {
      field: 'category',
      required: false,
      type: 'string',
      enum: Object.values(AssetCategory),
    },
    CommonRules.tags(false),
    {
      field: 'keywords',
      required: false,
      type: 'array',
      maxLength: 50,
    },
    {
      field: 'license',
      required: false,
      type: 'string',
      enum: Object.values(AssetLicense),
    },
    {
      field: 'isPublic',
      required: false,
      type: 'boolean',
    },
  ],
};

/**
 * 素材查询过滤器验证模式
 */
export const AssetFilterSchema: ValidationSchema = {
  rules: [
    {
      field: 'type',
      required: false,
      type: 'array',
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return true;
        return value.every(type => Object.values(AssetType).includes(type));
      },
    },
    {
      field: 'category',
      required: false,
      type: 'array',
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return true;
        return value.every(category => Object.values(AssetCategory).includes(category));
      },
    },
    {
      field: 'status',
      required: false,
      type: 'array',
      custom: (value: any[]) => {
        if (!Array.isArray(value)) return true;
        return value.every(status => Object.values(AssetStatus).includes(status));
      },
    },
    {
      field: 'sizeMin',
      required: false,
      type: 'number',
      min: 0,
    },
    {
      field: 'sizeMax',
      required: false,
      type: 'number',
      min: 0,
    },
    {
      field: 'ratingMin',
      required: false,
      type: 'number',
      min: 0,
      max: 5,
    },
    {
      field: 'ratingMax',
      required: false,
      type: 'number',
      min: 0,
      max: 5,
    },
    {
      field: 'isPublic',
      required: false,
      type: 'boolean',
    },
    {
      field: 'isVerified',
      required: false,
      type: 'boolean',
    },
    {
      field: 'isPremium',
      required: false,
      type: 'boolean',
    },
  ],
  allowUnknown: true,
};

/**
 * 验证素材数据
 */
export async function validateAsset(asset: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(asset, AssetSchema);
}

/**
 * 验证素材创建参数
 */
export async function validateCreateAssetParams(params: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(params, CreateAssetParamsSchema);
}

/**
 * 验证素材更新参数
 */
export async function validateUpdateAssetParams(params: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(params, UpdateAssetParamsSchema);
}

/**
 * 验证素材过滤器
 */
export async function validateAssetFilter(filter: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(filter, AssetFilterSchema);
}

/**
 * 验证文件信息
 */
export async function validateFileInfo(fileInfo: any): Promise<import('./base').ValidationResult> {
  const { Validator } = await import('./base');
  return Validator.validate(fileInfo, FileInfoSchema);
}

/**
 * 根据素材类型验证元数据
 */
export async function validateAssetMetadata(metadata: any, assetType: AssetType): Promise<import('./base').ValidationResult> {
  let schema: ValidationSchema;

  switch (assetType) {
    case AssetType.IMAGE:
      schema = ImageMetadataSchema;
      break;
    case AssetType.AUDIO:
      schema = AudioMetadataSchema;
      break;
    case AssetType.VIDEO:
      schema = VideoMetadataSchema;
      break;
    case AssetType.FONT:
      schema = FontMetadataSchema;
      break;
    default:
      // 对于其他类型，使用基础验证
      schema = { rules: [], allowUnknown: true };
  }

  const { Validator } = await import('./base');
  return Validator.validate(metadata, schema);
}