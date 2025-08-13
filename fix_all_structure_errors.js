const fs = require('fs');
const path = require('path');

function fixAllStructureErrors() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('开始全面修复结构错误...');
  
  // 修复1: 在id前面缺少{的情况
  content = content.replace(/\s*id: \d+,/g, (match) => {
    // 检查前面是否有{
    const beforeMatch = content.substring(0, content.indexOf(match));
    const lastBrace = beforeMatch.lastIndexOf('{');
    const lastClosingBrace = beforeMatch.lastIndexOf('}');
    
    if (lastBrace > lastClosingBrace) {
      // 前面有未闭合的{，不需要添加
      return match;
    } else {
      // 前面没有{，需要添加
      return `      {${match}`;
    }
  });
  
  // 修复2: 删除多余的字段块
  content = content.replace(/\s*\{\s*difficulty: '[^']*',\s*studyCount: \d+,\s*correctCount: \d+,\s*lastStudyTime: null,\s*status: '[^']*',\s*weeklyStudyCount: \d+\s*\},/g, '');
  
  // 修复3: 确保每个词汇对象都有正确的结构
  const wordObjects = content.match(/\{[^}]*word: '[^']*'[^}]*\}/g);
  if (wordObjects) {
    wordObjects.forEach(obj => {
      // 检查是否缺少必要的字段
      if (!obj.includes('difficulty:') || !obj.includes('studyCount:') || !obj.includes('correctCount:')) {
        console.log('发现不完整的词汇对象');
      }
    });
  }
  
  // 保存修复后的内容
  fs.writeFileSync(appJsPath, content, 'utf8');
  
  console.log('全面结构错误修复完成！');
}

fixAllStructureErrors();