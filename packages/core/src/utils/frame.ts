import { type IPoint } from '@g-asset-forge/geo';

import {
  isFrameGraphics,
  type GAssetForgeFrame,
  type GAssetForgeGraphics,
} from '../graphics';

export const getDeepFrameAtPoint = (
  point: IPoint,
  nodes: GAssetForgeGraphics[],
  excludeFn?: (node: GAssetForgeGraphics) => boolean,
): GAssetForgeFrame | null => {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const child = nodes[i];
    if (excludeFn?.(child)) {
      continue;
    }
    if (isFrameGraphics(child) && !child.isGroup() && child.hitTest(point)) {
      const item = getDeepFrameAtPoint(point, child.getChildren(), excludeFn);
      return item || child;
    }
  }
  return null;
};
