// test_imagenet_vocabulary_stats.js
// 测试ImageNet词汇导入后的统计功能

const VocabularyManager = require('./utils/vocabularyManager.js')

// 模拟微信小程序环境
global.wx = {
  setStorageSync: (key, data) => {
    console.log(`存储数据到 ${key}:`, data.length, '个词汇')
  },
  getStorageSync: (key) => {
    return []
  }
}

// 模拟应用实例 - 从app.js中读取词汇数据
function loadAppVocabulary() {
  const fs = require('fs')
  const path = require('path')
  
  try {
    const appJsPath = path.join(__dirname, 'app.js')
    const content = fs.readFileSync(appJsPath, 'utf8')
    
    // 提取词汇数组
    const wordsStartMatch = content.match(/words:\s*\[/)
    if (!wordsStartMatch) {
      console.error('未找到词汇数组开始位置')
      return []
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
      // 如果没找到，可能是文件末尾
      endIndex = content.length
    }
    
    // 提取词汇数组
    const wordsArray = content.substring(startIndex, endIndex)
    
    // 解析词汇
    const words = []
    const wordMatches = wordsArray.match(/\{[^}]+\}/g)
    
    if (wordMatches) {
      wordMatches.forEach(wordStr => {
        try {
          const cleanWordStr = wordStr.replace(/\n/g, ' ').replace(/\s+/g, ' ')
          const wordObj = eval('(' + cleanWordStr + ')')
          if (wordObj.word && wordObj.meaning) {
            words.push(wordObj)
          }
        } catch (e) {
          console.log('解析词汇失败:', e.message)
        }
      })
    }
    
    return words
  } catch (error) {
    console.error('读取app.js失败:', error)
    return []
  }
}

// 模拟应用实例
global.getApp = () => ({
  globalData: {
    words: loadAppVocabulary()
  }
})

function testImageNetVocabularyStats() {
  console.log('=== 测试ImageNet词汇导入后的统计功能 ===')
  
  const vocabularyManager = new VocabularyManager()
  
  // 获取当前词汇数据
  const currentWords = getApp().globalData.words
  console.log(`当前词汇总数: ${currentWords.length}`)
  
  // 获取统计信息
  const stats = vocabularyManager.getVocabularyStats()
  
  console.log('\n=== 统计信息 ===')
  console.log(`总词汇数: ${stats.total}`)
  
  console.log('\n按分类统计:')
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个`)
  })
  
  console.log('\n按难度统计:')
  Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count} 个`)
  })
  
  console.log('\n按论文统计:')
  Object.entries(stats.byPaper).forEach(([paper, count]) => {
    console.log(`  ${paper}: ${count} 个`)
  })
  
  // 验证ImageNet词汇
  const imageNetWords = currentWords.filter(word => 
    word.paperTitle === 'ImageNet Classification with Deep Convolutional Neural Networks'
  )
  
  console.log('\n=== ImageNet词汇验证 ===')
  console.log(`ImageNet词汇数量: ${imageNetWords.length}`)
  
  // 按分类统计ImageNet词汇
  const imageNetCategoryStats = {}
  imageNetWords.forEach(word => {
    if (!imageNetCategoryStats[word.category]) {
      imageNetCategoryStats[word.category] = 0
    }
    imageNetCategoryStats[word.category]++
  })
  
  console.log('ImageNet词汇按分类统计:')
  Object.entries(imageNetCategoryStats).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个`)
  })
  
  // 验证词汇数据结构
  console.log('\n=== 数据结构验证 ===')
  const sampleWord = imageNetWords[0]
  if (sampleWord) {
    console.log('示例词汇数据结构:')
    console.log(`  ID: ${sampleWord.id}`)
    console.log(`  单词: ${sampleWord.word}`)
    console.log(`  英文释义: ${sampleWord.englishMeaning}`)
    console.log(`  中文释义: ${sampleWord.meaning}`)
    console.log(`  词性: ${sampleWord.partOfSpeech}`)
    console.log(`  发音: ${sampleWord.pronunciation}`)
    console.log(`  例句: ${sampleWord.sentence}`)
    console.log(`  翻译: ${sampleWord.translation}`)
    console.log(`  论文: ${sampleWord.paperTitle}`)
    console.log(`  分类: ${sampleWord.category}`)
    console.log(`  难度: ${sampleWord.difficulty}`)
    console.log(`  状态: ${sampleWord.status}`)
  }
  
  // 验证所有必需字段
  const requiredFields = ['id', 'word', 'meaning', 'pronunciation', 'sentence', 'translation', 'paperTitle', 'category', 'status']
  const missingFields = []
  
  currentWords.forEach((word, index) => {
    requiredFields.forEach(field => {
      if (!word[field]) {
        missingFields.push(`词汇 ${index + 1} (${word.word || 'unknown'}): 缺少 ${field}`)
      }
    })
  })
  
  if (missingFields.length > 0) {
    console.log('\n⚠️  发现缺失字段:')
    missingFields.forEach(field => console.log(`  ${field}`))
  } else {
    console.log('\n✅ 所有词汇数据结构完整')
  }
  
  // 验证统计一致性
  const isConsistent = stats.total === currentWords.length
  console.log(`\n统计一致性验证: ${isConsistent ? '✅ 通过' : '❌ 失败'}`)
  
  return {
    total: stats.total,
    imageNetCount: imageNetWords.length,
    isConsistent,
    missingFields: missingFields.length
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    const result = testImageNetVocabularyStats()
    console.log('\n=== 测试结果 ===')
    console.log(`总词汇数: ${result.total}`)
    console.log(`ImageNet词汇数: ${result.imageNetCount}`)
    console.log(`统计一致性: ${result.isConsistent ? '通过' : '失败'}`)
    console.log(`缺失字段数: ${result.missingFields}`)
  } catch (error) {
    console.error('测试失败:', error)
  }
}

module.exports = {
  testImageNetVocabularyStats
}
