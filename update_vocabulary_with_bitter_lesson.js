// update_vocabulary_with_bitter_lesson.js
// 将Learning the Bitter Lesson词汇添加到现有词汇库中

const fs = require('fs');
const path = require('path');

// 准备Learning the Bitter Lesson词汇数据
function prepareBitterLessonVocabulary() {
  return [
    {
      word: 'Primacy',
      category: 'GRE高频词',
      pronunciation: '/ˈpraɪ.mə.si/',
      meaning: '首要地位，卓越 (noun)',
      englishMeaning: 'The fact of being primary, preeminent, or more important.',
      sentence: 'Sutton\'s thesis emphasizes the **primacy** of general methods that harness computational power over human-designed representations and domain-specific knowledge.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Embracement',
      category: 'GRE高频词',
      pronunciation: '/ɪmˈbreɪ.smənt/',
      meaning: '拥抱，欣然接受 (noun)',
      englishMeaning: 'The act of accepting or supporting a belief, theory, or change willingly and enthusiastically.',
      sentence: 'We analyze two decades of CVPR abstracts and titles using large language models (LLMs) to assess the field\'s **embracement** of these principles.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Systematically',
      category: 'GRE高频词',
      pronunciation: '/ˌsɪs.təˈmæt̬.ɪ.kəl.i/',
      meaning: '系统地，有条理地 (adverb)',
      englishMeaning: 'According to a fixed plan or system; methodically.',
      sentence: 'Our methodology leverages state-of-the-art natural language processing techniques to **systematically** evaluate the evolution of research approaches in computer vision.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Alignment',
      category: 'TOEFL高频词',
      pronunciation: '/əˈlaɪn.mənt/',
      meaning: '对齐，一致 (noun)',
      englishMeaning: 'A position of agreement or alliance.',
      sentence: 'This study examines the **alignment** of Conference on Computer Vision and Pattern Recognition (CVPR) research with the principles of the "bitter lesson" proposed by Rich Sutton.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'medium',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Principle',
      category: 'TOEFL高频词',
      pronunciation: '/ˈprɪn.sə.pəl/',
      meaning: '原则，原理 (noun)',
      englishMeaning: 'A fundamental truth or proposition that serves as the foundation for a system of belief or behavior or for a chain of reasoning.',
      sentence: 'The field of Computer Vision (CV) exemplifies the **principles** of Sutton\'s "bitter lesson."',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'medium',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Comprehensive',
      category: 'TOEFL高频词',
      pronunciation: '/ˌkɑːm.prəˈhen.sɪv/',
      meaning: '全面的，综合的 (adjective)',
      englishMeaning: 'Complete; including all or nearly all elements or aspects of something.',
      sentence: 'This method allows us to uncover patterns and trends that may not be immediately apparent through traditional research methods, providing a more **comprehensive** understanding of the current state of ML research.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Examines',
      category: 'IELTS高频词',
      pronunciation: '/ɪɡˈzæm.ɪnz/',
      meaning: '检查，研究 (verb)',
      englishMeaning: 'To inspect (someone or something) in detail to determine their nature or condition; investigate thoroughly.',
      sentence: 'This study **examines** the alignment of Conference on Computer Vision and Pattern Recognition (CVPR) research with the principles of the "bitter lesson".',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'medium',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Methodology',
      category: 'IELTS高频词',
      pronunciation: '/ˌmeθ.əˈdɑː.lə.dʒi/',
      meaning: '方法论 (noun)',
      englishMeaning: 'A system of methods used in a particular area of study or activity.',
      sentence: 'Our **methodology** leverages state-of-the-art natural language processing techniques to systematically evaluate the evolution of research approaches in computer vision.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Implications',
      category: 'IELTS高频词',
      pronunciation: '/ˌɪm.pləˈkeɪ.ʃənz/',
      meaning: '含义，可能的影响 (noun (plural))',
      englishMeaning: 'The conclusion that can be drawn from something although it is not explicitly stated; a likely consequence of something.',
      sentence: 'We discuss the **implications** of these findings for the future direction of computer vision research and its potential impact on broader artificial intelligence development.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Heuristics',
      category: 'AI专业词汇',
      pronunciation: '/hjʊˈrɪs.tɪks/',
      meaning: '启发式；启发法 (noun (plural))',
      englishMeaning: 'A practical approach to problem-solving or self-discovery that is not guaranteed to be optimal or perfect, but is sufficient for the immediate goals.',
      sentence: '...leveraging computation through search algorithms and optimization techniques rather than depending on human-designed **heuristics** and problem-specific strategies?',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Paradigm Shift',
      category: 'AI专业词汇',
      pronunciation: '/ˈper.ə.daɪm ʃɪft/',
      meaning: '范式转移 (noun phrase)',
      englishMeaning: 'A fundamental change in the basic concepts and experimental practices of a scientific discipline.',
      sentence: '...CV underwent a **paradigm shift** with embracing deep learning, particularly Convolutional Neural Networks.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    },
    {
      word: 'Hand-crafted features',
      category: 'AI专业词汇',
      pronunciation: '/hændˈkræf.tɪd ˈfiː.tʃɚz/',
      meaning: '手工设计特征 (noun phrase)',
      englishMeaning: 'In traditional machine learning, features of data that are designed and engineered by human experts based on domain knowledge, rather than being learned automatically by a model.',
      sentence: 'Traditionally reliant on **hand-crafted features** like SIFT, HOG, and Haar cascades for object detection and image classification.',
      paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
      difficulty: 'hard',
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    }
  ];
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

// 分配词汇ID
function assignWordIds(uniqueWords, existingWords) {
  const nextId = existingWords.length > 0 ? Math.max(...existingWords.map(w => w.id)) + 1 : 1;
  uniqueWords.forEach((word, index) => {
    word.id = nextId + index;
  });
  return uniqueWords;
}

// 更新app.js中的词汇数据
function updateAppJsVocabulary() {
  const appJsPath = path.join(__dirname, 'app.js');
  let appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  // 读取现有的词汇数据
  const existingWords = getExistingWordsFromAppJs(appJsContent);
  const newWords = prepareBitterLessonVocabulary();
  
  // 检查重复词汇
  const { uniqueWords, duplicates } = checkDuplicateWords(newWords, existingWords);
  
  if (uniqueWords.length === 0) {
    console.log('所有词汇都已存在，无需更新');
    return;
  }
  
  // 分配ID
  const wordsWithIds = assignWordIds(uniqueWords, existingWords);
  
  // 合并词汇库
  const updatedWords = [...existingWords, ...wordsWithIds];
  
  // 更新app.js文件
  const updatedAppJsContent = updateAppJsContent(appJsContent, updatedWords);
  fs.writeFileSync(appJsPath, updatedAppJsContent, 'utf8');
  
  console.log(`✅ 成功更新app.js词汇库`);
  console.log(`📊 统计信息:`);
  console.log(`   - 原有词汇: ${existingWords.length} 个`);
  console.log(`   - 新增词汇: ${uniqueWords.length} 个`);
  console.log(`   - 跳过重复: ${duplicates.length} 个`);
  console.log(`   - 总词汇库: ${updatedWords.length} 个`);
  
  if (duplicates.length > 0) {
    console.log(`   - 重复词汇: ${duplicates.join(', ')}`);
  }
  
  return {
    originalCount: existingWords.length,
    addedCount: uniqueWords.length,
    skippedCount: duplicates.length,
    totalCount: updatedWords.length,
    addedWords: uniqueWords.map(w => w.word)
  };
}

// 从app.js内容中提取现有词汇
function getExistingWordsFromAppJs(appJsContent) {
  // 查找words数组的开始和结束位置
  const wordsStart = appJsContent.indexOf('words: [');
  if (wordsStart === -1) {
    console.error('未找到words数组');
    return [];
  }
  
  // 找到words数组的结束位置
  let braceCount = 0;
  let wordsEnd = wordsStart;
  let inWordsArray = false;
  
  for (let i = wordsStart; i < appJsContent.length; i++) {
    const char = appJsContent[i];
    if (char === '[' && !inWordsArray) {
      inWordsArray = true;
      braceCount = 1;
    } else if (char === '[' && inWordsArray) {
      braceCount++;
    } else if (char === ']' && inWordsArray) {
      braceCount--;
      if (braceCount === 0) {
        wordsEnd = i + 1;
        break;
      }
    }
  }
  
  // 提取words数组内容
  const wordsArrayContent = appJsContent.substring(wordsStart + 7, wordsEnd - 1);
  
  // 解析词汇对象（简化版本，实际使用时需要更复杂的解析）
  try {
    // 这里使用eval来解析JavaScript对象（仅用于开发环境）
    const words = eval('[' + wordsArrayContent + ']');
    return Array.isArray(words) ? words : [];
  } catch (error) {
    console.error('解析词汇数据失败:', error);
    return [];
  }
}

// 更新app.js内容
function updateAppJsContent(appJsContent, updatedWords) {
  // 查找words数组的开始位置
  const wordsStart = appJsContent.indexOf('words: [');
  if (wordsStart === -1) {
    console.error('未找到words数组');
    return appJsContent;
  }
  
  // 找到words数组的结束位置
  let braceCount = 0;
  let wordsEnd = wordsStart;
  let inWordsArray = false;
  
  for (let i = wordsStart; i < appJsContent.length; i++) {
    const char = appJsContent[i];
    if (char === '[' && !inWordsArray) {
      inWordsArray = true;
      braceCount = 1;
    } else if (char === '[' && inWordsArray) {
      braceCount++;
    } else if (char === ']' && inWordsArray) {
      braceCount--;
      if (braceCount === 0) {
        wordsEnd = i + 1;
        break;
      }
    }
  }
  
  // 生成新的词汇数组字符串
  const newWordsString = generateWordsArrayString(updatedWords);
  
  // 替换words数组
  const beforeWords = appJsContent.substring(0, wordsStart + 7);
  const afterWords = appJsContent.substring(wordsEnd);
  
  return beforeWords + newWordsString + afterWords;
}

// 生成词汇数组字符串
function generateWordsArrayString(words) {
  const wordStrings = words.map(word => {
    return `      {
        id: ${word.id},
        word: '${word.word}',
        meaning: '${word.meaning}',
        pronunciation: '${word.pronunciation}',
        sentence: '${word.sentence}',
        translation: '${word.translation || ''}',
        category: '${word.category}',
        paperTitle: '${word.paperTitle}',
        difficulty: '${word.difficulty}',
        studyCount: ${word.studyCount || 0},
        correctCount: ${word.correctCount || 0},
        lastStudyTime: ${word.lastStudyTime ? `'${word.lastStudyTime}'` : 'null'},
        status: '${word.status}',
        weeklyStudyCount: ${word.weeklyStudyCount || 0}
      }`;
  });
  
  return '\n' + wordStrings.join(',\n') + '\n    ';
}

// 主函数
function main() {
  console.log('🚀 开始更新app.js词汇库...\n');
  
  try {
    const result = updateAppJsVocabulary();
    
    if (result) {
      console.log('\n📝 新增词汇列表:');
      result.addedWords.forEach(word => {
        console.log(`   - ${word}`);
      });
      
      console.log('\n🎉 更新完成！');
      console.log('📊 统计页面将自动显示更新后的数据');
      console.log('💡 重启小程序即可看到新的词汇统计');
    }
  } catch (error) {
    console.error('❌ 更新失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  updateAppJsVocabulary,
  prepareBitterLessonVocabulary,
  checkDuplicateWords
};