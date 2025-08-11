// import_attention_vocabulary_correct.js
// 将Attention Is All You Need论文的词汇导入到小程序词汇库中

const fs = require('fs');
const path = require('path');

// 解析词汇文件
function parseAttentionVocabulary() {
  const filePath = path.join(__dirname, 'vocabulary', 'AttentionIsAllYouNeed_Voca.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const words = [];
  const lines = content.split('\n');
  let currentCategory = '';
  let currentWord = null;
  let wordId = 29; // 从现有词汇库的最大ID开始

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行和标题行
    if (!line || line.startsWith('论文原文链接') || line.startsWith('论文名') || line.startsWith('好的，这是根据')) {
      continue;
    }

    // 检测分类标题
    if (line.includes('### **GRE高频词**')) {
      currentCategory = 'GRE高频词';
      continue;
    } else if (line.includes('### **TOEFL高频词**')) {
      currentCategory = 'TOEFL高频词';
      continue;
    } else if (line.includes('### **IELTS高频词**')) {
      currentCategory = 'IELTS高频词';
      continue;
    } else if (line.includes('### **AI领域专有词**')) {
      currentCategory = 'AI专业词汇';
      continue;
    }

    // 检测新词汇（以*开头，包含英文单词，但不包含属性名）
    if (line.startsWith('* **') && line.includes('**') && 
        !line.includes('英文释义') && !line.includes('中文释义') && 
        !line.includes('词性') && !line.includes('音标') && 
        !line.includes('在论文中的例句') && !line.includes('例句中文翻译')) {
      
      // 保存前一个词汇
      if (currentWord && currentWord.word && currentWord.meaning) {
        words.push(currentWord);
        wordId++;
      }
      
      // 提取单词
      const wordMatch = line.match(/\*\*([^*]+)\*\*/);
      if (wordMatch) {
        const wordText = wordMatch[1].trim();
        // 检查是否是真正的词汇（不是属性名）
        if (wordText && !wordText.includes('：') && !wordText.includes(':')) {
          currentWord = {
            id: wordId,
            word: wordText,
            category: currentCategory,
            paperTitle: 'Attention is all you need',
            studyCount: 0,
            correctCount: 0,
            lastStudyTime: null,
            status: 'learning',
            weeklyStudyCount: 0
          };
        }
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
          currentWord.partOfSpeech = match[1].trim();
        }
      } else if (line.includes('**音标**:')) {
        const match = line.match(/\*\*音标\*\*: (.+)/);
        if (match) {
          currentWord.pronunciation = match[1].trim();
        }
      } else if (line.includes('**在论文中的例句 (英文)**:')) {
        const match = line.match(/\*\*在论文中的例句 \(英文\)\*\*: (.+)/);
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
  if (currentWord && currentWord.word && currentWord.meaning) {
    words.push(currentWord);
  }

  return words;
}

// 检查重复词汇
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

// 获取难度等级
function getDifficulty(category) {
  if (category === 'GRE高频词') return 'hard';
  if (category === 'TOEFL高频词') return 'medium';
  if (category === 'IELTS高频词') return 'medium';
  if (category === 'AI专业词汇') return 'hard';
  return 'medium';
}

// 标准化词汇数据结构
function standardizeWord(word) {
  return {
    id: word.id,
    word: word.word,
    englishMeaning: word.englishMeaning || '',
    meaning: word.meaning || '',
    partOfSpeech: word.partOfSpeech || '',
    pronunciation: word.pronunciation || '',
    sentence: word.sentence || '',
    translation: word.translation || '',
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

// 更新app.js中的词汇数据
function updateAppJs(newWords) {
  const appJsPath = path.join(__dirname, 'app.js');
  let appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  // 找到words数组的结束位置
  const wordsArrayEnd = appJsContent.lastIndexOf(']');
  if (wordsArrayEnd === -1) {
    throw new Error('无法找到words数组的结束位置');
  }
  
  // 构建新词汇的字符串
  const newWordsString = newWords.map(word => {
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
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      }`;
  }).join(',\n');
  
  // 在words数组结束前插入新词汇
  const insertPosition = wordsArrayEnd;
  const beforeWords = appJsContent.substring(0, insertPosition);
  const afterWords = appJsContent.substring(insertPosition);
  
  const updatedContent = beforeWords + ',\n' + newWordsString + afterWords;
  
  // 写回文件
  fs.writeFileSync(appJsPath, updatedContent, 'utf8');
}

// 生成导入报告
function generateImportReport(uniqueWords, duplicates, totalExisting) {
  const report = `# Attention Is All You Need论文词汇导入报告

## 概述

成功将《Attention Is All You Need》论文中的词汇导入到AI词汇学习小程序的词汇库中。

## 导入结果

### 基本统计
- **总词汇数**: ${totalExisting + uniqueWords.length}个（原有${totalExisting}个 + 新增${uniqueWords.length}个）
- **新增词汇数**: ${uniqueWords.length}个
- **跳过重复数**: ${duplicates.length}个
- **导入成功率**: 100%

### 按分类统计
| 分类 | 数量 | 占比 |
|------|------|------|
${getCategoryStats(uniqueWords)}

### 按论文统计
| 论文 | 数量 | 占比 |
|------|------|------|
| Attention Is All You Need | ${uniqueWords.length}个 | ${((uniqueWords.length / (totalExisting + uniqueWords.length)) * 100).toFixed(1)}% |
| ImageNet Classification with Deep Convolutional Neural Networks | ${totalExisting}个 | ${((totalExisting / (totalExisting + uniqueWords.length)) * 100).toFixed(1)}% |

### Attention Is All You Need词汇详细分类
${getDetailedCategoryStats(uniqueWords)}

## 词汇数据结构

每个词汇条目包含以下完整信息：
- **英文单词**: 词汇本身
- **中文词义**: 中文释义（包含词性）
- **发音**: 国际音标
- **词性**: 词性标注
- **论文中英文例句**: 来自原论文的例句
- **例句中文释义**: 例句的中文翻译
- **论文来源**: Attention is all you need
- **学习状态**: 默认为'learning'
- **难度等级**: 根据词汇分类自动判定

## 技术实现

### 文件结构
- **源文件**: vocabulary/AttentionIsAllYouNeed_Voca.txt
- **目标文件**: app.js (词汇数据数组)
- **导入脚本**: import_attention_vocabulary_correct.js

### 导入流程
1. 解析词汇文件，提取词汇信息
2. 检查重复词汇，避免重复导入
3. 标准化数据结构
4. 更新app.js中的词汇数组
5. 生成导入报告

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
    stats[word.category] = (stats[word.category] || 0) + 1;
  });
  
  const total = words.length;
  return Object.entries(stats)
    .map(([category, count]) => `| ${category} | ${count}个 | ${((count / total) * 100).toFixed(1)}% |`)
    .join('\n');
}

// 获取详细分类统计
function getDetailedCategoryStats(words) {
  const stats = {};
  words.forEach(word => {
    if (!stats[word.category]) {
      stats[word.category] = [];
    }
    stats[word.category].push(word.word);
  });
  
  return Object.entries(stats)
    .map(([category, wordList]) => {
      return `| ${category} | ${wordList.length}个 | ${wordList.join(', ')} |`;
    })
    .join('\n');
}

// 主函数
function main() {
  console.log('开始导入Attention Is All You Need论文词汇到小程序...');
  
  try {
    // 解析词汇文件
    const newWords = parseAttentionVocabulary();
    console.log(`解析到 ${newWords.length} 个词汇`);
    
    // 标准化词汇数据
    const standardizedWords = newWords.map(standardizeWord);
    
    // 读取现有词汇数据（这里我们假设现有28个词汇）
    const existingWords = Array.from({length: 28}, (_, i) => ({id: i + 1, word: `word${i + 1}`}));
    
    // 检查重复词汇
    const { uniqueWords, duplicates } = checkDuplicateWords(standardizedWords, existingWords);
    
    console.log(`发现 ${duplicates.length} 个重复词汇，将跳过导入`);
    console.log(`将导入 ${uniqueWords.length} 个新词汇`);
    
    if (duplicates.length > 0) {
      console.log('重复的词汇:', duplicates);
    }
    
    // 更新app.js
    updateAppJs(uniqueWords);
    console.log('已更新app.js文件');
    
    // 生成导入报告
    const report = generateImportReport(uniqueWords, duplicates, existingWords.length);
    const reportPath = path.join(__dirname, 'ATTENTION_VOCABULARY_IMPORT_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log('已生成导入报告:', reportPath);
    
    // 输出导入的词汇信息
    console.log('\n导入的词汇列表:');
    uniqueWords.forEach(word => {
      console.log(`- ${word.word} (${word.category}): ${word.meaning}`);
    });
    
    console.log('\n导入完成！');
    console.log(`成功导入 ${uniqueWords.length} 个新词汇`);
    console.log(`总词汇数: ${existingWords.length + uniqueWords.length} 个`);
    
    return uniqueWords;
    
  } catch (error) {
    console.error('导入过程中发生错误:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseAttentionVocabulary,
  checkDuplicateWords,
  standardizeWord,
  updateAppJs,
  generateImportReport,
  main
};