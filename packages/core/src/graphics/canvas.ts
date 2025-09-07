import { identityMatrix, type IPoint, type Matrix } from '@g-asset-forge/geo';

import { GraphicsType, type Optional } from '../type';
import {
  GAssetForgeGraphics,
  type GraphicsAttrs,
  type IGraphicsOpts,
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

  /**
   * 重写insertChild方法，在H5模式下自动将图形添加到H5容器内
   */
  override insertChild(graphics: GAssetForgeGraphics, sortIdx?: string) {
    // 如果正在添加H5容器本身，直接添加到画布，避免循环依赖
    if ((graphics as any).type === 'H5Container') {
      console.log('添加H5容器到画布:', graphics.attrs.id);
      super.insertChild(graphics, sortIdx);
      return;
    }

    // 检查是否在H5模式下
    const h5Container = this.findH5Container();

    if (h5Container) {
      // H5模式：将图形添加到H5容器内
      console.log('H5模式：将图形添加到H5容器内', {
        graphicsId: graphics.attrs.id,
        graphicsType: graphics.type,
        h5ContainerId: h5Container.attrs.id,
      });
      h5Container.insertChild(graphics, sortIdx);
      console.log('图形已添加到H5容器:', graphics.attrs.id);
    } else {
      // 普通模式：使用父类的insertChild方法
      console.log('普通模式：将图形添加到画布', graphics.attrs.id);
      super.insertChild(graphics, sortIdx);
    }
  }

  /**
   * 查找H5容器
   * @returns H5容器或null
   */
  private findH5Container(): GAssetForgeGraphics | null {
    const children = this.getChildren();

    // 调试信息：打印所有子元素的类型
    console.log(
      '画布子元素类型检查:',
      children.map((child: any) => ({
        id: child.attrs?.id,
        type: child.type,
        isH5Container: child.type === 'H5Container',
      })),
    );

    const h5Container = children.find(
      (child: any) => child.type === 'H5Container',
    );

    if (h5Container) {
      console.log('找到H5容器:', h5Container.attrs.id);
      return h5Container;
    }

    console.log('未找到H5容器，当前画布子元素数量:', children.length);
    return null;
  }
}

export const isCanvasGraphics = (
  graphics: GAssetForgeGraphics,
): graphics is GAssetForgeCanvas => {
  return graphics instanceof GAssetForgeCanvas;
};
