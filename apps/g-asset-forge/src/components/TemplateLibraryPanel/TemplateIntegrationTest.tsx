/**
 * 模板集成测试组件
 * 用于验证模板库功能是否正常工作
 */
import React, { useEffect, useState } from 'react';
import { useTemplateLibrary } from '../../hooks/useTemplateLibrary';

export const TemplateIntegrationTest: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    error,
    templates,
    categories,
    searchTemplates,
    getTemplateStats,
  } = useTemplateLibrary();

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (isInitialized) {
      // 测试基本功能
      const runTests = async () => {
        try {
          // 测试搜索功能
          await searchTemplates({ limit: 5 });

          // 测试统计功能
          const templateStats = await getTemplateStats();
          setStats(templateStats);

          console.log('模板库集成测试通过:', {
            templates: templates.length,
            categories: categories.length,
            stats: templateStats,
          });
        } catch (err) {
          console.error('模板库集成测试失败:', err);
        }
      };

      runTests();
    }
  }, [isInitialized, searchTemplates, getTemplateStats]);

  if (!isInitialized) {
    return <div>正在初始化模板服务...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontSize: '14px' }}>
      <h3>模板库集成状态</h3>
      <div>
        <p>初始化状态: {isInitialized ? '✅ 已初始化' : '❌ 未初始化'}</p>
        <p>加载状态: {isLoading ? '🔄 加载中' : '✅ 已完成'}</p>
        <p>模板数量: {templates.length}</p>
        <p>分类数量: {categories.length}</p>
        {stats && (
          <div>
            <h4>统计信息:</h4>
            <p>总模板数: {stats.totalCount}</p>
            <p>设计模板: {stats.designCount}</p>
            <p>H5模板: {stats.h5Count}</p>
          </div>
        )}
      </div>
    </div>
  );
};
