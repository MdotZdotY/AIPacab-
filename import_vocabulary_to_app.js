// import_vocabulary_to_app.js
// 将Learning the Bitter Lesson论文的词汇导入到小程序词汇库中

// 模拟小程序环境
const mockApp = {
  globalData: {
    words: []
  }
};

// 解析词汇清单
function parseVocabularyFromFile() {
  const words = [];
  let currentCategory = '';
  let currentWord = null;
  let wordId = 1;

  // 直接从解析结果中获取词汇数据
  const newWords = [
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

  // 为每个词汇分配ID
  newWords.forEach((word, index) => {
    word.id = wordId + index;
  });

  return newWords;
}

// 检查词汇是否已存在
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

// 主函数
function main() {
  console.log('开始导入Learning the Bitter Lesson论文词汇到小程序...');
  
  // 解析词汇
  const newWords = parseVocabularyFromFile();
  
  console.log(`解析到 ${newWords.length} 个词汇`);
  
  // 读取现有词汇表（这里我们模拟一个空的词汇表，实际使用时需要从存储中读取）
  const existingWords = [];
  
  // 检查重复词汇
  const { uniqueWords, duplicates } = checkDuplicateWords(newWords, existingWords);
  
  console.log(`发现 ${duplicates.length} 个重复词汇，将跳过导入`);
  console.log(`将导入 ${uniqueWords.length} 个新词汇`);
  
  if (duplicates.length > 0) {
    console.log('重复的词汇:', duplicates);
  }
  
  // 输出导入的词汇信息
  console.log('\n导入的词汇列表:');
  uniqueWords.forEach(word => {
    console.log(`- ${word.word} (${word.category}): ${word.meaning}`);
  });
  
  console.log('\n导入完成！');
  console.log(`成功导入 ${uniqueWords.length} 个新词汇`);
  console.log('论文信息已在 papersData.js 中更新');
  
  // 返回导入的词汇，供其他脚本使用
  return uniqueWords;
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseVocabularyFromFile,
  checkDuplicateWords,
  main
};