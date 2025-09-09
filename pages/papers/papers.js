// pages/papers/papers.js
const app = getApp()

Page({
  data: {
    searchKeyword: '', // 搜索关键词
    papers: [],
    filteredPapers: [] // 过滤后的论文列表
  },

  onLoad() {
    // 统一从数据模块加载，方便首页统计与复用
    this.loadPapersData()
  },

  // 加载论文数据
  loadPapersData() {
    const papers = require('../../utils/papersData.js')
    // 按照发表时间由近到远排序（最新发表的论文排在最上面）
    // 同年发表的论文按标题字母顺序排序
    const sortedPapers = papers.sort((a, b) => {
      // 首先按年份排序（由近到远）
      if (b.year !== a.year) {
        return b.year - a.year
      }
      // 同年发表的论文按标题字母顺序排序
      return a.title.localeCompare(b.title)
    })
    this.setData({ papers: sortedPapers, filteredPapers: sortedPapers })
  },

  onShow() {
    // 页面显示时的逻辑
    if (this.getTabBar && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    
    // 重新加载论文数据以获取最新的词汇数量
    this.loadPapersData()
  },

  // 搜索输入处理
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterPapers(keyword)
  },

  // 搜索确认处理
  onSearchConfirm(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    this.filterPapers(keyword)
  },

  // 过滤论文
  filterPapers(keyword) {
    if (!keyword || keyword.trim() === '') {
      // 如果搜索关键词为空，显示所有论文（保持排序）
      this.setData({
        filteredPapers: this.data.papers
      })
      return
    }

    const searchText = keyword.toLowerCase()
    
    // 首先按标题搜索
    const titleMatches = this.data.papers.filter(paper => {
      const title = (paper.title || '').toLowerCase()
      return title.includes(searchText)
    })
    
    // 如果标题有匹配结果，直接返回标题匹配的结果
    if (titleMatches.length > 0) {
      const sortedTitleMatches = titleMatches.sort((a, b) => {
        // 按标题字母顺序排序
        return a.title.localeCompare(b.title)
      })
      
      this.setData({
        filteredPapers: sortedTitleMatches
      })
      return
    }
    
    // 如果标题没有匹配，则按摘要搜索
    const abstractMatches = this.data.papers.filter(paper => {
      const abstract = (paper.abstract || '').toLowerCase()
      return abstract.includes(searchText)
    })
    
    // 对摘要匹配结果进行排序
    const sortedAbstractMatches = abstractMatches.sort((a, b) => {
      // 首先按年份排序（由近到远）
      if (b.year !== a.year) {
        return b.year - a.year
      }
      // 同年发表的论文按标题字母顺序排序
      return a.title.localeCompare(b.title)
    })
    
    this.setData({
      filteredPapers: sortedAbstractMatches
    })
  },

  // 查看论文详情
  viewPaperDetail(e) {
    const paperId = e.currentTarget.dataset.id
    const paper = this.data.papers.find(p => p.id === paperId)
    
    if (paper) {
      wx.navigateTo({
        url: `/pages/paper-detail/paper-detail?id=${paperId}`
      })
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: 'AI Pacab+ - 论文词汇学习资源',
      path: '/pages/papers/papers',
      imageUrl: '/images/ai_vocab_app_icon.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'AI Pacab+ - 论文词汇学习资源',
      imageUrl: '/images/小程序二维码.jpg'
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})