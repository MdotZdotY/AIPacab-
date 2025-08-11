// pages/import/import.js
const app = getApp()

Page({
  data: {
    importText: '',
    paperTitle: '',
    previewWords: [],
    showPreview: false,
    importResult: null
  },

  onLoad() {
    // 页面加载时的初始化
  },

  // 输入词汇文本
  onImportTextChange(e) {
    this.setData({
      importText: e.detail.value
    })
  },

  // 输入论文标题
  onPaperTitleChange(e) {
    this.setData({
      paperTitle: e.detail.value
    })
  },

  // 预览词汇
  previewVocabulary() {
    if (!this.data.importText.trim()) {
      wx.showToast({
        title: '请输入词汇文本',
        icon: 'none'
      })
      return
    }

    try {
      const VocabularyManager = require('../../utils/vocabularyManager.js')
      const manager = new VocabularyManager()
      const words = manager.parseVocabularyFile(this.data.importText, this.data.paperTitle)
      
      this.setData({
        previewWords: words,
        showPreview: true
      })

      wx.showToast({
        title: `解析到 ${words.length} 个词汇`,
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: '解析失败，请检查格式',
        icon: 'none'
      })
      console.error('解析错误:', error)
    }
  },

  // 确认导入
  confirmImport() {
    if (this.data.previewWords.length === 0) {
      wx.showToast({
        title: '没有可导入的词汇',
        icon: 'none'
      })
      return
    }

    try {
      const VocabularyManager = require('../../utils/vocabularyManager.js')
      const manager = new VocabularyManager()
      const result = manager.addNewWords(this.data.previewWords)
      
      this.setData({
        importResult: result,
        showPreview: false,
        importText: '',
        paperTitle: '',
        previewWords: []
      })

      wx.showModal({
        title: '导入完成',
        content: `成功导入 ${result.added} 个新词汇\n跳过 ${result.skipped} 个重复词汇\n当前词汇库共有 ${result.total} 个词汇`,
        showCancel: false,
        success: () => {
          // 通知统计页面更新
          this.notifyStatsUpdate()
          // 返回管理页面
          wx.navigateBack()
        }
      })
    } catch (error) {
      wx.showToast({
        title: '导入失败',
        icon: 'none'
      })
      console.error('导入错误:', error)
    }
  },

  // 取消预览
  cancelPreview() {
    this.setData({
      showPreview: false,
      previewWords: []
    })
  },

  // 查看词汇统计
  viewStats() {
    try {
      const VocabularyManager = require('../../utils/vocabularyManager.js')
      const manager = new VocabularyManager()
      const stats = manager.getVocabularyStats()
      
      let content = `总词汇量: ${stats.total}\n\n`
      content += '按分类统计:\n'
      Object.entries(stats.byCategory).forEach(([category, count]) => {
        content += `${category}: ${count}个\n`
      })
      content += '\n按难度统计:\n'
      Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
        content += `${difficulty}: ${count}个\n`
      })
      content += '\n按论文统计:\n'
      Object.entries(stats.byPaper).forEach(([paper, count]) => {
        content += `${paper}: ${count}个\n`
      })

      wx.showModal({
        title: '词汇库统计',
        content,
        showCancel: false
      })
    } catch (error) {
      wx.showToast({
        title: '获取统计失败',
        icon: 'none'
      })
    }
  },

  // 导出词汇库
  exportVocabulary() {
    try {
      const VocabularyManager = require('../../utils/vocabularyManager.js')
      const manager = new VocabularyManager()
      const words = manager.exportVocabulary()
      
      // 转换为文本格式
      let exportText = ''
      const categories = {}
      
      words.forEach(word => {
        if (!categories[word.category]) {
          categories[word.category] = []
        }
        categories[word.category].push(word)
      })

      Object.entries(categories).forEach(([category, categoryWords]) => {
        exportText += `${category}\n\n`
        categoryWords.forEach(word => {
          exportText += `●\t${word.word}\n`
          if (word.pronunciation) {
            exportText += `○\t音标: ${word.pronunciation}\n`
          }
          if (word.meaning) {
            exportText += `○\t中文解释: ${word.meaning}\n`
          }
          if (word.sentence) {
            exportText += `○\t例句: ${word.sentence}\n`
          }
          exportText += '\n'
        })
        exportText += '________________________________________\n\n'
      })

      // 复制到剪贴板
      wx.setClipboardData({
        data: exportText,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    } catch (error) {
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      })
    }
  },

  // 返回管理页面
  goBack() {
    wx.navigateBack()
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 通知统计更新
  notifyStatsUpdate() {
    try {
      // 通过页面栈通知统计页面更新
      const pages = getCurrentPages()
      const statsPage = pages.find(page => page.route === 'pages/stats/stats')
      if (statsPage && statsPage.loadStats) {
        statsPage.loadStats()
      }
      
      // 通知全局数据更新
      const app = getApp()
      if (app.globalData && app.globalData.words) {
        // 触发统计页面的 onShow 事件
        setTimeout(() => {
          const currentPages = getCurrentPages()
          const currentStatsPage = currentPages.find(page => page.route === 'pages/stats/stats')
          if (currentStatsPage && currentStatsPage.onShow) {
            currentStatsPage.onShow()
          }
        }, 100)
      }
    } catch (error) {
      console.log('通知统计更新失败，但不影响功能:', error)
    }
  }
})