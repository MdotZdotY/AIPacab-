// import_informer_paper.js
// 将《Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting》论文的词汇和论文信息导入到现有系统中

const fs = require('fs');
const path = require('path');

// 解析Informer论文文件中的词汇数据
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
    if (line.includes('GRE高频词') || line.includes('TOEFL高频词') || line.includes('IELTS高频词') || line.includes('AI领域专有词')) {
      currentCategory = line.replace('**', '').replace('**', '').trim();
      continue;
    }
    
    // 检测新词汇（以*开头，且包含**英文单词**格式）
    if (line.startsWith('* **') && line.includes('**')) {
      // 保存前一个词汇
      if (currentWord && currentWord.word) {
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
    
    // 解析词汇属性
    if (currentWord && line.includes('**')) {
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
  if (currentWord && currentWord.word) {
    words.push(currentWord);
  }
  
  return words;
}

// 解析Informer论文概要
function parseInformerSummary() {
  const informerFile = path.join(__dirname, 'docs', 'Informer Beyond Efficient Transformer for Long Sequence Time-Series Forecasting.txt');
  const content = fs.readFileSync(informerFile, 'utf8');
  
  let background = '';
  let keyConcepts = '';
  let highlights = '';
  
  const lines = content.split('\n');
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测论文概要部分
    if (line.includes('### **2. 论文概要**')) {
      currentSection = 'summary';
      continue;
    }
    
    // 如果不在概要部分，跳过
    if (currentSection !== 'summary') {
      continue;
    }
    
    // 检测词汇清单部分，结束概要解析
    if (line.includes('### **3. 论文词汇清单**')) {
      break;
    }
    
    // 检测各个子部分
    if (line.includes('#### **论文背景解读**')) {
      currentSection = 'background';
      continue;
    } else if (line.includes('#### **论文关键概念**')) {
      currentSection = 'keyConcepts';
      continue;
    } else if (line.includes('#### **论文亮点**')) {
      currentSection = 'highlights';
      continue;
    }
    
    // 收集内容
    if (currentSection === 'background' && line) {
      background += line + '\n';
    } else if (currentSection === 'keyConcepts' && line) {
      keyConcepts += line + '\n';
    } else if (currentSection === 'highlights' && line) {
      highlights += line + '\n';
    }
  }
  
  return {
    background: background.trim(),
    keyConcepts: keyConcepts.trim(),
    highlights: highlights.trim()
  };
}

// 生成论文对象
function generatePaperObject() {
  const summary = parseInformerSummary();
  
  return {
    id: 14, // 下一个可用的ID
    title: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting',
    authors: 'Haoyi Zhou, Shanghang Zhang, Jieqi Peng, Shuai Zhang, Jianxin Li, Hui Xiong, Wancai Zhang',
    year: 2020,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种名为Informer的新型高效Transformer架构，通过ProbSparse自注意力机制、自注意力蒸馏和生成式解码器三大创新，成功解决了长序列时间序列预测中的效率瓶颈问题。',
    url: 'https://arxiv.org/pdf/2012.07436',
    get wordCount() { return getPaperWordCount('Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting') },
    category: 'AI专业词汇',
    background: summary.background,
    keyConcepts: summary.keyConcepts,
    highlights: summary.highlights
  };
}

// 动态计算论文词汇数量的函数
function getPaperWordCount(paperTitle) {
  try {
    // 这里需要从app.js中获取词汇数据，但由于这是独立脚本，我们直接返回0
    // 实际运行时会在app.js中动态计算
    return 0;
  } catch (e) {
    console.warn('获取论文词汇数量失败:', e);
    return 0;
  }
}

// 更新论文数据文件
function updatePapersData() {
  const papersDataPath = path.join(__dirname, 'utils', 'papersData.js');
  const content = fs.readFileSync(papersDataPath, 'utf8');
  
  const paperObject = generatePaperObject();
  const paperObjectStr = JSON.stringify(paperObject, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'")
    .replace(/'get wordCount\(\) \{ return getPaperWordCount\('Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting'\) \}'/g, "get wordCount() { return getPaperWordCount('Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting') }");
  
  // 找到papers数组的位置并添加新论文
  const papersMatch = content.match(/const papers = \[([\s\S]*?)\]/);
  if (!papersMatch) {
    console.error('无法找到papers数组');
    return;
  }
  
  const papersArray = papersMatch[1];
  const existingPapersCount = (papersArray.match(/\{/g) || []).length;
  
  const newContent = content.replace(
    /const papers = \[([\s\S]*?)\]/,
    `const papers = [\n$1${paperObjectStr}\n]`
  );
  
  fs.writeFileSync(papersDataPath, newContent, 'utf8');
  console.log('论文数据已更新到 utils/papersData.js');
}

// 更新app.js中的词汇数据
function updateAppJsVocabulary() {
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
}

// 主函数
function main() {
  try {
    console.log('开始导入Informer论文数据...');
    
    // 更新论文数据
    updatePapersData();
    
    // 更新词汇数据
    updateAppJsVocabulary();
    
    console.log('Informer论文数据导入完成！');
  } catch (error) {
    console.error('导入过程中发生错误:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseInformerVocabulary,
  parseInformerSummary,
  generatePaperObject,
  updatePapersData,
  updateAppJsVocabulary
};

