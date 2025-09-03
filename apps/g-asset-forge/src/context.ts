import { type GAssetForgeEditor } from '@g-asset-forge/core';
import { createContext } from 'react';

// 扩展的编辑器上下文，包含项目管理数据
export interface EditorContextValue {
  editor: GAssetForgeEditor | null;
}

const EditorContext = createContext<EditorContextValue>({
  editor: null,
});

export { EditorContext };
