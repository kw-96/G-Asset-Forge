// 素材管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { 
  IAssetMetadata, 
  IAssetFile, 
  IAssetLibrary, 
  IAssetSearchOptions, 
  IAssetSearchResult 
} from './asset-types';

export interface IAssetManagerEvents extends Record<string, (...args: any[]) => void> {
  assetAdded(asset: IAssetMetadata): void;
  assetRemoved(assetId: string): void;
  assetUpdated(asset: IAssetMetadata): void;
  libraryAdded(library: IAssetLibrary): void;
  libraryRemoved(libraryId: string): void;
}

export class AssetManager extends TypedEventEmitter<IAssetManagerEvents> {
  private assets: Map<string, IAssetMetadata> = new Map();
  private libraries: Map<string, IAssetLibrary> = new Map();

  constructor() {
    super();
  }

  // 素材管理
  addAsset(asset: IAssetMetadata): void {
    this.assets.set(asset.id, asset);
    this.emit('assetAdded', asset);
  }

  removeAsset(assetId: string): void {
    if (this.assets.delete(assetId)) {
      this.emit('assetRemoved', assetId);
    }
  }

  updateAsset(asset: IAssetMetadata): void {
    if (this.assets.has(asset.id)) {
      this.assets.set(asset.id, asset);
      this.emit('assetUpdated', asset);
    }
  }

  getAsset(assetId: string): IAssetMetadata | undefined {
    return this.assets.get(assetId);
  }

  getAllAssets(): IAssetMetadata[] {
    return Array.from(this.assets.values());
  }

  // 搜索功能
  searchAssets(options: IAssetSearchOptions): IAssetSearchResult {
    let results = Array.from(this.assets.values());

    // 应用过滤器
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (options.type) {
      results = results.filter(asset => asset.type === options.type);
    }

    if (options.category) {
      results = results.filter(asset => asset.category === options.category);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(asset => 
        options.tags!.some(tag => asset.tags.includes(tag))
      );
    }

    if (options.author) {
      results = results.filter(asset => asset.author === options.author);
    }

    if (options.license) {
      results = results.filter(asset => asset.license === options.license);
    }

    // 排序
    if (options.sortBy) {
      results.sort((a, b) => {
        const aValue = a[options.sortBy!] as any;
        const bValue = b[options.sortBy!] as unknown;
        
        if (options.sortOrder === 'desc') {
          return (bValue as any) > (aValue as any) ? 1 : -1;
        } else {
          return (aValue as any) > (bValue as unknown) ? 1 : -1;
        }
      });
    }

    // 分页
    const total = results.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    
    results = results.slice(offset, offset + limit);

    return {
      assets: results,
      total,
      hasMore: offset + limit < total
    };
  }

  // 素材库管理
  addLibrary(library: IAssetLibrary): void {
    this.libraries.set(library.id, library);
    this.emit('libraryAdded', library);
  }

  removeLibrary(libraryId: string): void {
    if (this.libraries.delete(libraryId)) {
      this.emit('libraryRemoved', libraryId);
    }
  }

  getLibrary(libraryId: string): IAssetLibrary | undefined {
    return this.libraries.get(libraryId);
  }

  getAllLibraries(): IAssetLibrary[] {
    return Array.from(this.libraries.values());
  }
}