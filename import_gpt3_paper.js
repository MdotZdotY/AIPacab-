// import_gpt3_paper.js
// 将《Language Models are Few-Shot Learners》论文的词汇和论文信息导入到现有系统中

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
          paperTitle: 'Language Models are Few-Shot Learners'
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

// 解析GPT-3论文概要
function parseGPT3Summary() {
  const gpt3File = path.join(__dirname, 'docs', 'Language Models are Few-Shot Learners.txt');
  const content = fs.readFileSync(gpt3File, 'utf8');
  
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

// 更新app.js中的词汇数据
function updateAppJsVocabulary(newWords) {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  // 获取现有词汇
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) {
    throw new Error('未找到词汇数组');
  }
  
  const existingWordsStr = wordsMatch[1];
  const existingWords = eval(`[${existingWordsStr}]`);
  
  // 检查重复词汇
  const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));
  const uniqueNewWords = [];
  const duplicates = [];
  
  newWords.forEach(word => {
    if (existingWordSet.has(word.word.toLowerCase())) {
      duplicates.push(word.word);
    } else {
      uniqueNewWords.push(word);
    }
  });
  
  // 标准化新词汇
  const standardizedWords = uniqueNewWords.map((word, index) => ({
    id: existingWords.length + index + 1,
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
  
  // 构建新词汇字符串
  const newWordsStr = standardizedWords.map(word => `      {
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
    `words: [\n$1${existingWords.length > 0 ? ',' : ''}\n${newWordsStr}\n    ]`
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
  if (content.includes("'Language Models are Few-Shot Learners'")) {
    console.log('GPT-3论文已存在，跳过添加');
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
    title: 'Language Models are Few-Shot Learners',
    authors: 'Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared D. Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, Dario Amodei',
    year: 2020,
    journal: 'arXiv',
    abstract: '这篇论文探索并证明了模型规模是实现强大的少样本学习能力的关键因素，推出了拥有1750亿参数的GPT-3模型，并展示了其在40多个NLP基准任务上的强大少样本学习能力。',
    url: 'https://arxiv.org/pdf/2005.14165',
    get wordCount() { return `getPaperWordCount('Language Models are Few-Shot Learners')` },
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
  console.log(`成功添加GPT-3论文到papersData.js，论文ID: ${newId}`);
  
  return true;
}

// 生成导入报告
function generateImportReport(uniqueWords, duplicates, totalExisting) {
  const report = `# GPT-3论文词汇导入报告

## 概述

成功将《Language Models are Few-Shot Learners》论文中的词汇导入到AI词汇学习小程序的词汇库中。

## 导入结果

### 基本统计
- **总词汇数**: ${uniqueWords.length + duplicates.length}个
- **成功导入**: ${uniqueWords.length}个
- **重复跳过**: ${duplicates.length}个
- **现有词汇**: ${totalExisting}个
- **导入后总数**: ${totalExisting + uniqueWords.length}个
- **增长率**: ${((uniqueWords.length / totalExisting) * 100).toFixed(1)}%

### GPT-3论文词汇详细分类
${getDetailedCategoryStats(uniqueWords)}

## 词汇数据结构

每个词汇条目包含以下完整信息：
- **英文单词**: 词汇本身
- **中文词义**: 中文释义（包含词性）
- **英文释义**: 详细的英文释义
- **词性**: 词性标注
- **音标**: 国际音标
- **例句**: 来自论文的英文例句
- **翻译**: 例句的中文翻译
- **来源论文**: Language Models are Few-Shot Learners
- **分类**: GRE高频词/TOEFL高频词/IELTS高频词/AI专业词汇

## 重复词汇列表

以下词汇因已存在而被跳过：
${duplicates.map(word => `- ${word}`).join('\n')}

## 导入时间

${new Date().toLocaleString('zh-CN')}

---

*本报告由GPT-3论文导入脚本自动生成*`;

  // 保存报告
  const reportPath = path.join(__dirname, 'gpt3_import_report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`导入报告已保存到: ${reportPath}`);
  
  return report;
}

// 获取详细分类统计
function getDetailedCategoryStats(words) {
  const stats = {};
  words.forEach(word => {
    stats[word.category] = (stats[word.category] || 0) + 1;
  });
  
  return Object.entries(stats)
    .map(([category, count]) => `- **${category}**: ${count}个`)
    .join('\n');
}

// 主函数
function main() {
  try {
    console.log('开始导入GPT-3论文词汇...');
    
    // 解析词汇数据
    const newWords = parseGPT3Vocabulary();
    console.log(`解析到${newWords.length}个词汇`);
    
    // 解析论文概要
    const paperSummary = parseGPT3Summary();
    console.log('成功解析论文概要');
    
    // 更新app.js中的词汇数据
    const { uniqueNewWords, duplicates } = updateAppJsVocabulary(newWords);
    
    // 更新papersData.js中的论文数据
    const paperAdded = updatePapersData(paperSummary);
    
    // 获取现有词汇总数
    const appJsPath = path.join(__dirname, 'app.js');
    const content = fs.readFileSync(appJsPath, 'utf8');
    const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
    const existingWords = eval(`[${wordsMatch[1]}]`);
    const totalExisting = existingWords.length;
    
    // 生成导入报告
    const report = generateImportReport(uniqueNewWords, duplicates, totalExisting - uniqueNewWords.length);
    
    console.log('\n=== 导入完成 ===');
    console.log(`成功导入${uniqueNewWords.length}个新词汇`);
    console.log(`跳过${duplicates.length}个重复词汇`);
    if (paperAdded) {
      console.log('成功添加论文信息');
    }
    console.log(`当前词汇总数: ${totalExisting}个`);
    
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
  parseGPT3Summary,
  updateAppJsVocabulary,
  updatePapersData,
  generateImportReport
};
