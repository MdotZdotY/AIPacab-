const fs = require('fs');

// 读取app.js文件
const content = fs.readFileSync('app.js', 'utf8');

// 查找所有Informer相关的词汇对象
const regex = /(\{[^}]*word:\s*'([^']+)'[^}]*paperTitle:\s*'([^']+)'[^}]*\})/g;
let match;
let count = 0;

console.log('所有被识别为Informer的词汇详细信息:');
console.log('='.repeat(80));

while ((match = regex.exec(content)) !== null) {
  const fullObject = match[1];
  const word = match[2];
  const paperTitle = match[3];
  
  if (paperTitle.includes('Informer')) {
    count++;
    console.log(`${count}. 词汇: ${word}`);
    console.log(`   论文: ${paperTitle}`);
    console.log(`   完整对象: ${fullObject.substring(0, 200)}...`);
    console.log('   ' + '-'.repeat(60));
  }
}

console.log(`\n总共找到 ${count} 个Informer相关词汇`);
