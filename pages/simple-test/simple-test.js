// pages/simple-test/simple-test.js
Page({
  data: {
    message: 'Hello World!',
    wordsCount: 0
  },

  onLoad() {
    console.log('简单测试页面加载')
    const app = getApp()
    this.setData({
      wordsCount: app.globalData.words ? app.globalData.words.length : 0
    })
  },

  // 测试修复数据
  testFix() {
    const app = getApp()
    
    // 清除本地存储
    wx.removeStorageSync('words')
    wx.removeStorageSync('vocab_reset_2025_08_09')
    
    // 重新加载数据
    app.loadVocabularyData()
    
    this.setData({
      wordsCount: app.globalData.words ? app.globalData.words.length : 0
    })
    
    wx.showToast({
      title: '修复完成',
      icon: 'success'
    })
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
