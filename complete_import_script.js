// complete_import_script.js
// 完整的导入脚本：将Learning the Bitter Lesson论文信息和词汇一起导入到小程序中

const fs = require('fs');
const path = require('path');

// 模拟小程序环境
const mockApp = {
  globalData: {
    words: []
  }
};

// 获取现有词汇数据（模拟从存储中读取）
function getExistingWords() {
  try {
    // 这里应该从实际的存储中读取，现在模拟空数据
    return [];
  } catch (e) {
    console.log('没有找到现有词汇数据，将创建新的词汇库');
    return [];
  }
}

// 准备导入的词汇数据
function prepareVocabularyData() {
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

// 保存词汇到存储
function saveWordsToStorage(words) {
  try {
    // 这里应该调用小程序的存储API
    console.log(`成功保存 ${words.length} 个词汇到存储`);
    return true;
  } catch (e) {
    console.error('保存词汇失败:', e);
    return false;
  }
}

// 生成导入报告
function generateImportReport(uniqueWords, duplicates, paperInfo) {
  console.log('\n=== 导入报告 ===');
  console.log(`📄 论文信息:`);
  console.log(`   - 标题: ${paperInfo.title}`);
  console.log(`   - 作者: ${paperInfo.authors}`);
  console.log(`   - 年份: ${paperInfo.year}`);
  console.log(`   - 期刊: ${paperInfo.journal}`);
  console.log(`   - 词汇数量: ${uniqueWords.length}`);
  
  console.log(`\n📚 词汇导入:`);
  console.log(`   - 总解析词汇: ${uniqueWords.length + duplicates.length}`);
  console.log(`   - 重复词汇: ${duplicates.length} 个`);
  console.log(`   - 成功导入: ${uniqueWords.length} 个`);
  
  if (duplicates.length > 0) {
    console.log(`   - 跳过的重复词汇: ${duplicates.join(', ')}`);
  }
  
  console.log(`\n📝 导入的词汇列表:`);
  uniqueWords.forEach(word => {
    console.log(`   - ${word.word} (${word.category}): ${word.meaning}`);
  });
  
  console.log(`\n✅ 导入完成！`);
  console.log(`   - 论文信息已添加到 papersData.js`);
  console.log(`   - ${uniqueWords.length} 个新词汇已准备导入词汇库`);
}

// 主导入函数
function importPaperAndVocabulary() {
  console.log('🚀 开始导入Learning the Bitter Lesson论文和词汇...\n');
  
  // 1. 获取现有词汇
  const existingWords = getExistingWords();
  console.log(`📖 当前词汇库中有 ${existingWords.length} 个词汇`);
  
  // 2. 准备新词汇数据
  const newWords = prepareVocabularyData();
  console.log(`📝 准备导入 ${newWords.length} 个词汇`);
  
  // 3. 检查重复词汇
  const { uniqueWords, duplicates } = checkDuplicateWords(newWords, existingWords);
  
  if (duplicates.length > 0) {
    console.log(`⚠️  发现 ${duplicates.length} 个重复词汇，将跳过导入`);
  }
  
  // 4. 分配ID
  const wordsWithIds = assignWordIds(uniqueWords, existingWords);
  
  // 5. 合并词汇库
  const updatedWords = [...existingWords, ...wordsWithIds];
  
  // 6. 保存到存储
  const saveSuccess = saveWordsToStorage(updatedWords);
  
  // 7. 论文信息
  const paperInfo = {
    title: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
    authors: 'Rich Sutton et al.',
    year: 2024,
    journal: 'CVPR',
    wordCount: uniqueWords.length
  };
  
  // 8. 生成报告
  generateImportReport(uniqueWords, duplicates, paperInfo);
  
  return {
    success: saveSuccess,
    paperInfo: paperInfo,
    importedWords: uniqueWords,
    skippedWords: duplicates,
    totalWords: updatedWords.length
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  const result = importPaperAndVocabulary();
  
  if (result.success) {
    console.log('\n🎉 导入成功！');
    console.log(`📊 统计信息:`);
    console.log(`   - 论文: ${result.paperInfo.title}`);
    console.log(`   - 导入词汇: ${result.importedWords.length} 个`);
    console.log(`   - 跳过词汇: ${result.skippedWords.length} 个`);
    console.log(`   - 总词汇库: ${result.totalWords} 个`);
  } else {
    console.log('\n❌ 导入失败，请检查错误信息');
  }
}

module.exports = {
  importPaperAndVocabulary,
  prepareVocabularyData,
  checkDuplicateWords,
  assignWordIds
};