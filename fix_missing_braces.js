const fs = require('fs');
const path = require('path');

function fixMissingBraces() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('开始修复缺失的大括号...');
  
  // 查找所有缺少结束大括号的词汇对象
  const pattern = /paperTitle: 'Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting',\s*category: '[^']*',\s*\{/g;
  
  let match;
  let fixedCount = 0;
  
  while ((match = pattern.exec(content)) !== null) {
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;
    
    // 找到下一个词汇对象的开始位置
    const nextWordStart = content.indexOf('      {', endIndex);
    if (nextWordStart !== -1) {
      // 在当前位置插入缺失的字段
      const insertText = `
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },`;
      
      content = content.slice(0, endIndex) + insertText + content.slice(endIndex);
      fixedCount++;
      
      // 更新pattern的lastIndex，因为内容长度已经改变
      pattern.lastIndex = endIndex + insertText.length;
    }
  }
  
  // 保存修复后的内容
  fs.writeFileSync(appJsPath, content, 'utf8');
  
  console.log(`修复了 ${fixedCount} 个缺失大括号的问题`);
  console.log('修复完成！');
}

fixMissingBraces();