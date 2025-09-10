const { app, Menu, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const isDev = process.env.NODE_ENV === 'development';
const { WindowManager } = require('./WindowManager.js');

// 创建窗口管理器实例
const windowManager = new WindowManager();
let mainWindow;

function createWindow() {
  // 使用窗口管理器创建主窗口
  // 注意：欢迎界面阶段不设置 devTools，这样窗口会以欢迎模式尺寸启动
  mainWindow = windowManager.createMainWindow({
    // 欢迎模式下固定尺寸，开发模式下可调整
    width: 480,
    height: 320,
    minWidth: 480,
    minHeight: 320,
    webPreferences: {
      devTools: true,
    },
  });

  // 加载应用的 index.html
  if (isDev) {
    // 开发环境：加载开发服务器
    mainWindow.loadURL('http://localhost:6167');
    // 开发模式下打开开发者工具
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    }
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // 当窗口加载完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 当窗口被关闭时发出
  mainWindow.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null;
  });

  // 设置应用菜单
  createMenu();
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new');
          },
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-open');
          },
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save');
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '切换开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '切换全屏' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();

  // 设置 IPC 处理器
  // 窗口控制 IPC 处理器
  ipcMain.handle('window:minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window:restore', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.restore();
    }
  });

  ipcMain.handle('window:close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  ipcMain.handle('window:isMaximized', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return { success: true, data: mainWindow.isMaximized() };
    }
    return { success: false, data: false };
  });

  // 窗口尺寸调整 IPC 处理器
  ipcMain.handle(
    'window:resize',
    (event, { width, height, resizable = true }) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setSize(width, height);
        mainWindow.setResizable(resizable);
        mainWindow.setMaximizable(resizable);
        mainWindow.setFullScreenable(resizable);
        return { success: true };
      }
      return { success: false };
    },
  );

  // 文件保存 IPC 处理器
  ipcMain.handle('file:save', async (event, { filename, data, directory }) => {
    try {
      // 确定保存目录
      let saveDirectory = directory;

      if (!saveDirectory) {
        // 默认保存到用户的文档目录下的 g-asset-forge-projects 文件夹
        const documentsPath = path.join(os.homedir(), 'Documents');
        saveDirectory = path.join(documentsPath, 'g-asset-forge-projects');

        // 确保目录存在
        try {
          await fs.access(saveDirectory);
        } catch (error) {
          // 目录不存在，创建它
          await fs.mkdir(saveDirectory, { recursive: true });
        }
      }

      // 构建完整的文件路径
      const filePath = path.join(saveDirectory, filename);

      // 保存文件
      await fs.writeFile(filePath, data);

      console.log(`文件保存成功: ${filePath}`);
      return {
        success: true,
        filePath: filePath,
        directory: saveDirectory,
      };
    } catch (error) {
      console.error('文件保存失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // 文件保存对话框 IPC 处理器
  ipcMain.handle('file:save-dialog', async (event, { filename, data }) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: '保存 GAF 文件',
        defaultPath: filename,
        filters: [
          { name: 'GAF 文件', extensions: ['gaf'] },
          { name: 'JSON 文件', extensions: ['json'] },
          { name: '所有文件', extensions: ['*'] },
        ],
        properties: ['createDirectory'],
      });

      if (!result.canceled && result.filePath) {
        // 保存文件到用户选择的路径
        await fs.writeFile(result.filePath, data);

        console.log(`文件保存成功: ${result.filePath}`);
        return {
          success: true,
          filePath: result.filePath,
        };
      } else {
        return {
          success: false,
          error: '用户取消了保存操作',
        };
      }
    } catch (error) {
      console.error('文件保存失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // 获取默认保存目录 IPC 处理器
  ipcMain.handle('file:get-default-directory', async () => {
    try {
      const documentsPath = path.join(os.homedir(), 'Documents');
      const defaultDirectory = path.join(
        documentsPath,
        'g-asset-forge-projects',
      );

      // 确保目录存在
      try {
        await fs.access(defaultDirectory);
      } catch (error) {
        await fs.mkdir(defaultDirectory, { recursive: true });
      }

      return {
        success: true,
        directory: defaultDirectory,
      };
    } catch (error) {
      console.error('获取默认目录失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // 文件读取 IPC 处理器
  ipcMain.handle('file:read', async (event, { filename, directory }) => {
    try {
      // 确定文件路径
      let filePath;

      if (directory) {
        filePath = path.join(directory, filename);
      } else {
        // 使用默认目录
        const documentsPath = path.join(os.homedir(), 'Documents');
        const defaultDirectory = path.join(
          documentsPath,
          'g-asset-forge-projects',
        );
        filePath = path.join(defaultDirectory, filename);
      }

      // 检查文件是否存在
      try {
        await fs.access(filePath);
      } catch (error) {
        return {
          success: false,
          error: '文件不存在',
        };
      }

      // 读取文件内容
      const content = await fs.readFile(filePath, 'utf8');

      console.log(`文件读取成功: ${filePath}`);
      return {
        success: true,
        content: content,
        filePath: filePath,
      };
    } catch (error) {
      console.error('文件读取失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // 文件删除 IPC 处理器
  ipcMain.handle('file:delete', async (event, { filename, directory }) => {
    try {
      // 确定文件路径
      let filePath;

      if (directory) {
        filePath = path.join(directory, filename);
      } else {
        // 使用默认目录
        const documentsPath = path.join(os.homedir(), 'Documents');
        const defaultDirectory = path.join(
          documentsPath,
          'g-asset-forge-projects',
        );
        filePath = path.join(defaultDirectory, filename);
      }

      // 检查文件是否存在
      try {
        await fs.access(filePath);
      } catch (error) {
        return {
          success: false,
          error: '文件不存在',
        };
      }

      // 删除文件
      await fs.unlink(filePath);

      console.log(`文件删除成功: ${filePath}`);
      return {
        success: true,
        filePath: filePath,
      };
    } catch (error) {
      console.error('文件删除失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });
});

// 当所有窗口都被关闭后退出
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
  // 绝大部分应用会重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
