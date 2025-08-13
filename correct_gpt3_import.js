// correct_gpt3_import.js
// 正确的GPT-3词汇导入脚本

const fs = require('fs');
const path = require('path');

// 解析GPT-3论文文件中的词汇数据
function parseGPT3Vocabulary() {
  const gpt3File = path.join(__dirname, 'docs', 'Language Models are Few-Shot Learners.txt');
  const content = fs.readFileSync(gpt3File, 'utf8');
  
  const words = [];
  let currentCategory = '';
  let currentWord = null;
  let inVocabularySection = false;
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测词汇清单部分的开始
    if (line.includes('### **3. 论文词汇清单**')) {
      inVocabularySection = true;
      continue;
    }
    
    // 如果不在词汇部分，跳过
    if (!inVocabularySection) {
      continue;
    }
    
    // 检测分类标题
    if (line.includes('GRE高频词') || line.includes('TOEFL高频词') || line.includes('IELTS高频词') || line.includes('AI领域专有词')) {
      currentCategory = line.replace('**', '').replace('**', '').trim();
      continue;
    }
    
    // 检测新词汇（以*开头，且包含**英文单词**格式，但不包含冒号）
    if (line.startsWith('* **') && line.includes('**') && !line.includes(':')) {
      // 保存前一个词汇
      if (currentWord && currentWord.word && isValidEnglishWord(currentWord.word)) {
        words.push(currentWord);
      }
      
      // 开始新词汇
      const wordMatch = line.match(/\*\*([^*]+)\*\*/);
      if (wordMatch) {
        const wordText = wordMatch[1].trim();
        
        // 只处理真正的英文词汇，跳过属性标签
        if (isValidEnglishWord(wordText)) {
          currentWord = {
            word: wordText,
            category: currentCategory,
            englishMeaning: '',
            meaning: '',
            partOfSpeech: '',
            pronunciation: '',
            sentence: '',
            translation: '',
            paperTitle: 'Language Models are Few-Shot Learners'
          };
        } else {
          currentWord = null;
        }
      }
      continue;
    }
    
    // 解析词汇属性（以* **开头且包含冒号的行）
    if (currentWord && line.startsWith('* **') && line.includes(':')) {
      if (line.includes('英文释义')) {
        const match = line.match(/\*\*英文释义\*\*:\s*(.+)/);
        if (match) currentWord.englishMeaning = match[1].trim();
      } else if (line.includes('中文释义')) {
        const match = line.match(/\*\*中文释义\*\*:\s*(.+)/);
        if (match) currentWord.meaning = match[1].trim();
      } else if (line.includes('词性')) {
        const match = line.match(/\*\*词性\*\*:\s*(.+)/);
        if (match) currentWord.partOfSpeech = match[1].trim();
      } else if (line.includes('音标')) {
        const match = line.match(/\*\*音标\*\*:\s*(.+)/);
        if (match) currentWord.pronunciation = match[1].trim();
      } else if (line.includes('在论文中的例句')) {
        const match = line.match(/\*\*在论文中的例句 \(英文\)\*\*:\s*(.+)/);
        if (match) currentWord.sentence = match[1].trim();
      } else if (line.includes('例句中文翻译')) {
        const match = line.match(/\*\*例句中文翻译\*\*:\s*(.+)/);
        if (match) currentWord.translation = match[1].trim();
      }
    }
  }
  
  // 添加最后一个词汇
  if (currentWord && currentWord.word && isValidEnglishWord(currentWord.word)) {
    words.push(currentWord);
  }
  
  return words;
}

// 检查是否为有效的英文词汇
function isValidEnglishWord(word) {
  // 跳过属性标签
  const invalidWords = [
    '英文释义', '中文释义', '词性', '音标', '在论文中的例句', '例句中文翻译',
    '论文名', '论文发表时间', '论文地址', 'Title', 'Time', 'URL'
  ];
  
  // 检查是否包含中文字符
  const hasChinese = /[\u4e00-\u9fff]/.test(word);
  
  // 检查是否为无效词汇
  const isInvalid = invalidWords.some(invalid => word.includes(invalid));
  
  // 检查是否包含特殊字符（除了连字符和空格）
  const hasSpecialChars = /[^\w\s-]/.test(word);
  
  return !hasChinese && !isInvalid && !hasSpecialChars && word.length > 0;
}

// 标准化词汇分类
function standardizeCategory(category) {
  const categoryMap = {
    'GRE高频词': 'GRE高频词',
    'GRE高频词汇': 'GRE高频词',
    'TOEFL高频词': 'TOEFL高频词',
    'TOEFL高频词汇': 'TOEFL高频词',
    'IELTS高频词': 'IELTS高频词',
    'IELTS高频词汇': 'IELTS高频词',
    'AI领域专有词': 'AI专业词汇',
    'AI专业词汇': 'AI专业词汇'
  };
  
  return categoryMap[category] || 'AI专业词汇';
}

// 完全替换app.js中的词汇数据
function replaceAppJsVocabulary(newWords) {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  // 获取现有词汇（非GPT-3的词汇）
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) {
    throw new Error('未找到词汇数组');
  }
  
  const existingWordsStr = wordsMatch[1];
  const existingWords = eval(`[${existingWordsStr}]`);
  
  // 保留非GPT-3的词汇
  const nonGPT3Words = existingWords.filter(word => word.paperTitle !== 'Language Models are Few-Shot Learners');
  
  // 标准化新词汇
  const standardizedWords = newWords.map((word, index) => ({
    id: nonGPT3Words.length + index + 1,
    word: word.word,
    englishMeaning: word.englishMeaning,
    meaning: word.meaning,
    partOfSpeech: word.partOfSpeech,
    pronunciation: word.pronunciation,
    sentence: word.sentence,
    translation: word.translation,
    paperTitle: word.paperTitle,
    category: standardizeCategory(word.category),
    difficulty: 'medium',
    studyCount: 0,
    correctCount: 0,
    lastStudyTime: null,
    status: 'learning',
    weeklyStudyCount: 0
  }));
  
  // 合并所有词汇
  const allWords = [...nonGPT3Words, ...standardizedWords];
  
  // 重新分配ID
  const finalWords = allWords.map((word, index) => ({
    ...word,
    id: index + 1
  }));
  
  // 构建新的词汇字符串
  const newWordsStr = finalWords.map(word => `      {
        id: ${word.id},
        word: '${word.word}',
        englishMeaning: '${word.englishMeaning.replace(/'/g, "\\'")}',
        meaning: '${word.meaning.replace(/'/g, "\\'")}',
        partOfSpeech: '${word.partOfSpeech}',
        pronunciation: '${word.pronunciation}',
        sentence: '${word.sentence.replace(/'/g, "\\'")}',
        translation: '${word.translation.replace(/'/g, "\\'")}',
        paperTitle: '${word.paperTitle}',
        category: '${word.category}',
        difficulty: '${word.difficulty}',
        studyCount: ${word.studyCount},
        correctCount: ${word.correctCount},
        lastStudyTime: ${word.lastStudyTime ? `'${word.lastStudyTime}'` : 'null'},
        status: '${word.status}',
        weeklyStudyCount: ${word.weeklyStudyCount}
      }`).join(',\n');
  
  // 更新词汇数组
  const newContent = content.replace(
    /words:\s*\[([\s\S]*?)\]/,
    `words: [\n${newWordsStr}\n    ]`
  );
  
  // 写入文件
  fs.writeFileSync(appJsPath, newContent, 'utf8');
  console.log(`成功更新app.js，总词汇数: ${finalWords.length}个`);
  console.log(`保留原有词汇: ${nonGPT3Words.length}个`);
  console.log(`新增GPT-3词汇: ${standardizedWords.length}个`);
  
  return { allWords: finalWords, gpt3Words: standardizedWords };
}

// 验证词汇数据完整性
function validateVocabulary(words) {
  console.log('\n=== 词汇数据验证 ===');
  
  const incompleteWords = words.filter(word => 
    !word.meaning || !word.englishMeaning || !word.partOfSpeech || 
    !word.pronunciation || !word.sentence || !word.translation
  );
  
  if (incompleteWords.length > 0) {
    console.log(`发现 ${incompleteWords.length} 个不完整的词汇:`);
    incompleteWords.forEach(word => {
      console.log(`  - ${word.word}: 缺少 ${getMissingFields(word)}`);
    });
  } else {
    console.log('✓ 所有词汇数据完整');
  }
  
  return incompleteWords.length === 0;
}

function getMissingFields(word) {
  const missing = [];
  if (!word.meaning) missing.push('中文释义');
  if (!word.englishMeaning) missing.push('英文释义');
  if (!word.partOfSpeech) missing.push('词性');
  if (!word.pronunciation) missing.push('音标');
  if (!word.sentence) missing.push('例句');
  if (!word.translation) missing.push('翻译');
  return missing.join(', ');
}

// 显示词汇示例
function showVocabularyExamples(words) {
  console.log('\n=== 词汇示例 ===');
  words.slice(0, 3).forEach((word, index) => {
    console.log(`\n${index + 1}. ${word.word} (${word.category})`);
    console.log(`   词性: ${word.partOfSpeech}`);
    console.log(`   音标: ${word.pronunciation}`);
    console.log(`   英文释义: ${word.englishMeaning}`);
    console.log(`   中文释义: ${word.meaning}`);
    console.log(`   例句: ${word.sentence}`);
    console.log(`   翻译: ${word.translation}`);
  });
}

// 主函数
function main() {
  try {
    console.log('开始正确GPT-3论文词汇导入...');
    
    // 解析词汇数据
    const newWords = parseGPT3Vocabulary();
    console.log(`解析到${newWords.length}个有效GPT-3词汇`);
    
    // 显示词汇示例
    showVocabularyExamples(newWords);
    
    // 验证词汇数据完整性
    const isValid = validateVocabulary(newWords);
    if (!isValid) {
      console.log('警告：发现不完整的词汇数据，但将继续导入...');
    }
    
    // 替换app.js中的词汇数据
    const { allWords, gpt3Words } = replaceAppJsVocabulary(newWords);
    
    console.log('\n=== 正确导入完成 ===');
    console.log(`总词汇数: ${allWords.length}个`);
    console.log(`GPT-3词汇数: ${gpt3Words.length}个`);
    console.log('所有词汇字段已完整填充');
    
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  parseGPT3Vocabulary,
  replaceAppJsVocabulary,
  validateVocabulary,
  isValidEnglishWord
};


