// import_learning_bitter_lesson.js
// 导入Learning the Bitter Lesson论文的词汇和论文信息

const fs = require('fs');
const path = require('path');

// 解析词汇清单
function parseVocabularyFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const words = [];
  let currentCategory = '';
  let currentWord = null;
  let wordId = 1; // 临时ID，实际导入时会重新分配

  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测分类标题
    if (line.includes('GRE高频词')) {
      currentCategory = 'GRE高频词';
      continue;
    } else if (line.includes('TOEFL高频词')) {
      currentCategory = 'TOEFL高频词';
      continue;
    } else if (line.includes('IELTS高频词')) {
      currentCategory = 'IELTS高频词';
      continue;
    } else if (line.includes('AI领域专有词')) {
      currentCategory = 'AI专业词汇';
      continue;
    }

    // 检测新词汇（以*开头）
    if (line.startsWith('* **') && line.includes('**')) {
      // 保存前一个词汇
      if (currentWord && currentWord.word) {
        words.push(currentWord);
      }
      
      // 开始新词汇
      const wordMatch = line.match(/\* \*\*([^*]+)\*\*\*/);
      if (wordMatch) {
        currentWord = {
          id: wordId++,
          word: wordMatch[1].trim(),
          category: currentCategory,
          pronunciation: '',
          meaning: '',
          englishMeaning: '',
          sentence: '',
          translation: '',
          paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
          difficulty: getDifficulty(wordMatch[1].trim()),
          studyCount: 0,
          correctCount: 0,
          lastStudyTime: null,
          status: 'learning',
          weeklyStudyCount: 0
        };
      }
      continue;
    }

    // 解析词汇属性
    if (currentWord) {
      if (line.includes('**英文释义**:')) {
        const match = line.match(/\*\*英文释义\*\*: (.+)/);
        if (match) {
          currentWord.englishMeaning = match[1].trim();
        } else {
          // 尝试匹配带星号的格式
          const matchWithStar = line.match(/\* \*\*英文释义\*\*: (.+)/);
          if (matchWithStar) {
            currentWord.englishMeaning = matchWithStar[1].trim();
          }
        }
      } else if (line.includes('**中文释义**:')) {
        const match = line.match(/\*\*中文释义\*\*: (.+)/);
        if (match) {
          currentWord.meaning = match[1].trim();
        } else {
          // 尝试匹配带星号的格式
          const matchWithStar = line.match(/\* \*\*中文释义\*\*: (.+)/);
          if (matchWithStar) {
            currentWord.meaning = matchWithStar[1].trim();
          }
        }
      } else if (line.includes('**词性**:')) {
        const match = line.match(/\*\*词性\*\*: (.+)/);
        if (match) {
          const partOfSpeech = match[1].trim();
          if (currentWord.meaning) {
            currentWord.meaning += ` (${partOfSpeech})`;
          }
        } else {
          // 尝试匹配带星号的格式
          const matchWithStar = line.match(/\* \*\*词性\*\*: (.+)/);
          if (matchWithStar) {
            const partOfSpeech = matchWithStar[1].trim();
            if (currentWord.meaning) {
              currentWord.meaning += ` (${partOfSpeech})`;
            }
          }
        }
      } else if (line.includes('**音标**:')) {
        const match = line.match(/\*\*音标\*\*: (.+)/);
        if (match) {
          currentWord.pronunciation = match[1].trim();
        } else {
          // 尝试匹配带星号的格式
          const matchWithStar = line.match(/\* \*\*音标\*\*: (.+)/);
          if (matchWithStar) {
            currentWord.pronunciation = matchWithStar[1].trim();
          }
        }
      } else if (line.includes('**在论文中的例句**:')) {
        const match = line.match(/\*\*在论文中的例句\*\*: (.+)/);
        if (match) {
          currentWord.sentence = match[1].trim();
        } else {
          // 尝试匹配带星号的格式
          const matchWithStar = line.match(/\* \*\*在论文中的例句\*\*: (.+)/);
          if (matchWithStar) {
            currentWord.sentence = matchWithStar[1].trim();
          }
        }
      } else if (line.includes('**例句中文翻译**:')) {
        const match = line.match(/\*\*例句中文翻译\*\*: (.+)/);
        if (match) {
          currentWord.translation = match[1].trim();
        } else {
          // 尝试匹配带星号的格式
          const matchWithStar = line.match(/\* \*\*例句中文翻译\*\*: (.+)/);
          if (matchWithStar) {
            currentWord.translation = matchWithStar[1].trim();
          }
        }
      }
    }
  }

  // 添加最后一个词汇
  if (currentWord && currentWord.word) {
    words.push(currentWord);
  }

  return words;
}

// 获取词汇难度
function getDifficulty(word) {
  const length = word.length;
  if (length <= 5) return 'easy';
  if (length <= 8) return 'medium';
  return 'hard';
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

// 生成论文信息
function generatePaperInfo() {
  return {
    id: 3, // 假设这是第三篇论文
    title: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
    authors: 'Rich Sutton, et al.',
    year: 2024,
    journal: 'CVPR',
    abstract: '本研究旨在通过实证分析，检验顶级计算机视觉会议CVPR在过去二十年的研究趋势是否与萨顿的"惨痛教训"原则相符。通过使用大型语言模型分析CVPR论文摘要和标题，评估了该领域对通用方法、计算利用和学习算法的接受程度。',
    url: 'https://arxiv.org/pdf/2410.09649',
    wordCount: 0, // 将在导入词汇后更新
    category: 'AI专业词汇',
    background: `人工智能领域的先驱理查·萨顿（Rich Sutton）提出了著名的"惨痛的教训"（The Bitter Lesson）原则，其核心论点是：那些利用大规模计算、采用通用学习方法的AI系统，在长远来看总是胜过那些依赖于人类专家知识和手工设计特征的系统。尽管这一原则在AI社区影响深远，但缺少系统的、大规模的量化证据来验证其在具体科研领域的体现。

计算机视觉（CV）领域的发展历程，从早期依赖SIFT、HOG等手工特征，到后来全面拥抱深度学习，似乎是"惨痛的教训"的一个典型例证。因此，本研究旨在通过实证分析，检验顶级计算机视觉会议CVPR在过去二十年的研究趋势是否与萨顿的"惨痛教训"原则相符。`,
    keyConcepts: `为量化分析研究趋势，论文采用了基于大型语言模型（LLM）的先进自然语言处理技术。研究者们构建了一个方法论，用于系统性地评估CVPR论文摘要和标题中所体现的研究方法演变。该方法的核心是定义了三个与"惨痛的教训"原则直接相关的维度：

1. **通用方法 vs. 人类知识 (General Methods vs. Human Knowledge)**：评估研究是更倾向于可扩展的通用学习算法，还是更依赖于人类设计的领域特定知识。

2. **利用计算 vs. 启发式搜索 (Search over Heuristics)**：评估研究是更强调通过搜索和优化技术来利用计算能力，还是依赖于人类设计的启发式策略。

3. **学习 vs. 硬编码知识 (Learned vs. Hard-coded Knowledge)**：分析研究中的知识是模型通过学习获得的，还是被直接硬编码到系统中。

通过对每年随机抽样的200篇CVPR论文进行标注和分析，论文旨在揭示这些维度在过去20年间的演变模式与趋势。`,
    highlights: `本研究最大的亮点在于首次对"惨痛的教训"这一AI领域的宏观指导原则进行了大规模、长周期的量化实证分析。它不仅验证了该原则在计算机视觉领域的有效性，还揭示了该领域研究范式的重大转变。

研究结果清晰地显示，CVPR的研究趋势显著地从依赖人类专家知识和手工特征，转向了拥抱通用学习算法和大规模计算。这项工作为理解AI研究的成功策略提供了宝贵的数据支持，并为未来计算机视觉乃至更广泛的人工智能领域的研究重点和方法论选择提供了重要参考。

其创新的分析方法也为使用LLM进行科学计量学和科研趋势分析开辟了新的道路。`
  };
}

// 主函数
function main() {
  console.log('开始导入Learning the Bitter Lesson论文内容...');
  
  // 解析词汇
  const filePath = path.join(__dirname, 'vocabulary', 'Learning the Bitter Lesson_ Empirical Evidence from 20 Years of CVPR Proceedings.md');
  const newWords = parseVocabularyFromFile(filePath);
  
  console.log(`解析到 ${newWords.length} 个词汇`);
  
  // 读取现有词汇表
  const app = getApp();
  const existingWords = app.globalData.words || [];
  
  // 检查重复词汇
  const { uniqueWords, duplicates } = checkDuplicateWords(newWords, existingWords);
  
  console.log(`发现 ${duplicates.length} 个重复词汇，将跳过导入`);
  console.log(`将导入 ${uniqueWords.length} 个新词汇`);
  
  if (duplicates.length > 0) {
    console.log('重复的词汇:', duplicates);
  }
  
  // 更新词汇ID
  const nextId = existingWords.length > 0 ? Math.max(...existingWords.map(w => w.id)) + 1 : 1;
  uniqueWords.forEach((word, index) => {
    word.id = nextId + index;
  });
  
  // 添加新词汇到词汇表
  if (uniqueWords.length > 0) {
    app.globalData.words = [...existingWords, ...uniqueWords];
    console.log('词汇导入完成');
  }
  
  // 生成论文信息
  const paperInfo = generatePaperInfo();
  paperInfo.wordCount = uniqueWords.length;
  
  console.log('论文信息:', paperInfo);
  
  console.log('导入完成！');
  console.log(`成功导入 ${uniqueWords.length} 个新词汇`);
  console.log(`论文信息已生成，包含 ${paperInfo.wordCount} 个词汇`);
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseVocabularyFromFile,
  generatePaperInfo,
  checkDuplicateWords
};
