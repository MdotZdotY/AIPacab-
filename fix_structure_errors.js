const fs = require('fs');
const path = require('path');

function fixStructureErrors() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('开始修复结构错误...');
  
  // 修复错误的词汇对象结构
  // 查找所有错误的模式：category后面直接跟着{
  const pattern = /category: '[^']*',\s*\{\s*difficulty: '[^']*',\s*studyCount: \d+,\s*correctCount: \d+,\s*lastStudyTime: null,\s*status: '[^']*',\s*weeklyStudyCount: \d+\s*\},\s*\{\s*id: \d+,/g;
  
  let fixedCount = 0;
  
  // 修复这种错误的模式
  content = content.replace(pattern, (match) => {
    // 提取category值
    const categoryMatch = match.match(/category: '([^']*)'/);
    if (categoryMatch) {
      const category = categoryMatch[1];
      // 重新构建正确的结构
      return `category: '${category}',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: `;
    }
    return match;
  });
  
  // 查找并修复缺少结束大括号的词汇对象
  const missingBracePattern = /paperTitle: 'Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting',\s*category: '[^']*',\s*$/gm;
  
  content = content.replace(missingBracePattern, (match) => {
    return match + `
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },`;
  });
  
  // 保存修复后的内容
  fs.writeFileSync(appJsPath, content, 'utf8');
  
  console.log('结构错误修复完成！');
}

fixStructureErrors();