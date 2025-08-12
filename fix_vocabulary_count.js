// fix_vocabulary_count.js
// 修复词汇数量问题，恢复完整的词汇数据并正确追加新词汇

const fs = require('fs');
const path = require('path');

// 从备份文件恢复完整的原有词汇数据
function getOriginalWords() {
  const backupPath = path.join(__dirname, 'app.js.backup.1754981265823');
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  
  // 查找words数组的开始和结束位置
  const wordsStartIndex = backupContent.indexOf('words: [');
  if (wordsStartIndex === -1) {
    throw new Error('未找到words数组');
  }
  
  let braceCount = 0;
  let wordsEndIndex = wordsStartIndex;
  let inWordsArray = false;
  
  for (let i = wordsStartIndex; i < backupContent.length; i++) {
    const char = backupContent[i];
    if (char === '[') {
      braceCount++;
      inWordsArray = true;
    } else if (char === ']') {
      braceCount--;
      if (braceCount === 0 && inWordsArray) {
        wordsEndIndex = i;
        break;
      }
    }
  }
  
  if (wordsEndIndex === wordsStartIndex) {
    throw new Error('无法找到words数组的结束位置');
  }
  
  // 提取words数组内容
  const wordsArrayContent = backupContent.substring(wordsStartIndex + 7, wordsEndIndex);
  
  // 解析词汇对象
  const words = [];
  let currentWord = null;
  let inWordObject = false;
  let braceLevel = 0;
  let wordContent = '';
  
  for (let i = 0; i < wordsArrayContent.length; i++) {
    const char = wordsArrayContent[i];
    
    if (char === '{') {
      if (braceLevel === 0) {
        inWordObject = true;
        wordContent = '';
      }
      braceLevel++;
    } else if (char === '}') {
      braceLevel--;
      if (braceLevel === 0 && inWordObject) {
        // 解析词汇对象
        try {
          // 清理和修复词汇对象字符串
          let cleanWordContent = wordContent
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
          
          // 修复可能的语法错误
          cleanWordContent = cleanWordContent
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']');
          
          const wordObj = eval('(' + cleanWordContent + ')');
          if (wordObj && wordObj.word && wordObj.id) {
            words.push(wordObj);
          }
        } catch (e) {
          console.log('解析词汇对象失败:', e.message);
          console.log('问题内容:', wordContent.substring(0, 100));
        }
        inWordObject = false;
      }
    }
    
    if (inWordObject) {
      wordContent += char;
    }
  }
  
  console.log(`从备份文件恢复了 ${words.length} 个原有词汇`);
  return words;
}

// 解析新词汇
function parseNewWords() {
  const filePath = path.join(__dirname, 'vocabulary', 'Training language models to follow instructions with human feedback_Voca.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const words = [];
  const lines = content.split('\n');
  let currentCategory = '';
  let currentWord = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测分类标题
    if (line.includes('GRE高频词汇')) {
      currentCategory = 'GRE高频词';
      continue;
    } else if (line.includes('TOEFL高频词汇')) {
      currentCategory = 'TOEFL高频词';
      continue;
    } else if (line.includes('AI领域常用及专有词汇')) {
      currentCategory = 'AI专业词汇';
      continue;
    }

    // 检测新词汇（以*开头）
    if (line.startsWith('*') && !line.startsWith('* 英文释义:') && !line.startsWith('* 中文释义:') && !line.startsWith('* 词性:') && !line.startsWith('* 音标:') && !line.startsWith('* 在论文中的例句') && !line.startsWith('* 例句中文翻译:')) {
      // 保存前一个词汇
      if (currentWord && currentWord.word && currentWord.meaning) {
        words.push(currentWord);
      }
      
      // 开始新词汇
      const wordText = line.substring(1).trim();
      currentWord = {
        word: wordText,
        category: currentCategory,
        pronunciation: '',
        meaning: '',
        sentence: '',
        translation: '',
        paperTitle: 'Training language models to follow instructions with human feedback',
        difficulty: getDifficulty(wordText),
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      };
      continue;
    }

    // 解析词汇属性
    if (line.startsWith('* 英文释义:') && currentWord) {
      const explanation = line.replace('* 英文释义:', '').trim();
      currentWord.englishMeaning = explanation;
    } else if (line.startsWith('* 中文释义:') && currentWord) {
      const meaning = line.replace('* 中文释义:', '').trim();
      currentWord.meaning = meaning;
    } else if (line.startsWith('* 词性:') && currentWord) {
      const partOfSpeech = line.replace('* 词性:', '').trim();
      if (currentWord.meaning) {
        currentWord.meaning += ` (${partOfSpeech})`;
      }
    } else if (line.startsWith('* 音标:') && currentWord) {
      const pronunciation = line.replace('* 音标:', '').trim();
      currentWord.pronunciation = pronunciation;
    } else if (line.startsWith('* 在论文中的例句') && currentWord) {
      // 获取例句（可能在下一行）
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !nextLine.startsWith('*')) {
          currentWord.sentence = nextLine;
          i++; // 跳过下一行
        }
      }
    } else if (line.startsWith('* 例句中文翻译:') && currentWord) {
      // 获取翻译（可能在下一行）
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !nextLine.startsWith('*')) {
          currentWord.translation = nextLine;
          i++; // 跳过下一行
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

// 根据词汇确定难度
function getDifficulty(word) {
  if (word.length <= 5) return 'easy';
  if (word.length <= 8) return 'medium';
  return 'hard';
}

// 验证词汇数据
function validateWord(word) {
  return word.word && word.meaning && word.category;
}

// 清理词汇数据
function cleanWord(word) {
  return {
    ...word,
    word: word.word.trim(),
    meaning: word.meaning.trim(),
    sentence: word.sentence.trim(),
    pronunciation: word.pronunciation.trim(),
    category: word.category.trim()
  };
}

// 更新app.js中的词汇数据
function updateAppJsWords(originalWords, newWords) {
  const appPath = path.join(__dirname, 'app.js');
  let appContent = fs.readFileSync(appPath, 'utf8');
  
  // 合并词汇
  const allWords = [...originalWords, ...newWords];
  
  // 生成新的words数组内容
  const wordsArrayContent = allWords.map(word => {
    return `      {
        id: ${word.id},
        word: '${word.word.replace(/'/g, "\\'")}',
        englishMeaning: '${(word.englishMeaning || '').replace(/'/g, "\\'")}',
        meaning: '${word.meaning.replace(/'/g, "\\'")}',
        partOfSpeech: '${(word.partOfSpeech || '').replace(/'/g, "\\'")}',
        pronunciation: '${(word.pronunciation || '').replace(/'/g, "\\'")}',
        sentence: '${(word.sentence || '').replace(/'/g, "\\'")}',
        translation: '${(word.translation || '').replace(/'/g, "\\'")}',
        paperTitle: '${word.paperTitle.replace(/'/g, "\\'")}',
        category: '${word.category}',
        difficulty: '${word.difficulty}',
        studyCount: ${word.studyCount || 0},
        correctCount: ${word.correctCount || 0},
        lastStudyTime: ${word.lastStudyTime ? `'${word.lastStudyTime}'` : 'null'},
        status: '${word.status || 'learning'}',
        weeklyStudyCount: ${word.weeklyStudyCount || 0}
      }`;
  }).join(',\n');
  
  // 查找并替换words数组
  const wordsStartIndex = appContent.indexOf('words: [');
  if (wordsStartIndex === -1) {
    console.log('未找到words数组，无法更新');
    return false;
  }
  
  let braceCount = 0;
  let wordsEndIndex = wordsStartIndex;
  let inWordsArray = false;
  
  for (let i = wordsStartIndex; i < appContent.length; i++) {
    const char = appContent[i];
    if (char === '[') {
      braceCount++;
      inWordsArray = true;
    } else if (char === ']') {
      braceCount--;
      if (braceCount === 0 && inWordsArray) {
        wordsEndIndex = i;
        break;
      }
    }
  }
  
  if (wordsEndIndex === wordsStartIndex) {
    console.log('无法找到words数组的结束位置');
    return false;
  }
  
  // 替换words数组内容
  const newWordsArray = `words: [
${wordsArrayContent}
    ]`;
  
  const beforeWords = appContent.substring(0, wordsStartIndex);
  const afterWords = appContent.substring(wordsEndIndex + 1);
  const updatedContent = beforeWords + newWordsArray + afterWords;
  
  // 备份当前文件
  const backupPath = path.join(__dirname, 'app.js.backup.' + Date.now());
  fs.writeFileSync(backupPath, appContent, 'utf8');
  console.log(`已备份当前文件到: ${backupPath}`);
  
  // 写入更新后的内容
  fs.writeFileSync(appPath, updatedContent, 'utf8');
  console.log('已更新app.js中的词汇数据');
  
  return true;
}

// 主函数
function fixVocabularyCount() {
  try {
    console.log('开始修复词汇数量问题...');
    
    // 恢复原有词汇
    const originalWords = getOriginalWords();
    console.log(`原有词汇数量: ${originalWords.length}`);
    
    // 解析新词汇
    const newWords = parseNewWords();
    console.log(`解析到 ${newWords.length} 个新词汇`);
    
    // 验证和清理新词汇
    const validNewWords = newWords
      .filter(validateWord)
      .map(cleanWord);
    
    console.log(`有效新词汇数量: ${validNewWords.length}`);
    
    // 检查重复词汇
    const originalWordSet = new Set(originalWords.map(w => w.word.toLowerCase()));
    const uniqueNewWords = validNewWords.filter(word => 
      !originalWordSet.has(word.word.toLowerCase())
    );
    
    console.log(`新增词汇数量: ${uniqueNewWords.length}`);
    console.log(`跳过重复词汇数量: ${validNewWords.length - uniqueNewWords.length}`);
    
    // 为新词汇分配ID
    const nextId = originalWords.length > 0 ? Math.max(...originalWords.map(w => w.id)) + 1 : 1;
    const wordsWithIds = uniqueNewWords.map((word, index) => ({
      ...word,
      id: nextId + index
    }));
    
    // 更新app.js
    const updateSuccess = updateAppJsWords(originalWords, wordsWithIds);
    
    if (!updateSuccess) {
      throw new Error('更新app.js失败');
    }
    
    // 生成修复报告
    const report = {
      originalWords: originalWords.length,
      newWordsAdded: wordsWithIds.length,
      totalWords: originalWords.length + wordsWithIds.length,
      skippedWords: validNewWords.length - uniqueNewWords.length,
      paperTitle: 'Training language models to follow instructions with human feedback',
      fixTime: new Date().toISOString(),
      wordsByPaper: {}
    };
    
    // 按论文统计
    const allWords = [...originalWords, ...wordsWithIds];
    allWords.forEach(word => {
      if (!report.wordsByPaper[word.paperTitle]) {
        report.wordsByPaper[word.paperTitle] = 0;
      }
      report.wordsByPaper[word.paperTitle]++;
    });
    
    console.log('\n=== 修复报告 ===');
    console.log(`原有词汇数: ${report.originalWords}`);
    console.log(`新增词汇数: ${report.newWordsAdded}`);
    console.log(`总词汇数: ${report.totalWords}`);
    console.log(`跳过重复: ${report.skippedWords}`);
    console.log('按论文统计:');
    Object.entries(report.wordsByPaper).forEach(([paper, count]) => {
      console.log(`  ${paper}: ${count} 个`);
    });
    
    // 保存修复报告
    const reportPath = path.join(__dirname, 'VOCABULARY_COUNT_FIX_REPORT.md');
    const reportContent = `# 词汇数量修复报告

## 修复信息
- **修复时间**: ${report.fixTime}
- **原有词汇数**: ${report.originalWords}
- **新增词汇数**: ${report.newWordsAdded}
- **总词汇数**: ${report.totalWords}
- **跳过重复**: ${report.skippedWords}

## 按论文统计
${Object.entries(report.wordsByPaper).map(([paper, count]) => `- ${paper}: ${count} 个`).join('\n')}

## 修复内容
1. 恢复了完整的原有词汇数据（${report.originalWords}个）
2. 正确追加了新论文词汇（${report.newWordsAdded}个）
3. 保持了所有原有词汇的完整性
4. 避免了重复词汇的添加
5. 正确分配了词汇ID

## 注意事项
1. 词汇数量已恢复到正确状态
2. 所有论文的词汇统计已更新
3. 请在小程序中重新编译以查看最新数据
4. 统计信息将在下次启动时自动更新

## 技术细节
- 修复脚本: fix_vocabulary_count.js
- 数据源: app.js.backup.1754981265823
- 更新文件: app.js
- 备份文件: app.js.backup.${Date.now()}
`;

    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`\n修复报告已保存到: ${reportPath}`);
    
    console.log('\n✅ 词汇数量修复完成！');
    console.log('请在小程序中重新编译以查看最新数据。');
    
    return {
      success: true,
      report: report,
      words: wordsWithIds
    };
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixVocabularyCount();
}

module.exports = {
  fixVocabularyCount,
  getOriginalWords,
  parseNewWords,
  updateAppJsWords,
  getDifficulty,
  validateWord,
  cleanWord
};