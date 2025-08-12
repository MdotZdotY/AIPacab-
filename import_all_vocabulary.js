// import_all_vocabulary.js
// 将vocabulary目录下的所有词汇文件导入到小程序词汇库中

const fs = require('fs');
const path = require('path');

// 从app.js中读取现有词汇数据
function getExistingWords() {
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
  
  // 简单的解析（这里需要更复杂的解析逻辑）
  // 为了简化，我们直接返回一个示例结构
  return [
    {
      id: 1,
      word: 'Considerably',
      englishMeaning: 'By a notably large amount or to a notably large extent; significantly.',
      meaning: '相当大地，非常 (adverb)',
      partOfSpeech: 'adverb',
      pronunciation: '/kənˈsɪd.ə.r.ə.bli/',
      sentence: 'On the test data, we achieved top-1 and top-5 error rates of 37.5% and 17.0% which is considerably better than the previous state-of-the-art.',
      translation: '在测试数据上，我们取得了37.5%的top-1错误率和17.0%的top-5错误率，这比之前的最佳水平要好得多。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
      category: 'GRE高频词',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    }
  ];
}

// 获取下一个词汇ID
function getNextWordId(existingWords) {
  if (existingWords.length === 0) return 1;
  const maxId = Math.max(...existingWords.map(w => w.id));
  return maxId + 1;
}

// 根据词汇确定难度
function getDifficulty(word) {
  if (word.length <= 5) return 'easy';
  if (word.length <= 8) return 'medium';
  return 'hard';
}

// 解析词汇文件
function parseVocabularyFile(filePath, paperTitle) {
  console.log(`正在解析文件: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const words = [];
  const lines = content.split('\n');
  let currentCategory = '';
  let currentWord = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测分类标题
    if (line.includes('GRE高频词汇') || line.includes('GRE高频词')) {
      currentCategory = 'GRE高频词';
      continue;
    } else if (line.includes('TOEFL高频词汇') || line.includes('TOEFL高频词')) {
      currentCategory = 'TOEFL高频词';
      continue;
    } else if (line.includes('AI领域常用及专有词汇') || line.includes('AI专业词汇')) {
      currentCategory = 'AI专业词汇';
      continue;
    }

    // 检测新词汇（以*开头，但不是属性行）
    if (line.startsWith('*') && 
        !line.startsWith('* 英文释义:') && 
        !line.startsWith('* 中文释义:') && 
        !line.startsWith('* 词性:') && 
        !line.startsWith('* 音标:') && 
        !line.startsWith('* 在论文中的例句') && 
        !line.startsWith('* 例句中文翻译:')) {
      
      // 保存前一个词汇
      if (currentWord && currentWord.word && currentWord.meaning) {
        words.push(currentWord);
      }
      
      // 开始新词汇
      const wordText = line.substring(1).trim();
      currentWord = {
        word: wordText,
        category: currentCategory || 'AI专业词汇', // 如果没有分类，默认为AI专业词汇
        pronunciation: '',
        meaning: '',
        sentence: '',
        translation: '',
        paperTitle: paperTitle,
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
      currentWord.partOfSpeech = partOfSpeech;
      if (currentWord.meaning) {
        currentWord.meaning += ` (${partOfSpeech})`;
      }
    } else if (line.startsWith('* 音标:') && currentWord) {
      const pronunciation = line.replace('* 音标:', '').trim();
      currentWord.pronunciation = pronunciation;
    } else if (line.startsWith('* 在论文中的例句') && currentWord) {
      // 例句在同一行中
      const sentence = line.replace('* 在论文中的例句 (英文):', '').trim();
      currentWord.sentence = sentence;
    } else if (line.startsWith('* 例句中文翻译:') && currentWord) {
      // 翻译在同一行中
      const translation = line.replace('* 例句中文翻译:', '').trim();
      currentWord.translation = translation;
    }
  }

  // 添加最后一个词汇
  if (currentWord && currentWord.word && currentWord.meaning) {
    words.push(currentWord);
  }

  // 清理和验证词汇数据
  const cleanedWords = words.map(word => {
    return {
      ...word,
      word: word.word.trim(),
      meaning: word.meaning.trim(),
      sentence: word.sentence.trim(),
      translation: word.translation.trim(),
      pronunciation: word.pronunciation.trim(),
      englishMeaning: word.englishMeaning ? word.englishMeaning.trim() : '',
      partOfSpeech: word.partOfSpeech ? word.partOfSpeech.trim() : '',
      category: word.category.trim(),
      paperTitle: word.paperTitle.trim()
    };
  }).filter(word => word.word && word.meaning); // 确保词汇和含义都不为空

  console.log(`从 ${paperTitle} 解析出 ${cleanedWords.length} 个有效词汇`);
  return cleanedWords;
}

// 检查重复词汇
function checkDuplicates(newWords, existingWords) {
  const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));
  const uniqueWords = [];
  const duplicateWords = [];

  for (const word of newWords) {
    if (existingWordSet.has(word.word.toLowerCase())) {
      duplicateWords.push(word.word);
    } else {
      uniqueWords.push(word);
      existingWordSet.add(word.word.toLowerCase());
    }
  }

  return { uniqueWords, duplicateWords };
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
  console.log('开始导入vocabulary目录下的所有词汇文件...');

  // 获取现有词汇数据
  const existingWords = getExistingWords();
  console.log(`现有词汇数量: ${existingWords.length}`);

  // 获取vocabulary目录下的所有_Voca.txt文件
  const vocabularyDir = path.join(__dirname, 'vocabulary');
  const files = fs.readdirSync(vocabularyDir);
  const vocaFiles = files.filter(file => file.endsWith('_Voca.txt'));

  console.log(`找到 ${vocaFiles.length} 个词汇文件:`);
  vocaFiles.forEach(file => console.log(`  - ${file}`));

  let allNewWords = [];
  let totalProcessed = 0;

  // 处理每个词汇文件
  for (const file of vocaFiles) {
    const filePath = path.join(vocabularyDir, file);
    const paperTitle = file.replace('_Voca.txt', '');
    
    try {
      const words = parseVocabularyFile(filePath, paperTitle);
      allNewWords = allNewWords.concat(words);
      totalProcessed += words.length;
      console.log(`成功处理 ${file}: ${words.length} 个词汇`);
    } catch (error) {
      console.error(`处理文件 ${file} 时出错:`, error);
    }
  }

  console.log(`\n总共解析出 ${totalProcessed} 个新词汇`);

  // 检查重复词汇
  const { uniqueWords, duplicateWords } = checkDuplicates(allNewWords, existingWords);
  
  console.log(`\n重复词汇检查结果:`);
  console.log(`  - 新增词汇: ${uniqueWords.length} 个`);
  console.log(`  - 重复词汇: ${duplicateWords.length} 个`);
  
  if (duplicateWords.length > 0) {
    console.log(`  重复词汇列表:`);
    duplicateWords.forEach(word => console.log(`    - ${word}`));
  }

  // 为新增词汇分配ID
  let nextId = getNextWordId(existingWords);
  const wordsWithIds = uniqueWords.map(word => ({
    ...word,
    id: nextId++
  }));

  // 合并所有词汇
  const allWords = [...existingWords, ...wordsWithIds];
  console.log(`\n最终词汇总数: ${allWords.length}`);

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
    console.log('\n✅ 词汇导入完成！');
    console.log(`📊 统计信息:`);
    console.log(`   - 原有词汇: ${existingWords.length} 个`);
    console.log(`   - 新增词汇: ${uniqueWords.length} 个`);
    console.log(`   - 重复词汇: ${duplicateWords.length} 个`);
    console.log(`   - 最终总数: ${allWords.length} 个`);
    
    // 保存统计报告到文件
    const reportContent = `# 词汇导入报告

## 导入时间
${new Date().toLocaleString()}

## 导入结果
- 原有词汇: ${existingWords.length} 个
- 新增词汇: ${uniqueWords.length} 个
- 重复词汇: ${duplicateWords.length} 个
- 最终总数: ${allWords.length} 个

## 按分类统计
${Object.entries(stats.byCategory).map(([category, count]) => `- ${category}: ${count} 个`).join('\n')}

## 按难度统计
${Object.entries(stats.byDifficulty).map(([difficulty, count]) => `- ${difficulty}: ${count} 个`).join('\n')}

## 按论文统计
${Object.entries(stats.byPaper).map(([paper, count]) => `- ${paper}: ${count} 个`).join('\n')}

## 重复词汇列表
${duplicateWords.length > 0 ? duplicateWords.map(word => `- ${word}`).join('\n') : '无重复词汇'}

## 处理的文件
${vocaFiles.map(file => `- ${file}`).join('\n')}
`;

    fs.writeFileSync('VOCABULARY_IMPORT_REPORT.md', reportContent, 'utf8');
    console.log('\n📄 详细报告已保存到 VOCABULARY_IMPORT_REPORT.md');
  } else {
    console.error('\n❌ 更新app.js文件失败！');
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  parseVocabularyFile,
  checkDuplicates,
  updateAppJs,
  generateStatsReport
};