import { cloneDeep, debounce, noop } from '@g-asset-forge/common';

import { type GAssetForgeEditor } from '../editor';
import { GAssetForgeGraphics } from '../graphics';
import { Transaction } from '../transaction';

/**
 * move graphs by arrow key binding
 */
export class MoveGraphsKeyBinding {
  private unbindHandler = noop;
  private hadBound = false;
  private transaction: Transaction;

  constructor(private editor: GAssetForgeEditor) {
    this.transaction = new Transaction(editor);
  }

  bindKey() {
    if (this.hadBound) {
      console.warn(
        'MoveGraphsKeyBinding had already bound, please unbind first',
      );
      return;
    }
    this.hadBound = true;

    const editor = this.editor;
    let needRecordOriginAttrs = true;

    const recordDebounce = debounce((movedGraphicsArr: GAssetForgeGraphics[]) => {
      this.editor.controlHandleManager.showCustomHandles();
      needRecordOriginAttrs = true;

      for (const graphics of movedGraphicsArr) {
        this.transaction.update(graphics.attrs.id, {
          transform: cloneDeep(graphics.attrs.transform),
        });
      }

      this.editor.commandManager.enableRedoUndo();
      this.transaction.commit('Move elements by direction key');

      this.transaction = new Transaction(editor);
    }, editor.setting.get('moveElementsDelay'));

    const flushRecordDebounce = () => {
      recordDebounce.flush();
    };

    const pressed = {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      ArrowDown: false,
    };

    const checkPressed = () =>
      pressed.ArrowLeft ||
      pressed.ArrowRight ||
      pressed.ArrowUp ||
      pressed.ArrowDown;

    const handleKeydown = (event: KeyboardEvent) => {
      const movedGraphicsArr = editor.selectedElements.getItems();
      if (movedGraphicsArr.length === 0) return;

      if (event.key in pressed) {
        pressed[event.key as keyof typeof pressed] = true;
      }
      if (!checkPressed()) return;

      if (needRecordOriginAttrs) {
        for (const graphics of movedGraphicsArr) {
          this.transaction.recordOld(graphics.attrs.id, {
            transform: cloneDeep(graphics.attrs.transform),
          });
        }
        needRecordOriginAttrs = false;
      }

      let nudge = editor.setting.get('smallNudge');
      if (event.shiftKey) nudge = editor.setting.get('bigNudge');

      if (pressed.ArrowLeft) {
        GAssetForgeGraphics.dMove(movedGraphicsArr, -nudge, 0);
      }
      if (pressed.ArrowRight) {
        GAssetForgeGraphics.dMove(movedGraphicsArr, nudge, 0);
      }
      if (pressed.ArrowUp) {
        GAssetForgeGraphics.dMove(movedGraphicsArr, 0, -nudge);
      }
      if (pressed.ArrowDown) {
        GAssetForgeGraphics.dMove(movedGraphicsArr, 0, nudge);
      }

      this.transaction.updateParentSize(movedGraphicsArr);

      this.editor.commandManager.disableRedoUndo();
      this.editor.controlHandleManager.hideCustomHandles();
      recordDebounce(movedGraphicsArr);
      editor.render();
    };

    const handleKeyup = (e: KeyboardEvent) => {
      const key = e.key;
      if (key in pressed) {
        pressed[key as keyof typeof pressed] = false;
      }
    };

    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    this.editor.keybindingManager.register({
      key: [
        ...keys.map((keyCode) => ({ keyCode })),
        ...keys.map((keyCode) => ({ shiftKey: true, keyCode })),
      ],
      actionName: 'Move Elements',
      action: handleKeydown,
    });

    window.addEventListener('keyup', handleKeyup);
    editor.commandManager.on('beforeExecCmd', flushRecordDebounce);

    this.unbindHandler = () => {
      window.removeEventListener('keyup', handleKeyup);
      editor.commandManager.off('beforeExecCmd', flushRecordDebounce);
    };
  }

  destroy() {
    this.unbindHandler();
    this.hadBound = false;
  }
}
