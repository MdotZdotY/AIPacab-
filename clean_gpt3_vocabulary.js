// clean_gpt3_vocabulary.js
// 清理GPT-3词汇中的错误条目

const fs = require('fs');
const path = require('path');

function cleanGPT3Vocabulary() {
  console.log('开始清理GPT-3词汇...');
  
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  // 获取现有词汇
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) {
    throw new Error('未找到词汇数组');
  }
  
  const existingWordsStr = wordsMatch[1];
  const existingWords = eval(`[${existingWordsStr}]`);
  
  console.log(`清理前词汇总数: ${existingWords.length}`);
  
  // 过滤掉错误的词汇条目
  const validWords = existingWords.filter(word => {
    // 移除包含"论文"、"Title"、"Time"、"URL"、"英文释义"、"中文释义"等错误条目
    const invalidPatterns = [
      '论文名 (Title)',
      '论文发表时间 (Publication Time)',
      '论文地址 (URL)',
      '英文释义',
      '中文释义',
      '词性',
      '音标',
      '在论文中的例句',
      '例句中文翻译'
    ];
    
    return !invalidPatterns.some(pattern => word.word.includes(pattern));
  });
  
  console.log(`清理后词汇总数: ${validWords.length}`);
  console.log(`移除的词汇数量: ${existingWords.length - validWords.length}`);
  
  // 重新分配ID
  const cleanedWords = validWords.map((word, index) => ({
    ...word,
    id: index + 1
  }));
  
  // 构建新的词汇字符串
  const newWordsStr = cleanedWords.map(word => `      {
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
  console.log('成功清理GPT-3词汇');
  
  // 验证清理结果
  const gpt3Words = cleanedWords.filter(w => w.paperTitle === 'Language Models are Few-Shot Learners');
  console.log(`GPT-3论文有效词汇数: ${gpt3Words.length}`);
  
  // 显示前10个GPT-3词汇作为示例
  console.log('\n前10个GPT-3词汇示例:');
  gpt3Words.slice(0, 10).forEach((word, index) => {
    console.log(`  ${index + 1}. ${word.word} (${word.category})`);
  });
  
  return cleanedWords;
}

// 执行清理
cleanGPT3Vocabulary();
