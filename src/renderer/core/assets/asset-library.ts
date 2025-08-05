// 素材库实现
import type { IAssetLibrary, IAssetMetadata, AssetType, AssetCategory } from './asset-types';

export class AssetLibrary implements IAssetLibrary {
  public id: string;
  public name: string;
  public description?: string;
  public assets: IAssetMetadata[] = [];
  public isLocal: boolean;
  public path?: string;

  constructor(
    id: string, 
    name: string, 
    isLocal: boolean = true, 
    description?: string, 
    path?: string
  ) {
    this.id = id;
    this.name = name;
    this.isLocal = isLocal;
    this.description = description || '';
    this.path = path || '';
  }

  addAsset(asset: IAssetMetadata): void {
    this.assets.push(asset);
  }

  removeAsset(assetId: string): boolean {
    const index = this.assets.findIndex(asset => asset.id === assetId);
    if (index !== -1) {
      this.assets.splice(index, 1);
      return true;
    }
    return false;
  }

  getAsset(assetId: string): IAssetMetadata | undefined {
    return this.assets.find(asset => asset.id === assetId);
  }

  getAssetsByType(type: AssetType): IAssetMetadata[] {
    return this.assets.filter(asset => asset.type === type);
  }

  getAssetsByCategory(category: AssetCategory): IAssetMetadata[] {
    return this.assets.filter(asset => asset.category === category);
  }

  searchAssets(query: string): IAssetMetadata[] {
    const lowerQuery = query.toLowerCase();
    return this.assets.filter(asset => 
      asset.name.toLowerCase().includes(lowerQuery) ||
      asset.description?.toLowerCase().includes(lowerQuery) ||
      asset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getAssetCount(): number {
    return this.assets.length;
  }

  clear(): void {
    this.assets = [];
  }

  toJSON(): IAssetLibrary {
    return {
      id: this.id,
      name: this.name,
      description: this.description || '',
      assets: this.assets,
      isLocal: this.isLocal,
      path: this.path || '',
    };
  }

  static fromJSON(data: IAssetLibrary): AssetLibrary {
    const library = new AssetLibrary(
      data.id,
      data.name,
      data.isLocal,
      data.description,
      data.path
    );
    library.assets = data.assets;
    return library;
  }
}