import { identityMatrix, type IPoint, type Matrix } from '@g-asset-forge/geo';

import { GraphicsType, type Optional } from '../type';
import {
  type GraphicsAttrs,
  type IGraphicsOpts,
  GAssetForgeGraphics,
} from './graphics';
import { type IHitOptions } from './type';

type GAssetForgeCanvasAttrs = GraphicsAttrs;

export class GAssetForgeCanvas extends GAssetForgeGraphics<GAssetForgeCanvasAttrs> {
  override type = GraphicsType.Canvas;
  protected override isContainer = true;

  lastSelectedIds = new Set<string>();
  lastMatrix: Matrix | null = null;

  constructor(
    attrs: Optional<
      Omit<GAssetForgeCanvasAttrs, 'width' | 'height'>,
      'id' | 'transform'
    >,
    opts: IGraphicsOpts,
  ) {
    super({ ...attrs, width: 0, height: 0, type: GraphicsType.Canvas }, opts);
  }

  override getWorldTransform() {
    return identityMatrix();
  }

  override getHitGraphics(point: IPoint, options: IHitOptions) {
    const children = this.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      const hitGraphics = child.getHitGraphics(point, options);
      if (hitGraphics) {
        return hitGraphics;
      }
    }
    return null;
  }

  protected override shouldSkipDraw() {
    return false;
  }
}

export const isCanvasGraphics = (
  graphics: GAssetForgeGraphics,
): graphics is GAssetForgeCanvas => {
  return graphics instanceof GAssetForgeCanvas;
};
