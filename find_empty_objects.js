const fs = require('fs');

// 读取app.js文件
const content = fs.readFileSync('app.js', 'utf8');

// 查找可能的空对象或不完整对象
const emptyObjects = [];
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 查找只有逗号的行
  if (line.trim() === ',') {
    console.log(`第${i + 1}行: 空逗号`);
  }
  
  // 查找不完整的对象开始
  if (line.includes('{') && !line.includes('id:') && !line.includes('word:')) {
    console.log(`第${i + 1}行: 可能的空对象开始`);
  }
  
  // 查找缺少id的对象
  if (line.includes('word:') && !content.substring(0, content.indexOf(line)).includes('id:')) {
    console.log(`第${i + 1}行: 缺少id的词汇对象`);
  }
}

// 查找所有词汇对象
const wordRegex = /word:\s*'([^']+)'/g;
let wordMatch;
const words = [];

while ((wordMatch = wordRegex.exec(content)) !== null) {
  const word = wordMatch[1];
  const context = content.substring(Math.max(0, wordMatch.index - 200), wordMatch.index + 200);
  
  // 检查是否有id字段
  if (!context.includes('id:')) {
    console.log(`词汇 "${word}" 缺少id字段`);
    emptyObjects.push(word);
  }
}

console.log(`\n找到 ${emptyObjects.length} 个可能不完整的词汇对象`);
