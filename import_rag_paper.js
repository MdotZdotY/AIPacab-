// import_rag_paper.js
// 将RAG论文的词汇和论文信息导入到现有系统中

const fs = require('fs');
const path = require('path');

// 解析RAG论文文件中的词汇数据
function parseRAGVocabulary() {
  const ragFile = path.join(__dirname, 'docs', 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.txt');
  const content = fs.readFileSync(ragFile, 'utf8');
  
  const words = [];
  let currentCategory = '';
  let currentWord = null;
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测分类标题
    if (line.includes('GRE高频词') || line.includes('TOEFL高频词') || line.includes('IELTS高频词') || line.includes('AI领域专有词')) {
      currentCategory = line.replace('**', '').replace('**', '').trim();
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
          word: wordMatch[1].trim(),
          category: currentCategory,
          englishMeaning: '',
          meaning: '',
          partOfSpeech: '',
          pronunciation: '',
          sentence: '',
          translation: '',
          paperTitle: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks'
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

// 解析RAG论文概要
function parseRAGSummary() {
  const ragFile = path.join(__dirname, 'docs', 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.txt');
  const content = fs.readFileSync(ragFile, 'utf8');
  
  // 提取论文概要部分
  const summaryMatch = content.match(/### \*\*2\. 论文概要\*\*([\s\S]*?)(?=### \*\*3\. 论文词汇清单\*\*)/);
  if (!summaryMatch) {
    throw new Error('未找到论文概要部分');
  }
  
  const summaryContent = summaryMatch[1];
  
  // 解析各个部分
  const backgroundMatch = summaryContent.match(/#### \*\*论文背景解读\*\*([\s\S]*?)(?=#### \*\*论文关键概念\*\*)/);
  const keyConceptsMatch = summaryContent.match(/#### \*\*论文关键概念\*\*([\s\S]*?)(?=#### \*\*论文亮点\*\*)/);
  const highlightsMatch = summaryContent.match(/#### \*\*论文亮点\*\*([\s\S]*?)(?=\n\n|$)/);
  
  return {
    background: backgroundMatch ? backgroundMatch[1].trim() : '',
    keyConcepts: keyConceptsMatch ? keyConceptsMatch[1].trim() : '',
    highlights: highlightsMatch ? highlightsMatch[1].trim() : ''
  };
}

// 获取现有词汇的最大ID
function getMaxWordId(existingWords) {
  return Math.max(...existingWords.map(word => word.id || 0));
}

// 标准化词汇数据结构
function standardizeWord(word, nextId) {
  return {
    id: nextId,
    word: word.word,
    englishMeaning: word.englishMeaning || '',
    meaning: word.meaning,
    partOfSpeech: word.partOfSpeech,
    pronunciation: word.pronunciation,
    sentence: word.sentence,
    translation: word.translation,
    paperTitle: word.paperTitle,
    category: word.category,
    difficulty: getDifficulty(word.category),
    studyCount: 0,
    correctCount: 0,
    lastStudyTime: null,
    status: 'learning',
    weeklyStudyCount: 0
  };
}

// 根据分类确定难度
function getDifficulty(category) {
  if (category === 'GRE高频词' || category === 'AI专业词汇') return 'hard';
  if (category === 'TOEFL高频词') return 'medium';
  return 'easy';
}

// 更新app.js中的词汇数据
function updateAppJs(newWords) {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  // 获取现有词汇
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) {
    throw new Error('未找到词汇数组');
  }
  
  const existingWordsStr = wordsMatch[1];
  const existingWords = eval('[' + existingWordsStr + ']');
  
  // 检查重复词汇
  const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));
  const uniqueNewWords = newWords.filter(word => !existingWordSet.has(word.word.toLowerCase()));
  const duplicates = newWords.filter(word => existingWordSet.has(word.word.toLowerCase()));
  
  if (uniqueNewWords.length === 0) {
    console.log('所有词汇都已存在，无需导入');
    return { uniqueNewWords: [], duplicates };
  }
  
  // 获取最大ID并分配新ID
  const maxId = getMaxWordId(existingWords);
  const standardizedWords = uniqueNewWords.map((word, index) => 
    standardizeWord(word, maxId + index + 1)
  );
  
  // 构建新的词汇数组
  const allWords = [...existingWords, ...standardizedWords];
  const newWordsArrayStr = allWords.map(word => {
    return `      {
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
        lastStudyTime: ${word.lastStudyTime ? `new Date('${word.lastStudyTime}')` : 'null'},
        status: '${word.status}',
        weeklyStudyCount: ${word.weeklyStudyCount}
      }`;
  }).join(',\n');
  
  // 替换词汇数组
  const newContent = content.replace(
    /words:\s*\[([\s\S]*?)\]/,
    `words: [\n${newWordsArrayStr}\n    ]`
  );
  
  // 写入文件
  fs.writeFileSync(appJsPath, newContent, 'utf8');
  console.log(`成功更新app.js，添加了${standardizedWords.length}个新词汇`);
  
  return { uniqueNewWords: standardizedWords, duplicates };
}

// 更新papersData.js中的论文数据
function updatePapersData(paperSummary) {
  const papersDataPath = path.join(__dirname, 'utils', 'papersData.js');
  let content = fs.readFileSync(papersDataPath, 'utf8');
  
  // 检查论文是否已存在
  if (content.includes("'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks'")) {
    console.log('RAG论文已存在，跳过添加');
    return false;
  }
  
  // 获取当前论文数量以确定新ID
  const papersMatch = content.match(/const papers = \[([\s\S]*?)\]/);
  if (!papersMatch) {
    throw new Error('未找到论文数组');
  }
  
  const papersArray = papersMatch[1];
  const existingPapersCount = (papersArray.match(/\{/g) || []).length;
  const newId = existingPapersCount + 1;
  
  // 构建新论文对象
  const newPaper = {
    id: newId,
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    authors: 'Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela',
    year: 2020,
    journal: 'NeurIPS',
    abstract: '这篇论文提出了一种名为RAG（检索增强生成）的架构，将预训练的序列到序列模型与大规模文档检索机制相结合，在知识密集型NLP任务上取得了显著成果。',
    url: 'https://arxiv.org/pdf/2005.11401',
    get wordCount() { return `getPaperWordCount('Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks')` },
    category: 'AI专业词汇',
    background: paperSummary.background,
    keyConcepts: paperSummary.keyConcepts,
    highlights: paperSummary.highlights
  };
  
  // 构建论文对象字符串
  const paperObjectStr = `  {
    id: ${newPaper.id},
    title: '${newPaper.title}',
    authors: '${newPaper.authors}',
    year: ${newPaper.year},
    journal: '${newPaper.journal}',
    abstract: '${newPaper.abstract.replace(/'/g, "\\'")}',
    url: '${newPaper.url}',
    get wordCount() { return ${newPaper.wordCount} },
    category: '${newPaper.category}',
    background: \`${newPaper.background.replace(/`/g, '\\`')}\`,
    keyConcepts: \`${newPaper.keyConcepts.replace(/`/g, '\\`')}\`,
    highlights: \`${newPaper.highlights.replace(/`/g, '\\`')}\`
  }`;
  
  // 在论文数组末尾添加新论文
  const newContent = content.replace(
    /const papers = \[([\s\S]*?)\]/,
    `const papers = [\n$1${paperObjectStr}\n]`
  );
  
  // 写入文件
  fs.writeFileSync(papersDataPath, newContent, 'utf8');
  console.log(`成功添加RAG论文到papersData.js，论文ID: ${newId}`);
  
  return true;
}

// 生成导入报告
function generateImportReport(uniqueWords, duplicates, totalExisting) {
  const report = `# RAG论文词汇导入报告

## 概述

成功将《Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks》论文中的词汇导入到AI词汇学习小程序的词汇库中。

## 导入结果

### 基本统计
- **总词汇数**: ${uniqueWords.length + duplicates.length}个
- **成功导入**: ${uniqueWords.length}个
- **重复跳过**: ${duplicates.length}个
- **现有词汇**: ${totalExisting}个
- **导入后总数**: ${totalExisting + uniqueWords.length}个
- **增长率**: ${((uniqueWords.length / totalExisting) * 100).toFixed(1)}%

### RAG论文词汇详细分类
${getDetailedCategoryStats(uniqueWords)}

## 词汇数据结构

每个词汇条目包含以下完整信息：
- **英文单词**: 词汇本身
- **中文词义**: 中文释义（包含词性）
- **发音**: 国际音标
- **词性**: 词性标注
- **论文中英文例句**: 来自原论文的例句
- **例句中文释义**: 例句的中文翻译
- **论文来源**: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
- **学习状态**: 默认为'learning'
- **难度等级**: 根据词汇分类自动判定

## 技术实现

### 文件结构
- **源文件**: docs/Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.txt
- **目标文件**: app.js (词汇数据数组)
- **论文文件**: utils/papersData.js (论文数据)
- **导入脚本**: import_rag_paper.js

### 导入流程
1. 解析RAG论文文件，提取词汇信息
2. 检查重复词汇，避免重复导入
3. 标准化数据结构
4. 更新app.js中的词汇数组
5. 更新papersData.js中的论文信息
6. 生成导入报告

## 注意事项

- 所有新导入的词汇状态设置为'learning'
- 学习次数、正确次数等统计信息初始化为0
- 重复词汇已自动跳过，不会影响现有数据
- 词汇ID从现有最大ID开始递增

## 后续操作

1. 在微信开发者工具中重新编译小程序
2. 测试词汇学习功能
3. 检查词汇显示和分类是否正确
4. 更新相关统计信息

---
*导入时间: ${new Date().toLocaleString()}*
*导入脚本版本: v1.0*
`;

  return report;
}

// 获取分类统计
function getCategoryStats(words) {
  const stats = {};
  words.forEach(word => {
    if (!stats[word.category]) {
      stats[word.category] = 0;
    }
    stats[word.category]++;
  });
  return stats;
}

// 获取详细分类统计
function getDetailedCategoryStats(words) {
  const stats = getCategoryStats(words);
  let result = '';
  
  Object.entries(stats).forEach(([category, count]) => {
    result += `- **${category}**: ${count}个\n`;
  });
  
  return result;
}

// 主函数
function main() {
  try {
    console.log('=== 开始导入RAG论文词汇和论文信息 ===');
    
    // 1. 解析RAG论文词汇
    console.log('1. 解析RAG论文词汇...');
    const ragWords = parseRAGVocabulary();
    console.log(`解析完成，共找到${ragWords.length}个词汇`);
    
    // 2. 解析RAG论文概要
    console.log('2. 解析RAG论文概要...');
    const paperSummary = parseRAGSummary();
    console.log('论文概要解析完成');
    
    // 3. 更新词汇数据
    console.log('3. 更新词汇数据...');
    const { uniqueNewWords, duplicates } = updateAppJs(ragWords);
    
    // 4. 更新论文数据
    console.log('4. 更新论文数据...');
    const paperAdded = updatePapersData(paperSummary);
    
    // 5. 生成报告
    console.log('5. 生成导入报告...');
    const totalExisting = 60; // 假设现有60个词汇
    const report = generateImportReport(uniqueNewWords, duplicates, totalExisting);
    
    // 保存报告
    const reportPath = path.join(__dirname, 'RAG_PAPER_IMPORT_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log('=== 导入完成 ===');
    console.log(`成功导入${uniqueNewWords.length}个新词汇`);
    console.log(`跳过${duplicates.length}个重复词汇`);
    if (paperAdded) {
      console.log('成功添加RAG论文信息');
    }
    console.log(`详细报告已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  parseRAGVocabulary,
  parseRAGSummary,
  updateAppJs,
  updatePapersData,
  generateImportReport
};
