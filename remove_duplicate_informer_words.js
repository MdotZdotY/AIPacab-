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

// 查找所有Informer相关的词汇对象
const informerObjects = [];
const regex = /(\{[^}]*word:\s*'([^']+)'[^}]*paperTitle:\s*'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'[^}]*\})/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const fullObject = match[1];
  const word = match[2];
  informerObjects.push({ word, fullObject });
}

console.log(`找到 ${informerObjects.length} 个Informer词汇对象`);

// 保留第一个出现的每个词汇，删除重复的
const seenWords = new Set();
const keepObjects = [];
const removeObjects = [];

for (const obj of informerObjects) {
  if (seenWords.has(obj.word)) {
    removeObjects.push(obj);
  } else {
    seenWords.add(obj.word);
    keepObjects.push(obj);
  }
}

console.log(`保留 ${keepObjects.length} 个词汇对象`);
console.log(`删除 ${removeObjects.length} 个重复词汇对象`);

// 从app.js中删除重复的对象
let newContent = content;
for (const obj of removeObjects) {
  newContent = newContent.replace(obj.fullObject, '');
}

// 清理多余的空行
newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');

// 写回文件
fs.writeFileSync('app.js', newContent, 'utf8');

console.log('重复的Informer词汇已删除！');
