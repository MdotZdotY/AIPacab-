// update_attention_vocabulary.js
// 更新Attention Is All You Need词汇，添加缺失词汇并修复不完整的数据结构

const fs = require('fs')
const path = require('path')

// 从compare_attention_vocabulary.js导入函数
const { parseAttentionVocabularyFile, extractExistingAttentionWords } = require('./compare_attention_vocabulary.js')

// 读取app.js文件
function readAppJs() {
  const appJsPath = path.join(__dirname, 'app.js')
  return fs.readFileSync(appJsPath, 'utf8')
}

// 写入app.js文件
function writeAppJs(content) {
  const appJsPath = path.join(__dirname, 'app.js')
  fs.writeFileSync(appJsPath, content, 'utf8')
}

// 获取现有词汇的最大ID
function getMaxWordId(existingWords) {
  if (!existingWords || existingWords.length === 0) return 0
  return Math.max(...existingWords.map(word => word.id || 0))
}

// 标准化词汇数据结构
function standardizeWord(word, nextId) {
  return {
    id: nextId,
    word: word.word,
    englishMeaning: word.englishMeaning || '',
    meaning: word.meaning,
    partOfSpeech: word.partOfSpeech,
    pronunciation: word.pronunciation,
    sentence: word.sentence,
    translation: word.translation || '', // 暂时为空，需要手动添加
    paperTitle: word.paperTitle,
    category: word.category,
    difficulty: getDifficulty(word.category),
    studyCount: 0,
    correctCount: 0,
    lastStudyTime: null,
    status: 'learning',
    weeklyStudyCount: 0
  }
}

// 根据分类确定难度
function getDifficulty(category) {
  const difficultyMap = {
    'GRE高频词汇': 'hard',
    'TOEFL高频词汇': 'medium',
    'IELTS高频词汇': 'medium',
    'AI领域内常用词和专有词': 'hard'
  }
  return difficultyMap[category] || 'medium'
}

// 更新现有词汇的缺失字段
function updateExistingWord(word, fileWord) {
  return {
    ...word,
    englishMeaning: fileWord.englishMeaning || word.englishMeaning,
    meaning: fileWord.meaning || word.meaning,
    partOfSpeech: fileWord.partOfSpeech || word.partOfSpeech,
    pronunciation: fileWord.pronunciation || word.pronunciation,
    sentence: fileWord.sentence || word.sentence,
    translation: word.translation || '', // 暂时保持为空
    category: fileWord.category || word.category
  }
}

// 更新app.js中的Attention Is All You Need词汇
function updateAttentionVocabulary() {
  console.log('=== 开始更新Attention Is All You Need词汇 ===')
  
  // 读取app.js文件
  let content = readAppJs()
  
  // 解析现有词汇数据
  const wordsStartMatch = content.match(/words:\s*\[/)
  if (!wordsStartMatch) {
    console.error('未找到词汇数组开始位置')
    return
  }
  
  const startIndex = wordsStartMatch.index + wordsStartMatch[0].length
  const remainingContent = content.substring(startIndex)
  
  // 找到词汇数组的结束位置
  let braceCount = 0
  let endIndex = -1
  
  for (let i = 0; i < remainingContent.length; i++) {
    const char = remainingContent[i]
    if (char === '[') braceCount++
    else if (char === ']') {
      braceCount--
      if (braceCount === 0) {
        endIndex = startIndex + i + 1
        break
      }
    }
  }
  
  if (endIndex === -1) {
    // 如果没找到，尝试查找最后一个 ] 的位置
    const lastBracketIndex = remainingContent.lastIndexOf(']')
    if (lastBracketIndex !== -1) {
      endIndex = startIndex + lastBracketIndex + 1
    } else {
      console.error('未找到词汇数组结束位置')
      return
    }
  }
  
  // 提取现有词汇数组
  const existingWordsArray = content.substring(startIndex, endIndex)
  
  // 解析现有词汇
  const existingWords = []
  const wordMatches = existingWordsArray.match(/\{[^}]+\}/g)
  
  if (wordMatches) {
    wordMatches.forEach(wordStr => {
      try {
        const cleanWordStr = wordStr.replace(/\n/g, ' ').replace(/\s+/g, ' ')
        const wordObj = eval('(' + cleanWordStr + ')')
        if (wordObj.word && wordObj.meaning) {
          existingWords.push(wordObj)
        }
      } catch (e) {
        console.log('解析现有词汇失败:', e.message)
      }
    })
  }
  
  console.log(`现有词汇数量: ${existingWords.length}`)
  
  // 解析文件中的词汇
  const fileWords = parseAttentionVocabularyFile()
  console.log(`文件中Attention Is All You Need词汇数量: ${fileWords.length}`)
  
  // 分离Attention Is All You Need词汇和其他词汇
  const attentionWords = existingWords.filter(word => word.paperTitle === 'Attention Is All You Need')
  const otherWords = existingWords.filter(word => word.paperTitle !== 'Attention Is All You Need')
  
  console.log(`现有Attention Is All You Need词汇数量: ${attentionWords.length}`)
  
  // 创建现有Attention词汇的集合
  const existingAttentionWordSet = new Set(attentionWords.map(w => w.word.toLowerCase()))
  
  // 找出缺失的词汇
  const missingWords = fileWords.filter(word => 
    !existingAttentionWordSet.has(word.word.toLowerCase())
  )
  
  console.log(`缺失的Attention Is All You Need词汇数量: ${missingWords.length}`)
  
  // 获取下一个可用ID
  const nextId = getMaxWordId(existingWords) + 1
  console.log(`下一个可用ID: ${nextId}`)
  
  // 标准化新词汇
  const standardizedNewWords = missingWords.map((word, index) => 
    standardizeWord(word, nextId + index)
  )
  
  // 更新现有Attention词汇的缺失字段
  const updatedAttentionWords = attentionWords.map(word => {
    const fileWord = fileWords.find(fw => fw.word.toLowerCase() === word.word.toLowerCase())
    if (fileWord) {
      return updateExistingWord(word, fileWord)
    }
    return word
  })
  
  // 合并所有词汇
  const allWords = [...otherWords, ...updatedAttentionWords, ...standardizedNewWords]
  console.log(`合并后总词汇数量: ${allWords.length}`)
  
  // 生成新的词汇数组字符串
  const newWordsArray = allWords.map((word, index) => {
    const wordStr = `      {
        id: ${word.id},
        word: '${word.word}',
        englishMeaning: '${word.englishMeaning}',
        meaning: '${word.meaning}',
        partOfSpeech: '${word.partOfSpeech}',
        pronunciation: '${word.pronunciation}',
        sentence: '${word.sentence}',
        translation: '${word.translation}',
        paperTitle: '${word.paperTitle}',
        category: '${word.category}',
        difficulty: '${word.difficulty}',
        studyCount: ${word.studyCount},
        correctCount: ${word.correctCount},
        lastStudyTime: ${word.lastStudyTime},
        status: '${word.status}',
        weeklyStudyCount: ${word.weeklyStudyCount}
      }`
    // 如果不是最后一个元素，添加逗号
    return index < allWords.length - 1 ? wordStr + ',' : wordStr
  }).join('\n')
  
  // 替换词汇数组
  const newContent = content.substring(0, startIndex) + '\n' + newWordsArray + '\n    ]'
  
  // 写入文件
  writeAppJs(newContent)
  
  console.log('=== app.js文件更新完成 ===')
  
  // 统计信息
  const categoryStats = {}
  const paperStats = {}
  
  allWords.forEach(word => {
    // 按分类统计
    if (!categoryStats[word.category]) {
      categoryStats[word.category] = 0
    }
    categoryStats[word.category]++
    
    // 按论文统计
    if (!paperStats[word.paperTitle]) {
      paperStats[word.paperTitle] = 0
    }
    paperStats[word.paperTitle]++
  })
  
  console.log('更新后的统计信息:')
  console.log(`总词汇数: ${allWords.length}`)
  console.log('按分类统计:')
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个`)
  })
  console.log('按论文统计:')
  Object.entries(paperStats).forEach(([paper, count]) => {
    console.log(`  ${paper}: ${count} 个`)
  })
  
  return {
    total: allWords.length,
    added: missingWords.length,
    updated: attentionWords.length,
    categoryStats,
    paperStats
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    const result = updateAttentionVocabulary()
    console.log('\n更新结果:')
    console.log(`- 总词汇数: ${result.total}`)
    console.log(`- 新增Attention词汇数: ${result.added}`)
    console.log(`- 更新现有Attention词汇数: ${result.updated}`)
  } catch (error) {
    console.error('更新失败:', error)
  }
}

module.exports = {
  updateAttentionVocabulary
}
