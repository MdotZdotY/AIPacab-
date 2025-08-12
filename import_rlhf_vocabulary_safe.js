// import_rlhf_vocabulary_safe.js
// 安全地将Training language models to follow instructions with human feedback论文的词汇追加到现有词汇库中

const fs = require('fs');
const path = require('path');

// 解析词汇文件
function parseRLHFVocabulary() {
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

// 手动定义现有词汇数据（从app.js中提取）
function getExistingWords() {
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
    },
    {
      id: 2,
      word: 'Prohibitively',
      englishMeaning: 'To an extent that forbids or prevents something.',
      meaning: '(价格等)过高地，令人望而却步地 (adverb)',
      partOfSpeech: 'adverb',
      pronunciation: '/proʊˈhɪb.ə.t̬ɪv.li/',
      sentence: 'Despite the attractive qualities of CNNs, and despite the relative efficiency of their local architecture, they have still been prohibitively expensive to apply in large scale to high-resolution images.',
      translation: '尽管卷积神经网络具有吸引人的特性，并且其局部架构相对高效，但将它们大规模应用于高分辨率图像仍然是极其昂贵的。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
      category: 'GRE高频词',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      id: 3,
      word: 'Inherent',
      englishMeaning: 'Existing in something as a permanent, essential, or characteristic attribute.',
      meaning: '固有的，内在的 (adjective)',
      partOfSpeech: 'adjective',
      pronunciation: '/ɪnˈhɪr.ənt/',
      sentence: 'We wrote a highly-optimized GPU implementation of 2D convolution and all the other operations inherent in training convolutional neural networks, which we make available publicly.',
      translation: '我们编写了一个高度优化的GPU实现，用于2D卷积以及训练卷积神经网络所固有的所有其他操作，并将其公开。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
      category: 'GRE高频词',
      difficulty: 'medium',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      id: 4,
      word: 'Attention',
      englishMeaning: 'The ability to focus on something.',
      meaning: '注意力 (noun)',
      partOfSpeech: 'noun',
      pronunciation: '/əˈten.ʃən/',
      sentence: 'Attention is all you need.',
      translation: '注意力就是你所需要的一切。',
      paperTitle: 'Attention Is All You Need',
      category: 'AI专业词汇',
      difficulty: 'medium',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      id: 5,
      word: 'Transformer',
      englishMeaning: 'A model architecture that uses attention mechanisms.',
      meaning: '变换器，转换器 (noun)',
      partOfSpeech: 'noun',
      pronunciation: '/trænsˈfɔː.mər/',
      sentence: 'The Transformer model architecture relies entirely on self-attention.',
      translation: 'Transformer模型架构完全依赖于自注意力机制。',
      paperTitle: 'Attention Is All You Need',
      category: 'AI专业词汇',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    }
  ];
}

// 更新app.js中的词汇数据
function updateAppJsWords(existingWords, newWords) {
  const appPath = path.join(__dirname, 'app.js');
  let appContent = fs.readFileSync(appPath, 'utf8');
  
  // 合并词汇
  const allWords = [...existingWords, ...newWords];
  
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
  
  // 备份原文件
  const backupPath = path.join(__dirname, 'app.js.backup.' + Date.now());
  fs.writeFileSync(backupPath, appContent, 'utf8');
  console.log(`已备份原文件到: ${backupPath}`);
  
  // 写入更新后的内容
  fs.writeFileSync(appPath, updatedContent, 'utf8');
  console.log('已更新app.js中的词汇数据');
  
  return true;
}

// 主函数
function importRLHFVocabularySafe() {
  try {
    console.log('开始安全导入RLHF论文词汇...');
    
    // 解析新词汇
    const newWords = parseRLHFVocabulary();
    console.log(`解析到 ${newWords.length} 个新词汇`);
    
    // 验证和清理新词汇
    const validNewWords = newWords
      .filter(validateWord)
      .map(cleanWord);
    
    console.log(`有效新词汇数量: ${validNewWords.length}`);
    
    // 获取现有词汇
    const existingWords = getExistingWords();
    console.log(`现有词汇数量: ${existingWords.length}`);
    
    // 检查重复词汇
    const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));
    const uniqueNewWords = validNewWords.filter(word => 
      !existingWordSet.has(word.word.toLowerCase())
    );
    
    console.log(`新增词汇数量: ${uniqueNewWords.length}`);
    console.log(`跳过重复词汇数量: ${validNewWords.length - uniqueNewWords.length}`);
    
    // 为新词汇分配ID
    const nextId = existingWords.length > 0 ? Math.max(...existingWords.map(w => w.id)) + 1 : 1;
    const wordsWithIds = uniqueNewWords.map((word, index) => ({
      ...word,
      id: nextId + index
    }));
    
    // 更新app.js
    const updateSuccess = updateAppJsWords(existingWords, wordsWithIds);
    
    if (!updateSuccess) {
      throw new Error('更新app.js失败');
    }
    
    // 生成导入报告
    const report = {
      totalWords: existingWords.length + wordsWithIds.length,
      existingWords: existingWords.length,
      newWordsAdded: wordsWithIds.length,
      skippedWords: validNewWords.length - uniqueNewWords.length,
      paperTitle: 'Training language models to follow instructions with human feedback',
      importTime: new Date().toISOString(),
      wordsByCategory: {}
    };
    
    // 按分类统计新词汇
    wordsWithIds.forEach(word => {
      if (!report.wordsByCategory[word.category]) {
        report.wordsByCategory[word.category] = 0;
      }
      report.wordsByCategory[word.category]++;
    });
    
    console.log('\n=== 导入报告 ===');
    console.log(`论文标题: ${report.paperTitle}`);
    console.log(`原有词汇数: ${report.existingWords}`);
    console.log(`新增词汇数: ${report.newWordsAdded}`);
    console.log(`总词汇数: ${report.totalWords}`);
    console.log(`跳过重复: ${report.skippedWords}`);
    console.log('新增词汇按分类统计:');
    Object.entries(report.wordsByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个`);
    });
    
    // 显示新增的词汇列表
    console.log('\n=== 新增词汇列表 ===');
    wordsWithIds.forEach(word => {
      console.log(`${word.word} - ${word.meaning}`);
    });
    
    // 保存详细报告
    const reportPath = path.join(__dirname, 'RLHF_VOCABULARY_SAFE_IMPORT_REPORT.md');
    const reportContent = `# RLHF论文词汇安全导入报告

## 导入信息
- **论文标题**: ${report.paperTitle}
- **导入时间**: ${report.importTime}
- **原有词汇数**: ${report.existingWords}
- **新增词汇数**: ${report.newWordsAdded}
- **总词汇数**: ${report.totalWords}
- **跳过重复**: ${report.skippedWords}

## 新增词汇按分类统计
${Object.entries(report.wordsByCategory).map(([category, count]) => `- ${category}: ${count} 个`).join('\n')}

## 新增词汇详细列表
${wordsWithIds.map(word => `### ${word.word}
- **中文释义**: ${word.meaning}
- **英文释义**: ${word.englishMeaning || '无'}
- **音标**: ${word.pronunciation || '无'}
- **例句**: ${word.sentence || '无'}
- **翻译**: ${word.translation || '无'}
- **分类**: ${word.category}
- **难度**: ${word.difficulty}
- **论文**: ${word.paperTitle}
`).join('\n')}

## 注意事项
1. 词汇已成功追加到app.js的globalData.words中
2. 重复词汇已自动跳过
3. 所有词汇都已分配唯一ID
4. 词汇难度已根据单词长度自动判断
5. 原app.js文件已备份
6. 请在小程序中重新编译以查看最新数据
7. 统计信息将在下次启动时自动更新

## 技术细节
- 导入脚本: import_rlhf_vocabulary_safe.js
- 词汇文件: Training language models to follow instructions with human feedback_Voca.txt
- 更新文件: app.js
- 备份文件: app.js.backup.${Date.now()}
`;

    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`\n详细导入报告已保存到: ${reportPath}`);
    
    console.log('\n✅ RLHF论文词汇安全导入完成！');
    console.log('请在小程序中重新编译以查看最新数据。');
    
    return {
      success: true,
      report: report,
      words: wordsWithIds
    };
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  importRLHFVocabularySafe();
}

module.exports = {
  importRLHFVocabularySafe,
  parseRLHFVocabulary,
  getExistingWords,
  updateAppJsWords,
  getDifficulty,
  validateWord,
  cleanWord
};