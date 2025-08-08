// 素材管理器
import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
export class AssetManager extends TypedEventEmitter {
    constructor() {
        super();
        this.assets = new Map();
        this.libraries = new Map();
    }
    // 素材管理
    addAsset(asset) {
        this.assets.set(asset.id, asset);
        this.emit('assetAdded', asset);
    }
    removeAsset(assetId) {
        if (this.assets.delete(assetId)) {
            this.emit('assetRemoved', assetId);
        }
    }
    updateAsset(asset) {
        if (this.assets.has(asset.id)) {
            this.assets.set(asset.id, asset);
            this.emit('assetUpdated', asset);
        }
    }
    getAsset(assetId) {
        return this.assets.get(assetId);
    }
    getAllAssets() {
        return Array.from(this.assets.values());
    }
    // 搜索功能
    searchAssets(options) {
        let results = Array.from(this.assets.values());
        // 应用过滤器
        if (options.query) {
            const query = options.query.toLowerCase();
            results = results.filter(asset => asset.name.toLowerCase().includes(query) ||
                asset.description?.toLowerCase().includes(query) ||
                asset.tags.some(tag => tag.toLowerCase().includes(query)));
        }
        if (options.type) {
            results = results.filter(asset => asset.type === options.type);
        }
        if (options.category) {
            results = results.filter(asset => asset.category === options.category);
        }
        if (options.tags && options.tags.length > 0) {
            results = results.filter(asset => options.tags.some(tag => asset.tags.includes(tag)));
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
                const aValue = a[options.sortBy];
                const bValue = b[options.sortBy];
                if (options.sortOrder === 'desc') {
                    return bValue > aValue ? 1 : -1;
                }
                else {
                    return aValue > bValue ? 1 : -1;
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
    addLibrary(library) {
        this.libraries.set(library.id, library);
        this.emit('libraryAdded', library);
    }
    removeLibrary(libraryId) {
        if (this.libraries.delete(libraryId)) {
            this.emit('libraryRemoved', libraryId);
        }
    }
    getLibrary(libraryId) {
        return this.libraries.get(libraryId);
    }
    getAllLibraries() {
        return Array.from(this.libraries.values());
    }
}
//# sourceMappingURL=asset-manager.js.map