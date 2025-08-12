// pages/manage/manage.js
const app = getApp()

Page({
  data: {
    allWords: [],
    filteredWords: [],
    searchKeyword: '',
    activeCategory: '',
    // 用于选择器和新增词汇的真实分类值
    categories: ['GRE高频词', 'TOEFL高频词', 'AI专业词汇', 'IELTS高频词'],
    // 用于筛选卡片的显示与实际值映射（移除按钮文案中的"高频词"）
    categoryFilters: [
      { display: 'GRE', value: 'GRE高频词' },
      { display: 'TOEFL', value: 'TOEFL高频词' },
      { display: 'IELTS', value: 'IELTS高频词' },
      { display: 'AI专业', value: 'AI专业词汇' }
    ],
    totalCount: 0,

  },

  onLoad() {
    this.loadWords()
  },

  onShow() {
    this.loadWords()
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
    
    // 统一一次分类别名，避免与首页统计不一致
    const aliasMap = {
      'GRE高频词汇': 'GRE高频词',
      'TOEFL高频词汇': 'TOEFL高频词',
      'AI领域常用及专有词汇': 'AI专业词汇',
      'AI领域内常用词和专有词': 'AI专业词汇',
      'IELTS高频词汇': 'IELTS高频词'
    }
    words.forEach(w => {
      if (aliasMap[w.category]) w.category = aliasMap[w.category]
    })
    
    // 确保词汇数据是数组
    if (!Array.isArray(words)) {
      console.warn('词汇数据格式错误，重置为空数组')
      words = []
      app.globalData.words = words
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
      filteredWords: words,
      totalCount: words.length
    })
    this.filterWords()
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

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      activeCategory: this.data.activeCategory === category ? '' : category
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
    }

    // 按分类筛选
    if (this.data.activeCategory) {
      filtered = filtered.filter(word => word && word.category === this.data.activeCategory)
    }

    // 确保筛选后的数据没有重复ID
    const uniqueFiltered = []
    const seenIds = new Set()
    
    filtered.forEach(word => {
      if (word && word.id && !seenIds.has(word.id)) {
        seenIds.add(word.id)
        uniqueFiltered.push(word)
      }
    })

    this.setData({
      filteredWords: uniqueFiltered
    })
  },







  // 查看词汇详情
  viewWordDetail(e) {
    const wordId = e.currentTarget.dataset.id
    const word = app.globalData.words.find(w => w.id === wordId)
    
    // 获取状态的中文描述
    const statusText = {
      'learning': '学习词库',
      'review': '复习词库',
      'mastered': '熟知词库'
    }[word.status] || '未知状态'
    
    // 构建详细信息内容 - 使用微信小程序支持的换行方式
    let content = `含义：${word.meaning}

例句：${word.sentence}

分类：${word.category}

状态：${statusText}

学习次数：${word.studyCount}

正确次数：${word.correctCount}

周学习次数：${word.weeklyStudyCount || 0}`
    
    // 如果是复习词库，显示复习统计
    if (word.status === 'review') {
      const reviewCount = word.reviewCount || 0
      const reviewCorrectCount = word.reviewCorrectCount || 0
      const reviewStreak = word.reviewStreak || 0
      const accuracy = reviewCount > 0 ? (reviewCorrectCount / reviewCount * 100).toFixed(1) : 0
      
      content += `\n\n复习统计：\n复习次数：${reviewCount}\n复习正确：${reviewCorrectCount}\n正确率：${accuracy}%\n连续正确：${reviewStreak}次`
    }
    
    // 如果是熟知词库，显示掌握信息
    if (word.status === 'mastered') {
      content += `\n\n掌握状态：已完全掌握，不再进入学习循环`
    }
    
    wx.showModal({
      title: word.word,
      content: content,
      showCancel: false
    })
  }
})