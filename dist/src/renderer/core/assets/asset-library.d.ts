import type { IAssetLibrary, IAssetMetadata, AssetType, AssetCategory } from './asset-types';
export declare class AssetLibrary implements IAssetLibrary {
    id: string;
    name: string;
    description?: string;
    assets: IAssetMetadata[];
    isLocal: boolean;
    path?: string;
    constructor(id: string, name: string, isLocal?: boolean, description?: string, path?: string);
    addAsset(asset: IAssetMetadata): void;
    removeAsset(assetId: string): boolean;
    getAsset(assetId: string): IAssetMetadata | undefined;
    getAssetsByType(type: AssetType): IAssetMetadata[];
    getAssetsByCategory(category: AssetCategory): IAssetMetadata[];
    searchAssets(query: string): IAssetMetadata[];
    getAssetCount(): number;
    clear(): void;
    toJSON(): IAssetLibrary;
    static fromJSON(data: IAssetLibrary): AssetLibrary;
}
//# sourceMappingURL=asset-library.d.ts.map