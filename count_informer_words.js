const fs = require('fs');

// 读取app.js文件
const content = fs.readFileSync('app.js', 'utf8');

// 统计Informer论文相关的词汇数量
const matches = content.match(/paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'/g);
const informerWordCount = matches ? matches.length : 0;

console.log('Informer论文相关词汇数量:', informerWordCount);

// 统计文档中的词汇数量
const docContent = fs.readFileSync('docs/Informer Beyond Efficient Transformer for Long Sequence Time-Series Forecasting.txt', 'utf8');

// 计算文档中词汇列表的数量
const wordMatches = docContent.match(/\*\*[^*]+\*\*/g);
const docWordCount = wordMatches ? wordMatches.length : 0;

console.log('文档中词汇列表数量:', docWordCount);

// 检查是否有重复的词汇
const existingWords = [];
const regex = /word: '([^']+)'/g;
let match;
while ((match = regex.exec(content)) !== null) {
  existingWords.push(match[1]);
}

console.log('app.js中总词汇数量:', existingWords.length);

// 查找Informer相关的词汇
const informerWords = [];
const informerRegex = /word: '([^']+)'[\s\S]*?paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'/g;
while ((match = informerRegex.exec(content)) !== null) {
  informerWords.push(match[1]);
}

console.log('Informer相关词汇列表:', informerWords);
console.log('Informer相关词汇数量:', informerWords.length);

