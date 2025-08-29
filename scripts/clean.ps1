#!/usr/bin/env pwsh

# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )

    $colors = @{
        "Red" = "Red"
        "Green" = "Green"
        "Yellow" = "Yellow"
        "Blue" = "Blue"
        "Magenta" = "Magenta"
        "Cyan" = "Cyan"
        "White" = "White"
    }

    if ($colors.ContainsKey($Color)) {
        Write-Host $Message -ForegroundColor $colors[$Color]
    } else {
        Write-Host $Message
    }
}

function Write-Step {
    param([string]$Step)
    Write-ColorOutput "`n🔧 $Step" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

# 显示帮助信息
function Show-Help {
    Write-ColorOutput "`n🧹 G-Asset Forge 构建缓存清理工具" "Magenta"
    Write-ColorOutput "=====================================" "Magenta"
    Write-ColorOutput ""

    Write-ColorOutput "使用方法:" "Cyan"
    Write-ColorOutput "  .\clean.ps1 [选项]" "White"
    Write-ColorOutput ""

    Write-ColorOutput "选项:" "Cyan"
    Write-ColorOutput "  quick, q     快速清理（只清理构建输出）" "White"
    Write-ColorOutput "  standard, s  标准清理（构建输出 + 依赖缓存）" "White"
    Write-ColorOutput "  deep, d      深度清理（所有缓存）" "White"
    Write-ColorOutput "  package <pkg> 清理特定包" "White"
    Write-ColorOutput "  help, h      显示此帮助信息" "White"
    Write-ColorOutput ""

    Write-ColorOutput "示例:" "Cyan"
    Write-ColorOutput "  .\clean.ps1 quick" "White"
    Write-ColorOutput "  .\clean.ps1 package packages/core" "White"
    Write-ColorOutput "  .\clean.ps1 deep" "White"
    Write-ColorOutput ""

    Write-ColorOutput "注意:" "Yellow"
    Write-ColorOutput "  - 深度清理会删除所有缓存，可能需要重新安装依赖" "Yellow"
    Write-ColorOutput "  - 建议先尝试快速清理，如果问题仍然存在再使用标准清理" "Yellow"
    Write-ColorOutput "  - 如果遇到执行策略问题，请运行: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" "Yellow"
}

# 主函数
function Main {
    param(
        [string]$Command = "",
        [string]$Package = ""
    )

    if ($Command -eq "" -or $Command -eq "help" -or $Command -eq "h") {
        Show-Help
        return
    }

    switch ($Command) {
        "quick" {
            Write-Step "执行快速清理（构建输出）"
            node scripts/clean.js quick
        }
        "q" {
            Write-Step "执行快速清理（构建输出）"
            node scripts/clean.js quick
        }
        "standard" {
            Write-Step "执行标准清理（构建输出 + 依赖缓存）"
            node scripts/clean.js standard
        }
        "s" {
            Write-Step "执行标准清理（构建输出 + 依赖缓存）"
            node scripts/clean.js standard
        }
        "deep" {
            Write-Warning "即将执行深度清理，这会删除所有缓存！"
            $confirm = Read-Host "确认继续吗？(y/N)"
            if ($confirm -eq "y" -or $confirm -eq "Y") {
                node scripts/clean.js deep
            } else {
                Write-Warning "已取消深度清理"
            }
        }
        "d" {
            Write-Warning "即将执行深度清理，这会删除所有缓存！"
            $confirm = Read-Host "确认继续吗？(y/N)"
            if ($confirm -eq "y" -or $confirm -eq "Y") {
                node scripts/clean.js deep
            } else {
                Write-Warning "已取消深度清理"
            }
        }
        "package" {
            if ($Package -eq "") {
                Write-Error "请指定要清理的包名！"
                Show-Help
                return
            }
            Write-Step "清理包: $Package"
            node scripts/clean.js package $Package
        }
        default {
            Write-Error "未知命令: $Command"
            Show-Help
            exit 1
        }
    }
}

# 检查是否在正确的目录
if (-not (Test-Path "scripts/clean.js")) {
    Write-Error "请在项目根目录下运行此脚本！"
    exit 1
}

# 获取命令行参数
$args = $args.ToArray()
$command = if ($args.Length -gt 0) { $args[0] } else { "" }
$package = if ($args.Length -gt 1) { $args[1] } else { "" }

# 运行主函数
Main -Command $command -Package $package
