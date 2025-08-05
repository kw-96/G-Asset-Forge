# 清理脚本使用说明

## 概述

项目使用自定义的跨平台清理脚本替代了 `rimraf`，提供更好的用户体验和错误处理。

## 可用命令

### 基础清理命令

```bash
# 清理构建和缓存文件（不包括 node_modules）
npm run clean

# 仅清理 dist 目录
npm run clean:dist

# 仅清理缓存文件
npm run clean:cache

# 清理所有文件（包括 node_modules）
npm run clean:all
```

### 完整重装

```bash
# 清理所有文件并重新安装依赖
npm run reinstall
```

## 清理的目录/文件

- `dist/` - 构建输出目录
- `node_modules/.cache/` - npm/webpack 缓存
- `.webpack/` - webpack 缓存目录
- `node_modules/` - 仅在 `clean:all` 时清理

## 特性

- ✅ 跨平台兼容（Windows/macOS/Linux）
- ✅ 友好的用户界面和进度提示
- ✅ 错误处理和摘要报告
- ✅ 无外部依赖
- ✅ 快速执行

## 脚本位置

清理逻辑位于 `scripts/clean.js`，可以直接使用 Node.js 执行：

```bash
# 直接执行清理脚本
node scripts/clean.js [target]

# 示例
node scripts/clean.js dist        # 清理 dist
node scripts/clean.js cache       # 清理缓存
node scripts/clean.js all         # 清理所有
node scripts/clean.js custom-dir  # 清理自定义目录
```