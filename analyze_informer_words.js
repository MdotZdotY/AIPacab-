const fs = require('fs');

// 读取app.js文件
const content = fs.readFileSync('app.js', 'utf8');

// 源文档中的32个Informer词汇
const sourceWords = [
  'Ubiquitous', 'Ablation', 'Robust', 'Empirical', 'Prohibitively',
  'Limitation', 'Significant', 'Component', 'Utilize', 'Efficient',
  'Dominate', 'Require', 'Generate', 'Architecture', 'Incorporate',
  'Demonstrate', 'Interaction', 'Challenge', 'Propose', 'Evaluate',
  'Time Series Forecasting', 'Multi-horizon Forecasting', 'Recurrent Neural Network (RNN)',
  'Self-attention', 'Transformer', 'Encoder', 'Decoder', 'Long Sequence Time-series Forecasting (LSTF)',
  'State-of-the-art', 'Benchmark', 'Autoregressive decoding', 'Hyperparameter'
];

// 查找所有Informer相关的词汇 - 精确匹配paperTitle
const informerWords = [];
const regex = /word:\s*'([^']+)'[\s\S]*?paperTitle:\s*'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'[\s\S]*?}/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const word = match[1];
  // 再次验证这个词汇确实属于Informer论文
  const context = match[0];
  if (context.includes("paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'")) {
    informerWords.push(word);
  }
}

console.log('当前app.js中Informer词汇数量:', informerWords.length);
console.log('\n当前Informer词汇列表:');
informerWords.forEach((word, index) => {
  console.log(`${index + 1}. ${word}`);
});

console.log('\n源文档中的32个词汇:');
sourceWords.forEach((word, index) => {
  console.log(`${index + 1}. ${word}`);
});

// 找出多余的词汇
const extraWords = informerWords.filter(word => !sourceWords.includes(word));
console.log('\n多余的词汇 (不在源文档中):');
extraWords.forEach((word, index) => {
  console.log(`${index + 1}. ${word}`);
});

// 找出缺失的词汇
const missingWords = sourceWords.filter(word => !informerWords.includes(word));
console.log('\n缺失的词汇 (在源文档中但不在app.js中):');
missingWords.forEach((word, index) => {
  console.log(`${index + 1}. ${word}`);
});

// 统计重复的词汇
const wordCount = {};
informerWords.forEach(word => {
  wordCount[word] = (wordCount[word] || 0) + 1;
});

const duplicates = Object.entries(wordCount).filter(([word, count]) => count > 1);
console.log('\n重复的词汇:');
duplicates.forEach(([word, count]) => {
  console.log(`${word}: ${count}次`);
});
