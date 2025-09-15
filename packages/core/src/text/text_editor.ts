/**
 * 文本编辑器
 * 实现文本编辑器的逻辑
 * 提供了文本编辑器的初始化、激活、禁用、移动、结束等功能
 * 提供了文本编辑器的性能监控、调试工具等功能
 */

import { getContentLength, sliceContent } from '@g-asset-forge/common';
import { calcTextSize, type IPoint } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import { GAssetForgeText, type IDrawInfo, type TextAttrs } from '../graphics';
import { type IMousemoveEvent } from '../host_event_manager';
import { removeGraphicsAndRecord } from '../service/remove_service';
import { Transaction } from '../transaction';
import { type IRange, RangeManager } from './range_manager';

const defaultInputStyle = {
  position: 'fixed',
  width: '1px',
  zIndex: '-1',
  margin: 0,
  padding: 0,
  border: 0,
  outline: 0,
  opacity: 0,
} as const;

export class TextEditor {
  private inputDom: HTMLInputElement;
  private textGraphics: GAssetForgeText | null = null;
  private rangeManager: RangeManager;
  private _active = false;
  private transaction!: Transaction;

  // 事件监听器引用，用于清理
  private mouseEventHandlers: {
    onStart: (event: IMousemoveEvent) => void;
    onDrag: (event: IMousemoveEvent) => void;
    onUpdateCursor: (event: IMousemoveEvent) => void;
  } | null = null;

  // 画布状态管理器

  constructor(private editor: GAssetForgeEditor) {
    this.rangeManager = new RangeManager(editor);

    this.inputDom = this.createInputDom();
    this.inactive();
    this.bindEvent();

    // 确保输入框添加到正确的容器
    this.appendInputToContainer();
  }

  public appendInputToContainer() {
    try {
      // 获取容器元素
      let containerElement: HTMLElement = this.editor.containerElement;

      // 如果容器元素无效，尝试使用body作为备选
      if (!containerElement || !document.body.contains(containerElement)) {
        console.warn('TextEditor: 编辑器容器无效，使用document.body作为备选');
        containerElement = document.body;
      }

      // 如果输入框已经在目标容器中，无需重复添加
      if (containerElement.contains(this.inputDom)) {
        return;
      }

      // 如果输入框在其他容器中，先移除
      if (this.inputDom.parentElement) {
        this.inputDom.parentElement.removeChild(this.inputDom);
      }

      // 添加到目标容器
      containerElement.appendChild(this.inputDom);
    } catch (error) {
      console.error('TextEditor: 添加输入框到容器失败', error);
      // 备选方案：添加到body
      try {
        if (this.inputDom.parentElement) {
          this.inputDom.parentElement.removeChild(this.inputDom);
        }
        document.body.appendChild(this.inputDom);
      } catch (bodyError) {
        console.error('TextEditor: 添加输入框到body也失败', bodyError);
      }
    }
  }

  private createInputDom() {
    const inputDom = document.createElement('input');
    inputDom.tabIndex = 0; // 修复：使用0而不是-1，确保能正常获得焦点
    Object.assign(inputDom.style, defaultInputStyle);
    return inputDom;
  }

  isEditorInputDom(dom: HTMLElement) {
    return dom === this.inputDom;
  }

  getTextGraphics() {
    return this.textGraphics;
  }

  isActive() {
    return this._active;
  }

  active(params: {
    textGraphics?: GAssetForgeText;
    pos: IPoint;
    range?: IRange;
  }) {
    this._active = true;
    this.editor.controlHandleManager.enableTransformControl = false;
    this.editor.selectedBox.enableDrawSizeIndicator = false;
    this.transaction = new Transaction(this.editor);

    let textGraphics = params.textGraphics;

    if (!params.textGraphics) {
      const fontSize = this.editor.setting.get('defaultFontSize');
      const defaultFontFamily = this.editor.setting.get('defaultFontFamily');
      textGraphics = new GAssetForgeText(
        {
          objectName: '',
          content: '',
          fontSize,
          fontFamily: defaultFontFamily,
          width: 0,
          height: fontSize,
        },
        {
          advancedAttrs: params.pos,
          doc: this.editor.doc,
        },
      );
      this.textGraphics = textGraphics;

      this.editor.sceneGraph.addItems([textGraphics as any]);
      const currentCanvas = this.editor.doc.getCurrentCanvas();
      if (currentCanvas) {
        currentCanvas.insertChild(textGraphics as any);
      } else {
        console.error('无法获取当前画布，无法插入文本图形');
        this.inactive();
        return;
      }
    }
    this.textGraphics = textGraphics!;
    this.editor.selectedElements.setItems([textGraphics! as any]);

    this.transaction.recordOld<TextAttrs>(textGraphics!.attrs.id, {
      content: textGraphics!.attrs.content,
      width: textGraphics!.attrs.width,
    });

    if (params.range) {
      this.rangeManager.setRange(params.range);
    } else {
      const rangeStart = textGraphics!.getContentLength();
      this.rangeManager.setRange({
        start: rangeStart,
        end: rangeStart,
      });
    }

    const cursorPos = this.editor.mouseEventManager.getCursorPos();
    if (cursorPos) {
      this.updateCursor(cursorPos);
    }

    // 简单聚焦输入框
    this.inputDom.focus();

    this.editor.render();
  }

  inactive() {
    this._active = false;

    if (this.textGraphics) {
      if (!this.textGraphics.attrs.content) {
        removeGraphicsAndRecord(this.editor, [this.textGraphics as any]);
      } else {
        this.transaction.update<TextAttrs>(this.textGraphics.attrs.id, {
          content: this.textGraphics.attrs.content,
          width: this.textGraphics.attrs.width,
        });
        this.transaction.updateParentSize([this.textGraphics] as any);
        this.transaction.commit('update text content');
      }
      this.textGraphics = null;
    }

    this.editor.controlHandleManager.enableTransformControl = true;
    this.editor.selectedBox.enableDrawSizeIndicator = true;
  }

  static updateTextContentAndResize(
    textGraphics: GAssetForgeText,
    content: string,
  ) {
    const { width, height } = calcTextSize(content, {
      fontSize: textGraphics.attrs.fontSize,
      fontFamily: textGraphics.attrs.fontFamily,
    });
    textGraphics.updateAttrs({ content, width, height });
  }

  private bindEvent() {
    let composingText = '';
    let leftContentWhenComposing = '';
    let rightContentWhenComposing = '';

    const inputDom = this.inputDom;

    inputDom.addEventListener('input', (_e) => {
      const e = _e as InputEvent;

      const textGraphics = this.textGraphics;
      if (!textGraphics) return;

      if (e.isComposing) {
        if (!composingText) {
          const { rangeLeft, rangeRight } = this.rangeManager.getSortedRange();
          const content = textGraphics.attrs.content;
          leftContentWhenComposing = sliceContent(content, 0, rangeLeft);
          rightContentWhenComposing = sliceContent(content, rangeRight);
        }
        composingText = e.data ?? '';
      } else {
        composingText = '';
        leftContentWhenComposing = '';
        rightContentWhenComposing = '';
      }
      // Not IME input, directly add to textGraphics
      if (!e.isComposing && e.data) {
        const { rangeLeft, rangeRight } = this.rangeManager.getSortedRange();

        const content = textGraphics.attrs.content;
        const newContent =
          sliceContent(content, 0, rangeLeft) +
          e.data +
          sliceContent(content, rangeRight);

        TextEditor.updateTextContentAndResize(textGraphics, newContent);
        const dataLength = getContentLength(e.data);
        this.rangeManager.setRange({
          start: rangeLeft + dataLength,
          end: rangeLeft + dataLength,
        });
        this.editor.render();
      } else if (e.isComposing) {
        const newContent =
          leftContentWhenComposing + composingText + rightContentWhenComposing;
        TextEditor.updateTextContentAndResize(textGraphics, newContent);
        const newRangeStart =
          getContentLength(leftContentWhenComposing) +
          getContentLength(composingText);
        this.rangeManager.setRange({
          start: newRangeStart,
          end: newRangeStart,
        });
        this.editor.render();
      }
    });

    inputDom.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.inactive();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const textGraphics = this.textGraphics;
        if (!textGraphics) return;
        if (!textGraphics.attrs.content) return;

        let { rangeLeft, rangeRight } = this.rangeManager.getSortedRange();
        const isSelected = rangeLeft !== rangeRight;

        if (!isSelected) {
          rangeLeft = e.key === 'Backspace' ? rangeLeft - 1 : rangeLeft;
          rangeRight = e.key === 'Backspace' ? rangeRight : rangeRight + 1;
        }

        const content = textGraphics.attrs.content;
        const leftContent = sliceContent(content, 0, rangeLeft);
        const rightContent = sliceContent(content, rangeRight);
        const newContent = leftContent + rightContent;
        TextEditor.updateTextContentAndResize(textGraphics, newContent);

        if (isSelected) {
          this.rangeManager.setRange({
            start: rangeLeft,
            end: rangeLeft,
          });
        } else if (e.key === 'Backspace') {
          this.rangeManager.moveLeft();
        }
        this.editor.render();
      } else if (e.key === 'ArrowLeft') {
        if (e.shiftKey) {
          this.rangeManager.moveRangeEnd(-1);
        } else {
          this.rangeManager.moveLeft();
        }
        this.editor.render();
      } else if (e.key === 'ArrowRight') {
        if (e.shiftKey) {
          this.rangeManager.moveRangeEnd(1);
        } else {
          this.rangeManager.moveRight();
        }
        this.editor.render();
      }
      // select all
      else if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
        if (this.textGraphics) {
          this.rangeManager.setRange({
            start: 0,
            end: this.textGraphics.getContentLength(),
          });
          this.editor.render();
        }
      }
      // copy
      else if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        if (!this.textGraphics) return;
        const { rangeLeft, rangeRight } = this.rangeManager.getSortedRange();
        const content = sliceContent(
          this.textGraphics.attrs.content,
          rangeLeft,
          rangeRight,
        );

        if (content) {
          navigator.clipboard.writeText(content);
        }
      }
      // cut
      else if (e.key === 'x' && (e.metaKey || e.ctrlKey)) {
        if (!this.textGraphics) return;
        const { rangeLeft, rangeRight } = this.rangeManager.getSortedRange();
        const content = sliceContent(
          this.textGraphics.attrs.content,
          rangeLeft,
          rangeRight,
        );
        if (content) {
          navigator.clipboard.writeText(content);
        }

        const newContent =
          sliceContent(this.textGraphics.attrs.content, 0, rangeLeft) +
          sliceContent(this.textGraphics.attrs.content, rangeRight);
        TextEditor.updateTextContentAndResize(this.textGraphics, newContent);

        this.rangeManager.setRange({
          start: rangeLeft,
          end: rangeLeft,
        });
        this.editor.render();
      }
    });
    inputDom.addEventListener('blur', () => {
      this.inactive();
    });

    inputDom.addEventListener('compositionend', () => {
      composingText = '';
      leftContentWhenComposing = '';
      rightContentWhenComposing = '';
    });

    /****** bind mouse events *******/

    // set text editor cursor line
    const onStart = (event: IMousemoveEvent) => {
      if (
        !this.isActive() ||
        this.editor.canvasDragger.isActive() ||
        !this.textGraphics
      )
        return;

      const mousePt = event.pos;

      if (!this.textGraphics.hitTest(mousePt)) return;
      event.nativeEvent.preventDefault();

      const cursorIndex = this.textGraphics.getCursorIndex(mousePt);
      this.rangeManager.setRange({
        start: cursorIndex,
        end: cursorIndex,
      });
      this.editor.render();
    };

    // select range end by mouse drag
    const onDrag = (event: IMousemoveEvent) => {
      if (
        !this.isActive() ||
        this.editor.canvasDragger.isActive() ||
        !this.textGraphics
      ) {
        return;
      }

      const mousePt = event.pos;
      const cursorIndex = this.textGraphics.getCursorIndex(mousePt);
      this.rangeManager.setRangeEnd(cursorIndex);
      this.editor.render();
    };

    // update cursor
    const onUpdateCursor = (event: IMousemoveEvent) => {
      this.updateCursor(event.pos);
    };

    // 保存事件处理器引用，用于清理
    this.mouseEventHandlers = {
      onStart,
      onDrag,
      onUpdateCursor,
    };

    this.editor.mouseEventManager.on('start', onStart);
    this.editor.mouseEventManager.on('drag', onDrag);
    this.editor.mouseEventManager.on('move', onUpdateCursor);
    this.editor.mouseEventManager.on('end', onUpdateCursor);
  }

  updateCursor(mousePt: IPoint) {
    if (!this.isActive() || !this.textGraphics) return;
    if (this.textGraphics.hitTest(mousePt)) {
      this.editor.cursorManager.setCursor('text');
    } else {
      this.editor.cursorManager.setCursor('default');
    }
  }

  destroy() {
    // 清理鼠标事件监听器
    if (this.mouseEventHandlers) {
      this.editor.mouseEventManager.off(
        'start',
        this.mouseEventHandlers.onStart,
      );
      this.editor.mouseEventManager.off('drag', this.mouseEventHandlers.onDrag);
      this.editor.mouseEventManager.off(
        'move',
        this.mouseEventHandlers.onUpdateCursor,
      );
      this.editor.mouseEventManager.off(
        'end',
        this.mouseEventHandlers.onUpdateCursor,
      );
      this.mouseEventHandlers = null;
    }

    this.inputDom.remove();
    this._active = false;
  }

  drawRange(drawInfo: IDrawInfo) {
    if (!this.isActive()) return;
    const editor = this.editor;

    const zoom = editor.viewportManager.getZoom();
    const fontSize = editor.setting.get('defaultFontSize');
    const inputDomHeight = fontSize * zoom;

    const textGraphics = this.textGraphics;
    if (!textGraphics) return;

    const { topInViewport, bottomInViewport, rightInViewport } =
      this.rangeManager.getCursorLinePos(textGraphics);

    const canvasOffsetX = editor.setting.get('offsetX');
    const canvasOffsetY = editor.setting.get('offsetY');

    const styles = {
      left: bottomInViewport.x + canvasOffsetX + 'px',
      top: bottomInViewport.y - inputDomHeight + canvasOffsetY + 'px',
      height: `${inputDomHeight}px`,
      fontSize: `${inputDomHeight}px`,
    } as const;
    Object.assign(this.inputDom.style, styles);

    this.rangeManager.draw(
      drawInfo,
      topInViewport,
      bottomInViewport,
      rightInViewport,
    );
  }
}
