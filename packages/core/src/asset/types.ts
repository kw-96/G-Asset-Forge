/**
 * 素材类型枚举
 */
export enum AssetType {
  /** 图标素材 */
  Icon = 'icon',
  /** 背景素材 */
  Background = 'background',
  /** 装饰元素 */
  Decoration = 'decoration',
  /** 角色素材 */
  Character = 'character',
  /** 图片素材 */
  Image = 'image',
}

/**
 * 素材分类
 */
export interface AssetCategory {
  /** 分类ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 父分类ID */
  parentId?: string;
  /** 排序权重 */
  order: number;
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 素材标签
 */
export interface AssetTag {
  /** 标签ID */
  id: string;
  /** 标签名称 */
  name: string;
  /** 标签颜色 */
  color?: string;
  /** 使用次数 */
  usageCount: number;
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 素材数据接口
 */
export interface AssetData {
  /** 素材唯一ID */
  id: string;
  /** 素材名称 */
  name: string;
  /** 素材类型 */
  type: AssetType;
  /** 分类ID */
  categoryId: string;
  /** 标签ID列表 */
  tagIds: string[];

  // 文件信息
  /** 原始文件名 */
  filename: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** MIME类型 */
  mimeType: string;
  /** 文件数据（Blob对象） */
  blob?: Blob;

  // 图片元数据
  /** 图片宽度 */
  width: number;
  /** 图片高度 */
  height: number;
  /** 缩略图数据URL */
  thumbnail: string;

  // 使用统计
  /** 使用次数 */
  usageCount: number;
  /** 最后使用时间 */
  lastUsed: Date;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;

  // 可选的自定义属性
  /** 描述信息 */
  description?: string;
  /** 作者信息 */
  author?: string;
  /** 版权信息 */
  copyright?: string;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}

/**
 * 素材查询条件
 */
export interface AssetQueryOptions {
  /** 关键词搜索 */
  keyword?: string;
  /** 素材类型筛选 */
  type?: AssetType;
  /** 分类ID筛选 */
  categoryId?: string;
  /** 标签ID筛选 */
  tagIds?: string[];
  /** 排序字段 */
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 分页偏移 */
  offset?: number;
  /** 分页大小 */
  limit?: number;
}

/**
 * 素材查询结果
 */
export interface AssetQueryResult {
  /** 素材列表 */
  assets: AssetData[];
  /** 总数量 */
  total: number;
  /** 当前偏移 */
  offset: number;
  /** 分页大小 */
  limit: number;
}

/**
 * 素材创建参数
 */
export interface CreateAssetParams {
  /** 素材名称 */
  name: string;
  /** 素材类型 */
  type: AssetType;
  /** 分类ID */
  categoryId: string;
  /** 标签ID列表 */
  tagIds?: string[];
  /** 文件对象 */
  file: File;
  /** 描述信息 */
  description?: string;
  /** 作者信息 */
  author?: string;
  /** 版权信息 */
  copyright?: string;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}

/**
 * 素材更新参数
 */
export interface UpdateAssetParams {
  /** 素材名称 */
  name?: string;
  /** 分类ID */
  categoryId?: string;
  /** 标签ID列表 */
  tagIds?: string[];
  /** 描述信息 */
  description?: string;
  /** 作者信息 */
  author?: string;
  /** 版权信息 */
  copyright?: string;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}
