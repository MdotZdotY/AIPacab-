// clear_storage.js
// 清除本地存储中的词汇数据，让小程序重新使用内置词汇数据

console.log('开始清除本地存储中的词汇数据...')

try {
  // 清除词汇数据
  wx.removeStorageSync('words')
  console.log('已清除本地存储中的词汇数据')
  
  // 清除其他相关数据
  wx.removeStorageSync('logs')
  console.log('已清除日志数据')
  
  console.log('清除完成！小程序将重新使用内置词汇数据')
} catch (error) {
  console.error('清除本地存储失败:', error)
}
