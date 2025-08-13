/**
 * 批量修复TypeScript严格模式错误的脚本
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件和替换规则
const fixes = [
  // 修复 string | undefined 不能赋值给 string 的错误
  {
    file: 'src/renderer/components/AssetLibrary/AssetFavoriteManager.tsx',
    replacements: [
      {
        from: 'description: formData.description,',
        to: 'description: formData.description || \'\','
      }
    ]
  },
  
  // 修复未使用变量的警告
  {
    file: 'src/renderer/components/AssetLibrary/AssetFavoriteManager.tsx',
    replacements: [
      {
        from: 'const handleRemoveFromCollection = ',
        to: 'const _handleRemoveFromCollection = '
      }
    ]
  },
  
  // 修复未使用导入
  {
    file: 'src/renderer/components/AssetLibrary/AssetFilterPanel.tsx',
    replacements: [
      {
        from: 'import { IAssetFilter } from',
        to: 'import type { IAssetFilter } from'
      }
    ]
  },
  
  // 修复未使用参数
  {
    file: 'src/renderer/components/AssetLibrary/AssetLibraryPanel.tsx',
    replacements: [
      {
        from: '(collection) =>',
        to: '(_collection) =>'
      },
      {
        from: '(collectionId) =>',
        to: '(_collectionId) =>'
      }
    ]
  }
];

// 执行修复
fixes.forEach(fix => {
  const filePath = path.join(__dirname, '..', fix.file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    fix.replacements.forEach(replacement => {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
        console.log(`Fixed: ${fix.file} - ${replacement.from}`);
      }
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
  } else {
    console.warn(`File not found: ${fix.file}`);
  }
});

console.log('TypeScript错误修复完成');