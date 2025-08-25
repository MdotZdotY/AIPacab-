// pages/data-status/data-status.js
// 数据状态展示页面
const app = getApp()

Page({
  data: {
    dataStatus: {
      vocabularyCount: 0,
      userProgressCount: 0,
      papersCount: 0,
      readPapersCount: 0,
      appVersion: '',
      dataVersion: '',
      lastUpdate: '',
      hasBackups: false,
      backupCount: 0
    },
    
    storageInfo: {
      vocabularyStorage: '0KB',
      progressStorage: '0KB',
      paperStorage: '0KB',
      statsStorage: '0KB',
      backupStorage: '0KB',
      totalStorage: '0KB'
    },

    dataIntegrity: {
      vocabularyValid: true,
      progressValid: true,
      paperValid: true,
      statsValid: true,
      issues: []
    }
  },

  onLoad() {
    this.loadDataStatus()
    this.calculateStorageInfo()
    this.checkDataIntegrity()
  },

  onShow() {
    // 刷新数据状态
    this.loadDataStatus()
    this.calculateStorageInfo()
  },

  // 加载数据状态
  loadDataStatus() {
    try {
      // 词汇数据状态
      const words = app.globalData.words || []
      const vocabularyProgress = wx.getStorageSync('user_vocabulary_progress') || {}
      
      // 论文数据状态
      const papers = require('../../utils/papersData.js')
      const paperProgress = wx.getStorageSync('user_paper_progress') || { readPaperIds: [] }
      
      // 版本信息
      const versionInfo = wx.getStorageSync('version_info') || {}
      
      // 备份信息
      const backups = wx.getStorageSync('data_backups') || []
      
      this.setData({
        dataStatus: {
          vocabularyCount: words.length,
          userProgressCount: Object.keys(vocabularyProgress).length,
          papersCount: papers.length,
          readPapersCount: paperProgress.readPaperIds.length,
          appVersion: versionInfo.appVersion || '未知',
          dataVersion: versionInfo.dataVersion?.vocabulary || '未知',
          lastUpdate: versionInfo.lastUpdate ? new Date(versionInfo.lastUpdate).toLocaleString() : '未知',
          hasBackups: backups.length > 0,
          backupCount: backups.length
        }
      })
      
      console.log('数据状态加载完成')
      
    } catch (e) {
      console.error('加载数据状态失败:', e)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 计算存储空间使用情况
  calculateStorageInfo() {
    try {
      const words = wx.getStorageSync('words') || []
      const vocabularyProgress = wx.getStorageSync('user_vocabulary_progress') || {}
      const paperProgress = wx.getStorageSync('user_paper_progress') || {}
      const learningStats = wx.getStorageSync('user_learning_stats') || {}
      const backups = wx.getStorageSync('data_backups') || []

      // 估算存储大小（粗略计算）
      const vocabularySize = JSON.stringify(words).length
      const progressSize = JSON.stringify(vocabularyProgress).length
      const paperSize = JSON.stringify(paperProgress).length
      const statsSize = JSON.stringify(learningStats).length
      const backupSize = JSON.stringify(backups).length
      const totalSize = vocabularySize + progressSize + paperSize + statsSize + backupSize

      this.setData({
        storageInfo: {
          vocabularyStorage: this.formatBytes(vocabularySize),
          progressStorage: this.formatBytes(progressSize),
          paperStorage: this.formatBytes(paperSize),
          statsStorage: this.formatBytes(statsSize),
          backupStorage: this.formatBytes(backupSize),
          totalStorage: this.formatBytes(totalSize)
        }
      })

    } catch (e) {
      console.error('计算存储信息失败:', e)
    }
  },

  // 检查数据完整性
  checkDataIntegrity() {
    try {
      const issues = []
      let vocabularyValid = true
      let progressValid = true
      let paperValid = true
      let statsValid = true

      // 检查词汇数据
      const words = app.globalData.words || []
      if (!Array.isArray(words)) {
        vocabularyValid = false
        issues.push('词汇数据格式错误')
      } else if (words.some(word => !word.id || !word.word)) {
        vocabularyValid = false
        issues.push('存在无效的词汇条目')
      }

      // 检查进度数据
      const vocabularyProgress = wx.getStorageSync('user_vocabulary_progress') || {}
      if (typeof vocabularyProgress !== 'object') {
        progressValid = false
        issues.push('学习进度数据格式错误')
      }

      // 检查论文数据
      const paperProgress = wx.getStorageSync('user_paper_progress') || {}
      if (!Array.isArray(paperProgress.readPaperIds)) {
        paperValid = false
        issues.push('论文阅读记录格式错误')
      }

      // 检查统计数据
      const StatsManager = require('../../utils/statsManager.js')
      const statsManager = new StatsManager()
      const validation = statsManager.validateStatsIntegrity()
      if (!validation.isValid) {
        statsValid = false
        issues.push(...validation.issues)
      }

      this.setData({
        dataIntegrity: {
          vocabularyValid,
          progressValid,
          paperValid,
          statsValid,
          issues
        }
      })

    } catch (e) {
      console.error('检查数据完整性失败:', e)
    }
  },

  // 格式化字节大小
  formatBytes(bytes) {
    if (bytes === 0) return '0B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
  },

  // 刷新数据状态
  refreshStatus() {
    wx.showLoading({ title: '刷新中...' })
    
    this.loadDataStatus()
    this.calculateStorageInfo()
    this.checkDataIntegrity()
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '刷新完成',
        icon: 'success'
      })
    }, 500)
  },

  // 修复数据问题
  fixDataIssues() {
    wx.showModal({
      title: '修复数据',
      content: '将尝试修复检测到的数据问题，是否继续？',
      success: (res) => {
        if (res.confirm) {
          this.performDataFix()
        }
      }
    })
  },

  // 执行数据修复
  performDataFix() {
    wx.showLoading({ title: '修复中...' })
    
    try {
      let fixed = false

      // 修复词汇数据
      const words = app.globalData.words || []
      if (Array.isArray(words)) {
        const fixedWords = words.filter(word => word && word.id && word.word)
        if (fixedWords.length !== words.length) {
          app.globalData.words = fixedWords
          wx.setStorageSync('words', fixedWords)
          fixed = true
        }
      }

      // 修复进度数据
      const vocabularyProgress = wx.getStorageSync('user_vocabulary_progress')
      if (typeof vocabularyProgress !== 'object' || !vocabularyProgress) {
        wx.setStorageSync('user_vocabulary_progress', {})
        fixed = true
      }

      // 修复论文数据
      const paperProgress = wx.getStorageSync('user_paper_progress')
      if (!paperProgress || !Array.isArray(paperProgress.readPaperIds)) {
        wx.setStorageSync('user_paper_progress', {
          readPaperIds: [],
          paperReadHistory: {}
        })
        fixed = true
      }

      // 修复统计数据
      const StatsManager = require('../../utils/statsManager.js')
      const statsManager = new StatsManager()
      if (!statsManager.validateStatsIntegrity().isValid) {
        statsManager.loadFromIndependentStorage()
        fixed = true
      }

      wx.hideLoading()

      if (fixed) {
        wx.showModal({
          title: '修复完成',
          content: '数据问题已修复，请重新检查数据状态。',
          showCancel: false,
          success: () => {
            this.checkDataIntegrity()
          }
        })
      } else {
        wx.showToast({
          title: '无需修复',
          icon: 'success'
        })
      }

    } catch (e) {
      wx.hideLoading()
      console.error('数据修复失败:', e)
      wx.showToast({
        title: '修复失败',
        icon: 'error'
      })
    }
  },

  // 查看备份列表
  viewBackups() {
    try {
      const backups = wx.getStorageSync('data_backups') || []
      if (backups.length === 0) {
        wx.showToast({
          title: '暂无备份',
          icon: 'none'
        })
        return
      }

      const backupList = backups.map((backup, index) => 
        `备份 ${index + 1}: ${new Date(backup.timestamp).toLocaleString()}\n版本: ${backup.appVersion}`
      ).join('\n\n')

      wx.showModal({
        title: `数据备份 (${backups.length}个)`,
        content: backupList,
        showCancel: false
      })

    } catch (e) {
      console.error('查看备份失败:', e)
      wx.showToast({
        title: '查看失败',
        icon: 'error'
      })
    }
  },

  // 创建新备份
  createBackup() {
    wx.showModal({
      title: '创建备份',
      content: '是否创建当前数据的备份？',
      success: (res) => {
        if (res.confirm) {
          try {
            const app = getApp()
            app.createDataBackup()
            
            wx.showToast({
              title: '备份成功',
              icon: 'success'
            })
            
            // 刷新状态
            this.loadDataStatus()
            
          } catch (e) {
            console.error('创建备份失败:', e)
            wx.showToast({
              title: '备份失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 导出数据
  exportData() {
    wx.showModal({
      title: '导出数据',
      content: '此功能将在未来版本中实现，敬请期待！',
      showCancel: false
    })
  },

  // 清理缓存
  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '将清理发音缓存和临时数据，不影响学习进度，是否继续？',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清理发音缓存
            wx.removeStorageSync('pronunciationHistory')
            
            wx.showToast({
              title: '清理完成',
              icon: 'success'
            })
            
            // 刷新存储信息
            this.calculateStorageInfo()
            
          } catch (e) {
            console.error('清理缓存失败:', e)
            wx.showToast({
              title: '清理失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})