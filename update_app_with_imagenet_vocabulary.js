// update_app_with_imagenet_vocabulary.js
// 将ImageNet论文的词汇更新到app.js文件中

const fs = require('fs')
const path = require('path')

// 从import_imagenet_vocabulary.js导入解析函数
const { parseImageNetVocabulary } = require('./import_imagenet_vocabulary.js')

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
    partOfSpeech: extractPartOfSpeech(word.meaning),
    pronunciation: word.pronunciation,
    sentence: word.sentence,
    translation: word.translation,
    paperTitle: word.paperTitle,
    category: word.category,
    difficulty: word.difficulty,
    studyCount: 0,
    correctCount: 0,
    lastStudyTime: null,
    status: 'learning',
    weeklyStudyCount: 0
  }
}

// 从meaning中提取词性
function extractPartOfSpeech(meaning) {
  const match = meaning.match(/\(([^)]+)\)$/)
  return match ? match[1] : ''
}

// 从meaning中提取中文释义
function extractChineseMeaning(meaning) {
  return meaning.replace(/\s*\([^)]+\)$/, '').trim()
}

// 更新app.js中的词汇数据
function updateAppJsWithImageNetVocabulary() {
  console.log('=== 开始更新app.js文件，添加ImageNet论文词汇 ===')
  
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
    console.error('未找到词汇数组结束位置')
    return
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
  
  // 获取下一个可用ID
  const nextId = getMaxWordId(existingWords) + 1
  console.log(`下一个可用ID: ${nextId}`)
  
  // 解析ImageNet词汇
  const imageNetWords = parseImageNetVocabulary()
  console.log(`ImageNet词汇数量: ${imageNetWords.length}`)
  
  // 检查重复词汇
  const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()))
  const uniqueImageNetWords = imageNetWords.filter(word => 
    !existingWordSet.has(word.word.toLowerCase())
  )
  
  console.log(`去重后ImageNet词汇数量: ${uniqueImageNetWords.length}`)
  
  // 标准化新词汇
  const standardizedNewWords = uniqueImageNetWords.map((word, index) => 
    standardizeWord(word, nextId + index)
  )
  
  // 合并词汇
  const allWords = [...existingWords, ...standardizedNewWords]
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
    added: uniqueImageNetWords.length,
    skipped: imageNetWords.length - uniqueImageNetWords.length,
    categoryStats,
    paperStats
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    const result = updateAppJsWithImageNetVocabulary()
    console.log('\n更新结果:')
    console.log(`- 总词汇数: ${result.total}`)
    console.log(`- 新增词汇数: ${result.added}`)
    console.log(`- 跳过重复数: ${result.skipped}`)
  } catch (error) {
    console.error('更新失败:', error)
  }
}

module.exports = {
  updateAppJsWithImageNetVocabulary
}
