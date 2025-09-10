import { type GAssetForgeGraphics } from '../graphics';

export const getNoConflictObjectName = (
  parent: GAssetForgeGraphics,
  objectType: string,
) => {
  // 对于画布类型，应该检查所有画布而不是父元素的子元素
  if (objectType === 'Page') {
    // 首先尝试从 graphicsStoreManager 获取画布列表
    let canvasItems =
      (parent as any).doc?.graphicsStoreManager?.getCanvasItems?.() || [];

    // 如果 graphicsStoreManager 中没有画布，尝试从文档的子元素中获取
    if (canvasItems.length === 0) {
      const doc = parent as any;
      if (doc && doc.getChildren) {
        const children = doc.getChildren();
        canvasItems = children.filter(
          (child: any) =>
            child &&
            child.attrs &&
            child.attrs.type === 'Canvas' &&
            !child.isDeleted(),
        );
      }
    }

    let maxNum = 0;
    const regexp = new RegExp(`^${objectType}\\s+(\\d+)`);
    for (const canvas of canvasItems) {
      const match = canvas.attrs.objectName.match(regexp);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
    const result = `${objectType} ${maxNum + 1}`;
    return result;
  }

  // 对于其他类型，使用原来的逻辑
  const children = parent.getChildren();
  let maxNum = 0;
  const regexp = new RegExp(`^${objectType}\\s+(\\d+)`);
  for (const child of children) {
    const match = child.attrs.objectName.match(regexp);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `${objectType} ${maxNum + 1}`;
};

export const mergeIntervals = (intervals: [number, number][]) => {
  intervals.sort(([a], [b]) => a - b);

  const result: [number, number][] = [];
  for (const [prev, next] of intervals) {
    const cur = result.at(-1);
    if (cur && cur[1] >= prev) {
      cur[1] = Math.max(next, cur[1]);
    } else {
      result.push([prev, next]);
    }
  }
  return result;
};
