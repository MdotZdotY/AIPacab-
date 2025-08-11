// verify_vocabulary_count.js
// 验证词汇数量

const fs = require('fs');
const path = require('path');

function verifyVocabularyCount() {
  const appJsPath = path.join(__dirname, 'app.js');
  const content = fs.readFileSync(appJsPath, 'utf8');
  
  // 计算id的数量
  const idMatches = content.match(/id:\s*\d+/g);
  const totalWords = idMatches ? idMatches.length : 0;
  
  console.log(`总词汇数: ${totalWords}个`);
  
  // 按分类统计
  const categoryMatches = content.match(/category:\s*'([^']+)'/g);
  const categories = {};
  if (categoryMatches) {
    categoryMatches.forEach(match => {
      const category = match.match(/category:\s*'([^']+)'/)[1];
      categories[category] = (categories[category] || 0) + 1;
    });
  }
  
  console.log('\n按分类统计:');
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`- ${category}: ${count}个`);
  });
  
  // 按论文统计
  const paperMatches = content.match(/paperTitle:\s*'([^']+)'/g);
  const papers = {};
  if (paperMatches) {
    paperMatches.forEach(match => {
      const paper = match.match(/paperTitle:\s*'([^']+)'/)[1];
      papers[paper] = (papers[paper] || 0) + 1;
    });
  }
  
  console.log('\n按论文统计:');
  Object.entries(papers).forEach(([paper, count]) => {
    console.log(`- ${paper}: ${count}个`);
  });
  
  return { totalWords, categories, papers };
}

if (require.main === module) {
  verifyVocabularyCount();
}

module.exports = { verifyVocabularyCount };