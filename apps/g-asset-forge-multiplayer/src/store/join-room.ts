import { HocuspocusProvider } from '@hocuspocus/provider';
import { type GAssetForgeEditor } from '@g-asset-forge/core';

import { GAssetForgeBinding } from './y-g-asset-forge';

export const joinRoom = (
  editor: GAssetForgeEditor,
  roomId: string,
  user: { username: string; id: number },
) => {
  const host = import.meta.env.DEV ? 'localhost:5356' : location.host;

  const provider = new HocuspocusProvider({
    url: `ws://${host}/join/room/`,
    name: roomId,
    token: document.cookie.slice(13),
    onAuthenticationFailed: (data) => {
      console.log('权限不足', data);
    },
  });

  const yMap = provider.document.getMap<Record<string, any>>('nodes');
  return new GAssetForgeBinding(yMap, editor, provider.awareness!, user);
};
