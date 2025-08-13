const fs = require('fs');

const content = fs.readFileSync('app.js', 'utf8');
const matches = content.match(/paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'/g);
console.log('当前Informer词汇数量:', matches ? matches.length : 0);
