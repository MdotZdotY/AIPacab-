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
        // 1. 记录到统计管理器（原有逻辑）
        const StatsManager = require('../../utils/statsManager.js')
        const stats = new StatsManager()
        stats.recordPaperRead(paper.id)
        
        // 2. 记录到独立的论文进度存储
        this.recordPaperReadProgress(paper.id)
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

  // 记录论文阅读进度到独立存储
  recordPaperReadProgress(paperId) {
    try {
      console.log('记录论文阅读进度:', paperId)
      
      // 获取现有的论文进度数据
      const paperProgress = wx.getStorageSync('user_paper_progress') || {
        readPaperIds: [],
        paperReadHistory: {}
      }
      
      // 更新已读论文列表
      if (!paperProgress.readPaperIds.includes(paperId)) {
        paperProgress.readPaperIds.push(paperId)
        console.log('添加新的已读论文:', paperId)
      }
      
      // 更新详细阅读历史
      if (!paperProgress.paperReadHistory[paperId]) {
        paperProgress.paperReadHistory[paperId] = {
          firstReadTime: new Date().toISOString(),
          readCount: 1,
          lastReadTime: new Date().toISOString()
        }
        console.log('创建论文阅读历史记录:', paperId)
      } else {
        paperProgress.paperReadHistory[paperId].readCount++
        paperProgress.paperReadHistory[paperId].lastReadTime = new Date().toISOString()
        console.log('更新论文阅读次数:', paperId, '次数:', paperProgress.paperReadHistory[paperId].readCount)
      }
      
      // 保存更新后的论文进度
      wx.setStorageSync('user_paper_progress', paperProgress)
      
      // 同时更新学习统计数据的备份
      const StatsManager = require('../../utils/statsManager.js')
      const statsManager = new StatsManager()
      const currentStats = statsManager.getStats()
      wx.setStorageSync('user_learning_stats', currentStats)
      
      console.log('论文阅读进度已保存完成')
      console.log('- 已读论文总数:', paperProgress.readPaperIds.length)
      
    } catch (e) {
      console.error('保存论文阅读进度失败:', e)
    }
  },

  // 分享
  onShareAppMessage() {
    const { paper } = this.data
    return {
      title: paper ? `${paper.title} - AI Pacab+论文学习` : 'AI Pacab+ - 论文详情',
      path: `/pages/paper-detail/paper-detail?id=${paper ? paper.id : ''}`,
      imageUrl: '/images/ai_vocab_app_icon.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { paper } = this.data
    return {
      title: paper ? `${paper.title} - AI Pacab+论文学习` : 'AI Pacab+ - 论文学习资源',
      imageUrl: '/images/小程序二维码.jpg'
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})