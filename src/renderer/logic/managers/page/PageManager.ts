/**
 * 页面管理器 - 管理Suika画布页面的创建、删除、切换等操作
 * @description 基于Suika引擎的页面管理，提供完整的页面生命周期管理
 * @author 开发团队
 */

// 替换Node.js的EventEmitter为浏览器兼容的实现
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function) {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

import type { SuikaEditor } from '../../engines/suika';
import { addAndSwitchCanvasRecord, addCanvasAndRecord, switchCanvasRecord } from '../../engines/suika/core/service/page_service';

export interface Page {
  id: string;
  name: string;
  isActive: boolean;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageManagerEvents {
  pageAdded: (page: Page) => void;
  pageRemoved: (pageId: string) => void;
  pageRenamed: (pageId: string, newName: string) => void;
  pageActivated: (pageId: string, previousPageId?: string) => void;
  pagesReordered: (pageIds: string[]) => void;
}

/**
 * 页面管理器类
 * @description 管理Suika编辑器中的页面，包括创建、删除、重命名、切换等功能
 */
export class PageManager extends EventEmitter {
  private suikaEditor: SuikaEditor | null = null;
  private pages: Map<string, Page> = new Map();

  constructor() {
    super();
  }

  /**
   * 设置Suika编辑器实例
   * @param editor Suika编辑器实例
   */
  setSuikaEditor(editor: SuikaEditor | null) {
    if (this.suikaEditor) {
      // 清理之前的事件监听
      this.suikaEditor.doc.off('currentCanvasChange', this.handleCanvasChange);
    }

    this.suikaEditor = editor;

    if (editor) {
      // 监听画布切换事件
      editor.doc.on('currentCanvasChange', this.handleCanvasChange);
      
      // 初始化页面列表
      this.syncPagesFromSuika();
    }
  }

  /**
   * 处理画布切换事件
   */
  private handleCanvasChange = (canvasId: string, prevCanvasId?: string) => {
    this.updatePageActiveState(canvasId, prevCanvasId);
    this.emit('pageActivated', canvasId, prevCanvasId);
  };

  /**
   * 从Suika同步页面列表
   */
  private syncPagesFromSuika() {
    if (!this.suikaEditor) return;

    const canvases = this.suikaEditor.doc.graphicsStoreManager.getCanvasItems();
    const currentCanvasId = this.suikaEditor.doc.getCurrentCanvas()?.attrs.id;

    this.pages.clear();

    canvases.forEach(canvas => {
      const page: Page = {
        id: canvas.attrs.id,
        name: canvas.attrs.objectName || `page ${canvas.attrs.id}`,
        isActive: canvas.attrs.id === currentCanvasId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.pages.set(page.id, page);
    });
  }

  /**
   * 更新页面激活状态
   */
  private updatePageActiveState(activePageId: string, previousPageId?: string) {
    // 取消之前页面的激活状态
    if (previousPageId) {
      const prevPage = this.pages.get(previousPageId);
      if (prevPage) {
        prevPage.isActive = false;
        this.pages.set(previousPageId, prevPage);
      }
    }

    // 激活当前页面
    const currentPage = this.pages.get(activePageId);
    if (currentPage) {
      currentPage.isActive = true;
      currentPage.updatedAt = new Date();
      this.pages.set(activePageId, currentPage);
    }
  }

  /**
   * 获取所有页面
   * @returns 页面列表
   */
  getPages(): Page[] {
    return Array.from(this.pages.values()).sort((a, b) => {
      // 按创建时间排序
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * 获取当前激活的页面
   * @returns 当前页面或null
   */
  getCurrentPage(): Page | null {
    return Array.from(this.pages.values()).find(page => page.isActive) || null;
  }

  /**
   * 根据ID获取页面
   * @param pageId 页面ID
   * @returns 页面对象或null
   */
  getPageById(pageId: string): Page | null {
    return this.pages.get(pageId) || null;
  }

  /**
   * 创建新页面
   * @param name 页面名称
   * @param switchToNew 是否切换到新页面
   * @returns 新创建的页面
   */
  createPage(name?: string, switchToNew: boolean = true): Page | null {
    if (!this.suikaEditor) {
      console.warn('[PageManager] Suika编辑器未初始化');
      return null;
    }

    try {
      let canvas;
      if (switchToNew) {
        addAndSwitchCanvasRecord(this.suikaEditor, name);
        canvas = this.suikaEditor.doc.getCurrentCanvas();
      } else {
        canvas = addCanvasAndRecord(this.suikaEditor, name);
      }

      if (!canvas) {
        console.error('[PageManager] 创建画布失败');
        return null;
      }

      const page: Page = {
        id: canvas.attrs.id,
        name: canvas.attrs.objectName || name || `页面 ${canvas.attrs.id}`,
        isActive: switchToNew,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.pages.set(page.id, page);
      this.emit('pageAdded', page);

      return page;
    } catch (error) {
      console.error('[PageManager] 创建页面失败:', error);
      return null;
    }
  }

  /**
   * 删除页面
   * @param pageId 页面ID
   * @returns 是否删除成功
   */
  deletePage(pageId: string): boolean {
    if (!this.suikaEditor) {
      console.warn('[PageManager] Suika编辑器未初始化');
      return false;
    }

    const page = this.pages.get(pageId);
    if (!page) {
      console.warn(`[PageManager] 页面不存在: ${pageId}`);
      return false;
    }

    // 不能删除最后一个页面
    if (this.pages.size <= 1) {
      console.warn('[PageManager] 不能删除最后一个页面');
      return false;
    }

    try {
      const canvas = this.suikaEditor.doc.getGraphicsById(pageId);
      if (canvas) {
        // 如果删除的是当前页面，先切换到其他页面
        if (page.isActive) {
          const otherPages = this.getPages().filter(p => p.id !== pageId);
          if (otherPages.length > 0 && otherPages[0]) {
            this.switchToPage(otherPages[0].id);
          }
        }

        // 删除画布
        canvas.setDeleted(true);
        canvas.removeFromParent();
        
        this.pages.delete(pageId);
        this.emit('pageRemoved', pageId);

        console.log(`[PageManager] 删除页面: ${page.name} (${pageId})`);
        return true;
      }
    } catch (error) {
      console.error('[PageManager] 删除页面失败:', error);
    }

    return false;
  }

  /**
   * 重命名页面
   * @param pageId 页面ID
   * @param newName 新名称
   * @returns 是否重命名成功
   */
  renamePage(pageId: string, newName: string): boolean {
    if (!this.suikaEditor) {
      console.warn('[PageManager] Suika编辑器未初始化');
      return false;
    }

    const page = this.pages.get(pageId);
    if (!page) {
      console.warn(`[PageManager] 页面不存在: ${pageId}`);
      return false;
    }

    try {
      const canvas = this.suikaEditor.doc.getGraphicsById(pageId);
      if (canvas) {
        // 更新Suika画布名称
        canvas.updateAttrs({ objectName: newName });
        
        // 更新本地页面信息
        page.name = newName;
        page.updatedAt = new Date();
        this.pages.set(pageId, page);

        this.emit('pageRenamed', pageId, newName);

        console.log(`[PageManager] 重命名页面: ${pageId} -> ${newName}`);
        return true;
      }
    } catch (error) {
      console.error('[PageManager] 重命名页面失败:', error);
    }

    return false;
  }

  /**
   * 切换到指定页面
   * @param pageId 页面ID
   * @returns 是否切换成功
   */
  switchToPage(pageId: string): boolean {
    if (!this.suikaEditor) {
      console.warn('[PageManager] Suika编辑器未初始化');
      return false;
    }

    const page = this.pages.get(pageId);
    if (!page) {
      console.warn(`[PageManager] 页面不存在: ${pageId}`);
      return false;
    }

    if (page.isActive) {
      console.log(`[PageManager] 页面已激活: ${pageId}`);
      return true;
    }

    try {
      switchCanvasRecord(this.suikaEditor, pageId);
      console.log(`[PageManager] 切换到页面: ${page.name} (${pageId})`);
      return true;
    } catch (error) {
      console.error('[PageManager] 切换页面失败:', error);
      return false;
    }
  }

  /**
   * 复制页面
   * @param pageId 要复制的页面ID
   * @param newName 新页面名称
   * @returns 新创建的页面或null
   */
  duplicatePage(pageId: string, newName?: string): Page | null {
    if (!this.suikaEditor) {
      console.warn('[PageManager] Suika编辑器未初始化');
      return null;
    }

    const sourcePage = this.pages.get(pageId);
    if (!sourcePage) {
      console.warn(`[PageManager] 源页面不存在: ${pageId}`);
      return null;
    }

    try {
      // 创建新页面
      const finalName = newName || `${sourcePage.name} 副本`;
      const newPage = this.createPage(finalName, false);
      
      if (newPage) {
        // TODO: 复制页面内容
        // 这需要获取源页面的所有图层并复制到新页面
        console.log(`[PageManager] 复制页面: ${sourcePage.name} -> ${finalName}`);
      }

      return newPage;
    } catch (error) {
      console.error('[PageManager] 复制页面失败:', error);
      return null;
    }
  }

  /**
   * 获取页面数量
   * @returns 页面数量
   */
  getPageCount(): number {
    return this.pages.size;
  }

  /**
   * 清理资源
   */
  destroy() {
    if (this.suikaEditor) {
      this.suikaEditor.doc.off('currentCanvasChange', this.handleCanvasChange);
    }
    this.pages.clear();
    this.removeAllListeners();
  }
}

// 导出单例实例
export const pageManager = new PageManager();