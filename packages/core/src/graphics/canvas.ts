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
      super.insertChild(graphics, sortIdx);

      // 添加H5容器后立即重新识别，确保后续图形能正确添加到H5容器
      // 使用requestAnimationFrame确保DOM更新完成
      requestAnimationFrame(() => {
        this.findH5Container();
      });
      return;
    }

    // 检查是否在H5模式下（使用全局标记）
    const isH5Project = (window as any).__isH5Project;

    if (!isH5Project) {
      // 非H5模式：直接使用父类的insertChild方法
      super.insertChild(graphics, sortIdx);
      return;
    }

    // H5模式：查找H5容器
    const h5Container = this.findH5Container();

    if (h5Container) {
      // H5模式：将图形添加到H5容器内
      h5Container.insertChild(graphics, sortIdx);
    } else {
      // H5模式但没有找到H5容器：这是配置错误
      console.error(
        'H5模式配置错误：未找到H5容器，无法添加图形',
        graphics.attrs.id,
      );
      throw new Error('H5模式配置错误：未找到H5容器，请确保H5容器已正确初始化');
    }
  }

  /**
   * 查找H5容器
   * @returns H5容器或null
   */
  private findH5Container(): GAssetForgeGraphics | null {
    const children = this.getChildren();

    // 改进的H5容器查找逻辑
    const h5Container = children.find((child: any) => {
      // 多重检查确保准确识别H5容器
      return (
        child.type === 'H5Container' ||
        child.constructor?.name === 'H5Container' ||
        (child.attrs &&
          child.attrs.id &&
          child.attrs.id.includes('h5_container')) ||
        (child.attrs &&
          child.attrs.id &&
          child.attrs.id.includes('h5-container'))
      );
    });

    if (h5Container) {
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
