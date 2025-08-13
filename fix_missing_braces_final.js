const fs = require('fs');
const path = require('path');

function fixMissingBracesFinal() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('开始最终修复缺失的大括号...');
  
  // 修复所有缺少{的情况
  let fixedCount = 0;
  
  // 使用正则表达式查找并修复所有缺少{的模式
  const pattern = /(\s*),\s*\n(\s*)id: \d+,/g;
  
  content = content.replace(pattern, (match, p1, p2) => {
    fixedCount++;
    return `${p1},\n${p2}{${p2}id: `;
  });
  
  // 保存修复后的内容
  fs.writeFileSync(appJsPath, content, 'utf8');
  
  console.log(`修复了 ${fixedCount} 个缺失大括号的问题`);
  console.log('最终修复完成！');
}

fixMissingBracesFinal();