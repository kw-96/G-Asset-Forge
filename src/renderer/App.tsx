/**
 * 应用程序根组件 - React应用的顶层组件
 * @description 作为整个React应用的入口点，负责初始化应用容器和处理就绪回调
 * @author 开发团队
 */

import React, { useEffect } from 'react';
import { AppContainer } from './ui/business/App/AppContainer';

/**
 * 应用程序属性接口
 * @description 定义App组件的属性类型
 */
interface AppProps {
  /** 应用就绪时的回调函数 */
  onReady?: () => void;
}

/**
 * 应用程序根组件
 * @param props 组件属性
 * @returns React组件
 * @example
 * <App onReady={() => console.log('应用已就绪')} />
 */
const App: React.FC<AppProps> = ({ onReady }) => {
  // 应用挂载后移除加载遮罩，防止停留在加载页
  useEffect(() => {
    try { onReady?.(); } catch {}
  }, [onReady]);

  return <AppContainer />;
};

export default App;
