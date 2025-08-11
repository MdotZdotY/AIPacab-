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
    const papers = require('../../utils/papersData.js')
    this.setData({ papers, filteredPapers: papers })
  },

  onShow() {
    // 页面显示时的逻辑
    if (this.getTabBar && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
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
      // 如果搜索关键词为空，显示所有论文
      this.setData({
        filteredPapers: this.data.papers
      })
      return
    }

    // 根据关键词过滤论文
    const filtered = this.data.papers.filter(paper => {
      const searchText = keyword.toLowerCase()
      const title = paper.title.toLowerCase()
      const authors = paper.authors.toLowerCase()
      const abstract = paper.abstract.toLowerCase()
      const category = paper.category.toLowerCase()
      
      return title.includes(searchText) || 
             authors.includes(searchText) || 
             abstract.includes(searchText) || 
             category.includes(searchText)
    })

    this.setData({
      filteredPapers: filtered
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
      title: 'AI词汇学习 - 论文资源',
      path: '/pages/papers/papers'
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})