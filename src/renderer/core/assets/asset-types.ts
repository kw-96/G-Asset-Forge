// 素材系统类型定义
export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FONT = 'font',
  TEXTURE = 'texture',
  SPRITE = 'sprite',
  ANIMATION = 'animation'
}

export enum AssetCategory {
  BACKGROUND = 'background',
  CHARACTER = 'character',
  UI_ELEMENT = 'ui_element',
  ICON = 'icon',
  EFFECT = 'effect',
  TEXTURE = 'texture',
  AUDIO = 'audio',
  FONT = 'font'
}

export interface IAssetMetadata {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  tags: string[];
  description?: string;
  author?: string;
  license?: string;
  createdAt: number;
  updatedAt: number;
  
  // 文件信息
  fileName: string;
  fileSize: number;
  mimeType: string;
  
  // 尺寸信息（图片/视频）
  width?: number;
  height?: number;
  
  // 缩略图
  thumbnail?: string;
  
  // 自定义属性
  properties: Record<string, any>;
}

export interface IAssetFile {
  metadata: IAssetMetadata;
  data: ArrayBuffer | string;
  url?: string;
}

export interface IAssetLibrary {
  id: string;
  name: string;
  description?: string;
  assets: IAssetMetadata[];
  isLocal: boolean;
  path?: string;
}

export interface IAssetSearchOptions {
  query?: string;
  type?: AssetType;
  category?: AssetCategory;
  tags?: string[];
  author?: string;
  license?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface IAssetSearchResult {
  assets: IAssetMetadata[];
  total: number;
  hasMore: boolean;
}