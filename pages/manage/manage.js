// pages/manage/manage.js
const app = getApp()

Page({
  data: {
    allWords: [],
    filteredWords: [],
    searchKeyword: '',
  },

  onLoad() {
    this.loadWords()
  },

  onShow() {
    // 延迟加载词汇数据，确保app.js的数据加载完成
    setTimeout(() => {
      this.loadWords()
    }, 500)
    
    if (this.getTabBar && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },


  // 加载词汇列表
  loadWords() {
    // 强制使用app.globalData中的词汇数据，不从本地存储加载
    console.log('管理页面使用app.globalData中的词汇数据')
    
    let words = app.globalData.words || []
    
    // 确保词汇数据是数组
    if (!Array.isArray(words)) {
      console.warn('词汇数据格式错误，重置为空数组')
      words = []
      app.globalData.words = words
    }
    
    // 如果词汇数据为空，尝试重新加载
    if (words.length === 0) {
      console.warn('管理页面词汇数据为空，尝试重新加载...')
      // 延迟重新加载，给app.js更多时间完成数据加载
      setTimeout(() => {
        this.loadWords()
      }, 1000)
      return
    }
    
    // 检查并修复重复ID
    this.fixDuplicateIds()
    
    // 确保每个词汇都有有效的ID
    words.forEach((word, index) => {
      if (!word.id || typeof word.id !== 'number') {
        word.id = index + 1
      }
    })
    
    this.setData({
      allWords: words,
      filteredWords: words
    })
  },

  // 修复重复ID
  fixDuplicateIds() {
    const words = app.globalData.words
    if (!words || words.length === 0) return
    
    const usedIds = new Set()
    const duplicateIds = []
    
    // 检查重复ID
    words.forEach(word => {
      if (usedIds.has(word.id)) {
        duplicateIds.push(word.id)
      } else {
        usedIds.add(word.id)
      }
    })
    
    // 如果有重复ID，重新分配
    if (duplicateIds.length > 0) {
      console.log('发现重复ID，正在修复...', duplicateIds)
      
      // 重新分配所有ID，确保唯一性
      let newId = 1
      const idMap = new Map() // 用于映射旧ID到新ID
      
      words.forEach(word => {
        const oldId = word.id
        word.id = newId
        idMap.set(oldId, newId)
        newId++
      })
      
      // 更新全局数据
      app.globalData.words = words
      
      // 保存到本地存储
      try {
        wx.setStorageSync('words', words)
        console.log('ID修复完成，已保存到本地存储')
      } catch (e) {
        console.error('保存词汇数据失败:', e)
      }
    }
  },

  // 搜索词汇
  onSearch(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterWords()
  },


  // 筛选词汇
  filterWords() {
    let filtered = app.globalData.words || []

    // 确保数据是数组
    if (!Array.isArray(filtered)) {
      console.warn('筛选时发现数据格式错误')
      filtered = []
    }

    // 按关键词筛选
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(word => 
        word && word.word && word.word.toLowerCase().includes(keyword) ||
        word && word.meaning && word.meaning.includes(keyword) ||
        word && word.sentence && word.sentence.toLowerCase().includes(keyword)
      )
      
      // 智能排序：按匹配优先级排序
      filtered.sort((a, b) => {
        const aScore = this.calculateSearchScore(a, keyword)
        const bScore = this.calculateSearchScore(b, keyword)
        return bScore - aScore // 降序排列，分数高的在前
      })
      
      // 去重：按词汇名称去重，保留第一个出现的
      const uniqueFiltered = []
      const seenWords = new Set()
      
      filtered.forEach(word => {
        if (word && word.word) {
          const wordKey = word.word.toLowerCase()
          if (!seenWords.has(wordKey)) {
            seenWords.add(wordKey)
            uniqueFiltered.push(word)
          }
        }
      })
      
      filtered = uniqueFiltered
    }

    this.setData({
      filteredWords: filtered
    })
  },

  // 计算搜索匹配分数
  calculateSearchScore(word, keyword) {
    let score = 0
    const wordLower = word.word ? word.word.toLowerCase() : ''
    const meaning = word.meaning || ''
    const sentence = word.sentence ? word.sentence.toLowerCase() : ''
    
    // 单词开头匹配：最高优先级 (100分)
    if (wordLower.startsWith(keyword)) {
      score += 100
    }
    // 单词包含匹配：高优先级 (80分)
    else if (wordLower.includes(keyword)) {
      score += 80
    }
    
    // 中文含义匹配：中等优先级 (50分)
    if (meaning.includes(keyword)) {
      score += 50
    }
    
    // 例句匹配：较低优先级 (30分)
    if (sentence.includes(keyword)) {
      score += 30
    }
    
    // 单词长度奖励：短单词优先 (额外奖励)
    if (wordLower.startsWith(keyword)) {
      score += (10 - wordLower.length) * 2 // 短单词额外加分
    }
    
    return score
  },









  // 查看词汇详情
  viewWordDetail(e) {
    const wordId = e.currentTarget.dataset.id
    const word = app.globalData.words.find(w => w.id === wordId)
    
    if (!word) {
      wx.showToast({
        title: '词汇不存在',
        icon: 'error'
      })
      return
    }
    
    // 获取状态的中文描述
    const statusText = {
      'learning': '学习词库',
      'review': '复习词库',
      'mastered': '熟知词库'
    }[word.status] || '未知状态'
    
    // 只显示含义、例句、分类和状态
    let contentLines = [
      `含义：${word.meaning}`,
      `例句：${word.sentence}`,
      `分类：${word.category}`,
      `状态：${statusText}`
    ]
    
    let content = contentLines.join('\n\n')
    
    wx.showModal({
      title: word.word,
      content: content,
      showCancel: false
    })
  },



  // 分享给好友
  onShareAppMessage() {
    return {
      title: 'AI Pacab+ - AI 论文阅读，词汇无障碍',
      path: '/pages/manage/manage',
      imageUrl: '/images/ai_vocab_app_icon.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'AI Pacab+ - AI 论文阅读，词汇无障碍',
      imageUrl: '/images/小程序二维码.jpg'
    }
  }
})