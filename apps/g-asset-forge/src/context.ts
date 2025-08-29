import { type GAssetForgeEditor } from '@g-asset-forge/core';
import { createContext } from 'react';
import { type IProjectTab } from './components/ProjectLibraryPanel/types';

// 扩展的编辑器上下文，包含项目管理数据
export interface EditorContextValue {
  editor: GAssetForgeEditor | null;
  projectTabs: IProjectTab[];
  activeTabId: string | null;
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
}

const EditorContext = createContext<EditorContextValue>({
  editor: null,
  projectTabs: [],
  activeTabId: null,
});

export { EditorContext };
