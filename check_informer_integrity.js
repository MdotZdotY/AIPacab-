const fs = require('fs');

// 读取app.js文件
const content = fs.readFileSync('app.js', 'utf8');

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

// 检查每个词汇对象的完整性
const requiredFields = ['id', 'word', 'englishMeaning', 'meaning', 'partOfSpeech', 'pronunciation', 'sentence', 'translation', 'paperTitle', 'category', 'difficulty', 'studyCount', 'correctCount', 'lastStudyTime', 'status', 'weeklyStudyCount'];

console.log('\n检查Informer词汇完整性:');
console.log('='.repeat(80));

let incompleteWords = [];

for (const obj of informerObjects) {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!obj.fullObject.includes(`${field}:`)) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    incompleteWords.push({
      word: obj.word,
      missingFields: missingFields
    });
    console.log(`❌ ${obj.word}: 缺少字段 - ${missingFields.join(', ')}`);
  } else {
    console.log(`✅ ${obj.word}: 完整`);
  }
}

console.log('\n总结:');
console.log(`总Informer词汇数: ${informerObjects.length}`);
console.log(`完整词汇数: ${informerObjects.length - incompleteWords.length}`);
console.log(`不完整词汇数: ${incompleteWords.length}`);

if (incompleteWords.length > 0) {
  console.log('\n不完整的词汇列表:');
  incompleteWords.forEach(item => {
    console.log(`- ${item.word}: 缺少 ${item.missingFields.join(', ')}`);
  });
}
