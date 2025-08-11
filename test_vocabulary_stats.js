// test_vocabulary_stats.js
// 测试新单词导入后统计更新功能

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

// 模拟应用实例
global.getApp = () => ({
  globalData: {
    words: []
  }
})

function testVocabularyStats() {
  console.log('=== 测试词汇统计更新功能 ===')
  
  const manager = new VocabularyManager()
  
  // 测试数据
  const testWords = [
    {
      word: 'TestWord1',
      meaning: '测试词汇1',
      category: 'AI专业词汇',
      paperTitle: 'Test Paper',
      difficulty: 'medium'
    },
    {
      word: 'TestWord2', 
      meaning: '测试词汇2',
      category: 'GRE高频词',
      paperTitle: 'Test Paper',
      difficulty: 'hard'
    }
  ]
  
  console.log('1. 初始词汇数量:', getApp().globalData.words.length)
  
  // 添加新词汇
  const result = manager.addNewWords(testWords)
  
  console.log('2. 添加新词汇结果:')
  console.log('   - 总词汇数:', result.total)
  console.log('   - 新增词汇数:', result.added)
  console.log('   - 跳过重复数:', result.skipped)
  
  // 获取统计信息
  const stats = manager.getVocabularyStats()
  
  console.log('3. 统计信息:')
  console.log('   - 总词汇数:', stats.total)
  console.log('   - 按分类统计:', stats.byCategory)
  console.log('   - 按难度统计:', stats.byDifficulty)
  console.log('   - 按论文统计:', stats.byPaper)
  
  // 验证统计是否正确
  const isCorrect = stats.total === result.total
  console.log('4. 统计验证:', isCorrect ? '✅ 通过' : '❌ 失败')
  
  return isCorrect
}

// 运行测试
if (require.main === module) {
  testVocabularyStats()
}

module.exports = { testVocabularyStats }
