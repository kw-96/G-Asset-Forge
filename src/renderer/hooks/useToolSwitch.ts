/**
 * 工具切换Hook
 * 处理工具切换时的状态清理和管理
 * @description 提供工具切换的实时监控和性能统计功能
 * @author 开发团队
 */

import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { ToolManager } from '../logic/managers/tools/ToolManager';

export const useToolSwitch = () => {
  const { activeTool, setActiveTool } = useAppStore();
  const toolManager = ToolManager.getInstance();

  // 监听工具切换
  useEffect(() => {
    // 切换工具时清理之前工具的状态
    toolManager.activateTool(activeTool as any);
  }, [activeTool, toolManager]);

  const switchTool = (newTool: string) => {
    // 如果是相同工具，不需要切换
    if (newTool === activeTool) return;
    
    // 切换工具
    setActiveTool(newTool);
  };

  return {
    activeTool,
    switchTool
  };
};

export default useToolSwitch;