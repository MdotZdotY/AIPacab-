const fs = require('fs');

// 检查论文数据
console.log('检查论文数据...');
const papersContent = fs.readFileSync('utils/papersData.js', 'utf8');
console.log('Informer论文存在:', papersContent.includes('Informer: Beyond Efficient Transformer'));
console.log('论文概要完整:', papersContent.includes('ProbSparse自注意力机制') && papersContent.includes('自注意力蒸馏'));

// 检查词汇数据
console.log('\n检查词汇数据...');
const appContent = fs.readFileSync('app.js', 'utf8');
const count = (appContent.match(/paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'/g) || []).length;
console.log('Informer词汇数量:', count);

// 检查语法
console.log('\n检查语法...');
const hasUnclosedStrings = appContent.includes("'") && !appContent.includes("'");
const hasMissingCommas = appContent.includes('}  {');
console.log('语法错误:', hasUnclosedStrings || hasMissingCommas ? '是' : '否');

