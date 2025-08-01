# G-Asset Forge MVP功能规划 - 桌面应用版

## 🎯 技术架构定位
**G-Asset Forge** 是一个专为内网环境设计的桌面应用，采用以下技术架构：
- **应用类型**: 桌面应用 (Electron/Tauri)
- **部署环境**: 企业内网环境
- **数据存储**: 共享磁盘/本地文件系统
- **用户群体**: 内网用户，无需考虑公网访问

## 🎯 30天MVP核心功能定义

基于桌面应用的特性，MVP应当优先实现以下4个核心模块：

### **1️⃣ 基础画布系统** (Day 1-8)
**核心价值**: 提供稳定的设计画布基础

#### 必需功能
```typescript
interface CanvasSystem {
  // 画布管理
  createCanvas(width: number, height: number): Canvas;
  resizeCanvas(width: number, height: number): void;
  clearCanvas(): void;
  
  // 视图控制
  zoom(scale: number): void;          // 缩放 (50%-200%)
  pan(deltaX: number, deltaY: number): void;  // 平移
  fitToScreen(): void;                // 适应屏幕
  
  // 操作历史
  undo(): boolean;
  redo(): boolean;
  
  // 导出功能
  exportPNG(): Promise<Blob>;
  exportJPG(): Promise<Blob>;
}
```

#### 技术实现
- **引擎选择**: Fabric.js (稳定、文档完善)
- **画布尺寸**: 支持常见规格 (1080x1920, 750x1334等)
- **性能要求**: 60fps流畅操作，内存占用 < 100MB

### **2️⃣ 基础设计工具** (Day 9-16)
**核心价值**: 提供游戏素材制作必需的设计工具

#### 工具清单 (优先级排序)
```typescript
enum DesignTools {
  // P0 - 必须工具
  SELECT = 'select',      // 选择工具
  TEXT = 'text',          // 文本工具  
  IMAGE = 'image',        // 图片工具
  SHAPE = 'shape',        // 基础图形
  
  // P1 - 重要工具
  BRUSH = 'brush',        // 画笔工具
  CROP = 'crop',          // 裁剪工具
}

interface TextTool {
  addText(content: string): TextObject;
  editText(id: string, content: string): void;
  setFontFamily(id: string, font: string): void;
  setFontSize(id: string, size: number): void;
  setFontColor(id: string, color: string): void;
  setTextAlign(id: string, align: 'left'|'center'|'right'): void;
}

interface ImageTool {
  uploadImage(file: File): Promise<ImageObject>;
  resizeImage(id: string, width: number, height: number): void;
  cropImage(id: string, rect: Rect): void;
  setOpacity(id: string, opacity: number): void;
}
```

#### 预设资源库
- **字体库**: 5种常用字体 (思源黑体、Arial、微软雅黑等)
- **图形库**: 10种基础图形 (矩形、圆形、三角形、星形等)
- **颜色板**: 游戏行业常用色彩方案

### **3️⃣ 基础H5编辑器** (Day 17-24)
**核心价值**: 提供设计稿的图片导出功能

#### H5编辑器功能
```typescript
interface H5Editor {
  // 画布设置
  canvas: {
    width: number;
    height: number;
    background: string;
  };
  
  // 图片导出功能
  exportImage(options: ImageExportOptions): Promise<Blob>;
  
  // 导出预览
  previewExport(): string;          // 预览导出效果
}

interface ImageExportOptions {
  format: 'png' | 'jpg';             // 导出格式
  quality: number;                   // 图片质量 (1-100)
  scale: number;                     // 导出缩放比例
  transparent: boolean;              // 是否保持透明背景
  filename?: string;                 // 文件名
}
```

#### H5编辑器核心功能
- **自由画布**: 支持自定义尺寸设置
- **实时预览**: 所见即所得的画布显示
- **图片导出**: PNG/JPG格式高质量切图
- **导出控制**: 质量、缩放、透明度等参数控制

### **4️⃣ 基础素材库** (Day 25-30)
**核心价值**: 提供游戏行业常用的素材资源

#### 素材分类体系
```typescript
interface AssetLibrary {
  // 游戏素材分类
  categories: {
    backgrounds: GameBackground[];    // 游戏背景
    characters: GameCharacter[];      // 游戏角色  
    ui_elements: UIElement[];         // UI元素
    icons: GameIcon[];                // 游戏图标
    effects: VisualEffect[];          // 视觉特效
  };
  
  // 素材管理
  searchAssets(keyword: string): Asset[];
  filterByCategory(category: string): Asset[];
  uploadCustomAsset(file: File): Promise<Asset>;
  favoriteAsset(id: string): void;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  tags: string[];
  thumbnail: string;
  fullSize: string;
  fileSize: number;
  dimensions: [number, number];
  license: 'free' | 'premium';
}
```

#### 初始素材库内容
- **游戏背景**: 10个 (科幻、魔幻、现代、像素风格)
- **UI元素**: 20个 (按钮、边框、装饰、进度条)
- **游戏图标**: 15个 (武器、道具、技能、货币)
- **角色素材**: 5个 (英雄头像、全身像)
- **特效元素**: 8个 (光效、爆炸、魔法阵)

## 🚀 30天开发路线图 (重新规划)

### **第1周: 基础画布系统** (Day 1-8)
```bash
Day 1-2: 项目初始化 + Fabric.js集成
Day 3-4: 画布创建与基础操作 (缩放、平移)
Day 5-6: 操作历史系统 (撤销/重做)
Day 7-8: 导出功能 + 基础测试
```

### **第2周: 基础设计工具** (Day 9-16)
```bash
Day 9-10: 选择工具 + 文本工具
Day 11-12: 图片上传 + 基础编辑
Day 13-14: 基础图形工具
Day 15-16: 工具栏UI + 属性面板
```

### **第3周: H5编辑器** (Day 17-24)
```bash
Day 17-18: 画布系统 + 自定义尺寸设置
Day 19-20: 图片导出引擎 (PNG/JPG)
Day 21-22: 导出参数控制 + 预览功能
Day 23-24: 导出优化 + 功能测试
```

### **第4周: 基础素材库** (Day 25-30)
```bash
Day 25-26: 素材管理系统 + 分类体系
Day 27-28: 素材上传 + 搜索功能
Day 29-30: 初始素材导入 + 整体测试
```

## 📊 桌面应用MVP成功指标

### **功能指标**
- [ ] 画布操作流畅度 > 60fps
- [ ] 支持5种基础设计工具
- [ ] 图片导出文件 < 10MB
- [ ] 素材库包含50+游戏相关资源
- [ ] 应用启动时间 < 5秒

### **用户体验指标**
- [ ] 新用户15分钟完成首个作品
- [ ] 工具学习成本 < 5分钟
- [ ] 图片导出时间 < 3秒
- [ ] 文件保存响应时间 < 1秒

### **桌面应用特定指标**
- [ ] 支持Windows/macOS双平台
- [ ] 内存占用 < 500MB
- [ ] 共享磁盘访问正常率 > 99%
- [ ] 离线模式正常工作

## 🎯 桌面应用优势

### **相比Web版本的优势**
- ✅ **性能更优**: 直接访问系统资源，画布渲染更流畅
- ✅ **文件操作**: 直接访问本地文件系统和共享磁盘
- ✅ **离线工作**: 无需网络连接即可正常使用
- ✅ **安装简单**: 一次安装，企业内部分发便捷
- ✅ **数据安全**: 数据完全在内网环境，安全可控

### **内网环境特定优势**
- ✅ **共享素材库**: 团队成员共享素材资源
- ✅ **统一管理**: IT部门统一部署和维护
- ✅ **无需服务器**: 减少服务器运维成本
- ✅ **快速访问**: 共享磁盘访问速度快

## 💡 桌面应用开发策略

### **技术选型建议**
```typescript
// 推荐技术栈
{
  framework: "Electron",           // 跨平台桌面应用
  frontend: "React + TypeScript", // UI开发
  canvas: "Fabric.js",            // 画布渲染引擎
  state: "Zustand",               // 状态管理
  storage: "Node.js fs",          // 文件系统操作
  packaging: "electron-builder"   // 应用打包
}
```

### **开发优先级**
1. **第一优先级**: 画布系统稳定性 + 文件操作
2. **第二优先级**: 设计工具完整性 + 用户体验
3. **第三优先级**: 素材库管理 + 导出功能
4. **第四优先级**: 性能优化 + 错误处理

### **部署策略**
- **打包方式**: 生成安装包 (.exe, .dmg)
- **分发方式**: 企业内网下载或IT推送安装
- **更新机制**: 内置自动更新检查（可选）
- **配置管理**: 配置文件存储在共享磁盘

**总结: 桌面应用版G-Asset Forge利用内网环境优势，提供更流畅的用户体验和更安全的数据管理，是企业内部设计工具的理想选择！**
