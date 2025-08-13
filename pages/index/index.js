// pages/index/index.js
const app = getApp()
const StatsManager = require('../../utils/statsManager.js')
const statsManager = new StatsManager()
const papers = require('../../utils/papersData.js')

Page({
  data: {
    stats: {
      totalWords: 0,
      papersCount: 0,
      correctRate: 0,
      studyDays: 0
    },
    categories: [],
    recentWords: [],
    showReminder: false,
    showDebugButton: false
  },

  onLoad() {
    console.log('首页加载，当前词汇数量:', app.globalData.words ? app.globalData.words.length : 0)
    this.loadStats()
    this.loadCategories()
    this.loadRecentWords()
    
    // 添加调试信息
    console.log('首页数据加载完成')
    console.log('stats:', this.data.stats)
    console.log('categories:', this.data.categories)
    
    // 如果词汇数量为0，强制显示修复按钮
    if (!app.globalData.words || app.globalData.words.length === 0) {
      this.setData({
        showDebugButton: true
      })
    }
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadStats()
    this.loadRecentWords()
  },

  // 加载统计数据
  loadStats() {
    console.log('开始加载统计数据...')
    const words = app.globalData.words
    console.log('词汇数据:', words)
    
    const localStats = statsManager.getStats()
    
    const statsData = {
      totalWords: words.length,
      papersCount: papers.length,
      correctRate: 0, // 保留字段，但不再使用
      studyDays: localStats.studyDays // 直接使用持久化的学习天数
    }
    
    console.log('统计数据:', statsData)
    
    this.setData({
      stats: statsData
    })
    
    console.log('统计数据设置完成')
  },

  // 加载分类数据
  loadCategories() {
    console.log('开始加载分类数据...')
    // 统一分类别名，避免历史数据导致的统计不一致
    const aliasMap = {
      'GRE高频词汇': 'GRE高频词',
      'TOEFL高频词汇': 'TOEFL高频词',
      'AI领域常用及专有词汇': 'AI专业词汇',
      'AI领域内常用词和专有词': 'AI专业词汇',
      'IELTS高频词汇': 'IELTS高频词'
    }
    const words = (app.globalData.words || []).map(w => ({
      ...w,
      category: aliasMap[w.category] || w.category
    }))
    const categoryMap = {}
    
    words.forEach(word => {
      if (!categoryMap[word.category]) {
        categoryMap[word.category] = 0
      }
      categoryMap[word.category]++
    })

    // 确保默认展示（并调整显示顺序：GRE, TOEFL, IELTS, AI专业）
    const defaults = ['GRE高频词', 'TOEFL高频词', 'IELTS高频词', 'AI专业词汇']
    defaults.forEach(name => {
      if (categoryMap[name] === undefined) categoryMap[name] = 0
    })

    // 固定顺序输出
    const categories = defaults
      .filter(name => categoryMap[name] !== undefined)
      .map(name => ({ name, count: categoryMap[name] }))

    console.log('分类数据:', categories)
    this.setData({ categories })
    console.log('分类数据设置完成')
  },

  // 计算学习天数
  calculateStudyDays() {
    const studyDates = new Set()
    app.globalData.words.forEach(word => {
      if (word.lastStudyTime) {
        const date = new Date(word.lastStudyTime).toDateString()
        studyDates.add(date)
      }
    })
    return studyDates.size
  },

  // 加载最近学习的词汇
  loadRecentWords() {
    const words = app.globalData.words
    const recentWords = words
      .filter(word => word.lastStudyTime)
      .sort((a, b) => new Date(b.lastStudyTime) - new Date(a.lastStudyTime))
      .slice(0, 5)
      .map(word => ({
        ...word,
        lastStudyTime: this.formatTime(word.lastStudyTime)
      }))
    
    this.setData({
      recentWords
    })
  },

  // 格式化时间
  formatTime(timeString) {
    if (!timeString) return ''
    const date = new Date(timeString)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  },

  // 开始学习
  startStudy() {
    wx.switchTab({
      url: '/pages/study/study'
    })
  },

  // 去论文页面
  goToPapers() {
    wx.switchTab({
      url: '/pages/papers/papers'
    })
  },

  // 查看统计
  goToStats() {
    wx.switchTab({
      url: '/pages/stats/stats'
    })
  },

  // 跳转到调试页面
  goToDebug() {
    wx.navigateTo({
      url: '/pages/debug/debug'
    })
  },

  // 跳转到简单测试页面
  goToSimpleTest() {
    wx.navigateTo({
      url: '/pages/simple-test/simple-test'
    })
  },

  // 刷新页面
  refreshPage() {
    console.log('刷新页面...')
    this.loadStats()
    this.loadCategories()
    this.loadRecentWords()
    
    wx.showToast({
      title: '页面已刷新',
      icon: 'success'
    })
  },

  // 快速修复数据问题
  quickFix() {
    console.log('开始快速修复...')
    wx.showModal({
      title: '快速修复',
      content: '这将恢复默认词汇数据，确定继续吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            console.log('用户确认修复')
            
            // 清除重置标记
            wx.removeStorageSync('vocab_reset_2025_08_09')
            console.log('已清除重置标记')
            
            // 恢复默认词汇数据
            const app = getApp()
            
            // 清除本地存储
            wx.removeStorageSync('words')
            console.log('已清除本地存储')
            
            // 重新加载数据（这会自动使用默认数据）
            app.loadVocabularyData()
            console.log('重新加载后的词汇数量:', app.globalData.words.length)
            console.log('已重新加载数据')
            
            // 刷新当前页面
            this.loadStats()
            this.loadCategories()
            this.loadRecentWords()
            
            // 隐藏调试按钮
            this.setData({
              showDebugButton: false
            })
            
            console.log('修复完成')
            wx.showToast({
              title: '修复成功',
              icon: 'success'
            })
            
            // 延迟刷新页面
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }, 1000)
          } catch (error) {
            console.error('修复失败:', error)
            wx.showToast({
              title: '修复失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我在使用AI Pacab+学习词汇，一起来学习吧！',
      path: '/pages/index/index'
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})