import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { IAssetMetadata, IAssetLibrary, IAssetSearchOptions, IAssetSearchResult } from './asset-types';
export interface IAssetManagerEvents extends Record<string, (...args: any[]) => void> {
    assetAdded(asset: IAssetMetadata): void;
    assetRemoved(assetId: string): void;
    assetUpdated(asset: IAssetMetadata): void;
    libraryAdded(library: IAssetLibrary): void;
    libraryRemoved(libraryId: string): void;
}
export declare class AssetManager extends TypedEventEmitter<IAssetManagerEvents> {
    private assets;
    private libraries;
    constructor();
    addAsset(asset: IAssetMetadata): void;
    removeAsset(assetId: string): void;
    updateAsset(asset: IAssetMetadata): void;
    getAsset(assetId: string): IAssetMetadata | undefined;
    getAllAssets(): IAssetMetadata[];
    searchAssets(options: IAssetSearchOptions): IAssetSearchResult;
    addLibrary(library: IAssetLibrary): void;
    removeLibrary(libraryId: string): void;
    getLibrary(libraryId: string): IAssetLibrary | undefined;
    getAllLibraries(): IAssetLibrary[];
}
//# sourceMappingURL=asset-manager.d.ts.map