// pages/paper-detail/paper-detail.js
const app = getApp()
const papersData = require('../../utils/papersData.js')

Page({
  data: {
    paper: null,
    papers: papersData
  },

  onLoad(options) {
    const paperId = parseInt(options.id)
    const paper = this.data.papers.find(p => p.id === paperId)
    
    if (paper) {
      // 动态计算词汇数量
      const wordCount = this.calculateWordCount(paper.title)
      
      // 处理markdown标记
      const processedPaper = {
        ...paper,
        wordCount: wordCount,
        keyConcepts: this.removeMarkdown(paper.keyConcepts),
        highlights: this.removeMarkdown(paper.highlights)
      }
      this.setData({ paper: processedPaper })
    } else {
      wx.showToast({
        title: '论文不存在',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 计算论文词汇数量
  calculateWordCount(paperTitle) {
    try {
      const words = app.globalData.words || []
      return words.filter(word => word.paperTitle === paperTitle).length
    } catch (e) {
      console.warn('计算论文词汇数量失败:', e)
      return 0
    }
  },

  // 移除markdown标记
  removeMarkdown(text) {
    if (!text) return text
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/\[cite_start\](.*?)\[cite_end\]/g, '$1') // 移除引用标记
      .replace(/\[cite: \d+\]/g, '') // 移除引用编号
      .replace(/^\s*[-*]\s+/gm, '• ') // 将markdown列表符号转换为圆点
      .replace(/^\s*\d+\.\s+/gm, (match, index) => `${index + 1}. `) // 保持数字列表格式
  },

  // 打开论文链接
  openPaperUrl() {
    const { paper } = this.data
    if (paper && paper.url) {
      // 立即记一次阅读事件（按按钮即认为阅读），避免用户确认弹窗被误操作导致未计数
      try {
        const StatsManager = require('../../utils/statsManager.js')
        const stats = new StatsManager()
        stats.recordPaperRead(paper.id)
      } catch (e) { console.warn('记录论文阅读失败', e) }
      wx.showModal({
        title: '打开链接',
        content: '是否在浏览器中打开论文链接？',
        success: (res) => {
          if (res.confirm) {
            // 在微信小程序中打开外部链接
            wx.setClipboardData({
              data: paper.url,
              success: () => {
                wx.showToast({
                  title: '链接已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    }
  },

  // 分享
  onShareAppMessage() {
    const { paper } = this.data
    return {
      title: paper ? `${paper.title} - AI词汇学习` : 'AI词汇学习 - 论文详情',
      path: `/pages/paper-detail/paper-detail?id=${paper ? paper.id : ''}`
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})