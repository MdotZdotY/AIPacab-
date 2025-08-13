const fs = require('fs');

const content = fs.readFileSync('app.js', 'utf8');
const wordMatches = content.match(/word:\s*'[^']+'/g);
console.log('总词汇数量:', wordMatches ? wordMatches.length : 0);
