/**
 * 素材拖拽服务 - 处理素材拖拽到画布的逻辑
 */
import { IAssetMetadata } from '../components/AssetLibraryPanel/types';
import { assetLibraryService } from './AssetLibraryService';

/**
 * 拖拽数据类型
 */
export interface AssetDragData {
  type: 'asset';
  assetId: string;
  assetName: string;
  assetType: string;
  thumbnail?: string;
}

/**
 * 素材拖拽服务
 */
export class AssetDragDropService {
  private static instance: AssetDragDropService;

  static getInstance(): AssetDragDropService {
    if (!AssetDragDropService.instance) {
      AssetDragDropService.instance = new AssetDragDropService();
    }
    return AssetDragDropService.instance;
  }

  /**
   * 开始拖拽素材
   */
  startDrag(asset: IAssetMetadata, event: React.DragEvent): void {
    const dragData: AssetDragData = {
      type: 'asset',
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.fileType,
      thumbnail: asset.thumbnail,
    };

    // 设置拖拽数据
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';

    // 设置拖拽图像
    if (asset.thumbnail) {
      const img = new Image();
      img.src = asset.thumbnail;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 100;
          canvas.height = 100;
          ctx.drawImage(img, 0, 0, 100, 100);

          // 创建拖拽图像
          const dragImage = new Image();
          dragImage.src = canvas.toDataURL();
          event.dataTransfer.setDragImage(dragImage, 50, 50);
        }
      };
    }

    console.log('开始拖拽素材:', asset.name);
  }

  /**
   * 处理画布上的拖拽放置
   */
  async handleCanvasDrop(
    event: DragEvent,
    canvasPosition: { x: number; y: number },
    editor?: any, // GAssetForgeEditor 实例
  ): Promise<boolean> {
    try {
      const dragDataStr = event.dataTransfer?.getData('application/json');
      if (!dragDataStr) {
        return false;
      }

      const dragData: AssetDragData = JSON.parse(dragDataStr);
      if (dragData.type !== 'asset') {
        return false;
      }

      // 获取素材文件
      const fileBlob = await assetLibraryService.getAssetFile(dragData.assetId);
      if (!fileBlob) {
        console.error('无法获取素材文件:', dragData.assetId);
        return false;
      }

      // 记录素材使用
      await assetLibraryService.recordAssetUsage(dragData.assetId);

      // 创建图片对象URL
      const imageUrl = URL.createObjectURL(fileBlob);

      // 如果有编辑器实例，直接添加到画布
      if (editor) {
        await this.addImageToCanvas(
          editor,
          imageUrl,
          canvasPosition,
          dragData.assetName,
        );
      } else {
        // 否则触发自定义事件，让编辑器组件处理
        const customEvent = new CustomEvent('assetDropped', {
          detail: {
            imageUrl,
            position: canvasPosition,
            assetName: dragData.assetName,
            assetId: dragData.assetId,
          },
        });
        document.dispatchEvent(customEvent);
      }

      console.log('素材成功添加到画布:', dragData.assetName);
      return true;
    } catch (error) {
      console.error('处理素材拖拽失败:', error);
      return false;
    }
  }

  /**
   * 添加图片到画布
   */
  private async addImageToCanvas(
    editor: any,
    imageUrl: string,
    position: { x: number; y: number },
    name: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          // 计算合适的尺寸（限制最大尺寸）
          const maxSize = 300;
          let { width, height } = img;

          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }

          // 使用编辑器的工具管理器添加图片
          if (editor.toolManager) {
            // 切换到选择工具
            editor.toolManager.setActiveTool('Select');

            // 创建图片图形对象
            // 这里需要根据实际的编辑器API调整
            const imageGraphics = editor.createImageGraphics({
              x: position.x - width / 2,
              y: position.y - height / 2,
              width,
              height,
              src: imageUrl,
              objectName: name,
            });

            if (imageGraphics) {
              // 添加图形对象到当前画布
              const currentCanvas = editor.doc.getCurrentCanvas();
              if (currentCanvas) {
                if (currentCanvas) {
                  currentCanvas.insertChild(imageGraphics);
                  editor.render();
                }
              } else {
                console.error('无法获取有效画布，无法添加图形对象');
              }
            }
          }

          // 清理临时URL
          setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = imageUrl;
    });
  }

  /**
   * 检查是否为素材拖拽
   */
  isAssetDrag(event: DragEvent): boolean {
    try {
      const dragDataStr = event.dataTransfer?.getData('application/json');
      if (!dragDataStr) {
        return false;
      }

      const dragData = JSON.parse(dragDataStr);
      return dragData.type === 'asset';
    } catch {
      return false;
    }
  }

  /**
   * 获取拖拽的素材信息
   */
  getDragAssetInfo(event: DragEvent): AssetDragData | null {
    try {
      const dragDataStr = event.dataTransfer?.getData('application/json');
      if (!dragDataStr) {
        return null;
      }

      const dragData = JSON.parse(dragDataStr);
      return dragData.type === 'asset' ? dragData : null;
    } catch {
      return null;
    }
  }
}

// 导出单例实例
export const assetDragDropService = AssetDragDropService.getInstance();
