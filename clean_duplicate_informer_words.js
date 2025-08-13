const fs = require('fs');

// 读取app.js文件
const content = fs.readFileSync('app.js', 'utf8');

// 解析app.js中的词汇数据
const wordsMatch = content.match(/words: \[([\s\S]*?)\]/);
if (!wordsMatch) {
  console.log('无法找到words数组');
  process.exit(1);
}

// 提取words数组的内容
const wordsContent = wordsMatch[1];

// 分割每个词汇对象
const wordObjects = [];
let currentObject = '';
let braceCount = 0;
let inString = false;
let escapeNext = false;

for (let i = 0; i < wordsContent.length; i++) {
  const char = wordsContent[i];
  
  if (escapeNext) {
    currentObject += char;
    escapeNext = false;
    continue;
  }
  
  if (char === '\\') {
    escapeNext = true;
    currentObject += char;
    continue;
  }
  
  if (char === '"' || char === "'") {
    inString = !inString;
    currentObject += char;
    continue;
  }
  
  if (!inString) {
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
    }
  }
  
  currentObject += char;
  
  if (braceCount === 0 && currentObject.trim()) {
    wordObjects.push(currentObject.trim());
    currentObject = '';
  }
}

// 解析每个词汇对象
const words = [];
const seenWords = new Set();
const informerWords = [];

for (const objStr of wordObjects) {
  if (!objStr.startsWith('{') || !objStr.endsWith('}')) continue;
  
  try {
    // 提取word字段
    const wordMatch = objStr.match(/word:\s*'([^']+)'/);
    if (!wordMatch) continue;
    
    const word = wordMatch[1];
    
    // 检查是否是Informer论文的词汇
    const isInformer = objStr.includes("paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'");
    
    if (isInformer) {
      informerWords.push({
        word,
        object: objStr,
        hasCompleteData: objStr.includes('englishMeaning:') && 
                        objStr.includes('meaning:') && 
                        !objStr.includes("englishMeaning: ''") &&
                        !objStr.includes("meaning: ''")
      });
    }
    
    // 检查是否已经见过这个词汇
    if (seenWords.has(word)) {
      console.log(`发现重复词汇: ${word}`);
      continue;
    }
    
    seenWords.add(word);
    words.push(objStr);
    
  } catch (error) {
    console.log('解析词汇对象时出错:', error.message);
  }
}

console.log(`总共找到 ${informerWords.length} 个Informer相关词汇`);
console.log(`其中 ${informerWords.filter(w => w.hasCompleteData).length} 个有完整数据`);

// 清理重复的Informer词汇，只保留有完整数据的版本
const cleanedInformerWords = [];
const wordGroups = {};

for (const informerWord of informerWords) {
  if (!wordGroups[informerWord.word]) {
    wordGroups[informerWord.word] = [];
  }
  wordGroups[informerWord.word].push(informerWord);
}

for (const [word, group] of Object.entries(wordGroups)) {
  if (group.length > 1) {
    console.log(`词汇 "${word}" 有 ${group.length} 个版本`);
    
    // 优先选择有完整数据的版本
    const completeVersion = group.find(w => w.hasCompleteData);
    if (completeVersion) {
      cleanedInformerWords.push(completeVersion);
      console.log(`  保留完整版本`);
    } else {
      // 如果没有完整版本，保留第一个
      cleanedInformerWords.push(group[0]);
      console.log(`  保留第一个版本（需要补充数据）`);
    }
  } else {
    cleanedInformerWords.push(group[0]);
  }
}

console.log(`清理后剩余 ${cleanedInformerWords.length} 个Informer词汇`);

// 重建words数组
const cleanedWords = [];
const cleanedInformerWordSet = new Set(cleanedInformerWords.map(w => w.word));

for (const objStr of wordObjects) {
  if (!objStr.startsWith('{') || !objStr.endsWith('}')) continue;
  
  try {
    const wordMatch = objStr.match(/word:\s*'([^']+)'/);
    if (!wordMatch) continue;
    
    const word = wordMatch[1];
    const isInformer = objStr.includes("paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'");
    
    if (isInformer) {
      // 只保留清理后的Informer词汇
      if (cleanedInformerWordSet.has(word)) {
        const cleanedVersion = cleanedInformerWords.find(w => w.word === word);
        cleanedWords.push(cleanedVersion.object);
      }
    } else {
      // 保留非Informer词汇
      cleanedWords.push(objStr);
    }
    
  } catch (error) {
    console.log('处理词汇对象时出错:', error.message);
  }
}

// 重建app.js内容
const newWordsArray = `words: [\n      ${cleanedWords.join(',\n      ')}\n    ]`;
const newContent = content.replace(/words: \[[\s\S]*?\]/, newWordsArray);

// 写回文件
fs.writeFileSync('app.js', newContent, 'utf8');

console.log('清理完成！');
console.log(`原始Informer词汇数量: ${informerWords.length}`);
console.log(`清理后Informer词汇数量: ${cleanedInformerWords.length}`);
console.log(`总词汇数量: ${cleanedWords.length}`);

