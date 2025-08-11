// pages/debug/debug.js
Page({
  data: {
    debugInfo: {},
    loading: false
  },

  onLoad() {
    this.checkData()
  },

  // 检查数据状态
  checkData() {
    const app = getApp()
    const debugInfo = {
      globalDataWords: app.globalData.words ? app.globalData.words.length : 0,
      localStorageWords: wx.getStorageSync('words') ? wx.getStorageSync('words').length : 0,
      resetFlag: wx.getStorageSync('vocab_reset_2025_08_09'),
      appLaunchTime: new Date().toLocaleString()
    }
    
    this.setData({ debugInfo })
    console.log('调试信息:', debugInfo)
  },

  // 恢复默认词汇数据
  restoreDefaultData() {
    this.setData({ loading: true })
    
    try {
      const app = getApp()
      
      // 清除重置标记
      wx.removeStorageSync('vocab_reset_2025_08_09')
      
      // 恢复默认词汇数据
      const defaultWords = app.globalData.words
      wx.setStorageSync('words', defaultWords)
      
      // 重新加载数据
      app.loadVocabularyData()
      
      wx.showToast({
        title: '数据恢复成功',
        icon: 'success'
      })
      
      this.checkData()
    } catch (error) {
      console.error('恢复数据失败:', error)
      wx.showToast({
        title: '恢复失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 清空所有数据
  clearAllData() {
    wx.showModal({
      title: '确认清空',
      content: '这将清空所有本地数据，确定继续吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            wx.showToast({
              title: '数据已清空',
              icon: 'success'
            })
            this.checkData()
          } catch (error) {
            console.error('清空数据失败:', error)
          }
        }
      }
    })
  },

  // 跳转到首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 测试云函数
  async testCloudFunction() {
    this.setData({ loading: true })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'vocabularyManager',
        data: {
          action: 'get',
          data: { page: 1, pageSize: 5 }
        }
      })
      
      console.log('云函数测试结果:', result)
      wx.showToast({
        title: '云函数测试成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('云函数测试失败:', error)
      wx.showToast({
        title: '云函数测试失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})
