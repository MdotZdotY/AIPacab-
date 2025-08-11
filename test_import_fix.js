const fs = require('fs');

// 解析词汇清单
function parseVocabularyFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const words = [];
  let currentCategory = '';
  let currentWord = null;
  let wordId = 1;
  let inVocabularySection = false;

  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测是否进入词汇部分
    if (line.includes('### **3\. 论文词汇清单**')) {
      inVocabularySection = true;
      continue;
    }
    
    // 只在词汇部分解析
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

    // 检测新词汇（以*开头）
    if (line.startsWith('* **') && line.includes('**')) {
      // 保存前一个词汇
      if (currentWord && currentWord.word) {
        words.push(currentWord);
      }
      
      // 开始新词汇
      const wordMatch = line.match(/\*\*([^*]+)\*\*/);
      if (wordMatch) {
        currentWord = {
          id: wordId++,
          word: wordMatch[1].trim(),
          category: currentCategory,
          pronunciation: '',
          meaning: '',
          englishMeaning: '',
          sentence: '',
          translation: '',
          paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
          difficulty: getDifficulty(wordMatch[1].trim()),
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
      if (line.includes('**英文释义**:')) {
        const match = line.match(/\*\*英文释义\*\*: (.+)/);
        if (match) {
          currentWord.englishMeaning = match[1].trim();
        }
      } else if (line.includes('**中文释义**:')) {
        const match = line.match(/\*\*中文释义\*\*: (.+)/);
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
      } else if (line.includes('**在论文中的例句**:')) {
        const match = line.match(/\*\*在论文中的例句\*\*: (.+)/);
        if (match) {
          currentWord.sentence = match[1].trim();
        }
      } else if (line.includes('**例句中文翻译**:')) {
        const match = line.match(/\*\*例句中文翻译\*\*: (.+)/);
        if (match) {
          currentWord.translation = match[1].trim();
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

// 测试解析
const filePath = 'vocabulary/Learning the Bitter Lesson_ Empirical Evidence from 20 Years of CVPR Proceedings.md';
const words = parseVocabularyFromFile(filePath);

console.log('解析到的词汇数量:', words.length);
console.log('\n前3个词汇的详细信息:');
words.slice(0, 3).forEach((word, i) => {
  console.log(`${i+1}. ${word.word}`);
  console.log(`   分类: ${word.category}`);
  console.log(`   中文释义: ${word.meaning}`);
  console.log(`   英文释义: ${word.englishMeaning}`);
  console.log(`   例句: ${word.sentence}`);
  console.log(`   例句翻译: ${word.translation}`);
  console.log('');
});

console.log('有例句翻译的词汇数量:', words.filter(w => w.translation).length);
console.log('没有例句翻译的词汇数量:', words.filter(w => !w.translation).length);