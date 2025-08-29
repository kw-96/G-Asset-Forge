/**
 * 编辑器
 * 实现编辑器的逻辑
 * 提供了编辑器的初始化、激活、禁用、移动、结束等功能
 * 提供了编辑器的性能监控、调试工具等功能
 */

import { EventEmitter, genUuid } from '@g-asset-forge/common';
import { mergeBoxes } from '@g-asset-forge/geo';

import { CanvasDragger } from './canvas_dragger';
import { ClipboardManager } from './clipboard';
import { CommandManager } from './commands/command_manager';
import { ControlHandleManager } from './control_handle_manager';
import { CursorManger, type ICursor } from './cursor_manager';
import { GAssetForgeCanvas, type GraphicsAttrs } from './graphics';
import { GAssetForgeDocument } from './graphics/document';
import { GuideLineManager } from './guide_lines/guide_line_manager';
import { HostEventManager, MouseEventManager } from './host_event_manager';
import { ImgManager } from './Img_manager';
import { KeyBindingManager } from './key_binding_manager';
import { PathEditor } from './path_editor';
import { PerfMonitor } from './perf_monitor';
import { Ruler } from './ruler';
import { SceneGraph } from './scene/scene_graph';
import { SelectedBox } from './selected_box';
import { SelectedElements } from './selected_elements';
import { Setting, type SettingValue } from './setting';
import { TextEditor } from './text/text_editor';
import { ToolManager } from './tools';
import { type IChanges, type IEditorPaperData } from './type';
import {
  type CanvasStateManager,
  createCanvasStateManager,
} from './utils/canvasStateManager';
import { ViewportManager } from './viewport_manager';

interface IEditorOptions {
  containerElement: HTMLDivElement;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  showPerfMonitor?: boolean;
  userPreference?: Partial<SettingValue>;
}

interface Events {
  destroy(): void;
}

export class GAssetForgeEditor {
  containerElement: HTMLDivElement;
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  appVersion = 'g-asset-forge-editor_0.0.3';
  paperId: string;

  private emitter = new EventEmitter<Events>();

  // 画布状态管理器
  private canvasStateManager: CanvasStateManager;

  doc: GAssetForgeDocument;
  sceneGraph: SceneGraph;
  controlHandleManager: ControlHandleManager;

  setting: Setting;

  viewportManager: ViewportManager;

  canvasDragger: CanvasDragger;
  toolManager: ToolManager;
  commandManager: CommandManager;
  imgManager: ImgManager;

  cursorManager: CursorManger;
  mouseEventManager: MouseEventManager;
  keybindingManager: KeyBindingManager;
  hostEventManager: HostEventManager;
  clipboard: ClipboardManager;

  selectedElements: SelectedElements;
  selectedBox: SelectedBox;
  ruler: Ruler;
  guideLineManager: GuideLineManager;
  textEditor: TextEditor;
  pathEditor: PathEditor;

  perfMonitor: PerfMonitor;

  constructor(options: IEditorOptions) {
    this.containerElement = options.containerElement;
    this.canvasElement = document.createElement('canvas');
    this.containerElement.appendChild(this.canvasElement);
    this.ctx = this.canvasElement.getContext('2d')!;

    this.setting = new Setting(options.userPreference);
    if (options.offsetX) {
      this.setting.set('offsetX', options.offsetX);
    }
    if (options.offsetY) {
      this.setting.set('offsetY', options.offsetY);
    }

    // 初始化画布状态管理器
    this.canvasStateManager = createCanvasStateManager();
    this.canvasStateManager.setEditor(this);

    this.mouseEventManager = new MouseEventManager(this);
    this.keybindingManager = new KeyBindingManager(this);
    this.keybindingManager.bindEvent();

    this.sceneGraph = new SceneGraph(this);

    this.cursorManager = new CursorManger(this);
    this.viewportManager = new ViewportManager(this);

    this.commandManager = new CommandManager(this);
    this.imgManager = new ImgManager();

    this.selectedElements = new SelectedElements(this);
    this.selectedBox = new SelectedBox(this);
    this.ruler = new Ruler(this);
    this.guideLineManager = new GuideLineManager(this);

    this.controlHandleManager = new ControlHandleManager(this);
    this.controlHandleManager.bindEvents();

    this.textEditor = new TextEditor(this);
    this.pathEditor = new PathEditor(this);

    this.hostEventManager = new HostEventManager(this);
    this.hostEventManager.bindHotkeys();

    this.canvasDragger = new CanvasDragger(this);
    this.toolManager = new ToolManager(this);

    this.clipboard = new ClipboardManager(this);
    this.clipboard.bindEvents();

    this.imgManager.on('added', () => {
      this.render();
    });

    this.paperId = genUuid();

    this.doc = new GAssetForgeDocument({
      id: '0-0',
      objectName: 'Document',
      width: 0,
      height: 0,
    });
    this.doc.setEditor(this);

    const canvas = new GAssetForgeCanvas(
      {
        objectName: 'Page 1',
      },
      {
        doc: this.doc,
      },
    );

    // 确保画布被正确添加到存储管理器
    this.doc.graphicsStoreManager.add(canvas);
    this.doc.graphicsStoreManager.add(this.doc);

    this.sceneGraph.addItems([this.doc, canvas]);
    this.doc.insertChild(canvas);

    this.viewportManager.setViewportSize({
      width: options.width,
      height: options.height,
    });

    this.doc.setCurrentCanvas(canvas.attrs.id);

    this.perfMonitor = new PerfMonitor();
    if (options.showPerfMonitor) {
      this.perfMonitor.start(this.containerElement);
    }

    /**
     * setViewport 其实会修改 canvas 的宽高，浏览器的 DOM 更新是异步的，
     * 所以下面的 render 要异步执行
     */
    Promise.resolve().then(() => {
      this.render();
    });
  }

  setContents(data: IEditorPaperData) {
    // 检查编辑器是否已经完全初始化
    if (!this.doc || !this.sceneGraph) {
      console.warn('编辑器未完全初始化，延迟调用setContents');
      // 延迟执行，等待编辑器完全初始化
      setTimeout(() => this.setContents(data), 100);
      return;
    }

    // 先加载数据
    this.sceneGraph.load(data.data);
    this.commandManager.clearRecords();
    this.paperId = data.paperId ?? genUuid();

    // 检查是否有可用的画布
    const availableCanvases = this.doc.graphicsStoreManager.getCanvasItems();

    if (availableCanvases && availableCanvases.length > 0) {
      // 使用第一个可用的画布
      const firstCanvas = availableCanvases[0];
      this.doc.setCurrentCanvas(firstCanvas.attrs.id);
    } else if (!this.doc.getChildren().length) {
      // 如果没有画布，创建一个新的
      const canvas = new GAssetForgeCanvas(
        {
          objectName: 'Page 1',
        },
        {
          doc: this.doc,
        },
      );

      // 确保画布被正确添加到存储管理器
      this.doc.graphicsStoreManager.add(canvas);

      this.sceneGraph.addItems([canvas]);
      this.doc.insertChild(canvas);
      this.doc.setCurrentCanvas(canvas.attrs.id);
    }

    this.viewportManager.zoomToFit(1);
  }

  destroy() {
    try {
      // 检查是否已经被销毁
      if (!this.containerElement || !this.canvasElement) {
        console.warn('编辑器已经被销毁或未正确初始化');
        return;
      }

      // 检查canvasElement是否还在containerElement中
      if (this.containerElement.contains(this.canvasElement)) {
        this.containerElement.removeChild(this.canvasElement);
      } else {
        console.warn('canvasElement不在containerElement中，可能已经被移除');
      }

      // 清理其他资源
      this.textEditor.destroy();
      this.keybindingManager.destroy();
      this.hostEventManager.destroy();
      this.clipboard.destroy();
      this.canvasDragger.destroy();
      this.toolManager.unbindEvent();
      this.toolManager.destroy();
      this.perfMonitor.destroy();
      this.controlHandleManager.unbindEvents();

      // 发出销毁事件
      this.emitter.emit('destroy');

      // 清理引用
      this.canvasElement = null as any;
      this.ctx = null as any;
    } catch (error) {
      console.error('编辑器销毁过程中出现错误:', error);
    }
  }
  setCursor(cursor: ICursor) {
    this.cursorManager.setCursor(cursor);
  }
  getCursor() {
    return this.cursorManager.getCursor();
  }

  toScenePt(x: number, y: number, round = false) {
    return this.viewportManager.toScenePt(x, y, round);
  }
  toViewportPt(x: number, y: number) {
    return this.viewportManager.toViewportPt(x, y);
  }
  toSceneSize(size: number) {
    return this.viewportManager.toSceneSize(size);
  }
  toViewportSize(size: number) {
    return this.viewportManager.toViewportSize(size);
  }
  /** get cursor viewport xy */
  getCursorXY(event: { clientX: number; clientY: number }) {
    return {
      x: event.clientX - this.setting.get('offsetX'),
      y: event.clientY - this.setting.get('offsetY'),
    };
  }
  /** get cursor scene xy */
  getSceneCursorXY(event: { clientX: number; clientY: number }, round = false) {
    const { x, y } = this.getCursorXY(event);
    return this.toScenePt(x, y, round);
  }
  render() {
    this.sceneGraph.render();
  }

  getCanvasChildrenBbox() {
    const canvasGraphics = this.canvasStateManager.getCurrentCanvas();
    if (!canvasGraphics) {
      return null;
    }
    const children = canvasGraphics
      .getChildren()
      .filter((item) => item.isVisible());
    if (children.length === 0) return null;
    return mergeBoxes(children.map((item) => item.getBbox()));
  }

  applyChanges(changes: IChanges) {
    const addedGraphicsArr: GraphicsAttrs[] = [];
    for (const [, attrs] of changes.added) {
      addedGraphicsArr.push(attrs);
    }
    this.sceneGraph.load(addedGraphicsArr, true);

    for (const [id, partialAttrs] of changes.update) {
      const graphics = this.doc.getGraphicsById(id);
      if (!graphics) {
        console.warn(`graphics ${id} is not exist`);
        continue;
      }
      graphics.updateAttrs(partialAttrs);
    }

    for (const id of changes.deleted) {
      const graphics = this.doc.getGraphicsById(id);
      if (!graphics) {
        console.warn(`graphics ${id} is not exist`);
        continue;
      }
      graphics.setDeleted(true);
      graphics.removeFromParent();
    }
  }

  on<T extends keyof Events>(eventName: T, listener: Events[T]) {
    this.emitter.on(eventName, listener);
  }
  off<T extends keyof Events>(eventName: T, listener: Events[T]) {
    this.emitter.off(eventName, listener);
  }
}
