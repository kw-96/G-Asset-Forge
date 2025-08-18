/**
 * 自动添加中文JSDoc注释模板工具
 * @description 为缺少注释的文件自动添加中文JSDoc注释模板
 * @author 开发团队
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * 读取注释模板文件
 * @param templateName 模板名称
 * @returns 模板内容
 */
function readTemplate(templateName) {
  const templatePath = path.join(__dirname, '..', 'docs', 'comment-templates', `${templateName}.template`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  return null;
}

/**
 * 生成文件头注释
 * @param filePath 文件路径
 * @returns 文件头注释字符串
 */
function generateFileHeader(filePath) {
  const template = readTemplate('file-header');
  if (!template) return null;

  const fileName = path.basename(filePath, path.extname(filePath));
  const description = '文件功能描述'; // 需要手动填写
  const detailedDescription = '详细描述文件的功能和用途'; // 需要手动填写
  const author = '开发团队';

  return template
    .replace('${fileName}', fileName)
    .replace('${description}', description)
    .replace('${detailedDescription}', detailedDescription)
    .replace('${author}', author);
}

/**
 * 生成函数注释模板
 * @param functionName 函数名称
 * @returns 函数注释模板
 */
function generateFunctionComment(functionName) {
  const template = readTemplate('function');
  if (!template) return null;

  return template
    .replace('${description}', `${functionName}函数功能描述`)
    .replace('${paramType}', '{参数类型}')
    .replace('${paramName}', '参数名')
    .replace('${paramDescription}', '参数描述')
    .replace('${returnType}', '{返回类型}')
    .replace('${returnDescription}', '返回值描述')
    .replace('${errorType}', 'Error')
    .replace('${errorDescription}', '错误描述')
    .replace('${exampleCode}', `// 使用示例\nconst result = ${functionName}();`);
}

/**
 * 生成类注释模板
 * @param className 类名称
 * @returns 类注释模板
 */
function generateClassComment(className) {
  const template = readTemplate('class');
  if (!template) return null;

  return template
    .replace('${className}', className)
    .replace('${description}', `${className}类功能描述`)
    .replace('${detailedDescription}', `详细描述${className}类的功能和用途`)
    .replace('${author}', '开发团队')
    .replace('${version}', '1.0.0')
    .replace('${exampleCode}', `// 使用示例\nconst instance = new ${className}();`);
}

/**
 * 生成接口注释模板
 * @param interfaceName 接口名称
 * @returns 接口注释模板
 */
function generateInterfaceComment(interfaceName) {
  const template = readTemplate('interface');
  if (!template) return null;

  return template
    .replace('${interfaceName}', interfaceName)
    .replace('${description}', `${interfaceName}接口功能描述`)
    .replace('${detailedDescription}', `详细描述${interfaceName}接口的用途和实现要求`)
    .replace('${propertyType}', 'string')
    .replace('${propertyName}', 'propertyName')
    .replace('${propertyDescription}', '属性描述')
    .replace('${exampleCode}', `// 使用示例\nconst config: ${interfaceName} = { ... };`);
}

/**
 * 检查文件是否需要添加文件头注释
 * @param content 文件内容
 * @returns 是否需要添加文件头注释
 */
function needsFileHeader(content) {
  const lines = content.split('\n');
  const firstNonEmptyLine = lines.find(line => line.trim() !== '');
  return !(firstNonEmptyLine && firstNonEmptyLine.trim().startsWith('/**'));
}

/**
 * 为文件添加文件头注释
 * @param filePath 文件路径
 * @param content 文件内容
 * @returns 添加注释后的文件内容
 */
function addFileHeaderComment(filePath, content) {
  if (!needsFileHeader(content)) {
    return content;
  }

  const header = generateFileHeader(filePath);
  if (!header) {
    return content;
  }

  // 在文件开头添加注释
  return header + '\n\n' + content;
}

/**
 * 提取文件中的导出项
 * @param content 文件内容
 * @returns 导出项列表
 */
function extractExports(content) {
  const exports = [];

  // 提取导出函数
  const functionRegex = /export\s+(async\s+)?function\s+(\w+)/g;
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    exports.push({
      type: 'function',
      name: match[2],
      line: content.substring(0, match.index).split('\n').length
    });
  }

  // 提取导出类
  const classRegex = /export\s+(abstract\s+)?class\s+(\w+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    exports.push({
      type: 'class',
      name: match[2],
      line: content.substring(0, match.index).split('\n').length
    });
  }

  // 提取导出接口
  const interfaceRegex = /export\s+interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    exports.push({
      type: 'interface',
      name: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }

  return exports;
}

/**
 * 检查导出项是否已有注释
 * @param content 文件内容
 * @param exportItem 导出项
 * @returns 是否已有注释
 */
function hasComment(content, exportItem) {
  const lines = content.split('\n');
  const exportLine = exportItem.line - 1;

  // 检查导出项前面几行是否有JSDoc注释
  for (let i = Math.max(0, exportLine - 5); i < exportLine; i++) {
    if (lines[i] && lines[i].trim().includes('/**')) {
      return true;
    }
  }

  return false;
}

/**
 * 为单个文件添加注释模板
 * @param filePath 文件路径
 * @returns 是否成功添加注释
 */
function addCommentsToFile(filePath) {
  console.log(`📝 处理文件: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // 添加文件头注释
  const newContent = addFileHeaderComment(filePath, content);
  if (newContent !== content) {
    content = newContent;
    modified = true;
    console.log(`   ✅ 添加了文件头注释`);
  }

  // 提取导出项
  const exports = extractExports(content);

  // 为每个导出项添加注释（这里只是标记，实际添加需要更复杂的AST解析）
  exports.forEach(exportItem => {
    if (!hasComment(content, exportItem)) {
      console.log(`   ⚠️  ${exportItem.type} "${exportItem.name}" 缺少注释 (行 ${exportItem.line})`);
      // 注意：实际添加注释需要更精确的位置计算和AST解析
      // 这里只是提示，不直接修改内容
    }
  });

  // 保存修改后的文件
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`   💾 文件已保存`);
    return true;
  }

  return false;
}

/**
 * 批量为文件添加注释模板
 * @param srcDir 源代码目录
 * @param dryRun 是否为试运行模式
 * @returns 处理结果统计
 */
function addCommentsToProject(srcDir = 'src', dryRun = false) {
  console.log(`🚀 开始为项目添加中文JSDoc注释模板...\n`);
  console.log(`📁 源代码目录: ${srcDir}`);
  console.log(`🔍 试运行模式: ${dryRun ? '是' : '否'}\n`);

  // 查找所有TypeScript文件
  const pattern = path.join(srcDir, '**/*.{ts,tsx}');
  const files = glob.sync(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx'
    ]
  });

  console.log(`📄 找到 ${files.length} 个TypeScript文件\n`);

  const stats = {
    totalFiles: files.length,
    modifiedFiles: 0,
    addedHeaders: 0,
    missingComments: 0
  };

  files.forEach(file => {
    if (dryRun) {
      // 试运行模式：只检查不修改
      const content = fs.readFileSync(file, 'utf-8');
      if (needsFileHeader(content)) {
        console.log(`📝 ${file} - 需要添加文件头注释`);
        stats.addedHeaders++;
      }

      const exports = extractExports(content);
      exports.forEach(exportItem => {
        if (!hasComment(content, exportItem)) {
          console.log(`   ⚠️  ${exportItem.type} "${exportItem.name}" 缺少注释`);
          stats.missingComments++;
        }
      });
    } else {
      // 实际修改模式
      if (addCommentsToFile(file)) {
        stats.modifiedFiles++;
      }
    }
  });

  console.log('\n📊 处理结果统计:');
  console.log('================================');
  console.log(`📄 总文件数: ${stats.totalFiles}`);
  if (dryRun) {
    console.log(`📝 需要添加文件头注释: ${stats.addedHeaders}`);
    console.log(`⚠️  缺少注释的导出项: ${stats.missingComments}`);
  } else {
    console.log(`✅ 已修改文件数: ${stats.modifiedFiles}`);
  }
  console.log('================================\n');

  if (dryRun) {
    console.log('💡 这是试运行结果。要实际添加注释，请运行: npm run add-comments');
  } else {
    console.log('✅ 注释模板添加完成！');
    console.log('💡 请手动完善自动生成的注释内容，确保描述准确。');
  }

  return stats;
}

// 如果直接运行此脚本
if (require.main === module) {
  const srcDir = process.argv[2] || 'src';
  const dryRun = process.argv.includes('--dry-run');
  addCommentsToProject(srcDir, dryRun);
}

module.exports = {
  addCommentsToProject,
  addCommentsToFile,
  generateFileHeader,
  generateFunctionComment,
  generateClassComment,
  generateInterfaceComment
};