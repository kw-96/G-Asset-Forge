@echo off
chcp 65001 >nul
title G-Asset Forge 构建缓存清理工具

echo.
echo 🧹 G-Asset Forge 构建缓存清理工具
echo =====================================
echo.

if "%1"=="" (
    echo 使用方法:
    echo   clean.bat [选项]
    echo.
    echo 选项:
    echo   quick     快速清理（只清理构建输出）
    echo   standard  标准清理（构建输出 + 依赖缓存）
    echo   deep      深度清理（所有缓存）
    echo   help      显示此帮助信息
    echo.
    echo 示例:
    echo   clean.bat quick
    echo   clean.bat standard
    echo   clean.bat deep
    echo.
    goto :end
)

if "%1"=="help" (
    echo 使用方法:
    echo   clean.bat [选项]
    echo.
    echo 选项:
    echo   quick     快速清理（只清理构建输出）
    echo   standard  标准清理（构建输出 + 依赖缓存）
    echo   deep      深度清理（所有缓存）
    echo   help      显示此帮助信息
    echo.
    echo 示例:
    echo   clean.bat quick
    echo   clean.bat standard
    echo   clean.bat deep
    echo.
    echo 注意:
    echo   - 深度清理会删除所有缓存，可能需要重新安装依赖
    echo   - 建议先尝试快速清理，如果问题仍然存在再使用标准清理
    echo.
    goto :end
)

if "%1"=="quick" (
    echo 🔧 执行快速清理（构建输出）
    node scripts/clean.js quick
    goto :end
)

if "%1"=="standard" (
    echo 🔧 执行标准清理（构建输出 + 依赖缓存）
    node scripts/clean.js standard
    goto :end
)

if "%1"=="deep" (
    echo ⚠️  即将执行深度清理，这会删除所有缓存！
    set /p confirm=确认继续吗？(y/N):
    if /i "%confirm%"=="y" (
        node scripts/clean.js deep
    ) else (
        echo 已取消深度清理
    )
    goto :end
)

echo ❌ 未知选项: %1
echo 使用 clean.bat help 查看帮助信息

:end
pause
