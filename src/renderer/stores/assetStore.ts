/**
 * 素材状态管理 - 管理素材库的状态和操作
 * @description 管理素材分类、搜索、收藏、上传等功能的状态
 * @author 开发团队
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * 素材类型枚举
 * @description 定义所有支持的素材类型
 */
export type AssetType = 
  | 'image'       // 图片素材
  | 'background'  // 背景素材
  | 'character'   // 角色素材
  | 'ui'          // UI元素
  | 'icon'        // 图标素材
  | 'effect'      // 特效素材
  | 'texture'     // 纹理素材
  | 'pattern'     // 图案素材
  | 'template'    // 模板素材
  | 'font';       // 字体素材

/**
 * 素材格式枚举
 * @description 定义支持的素材文件格式
 */
export type AssetFormat = 
  | 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'svg'  // 图片格式
  | 'ttf' | 'otf' | 'woff' | 'woff2'                 // 字体格式
  | 'json' | 'lottie'                                // 动画格式
  | 'psd' | 'ai' | 'sketch' | 'figma';               // 设计文件格式

/**
 * 素材标签接口
 * @description 定义素材标签的结构
 */
export interface AssetTag {
  id: string;
  name: string;
  color: string;
  category: AssetType;
  count: number;
}

/**
 * 素材元数据接口
 * @description 定义素材的元数据信息
 */
export interface AssetMetadata {
  width: number;
  height: number;
  size: number;
  format: AssetFormat;
  colorMode: 'rgb' | 'cmyk' | 'grayscale';
  hasTransparency: boolean;
  dpi?: number;
  createdAt: string;
  modifiedAt: string;
  author?: string;
  license?: string;
  description?: string;
}

/**
 * 素材接口
 * @description 定义单个素材的完整信息
 */
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  category: string;
  subcategory?: string;
  
  // 文件信息
  url: string;
  thumbnailUrl: string;
  previewUrl?: string;
  metadata: AssetMetadata;
  
  // 分类和标签
  tags: string[];
  keywords: string[];
  
  // 状态信息
  isFavorite: boolean;
  isRecent: boolean;
  downloadCount: number;
  rating: number;
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  
  // 来源信息
  source: 'local' | 'builtin' | 'online' | 'imported';
  sourceUrl?: string;
  
  // 使用统计
  usageCount: number;
  projectIds: string[];
}

/**
 * 素材分类接口
 * @description 定义素材分类的结构
 */
export interface AssetCategory {
  id: string;
  name: string;
  type: AssetType;
  icon: string;
  description: string;
  subcategories: AssetSubcategory[];
  assetCount: number;
  isExpanded: boolean;
}

/**
 * 素材子分类接口
 * @description 定义素材子分类的结构
 */
export interface AssetSubcategory {
  id: string;
  name: string;
  parentId: string;
  icon?: string;
  description?: string;
  assetCount: number;
}

/**
 * 搜索过滤器接口
 * @description 定义素材搜索和过滤的条件
 */
export interface AssetFilter {
  query: string;
  types: AssetType[];
  categories: string[];
  tags: string[];
  formats: AssetFormat[];
  sizeRange: { min: number; max: number };
  dateRange: { start: string; end: string };
  source: ('local' | 'builtin' | 'online' | 'imported')[];
  onlyFavorites: boolean;
  onlyRecent: boolean;
  minRating: number;
}

/**
 * 排序选项枚举
 * @description 定义素材排序的方式
 */
export type SortOption = 
  | 'name-asc' | 'name-desc'
  | 'date-asc' | 'date-desc'
  | 'size-asc' | 'size-desc'
  | 'rating-asc' | 'rating-desc'
  | 'usage-asc' | 'usage-desc'
  | 'relevance';

/**
 * 上传进度接口
 * @description 定义文件上传的进度信息
 */
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

/**
 * 素材状态接口
 * @description 定义素材状态管理的完整接口
 */
export interface AssetState {
  // 素材数据
  assets: Record<string, Asset>;
  categories: Record<string, AssetCategory>;
  tags: Record<string, AssetTag>;
  
  // 当前状态
  selectedAssets: string[];
  selectedAsset: Asset | null;
  currentCategory: string | null;
  currentSubcategory: string | null;
  
  // 搜索和过滤
  searchQuery: string;
  activeFilters: AssetFilter;
  sortBy: SortOption;
  filteredAssets: string[];
  
  // UI状态
  isLoading: boolean;
  isSearching: boolean;
  isUploading: boolean;
  viewMode: 'grid' | 'list';
  gridSize: 'small' | 'medium' | 'large';
  showPreview: boolean;
  
  // 上传状态
  uploadQueue: UploadProgress[];
  
  // 收藏和最近使用
  favorites: string[];
  recentAssets: string[];
  maxRecentCount: number;
  
  // 缓存和性能
  thumbnailCache: Record<string, string>;
  preloadedAssets: Set<string>;
  
  // 素材操作方法
  loadAssets: () => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  duplicateAsset: (id: string) => Promise<string>;
  
  // 选择操作
  selectAsset: (id: string) => void;
  selectMultipleAssets: (ids: string[]) => void;
  clearSelection: () => void;
  toggleAssetSelection: (id: string) => void;
  
  // 分类操作
  setCurrentCategory: (categoryId: string | null) => void;
  setCurrentSubcategory: (subcategoryId: string | null) => void;
  expandCategory: (categoryId: string) => void;
  collapseCategory: (categoryId: string) => void;
  
  // 搜索和过滤
  setSearchQuery: (query: string) => void;
  updateFilters: (filters: Partial<AssetFilter>) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: SortOption) => void;
  applyFilters: () => void;
  
  // 收藏操作
  toggleFavorite: (id: string) => void;
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  getFavorites: () => Asset[];
  
  // 最近使用
  markAsRecent: (id: string) => void;
  getRecentAssets: (count?: number) => Asset[];
  clearRecentAssets: () => void;
  
  // 标签操作
  addTag: (tag: Omit<AssetTag, 'id' | 'count'>) => string;
  updateTag: (id: string, updates: Partial<AssetTag>) => void;
  deleteTag: (id: string) => void;
  addTagToAsset: (assetId: string, tagId: string) => void;
  removeTagFromAsset: (assetId: string, tagId: string) => void;
  
  // 上传操作
  uploadAssets: (files: File[]) => Promise<string[]>;
  cancelUpload: (fileId: string) => void;
  clearUploadQueue: () => void;
  
  // UI操作
  setViewMode: (mode: 'grid' | 'list') => void;
  setGridSize: (size: 'small' | 'medium' | 'large') => void;
  setShowPreview: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // 缓存操作
  preloadThumbnail: (assetId: string) => Promise<void>;
  clearThumbnailCache: () => void;
  preloadAsset: (assetId: string) => Promise<void>;
  
  // 导入导出
  exportAssets: (assetIds: string[]) => Promise<void>;
  importAssets: (data: any) => Promise<string[]>;
  
  // 统计和分析
  getAssetStats: () => {
    totalAssets: number;
    assetsByType: Record<AssetType, number>;
    assetsBySource: Record<string, number>;
    totalSize: number;
    averageRating: number;
  };
  
  // 初始化和重置
  initializeAssets: () => Promise<void>;
  resetAssetStore: () => void;
}

/**
 * 默认过滤器配置
 */
const DEFAULT_FILTERS: AssetFilter = {
  query: '',
  types: [],
  categories: [],
  tags: [],
  formats: [],
  sizeRange: { min: 0, max: Infinity },
  dateRange: { start: '', end: '' },
  source: [],
  onlyFavorites: false,
  onlyRecent: false,
  minRating: 0,
};

/**
 * 内置素材分类
 */
const BUILTIN_CATEGORIES: AssetCategory[] = [
  {
    id: 'backgrounds',
    name: '背景素材',
    type: 'background',
    icon: 'image',
    description: '游戏背景和场景素材',
    subcategories: [
      { id: 'sci-fi', name: '科幻风格', parentId: 'backgrounds', assetCount: 0 },
      { id: 'fantasy', name: '魔幻风格', parentId: 'backgrounds', assetCount: 0 },
      { id: 'modern', name: '现代风格', parentId: 'backgrounds', assetCount: 0 },
      { id: 'pixel', name: '像素风格', parentId: 'backgrounds', assetCount: 0 },
    ],
    assetCount: 0,
    isExpanded: false,
  },
  {
    id: 'characters',
    name: '角色素材',
    type: 'character',
    icon: 'user',
    description: '游戏角色和NPC素材',
    subcategories: [
      { id: 'heroes', name: '英雄角色', parentId: 'characters', assetCount: 0 },
      { id: 'enemies', name: '敌人角色', parentId: 'characters', assetCount: 0 },
      { id: 'npcs', name: 'NPC角色', parentId: 'characters', assetCount: 0 },
    ],
    assetCount: 0,
    isExpanded: false,
  },
  {
    id: 'ui-elements',
    name: 'UI元素',
    type: 'ui',
    icon: 'layout',
    description: '用户界面元素和组件',
    subcategories: [
      { id: 'buttons', name: '按钮', parentId: 'ui-elements', assetCount: 0 },
      { id: 'panels', name: '面板', parentId: 'ui-elements', assetCount: 0 },
      { id: 'progress', name: '进度条', parentId: 'ui-elements', assetCount: 0 },
      { id: 'decorations', name: '装饰元素', parentId: 'ui-elements', assetCount: 0 },
    ],
    assetCount: 0,
    isExpanded: false,
  },
  {
    id: 'icons',
    name: '图标素材',
    type: 'icon',
    icon: 'star',
    description: '游戏图标和符号',
    subcategories: [
      { id: 'items', name: '物品图标', parentId: 'icons', assetCount: 0 },
      { id: 'skills', name: '技能图标', parentId: 'icons', assetCount: 0 },
      { id: 'status', name: '状态图标', parentId: 'icons', assetCount: 0 },
    ],
    assetCount: 0,
    isExpanded: false,
  },
  {
    id: 'effects',
    name: '特效素材',
    type: 'effect',
    icon: 'zap',
    description: '视觉特效和动画素材',
    subcategories: [
      { id: 'particles', name: '粒子特效', parentId: 'effects', assetCount: 0 },
      { id: 'explosions', name: '爆炸特效', parentId: 'effects', assetCount: 0 },
      { id: 'magic', name: '魔法特效', parentId: 'effects', assetCount: 0 },
    ],
    assetCount: 0,
    isExpanded: false,
  },
];

/**
 * 素材状态存储Hook
 * @description 创建并导出素材状态管理Hook
 * @returns 素材状态存储实例
 * @example
 * const { assets, searchQuery, setSearchQuery } = useAssetStore();
 */
export const useAssetStore = create<AssetState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      assets: {},
      categories: BUILTIN_CATEGORIES.reduce((acc, cat) => {
        acc[cat.id] = cat;
        return acc;
      }, {} as Record<string, AssetCategory>),
      tags: {},
      
      selectedAssets: [],
      selectedAsset: null,
      currentCategory: null,
      currentSubcategory: null,
      
      searchQuery: '',
      activeFilters: DEFAULT_FILTERS,
      sortBy: 'name-asc',
      filteredAssets: [],
      
      isLoading: false,
      isSearching: false,
      isUploading: false,
      viewMode: 'grid',
      gridSize: 'medium',
      showPreview: true,
      
      uploadQueue: [],
      
      favorites: [],
      recentAssets: [],
      maxRecentCount: 20,
      
      thumbnailCache: {},
      preloadedAssets: new Set(),
      
      // 素材操作方法
      loadAssets: async () => {
        const state = get();
        
        if (state.isLoading) {
          return; // 避免重复加载
        }
        
        set({ isLoading: true });
        
        try {
          console.info('[asset-store] 开始加载素材');
          
          // 模拟加载内置素材
          const builtinAssets: Record<string, Asset> = {
            'bg-sci-fi-1': {
              id: 'bg-sci-fi-1',
              name: '科幻城市背景',
              type: 'background',
              category: 'backgrounds',
              subcategory: 'sci-fi',
              url: '/assets/backgrounds/sci-fi-city.jpg',
              thumbnailUrl: '/assets/thumbnails/sci-fi-city-thumb.jpg',
              metadata: {
                width: 1920,
                height: 1080,
                size: 2048000,
                format: 'jpg',
                colorMode: 'rgb',
                hasTransparency: false,
                dpi: 72,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                author: 'G-Asset Forge',
                license: 'Built-in',
                description: '未来科幻风格的城市背景',
              },
              tags: ['sci-fi', 'city', 'futuristic', 'blue'],
              keywords: ['科幻', '城市', '未来', '蓝色', '建筑'],
              isFavorite: false,
              isRecent: false,
              downloadCount: 0,
              rating: 4.5,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              source: 'builtin',
              usageCount: 0,
              projectIds: [],
            },
            'ui-button-1': {
              id: 'ui-button-1',
              name: '蓝色按钮',
              type: 'ui',
              category: 'ui-elements',
              subcategory: 'buttons',
              url: '/assets/ui/blue-button.png',
              thumbnailUrl: '/assets/thumbnails/blue-button-thumb.png',
              metadata: {
                width: 200,
                height: 60,
                size: 15000,
                format: 'png',
                colorMode: 'rgb',
                hasTransparency: true,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                author: 'G-Asset Forge',
                license: 'Built-in',
                description: '现代风格的蓝色按钮',
              },
              tags: ['button', 'ui', 'blue', 'modern'],
              keywords: ['按钮', 'UI', '蓝色', '现代'],
              isFavorite: false,
              isRecent: false,
              downloadCount: 0,
              rating: 4.0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              source: 'builtin',
              usageCount: 0,
              projectIds: [],
            },
          };
          
          // 更新分类计数
          const updatedCategories = { ...state.categories };
          Object.values(builtinAssets).forEach(asset => {
            const category = updatedCategories[asset.category];
            if (category) {
              category.assetCount++;
              
              if (asset.subcategory) {
                const subcategory = category.subcategories
                  .find(sub => sub.id === asset.subcategory);
                if (subcategory) {
                  subcategory.assetCount++;
                }
              }
            }
          });
          
          set({
            assets: builtinAssets,
            categories: updatedCategories,
            isLoading: false,
          });
          
          // 应用当前过滤器
          get().applyFilters();
          
          console.info('[asset-store] 素材加载完成', { 
            assetCount: Object.keys(builtinAssets).length 
          });
          
        } catch (error) {
          console.error('[asset-store] 素材加载失败:', error);
          set({ isLoading: false });
        }
      },
      
      addAsset: async (assetData) => {
        const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const asset: Asset = {
          ...assetData,
          id,
          createdAt: now,
          updatedAt: now,
          isFavorite: false,
          isRecent: true,
          downloadCount: 0,
          rating: 0,
          usageCount: 0,
          projectIds: [],
        };
        
        const state = get();
        const newAssets = { ...state.assets, [id]: asset };
        
        // 更新分类计数
        const updatedCategories = { ...state.categories };
        const category = updatedCategories[asset.category];
        if (category) {
          category.assetCount++;
          
          if (
            Array.isArray(category.subcategories) &&
            asset.subcategory
          ) {
            const subcategory = category.subcategories
              .find(sub => sub && sub.id === asset.subcategory);
            if (subcategory) {
              subcategory.assetCount++;
            }
          }
        }
        
        set({
          assets: newAssets,
          categories: updatedCategories,
        });
        
        // 标记为最近使用
        get().markAsRecent(id);
        
        // 重新应用过滤器
        get().applyFilters();
        
        console.info(`[asset-store] 添加素材: ${asset.name}`, { id, type: asset.type });
        
        return id;
      },
      
      updateAsset: (id: string, updates: Partial<Asset>) => {
        const state = get();
        const asset = state.assets[id];
        
        if (!asset) {
          console.warn(`[asset-store] 尝试更新不存在的素材: ${id}`);
          return;
        }
        
        const updatedAsset = {
          ...asset,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        const newAssets = { ...state.assets, [id]: updatedAsset };
        
        set({ assets: newAssets });
        
        // 重新应用过滤器
        get().applyFilters();
        
        console.debug(`[asset-store] 更新素材: ${id}`, { updatedKeys: Object.keys(updates) });
      },
      
      deleteAsset: (id: string) => {
        const state = get();
        const asset = state.assets[id];
        
        if (!asset) {
          console.warn(`[asset-store] 尝试删除不存在的素材: ${id}`);
          return;
        }
        
        const newAssets = { ...state.assets };
        delete newAssets[id];
        
        // 更新分类计数
        const updatedCategories = { ...state.categories };
        const category = updatedCategories[asset.category];
        if (category) {
          category.assetCount--;
          
          if (asset.subcategory) {
            const subcategory = category.subcategories
              ?.find(sub => sub && sub.id === asset.subcategory);
            if (subcategory) {
              subcategory.assetCount--;
            }
          }
        }
        
        // 从选择中移除
        const newSelectedAssets = state.selectedAssets.filter(selectedId => selectedId !== id);
        const newSelectedAsset = state.selectedAsset?.id === id ? null : state.selectedAsset;
        
        // 从收藏和最近使用中移除
        const newFavorites = state.favorites.filter(favId => favId !== id);
        const newRecentAssets = state.recentAssets.filter(recentId => recentId !== id);
        
        set({
          assets: newAssets,
          categories: updatedCategories,
          selectedAssets: newSelectedAssets,
          selectedAsset: newSelectedAsset,
          favorites: newFavorites,
          recentAssets: newRecentAssets,
        });
        
        // 重新应用过滤器
        get().applyFilters();
        
        console.info(`[asset-store] 删除素材: ${asset.name}`, { id, type: asset.type });
      },
      
      duplicateAsset: async (id: string) => {
        const state = get();
        const asset = state.assets[id];
        
        if (!asset) {
          console.warn(`[asset-store] 尝试复制不存在的素材: ${id}`);
          return '';
        }
        
        const duplicatedAsset = {
          ...asset,
          name: `${asset.name} (副本)`,
          source: 'local' as const,
          usageCount: 0,
          projectIds: [],
        };
        
        delete (duplicatedAsset as any).id;
        delete (duplicatedAsset as any).createdAt;
        delete (duplicatedAsset as any).updatedAt;
        
        const newId = await get().addAsset(duplicatedAsset);
        
        console.info(`[asset-store] 复制素材: ${asset.name}`, { originalId: id, newId });
        
        return newId;
      },
      
      // 选择操作
      selectAsset: (id: string) => {
        const state = get();
        const asset = state.assets[id];
        
        if (!asset) {
          console.warn(`[asset-store] 尝试选择不存在的素材: ${id}`);
          return;
        }
        
        set({
          selectedAssets: [id],
          selectedAsset: asset,
        });
        
        // 标记为最近使用
        get().markAsRecent(id);
      },
      
      selectMultipleAssets: (ids: string[]) => {
        const state = get();
        const validIds = ids.filter(id => state.assets[id]);
        
        if (validIds.length !== ids.length) {
          const invalidIds = ids.filter(id => !state.assets[id]);
          console.warn('[asset-store] 尝试选择不存在的素材', { invalidIds });
        }
        
        const selectedAsset = validIds.length === 1 && validIds[0] ? (state.assets[validIds[0]] ?? null) : null;
        
        set({
          selectedAssets: validIds,
          selectedAsset,
        });
      },
      
      clearSelection: () => {
        set({
          selectedAssets: [],
          selectedAsset: null,
        });
      },
      
      toggleAssetSelection: (id: string) => {
        const state = get();
        
        if (!state.assets[id]) {
          console.warn(`[asset-store] 尝试切换选择不存在的素材: ${id}`);
          return;
        }
        
        const isSelected = state.selectedAssets.includes(id);
        
        if (isSelected) {
          const newSelectedAssets = state.selectedAssets.filter(selectedId => selectedId !== id);
          const newSelectedAsset = newSelectedAssets.length === 1 && newSelectedAssets[0]
            ? (state.assets[newSelectedAssets[0]] ?? null)
            : null;

          set({
            selectedAssets: newSelectedAssets,
            selectedAsset: newSelectedAsset,
          });
        } else {
          const newSelectedAssets = [...state.selectedAssets, id];
          const newSelectedAsset = newSelectedAssets.length === 1 
            ? state.assets[id] ?? null
            : null;
          
          set({
            selectedAssets: newSelectedAssets,
            selectedAsset: newSelectedAsset,
          });
          
          // 标记为最近使用
          get().markAsRecent(id);
        }
      },
      
      // 分类操作
      setCurrentCategory: (categoryId: string | null) => {
        set({
          currentCategory: categoryId,
          currentSubcategory: null,
        });
        
        get().applyFilters();
      },
      
      setCurrentSubcategory: (subcategoryId: string | null) => {
        set({ currentSubcategory: subcategoryId });
        get().applyFilters();
      },
      
      expandCategory: (categoryId: string) => {
        const state = get();
        const category = state.categories[categoryId];
        
        if (category && !category.isExpanded) {
          const updatedCategories = {
            ...state.categories,
            [categoryId]: { ...category, isExpanded: true },
          };
          
          set({ categories: updatedCategories });
        }
      },
      
      collapseCategory: (categoryId: string) => {
        const state = get();
        const category = state.categories[categoryId];
        
        if (category && category.isExpanded) {
          const updatedCategories = {
            ...state.categories,
            [categoryId]: { ...category, isExpanded: false },
          };
          
          set({ categories: updatedCategories });
        }
      },
      
      // 搜索和过滤
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        get().applyFilters();
      },
      
      updateFilters: (filters: Partial<AssetFilter>) => {
        const state = get();
        const newFilters = { ...state.activeFilters, ...filters };
        
        set({ activeFilters: newFilters });
        get().applyFilters();
      },
      
      clearFilters: () => {
        set({
          searchQuery: '',
          activeFilters: DEFAULT_FILTERS,
          currentCategory: null,
          currentSubcategory: null,
        });
        
        get().applyFilters();
      },
      
      setSortBy: (sortBy: SortOption) => {
        set({ sortBy });
        get().applyFilters();
      },
      
      applyFilters: () => {
        const state = get();
        const { assets, searchQuery, activeFilters, currentCategory, currentSubcategory, sortBy } = state;
        
        let filteredIds = Object.keys(assets);
        
        // 应用搜索查询
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredIds = filteredIds.filter(id => {
            const asset = assets[id];
            if (!asset) return false;
            return (
              asset.name.toLowerCase().includes(query) ||
              asset.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
              asset.tags.some(tag => tag.toLowerCase().includes(query))
            );
          });
        }
        
        // 应用分类过滤
        if (currentCategory) {
          filteredIds = filteredIds.filter(id => {
            const asset = assets[id];
            return asset?.category === currentCategory;
          });
        }
        
        if (currentSubcategory) {
          filteredIds = filteredIds.filter(id => {
            const asset = assets[id];
            return asset?.subcategory === currentSubcategory;
          });
        }
        
        // 应用其他过滤器
        if (activeFilters.types.length > 0) {
          filteredIds = filteredIds.filter(id => {
            const asset = assets[id];
            return asset && activeFilters.types.includes(asset.type);
          });
        }
        
        if (activeFilters.onlyFavorites) {
          filteredIds = filteredIds.filter(id => state.favorites.includes(id));
        }
        
        if (activeFilters.onlyRecent) {
          filteredIds = filteredIds.filter(id => state.recentAssets.includes(id));
        }
        
        // 应用排序
        filteredIds.sort((a, b) => {
          const assetA = assets[a];
          const assetB = assets[b];
          
          // 如果任一素材不存在，保持原有顺序
          if (!assetA || !assetB) return 0;
          
          switch (sortBy) {
            case 'name-asc':
              return assetA.name.localeCompare(assetB.name);
            case 'name-desc':
              return assetB.name.localeCompare(assetA.name);
            case 'date-asc':
              return new Date(assetA.createdAt).getTime() - new Date(assetB.createdAt).getTime();
            case 'date-desc':
              return new Date(assetB.createdAt).getTime() - new Date(assetA.createdAt).getTime();
            case 'size-asc':
              return assetA.metadata.size - assetB.metadata.size;
            case 'size-desc':
              return assetB.metadata.size - assetA.metadata.size;
            case 'rating-asc':
              return assetA.rating - assetB.rating;
            case 'rating-desc':
              return assetB.rating - assetA.rating;
            case 'usage-asc':
              return assetA.usageCount - assetB.usageCount;
            case 'usage-desc':
              return assetB.usageCount - assetA.usageCount;
            default:
              return 0;
          }
        });
        
        set({ filteredAssets: filteredIds });
      },
      
      // 收藏操作
      toggleFavorite: (id: string) => {
        const state = get();
        
        if (!state.assets[id]) {
          console.warn(`[asset-store] 尝试切换收藏不存在的素材: ${id}`);
          return;
        }
        
        const isFavorite = state.favorites.includes(id);
        
        if (isFavorite) {
          get().removeFromFavorites(id);
        } else {
          get().addToFavorites(id);
        }
      },
      
      addToFavorites: (id: string) => {
        const state = get();
        
        if (!state.assets[id]) {
          console.warn(`[asset-store] 尝试收藏不存在的素材: ${id}`);
          return;
        }
        
        if (!state.favorites.includes(id)) {
          const newFavorites = [...state.favorites, id];
          
          set({ favorites: newFavorites });
          
          // 更新素材的收藏状态
          get().updateAsset(id, { isFavorite: true });
          
          console.debug(`[asset-store] 添加到收藏: ${state.assets[id].name}`);
        }
      },
      
      removeFromFavorites: (id: string) => {
        const state = get();
        
        const newFavorites = state.favorites.filter(favId => favId !== id);
        
        set({ favorites: newFavorites });
        
        // 更新素材的收藏状态
        if (state.assets[id]) {
          get().updateAsset(id, { isFavorite: false });
          console.debug(`[asset-store] 从收藏移除: ${state.assets[id].name}`);
        }
      },
      
      getFavorites: () => {
        const state = get();
        return state.favorites
          .map(id => state.assets[id])
          .filter((asset): asset is Asset => asset !== undefined);
      },
      
      // 最近使用
      markAsRecent: (id: string) => {
        const state = get();
        
        if (!state.assets[id]) {
          return;
        }
        
        const newRecentAssets = [id, ...state.recentAssets.filter(recentId => recentId !== id)]
          .slice(0, state.maxRecentCount);
        
        set({ recentAssets: newRecentAssets });
        
        // 更新素材的最近使用状态和时间
        get().updateAsset(id, { 
          isRecent: true, 
          lastUsed: new Date().toISOString(),
          usageCount: state.assets[id].usageCount + 1,
        });
      },
      
      getRecentAssets: (count = 10) => {
        const state = get();
        return state.recentAssets
          .slice(0, count)
          .map(id => state.assets[id])
          .filter((asset): asset is Asset => asset !== undefined);
      },
      
      clearRecentAssets: () => {
        const state = get();
        
        // 更新所有最近使用素材的状态
        state.recentAssets.forEach(id => {
          if (state.assets[id]) {
            get().updateAsset(id, { isRecent: false });
          }
        });
        
        set({ recentAssets: [] });
        
        console.info('[asset-store] 清除最近使用记录');
      },
      
      // 标签操作
      addTag: (tagData) => {
        const id = `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tag: AssetTag = {
          ...tagData,
          id,
          count: 0,
        };
        
        const state = get();
        const newTags = { ...state.tags, [id]: tag };
        
        set({ tags: newTags });
        
        console.info(`[asset-store] 添加标签: ${tag.name}`, { id });
        
        return id;
      },
      
      updateTag: (id: string, updates: Partial<AssetTag>) => {
        const state = get();
        const tag = state.tags[id];
        
        if (!tag) {
          console.warn(`[asset-store] 尝试更新不存在的标签: ${id}`);
          return;
        }
        
        const updatedTag = { ...tag, ...updates };
        const newTags = { ...state.tags, [id]: updatedTag };
        
        set({ tags: newTags });
        
        console.debug(`[asset-store] 更新标签: ${id}`, { updatedKeys: Object.keys(updates) });
      },
      
      deleteTag: (id: string) => {
        const state = get();
        const tag = state.tags[id];
        
        if (!tag) {
          console.warn(`[asset-store] 尝试删除不存在的标签: ${id}`);
          return;
        }
        
        // 从所有素材中移除该标签
        Object.values(state.assets).forEach(asset => {
          if (asset.tags.includes(id)) {
            const newTags = asset.tags.filter(tagId => tagId !== id);
            get().updateAsset(asset.id, { tags: newTags });
          }
        });
        
        const newTags = { ...state.tags };
        delete newTags[id];
        
        set({ tags: newTags });
        
        console.info(`[asset-store] 删除标签: ${tag.name}`, { id });
      },
      
      addTagToAsset: (assetId: string, tagId: string) => {
        const state = get();
        const asset = state.assets[assetId];
        const tag = state.tags[tagId];
        
        if (!asset || !tag) {
          console.warn('[asset-store] 尝试为不存在的素材或标签添加关联', { assetId, tagId });
          return;
        }
        
        if (!asset.tags.includes(tagId)) {
          const newTags = [...asset.tags, tagId];
          get().updateAsset(assetId, { tags: newTags });
          
          // 更新标签计数
          get().updateTag(tagId, { count: tag.count + 1 });
          
          console.debug(`[asset-store] 为素材添加标签`, { assetName: asset.name, tagName: tag.name });
        }
      },
      
      removeTagFromAsset: (assetId: string, tagId: string) => {
        const state = get();
        const asset = state.assets[assetId];
        const tag = state.tags[tagId];
        
        if (!asset || !tag) {
          return;
        }
        
        if (asset.tags.includes(tagId)) {
          const newTags = asset.tags.filter(id => id !== tagId);
          get().updateAsset(assetId, { tags: newTags });
          
          // 更新标签计数
          get().updateTag(tagId, { count: Math.max(0, tag.count - 1) });
          
          console.debug(`[asset-store] 从素材移除标签`, { assetName: asset.name, tagName: tag.name });
        }
      },
      
      // 上传操作
      uploadAssets: async (files: File[]) => {
        const uploadPromises = files.map(async (file) => {
          const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // 添加到上传队列
          const uploadProgress: UploadProgress = {
            fileId,
            fileName: file.name,
            progress: 0,
            status: 'pending',
          };
          
          const state = get();
          set({
            uploadQueue: [...state.uploadQueue, uploadProgress],
            isUploading: true,
          });
          
          try {
            // 模拟上传过程
            for (let progress = 0; progress <= 100; progress += 10) {
              await new Promise(resolve => setTimeout(resolve, 100));
              
              const currentState = get();
              const updatedQueue = currentState.uploadQueue.map(item =>
                item.fileId === fileId
                  ? { ...item, progress, status: progress < 100 ? 'uploading' as const : 'processing' as const }
                  : item
              );
              
              set({ uploadQueue: updatedQueue });
            }
            
            // 创建素材对象
            const assetId = await get().addAsset({
              name: file.name.replace(/\.[^/.]+$/, ''),
              type: file.type.startsWith('image/') ? 'image' : 'image',
              category: 'images',
              url: URL.createObjectURL(file),
              thumbnailUrl: URL.createObjectURL(file),
              metadata: {
                width: 0, // 实际应用中需要读取图片尺寸
                height: 0,
                size: file.size,
                format: file.name.split('.').pop() as AssetFormat,
                colorMode: 'rgb',
                hasTransparency: file.type === 'image/png',
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                description: `上传的${file.type}文件`,
              },
              tags: [],
              keywords: [file.name],
              isFavorite: false,
              isRecent: true,
              downloadCount: 0,
              rating: 0,
              usageCount: 0,
              projectIds: [],
              source: 'local',
            });
            
            // 更新上传状态为完成
            const currentState = get();
            const updatedQueue = currentState.uploadQueue.map(item =>
              item.fileId === fileId
                ? { ...item, progress: 100, status: 'completed' as const }
                : item
            );
            
            set({ uploadQueue: updatedQueue });
            
            console.info(`[asset-store] 上传完成: ${file.name}`, { assetId });
            
            return assetId;
            
          } catch (error) {
            console.error(`[asset-store] 上传失败: ${file.name}`, error);
            
            const currentState = get();
            const updatedQueue = currentState.uploadQueue.map(item =>
              item.fileId === fileId
                ? { ...item, status: 'error' as const, error: error instanceof Error ? error.message : '上传失败' }
                : item
            );
            
            set({ uploadQueue: updatedQueue });
            
            throw error;
          }
        });
        
        try {
          const assetIds = await Promise.all(uploadPromises);
          
          // 清理完成的上传项
          setTimeout(() => {
            const state = get();
            const remainingQueue = state.uploadQueue.filter(item => 
              item.status !== 'completed' && item.status !== 'error'
            );
            
            set({ 
              uploadQueue: remainingQueue,
              isUploading: remainingQueue.length > 0,
            });
          }, 3000);
          
          return assetIds;
          
        } catch (error) {
          set({ isUploading: false });
          throw error;
        }
      },
      
      cancelUpload: (fileId: string) => {
        const state = get();
        const updatedQueue = state.uploadQueue.filter(item => item.fileId !== fileId);
        
        set({ 
          uploadQueue: updatedQueue,
          isUploading: updatedQueue.length > 0,
        });
        
        console.info(`[asset-store] 取消上传: ${fileId}`);
      },
      
      clearUploadQueue: () => {
        set({ 
          uploadQueue: [],
          isUploading: false,
        });
        
        console.info('[asset-store] 清空上传队列');
      },
      
      // UI操作
      setViewMode: (mode: 'grid' | 'list') => {
        set({ viewMode: mode });
      },
      
      setGridSize: (size: 'small' | 'medium' | 'large') => {
        set({ gridSize: size });
      },
      
      setShowPreview: (show: boolean) => {
        set({ showPreview: show });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      // 缓存操作
      preloadThumbnail: async (assetId: string) => {
        const state = get();
        const asset = state.assets[assetId];
        
        if (!asset || state.thumbnailCache[assetId]) {
          return;
        }
        
        try {
          // 模拟缩略图预加载
          const response = await fetch(asset.thumbnailUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          
          set({
            thumbnailCache: {
              ...state.thumbnailCache,
              [assetId]: url,
            },
          });
          
        } catch (error) {
          console.warn(`[asset-store] 缩略图预加载失败: ${assetId}`, error);
        }
      },
      
      clearThumbnailCache: () => {
        const state = get();
        
        // 释放所有缓存的URL
        Object.values(state.thumbnailCache).forEach(url => {
          URL.revokeObjectURL(url);
        });
        
        set({ thumbnailCache: {} });
        
        console.info('[asset-store] 清除缩略图缓存');
      },
      
      preloadAsset: async (assetId: string) => {
        const state = get();
        
        if (state.preloadedAssets.has(assetId)) {
          return;
        }
        
        const asset = state.assets[assetId];
        if (!asset) {
          return;
        }
        
        try {
          // 预加载素材
          await fetch(asset.url);
          
          const newPreloadedAssets = new Set(state.preloadedAssets);
          newPreloadedAssets.add(assetId);
          
          set({ preloadedAssets: newPreloadedAssets });
          
        } catch (error) {
          console.warn(`[asset-store] 素材预加载失败: ${assetId}`, error);
        }
      },
      
      // 导入导出
      exportAssets: async (assetIds: string[]) => {
        const state = get();
        const assets = assetIds.map(id => state.assets[id]).filter(Boolean);
        
        const exportData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          assets,
          categories: state.categories,
          tags: state.tags,
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assets-export-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.info(`[asset-store] 导出素材`, { count: assets.length });
      },
      
      importAssets: async (data: any) => {
        try {
          const { assets, categories, tags } = data;
          const importedIds: string[] = [];
          
          // 导入素材
          if (assets && Array.isArray(assets)) {
            for (const assetData of assets) {
              const { id, createdAt, updatedAt, ...assetWithoutId } = assetData;
              const newId = await get().addAsset(assetWithoutId);
              importedIds.push(newId);
            }
          }
          
          // 导入分类（合并）
          if (categories) {
            const state = get();
            const mergedCategories = { ...state.categories };
            
            Object.values(categories).forEach((category: any) => {
              if (!mergedCategories[category.id]) {
                mergedCategories[category.id] = category;
              }
            });
            
            set({ categories: mergedCategories });
          }
          
          // 导入标签（合并）
          if (tags) {
            const state = get();
            const mergedTags = { ...state.tags };
            
            Object.values(tags).forEach((tag: any) => {
              if (!mergedTags[tag.id]) {
                mergedTags[tag.id] = tag;
              }
            });
            
            set({ tags: mergedTags });
          }
          
          console.info(`[asset-store] 导入素材完成`, { count: importedIds.length });
          
          return importedIds;
          
        } catch (error) {
          console.error('[asset-store] 导入素材失败:', error);
          throw error;
        }
      },
      
      // 统计和分析
      getAssetStats: () => {
        const state = get();
        const assets = Object.values(state.assets);
        
        const assetsByType = assets.reduce((acc, asset) => {
          acc[asset.type] = (acc[asset.type] || 0) + 1;
          return acc;
        }, {} as Record<AssetType, number>);
        
        const assetsBySource = assets.reduce((acc, asset) => {
          acc[asset.source] = (acc[asset.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const totalSize = assets.reduce((sum, asset) => sum + asset.metadata.size, 0);
        const averageRating = assets.length > 0 
          ? assets.reduce((sum, asset) => sum + asset.rating, 0) / assets.length 
          : 0;
        
        return {
          totalAssets: assets.length,
          assetsByType,
          assetsBySource,
          totalSize,
          averageRating,
        };
      },
      
      // 初始化和重置
      initializeAssets: async () => {
        console.info('[asset-store] 初始化素材系统');
        
        try {
          // 从本地存储加载用户配置
          const savedConfig = localStorage.getItem('asset-config');
          if (savedConfig) {
            const config = JSON.parse(savedConfig);
            
            set({
              viewMode: config.viewMode || 'grid',
              gridSize: config.gridSize || 'medium',
              showPreview: config.showPreview !== false,
              maxRecentCount: config.maxRecentCount || 20,
              favorites: config.favorites || [],
              recentAssets: config.recentAssets || [],
            });
            
            console.info('[asset-store] 加载用户素材配置');
          }
          
          // 加载素材
          await get().loadAssets();
          
        } catch (error) {
          console.error('[asset-store] 素材系统初始化失败:', error);
        }
      },
      
      resetAssetStore: () => {
        console.info('[asset-store] 重置素材存储');
        
        // 清理缓存
        get().clearThumbnailCache();
        
        set({
          assets: {},
          categories: BUILTIN_CATEGORIES.reduce((acc, cat) => {
            acc[cat.id] = { ...cat, assetCount: 0, isExpanded: false };
            return acc;
          }, {} as Record<string, AssetCategory>),
          tags: {},
          selectedAssets: [],
          selectedAsset: null,
          currentCategory: null,
          currentSubcategory: null,
          searchQuery: '',
          activeFilters: DEFAULT_FILTERS,
          sortBy: 'name-asc',
          filteredAssets: [],
          isLoading: false,
          isSearching: false,
          isUploading: false,
          viewMode: 'grid',
          gridSize: 'medium',
          showPreview: true,
          uploadQueue: [],
          favorites: [],
          recentAssets: [],
          thumbnailCache: {},
          preloadedAssets: new Set(),
        });
        
        // 清除本地存储
        localStorage.removeItem('asset-config');
      },
    }),
    {
      name: 'gaf-asset-store',
    }
  )
);