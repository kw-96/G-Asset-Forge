import { type GAssetForgeEditor } from '../editor';
import { type GAssetForgeGraphics, type GAssetForgeText } from '../graphics';
import { Transaction } from '../transaction';
import { GraphicsType } from '../type';

/**
 * 文本操作服务
 * 专门处理文本图形的字体、样式等属性修改
 * 与其他文本相关服务（TextEditor、RangeManager）协同工作
 */
export const TextOperationsService = {
  /** 设置文本图形的字体大小 */
  setFontSize({
    editor,
    graphicsArr,
    val,
    isDelta = false,
  }: {
    editor: GAssetForgeEditor;
    graphicsArr: GAssetForgeGraphics[];
    val: number;
    isDelta: boolean;
  }) {
    if (graphicsArr.length === 0) {
      return false;
    }

    let updateSuccess = false;
    const matchGraphicsArr = graphicsArr.filter(
      (el) => el.type === GraphicsType.Text,
    ) as GAssetForgeText[];

    const transaction = new Transaction(editor);
    for (const graphics of matchGraphicsArr) {
      transaction.recordOld(graphics.attrs.id, {
        fontSize: graphics.attrs.fontSize,
        width: graphics.attrs.width,
        height: graphics.attrs.height,
      } as any);
      const oldVal = graphics.attrs.fontSize;
      let newVal = isDelta ? oldVal + val : val;
      if (newVal <= 1) {
        newVal = 1;
      }
      if (newVal !== oldVal) {
        updateSuccess = true;

        // 更新字体大小，这会清除缓存的contentMetrics
        graphics.updateAttrs({ fontSize: newVal });

        // 重新计算文本尺寸（此时会基于新的字体大小计算）
        const contentMetrics = graphics.getContentMetrics();
        const newWidth = contentMetrics.width;
        const newHeight = contentMetrics.height;

        // 更新宽度和高度
        graphics.updateAttrs({
          width: newWidth,
          height: newHeight,
        });

        transaction.update(graphics.attrs.id, {
          fontSize: graphics.attrs.fontSize,
          width: graphics.attrs.width,
          height: graphics.attrs.height,
        } as any);
      }
    }
    if (updateSuccess) {
      transaction.updateParentSize(matchGraphicsArr);
      transaction.commit('Update FontSize of Text Elements');
    }
    return updateSuccess;
  },

  /** 设置文本图形的字体族 */
  setFontFamily({
    editor,
    graphicsArr,
    fontFamily,
  }: {
    editor: GAssetForgeEditor;
    graphicsArr: GAssetForgeGraphics[];
    fontFamily: string;
  }) {
    if (graphicsArr.length === 0) {
      return false;
    }

    let updateSuccess = false;
    const matchGraphicsArr = graphicsArr.filter(
      (el) => el.type === GraphicsType.Text,
    ) as GAssetForgeText[];

    const transaction = new Transaction(editor);
    for (const graphics of matchGraphicsArr) {
      transaction.recordOld(graphics.attrs.id, {
        fontFamily: graphics.attrs.fontFamily,
        width: graphics.attrs.width,
        height: graphics.attrs.height,
      } as any);
      const oldVal = graphics.attrs.fontFamily;
      if (fontFamily !== oldVal) {
        updateSuccess = true;

        // 更新字体族
        graphics.updateAttrs({ fontFamily });

        // 重新计算文本尺寸
        const contentMetrics = graphics.getContentMetrics();
        const newWidth = contentMetrics.width;
        const newHeight = contentMetrics.height;

        // 更新宽度和高度
        graphics.updateAttrs({
          width: newWidth,
          height: newHeight,
        });

        transaction.update(graphics.attrs.id, {
          fontFamily: graphics.attrs.fontFamily,
          width: graphics.attrs.width,
          height: graphics.attrs.height,
        } as any);
      }
    }
    if (updateSuccess) {
      transaction.updateParentSize(matchGraphicsArr);
      transaction.commit('Update FontFamily of Text Elements');
    }
    return updateSuccess;
  },

  /** 设置文本内容 */
  setTextContent({
    editor,
    graphicsArr,
    content,
  }: {
    editor: GAssetForgeEditor;
    graphicsArr: GAssetForgeGraphics[];
    content: string;
  }) {
    if (graphicsArr.length === 0) {
      return false;
    }

    let updateSuccess = false;
    const matchGraphicsArr = graphicsArr.filter(
      (el) => el.type === GraphicsType.Text,
    ) as GAssetForgeText[];

    const transaction = new Transaction(editor);
    for (const graphics of matchGraphicsArr) {
      transaction.recordOld(graphics.attrs.id, {
        content: graphics.attrs.content,
        width: graphics.attrs.width,
        height: graphics.attrs.height,
      } as any);
      const oldVal = graphics.attrs.content;
      if (content !== oldVal) {
        updateSuccess = true;

        // 更新文本内容
        graphics.updateAttrs({ content });

        // 重新计算文本尺寸
        const contentMetrics = graphics.getContentMetrics();
        const newWidth = contentMetrics.width;
        const newHeight = contentMetrics.height;

        // 更新宽度和高度
        graphics.updateAttrs({
          width: newWidth,
          height: newHeight,
        });

        transaction.update(graphics.attrs.id, {
          content: graphics.attrs.content,
          width: graphics.attrs.width,
          height: graphics.attrs.height,
        } as any);
      }
    }
    if (updateSuccess) {
      transaction.updateParentSize(matchGraphicsArr);
      transaction.commit('Update Text Content');
    }
    return updateSuccess;
  },
};
