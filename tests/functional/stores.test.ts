/**
 * 状态管理功能测试
 * @description 测试Zustand状态管理的功能是否正常工作
 * @author 开发团队
 */
import { renderHook, act } from '@testing-library/react';

// 导入要测试的stores
import { useAppStore } from '../../src/renderer/stores/appStore';
import { useToolStore } from '../../src/renderer/stores/toolStore';
import { useAssetStore } from '../../src/renderer/stores/assetStore';
import { useProjectStore } from '../../src/renderer/stores/projectStore';

describe('状态管理功能测试', () => {
  describe('应用状态管理测试', () => {
    test('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useAppStore());
      
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.theme).toBe('light');
      expect(result.current.language).toBe('zh-CN');
    });

    test('应该能够设置初始化状态', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setInitialized(true);
      });
      
      expect(result.current.isInitialized).toBe(true);
    });

    test('应该能够设置加载状态', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
    });

    test('应该能够设置错误信息', () => {
      const { result } = renderHook(() => useAppStore());
      const errorMessage = '测试错误信息';
      
      act(() => {
        result.current.setError(errorMessage);
      });
      
      expect(result.current.error).toBe(errorMessage);
    });

    test('应该能够切换主题', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });

    test('应该能够切换语言', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setLanguage('en-US');
      });
      
      expect(result.current.language).toBe('en-US');
    });

    test('应该能够重置状态', () => {
      const { result } = renderHook(() => useAppStore());
      
      // 先设置一些状态
      act(() => {
        result.current.setInitialized(true);
        result.current.setLoading(true);
        result.current.setError('测试错误');
        result.current.setTheme('dark');
      });
      
      // 然后重置
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.theme).toBe('light');
    });
  });

  describe('工具状态管理测试', () => {
    test('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useToolStore());
      
      expect(result.current.activeTool).toBe('select');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.toolSettings).toEqual({});
    });

    test('应该能够设置活动工具', () => {
      const { result } = renderHook(() => useToolStore());
      
      act(() => {
        result.current.setActiveTool('brush');
      });
      
      expect(result.current.activeTool).toBe('brush');
    });

    test('应该能够设置工具设置', () => {
      const { result } = renderHook(() => useToolStore());
      const settings = { size: 10, color: '#ff0000' };
      
      act(() => {
        result.current.setToolSettings('brush', settings);
      });
      
      expect(result.current.toolSettings.brush).toEqual(settings);
    });

    test('应该能够更新工具设置', () => {
      const { result } = renderHook(() => useToolStore());
      
      // 先设置初始设置
      act(() => {
        result.current.setToolSettings('brush', { size: 10, color: '#ff0000' });
      });
      
      // 然后更新部分设置
      act(() => {
        result.current.updateToolSettings('brush', { size: 20 });
      });
      
      expect(result.current.toolSettings.brush).toEqual({
        size: 20,
        color: '#ff0000',
      });
    });

    test('应该能够设置加载状态', () => {
      const { result } = renderHook(() => useToolStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
    });

    test('应该能够设置错误信息', () => {
      const { result } = renderHook(() => useToolStore());
      const errorMessage = '工具错误';
      
      act(() => {
        result.current.setError(errorMessage);
      });
      
      expect(result.current.error).toBe(errorMessage);
    });

    test('应该能够重置工具状态', () => {
      const { result } = renderHook(() => useToolStore());
      
      // 先设置一些状态
      act(() => {
        result.current.setActiveTool('brush');
        result.current.setToolSettings('brush', { size: 10 });
        result.current.setLoading(true);
        result.current.setError('测试错误');
      });
      
      // 然后重置
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.activeTool).toBe('select');
      expect(result.current.toolSettings).toEqual({});
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('素材状态管理测试', () => {
    test('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useAssetStore());
      
      expect(result.current.assets).toEqual([]);
      expect(result.current.categories).toEqual([]);
      expect(result.current.selectedAssets).toEqual([]);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedCategory).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('应该能够设置素材列表', () => {
      const { result } = renderHook(() => useAssetStore());
      const assets = [
        { id: '1', name: '素材1', type: 'image', url: '/asset1.png' },
        { id: '2', name: '素材2', type: 'image', url: '/asset2.png' },
      ];
      
      act(() => {
        result.current.setAssets(assets);
      });
      
      expect(result.current.assets).toEqual(assets);
    });

    test('应该能够添加素材', () => {
      const { result } = renderHook(() => useAssetStore());
      const asset = { id: '1', name: '新素材', type: 'image', url: '/new-asset.png' };
      
      act(() => {
        result.current.addAsset(asset);
      });
      
      expect(result.current.assets).toContain(asset);
    });

    test('应该能够移除素材', () => {
      const { result } = renderHook(() => useAssetStore());
      const assets = [
        { id: '1', name: '素材1', type: 'image', url: '/asset1.png' },
        { id: '2', name: '素材2', type: 'image', url: '/asset2.png' },
      ];
      
      // 先设置素材列表
      act(() => {
        result.current.setAssets(assets);
      });
      
      // 然后移除一个素材
      act(() => {
        result.current.removeAsset('1');
      });
      
      expect(result.current.assets).toHaveLength(1);
      expect(result.current.assets[0].id).toBe('2');
    });

    test('应该能够设置分类列表', () => {
      const { result } = renderHook(() => useAssetStore());
      const categories = ['背景', '角色', 'UI元素'];
      
      act(() => {
        result.current.setCategories(categories);
      });
      
      expect(result.current.categories).toEqual(categories);
    });

    test('应该能够选择素材', () => {
      const { result } = renderHook(() => useAssetStore());
      
      act(() => {
        result.current.selectAsset('1');
      });
      
      expect(result.current.selectedAssets).toContain('1');
    });

    test('应该能够取消选择素材', () => {
      const { result } = renderHook(() => useAssetStore());
      
      // 先选择素材
      act(() => {
        result.current.selectAsset('1');
        result.current.selectAsset('2');
      });
      
      // 然后取消选择
      act(() => {
        result.current.deselectAsset('1');
      });
      
      expect(result.current.selectedAssets).not.toContain('1');
      expect(result.current.selectedAssets).toContain('2');
    });

    test('应该能够设置搜索查询', () => {
      const { result } = renderHook(() => useAssetStore());
      const query = '测试搜索';
      
      act(() => {
        result.current.setSearchQuery(query);
      });
      
      expect(result.current.searchQuery).toBe(query);
    });

    test('应该能够设置选中的分类', () => {
      const { result } = renderHook(() => useAssetStore());
      const category = '背景';
      
      act(() => {
        result.current.setSelectedCategory(category);
      });
      
      expect(result.current.selectedCategory).toBe(category);
    });
  });

  describe('项目状态管理测试', () => {
    test('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useProjectStore());
      
      expect(result.current.projects).toEqual([]);
      expect(result.current.currentProject).toBeNull();
      expect(result.current.recentProjects).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('应该能够设置项目列表', () => {
      const { result } = renderHook(() => useProjectStore());
      const projects = [
        { id: '1', name: '项目1', description: '描述1' },
        { id: '2', name: '项目2', description: '描述2' },
      ];
      
      act(() => {
        result.current.setProjects(projects);
      });
      
      expect(result.current.projects).toEqual(projects);
    });

    test('应该能够设置当前项目', () => {
      const { result } = renderHook(() => useProjectStore());
      const project = { id: '1', name: '当前项目', description: '当前项目描述' };
      
      act(() => {
        result.current.setCurrentProject(project);
      });
      
      expect(result.current.currentProject).toEqual(project);
    });

    test('应该能够添加项目', () => {
      const { result } = renderHook(() => useProjectStore());
      const project = { id: '1', name: '新项目', description: '新项目描述' };
      
      act(() => {
        result.current.addProject(project);
      });
      
      expect(result.current.projects).toContain(project);
    });

    test('应该能够更新项目', () => {
      const { result } = renderHook(() => useProjectStore());
      const project = { id: '1', name: '原项目', description: '原描述' };
      
      // 先添加项目
      act(() => {
        result.current.addProject(project);
      });
      
      // 然后更新项目
      const updatedProject = { id: '1', name: '更新项目', description: '更新描述' };
      act(() => {
        result.current.updateProject('1', updatedProject);
      });
      
      expect(result.current.projects[0]).toEqual(updatedProject);
    });

    test('应该能够移除项目', () => {
      const { result } = renderHook(() => useProjectStore());
      const projects = [
        { id: '1', name: '项目1', description: '描述1' },
        { id: '2', name: '项目2', description: '描述2' },
      ];
      
      // 先设置项目列表
      act(() => {
        result.current.setProjects(projects);
      });
      
      // 然后移除一个项目
      act(() => {
        result.current.removeProject('1');
      });
      
      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].id).toBe('2');
    });

    test('应该能够设置最近项目', () => {
      const { result } = renderHook(() => useProjectStore());
      const recentProjects = [
        { id: '1', name: '最近项目1', description: '描述1' },
        { id: '2', name: '最近项目2', description: '描述2' },
      ];
      
      act(() => {
        result.current.setRecentProjects(recentProjects);
      });
      
      expect(result.current.recentProjects).toEqual(recentProjects);
    });

    test('应该能够添加到最近项目', () => {
      const { result } = renderHook(() => useProjectStore());
      const project = { id: '1', name: '项目', description: '描述' };
      
      act(() => {
        result.current.addToRecentProjects(project);
      });
      
      expect(result.current.recentProjects).toContain(project);
    });
  });

  describe('状态管理集成测试', () => {
    test('多个store应该能够独立工作', () => {
      const appStore = renderHook(() => useAppStore());
      const toolStore = renderHook(() => useToolStore());
      const assetStore = renderHook(() => useAssetStore());
      const projectStore = renderHook(() => useProjectStore());
      
      // 同时更新多个store的状态
      act(() => {
        appStore.result.current.setTheme('dark');
        toolStore.result.current.setActiveTool('brush');
        assetStore.result.current.setSearchQuery('测试');
        projectStore.result.current.setCurrentProject({ id: '1', name: '测试项目' });
      });
      
      // 验证各个store的状态都正确更新
      expect(appStore.result.current.theme).toBe('dark');
      expect(toolStore.result.current.activeTool).toBe('brush');
      expect(assetStore.result.current.searchQuery).toBe('测试');
      expect(projectStore.result.current.currentProject?.name).toBe('测试项目');
    });

    test('store状态应该持久化', () => {
      // 这个测试需要根据实际的持久化实现来编写
      // 目前只是一个占位符测试
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });
  });
});