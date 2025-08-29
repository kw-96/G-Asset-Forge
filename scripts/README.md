# 🧹 构建缓存清理工具

这个目录包含了用于清理 G-Asset Forge 项目构建缓存的工具脚本。

## 📁 文件说明

- `clean.js` - 主要的清理脚本（Node.js）
- `clean.bat` - Windows 批处理文件
- `clean.ps1` - PowerShell 脚本（推荐 Windows 用户使用）
- `README.md` - 本说明文档

## 🚀 使用方法

### 方法 1：使用 pnpm 脚本（推荐）

在项目根目录下运行：

```bash
# 快速清理（只清理构建输出）
pnpm run clean:quick

# 标准清理（构建输出 + 依赖缓存）
pnpm run clean:standard

# 深度清理（所有缓存）
pnpm run clean:deep

# 清理特定包
pnpm run clean:package packages/core
```

### 方法 2：直接运行 Node.js 脚本

```bash
# 快速清理
node scripts/clean.js quick

# 标准清理
node scripts/clean.js standard

# 深度清理
node scripts/clean.js deep

# 清理特定包
node scripts/clean.js package packages/core

# 显示帮助
node scripts/clean.js help
```

### 方法 3：使用 Windows 批处理文件

```cmd
# 快速清理
clean.bat quick

# 标准清理
clean.bat standard

# 深度清理
clean.bat deep

# 显示帮助
clean.bat help
```

### 方法 4：使用 PowerShell 脚本（推荐 Windows 用户）

```powershell
# 快速清理
.\clean.ps1 quick

# 标准清理
.\clean.ps1 standard

# 深度清理
.\clean.ps1 deep

# 清理特定包
.\clean.ps1 package packages/core

# 显示帮助
.\clean.ps1 help
```

## 🔧 清理级别说明

### 快速清理（Quick）

- 清理所有包的构建输出目录（`dist`、`build`）
- 清理 Vite 缓存（`.vite`）
- 清理 TypeScript 编译缓存（`tsconfig.tsbuildinfo`）
- **推荐用于日常开发中的快速清理**

### 标准清理（Standard）

- 包含快速清理的所有内容
- 清理依赖缓存（`node_modules/.cache`）
- 清理 pnpm 存储缓存（`.pnpm-store`）
- 清理 ESLint 缓存（`.eslintcache`）
- **推荐用于遇到构建问题时使用**

### 深度清理（Deep）

- 包含标准清理的所有内容
- 清理临时文件（`*.log`、`*.tmp`、`.temp`）
- 清理 pnpm 全局缓存
- **推荐用于重大问题时使用，可能需要重新安装依赖**

## 📦 支持的包

清理工具会自动处理以下包：

- `packages/common` - 通用工具包
- `packages/core` - 核心功能包
- `packages/components` - 组件库
- `packages/geo` - 几何计算包
- `packages/icons` - 图标包
- `apps/g-asset-forge` - 主应用
- `apps/g-asset-forge-multiplayer` - 多人协作应用
- `apps/workbench` - 工作台应用
- `apps/backend` - 后端服务

## ⚠️ 注意事项

1. **深度清理会删除所有缓存**，可能需要重新安装依赖
2. **建议先尝试快速清理**，如果问题仍然存在再使用标准清理
3. **深度清理前会要求确认**，避免误操作
4. **清理特定包时**，请确保包名正确
5. **Windows 用户**如果遇到 PowerShell 执行策略问题，请运行：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## 🐛 常见问题

### Q: 清理后构建仍然失败怎么办？

A: 尝试标准清理，如果还是失败，可能需要深度清理并重新安装依赖。

### Q: 清理特定包时提示包不存在？

A: 检查包名是否正确，包名应该是相对于项目根目录的路径。

### Q: Windows 上 PowerShell 脚本无法执行？

A: 运行 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` 来允许执行本地脚本。

### Q: 清理后需要重新安装依赖吗？

A: 快速清理和标准清理通常不需要，深度清理后可能需要运行 `pnpm install`。

## 🔄 清理后的操作

清理完成后，你可能需要：

1. **重新构建项目**：

   ```bash
   pnpm run build
   ```

2. **重新安装依赖**（仅深度清理后）：

   ```bash
   pnpm install
   ```

3. **重新启动开发服务器**：
   ```bash
   pnpm run dev
   ```

## 📝 日志记录

清理工具会记录所有操作，包括：

- 成功删除的文件和目录
- 删除失败的项目（带警告信息）
- 清理进度和结果

如果遇到问题，请查看控制台输出的详细信息。
