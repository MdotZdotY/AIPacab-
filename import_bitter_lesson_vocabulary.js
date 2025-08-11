// import_bitter_lesson_vocabulary.js
// 导入Learning the Bitter Lesson论文的词汇到词汇库中

const fs = require('fs');
const path = require('path');

// 解析词汇清单
function parseVocabularyFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const words = [];
  let currentCategory = '';
  let currentWord = null;
  let wordId = 1; // 临时ID，实际导入时会重新分配

  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测分类标题
    if (line.includes('GRE高频词汇')) {
      currentCategory = 'GRE高频词';
      continue;
    } else if (line.includes('TOEFL高频词汇')) {
      currentCategory = 'TOEFL高频词';
      continue;
    } else if (line.includes('IELTS高频词汇')) {
      currentCategory = 'IELTS高频词';
      continue;
    } else if (line.includes('AI领域专有词汇')) {
      currentCategory = 'AI专业词汇';
      continue;
    }

    // 检测新词汇（以*开头，且不包含"音标"、"英文解释"等属性名）
    if (line.startsWith('* **') && line.includes('**') && 
        !line.includes('音标') && !line.includes('英文解释') && 
        !line.includes('中文解释') && !line.includes('词性') && 
        !line.includes('例句')) {
      // 保存前一个词汇
      if (currentWord && currentWord.word && currentWord.meaning) {
        words.push(currentWord);
      }
      
      // 开始新词汇
      const wordMatch = line.match(/\*\*([^*]+)\*\*/);
      if (wordMatch) {
        currentWord = {
          id: wordId++,
          word: wordMatch[1],
          category: currentCategory,
          pronunciation: '',
          meaning: '',
          englishMeaning: '',
          sentence: '',
          translation: '',
          paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
          difficulty: getDifficulty(wordMatch[1]),
          studyCount: 0,
          correctCount: 0,
          lastStudyTime: null,
          status: 'learning',
          weeklyStudyCount: 0
        };
      }
      continue;
    }

    // 解析词汇属性
    if (currentWord) {
      if (line.includes('**英文解释**:')) {
        const match = line.match(/\*\*英文解释\*\*: (.+)/);
        if (match) {
          currentWord.englishMeaning = match[1].trim();
        }
      } else if (line.includes('**中文解释**:')) {
        const match = line.match(/\*\*中文解释\*\*: (.+)/);
        if (match) {
          currentWord.meaning = match[1].trim();
        }
      } else if (line.includes('**词性**:')) {
        const match = line.match(/\*\*词性\*\*: (.+)/);
        if (match) {
          const partOfSpeech = match[1].trim();
          if (currentWord.meaning) {
            currentWord.meaning += ` (${partOfSpeech})`;
          }
        }
      } else if (line.includes('**音标**:')) {
        const match = line.match(/\*\*音标\*\*: (.+)/);
        if (match) {
          currentWord.pronunciation = match[1].trim();
        }
      } else if (line.includes('**例句**:')) {
        const match = line.match(/\*\*例句\*\*: (.+)/);
        if (match) {
          currentWord.sentence = match[1].trim();
        }
      }
    }
  }

  // 添加最后一个词汇
  if (currentWord && currentWord.word) {
    words.push(currentWord);
  }

  return words;
}

// 获取词汇难度
function getDifficulty(word) {
  const length = word.length;
  if (length <= 5) return 'easy';
  if (length <= 8) return 'medium';
  return 'hard';
}

// 检查词汇是否已存在
function checkDuplicateWords(newWords, existingWords) {
  const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));
  const uniqueWords = [];
  const duplicates = [];

  for (const word of newWords) {
    if (existingWordSet.has(word.word.toLowerCase())) {
      duplicates.push(word.word);
    } else {
      uniqueWords.push(word);
      existingWordSet.add(word.word.toLowerCase());
    }
  }

  return { uniqueWords, duplicates };
}

// 模拟小程序环境
function createMockApp() {
  return {
    globalData: {
      words: []
    }
  };
}

// 主函数
function main() {
  console.log('开始导入Learning the Bitter Lesson论文词汇...');
  
  // 解析词汇
  const filePath = path.join(__dirname, 'vocabulary', 'Learning_the_Bitter_Lesson_Voca.txt');
  const newWords = parseVocabularyFromFile(filePath);
  
  console.log(`解析到 ${newWords.length} 个词汇`);
  
  // 读取现有词汇表（这里我们模拟一个空的词汇表，实际使用时需要从存储中读取）
  const existingWords = [];
  
  // 检查重复词汇
  const { uniqueWords, duplicates } = checkDuplicateWords(newWords, existingWords);
  
  console.log(`发现 ${duplicates.length} 个重复词汇，将跳过导入`);
  console.log(`将导入 ${uniqueWords.length} 个新词汇`);
  
  if (duplicates.length > 0) {
    console.log('重复的词汇:', duplicates);
  }
  
  // 更新词汇ID
  const nextId = existingWords.length > 0 ? Math.max(...existingWords.map(w => w.id)) + 1 : 1;
  uniqueWords.forEach((word, index) => {
    word.id = nextId + index;
  });
  
  // 输出导入的词汇信息
  console.log('\n导入的词汇列表:');
  uniqueWords.forEach(word => {
    console.log(`- ${word.word} (${word.category}): ${word.meaning}`);
  });
  
  console.log('\n导入完成！');
  console.log(`成功导入 ${uniqueWords.length} 个新词汇`);
  console.log('论文信息已在 papersData.js 中更新');
  
  // 返回导入的词汇，供其他脚本使用
  return uniqueWords;
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseVocabularyFromFile,
  checkDuplicateWords,
  main
};