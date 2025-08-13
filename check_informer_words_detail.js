const fs = require('fs');

// 读取app.js文件
const content = fs.readFileSync('app.js', 'utf8');

// 查找所有Informer相关的词汇 - 显示详细信息
const regex = /word:\s*'([^']+)'[\s\S]*?paperTitle:\s*'([^']+)'[\s\S]*?}/g;
let match;
let count = 0;

console.log('所有标记为Informer的词汇详细信息:');
console.log('='.repeat(80));

while ((match = regex.exec(content)) !== null) {
  const word = match[1];
  const paperTitle = match[2];
  
  if (paperTitle.includes('Informer')) {
    count++;
    console.log(`${count}. 词汇: ${word}`);
    console.log(`   论文: ${paperTitle}`);
    console.log('   ' + '-'.repeat(60));
  }
}

console.log(`\n总共找到 ${count} 个Informer相关词汇`);
