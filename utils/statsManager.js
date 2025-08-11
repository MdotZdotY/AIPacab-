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

  // 写入本地存储
  saveStats() {
    const data = { ...this.stats, updatedAt: new Date().toISOString() }
    try {
      wx.setStorageSync(this.storageKey, data)
    } catch (e) {
      console.error('保存本地统计失败:', e)
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
}

module.exports = StatsManager



