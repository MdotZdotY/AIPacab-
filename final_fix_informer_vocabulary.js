// final_fix_informer_vocabulary.js
// 最终修复Informer论文词汇解析问题

const fs = require('fs');
const path = require('path');

// 正确解析Informer论文文件中的词汇数据
function parseInformerVocabulary() {
  const informerFile = path.join(__dirname, 'docs', 'Informer Beyond Efficient Transformer for Long Sequence Time-Series Forecasting.txt');
  const content = fs.readFileSync(informerFile, 'utf8');
  
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
    if (line.includes('#### **GRE高频词**')) {
      currentCategory = 'GRE高频词';
      continue;
    } else if (line.includes('#### **TOEFL高频词**')) {
      currentCategory = 'TOEFL高频词';
      continue;
    } else if (line.includes('#### **IELTS高频词**')) {
      currentCategory = 'IELTS高频词';
      continue;
    } else if (line.includes('#### **AI领域专有词**')) {
      currentCategory = 'AI专业词汇';
      continue;
    }
    
    // 检测新词汇（以*开头，且包含**英文单词**格式）
    if (line.startsWith('* **') && line.includes('**')) {
      // 保存前一个词汇
      if (currentWord && currentWord.word && currentWord.word.length > 0) {
        words.push(currentWord);
      }
      
      // 开始新词汇
      const wordMatch = line.match(/\*\*([^*]+)\*\*/);
      if (wordMatch) {
        const wordText = wordMatch[1].trim();
        // 跳过论文基本信息（如"论文名 (Title)"等）
        if (wordText.includes('论文') || wordText.includes('Title') || wordText.includes('Time') || wordText.includes('URL')) {
          currentWord = null;
          continue;
        }
        
        currentWord = {
          word: wordText,
          category: currentCategory,
          englishMeaning: '',
          meaning: '',
          partOfSpeech: '',
          pronunciation: '',
          sentence: '',
          translation: '',
          paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'
        };
      }
      continue;
    }
    
    // 解析词汇属性（使用更精确的匹配）
    if (currentWord && line.includes('**')) {
      if (line.includes('**英文释义**:')) {
        const match = line.match(/\*\*英文释义\*\*:\s*(.+)/);
        if (match) currentWord.englishMeaning = match[1].trim();
      } else if (line.includes('**中文释义**:')) {
        const match = line.match(/\*\*中文释义\*\*:\s*(.+)/);
        if (match) currentWord.meaning = match[1].trim();
      } else if (line.includes('**词性**:')) {
        const match = line.match(/\*\*词性\*\*:\s*(.+)/);
        if (match) currentWord.partOfSpeech = match[1].trim();
      } else if (line.includes('**音标**:')) {
        const match = line.match(/\*\*音标\*\*:\s*(.+)/);
        if (match) currentWord.pronunciation = match[1].trim();
      } else if (line.includes('**在论文中的例句 (英文)**:')) {
        const match = line.match(/\*\*在论文中的例句 \(英文\)\*\*:\s*(.+)/);
        if (match) currentWord.sentence = match[1].trim();
      } else if (line.includes('**例句中文翻译**:')) {
        const match = line.match(/\*\*例句中文翻译\*\*:\s*(.+)/);
        if (match) currentWord.translation = match[1].trim();
      }
    }
  }
  
  // 添加最后一个词汇
  if (currentWord && currentWord.word && currentWord.word.length > 0) {
    words.push(currentWord);
  }
  
  // 过滤掉无效的词汇
  return words.filter(word => 
    word.word && 
    word.word.length > 0 && 
    !word.word.includes('英文释义') && 
    !word.word.includes('中文释义') && 
    !word.word.includes('词性') && 
    !word.word.includes('音标') && 
    !word.word.includes('例句中文翻译') &&
    !word.word.includes('在论文中的例句')
  );
}

// 清理app.js中的错误词汇数据
function cleanAppJsVocabulary() {
  const appJsPath = path.join(__dirname, 'app.js');
  const content = fs.readFileSync(appJsPath, 'utf8');
  
  // 找到words数组的位置
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) {
    console.error('无法找到words数组');
    return;
  }
  
  const wordsArray = wordsMatch[1];
  
  // 移除所有Informer相关的错误词汇
  const cleanedWordsArray = wordsArray.replace(
    /\s*\{\s*id:\s*\d+,\s*word:\s*'[^']*',\s*englishMeaning:\s*'[^']*',\s*meaning:\s*'[^']*',\s*partOfSpeech:\s*'[^']*',\s*pronunciation:\s*'[^']*',\s*sentence:\s*'[^']*',\s*translation:\s*'[^']*',\s*paperTitle:\s*'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting',\s*category:\s*'[^']*',\s*difficulty:\s*'[^']*',\s*studyCount:\s*\d+,\s*correctCount:\s*\d+,\s*lastStudyTime:\s*[^,]+,\s*status:\s*'[^']*',\s*weeklyStudyCount:\s*\d+\s*\},?/g,
    ''
  );
  
  const newContent = content.replace(
    /words:\s*\[([\s\S]*?)\]/,
    `words: [${cleanedWordsArray}]`
  );
  
  fs.writeFileSync(appJsPath, newContent, 'utf8');
  console.log('已清理app.js中的错误词汇数据');
}

// 添加正确的词汇数据
function addCorrectVocabulary() {
  const appJsPath = path.join(__dirname, 'app.js');
  const content = fs.readFileSync(appJsPath, 'utf8');
  
  const words = parseInformerVocabulary();
  
  // 为每个词汇添加必要的字段
  const processedWords = words.map((word, index) => ({
    ...word,
    id: Date.now() + index, // 生成唯一ID
    difficulty: 'medium',
    studyCount: 0,
    correctCount: 0,
    lastStudyTime: null,
    status: 'learning',
    weeklyStudyCount: 0
  }));
  
  // 找到words数组的位置
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) {
    console.error('无法找到words数组');
    return;
  }
  
  const wordsArray = wordsMatch[1];
  const existingWordsCount = (wordsArray.match(/\{/g) || []).length;
  
  // 生成新词汇的字符串表示
  const newWordsStr = processedWords.map(word => {
    return `      {
        id: ${word.id},
        word: '${word.word}',
        englishMeaning: '${word.englishMeaning}',
        meaning: '${word.meaning}',
        partOfSpeech: '${word.partOfSpeech}',
        pronunciation: '${word.pronunciation}',
        sentence: '${word.sentence}',
        translation: '${word.translation}',
        paperTitle: '${word.paperTitle}',
        category: '${word.category}',
        difficulty: '${word.difficulty}',
        studyCount: ${word.studyCount},
        correctCount: ${word.correctCount},
        lastStudyTime: ${word.lastStudyTime},
        status: '${word.status}',
        weeklyStudyCount: ${word.weeklyStudyCount}
      }`;
  }).join(',\n');
  
  const newContent = content.replace(
    /words:\s*\[([\s\S]*?)\]/,
    `words: [\n$1${existingWordsCount > 0 ? ',' : ''}\n${newWordsStr}\n    ]`
  );
  
  fs.writeFileSync(appJsPath, newContent, 'utf8');
  console.log('词汇数据已更新到 app.js');
  console.log(`成功添加 ${processedWords.length} 个新词汇`);
  
  // 打印前几个词汇作为验证
  console.log('\n前5个词汇示例:');
  processedWords.slice(0, 5).forEach((word, index) => {
    console.log(`${index + 1}. ${word.word} - ${word.meaning} (${word.category})`);
  });
}

// 主函数
function main() {
  try {
    console.log('开始最终修复Informer论文词汇数据...');
    
    // 清理错误的词汇数据
    cleanAppJsVocabulary();
    
    // 添加正确的词汇数据
    addCorrectVocabulary();
    
    console.log('Informer论文词汇数据最终修复完成！');
  } catch (error) {
    console.error('修复过程中发生错误:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseInformerVocabulary,
  cleanAppJsVocabulary,
  addCorrectVocabulary
};

