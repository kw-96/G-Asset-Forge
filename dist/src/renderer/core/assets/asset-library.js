export class AssetLibrary {
    constructor(id, name, isLocal = true, description, path) {
        this.assets = [];
        this.id = id;
        this.name = name;
        this.isLocal = isLocal;
        this.description = description || '';
        this.path = path || '';
    }
    addAsset(asset) {
        this.assets.push(asset);
    }
    removeAsset(assetId) {
        const index = this.assets.findIndex(asset => asset.id === assetId);
        if (index !== -1) {
            this.assets.splice(index, 1);
            return true;
        }
        return false;
    }
    getAsset(assetId) {
        return this.assets.find(asset => asset.id === assetId);
    }
    getAssetsByType(type) {
        return this.assets.filter(asset => asset.type === type);
    }
    getAssetsByCategory(category) {
        return this.assets.filter(asset => asset.category === category);
    }
    searchAssets(query) {
        const lowerQuery = query.toLowerCase();
        return this.assets.filter(asset => asset.name.toLowerCase().includes(lowerQuery) ||
            asset.description?.toLowerCase().includes(lowerQuery) ||
            asset.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }
    getAssetCount() {
        return this.assets.length;
    }
    clear() {
        this.assets = [];
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description || '',
            assets: this.assets,
            isLocal: this.isLocal,
            path: this.path || '',
        };
    }
    static fromJSON(data) {
        const library = new AssetLibrary(data.id, data.name, data.isLocal, data.description, data.path);
        library.assets = data.assets;
        return library;
    }
}
//# sourceMappingURL=asset-library.js.map