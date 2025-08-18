/**
 * 导入路径验证和修复脚本
 * @description 检查并修复所有文件中的导入导出路径
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('🔍 G-Asset Forge 导入路径验证和修复');
console.log('='.repeat(60));

const rootDir = path.resolve(__dirname, '..');

/**
 * 获取文件中的所有导入和导出语句
 */
function getAllImportsAndExports(content) {
    const statements = [];

    // 匹配 import ... from '...'
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        statements.push({
            type: 'import',
            statement: match[0],
            path: match[1],
            line: content.substring(0, match.index).split('\n').length,
            start: match.index,
            end: match.index + match[0].length
        });
    }

    // 匹配 export ... from '...'
    const exportRegex = /export\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g;
    while ((match = exportRegex.exec(content)) !== null) {
        statements.push({
            type: 'export',
            statement: match[0],
            path: match[1],
            line: content.substring(0, match.index).split('\n').length,
            start: match.index,
            end: match.index + match[0].length
        });
    }

    return statements.sort((a, b) => a.start - b.start);
}

/**
 * 验证导入路径是否存在
 */
function validateImportPath(importPath, filePath) {
    // 跳过外部依赖
    if (!importPath.startsWith('./') && !importPath.startsWith('../') && !importPath.startsWith('/')) {
        return { valid: true, type: 'external' };
    }

    const fileDir = path.dirname(filePath);
    let resolvedPath;

    if (importPath.startsWith('/')) {
        resolvedPath = path.join(rootDir, importPath);
    } else {
        resolvedPath = path.resolve(fileDir, importPath);
    }

    // 尝试不同的扩展名
    const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];

    for (const ext of possibleExtensions) {
        const fullPath = resolvedPath + ext;
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            return {
                valid: true,
                type: 'local',
                resolvedPath: fullPath,
                isDirectory: stats.isDirectory()
            };
        }
    }

    return {
        valid: false,
        type: 'local',
        attemptedPath: resolvedPath,
        suggestions: findCorrectPath(importPath, filePath)
    };
}

/**
 * 查找正确的路径
 */
function findCorrectPath(importPath, filePath) {
    const fileName = path.basename(importPath);
    const suggestions = [];

    // 基于新的架构结构搜索可能的位置
    const searchPaths = [
        'src/renderer/ui/components',
        'src/renderer/ui/business',
        'src/renderer/logic/managers',
        'src/renderer/logic/services',
        'src/renderer/logic/engines',
        'src/renderer/logic/utils',
        'src/renderer/logic/contexts',
        'src/renderer/stores',
        'src/renderer/hooks',
        'src/interfaces/types',
        'src/interfaces/api',
        'src/interfaces/schemas',
        'src/main/managers',
        'src/main/services',
        'src/main/handlers',
        'src/main/core'
    ];

    for (const searchPath of searchPaths) {
        const fullSearchPath = path.join(rootDir, searchPath);
        if (fs.existsSync(fullSearchPath)) {
            const found = findFileRecursively(fullSearchPath, fileName);
            if (found) {
                const relativePath = path.relative(path.dirname(filePath), found);
                suggestions.push(relativePath.replace(/\\/g, '/'));
            }
        }
    }

    return suggestions.slice(0, 3);
}

/**
 * 递归查找文件
 */
function findFileRecursively(dir, fileName) {
    try {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                const found = findFileRecursively(fullPath, fileName);
                if (found) return found;
            } else if (file.isFile()) {
                const nameWithoutExt = path.parse(file.name).name;
                const targetWithoutExt = path.parse(fileName).name;

                if (nameWithoutExt === targetWithoutExt) {
                    return fullPath;
                }
            }
        }
    } catch (error) {
        // 忽略访问错误
    }

    return null;
}

/**
 * 修复导入路径
 */
function fixImportPath(importPath, filePath) {
    const validation = validateImportPath(importPath, filePath);

    if (!validation.valid && validation.suggestions.length > 0) {
        // 使用第一个建议作为修复
        const suggestion = validation.suggestions[0];
        return {
            fixed: suggestion,
            changed: true,
            reason: 'path-correction',
            original: importPath
        };
    }

    return {
        fixed: importPath,
        changed: false
    };
}

/**
 * 分析文件的导入情况
 */
function analyzeFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return { error: '文件不存在' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const statements = getAllImportsAndExports(content);

    const results = {
        totalStatements: statements.length,
        validStatements: 0,
        invalidStatements: 0,
        externalStatements: 0,
        issues: [],
        fixes: []
    };

    statements.forEach(stmt => {
        const validation = validateImportPath(stmt.path, filePath);

        if (validation.valid) {
            if (validation.type === 'external') {
                results.externalStatements++;
            } else {
                results.validStatements++;
            }
        } else {
            results.invalidStatements++;

            const fix = fixImportPath(stmt.path, filePath);

            results.issues.push({
                line: stmt.line,
                type: stmt.type,
                statement: stmt.statement,
                path: stmt.path,
                reason: '文件不存在',
                suggestions: validation.suggestions
            });

            if (fix.changed) {
                results.fixes.push({
                    line: stmt.line,
                    type: stmt.type,
                    original: stmt.statement,
                    fixed: stmt.statement.replace(stmt.path, fix.fixed),
                    oldPath: fix.original,
                    newPath: fix.fixed,
                    start: stmt.start,
                    end: stmt.end
                });
            }
        }
    });

    return results;
}

/**
 * 应用修复到文件
 */
function applyFixesToFile(filePath, fixes) {
    if (fixes.length === 0) return false;

    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // 从后往前应用修复，避免位置偏移
    fixes.sort((a, b) => b.start - a.start).forEach(fix => {
        newContent = newContent.substring(0, fix.start) +
            fix.fixed +
            newContent.substring(fix.end);
    });

    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
}

/**
 * 分析所有文件
 */
function analyzeAllFiles() {
    console.log('\n📊 分析所有导入路径...');

    const globalResults = {
        totalFiles: 0,
        processedFiles: 0,
        filesWithIssues: 0,
        filesWithFixes: 0,
        totalStatements: 0,
        validStatements: 0,
        invalidStatements: 0,
        externalStatements: 0,
        totalFixes: 0,
        issues: [],
        fixes: [],
        errors: []
    };

    function processDirectory(dir) {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir, { withFileTypes: true });

        files.forEach(file => {
            if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
                processDirectory(path.join(dir, file.name));
            } else if (file.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file.name))) {
                const filePath = path.join(dir, file.name);
                globalResults.totalFiles++;

                try {
                    const analysis = analyzeFile(filePath);

                    if (analysis.error) {
                        globalResults.errors.push({
                            file: path.relative(rootDir, filePath),
                            error: analysis.error
                        });
                    } else {
                        globalResults.processedFiles++;
                        globalResults.totalStatements += analysis.totalStatements;
                        globalResults.validStatements += analysis.validStatements;
                        globalResults.invalidStatements += analysis.invalidStatements;
                        globalResults.externalStatements += analysis.externalStatements;

                        if (analysis.issues.length > 0) {
                            globalResults.filesWithIssues++;
                            globalResults.issues.push({
                                file: path.relative(rootDir, filePath),
                                issues: analysis.issues
                            });
                        }

                        if (analysis.fixes.length > 0) {
                            globalResults.filesWithFixes++;
                            globalResults.totalFixes += analysis.fixes.length;
                            globalResults.fixes.push({
                                file: path.relative(rootDir, filePath),
                                fixes: analysis.fixes
                            });

                            console.log(`  🔧 ${path.relative(rootDir, filePath)}: ${analysis.fixes.length} 个可修复问题`);
                        }
                    }
                } catch (error) {
                    globalResults.errors.push({
                        file: path.relative(rootDir, filePath),
                        error: error.message
                    });
                }
            }
        });
    }

    processDirectory(path.join(rootDir, 'src'));

    return globalResults;
}

/**
 * 应用所有修复
 */
function applyAllFixes(results) {
    console.log('\n🔧 应用导入路径修复...');

    let appliedFiles = 0;
    let appliedFixes = 0;

    results.fixes.forEach(fileFixInfo => {
        const filePath = path.join(rootDir, fileFixInfo.file);

        try {
            const success = applyFixesToFile(filePath, fileFixInfo.fixes);
            if (success) {
                appliedFiles++;
                appliedFixes += fileFixInfo.fixes.length;
                console.log(`    ✅ ${fileFixInfo.file}: ${fileFixInfo.fixes.length} 个修复已应用`);
            }
        } catch (error) {
            console.log(`    ❌ ${fileFixInfo.file}: 修复失败 - ${error.message}`);
        }
    });

    return { appliedFiles, appliedFixes };
}

/**
 * 生成详细报告
 */
function generateReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 导入路径分析报告');
    console.log('='.repeat(60));

    console.log(`📄 总文件数: ${results.totalFiles}`);
    console.log(`🔍 已处理文件: ${results.processedFiles}`);
    console.log(`⚠️ 有问题的文件: ${results.filesWithIssues}`);
    console.log(`🔧 可修复的文件: ${results.filesWithFixes}`);
    console.log(`❌ 处理错误: ${results.errors.length}`);

    console.log(`\n📦 导入语句统计:`);
    console.log(`  📝 总语句数: ${results.totalStatements}`);
    console.log(`  ✅ 有效语句: ${results.validStatements}`);
    console.log(`  ❌ 无效语句: ${results.invalidStatements}`);
    console.log(`  📚 外部依赖: ${results.externalStatements}`);
    console.log(`  🔧 可修复数: ${results.totalFixes}`);

    // 计算健康度
    const healthScore = results.totalStatements > 0 ?
        ((results.validStatements + results.externalStatements) / results.totalStatements * 100).toFixed(1) : 100;

    console.log(`\n🎯 导入健康度: ${healthScore}%`);

    if (results.errors.length > 0) {
        console.log('\n❌ 处理错误:');
        results.errors.slice(0, 5).forEach(error => {
            console.log(`  - ${error.file}: ${error.error}`);
        });
    }

    if (results.issues.length > 0) {
        console.log('\n⚠️ 导入问题详情:');

        results.issues.slice(0, 5).forEach(fileIssue => {
            console.log(`\n📁 ${fileIssue.file}:`);

            fileIssue.issues.slice(0, 3).forEach(issue => {
                console.log(`  第${issue.line}行: ${issue.statement}`);
                console.log(`    ❌ ${issue.reason}: ${issue.path}`);

                if (issue.suggestions.length > 0) {
                    console.log(`    💡 建议: ${issue.suggestions[0]}`);
                }
            });
        });
    }

    if (results.fixes.length > 0) {
        console.log('\n🔧 可应用的修复:');

        results.fixes.slice(0, 5).forEach(fileFix => {
            console.log(`\n📁 ${fileFix.file}:`);

            fileFix.fixes.slice(0, 3).forEach(fix => {
                console.log(`  第${fix.line}行: ${fix.oldPath} → ${fix.newPath}`);
            });
        });
    }
}

/**
 * 主函数
 */
function main() {
    const results = analyzeAllFiles();
    generateReport(results);

    if (results.totalFixes > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('🚨 发现可修复的导入路径问题！');
        console.log('='.repeat(60));
        console.log(`📁 需要修复的文件: ${results.filesWithFixes}`);
        console.log(`🔧 可修复的问题: ${results.totalFixes}`);
        console.log('\n如需应用修复，请运行: node scripts/validate-and-fix-imports.js --fix');

        // 检查是否有修复参数
        if (process.argv.includes('--fix')) {
            console.log('\n🔧 开始应用修复...');
            const applyResults = applyAllFixes(results);

            console.log('\n' + '='.repeat(60));
            console.log('🎉 修复完成！');
            console.log('='.repeat(60));
            console.log(`📁 修复文件数: ${applyResults.appliedFiles}`);
            console.log(`🔧 应用修复数: ${applyResults.appliedFixes}`);

            // 重新验证
            console.log('\n🔍 重新验证修复结果...');
            const revalidationResults = analyzeAllFiles();
            const newHealthScore = revalidationResults.totalStatements > 0 ?
                ((revalidationResults.validStatements + revalidationResults.externalStatements) / revalidationResults.totalStatements * 100).toFixed(1) : 100;

            console.log(`🎯 修复后健康度: ${newHealthScore}%`);

            if (revalidationResults.invalidStatements === 0) {
                console.log('✅ 所有导入路径问题已修复！');
            } else {
                console.log(`⚠️ 仍有 ${revalidationResults.invalidStatements} 个问题需要手动处理`);
            }
        }
    } else {
        console.log('\n✅ 所有导入路径都是正确的！');
    }

    return results;
}

// 运行分析
if (require.main === module) {
    main();
}

module.exports = { main, analyzeAllFiles, applyAllFixes };