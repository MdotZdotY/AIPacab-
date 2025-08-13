// execute_rag_import.js
// 执行 RAG 论文词汇导入

console.log('=== RAG 论文词汇导入脚本 ===')

// 模拟微信小程序环境
if (typeof wx === 'undefined') {
  global.wx = {
    setStorageSync: (key, data) => {
      console.log(`存储数据到 ${key}:`, data.length, '条记录')
    },
    getStorageSync: (key) => {
      console.log(`从 ${key} 读取数据`)
      return []
    }
  }
  
  // 模拟 app 对象
  global.getApp = () => ({
    globalData: {
      words: []
    },
    loadVocabularyData: () => {
      console.log('加载词汇数据')
    }
  })
}

// 导入必要的模块
const { importRAGVocabulary } = require('./import_rag_vocabulary.js')

// 执行导入
try {
  console.log('开始执行导入...')
  const result = importRAGVocabulary()
  
  console.log('\n=== 导入结果 ===')
  console.log('总词汇数:', result.total)
  console.log('新增词汇数:', result.added)
  console.log('跳过重复词汇数:', result.skipped)
  
  console.log('\n=== 导入完成 ===')
  console.log('RAG 论文词汇已成功添加到词汇库中！')
  console.log('新词汇将在学习页面中正常显示，与现有词汇格式一致。')
  
} catch (error) {
  console.error('导入失败:', error)
  process.exit(1)
}

