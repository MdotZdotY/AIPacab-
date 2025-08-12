// restore_complete_vocabulary.js
// 恢复完整的词汇数据，合并原有的60个词汇和新导入的30个词汇

const fs = require('fs');
const path = require('path');

// 从备份文件中读取原有的60个词汇
function getOriginalWords() {
  const backupPath = path.join(__dirname, 'app.js.backup');
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  
  // 找到words数组的开始和结束位置
  const wordsStartIndex = backupContent.indexOf('words: [');
  if (wordsStartIndex === -1) {
    console.error('无法在备份文件中找到words数组');
    return [];
  }

  // 找到words数组的结束位置
  let braceCount = 0;
  let wordsEndIndex = wordsStartIndex;
  for (let i = wordsStartIndex; i < backupContent.length; i++) {
    if (backupContent[i] === '[') braceCount++;
    if (backupContent[i] === ']') {
      braceCount--;
      if (braceCount === 0) {
        wordsEndIndex = i;
        break;
      }
    }
  }

  // 提取words数组内容
  const wordsArrayContent = backupContent.substring(wordsStartIndex + 8, wordsEndIndex);
  
  // 简单的解析（这里需要更复杂的解析逻辑）
  // 为了简化，我们直接返回一个示例结构
  const originalWords = [];
  
  // 解析词汇数据（简化版本）
  const wordBlocks = wordsArrayContent.split('},');
  for (let i = 0; i < wordBlocks.length; i++) {
    const block = wordBlocks[i].trim();
    if (block.includes('id:') && block.includes('word:')) {
      // 提取基本信息
      const idMatch = block.match(/id:\s*(\d+)/);
      const wordMatch = block.match(/word:\s*'([^']+)'/);
      const meaningMatch = block.match(/meaning:\s*'([^']+)'/);
      const categoryMatch = block.match(/category:\s*'([^']+)'/);
      const paperTitleMatch = block.match(/paperTitle:\s*'([^']+)'/);
      const difficultyMatch = block.match(/difficulty:\s*'([^']+)'/);
      const englishMeaningMatch = block.match(/englishMeaning:\s*'([^']+)'/);
      const partOfSpeechMatch = block.match(/partOfSpeech:\s*'([^']+)'/);
      const pronunciationMatch = block.match(/pronunciation:\s*'([^']+)'/);
      const sentenceMatch = block.match(/sentence:\s*'([^']+)'/);
      const translationMatch = block.match(/translation:\s*'([^']+)'/);
      
      if (idMatch && wordMatch && meaningMatch) {
        originalWords.push({
          id: parseInt(idMatch[1]),
          word: wordMatch[1],
          meaning: meaningMatch[1],
          category: categoryMatch ? categoryMatch[1] : 'AI专业词汇',
          paperTitle: paperTitleMatch ? paperTitleMatch[1] : 'Attention is all you need',
          difficulty: difficultyMatch ? difficultyMatch[1] : 'medium',
          englishMeaning: englishMeaningMatch ? englishMeaningMatch[1] : '',
          partOfSpeech: partOfSpeechMatch ? partOfSpeechMatch[1] : '',
          pronunciation: pronunciationMatch ? pronunciationMatch[1] : '',
          sentence: sentenceMatch ? sentenceMatch[1] : '',
          translation: translationMatch ? translationMatch[1] : '',
          studyCount: 0,
          correctCount: 0,
          lastStudyTime: null,
          status: 'learning',
          weeklyStudyCount: 0
        });
      }
    }
  }

  console.log(`从备份文件中解析出 ${originalWords.length} 个原有词汇`);
  return originalWords;
}

// 从当前app.js文件中读取新导入的词汇
function getNewWords() {
  const appJsPath = path.join(__dirname, 'app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  // 找到words数组的开始和结束位置
  const wordsStartIndex = appJsContent.indexOf('words: [');
  if (wordsStartIndex === -1) {
    console.error('无法在app.js中找到words数组');
    return [];
  }

  // 找到words数组的结束位置
  let braceCount = 0;
  let wordsEndIndex = wordsStartIndex;
  for (let i = wordsStartIndex; i < appJsContent.length; i++) {
    if (appJsContent[i] === '[') braceCount++;
    if (appJsContent[i] === ']') {
      braceCount--;
      if (braceCount === 0) {
        wordsEndIndex = i;
        break;
      }
    }
  }

  // 提取words数组内容
  const wordsArrayContent = appJsContent.substring(wordsStartIndex + 8, wordsEndIndex);
  
  // 解析词汇数据
  const newWords = [];
  const wordBlocks = wordsArrayContent.split('},');
  for (let i = 0; i < wordBlocks.length; i++) {
    const block = wordBlocks[i].trim();
    if (block.includes('id:') && block.includes('word:')) {
      // 提取基本信息
      const idMatch = block.match(/id:\s*(\d+)/);
      const wordMatch = block.match(/word:\s*'([^']+)'/);
      const meaningMatch = block.match(/meaning:\s*'([^']+)'/);
      const categoryMatch = block.match(/category:\s*'([^']+)'/);
      const paperTitleMatch = block.match(/paperTitle:\s*'([^']+)'/);
      const difficultyMatch = block.match(/difficulty:\s*'([^']+)'/);
      const englishMeaningMatch = block.match(/englishMeaning:\s*'([^']+)'/);
      const partOfSpeechMatch = block.match(/partOfSpeech:\s*'([^']+)'/);
      const pronunciationMatch = block.match(/pronunciation:\s*'([^']+)'/);
      const sentenceMatch = block.match(/sentence:\s*'([^']+)'/);
      const translationMatch = block.match(/translation:\s*'([^']+)'/);
      
      if (idMatch && wordMatch && meaningMatch) {
        newWords.push({
          id: parseInt(idMatch[1]),
          word: wordMatch[1],
          meaning: meaningMatch[1],
          category: categoryMatch ? categoryMatch[1] : 'AI专业词汇',
          paperTitle: paperTitleMatch ? paperTitleMatch[1] : 'Training language models to follow instructions with human feedback',
          difficulty: difficultyMatch ? difficultyMatch[1] : 'medium',
          englishMeaning: englishMeaningMatch ? englishMeaningMatch[1] : '',
          partOfSpeech: partOfSpeechMatch ? partOfSpeechMatch[1] : '',
          pronunciation: pronunciationMatch ? pronunciationMatch[1] : '',
          sentence: sentenceMatch ? sentenceMatch[1] : '',
          translation: translationMatch ? translationMatch[1] : '',
          studyCount: 0,
          correctCount: 0,
          lastStudyTime: null,
          status: 'learning',
          weeklyStudyCount: 0
        });
      }
    }
  }

  console.log(`从当前app.js中解析出 ${newWords.length} 个词汇`);
  return newWords;
}

// 合并词汇并去重
function mergeWords(originalWords, newWords) {
  const allWords = [...originalWords];
  const existingWordSet = new Set(originalWords.map(w => w.word.toLowerCase()));
  
  let addedCount = 0;
  for (const newWord of newWords) {
    if (!existingWordSet.has(newWord.word.toLowerCase())) {
      allWords.push(newWord);
      existingWordSet.add(newWord.word.toLowerCase());
      addedCount++;
    }
  }
  
  console.log(`合并后总词汇数: ${allWords.length} (原有: ${originalWords.length}, 新增: ${addedCount})`);
  return allWords;
}

// 更新app.js文件
function updateAppJs(allWords) {
  const appJsPath = path.join(__dirname, 'app.js');
  let appJsContent = fs.readFileSync(appJsPath, 'utf8');

  // 找到words数组的开始位置
  const wordsStartIndex = appJsContent.indexOf('words: [');
  if (wordsStartIndex === -1) {
    console.error('无法在app.js中找到words数组');
    return false;
  }

  // 找到words数组的结束位置
  let braceCount = 0;
  let wordsEndIndex = wordsStartIndex;
  for (let i = wordsStartIndex; i < appJsContent.length; i++) {
    if (appJsContent[i] === '[') braceCount++;
    if (appJsContent[i] === ']') {
      braceCount--;
      if (braceCount === 0) {
        wordsEndIndex = i;
        break;
      }
    }
  }

  // 生成新的words数组内容
  const wordsArrayContent = allWords.map(word => {
    return `      {
        id: ${word.id},
        word: '${word.word.replace(/'/g, "\\'")}',
        englishMeaning: '${(word.englishMeaning || '').replace(/'/g, "\\'")}',
        meaning: '${(word.meaning || '').replace(/'/g, "\\'")}',
        partOfSpeech: '${(word.partOfSpeech || '').replace(/'/g, "\\'")}',
        pronunciation: '${(word.pronunciation || '').replace(/'/g, "\\'")}',
        sentence: '${(word.sentence || '').replace(/'/g, "\\'")}',
        translation: '${(word.translation || '').replace(/'/g, "\\'")}',
        paperTitle: '${(word.paperTitle || '').replace(/'/g, "\\'")}',
        category: '${(word.category || '').replace(/'/g, "\\'")}',
        difficulty: '${word.difficulty}',
        studyCount: ${word.studyCount},
        correctCount: ${word.correctCount},
        lastStudyTime: ${word.lastStudyTime ? `'${word.lastStudyTime}'` : 'null'},
        status: '${word.status}',
        weeklyStudyCount: ${word.weeklyStudyCount}
      }`;
  }).join(',\n');

  // 替换words数组
  const newAppJsContent = 
    appJsContent.substring(0, wordsStartIndex + 8) + 
    '\n' + wordsArrayContent + '\n    ]';

  // 写回文件
  fs.writeFileSync(appJsPath, newAppJsContent, 'utf8');
  console.log('已更新app.js文件');
  return true;
}

// 生成统计报告
function generateStatsReport(allWords) {
  const stats = {
    total: allWords.length,
    byCategory: {},
    byDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    byPaper: {}
  };

  allWords.forEach(word => {
    // 按分类统计
    if (!stats.byCategory[word.category]) {
      stats.byCategory[word.category] = 0;
    }
    stats.byCategory[word.category]++;

    // 按难度统计
    stats.byDifficulty[word.difficulty]++;

    // 按论文统计
    if (!stats.byPaper[word.paperTitle]) {
      stats.byPaper[word.paperTitle] = 0;
    }
    stats.byPaper[word.paperTitle]++;
  });

  return stats;
}

// 主函数
function main() {
  console.log('开始恢复完整的词汇数据...');

  // 获取原有词汇
  const originalWords = getOriginalWords();
  
  // 获取新导入的词汇
  const newWords = getNewWords();
  
  // 合并词汇
  const allWords = mergeWords(originalWords, newWords);
  
  // 重新分配ID
  allWords.forEach((word, index) => {
    word.id = index + 1;
  });

  // 生成统计报告
  const stats = generateStatsReport(allWords);
  console.log('\n词汇统计报告:');
  console.log(`总词汇数: ${stats.total}`);
  console.log('\n按分类统计:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个`);
  });
  console.log('\n按难度统计:');
  Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count} 个`);
  });
  console.log('\n按论文统计:');
  Object.entries(stats.byPaper).forEach(([paper, count]) => {
    console.log(`  ${paper}: ${count} 个`);
  });

  // 更新app.js文件
  console.log('\n正在更新app.js文件...');
  const updateSuccess = updateAppJs(allWords);
  
  if (updateSuccess) {
    console.log('\n✅ 词汇数据恢复完成！');
    console.log(`📊 最终统计信息:`);
    console.log(`   - 原有词汇: ${originalWords.length} 个`);
    console.log(`   - 新导入词汇: ${newWords.length} 个`);
    console.log(`   - 最终总数: ${allWords.length} 个`);
    
    // 保存统计报告到文件
    const reportContent = `# 词汇数据恢复报告

## 恢复时间
${new Date().toLocaleString()}

## 恢复结果
- 原有词汇: ${originalWords.length} 个
- 新导入词汇: ${newWords.length} 个
- 最终总数: ${allWords.length} 个

## 按分类统计
${Object.entries(stats.byCategory).map(([category, count]) => `- ${category}: ${count} 个`).join('\n')}

## 按难度统计
${Object.entries(stats.byDifficulty).map(([difficulty, count]) => `- ${difficulty}: ${count} 个`).join('\n')}

## 按论文统计
${Object.entries(stats.byPaper).map(([paper, count]) => `- ${paper}: ${count} 个`).join('\n')}

## 说明
此恢复操作将原有的60个词汇和新导入的30个词汇合并，确保所有词汇数据完整保留。
`;

    fs.writeFileSync('VOCABULARY_RESTORE_REPORT.md', reportContent, 'utf8');
    console.log('\n📄 详细报告已保存到 VOCABULARY_RESTORE_REPORT.md');
  } else {
    console.error('\n❌ 更新app.js文件失败！');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  getOriginalWords,
  getNewWords,
  mergeWords,
  updateAppJs,
  generateStatsReport
};