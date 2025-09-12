import { type IMatrixArr, type IRect, normalizeRect } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import { GAssetForgeRect } from '../graphics';
import { PaintType } from '../paint';
import { SnapHelper } from '../snap';
import { getDeepFrameAtPoint } from '../utils';
import { DrawGraphicsTool } from './tool_draw_graphics';
import { type ITool } from './type';

interface ImgData {
  url: string;
  name: string;
}

const uploadImg = () => {
  return new Promise<ImgData>((resolve) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // only image

    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setTimeout(() => {
          resolve({ url: src, name: file.name });
        });
      };
      reader.readAsDataURL(file);
    };

    fileInput.click();
  });
};

const TYPE = 'drawImg';
const HOTKEY = '';

export class DrawImgTool extends DrawGraphicsTool implements ITool {
  static override readonly type = TYPE;
  static override readonly hotkey = HOTKEY;
  override readonly type = TYPE;
  override readonly hotkey = HOTKEY;

  private imgData: ImgData | null = null;

  constructor(editor: GAssetForgeEditor) {
    super(editor);
    this.commandDesc = 'Add Image';
  }

  async enableActive() {
    try {
      const imgData = await uploadImg();
      await this.editor.imgManager.addImg(imgData.url);
      this.imgData = imgData;
      return true;
    } catch (error) {
      return false;
    }
  }

  protected override createGraphics(rect: IRect) {
    rect = normalizeRect(rect);
    const graphics = new GAssetForgeRect(
      {
        objectName: this.imgData!.name,
        width: rect.width,
        height: rect.height,
        fill: [
          {
            type: PaintType.Image,
            attrs: {
              src: this.imgData!.url,
            },
          },
        ],
      },
      {
        advancedAttrs: {
          x: rect.x,
          y: rect.y,
        },
        doc: this.editor.doc,
      },
    );
    return graphics;
  }

  override onEnd(e: PointerEvent) {
    if (this.editor.hostEventManager.isDraggingCanvasBySpace) {
      return;
    }

    const endPoint = SnapHelper.getSnapPtBySetting(
      this.editor.getSceneCursorXY(e),
      this.editor.setting,
    );

    // 如果用户只是点击没有拖拽，使用图片的原始尺寸
    if (this.drawingGraphics === null) {
      const { x: cx, y: cy } = endPoint;

      // 获取图片的原始尺寸
      const img = this.editor.imgManager.getImg(this.imgData!.url);
      let width = this.editor.setting.get('drawGraphDefaultWidth');
      let height = this.editor.setting.get('drawGraphDefaultHeight');

      if (img) {
        width = img.width;
        height = img.height;
      }

      const currentCanvas = this.editor.doc.getCurrentCanvas();
      if (!currentCanvas) {
        return;
      }

      const frame = getDeepFrameAtPoint(endPoint, currentCanvas.getChildren());
      const parent = frame || currentCanvas;

      this.drawingGraphics = this.createGraphics({
        x: cx - width / 2,
        y: cy - height / 2,
        width,
        height,
      });

      if (!this.drawingGraphics) {
        return;
      }

      this.editor.sceneGraph.addItems([this.drawingGraphics]);
      if (parent) {
        parent.insertChild(this.drawingGraphics);
      }
      if (frame) {
        const tf = [...this.drawingGraphics.attrs.transform] as IMatrixArr;
        this.drawingGraphics.setWorldTransform(tf);
      }
      this.editor.selectedElements.setItems([this.drawingGraphics]);
    }

    this.editor.render();
  }
}
