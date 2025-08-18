/**
 * 菜单管理器 - 负责应用菜单的创建和管理
 * @description 管理应用程序菜单、上下文菜单、快捷键等功能
 * @author 开发团队
 */
import { Menu, BrowserWindow } from 'electron';
import { logger } from '../utils/logger';

/**
 * 菜单动作接口
 */
export interface MenuActions {
  // 文件菜单
  onNewProject?: () => void;
  onOpenProject?: () => void;
  onSaveProject?: () => void;
  onSaveAsProject?: () => void;
  onImportProject?: () => void;
  onExport?: () => void;
  onRecentProjects?: (projectPath: string) => void;
  onQuit?: () => void;

  // 编辑菜单
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;

  // 视图菜单
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomToFit?: () => void;
  onActualSize?: () => void;
  onFitToScreen?: () => void;
  onToggleRuler?: () => void;
  onToggleGuides?: () => void;
  onToggleGrid?: () => void;
  onToggleFullscreen?: () => void;
  onToggleDevTools?: () => void;

  // 工具菜单
  onSelectTool?: () => void;
  onTextTool?: () => void;
  onBrushTool?: () => void;
  onShapeTool?: () => void;
  onImageTool?: () => void;
  onCropTool?: () => void;

  // 帮助菜单
  onAbout?: () => void;
  onHelp?: () => void;
  onCheckUpdates?: () => void;
  onReportIssue?: () => void;
}

/**
 * 菜单配置接口
 */
export interface MenuConfig {
  enableFileMenu: boolean;
  enableEditMenu: boolean;
  enableViewMenu: boolean;
  enableToolsMenu: boolean;
  enableWindowMenu: boolean;
  enableHelpMenu: boolean;
  recentProjectsLimit: number;
  enableDeveloperMenu: boolean;
}

/**
 * 默认菜单配置
 */
const DEFAULT_MENU_CONFIG: MenuConfig = {
  enableFileMenu: true,
  enableEditMenu: true,
  enableViewMenu: true,
  enableToolsMenu: true,
  enableWindowMenu: true,
  enableHelpMenu: true,
  recentProjectsLimit: 10,
  enableDeveloperMenu: process.env['NODE_ENV'] === 'development',
};

/**
 * 菜单管理器类
 * @description 提供完整的应用菜单管理功能
 */
export class MenuManager {
  private config: MenuConfig;
  private actions: MenuActions = {};
  private recentProjects: string[] = [];
  private currentMenu: Menu | null = null;

  constructor(config: Partial<MenuConfig> = {}) {
    this.config = { ...DEFAULT_MENU_CONFIG, ...config };
  }

  /**
   * 创建应用程序菜单
   */
  public createApplicationMenu(actions: MenuActions): void {
    this.actions = actions;
    
    const template: Electron.MenuItemConstructorOptions[] = [];

    // 文件菜单
    if (this.config.enableFileMenu) {
      template.push(this.createFileMenu());
    }

    // 编辑菜单
    if (this.config.enableEditMenu) {
      template.push(this.createEditMenu());
    }

    // 视图菜单
    if (this.config.enableViewMenu) {
      template.push(this.createViewMenu());
    }

    // 工具菜单
    if (this.config.enableToolsMenu) {
      template.push(this.createToolsMenu());
    }

    // 窗口菜单
    if (this.config.enableWindowMenu) {
      template.push(this.createWindowMenu());
    }

    // 开发者菜单
    if (this.config.enableDeveloperMenu) {
      template.push(this.createDeveloperMenu());
    }

    // 帮助菜单
    if (this.config.enableHelpMenu) {
      template.push(this.createHelpMenu());
    }

    this.currentMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(this.currentMenu);

    logger.info('[menu-manager] 应用程序菜单已创建');
  }

  /**
   * 创建上下文菜单
   */
  public createContextMenu(options: {
    canCut?: boolean;
    canCopy?: boolean;
    canPaste?: boolean;
    canDelete?: boolean;
    canSelectAll?: boolean;
    customItems?: Electron.MenuItemConstructorOptions[];
  }): Menu {
    const template: Electron.MenuItemConstructorOptions[] = [];

    // 基础编辑操作
    if (options.canCut) {
      template.push({
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        click: this.actions.onCut ?? (() => {}),
      });
    }

    if (options.canCopy) {
      template.push({
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        click: this.actions.onCopy ?? (() => {}),
      });
    }

    if (options.canPaste) {
      template.push({
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        click: this.actions.onPaste ?? (() => {}),
      });
    }

    if (options.canDelete) {
      if (template.length > 0) template.push({ type: 'separator' });
      template.push({
        label: '删除',
        accelerator: 'Delete',
        click: this.actions.onDelete ?? (() => {}),
      });
    }

    if (options.canSelectAll) {
      if (template.length > 0) template.push({ type: 'separator' });
      template.push({
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        click: this.actions.onSelectAll ?? (() => {}),
      });
    }

    // 自定义菜单项
    if (options.customItems && options.customItems.length > 0) {
      if (template.length > 0) template.push({ type: 'separator' });
      template.push(...options.customItems);
    }

    return Menu.buildFromTemplate(template);
  }

  /**
   * 显示上下文菜单
   */
  public showContextMenu(window: BrowserWindow, options: Parameters<typeof this.createContextMenu>[0]): void {
    const menu = this.createContextMenu(options);
    menu.popup({ window });
  }

  /**
   * 添加最近项目
   */
  public addRecentProject(projectPath: string): void {
    // 移除已存在的项目
    this.recentProjects = this.recentProjects.filter(path => path !== projectPath);
    
    // 添加到开头
    this.recentProjects.unshift(projectPath);
    
    // 限制数量
    if (this.recentProjects.length > this.config.recentProjectsLimit) {
      this.recentProjects = this.recentProjects.slice(0, this.config.recentProjectsLimit);
    }

    // 重新创建菜单以更新最近项目列表
    this.createApplicationMenu(this.actions);
    
    logger.debug('[menu-manager] 添加最近项目:', projectPath);
  }

  /**
   * 清除最近项目
   */
  public clearRecentProjects(): void {
    this.recentProjects = [];
    this.createApplicationMenu(this.actions);
    logger.info('[menu-manager] 已清除最近项目列表');
  }

  /**
   * 更新菜单状态
   */
  public updateMenuState(state: {
    canUndo?: boolean;
    canRedo?: boolean;
    canCut?: boolean;
    canCopy?: boolean;
    canPaste?: boolean;
    canDelete?: boolean;
    hasSelection?: boolean;
    zoomLevel?: number;
  }): void {
    if (!this.currentMenu) return;

    // 这里可以根据状态更新菜单项的启用/禁用状态
    // 由于Electron的限制，需要重新创建菜单来更新状态
    logger.debug('[menu-manager] 更新菜单状态:', state);
  }

  /**
   * 获取菜单配置
   */
  public getConfig(): MenuConfig {
    return { ...this.config };
  }

  /**
   * 更新菜单配置
   */
  public updateConfig(newConfig: Partial<MenuConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 重新创建菜单
    if (Object.keys(this.actions).length > 0) {
      this.createApplicationMenu(this.actions);
    }
    
    logger.info('[menu-manager] 菜单配置已更新');
  }

  /**
   * 清理菜单管理器
   */
  public cleanup(): void {
    this.currentMenu = null;
    this.actions = {};
    this.recentProjects = [];
    logger.info('[menu-manager] 菜单管理器已清理');
  }

  // 私有方法

  /**
   * 创建文件菜单
   */
  private createFileMenu(): Electron.MenuItemConstructorOptions {
    const submenu: Electron.MenuItemConstructorOptions[] = [
      {
        label: '新建项目',
        accelerator: 'CmdOrCtrl+N',
        click: this.actions.onNewProject ?? (() => {}),
      },
      {
        label: '打开项目',
        accelerator: 'CmdOrCtrl+O',
        click: this.actions.onOpenProject ?? (() => {}),
      },
      { type: 'separator' },
      {
        label: '保存项目',
        accelerator: 'CmdOrCtrl+S',
        click: this.actions.onSaveProject ?? (() => {}),
      },
      {
        label: '另存为',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: this.actions.onSaveAsProject ?? (() => {}),
      },
      { type: 'separator' },
      {
        label: '导入项目',
        click: this.actions.onImportProject ?? (() => {}),
      },
      {
        label: '导出',
        accelerator: 'CmdOrCtrl+E',
        click: this.actions.onExport ?? (() => {})  ,
      },
    ];

    // 添加最近项目
    if (this.recentProjects.length > 0) {
      submenu.push({ type: 'separator' });
      submenu.push({
        label: '最近项目',
        submenu: this.recentProjects.map(projectPath => ({
          label: projectPath,
          click: () => this.actions.onRecentProjects?.(projectPath) ?? (() => {}),
        })),
      });
    }

    submenu.push({ type: 'separator' });
    submenu.push({
      label: '退出',
      accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
      click: this.actions.onQuit ?? (() => {}),
    });

    return {
      label: '文件',
      submenu,
    };
  }

  /**
   * 创建编辑菜单
   */
  private createEditMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          click: this.actions.onUndo ?? (() => {}),
        },
        {
          label: '重做',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: this.actions.onRedo ?? (() => {}),
        },
        { type: 'separator' },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          click: this.actions.onCut ?? (() => {}),
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          click: this.actions.onCopy ?? (() => {}),
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          click: this.actions.onPaste ?? (() => {}),
        },
        { type: 'separator' },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          click: this.actions.onSelectAll ?? (() => {}),
        },
        {
          label: '删除',
          accelerator: 'Delete',
          click: this.actions.onDelete ?? (() => {}),
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+D',
          click: this.actions.onDuplicate ?? (() => {}),
        },
      ],
    };
  }

  /**
   * 创建视图菜单
   */
  private createViewMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: '视图',
      submenu: [
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+Plus',
          click: this.actions.onZoomIn ?? (() => {}),
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: this.actions.onZoomOut ?? (() => {}) ,
        },
        {
          label: '实际大小',
          accelerator: 'CmdOrCtrl+0',
          click: this.actions.onActualSize ?? (() => {}),
        },
        {
          label: '适应屏幕',
          accelerator: 'CmdOrCtrl+Shift+0',
          click: this.actions.onFitToScreen ?? (() => {}),
        },
        { type: 'separator' },
        {
          label: '显示/隐藏标尺',
          accelerator: 'CmdOrCtrl+R',
          click: this.actions.onToggleRuler ?? (() => {}),
        },
        {
          label: '显示/隐藏参考线',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: this.actions.onToggleGuides ?? (() => {}),
        },
        {
          label: '显示/隐藏网格',
          accelerator: 'CmdOrCtrl+G',
          click: this.actions.onToggleGrid ?? (() => {}),
        },
        { type: 'separator' },
        {
          label: '全屏',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: this.actions.onToggleFullscreen ?? (() => {}),
        },
      ],
    };
  }

  /**
   * 创建工具菜单
   */
  private createToolsMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: '工具',
      submenu: [
        {
          label: '选择工具',
          accelerator: 'V',
          click: this.actions.onSelectTool ?? (() => {}),
        },
        {
          label: '文本工具',
          accelerator: 'T',
          click: this.actions.onTextTool ?? (() => {}),
        },
        {
          label: '画笔工具',
          accelerator: 'B',
          click: this.actions.onBrushTool ?? (() => {}),
        },
        {
          label: '形状工具',
          accelerator: 'R',
          click: this.actions.onShapeTool ?? (() => {}),
        },
        {
          label: '图片工具',
          accelerator: 'I',
          click: this.actions.onImageTool ?? (() => {}),
        },
        {
          label: '裁剪工具',
          accelerator: 'C',
          click: this.actions.onCropTool ?? (() => {})  ,
        },
      ],
    };
  }

  /**
   * 创建窗口菜单
   */
  private createWindowMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize',
        },
        {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          role: 'close',
        },
      ],
    };
  }

  /**
   * 创建开发者菜单
   */
  private createDeveloperMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: '开发者',
      submenu: [
        {
          label: '切换开发者工具',
          accelerator: process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
          click: this.actions.onToggleDevTools ?? (() => {}),
        },
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: (_menuItem, browserWindow) => {
            if (browserWindow) browserWindow.reload();
          },
        },
        {
          label: '强制重新加载',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: (_menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.reloadIgnoringCache();
            }
          },
        },
      ],
    };
  }

  /**
   * 创建帮助菜单
   */
  private createHelpMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: '帮助',
      submenu: [
        {
          label: '帮助文档',
          click: this.actions.onHelp ?? (() => {}),
        },
        {
          label: '检查更新',
          click: this.actions.onCheckUpdates ?? (() => {}),
        },
        {
          label: '报告问题',
          click: this.actions.onReportIssue ?? (() => {}),
        },
        { type: 'separator' },
        {
          label: '关于',
          click: this.actions.onAbout ?? (() => {}),
        },
      ],
    };
  }
}