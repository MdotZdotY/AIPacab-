const fs = require('fs');

// 读取app.js文件
const content = fs.readFileSync('app.js', 'utf8');

// 查找所有词汇对象
const wordObjects = [];
const regex = /(\{[^}]*word:\s*'([^']+)'[^}]*\})/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const fullObject = match[1];
  const word = match[2];
  wordObjects.push({ word, fullObject });
}

console.log(`找到 ${wordObjects.length} 个词汇对象`);

// 检查每个词汇对象的完整性
const requiredFields = ['id', 'word', 'englishMeaning', 'meaning', 'partOfSpeech', 'pronunciation', 'sentence', 'translation', 'paperTitle', 'category', 'difficulty', 'studyCount', 'correctCount', 'lastStudyTime', 'status', 'weeklyStudyCount'];

console.log('\n检查所有词汇完整性:');
console.log('='.repeat(80));

let incompleteWords = [];
let missingIdWords = [];

for (const obj of wordObjects) {
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
    
    // 特别关注缺少id字段的词汇
    if (missingFields.includes('id')) {
      missingIdWords.push(obj.word);
      console.log(`❌ ${obj.word}: 缺少字段 - ${missingFields.join(', ')}`);
    }
  }
}

console.log('\n总结:');
console.log(`总词汇数: ${wordObjects.length}`);
console.log(`完整词汇数: ${wordObjects.length - incompleteWords.length}`);
console.log(`不完整词汇数: ${incompleteWords.length}`);
console.log(`缺少id字段的词汇数: ${missingIdWords.length}`);

if (missingIdWords.length > 0) {
  console.log('\n缺少id字段的词汇列表:');
  missingIdWords.forEach(word => {
    console.log(`- ${word}`);
  });
}

if (incompleteWords.length > 0) {
  console.log('\n所有不完整的词汇:');
  incompleteWords.forEach(item => {
    console.log(`- ${item.word}: 缺少 ${item.missingFields.join(', ')}`);
  });
}
