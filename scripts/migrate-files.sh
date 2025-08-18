#!/bin/bash
# G-Asset Forge 文件迁移脚本
# 自动生成于 2025-08-15T07:09:43.438Z

echo "🔄 开始文件迁移..."


# 业务组件迁移到UI业务层
echo "📂 迁移: src/renderer/components/ -> src/renderer/ui/components/business/"
mkdir -p "src/renderer/ui/components/business/"

# 迁移: App\AppContainer.tsx
if [ -f "src\renderer\components\App\AppContainer.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\App\AppContainer.tsx")"
  cp "src\renderer\components\App\AppContainer.tsx" "src\renderer\ui\components\business\App\AppContainer.tsx"
  echo "  ✅ App\AppContainer.tsx"
fi

# 迁移: AssetLibrary\AdvancedSearchPanel.tsx
if [ -f "src\renderer\components\AssetLibrary\AdvancedSearchPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AdvancedSearchPanel.tsx")"
  cp "src\renderer\components\AssetLibrary\AdvancedSearchPanel.tsx" "src\renderer\ui\components\business\AssetLibrary\AdvancedSearchPanel.tsx"
  echo "  ✅ AssetLibrary\AdvancedSearchPanel.tsx"
fi

# 迁移: AssetLibrary\AssetBatchManager.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetBatchManager.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetBatchManager.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetBatchManager.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetBatchManager.tsx"
  echo "  ✅ AssetLibrary\AssetBatchManager.tsx"
fi

# 迁移: AssetLibrary\AssetFavoriteManager.styles.ts
if [ -f "src\renderer\components\AssetLibrary\AssetFavoriteManager.styles.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetFavoriteManager.styles.ts")"
  cp "src\renderer\components\AssetLibrary\AssetFavoriteManager.styles.ts" "src\renderer\ui\components\business\AssetLibrary\AssetFavoriteManager.styles.ts"
  echo "  ✅ AssetLibrary\AssetFavoriteManager.styles.ts"
fi

# 迁移: AssetLibrary\AssetFavoriteManager.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetFavoriteManager.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetFavoriteManager.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetFavoriteManager.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetFavoriteManager.tsx"
  echo "  ✅ AssetLibrary\AssetFavoriteManager.tsx"
fi

# 迁移: AssetLibrary\AssetFilterPanel.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetFilterPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetFilterPanel.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetFilterPanel.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetFilterPanel.tsx"
  echo "  ✅ AssetLibrary\AssetFilterPanel.tsx"
fi

# 迁移: AssetLibrary\AssetLibraryPanel.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetLibraryPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetLibraryPanel.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetLibraryPanel.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetLibraryPanel.tsx"
  echo "  ✅ AssetLibrary\AssetLibraryPanel.tsx"
fi

# 迁移: AssetLibrary\AssetLibraryTest.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetLibraryTest.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetLibraryTest.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetLibraryTest.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetLibraryTest.tsx"
  echo "  ✅ AssetLibrary\AssetLibraryTest.tsx"
fi

# 迁移: AssetLibrary\AssetSearchBar.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetSearchBar.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetSearchBar.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetSearchBar.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetSearchBar.tsx"
  echo "  ✅ AssetLibrary\AssetSearchBar.tsx"
fi

# 迁移: AssetLibrary\AssetSearchResults.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetSearchResults.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetSearchResults.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetSearchResults.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetSearchResults.tsx"
  echo "  ✅ AssetLibrary\AssetSearchResults.tsx"
fi

# 迁移: AssetLibrary\AssetSearchTest.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetSearchTest.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetSearchTest.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetSearchTest.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetSearchTest.tsx"
  echo "  ✅ AssetLibrary\AssetSearchTest.tsx"
fi

# 迁移: AssetLibrary\AssetUploadPanel.tsx
if [ -f "src\renderer\components\AssetLibrary\AssetUploadPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\AssetUploadPanel.tsx")"
  cp "src\renderer\components\AssetLibrary\AssetUploadPanel.tsx" "src\renderer\ui\components\business\AssetLibrary\AssetUploadPanel.tsx"
  echo "  ✅ AssetLibrary\AssetUploadPanel.tsx"
fi

# 迁移: AssetLibrary\SearchPerformanceMonitor.tsx
if [ -f "src\renderer\components\AssetLibrary\SearchPerformanceMonitor.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\AssetLibrary\SearchPerformanceMonitor.tsx")"
  cp "src\renderer\components\AssetLibrary\SearchPerformanceMonitor.tsx" "src\renderer\ui\components\business\AssetLibrary\SearchPerformanceMonitor.tsx"
  echo "  ✅ AssetLibrary\SearchPerformanceMonitor.tsx"
fi

# 迁移: Assets\AssetsPanel.tsx
if [ -f "src\renderer\components\Assets\AssetsPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Assets\AssetsPanel.tsx")"
  cp "src\renderer\components\Assets\AssetsPanel.tsx" "src\renderer\ui\components\business\Assets\AssetsPanel.tsx"
  echo "  ✅ Assets\AssetsPanel.tsx"
fi

# 迁移: Canvas\CanvasInitializationChecker.tsx
if [ -f "src\renderer\components\Canvas\CanvasInitializationChecker.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Canvas\CanvasInitializationChecker.tsx")"
  cp "src\renderer\components\Canvas\CanvasInitializationChecker.tsx" "src\renderer\ui\components\business\Canvas\CanvasInitializationChecker.tsx"
  echo "  ✅ Canvas\CanvasInitializationChecker.tsx"
fi

# 迁移: Canvas\CanvasMinimap.tsx
if [ -f "src\renderer\components\Canvas\CanvasMinimap.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Canvas\CanvasMinimap.tsx")"
  cp "src\renderer\components\Canvas\CanvasMinimap.tsx" "src\renderer\ui\components\business\Canvas\CanvasMinimap.tsx"
  echo "  ✅ Canvas\CanvasMinimap.tsx"
fi

# 迁移: Canvas\CanvasPerformanceOverlay.tsx
if [ -f "src\renderer\components\Canvas\CanvasPerformanceOverlay.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Canvas\CanvasPerformanceOverlay.tsx")"
  cp "src\renderer\components\Canvas\CanvasPerformanceOverlay.tsx" "src\renderer\ui\components\business\Canvas\CanvasPerformanceOverlay.tsx"
  echo "  ✅ Canvas\CanvasPerformanceOverlay.tsx"
fi

# 迁移: Canvas\CanvasToolbar.tsx
if [ -f "src\renderer\components\Canvas\CanvasToolbar.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Canvas\CanvasToolbar.tsx")"
  cp "src\renderer\components\Canvas\CanvasToolbar.tsx" "src\renderer\ui\components\business\Canvas\CanvasToolbar.tsx"
  echo "  ✅ Canvas\CanvasToolbar.tsx"
fi

# 迁移: Canvas\CanvasWorkspace.tsx
if [ -f "src\renderer\components\Canvas\CanvasWorkspace.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Canvas\CanvasWorkspace.tsx")"
  cp "src\renderer\components\Canvas\CanvasWorkspace.tsx" "src\renderer\ui\components\business\Canvas\CanvasWorkspace.tsx"
  echo "  ✅ Canvas\CanvasWorkspace.tsx"
fi

# 迁移: Canvas\FloatingToolbar.tsx
if [ -f "src\renderer\components\Canvas\FloatingToolbar.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Canvas\FloatingToolbar.tsx")"
  cp "src\renderer\components\Canvas\FloatingToolbar.tsx" "src\renderer\ui\components\business\Canvas\FloatingToolbar.tsx"
  echo "  ✅ Canvas\FloatingToolbar.tsx"
fi

# 迁移: Canvas\InfiniteCanvasGuide.tsx
if [ -f "src\renderer\components\Canvas\InfiniteCanvasGuide.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Canvas\InfiniteCanvasGuide.tsx")"
  cp "src\renderer\components\Canvas\InfiniteCanvasGuide.tsx" "src\renderer\ui\components\business\Canvas\InfiniteCanvasGuide.tsx"
  echo "  ✅ Canvas\InfiniteCanvasGuide.tsx"
fi

# 迁移: common\RulerGuides.tsx
if [ -f "src\renderer\components\common\RulerGuides.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\common\RulerGuides.tsx")"
  cp "src\renderer\components\common\RulerGuides.tsx" "src\renderer\ui\components\business\common\RulerGuides.tsx"
  echo "  ✅ common\RulerGuides.tsx"
fi

# 迁移: common\ZoomPanContainer.tsx
if [ -f "src\renderer\components\common\ZoomPanContainer.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\common\ZoomPanContainer.tsx")"
  cp "src\renderer\components\common\ZoomPanContainer.tsx" "src\renderer\ui\components\business\common\ZoomPanContainer.tsx"
  echo "  ✅ common\ZoomPanContainer.tsx"
fi

# 迁移: common\ZoomPanContext.tsx
if [ -f "src\renderer\components\common\ZoomPanContext.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\common\ZoomPanContext.tsx")"
  cp "src\renderer\components\common\ZoomPanContext.tsx" "src\renderer\ui\components\business\common\ZoomPanContext.tsx"
  echo "  ✅ common\ZoomPanContext.tsx"
fi

# 迁移: Debug\DebugPanel.tsx
if [ -f "src\renderer\components\Debug\DebugPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Debug\DebugPanel.tsx")"
  cp "src\renderer\components\Debug\DebugPanel.tsx" "src\renderer\ui\components\business\Debug\DebugPanel.tsx"
  echo "  ✅ Debug\DebugPanel.tsx"
fi

# 迁移: Enhanced\EnhancedButton.tsx
if [ -f "src\renderer\components\Enhanced\EnhancedButton.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Enhanced\EnhancedButton.tsx")"
  cp "src\renderer\components\Enhanced\EnhancedButton.tsx" "src\renderer\ui\components\business\Enhanced\EnhancedButton.tsx"
  echo "  ✅ Enhanced\EnhancedButton.tsx"
fi

# 迁移: Enhanced\EnhancedIconButton.tsx
if [ -f "src\renderer\components\Enhanced\EnhancedIconButton.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Enhanced\EnhancedIconButton.tsx")"
  cp "src\renderer\components\Enhanced\EnhancedIconButton.tsx" "src\renderer\ui\components\business\Enhanced\EnhancedIconButton.tsx"
  echo "  ✅ Enhanced\EnhancedIconButton.tsx"
fi

# 迁移: Enhanced\index.ts
if [ -f "src\renderer\components\Enhanced\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Enhanced\index.ts")"
  cp "src\renderer\components\Enhanced\index.ts" "src\renderer\ui\components\business\Enhanced\index.ts"
  echo "  ✅ Enhanced\index.ts"
fi

# 迁移: ErrorBoundary\EnhancedErrorBoundary.tsx
if [ -f "src\renderer\components\ErrorBoundary\EnhancedErrorBoundary.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\ErrorBoundary\EnhancedErrorBoundary.tsx")"
  cp "src\renderer\components\ErrorBoundary\EnhancedErrorBoundary.tsx" "src\renderer\ui\components\business\ErrorBoundary\EnhancedErrorBoundary.tsx"
  echo "  ✅ ErrorBoundary\EnhancedErrorBoundary.tsx"
fi

# 迁移: ErrorBoundary\index.ts
if [ -f "src\renderer\components\ErrorBoundary\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\ErrorBoundary\index.ts")"
  cp "src\renderer\components\ErrorBoundary\index.ts" "src\renderer\ui\components\business\ErrorBoundary\index.ts"
  echo "  ✅ ErrorBoundary\index.ts"
fi

# 迁移: Layout\FigmaLayersPanel.tsx
if [ -f "src\renderer\components\Layout\FigmaLayersPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\FigmaLayersPanel.tsx")"
  cp "src\renderer\components\Layout\FigmaLayersPanel.tsx" "src\renderer\ui\components\business\Layout\FigmaLayersPanel.tsx"
  echo "  ✅ Layout\FigmaLayersPanel.tsx"
fi

# 迁移: Layout\FigmaLayoutCustomizer.tsx
if [ -f "src\renderer\components\Layout\FigmaLayoutCustomizer.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\FigmaLayoutCustomizer.tsx")"
  cp "src\renderer\components\Layout\FigmaLayoutCustomizer.tsx" "src\renderer\ui\components\business\Layout\FigmaLayoutCustomizer.tsx"
  echo "  ✅ Layout\FigmaLayoutCustomizer.tsx"
fi

# 迁移: Layout\FigmaToolbar.tsx
if [ -f "src\renderer\components\Layout\FigmaToolbar.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\FigmaToolbar.tsx")"
  cp "src\renderer\components\Layout\FigmaToolbar.tsx" "src\renderer\ui\components\business\Layout\FigmaToolbar.tsx"
  echo "  ✅ Layout\FigmaToolbar.tsx"
fi

# 迁移: Layout\index.ts
if [ -f "src\renderer\components\Layout\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\index.ts")"
  cp "src\renderer\components\Layout\index.ts" "src\renderer\ui\components\business\Layout\index.ts"
  echo "  ✅ Layout\index.ts"
fi

# 迁移: Layout\LayoutConfigManager.tsx
if [ -f "src\renderer\components\Layout\LayoutConfigManager.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\LayoutConfigManager.tsx")"
  cp "src\renderer\components\Layout\LayoutConfigManager.tsx" "src\renderer\ui\components\business\Layout\LayoutConfigManager.tsx"
  echo "  ✅ Layout\LayoutConfigManager.tsx"
fi

# 迁移: Layout\LayoutPreview.tsx
if [ -f "src\renderer\components\Layout\LayoutPreview.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\LayoutPreview.tsx")"
  cp "src\renderer\components\Layout\LayoutPreview.tsx" "src\renderer\ui\components\business\Layout\LayoutPreview.tsx"
  echo "  ✅ Layout\LayoutPreview.tsx"
fi

# 迁移: Layout\MainLayout.tsx
if [ -f "src\renderer\components\Layout\MainLayout.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\MainLayout.tsx")"
  cp "src\renderer\components\Layout\MainLayout.tsx" "src\renderer\ui\components\business\Layout\MainLayout.tsx"
  echo "  ✅ Layout\MainLayout.tsx"
fi

# 迁移: Layout\StatusBar.tsx
if [ -f "src\renderer\components\Layout\StatusBar.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\StatusBar.tsx")"
  cp "src\renderer\components\Layout\StatusBar.tsx" "src\renderer\ui\components\business\Layout\StatusBar.tsx"
  echo "  ✅ Layout\StatusBar.tsx"
fi

# 迁移: Layout\TopToolbar.tsx
if [ -f "src\renderer\components\Layout\TopToolbar.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\TopToolbar.tsx")"
  cp "src\renderer\components\Layout\TopToolbar.tsx" "src\renderer\ui\components\business\Layout\TopToolbar.tsx"
  echo "  ✅ Layout\TopToolbar.tsx"
fi

# 迁移: Layout\WindowControls.tsx
if [ -f "src\renderer\components\Layout\WindowControls.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Layout\WindowControls.tsx")"
  cp "src\renderer\components\Layout\WindowControls.tsx" "src\renderer\ui\components\business\Layout\WindowControls.tsx"
  echo "  ✅ Layout\WindowControls.tsx"
fi

# 迁移: performance\FileOperationMonitor.tsx
if [ -f "src\renderer\components\performance\FileOperationMonitor.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\performance\FileOperationMonitor.tsx")"
  cp "src\renderer\components\performance\FileOperationMonitor.tsx" "src\renderer\ui\components\business\performance\FileOperationMonitor.tsx"
  echo "  ✅ performance\FileOperationMonitor.tsx"
fi

# 迁移: performance\index.ts
if [ -f "src\renderer\components\performance\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\performance\index.ts")"
  cp "src\renderer\components\performance\index.ts" "src\renderer\ui\components\business\performance\index.ts"
  echo "  ✅ performance\index.ts"
fi

# 迁移: performance\NetworkDriveStatus.tsx
if [ -f "src\renderer\components\performance\NetworkDriveStatus.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\performance\NetworkDriveStatus.tsx")"
  cp "src\renderer\components\performance\NetworkDriveStatus.tsx" "src\renderer\ui\components\business\performance\NetworkDriveStatus.tsx"
  echo "  ✅ performance\NetworkDriveStatus.tsx"
fi

# 迁移: performance\PerformancePanel.tsx
if [ -f "src\renderer\components\performance\PerformancePanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\performance\PerformancePanel.tsx")"
  cp "src\renderer\components\performance\PerformancePanel.tsx" "src\renderer\ui\components\business\performance\PerformancePanel.tsx"
  echo "  ✅ performance\PerformancePanel.tsx"
fi

# 迁移: Project\ProjectManager.tsx
if [ -f "src\renderer\components\Project\ProjectManager.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Project\ProjectManager.tsx")"
  cp "src\renderer\components\Project\ProjectManager.tsx" "src\renderer\ui\components\business\Project\ProjectManager.tsx"
  echo "  ✅ Project\ProjectManager.tsx"
fi

# 迁移: ProjectLibrary\ProjectLibraryPanel.tsx
if [ -f "src\renderer\components\ProjectLibrary\ProjectLibraryPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\ProjectLibrary\ProjectLibraryPanel.tsx")"
  cp "src\renderer\components\ProjectLibrary\ProjectLibraryPanel.tsx" "src\renderer\ui\components\business\ProjectLibrary\ProjectLibraryPanel.tsx"
  echo "  ✅ ProjectLibrary\ProjectLibraryPanel.tsx"
fi

# 迁移: Properties\FigmaPropertiesPanel.tsx
if [ -f "src\renderer\components\Properties\FigmaPropertiesPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Properties\FigmaPropertiesPanel.tsx")"
  cp "src\renderer\components\Properties\FigmaPropertiesPanel.tsx" "src\renderer\ui\components\business\Properties\FigmaPropertiesPanel.tsx"
  echo "  ✅ Properties\FigmaPropertiesPanel.tsx"
fi

# 迁移: Properties\index.ts
if [ -f "src\renderer\components\Properties\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Properties\index.ts")"
  cp "src\renderer\components\Properties\index.ts" "src\renderer\ui\components\business\Properties\index.ts"
  echo "  ✅ Properties\index.ts"
fi

# 迁移: Settings\index.ts
if [ -f "src\renderer\components\Settings\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Settings\index.ts")"
  cp "src\renderer\components\Settings\index.ts" "src\renderer\ui\components\business\Settings\index.ts"
  echo "  ✅ Settings\index.ts"
fi

# 迁移: Settings\SettingsModal.tsx
if [ -f "src\renderer\components\Settings\SettingsModal.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Settings\SettingsModal.tsx")"
  cp "src\renderer\components\Settings\SettingsModal.tsx" "src\renderer\ui\components\business\Settings\SettingsModal.tsx"
  echo "  ✅ Settings\SettingsModal.tsx"
fi

# 迁移: Storage\BackupManager.styles.ts
if [ -f "src\renderer\components\Storage\BackupManager.styles.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Storage\BackupManager.styles.ts")"
  cp "src\renderer\components\Storage\BackupManager.styles.ts" "src\renderer\ui\components\business\Storage\BackupManager.styles.ts"
  echo "  ✅ Storage\BackupManager.styles.ts"
fi

# 迁移: Storage\BackupManager.tsx
if [ -f "src\renderer\components\Storage\BackupManager.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Storage\BackupManager.tsx")"
  cp "src\renderer\components\Storage\BackupManager.tsx" "src\renderer\ui\components\business\Storage\BackupManager.tsx"
  echo "  ✅ Storage\BackupManager.tsx"
fi

# 迁移: Storage\NetworkDriveManager.tsx
if [ -f "src\renderer\components\Storage\NetworkDriveManager.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Storage\NetworkDriveManager.tsx")"
  cp "src\renderer\components\Storage\NetworkDriveManager.tsx" "src\renderer\ui\components\business\Storage\NetworkDriveManager.tsx"
  echo "  ✅ Storage\NetworkDriveManager.tsx"
fi

# 迁移: TemplateLibrary\TemplateLibraryPanel.tsx
if [ -f "src\renderer\components\TemplateLibrary\TemplateLibraryPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\TemplateLibrary\TemplateLibraryPanel.tsx")"
  cp "src\renderer\components\TemplateLibrary\TemplateLibraryPanel.tsx" "src\renderer\ui\components\business\TemplateLibrary\TemplateLibraryPanel.tsx"
  echo "  ✅ TemplateLibrary\TemplateLibraryPanel.tsx"
fi

# 迁移: UIIntegration\index.ts
if [ -f "src\renderer\components\UIIntegration\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\UIIntegration\index.ts")"
  cp "src\renderer\components\UIIntegration\index.ts" "src\renderer\ui\components\business\UIIntegration\index.ts"
  echo "  ✅ UIIntegration\index.ts"
fi

# 迁移: UIIntegration\UIEnhancementErrorBoundary.tsx
if [ -f "src\renderer\components\UIIntegration\UIEnhancementErrorBoundary.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\UIIntegration\UIEnhancementErrorBoundary.tsx")"
  cp "src\renderer\components\UIIntegration\UIEnhancementErrorBoundary.tsx" "src\renderer\ui\components\business\UIIntegration\UIEnhancementErrorBoundary.tsx"
  echo "  ✅ UIIntegration\UIEnhancementErrorBoundary.tsx"
fi

# 迁移: UIIntegration\UIIntegrationProvider.tsx
if [ -f "src\renderer\components\UIIntegration\UIIntegrationProvider.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\UIIntegration\UIIntegrationProvider.tsx")"
  cp "src\renderer\components\UIIntegration\UIIntegrationProvider.tsx" "src\renderer\ui\components\business\UIIntegration\UIIntegrationProvider.tsx"
  echo "  ✅ UIIntegration\UIIntegrationProvider.tsx"
fi

# 迁移: Welcome\WelcomeScreen.tsx
if [ -f "src\renderer\components\Welcome\WelcomeScreen.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\ui\components\business\Welcome\WelcomeScreen.tsx")"
  cp "src\renderer\components\Welcome\WelcomeScreen.tsx" "src\renderer\ui\components\business\Welcome\WelcomeScreen.tsx"
  echo "  ✅ Welcome\WelcomeScreen.tsx"
fi


# 工具类迁移到逻辑层管理器
echo "📂 迁移: src/renderer/tools/ -> src/renderer/logic/managers/tools/"
mkdir -p "src/renderer/logic/managers/tools/"

# 迁移: BrushTool.ts
if [ -f "src\renderer\tools\BrushTool.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\tools\BrushTool.ts")"
  cp "src\renderer\tools\BrushTool.ts" "src\renderer\logic\managers\tools\BrushTool.ts"
  echo "  ✅ BrushTool.ts"
fi

# 迁移: CropTool.ts
if [ -f "src\renderer\tools\CropTool.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\tools\CropTool.ts")"
  cp "src\renderer\tools\CropTool.ts" "src\renderer\logic\managers\tools\CropTool.ts"
  echo "  ✅ CropTool.ts"
fi

# 迁移: toolConfig.ts
if [ -f "src\renderer\tools\toolConfig.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\tools\toolConfig.ts")"
  cp "src\renderer\tools\toolConfig.ts" "src\renderer\logic\managers\tools\toolConfig.ts"
  echo "  ✅ toolConfig.ts"
fi

# 迁移: ToolManager.ts
if [ -f "src\renderer\tools\ToolManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\tools\ToolManager.ts")"
  cp "src\renderer\tools\ToolManager.ts" "src\renderer\logic\managers\tools\ToolManager.ts"
  echo "  ✅ ToolManager.ts"
fi


# 管理器迁移到逻辑层
echo "📂 迁移: src/renderer/managers/ -> src/renderer/logic/managers/"
mkdir -p "src/renderer/logic/managers/"

# 迁移: assets\AssetLibraryManager.ts
if [ -f "src\renderer\managers\assets\AssetLibraryManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\AssetLibraryManager.ts")"
  cp "src\renderer\managers\assets\AssetLibraryManager.ts" "src\renderer\logic\managers\assets\AssetLibraryManager.ts"
  echo "  ✅ assets\AssetLibraryManager.ts"
fi

# 迁移: assets\AssetSearchEngine.ts
if [ -f "src\renderer\managers\assets\AssetSearchEngine.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\AssetSearchEngine.ts")"
  cp "src\renderer\managers\assets\AssetSearchEngine.ts" "src\renderer\logic\managers\assets\AssetSearchEngine.ts"
  echo "  ✅ assets\AssetSearchEngine.ts"
fi

# 迁移: assets\AssetStorageManager.ts
if [ -f "src\renderer\managers\assets\AssetStorageManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\AssetStorageManager.ts")"
  cp "src\renderer\managers\assets\AssetStorageManager.ts" "src\renderer\logic\managers\assets\AssetStorageManager.ts"
  echo "  ✅ assets\AssetStorageManager.ts"
fi

# 迁移: assets\FavoriteCollectionManager.ts
if [ -f "src\renderer\managers\assets\FavoriteCollectionManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\FavoriteCollectionManager.ts")"
  cp "src\renderer\managers\assets\FavoriteCollectionManager.ts" "src\renderer\logic\managers\assets\FavoriteCollectionManager.ts"
  echo "  ✅ assets\FavoriteCollectionManager.ts"
fi

# 迁移: assets\ThumbnailGenerator.ts
if [ -f "src\renderer\managers\assets\ThumbnailGenerator.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\ThumbnailGenerator.ts")"
  cp "src\renderer\managers\assets\ThumbnailGenerator.ts" "src\renderer\logic\managers\assets\ThumbnailGenerator.ts"
  echo "  ✅ assets\ThumbnailGenerator.ts"
fi

# 迁移: project\ProjectManager.ts
if [ -f "src\renderer\managers\project\ProjectManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\project\ProjectManager.ts")"
  cp "src\renderer\managers\project\ProjectManager.ts" "src\renderer\logic\managers\project\ProjectManager.ts"
  echo "  ✅ project\ProjectManager.ts"
fi

# 迁移: storage\BackupManager.ts
if [ -f "src\renderer\managers\storage\BackupManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\storage\BackupManager.ts")"
  cp "src\renderer\managers\storage\BackupManager.ts" "src\renderer\logic\managers\storage\BackupManager.ts"
  echo "  ✅ storage\BackupManager.ts"
fi

# 迁移: storage\NetworkDriveManager.ts
if [ -f "src\renderer\managers\storage\NetworkDriveManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\storage\NetworkDriveManager.ts")"
  cp "src\renderer\managers\storage\NetworkDriveManager.ts" "src\renderer\logic\managers\storage\NetworkDriveManager.ts"
  echo "  ✅ storage\NetworkDriveManager.ts"
fi


# 引擎适配器整合
echo "📂 迁移: src/renderer/engines/ -> src/renderer/logic/engines/"
mkdir -p "src/renderer/logic/engines/"

# 迁移: CanvasEngine.ts
if [ -f "src\renderer\engines\CanvasEngine.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\CanvasEngine.ts")"
  cp "src\renderer\engines\CanvasEngine.ts" "src\renderer\logic\engines\CanvasEngine.ts"
  echo "  ✅ CanvasEngine.ts"
fi

# 迁移: CanvasHealthChecker.ts
if [ -f "src\renderer\engines\CanvasHealthChecker.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\CanvasHealthChecker.ts")"
  cp "src\renderer\engines\CanvasHealthChecker.ts" "src\renderer\logic\engines\CanvasHealthChecker.ts"
  echo "  ✅ CanvasHealthChecker.ts"
fi

# 迁移: CanvasInitializationChecker.ts
if [ -f "src\renderer\engines\CanvasInitializationChecker.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\CanvasInitializationChecker.ts")"
  cp "src\renderer\engines\CanvasInitializationChecker.ts" "src\renderer\logic\engines\CanvasInitializationChecker.ts"
  echo "  ✅ CanvasInitializationChecker.ts"
fi

# 迁移: CanvasInitializer.ts
if [ -f "src\renderer\engines\CanvasInitializer.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\CanvasInitializer.ts")"
  cp "src\renderer\engines\CanvasInitializer.ts" "src\renderer\logic\engines\CanvasInitializer.ts"
  echo "  ✅ CanvasInitializer.ts"
fi

# 迁移: CanvasSystemValidator.ts
if [ -f "src\renderer\engines\CanvasSystemValidator.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\CanvasSystemValidator.ts")"
  cp "src\renderer\engines\CanvasSystemValidator.ts" "src\renderer\logic\engines\CanvasSystemValidator.ts"
  echo "  ✅ CanvasSystemValidator.ts"
fi

# 迁移: h5-editor\adapter\react-adapter.tsx
if [ -f "src\renderer\engines\h5-editor\adapter\react-adapter.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\adapter\react-adapter.tsx")"
  cp "src\renderer\engines\h5-editor\adapter\react-adapter.tsx" "src\renderer\logic\engines\h5-editor\adapter\react-adapter.tsx"
  echo "  ✅ h5-editor\adapter\react-adapter.tsx"
fi

# 迁移: h5-editor\adapter\vue-to-react-adapter.ts
if [ -f "src\renderer\engines\h5-editor\adapter\vue-to-react-adapter.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\adapter\vue-to-react-adapter.ts")"
  cp "src\renderer\engines\h5-editor\adapter\vue-to-react-adapter.ts" "src\renderer\logic\engines\h5-editor\adapter\vue-to-react-adapter.ts"
  echo "  ✅ h5-editor\adapter\vue-to-react-adapter.ts"
fi

# 迁移: h5-editor\background\BackgroundManager.ts
if [ -f "src\renderer\engines\h5-editor\background\BackgroundManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\background\BackgroundManager.ts")"
  cp "src\renderer\engines\h5-editor\background\BackgroundManager.ts" "src\renderer\logic\engines\h5-editor\background\BackgroundManager.ts"
  echo "  ✅ h5-editor\background\BackgroundManager.ts"
fi

# 迁移: h5-editor\components\BackgroundSettingsPanel.tsx
if [ -f "src\renderer\engines\h5-editor\components\BackgroundSettingsPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\components\BackgroundSettingsPanel.tsx")"
  cp "src\renderer\engines\h5-editor\components\BackgroundSettingsPanel.tsx" "src\renderer\logic\engines\h5-editor\components\BackgroundSettingsPanel.tsx"
  echo "  ✅ h5-editor\components\BackgroundSettingsPanel.tsx"
fi

# 迁移: h5-editor\components\ExportPreviewPanel.tsx
if [ -f "src\renderer\engines\h5-editor\components\ExportPreviewPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\components\ExportPreviewPanel.tsx")"
  cp "src\renderer\engines\h5-editor\components\ExportPreviewPanel.tsx" "src\renderer\logic\engines\h5-editor\components\ExportPreviewPanel.tsx"
  echo "  ✅ h5-editor\components\ExportPreviewPanel.tsx"
fi

# 迁移: h5-editor\components\ExportProgressPanel.tsx
if [ -f "src\renderer\engines\h5-editor\components\ExportProgressPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\components\ExportProgressPanel.tsx")"
  cp "src\renderer\engines\h5-editor\components\ExportProgressPanel.tsx" "src\renderer\logic\engines\h5-editor\components\ExportProgressPanel.tsx"
  echo "  ✅ h5-editor\components\ExportProgressPanel.tsx"
fi

# 迁移: h5-editor\components\H5EditorModePanel.tsx
if [ -f "src\renderer\engines\h5-editor\components\H5EditorModePanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\components\H5EditorModePanel.tsx")"
  cp "src\renderer\engines\h5-editor\components\H5EditorModePanel.tsx" "src\renderer\logic\engines\h5-editor\components\H5EditorModePanel.tsx"
  echo "  ✅ h5-editor\components\H5EditorModePanel.tsx"
fi

# 迁移: h5-editor\components\H5LayersPanel.tsx
if [ -f "src\renderer\engines\h5-editor\components\H5LayersPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\components\H5LayersPanel.tsx")"
  cp "src\renderer\engines\h5-editor\components\H5LayersPanel.tsx" "src\renderer\logic\engines\h5-editor\components\H5LayersPanel.tsx"
  echo "  ✅ h5-editor\components\H5LayersPanel.tsx"
fi

# 迁移: h5-editor\components\H5PropertiesPanel.tsx
if [ -f "src\renderer\engines\h5-editor\components\H5PropertiesPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\components\H5PropertiesPanel.tsx")"
  cp "src\renderer\engines\h5-editor\components\H5PropertiesPanel.tsx" "src\renderer\logic\engines\h5-editor\components\H5PropertiesPanel.tsx"
  echo "  ✅ h5-editor\components\H5PropertiesPanel.tsx"
fi

# 迁移: h5-editor\components\ImageExportPanel.tsx
if [ -f "src\renderer\engines\h5-editor\components\ImageExportPanel.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\components\ImageExportPanel.tsx")"
  cp "src\renderer\engines\h5-editor\components\ImageExportPanel.tsx" "src\renderer\logic\engines\h5-editor\components\ImageExportPanel.tsx"
  echo "  ✅ h5-editor\components\ImageExportPanel.tsx"
fi

# 迁移: h5-editor\core\h5-editor-manager.ts
if [ -f "src\renderer\engines\h5-editor\core\h5-editor-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\core\h5-editor-manager.ts")"
  cp "src\renderer\engines\h5-editor\core\h5-editor-manager.ts" "src\renderer\logic\engines\h5-editor\core\h5-editor-manager.ts"
  echo "  ✅ h5-editor\core\h5-editor-manager.ts"
fi

# 迁移: h5-editor\core\h5-editor.ts
if [ -f "src\renderer\engines\h5-editor\core\h5-editor.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\core\h5-editor.ts")"
  cp "src\renderer\engines\h5-editor\core\h5-editor.ts" "src\renderer\logic\engines\h5-editor\core\h5-editor.ts"
  echo "  ✅ h5-editor\core\h5-editor.ts"
fi

# 迁移: h5-editor\export\ExportOptimizer.ts
if [ -f "src\renderer\engines\h5-editor\export\ExportOptimizer.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\export\ExportOptimizer.ts")"
  cp "src\renderer\engines\h5-editor\export\ExportOptimizer.ts" "src\renderer\logic\engines\h5-editor\export\ExportOptimizer.ts"
  echo "  ✅ h5-editor\export\ExportOptimizer.ts"
fi

# 迁移: h5-editor\export\ImageExportEngine.ts
if [ -f "src\renderer\engines\h5-editor\export\ImageExportEngine.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\export\ImageExportEngine.ts")"
  cp "src\renderer\engines\h5-editor\export\ImageExportEngine.ts" "src\renderer\logic\engines\h5-editor\export\ImageExportEngine.ts"
  echo "  ✅ h5-editor\export\ImageExportEngine.ts"
fi

# 迁移: h5-editor\h5-editor-canvas-engine.ts
if [ -f "src\renderer\engines\h5-editor\h5-editor-canvas-engine.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\h5-editor-canvas-engine.ts")"
  cp "src\renderer\engines\h5-editor\h5-editor-canvas-engine.ts" "src\renderer\logic\engines\h5-editor\h5-editor-canvas-engine.ts"
  echo "  ✅ h5-editor\h5-editor-canvas-engine.ts"
fi

# 迁移: h5-editor\index.ts
if [ -f "src\renderer\engines\h5-editor\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\index.ts")"
  cp "src\renderer\engines\h5-editor\index.ts" "src\renderer\logic\engines\h5-editor\index.ts"
  echo "  ✅ h5-editor\index.ts"
fi

# 迁移: h5-editor\integration\suika-integration.ts
if [ -f "src\renderer\engines\h5-editor\integration\suika-integration.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\integration\suika-integration.ts")"
  cp "src\renderer\engines\h5-editor\integration\suika-integration.ts" "src\renderer\logic\engines\h5-editor\integration\suika-integration.ts"
  echo "  ✅ h5-editor\integration\suika-integration.ts"
fi

# 迁移: h5-editor\types\index.ts
if [ -f "src\renderer\engines\h5-editor\types\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\types\index.ts")"
  cp "src\renderer\engines\h5-editor\types\index.ts" "src\renderer\logic\engines\h5-editor\types\index.ts"
  echo "  ✅ h5-editor\types\index.ts"
fi

# 迁移: h5-editor\utils\event-emitter.ts
if [ -f "src\renderer\engines\h5-editor\utils\event-emitter.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\utils\event-emitter.ts")"
  cp "src\renderer\engines\h5-editor\utils\event-emitter.ts" "src\renderer\logic\engines\h5-editor\utils\event-emitter.ts"
  echo "  ✅ h5-editor\utils\event-emitter.ts"
fi

# 迁移: h5-editor\utils\sharp-integration.ts
if [ -f "src\renderer\engines\h5-editor\utils\sharp-integration.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\h5-editor\utils\sharp-integration.ts")"
  cp "src\renderer\engines\h5-editor\utils\sharp-integration.ts" "src\renderer\logic\engines\h5-editor\utils\sharp-integration.ts"
  echo "  ✅ h5-editor\utils\sharp-integration.ts"
fi

# 迁移: index.ts
if [ -f "src\renderer\engines\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\index.ts")"
  cp "src\renderer\engines\index.ts" "src\renderer\logic\engines\index.ts"
  echo "  ✅ index.ts"
fi

# 迁移: MemoryManager.ts
if [ -f "src\renderer\engines\MemoryManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\MemoryManager.ts")"
  cp "src\renderer\engines\MemoryManager.ts" "src\renderer\logic\engines\MemoryManager.ts"
  echo "  ✅ MemoryManager.ts"
fi

# 迁移: SimpleCanvasValidator.ts
if [ -f "src\renderer\engines\SimpleCanvasValidator.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\SimpleCanvasValidator.ts")"
  cp "src\renderer\engines\SimpleCanvasValidator.ts" "src\renderer\logic\engines\SimpleCanvasValidator.ts"
  echo "  ✅ SimpleCanvasValidator.ts"
fi

# 迁移: suika\adapter\react-adapter.tsx
if [ -f "src\renderer\engines\suika\adapter\react-adapter.tsx" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\adapter\react-adapter.tsx")"
  cp "src\renderer\engines\suika\adapter\react-adapter.tsx" "src\renderer\logic\engines\suika\adapter\react-adapter.tsx"
  echo "  ✅ suika\adapter\react-adapter.tsx"
fi

# 迁移: suika\adapter\tool-adapter.ts
if [ -f "src\renderer\engines\suika\adapter\tool-adapter.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\adapter\tool-adapter.ts")"
  cp "src\renderer\engines\suika\adapter\tool-adapter.ts" "src\renderer\logic\engines\suika\adapter\tool-adapter.ts"
  echo "  ✅ suika\adapter\tool-adapter.ts"
fi

# 迁移: suika\core\command-manager.ts
if [ -f "src\renderer\engines\suika\core\command-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\core\command-manager.ts")"
  cp "src\renderer\engines\suika\core\command-manager.ts" "src\renderer\logic\engines\suika\core\command-manager.ts"
  echo "  ✅ suika\core\command-manager.ts"
fi

# 迁移: suika\core\editor.ts
if [ -f "src\renderer\engines\suika\core\editor.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\core\editor.ts")"
  cp "src\renderer\engines\suika\core\editor.ts" "src\renderer\logic\engines\suika\core\editor.ts"
  echo "  ✅ suika\core\editor.ts"
fi

# 迁移: suika\core\memory-manager.ts
if [ -f "src\renderer\engines\suika\core\memory-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\core\memory-manager.ts")"
  cp "src\renderer\engines\suika\core\memory-manager.ts" "src\renderer\logic\engines\suika\core\memory-manager.ts"
  echo "  ✅ suika\core\memory-manager.ts"
fi

# 迁移: suika\core\scene-graph.ts
if [ -f "src\renderer\engines\suika\core\scene-graph.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\core\scene-graph.ts")"
  cp "src\renderer\engines\suika\core\scene-graph.ts" "src\renderer\logic\engines\suika\core\scene-graph.ts"
  echo "  ✅ suika\core\scene-graph.ts"
fi

# 迁移: suika\core\tool-manager.ts
if [ -f "src\renderer\engines\suika\core\tool-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\core\tool-manager.ts")"
  cp "src\renderer\engines\suika\core\tool-manager.ts" "src\renderer\logic\engines\suika\core\tool-manager.ts"
  echo "  ✅ suika\core\tool-manager.ts"
fi

# 迁移: suika\core\viewport-manager.ts
if [ -f "src\renderer\engines\suika\core\viewport-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\core\viewport-manager.ts")"
  cp "src\renderer\engines\suika\core\viewport-manager.ts" "src\renderer\logic\engines\suika\core\viewport-manager.ts"
  echo "  ✅ suika\core\viewport-manager.ts"
fi

# 迁移: suika\core\zoom-manager.ts
if [ -f "src\renderer\engines\suika\core\zoom-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\core\zoom-manager.ts")"
  cp "src\renderer\engines\suika\core\zoom-manager.ts" "src\renderer\logic\engines\suika\core\zoom-manager.ts"
  echo "  ✅ suika\core\zoom-manager.ts"
fi

# 迁移: suika\index.ts
if [ -f "src\renderer\engines\suika\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\index.ts")"
  cp "src\renderer\engines\suika\index.ts" "src\renderer\logic\engines\suika\index.ts"
  echo "  ✅ suika\index.ts"
fi

# 迁移: suika\suika-canvas-engine.ts
if [ -f "src\renderer\engines\suika\suika-canvas-engine.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\suika-canvas-engine.ts")"
  cp "src\renderer\engines\suika\suika-canvas-engine.ts" "src\renderer\logic\engines\suika\suika-canvas-engine.ts"
  echo "  ✅ suika\suika-canvas-engine.ts"
fi

# 迁移: suika\types\index.ts
if [ -f "src\renderer\engines\suika\types\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\types\index.ts")"
  cp "src\renderer\engines\suika\types\index.ts" "src\renderer\logic\engines\suika\types\index.ts"
  echo "  ✅ suika\types\index.ts"
fi

# 迁移: suika\utils\event-emitter.ts
if [ -f "src\renderer\engines\suika\utils\event-emitter.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\utils\event-emitter.ts")"
  cp "src\renderer\engines\suika\utils\event-emitter.ts" "src\renderer\logic\engines\suika\utils\event-emitter.ts"
  echo "  ✅ suika\utils\event-emitter.ts"
fi

# 迁移: suika\utils\uuid.ts
if [ -f "src\renderer\engines\suika\utils\uuid.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\engines\suika\utils\uuid.ts")"
  cp "src\renderer\engines\suika\utils\uuid.ts" "src\renderer\logic\engines\suika\utils\uuid.ts"
  echo "  ✅ suika\utils\uuid.ts"
fi


# 核心功能迁移到逻辑层
echo "📂 迁移: src/renderer/core/ -> src/renderer/logic/managers/"
mkdir -p "src/renderer/logic/managers/"

# 迁移: assets\asset-library.ts
if [ -f "src\renderer\core\assets\asset-library.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\asset-library.ts")"
  cp "src\renderer\core\assets\asset-library.ts" "src\renderer\logic\managers\assets\asset-library.ts"
  echo "  ✅ assets\asset-library.ts"
fi

# 迁移: assets\asset-manager.ts
if [ -f "src\renderer\core\assets\asset-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\asset-manager.ts")"
  cp "src\renderer\core\assets\asset-manager.ts" "src\renderer\logic\managers\assets\asset-manager.ts"
  echo "  ✅ assets\asset-manager.ts"
fi

# 迁移: assets\asset-types.ts
if [ -f "src\renderer\core\assets\asset-types.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\asset-types.ts")"
  cp "src\renderer\core\assets\asset-types.ts" "src\renderer\logic\managers\assets\asset-types.ts"
  echo "  ✅ assets\asset-types.ts"
fi

# 迁移: assets\index.ts
if [ -f "src\renderer\core\assets\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\assets\index.ts")"
  cp "src\renderer\core\assets\index.ts" "src\renderer\logic\managers\assets\index.ts"
  echo "  ✅ assets\index.ts"
fi

# 迁移: canvas\canvas-manager.ts
if [ -f "src\renderer\core\canvas\canvas-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\canvas\canvas-manager.ts")"
  cp "src\renderer\core\canvas\canvas-manager.ts" "src\renderer\logic\managers\canvas\canvas-manager.ts"
  echo "  ✅ canvas\canvas-manager.ts"
fi

# 迁移: canvas\canvas-types.ts
if [ -f "src\renderer\core\canvas\canvas-types.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\canvas\canvas-types.ts")"
  cp "src\renderer\core\canvas\canvas-types.ts" "src\renderer\logic\managers\canvas\canvas-types.ts"
  echo "  ✅ canvas\canvas-types.ts"
fi

# 迁移: canvas\canvas-utils.ts
if [ -f "src\renderer\core\canvas\canvas-utils.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\canvas\canvas-utils.ts")"
  cp "src\renderer\core\canvas\canvas-utils.ts" "src\renderer\logic\managers\canvas\canvas-utils.ts"
  echo "  ✅ canvas\canvas-utils.ts"
fi

# 迁移: canvas\index.ts
if [ -f "src\renderer\core\canvas\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\canvas\index.ts")"
  cp "src\renderer\core\canvas\index.ts" "src\renderer\logic\managers\canvas\index.ts"
  echo "  ✅ canvas\index.ts"
fi

# 迁移: history\commands.ts
if [ -f "src\renderer\core\history\commands.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\history\commands.ts")"
  cp "src\renderer\core\history\commands.ts" "src\renderer\logic\managers\history\commands.ts"
  echo "  ✅ history\commands.ts"
fi

# 迁移: history\history-manager.ts
if [ -f "src\renderer\core\history\history-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\history\history-manager.ts")"
  cp "src\renderer\core\history\history-manager.ts" "src\renderer\logic\managers\history\history-manager.ts"
  echo "  ✅ history\history-manager.ts"
fi

# 迁移: history\history-types.ts
if [ -f "src\renderer\core\history\history-types.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\history\history-types.ts")"
  cp "src\renderer\core\history\history-types.ts" "src\renderer\logic\managers\history\history-types.ts"
  echo "  ✅ history\history-types.ts"
fi

# 迁移: history\index.ts
if [ -f "src\renderer\core\history\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\history\index.ts")"
  cp "src\renderer\core\history\index.ts" "src\renderer\logic\managers\history\index.ts"
  echo "  ✅ history\index.ts"
fi

# 迁移: index.ts
if [ -f "src\renderer\core\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\index.ts")"
  cp "src\renderer\core\index.ts" "src\renderer\logic\managers\index.ts"
  echo "  ✅ index.ts"
fi

# 迁移: tools\index.ts
if [ -f "src\renderer\core\tools\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\tools\index.ts")"
  cp "src\renderer\core\tools\index.ts" "src\renderer\logic\managers\tools\index.ts"
  echo "  ✅ tools\index.ts"
fi

# 迁移: tools\tool-manager.ts
if [ -f "src\renderer\core\tools\tool-manager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\tools\tool-manager.ts")"
  cp "src\renderer\core\tools\tool-manager.ts" "src\renderer\logic\managers\tools\tool-manager.ts"
  echo "  ✅ tools\tool-manager.ts"
fi

# 迁移: tools\tool-types.ts
if [ -f "src\renderer\core\tools\tool-types.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\tools\tool-types.ts")"
  cp "src\renderer\core\tools\tool-types.ts" "src\renderer\logic\managers\tools\tool-types.ts"
  echo "  ✅ tools\tool-types.ts"
fi

# 迁移: tools\tools.ts
if [ -f "src\renderer\core\tools\tools.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\managers\tools\tools.ts")"
  cp "src\renderer\core\tools\tools.ts" "src\renderer\logic\managers\tools\tools.ts"
  echo "  ✅ tools\tools.ts"
fi


# 工具函数迁移到逻辑层
echo "📂 迁移: src/renderer/utils/ -> src/renderer/logic/utils/"
mkdir -p "src/renderer/logic/utils/"

# 迁移: DevDebugTools.ts
if [ -f "src\renderer\utils\DevDebugTools.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\DevDebugTools.ts")"
  cp "src\renderer\utils\DevDebugTools.ts" "src\renderer\logic\utils\DevDebugTools.ts"
  echo "  ✅ DevDebugTools.ts"
fi

# 迁移: DevTools.ts
if [ -f "src\renderer\utils\DevTools.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\DevTools.ts")"
  cp "src\renderer\utils\DevTools.ts" "src\renderer\logic\utils\DevTools.ts"
  echo "  ✅ DevTools.ts"
fi

# 迁移: ErrorAnalyzer.ts
if [ -f "src\renderer\utils\ErrorAnalyzer.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\ErrorAnalyzer.ts")"
  cp "src\renderer\utils\ErrorAnalyzer.ts" "src\renderer\logic\utils\ErrorAnalyzer.ts"
  echo "  ✅ ErrorAnalyzer.ts"
fi

# 迁移: ErrorRecoveryManager.ts
if [ -f "src\renderer\utils\ErrorRecoveryManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\ErrorRecoveryManager.ts")"
  cp "src\renderer\utils\ErrorRecoveryManager.ts" "src\renderer\logic\utils\ErrorRecoveryManager.ts"
  echo "  ✅ ErrorRecoveryManager.ts"
fi

# 迁移: EventEmitter.ts
if [ -f "src\renderer\utils\EventEmitter.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\EventEmitter.ts")"
  cp "src\renderer\utils\EventEmitter.ts" "src\renderer\logic\utils\EventEmitter.ts"
  echo "  ✅ EventEmitter.ts"
fi

# 迁移: events\canvasEvents.ts
if [ -f "src\renderer\utils\events\canvasEvents.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\events\canvasEvents.ts")"
  cp "src\renderer\utils\events\canvasEvents.ts" "src\renderer\logic\utils\events\canvasEvents.ts"
  echo "  ✅ events\canvasEvents.ts"
fi

# 迁移: events\index.ts
if [ -f "src\renderer\utils\events\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\events\index.ts")"
  cp "src\renderer\utils\events\index.ts" "src\renderer\logic\utils\events\index.ts"
  echo "  ✅ events\index.ts"
fi

# 迁移: FigmaBatchUpdateManager.ts
if [ -f "src\renderer\utils\FigmaBatchUpdateManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\FigmaBatchUpdateManager.ts")"
  cp "src\renderer\utils\FigmaBatchUpdateManager.ts" "src\renderer\logic\utils\FigmaBatchUpdateManager.ts"
  echo "  ✅ FigmaBatchUpdateManager.ts"
fi

# 迁移: index.ts
if [ -f "src\renderer\utils\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\index.ts")"
  cp "src\renderer\utils\index.ts" "src\renderer\logic\utils\index.ts"
  echo "  ✅ index.ts"
fi

# 迁移: InitializationManager.ts
if [ -f "src\renderer\utils\InitializationManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\InitializationManager.ts")"
  cp "src\renderer\utils\InitializationManager.ts" "src\renderer\logic\utils\InitializationManager.ts"
  echo "  ✅ InitializationManager.ts"
fi

# 迁移: managers\index.ts
if [ -f "src\renderer\utils\managers\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\managers\index.ts")"
  cp "src\renderer\utils\managers\index.ts" "src\renderer\logic\utils\managers\index.ts"
  echo "  ✅ managers\index.ts"
fi

# 迁移: performance\FileOperationOptimizer.ts
if [ -f "src\renderer\utils\performance\FileOperationOptimizer.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\performance\FileOperationOptimizer.ts")"
  cp "src\renderer\utils\performance\FileOperationOptimizer.ts" "src\renderer\logic\utils\performance\FileOperationOptimizer.ts"
  echo "  ✅ performance\FileOperationOptimizer.ts"
fi

# 迁移: performance\index.ts
if [ -f "src\renderer\utils\performance\index.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\performance\index.ts")"
  cp "src\renderer\utils\performance\index.ts" "src\renderer\logic\utils\performance\index.ts"
  echo "  ✅ performance\index.ts"
fi

# 迁移: performance\PerformanceTestRunner.ts
if [ -f "src\renderer\utils\performance\PerformanceTestRunner.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\performance\PerformanceTestRunner.ts")"
  cp "src\renderer\utils\performance\PerformanceTestRunner.ts" "src\renderer\logic\utils\performance\PerformanceTestRunner.ts"
  echo "  ✅ performance\PerformanceTestRunner.ts"
fi

# 迁移: performance\RuntimePerformanceMonitor.ts
if [ -f "src\renderer\utils\performance\RuntimePerformanceMonitor.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\performance\RuntimePerformanceMonitor.ts")"
  cp "src\renderer\utils\performance\RuntimePerformanceMonitor.ts" "src\renderer\logic\utils\performance\RuntimePerformanceMonitor.ts"
  echo "  ✅ performance\RuntimePerformanceMonitor.ts"
fi

# 迁移: performance\StartupPerformanceMonitor.ts
if [ -f "src\renderer\utils\performance\StartupPerformanceMonitor.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\performance\StartupPerformanceMonitor.ts")"
  cp "src\renderer\utils\performance\StartupPerformanceMonitor.ts" "src\renderer\logic\utils\performance\StartupPerformanceMonitor.ts"
  echo "  ✅ performance\StartupPerformanceMonitor.ts"
fi

# 迁移: performance\UnifiedPerformanceMonitor.ts
if [ -f "src\renderer\utils\performance\UnifiedPerformanceMonitor.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\performance\UnifiedPerformanceMonitor.ts")"
  cp "src\renderer\utils\performance\UnifiedPerformanceMonitor.ts" "src\renderer\logic\utils\performance\UnifiedPerformanceMonitor.ts"
  echo "  ✅ performance\UnifiedPerformanceMonitor.ts"
fi

# 迁移: RadixUIPerformanceMonitor.ts
if [ -f "src\renderer\utils\RadixUIPerformanceMonitor.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\RadixUIPerformanceMonitor.ts")"
  cp "src\renderer\utils\RadixUIPerformanceMonitor.ts" "src\renderer\logic\utils\RadixUIPerformanceMonitor.ts"
  echo "  ✅ RadixUIPerformanceMonitor.ts"
fi

# 迁移: ReactLoopFix.ts
if [ -f "src\renderer\utils\ReactLoopFix.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\ReactLoopFix.ts")"
  cp "src\renderer\utils\ReactLoopFix.ts" "src\renderer\logic\utils\ReactLoopFix.ts"
  echo "  ✅ ReactLoopFix.ts"
fi

# 迁移: TypedEventEmitter.ts
if [ -f "src\renderer\utils\TypedEventEmitter.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\TypedEventEmitter.ts")"
  cp "src\renderer\utils\TypedEventEmitter.ts" "src\renderer\logic\utils\TypedEventEmitter.ts"
  echo "  ✅ TypedEventEmitter.ts"
fi

# 迁移: UIEnhancementManager.ts
if [ -f "src\renderer\utils\UIEnhancementManager.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\UIEnhancementManager.ts")"
  cp "src\renderer\utils\UIEnhancementManager.ts" "src\renderer\logic\utils\UIEnhancementManager.ts"
  echo "  ✅ UIEnhancementManager.ts"
fi


# 类型定义迁移到接口层
echo "📂 迁移: src/renderer/types/ -> src/interfaces/types/"
mkdir -p "src/interfaces/types/"

# 迁移: canvas.ts
if [ -f "src\renderer\types\canvas.ts" ]; then
  mkdir -p "$(dirname "src\interfaces\types\canvas.ts")"
  cp "src\renderer\types\canvas.ts" "src\interfaces\types\canvas.ts"
  echo "  ✅ canvas.ts"
fi

# 迁移: fabric.d.ts
if [ -f "src\renderer\types\fabric.d.ts" ]; then
  mkdir -p "$(dirname "src\interfaces\types\fabric.d.ts")"
  cp "src\renderer\types\fabric.d.ts" "src\interfaces\types\fabric.d.ts"
  echo "  ✅ fabric.d.ts"
fi

# 迁移: styled-components.d.ts
if [ -f "src\renderer\types\styled-components.d.ts" ]; then
  mkdir -p "$(dirname "src\interfaces\types\styled-components.d.ts")"
  cp "src\renderer\types\styled-components.d.ts" "src\interfaces\types\styled-components.d.ts"
  echo "  ✅ styled-components.d.ts"
fi


# 全局类型定义迁移
echo "📂 迁移: src/types/ -> src/interfaces/types/"
mkdir -p "src/interfaces/types/"

# 迁移: electron.d.ts
if [ -f "src\types\electron.d.ts" ]; then
  mkdir -p "$(dirname "src\interfaces\types\electron.d.ts")"
  cp "src\types\electron.d.ts" "src\interfaces\types\electron.d.ts"
  echo "  ✅ electron.d.ts"
fi

# 迁移: global.d.ts
if [ -f "src\types\global.d.ts" ]; then
  mkdir -p "$(dirname "src\interfaces\types\global.d.ts")"
  cp "src\types\global.d.ts" "src\interfaces\types\global.d.ts"
  echo "  ✅ global.d.ts"
fi

# 迁移: path-browserify.d.ts
if [ -f "src\types\path-browserify.d.ts" ]; then
  mkdir -p "$(dirname "src\interfaces\types\path-browserify.d.ts")"
  cp "src\types\path-browserify.d.ts" "src\interfaces\types\path-browserify.d.ts"
  echo "  ✅ path-browserify.d.ts"
fi


# 共享工具函数迁移
echo "📂 迁移: src/utils/ -> src/renderer/logic/utils/"
mkdir -p "src/renderer/logic/utils/"

# 迁移: performance.ts
if [ -f "src\utils\performance.ts" ]; then
  mkdir -p "$(dirname "src\renderer\logic\utils\performance.ts")"
  cp "src\utils\performance.ts" "src\renderer\logic\utils\performance.ts"
  echo "  ✅ performance.ts"
fi


echo "🎉 文件迁移完成!"
echo "⚠️ 请检查迁移后的文件并更新导入路径"
