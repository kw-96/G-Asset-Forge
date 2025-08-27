import { type GAssetForgeEditor } from '@g-asset-forge/core';
import { createContext } from 'react';

const EditorContext = createContext<GAssetForgeEditor | null>(null);

export { EditorContext };
