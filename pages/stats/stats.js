// pages/stats/stats.js
const app = getApp()

Page({
  data: {
    stats: {
      totalWords: 0,
      studiedWords: 0,
      correctRate: 0,
      studyDays: 0,
      masteredWords: 0,
      totalStudyHours: 0,
      weeklyAvgHours: 0,
      papersRead: 0,
      totalPapers: 0
    },
    categoryStats: [],
    categorySummary: {
      gre: { mastered: 0, total: 0 },
      toefl: { mastered: 0, total: 0 },
      ielts: { mastered: 0, total: 0 },
      ai: { mastered: 0, total: 0 }
    },
    trendData: [],
    uChartsReady: false,
    selectedPeriod: 'month', // month, year, all
    periods: [
      { value: 'month', text: '本月' },
      { value: 'year', text: '本年' },
      { value: 'all', text: '全部' }
    ]
  },

  onLoad() {
    this.loadStats()
    // 尝试加载 uCharts（未安装不阻塞）
    try {
      this.UCharts = require('../../libs/ucharts/ucharts.min.js')
      this.setData({ uChartsReady: true })
    } catch (e) { console.warn('uCharts 未安装，先用简版渲染', e) }
  },

  onShow() {
    this.loadStats()
    // 同步自定义 tabBar 的选中态
    if (this.getTabBar && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })
    }
  },

  // 加载统计数据
  loadStats() {
    // 确保从本地存储重新加载最新数据
    try {
      const savedWords = wx.getStorageSync('words')
      if (Array.isArray(savedWords) && savedWords.length > 0) {
        app.globalData.words = savedWords
      }
    } catch (error) {
      console.error('加载本地存储数据失败:', error)
    }
    
    const words = app.globalData.words || []
    
    // 按状态统计词汇
    const learningWords = words.filter(word => word.status === 'learning')
    const reviewWords = words.filter(word => word.status === 'review')
    const masteredWords = words.filter(word => word.status === 'mastered')
    
    const studiedWords = words.filter(word => word.studyCount > 0)
    const totalCorrect = studiedWords.reduce((sum, word) => sum + (word.correctCount || 0), 0)
    const totalStudy = studiedWords.reduce((sum, word) => sum + (word.studyCount || 0), 0)
    
    // 学习时长统计（本地累计）
    const localStats = (new (require('../../utils/statsManager.js'))()).getStats()
    const totalStudyHours = Math.round(((localStats.totalStudyMs || 0) / (1000 * 60 * 60)) * 10) / 10
    const weeklyAvgHours = this.computeWeeklyAverageHours(localStats.perDayMs || {})

    // 论文统计
    const papers = require('../../utils/papersData.js')
    const localStats2 = (new (require('../../utils/statsManager.js'))()).getStats()
    const papersRead = Array.isArray(localStats2.readPaperIds) ? localStats2.readPaperIds.length : 0
    const totalPapers = papers.length

    // 分类词汇统计：规范类别并统计
    const normalizeCategory = (name) => {
      if (!name) return 'AI专业词汇'
      const map = {
        'GRE高频词汇': 'GRE高频词',
        'TOEFL高频词汇': 'TOEFL高频词',
        'IELTS高频词汇': 'IELTS高频词',
        'AI领域常用及专有词汇': 'AI专业词汇',
        'AI领域内常用词和专有词': 'AI专业词汇'
      }
      return map[name] || name
    }
    const summaryInit = { mastered: 0, total: 0 }
    const summary = {
      gre: { ...summaryInit },
      toefl: { ...summaryInit },
      ielts: { ...summaryInit },
      ai: { ...summaryInit }
    }
    ;(words || []).forEach(w => {
      const cat = normalizeCategory(w.category)
      const key = cat === 'GRE高频词' ? 'gre' : cat === 'TOEFL高频词' ? 'toefl' : cat === 'IELTS高频词' ? 'ielts' : 'ai'
      summary[key].total += 1
      if (w.status === 'mastered') summary[key].mastered += 1
    })

    this.setData({
      stats: {
        totalWords: words.length,
        learningWords: learningWords.length,
        reviewWords: reviewWords.length,
        masteredWords: masteredWords.length,
        studiedWords: studiedWords.length,
        correctRate: totalStudy > 0 ? Math.round((totalCorrect / totalStudy) * 100) : 0,
        studyDays: this.calculateStudyDays(),
        totalStudyHours,
        weeklyAvgHours,
        papersRead,
        totalPapers
      },
      categorySummary: summary
    })

    // 学习趋势区域已移除
  },

  // 计算近7天平均学习时长（小时）
  computeWeeklyAverageHours(perDayMs) {
    const now = new Date()
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      days.push(`${y}-${m}-${day}`)
    }
    const sumMs = days.reduce((sum, key) => sum + Number(perDayMs[key] || 0), 0)
    const avgHour = sumMs / 7 / (1000 * 60 * 60)
    return Math.round(avgHour * 10) / 10
  },

  // 分类统计模块已移除

  // 趋势图模块已移除

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

  // 趋势图渲染已移除

  // 切换时间周期
  switchPeriod(e) {
    const period = e.currentTarget.dataset.period
    this.setData({ selectedPeriod: period })
    this.loadTrendData()
  },

  // 查看详细统计
  viewDetail(e) {
    const type = e.currentTarget.dataset.type
    let content = ''
    
    switch (type) {
      case 'total':
        content = `总词汇量：${this.data.stats.totalWords}个\n包括GRE、TOEFL、AI专业词汇等分类`
        break
      case 'learning':
        content = `学习词库：${this.data.stats.learningWords}个\n新词汇，等待学习`
        break
      case 'review':
        content = `复习词库：${this.data.stats.reviewWords}个\n已学习5次，进入复习阶段`
        break
      case 'mastered':
        content = `熟知词库：${this.data.stats.masteredWords}个\n测试通过，已熟练掌握`
        break
      case 'studied':
        content = `已学习：${this.data.stats.studiedWords}个\n学习进度：${Math.round((this.data.stats.studiedWords / this.data.stats.totalWords) * 100)}%`
        break
      case 'correct':
        content = `正确率：${this.data.stats.correctRate}%\n基于所有学习记录计算`
        break
      case 'days':
        content = `学习天数：${this.data.stats.studyDays}天\n持续学习，效果更佳`
        break
    }

    wx.showModal({
      title: '详细统计',
      content,
      showCancel: false
    })
  },

  // 分享统计
  onShareAppMessage() {
    const hours = (this.data.stats.totalStudyHours || 0)
    const mastered = (this.data.stats.masteredWords || 0)
    const papersRead = (this.data.stats.papersRead || 0)
    const hoursText = Number.isFinite(hours) ? (Math.round(hours * 10) / 10) : 0
    return {
              title: `我在AI Pacab+中累计学习了${hoursText}小时，掌握了${mastered}个词汇，阅读了${papersRead}篇行业论文。`,
      path: '/pages/index/index',
      success: () => {
        try {
          wx.switchTab({ url: '/pages/stats/stats' })
        } catch (e) {}
      }
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})