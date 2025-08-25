// utils/statsManager.js
// 本地统计管理：在无法使用云开发时，使用本地存储持续累计用户学习数据

class StatsManager {
  constructor(storageKey = 'user_stats_local') {
    this.storageKey = storageKey
    this.stats = this.loadStats()
    this.sessionStartMs = null
  }

  // 获取今日日期（本地时区）YYYY-MM-DD
  getTodayDateString() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 读取本地存储
  loadStats() {
    try {
      const saved = wx.getStorageSync(this.storageKey)
      if (saved && typeof saved === 'object') {
        return {
          studyDays: Number(saved.studyDays) || 0,
          studiedWordEvents: Number(saved.studiedWordEvents) || 0,
          lastStudyDate: saved.lastStudyDate || '',
          updatedAt: saved.updatedAt || '',
          totalStudyMs: Number(saved.totalStudyMs) || 0,
          // 每日学习时长映射：{ 'YYYY-MM-DD': ms }
          perDayMs: saved.perDayMs && typeof saved.perDayMs === 'object' ? saved.perDayMs : {},
          // 已阅读论文ID集合（去重）
          readPaperIds: Array.isArray(saved.readPaperIds) ? saved.readPaperIds : []
        }
      }
    } catch (e) {
      // 忽略读取错误，使用默认值
    }
    return { studyDays: 0, studiedWordEvents: 0, lastStudyDate: '', updatedAt: '', totalStudyMs: 0, perDayMs: {}, readPaperIds: [] }
  }

  // 写入本地存储（增强版：支持双重存储）
  saveStats() {
    const data = { ...this.stats, updatedAt: new Date().toISOString() }
    try {
      // 保存到原有位置（向后兼容）
      wx.setStorageSync(this.storageKey, data)
      
      // 同时保存到独立存储（数据保护）
      wx.setStorageSync('user_learning_stats', data)
      
      console.log('统计数据已保存到双重存储')
      
    } catch (e) {
      console.error('保存本地统计失败:', e)
    }
  }

  // 新增：同步保存到独立存储
  saveStatsToIndependentStorage() {
    try {
      const currentStats = this.getStats()
      wx.setStorageSync('user_learning_stats', currentStats)
      console.log('统计数据已同步到独立存储')
    } catch (e) {
      console.error('同步统计数据失败:', e)
    }
  }

  // 如果是新的一天则+1学习天数
  markStudyToday() {
    const today = this.getTodayDateString()
    if (this.stats.lastStudyDate !== today) {
      this.stats.studyDays += 1
      this.stats.lastStudyDate = today
      this.saveStats()
    }
  }

  // 增加学习事件计数（按题/按词为单位）
  addStudied(count = 1) {
    if (!Number.isFinite(count) || count <= 0) return
    this.stats.studiedWordEvents += count
    this.saveStats()
  }

  // 记录一次学习事件：会先标记当天，然后增加数量
  recordStudyEvent(count = 1) {
    this.markStudyToday()
    this.addStudied(count)
    return this.getStats()
  }

  // 学习会话：开始
  startSession() {
    if (this.sessionStartMs == null) {
      this.sessionStartMs = Date.now()
    }
  }

  // 学习会话：结束并累计到当天与总时长
  endSession() {
    if (this.sessionStartMs == null) return
    const end = Date.now()
    const delta = Math.max(0, end - this.sessionStartMs)
    this.sessionStartMs = null

    const today = this.getTodayDateString()
    const current = Number(this.stats.perDayMs[today] || 0)
    this.stats.perDayMs[today] = current + delta
    this.stats.totalStudyMs = Number(this.stats.totalStudyMs || 0) + delta
    this.markStudyToday()
    this.saveStats()
  }

  // 记录论文阅读事件（去重）
  recordPaperRead(paperId) {
    if (paperId == null) return this.getStats()
    const id = String(paperId)
    const set = new Set(this.stats.readPaperIds || [])
    if (!set.has(id)) {
      set.add(id)
      this.stats.readPaperIds = Array.from(set)
      this.saveStats()
    }
    return this.getStats()
  }

  // 获取统计
  getStats() {
    return { ...this.stats }
  }

  // 新增：从独立存储恢复统计数据
  loadFromIndependentStorage() {
    try {
      const independentStats = wx.getStorageSync('user_learning_stats')
      if (independentStats && typeof independentStats === 'object') {
        console.log('从独立存储恢复统计数据')
        this.stats = {
          studyDays: Number(independentStats.studyDays) || 0,
          studiedWordEvents: Number(independentStats.studiedWordEvents) || 0,
          lastStudyDate: independentStats.lastStudyDate || '',
          updatedAt: independentStats.updatedAt || '',
          totalStudyMs: Number(independentStats.totalStudyMs) || 0,
          perDayMs: independentStats.perDayMs && typeof independentStats.perDayMs === 'object' ? independentStats.perDayMs : {},
          readPaperIds: Array.isArray(independentStats.readPaperIds) ? independentStats.readPaperIds : []
        }
        
        // 同时更新到原有存储位置
        this.saveStats()
        return true
      }
    } catch (e) {
      console.error('从独立存储恢复统计数据失败:', e)
    }
    return false
  }

  // 新增：数据完整性检查
  validateStatsIntegrity() {
    const issues = []
    
    // 检查基本数据类型
    if (typeof this.stats.studyDays !== 'number' || this.stats.studyDays < 0) {
      issues.push('学习天数数据异常')
    }
    if (typeof this.stats.studiedWordEvents !== 'number' || this.stats.studiedWordEvents < 0) {
      issues.push('学习事件数据异常')
    }
    if (!Array.isArray(this.stats.readPaperIds)) {
      issues.push('论文阅读记录数据异常')
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues
    }
  }
}

module.exports = StatsManager



