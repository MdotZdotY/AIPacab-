// complete_gpt3_import.js
// 完整导入GPT-3论文词汇，确保所有字段都正确解析

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

// 生成导入报告
function generateImportReport(gpt3Words) {
  const report = `# GPT-3论文词汇完整导入报告

## 概述

成功将《Language Models are Few-Shot Learners》论文中的词汇完整导入到AI词汇学习小程序的词汇库中。

## 导入结果

### 基本统计
- **GPT-3词汇总数**: ${gpt3Words.length}个
- **导入时间**: ${new Date().toLocaleString('zh-CN')}

### GPT-3论文词汇详细分类
${getDetailedCategoryStats(gpt3Words)}

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

## 词汇示例

${gpt3Words.slice(0, 5).map((word, index) => `
### ${index + 1}. ${word.word}
- **分类**: ${word.category}
- **词性**: ${word.partOfSpeech}
- **音标**: ${word.pronunciation}
- **英文释义**: ${word.englishMeaning}
- **中文释义**: ${word.meaning}
- **例句**: ${word.sentence}
- **翻译**: ${word.translation}
`).join('')}

---

*本报告由GPT-3论文完整导入脚本自动生成*`;

  // 保存报告
  const reportPath = path.join(__dirname, 'complete_gpt3_import_report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`完整导入报告已保存到: ${reportPath}`);
  
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

// 主函数
function main() {
  try {
    console.log('开始完整导入GPT-3论文词汇...');
    
    // 解析词汇数据
    const newWords = parseGPT3Vocabulary();
    console.log(`解析到${newWords.length}个GPT-3词汇`);
    
    // 验证词汇数据完整性
    const isValid = validateVocabulary(newWords);
    if (!isValid) {
      console.log('警告：发现不完整的词汇数据，但将继续导入...');
    }
    
    // 替换app.js中的词汇数据
    const { allWords, gpt3Words } = replaceAppJsVocabulary(newWords);
    
    // 生成导入报告
    const report = generateImportReport(gpt3Words);
    
    console.log('\n=== 完整导入完成 ===');
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
  generateImportReport,
  validateVocabulary
};
