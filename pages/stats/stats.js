// pages/stats/stats.js
const app = getApp()

Page({
  data: {
    stats: {
      totalWords: 0,
      studiedWords: 0,
      correctRate: 0,
      studyDays: 0,
      masteredWords: 0,
      totalStudyHours: 0,
      weeklyAvgHours: 0,
      papersRead: 0,
      totalPapers: 0
    },
    categoryStats: [],
    categorySummary: {
      gre: { mastered: 0, total: 0 },
      toefl: { mastered: 0, total: 0 },
      ielts: { mastered: 0, total: 0 },
      ai: { mastered: 0, total: 0 }
    },
    trendData: [],
    uChartsReady: false,
    selectedPeriod: 'month', // month, year, all
    periods: [
      { value: 'month', text: '本月' },
      { value: 'year', text: '本年' },
      { value: 'all', text: '全部' }
    ],
    isGeneratingCard: false // 添加生成卡片状态
  },

  onLoad() {
    this.loadStats()
    // 尝试加载 uCharts（未安装不阻塞）
    try {
      this.UCharts = require('../../libs/ucharts/ucharts.min.js')
      this.setData({ uChartsReady: true })
    } catch (e) { console.warn('uCharts 未安装，先用简版渲染', e) }
  },

  onShow() {
    this.loadStats()
    // 同步自定义 tabBar 的选中态
    if (this.getTabBar && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })
    }
  },

  // 加载统计数据
  loadStats() {
    // 强制使用app.globalData中的词汇数据，不从本地存储加载
    console.log('统计页面使用app.globalData中的词汇数据')
    
    const words = app.globalData.words || []
    
    // 按状态统计词汇
    const learningWords = words.filter(word => word.status === 'learning')
    const reviewWords = words.filter(word => word.status === 'review')
    const masteredWords = words.filter(word => word.status === 'mastered')
    
    const studiedWords = words.filter(word => word.studyCount > 0)
    const totalCorrect = studiedWords.reduce((sum, word) => sum + (word.correctCount || 0), 0)
    const totalStudy = studiedWords.reduce((sum, word) => sum + (word.studyCount || 0), 0)
    
    // 学习时长统计（本地累计）
    const localStats = (new (require('../../utils/statsManager.js'))()).getStats()
    const totalStudyHours = Math.round(((localStats.totalStudyMs || 0) / (1000 * 60 * 60)) * 10) / 10
    const weeklyAvgHours = this.computeWeeklyAverageHours(localStats.perDayMs || {})

    // 论文统计
    const papers = require('../../utils/papersData.js')
    const localStats2 = (new (require('../../utils/statsManager.js'))()).getStats()
    const papersRead = Array.isArray(localStats2.readPaperIds) ? localStats2.readPaperIds.length : 0
    const totalPapers = papers.length

    // 分类词汇统计：规范类别并统计
    const normalizeCategory = (name) => {
      if (!name) return 'AI专业词汇'
      const map = {
        'GRE高频词汇': 'GRE高频词',
        'TOEFL高频词汇': 'TOEFL高频词',
        'IELTS高频词汇': 'IELTS高频词',
        'AI领域常用及专有词汇': 'AI专业词汇',
        'AI领域内常用词和专有词': 'AI专业词汇'
      }
      return map[name] || name
    }
    const summaryInit = { mastered: 0, total: 0 }
    const summary = {
      gre: { ...summaryInit },
      toefl: { ...summaryInit },
      ielts: { ...summaryInit },
      ai: { ...summaryInit }
    }
    ;(words || []).forEach(w => {
      const cat = normalizeCategory(w.category)
      const key = cat === 'GRE高频词' ? 'gre' : cat === 'TOEFL高频词' ? 'toefl' : cat === 'IELTS高频词' ? 'ielts' : 'ai'
      summary[key].total += 1
      if (w.status === 'mastered') summary[key].mastered += 1
    })

    this.setData({
      stats: {
        totalWords: words.length,
        learningWords: learningWords.length,
        reviewWords: reviewWords.length,
        masteredWords: masteredWords.length,
        studiedWords: studiedWords.length,
        correctRate: totalStudy > 0 ? Math.round((totalCorrect / totalStudy) * 100) : 0,
        studyDays: localStats.studyDays,
        totalStudyHours,
        weeklyAvgHours,
        papersRead,
        totalPapers
      },
      categorySummary: summary
    })

    // 学习趋势区域已移除
  },

  // 计算近7天平均学习时长（小时）
  computeWeeklyAverageHours(perDayMs) {
    const now = new Date()
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      days.push(`${y}-${m}-${day}`)
    }
    const sumMs = days.reduce((sum, key) => sum + Number(perDayMs[key] || 0), 0)
    const avgHour = sumMs / 7 / (1000 * 60 * 60)
    return Math.round(avgHour * 10) / 10
  },

  // 分类统计模块已移除

  // 趋势图模块已移除

  // 计算学习天数
  calculateStudyDays() {
    const studyDates = new Set()
    app.globalData.words.forEach(word => {
      if (word.lastStudyTime) {
        const date = new Date(word.lastStudyTime).toDateString()
        studyDates.add(date)
      }
    })
    return studyDates.size
  },

  // 趋势图渲染已移除

  // 切换时间周期
  switchPeriod(e) {
    const period = e.currentTarget.dataset.period
    this.setData({ selectedPeriod: period })
    this.loadTrendData()
  },

  // 查看详细统计
  viewDetail(e) {
    const type = e.currentTarget.dataset.type
    let content = ''
    
    switch (type) {
      case 'total':
        content = `总词汇量：${this.data.stats.totalWords}个\n包括GRE、TOEFL、AI专业词汇等分类`
        break
      case 'learning':
        content = `学习词库：${this.data.stats.learningWords}个\n新词汇，等待学习`
        break
      case 'review':
        content = `复习词库：${this.data.stats.reviewWords}个\n已学习5次，进入复习阶段`
        break
      case 'mastered':
        content = `熟知词库：${this.data.stats.masteredWords}个\n测试通过，已熟练掌握`
        break
      case 'studied':
        content = `已学习：${this.data.stats.studiedWords}个\n学习进度：${Math.round((this.data.stats.studiedWords / this.data.stats.totalWords) * 100)}%`
        break
      case 'correct':
        content = `正确率：${this.data.stats.correctRate}%\n基于所有学习记录计算`
        break
      case 'days':
        content = `学习天数：${this.data.stats.studyDays}天\n持续学习，效果更佳`
        break
    }

    wx.showModal({
      title: '详细统计',
      content,
      showCancel: false
    })
  },

  // 分享统计
  onShareAppMessage() {
    const hours = (this.data.stats.totalStudyHours || 0)
    const mastered = (this.data.stats.masteredWords || 0)
    const papersRead = (this.data.stats.papersRead || 0)
    const hoursText = Number.isFinite(hours) ? (Math.round(hours * 10) / 10) : 0
    return {
              title: `我在AI Pacab+中累计学习了${hoursText}小时，掌握了${mastered}个词汇，阅读了${papersRead}篇行业论文。`,
      path: '/pages/index/index',
      success: () => {
        try {
          wx.switchTab({ url: '/pages/stats/stats' })
        } catch (e) {}
      }
    }
  },

  // 生成分享卡片
  generateShareCard() {
    if (this.data.isGeneratingCard) {
      wx.showToast({
        title: '正在生成中...',
        icon: 'none'
      })
      return
    }

    this.setData({ isGeneratingCard: true })

    wx.showLoading({
      title: '生成分享卡片中...',
      mask: true
    })

    // 延迟一下确保Canvas已经准备好
    setTimeout(() => {
      // 先尝试最简单的测试版本
      this.drawSimpleTestCard()
    }, 200)
  },

  // 精美的分享卡片绘制方法
  drawSimpleTestCard() {
    try {
      // 使用 Canvas 2D API
      const query = wx.createSelectorQuery()
      query.select('#shareCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0] && res[0].node) {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            
            // 设置画布尺寸 - 使用高分辨率以适配现代手机屏幕
            // 获取设备像素比，确保在高分辨率屏幕上显示清晰
            const pixelRatio = wx.getSystemInfoSync().pixelRatio || 2
            const baseWidth = 350
            const baseHeight = 500
            const canvasWidth = baseWidth * pixelRatio
            const canvasHeight = baseHeight * pixelRatio
            
            // 设置Canvas的实际尺寸（像素）
            canvas.width = canvasWidth
            canvas.height = canvasHeight
            
            // 根据像素比缩放绘图上下文
            ctx.scale(pixelRatio, pixelRatio)
            
            // 启用字体平滑和抗锯齿
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'

            console.log('开始绘制分享卡片，尺寸:', canvasWidth, 'x', canvasHeight, '像素比:', pixelRatio)

            // 绘制渐变背景 - 使用蓝色系渐变
            const gradient = ctx.createLinearGradient(0, 0, 0, baseHeight)
            gradient.addColorStop(0, '#1E3A8A')    // 顶部深蓝色
            gradient.addColorStop(0.5, '#3B82F6')  // 中间中蓝色
            gradient.addColorStop(1, '#60A5FA')    // 底部浅蓝色
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, baseWidth, baseHeight)

            // 绘制装饰性背景元素
            this.drawBackgroundDecorations(ctx, baseWidth, baseHeight)

            // 绘制顶部品牌区域
            this.drawHeader(ctx, baseWidth)

            // 绘制核心数据展示
            this.drawStatsSection(ctx, baseWidth)

            // 绘制二维码区域
            this.drawQRSection(ctx, baseWidth, baseHeight)

            // 绘制底部品牌信息
            this.drawFooter(ctx, baseWidth, baseHeight)

            console.log('分享卡片绘制完成，准备保存...')
            this.saveShareCard(canvas)
          } else {
            console.error('Canvas节点获取失败')
            wx.hideLoading()
            this.setData({ isGeneratingCard: false })
            wx.showToast({
              title: 'Canvas初始化失败',
              icon: 'none'
            })
          }
        })
    } catch (error) {
      console.error('绘制现代化玻璃态卡片失败:', error)
      wx.hideLoading()
      this.setData({ isGeneratingCard: false })
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      })
    }
  },

  // 绘制装饰性背景元素
  drawBackgroundDecorations(ctx, width, height) {
    // 右上角装饰圆
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(width + 50, -50, 100, 0, 2 * Math.PI)
    ctx.fill()

    // 左下角装饰圆
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.beginPath()
    ctx.arc(-30, height + 30, 75, 0, 2 * Math.PI)
    ctx.fill()

    // 中间装饰圆 - 调整位置以配合新的布局
    ctx.fillStyle = 'rgba(251, 191, 36, 0.1)'
    ctx.beginPath()
    ctx.arc(-20, 260, 50, 0, 2 * Math.PI)  // 从240调整到260，再向下移动20像素
    ctx.fill()
  },

  // 绘制顶部品牌区域
  drawHeader(ctx, width) {
    const headerY = 30
    
    // 绘制品牌标签背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    this.roundRect(ctx, (width - 120) / 2, headerY, 120, 40, 8)
    ctx.fill()
    
    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // 绘制品牌名称
    ctx.fillStyle = '#1E3A8A'
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('AI Pacab+', width / 2, headerY + 20)

    // 绘制副标题
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('AI论文阅读 词汇无障碍', width / 2, headerY + 70)
  },

  // 绘制核心数据展示
  drawStatsSection(ctx, width) {
    const startY = 180  // 从160调整到180，为副标题留出更多空间
    
    // 绘制统计数据网格
    const stats = [
      { value: this.data.stats.masteredWords || 0, label: '已掌握词汇' },
      { value: this.data.stats.papersRead || 0, label: '已阅读论文' }
    ]

    stats.forEach((stat, index) => {
      const x = 24 + index * (width - 48) / 2
      const y = startY
      
      // 绘制统计卡片背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      this.roundRect(ctx, x, y, (width - 48) / 2 - 8, 80, 8)
      ctx.fill()
      ctx.stroke()

      // 绘制数值
      ctx.fillStyle = '#FBBF24'
      ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(stat.value.toString(), x + (width - 48) / 4, y + 30)
      
      // 绘制标签
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText(stat.label, x + (width - 48) / 4, y + 55)
    })

    // 绘制成就展示
    const achievementY = startY + 100
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    this.roundRect(ctx, 24, achievementY, width - 48, 60, 8)
    ctx.fill()
    ctx.stroke()

    // 计算学习进度
    const masteredWords = this.data.stats.masteredWords || 0
    const totalWords = this.data.stats.totalWords || 1
    const papersRead = this.data.stats.papersRead || 0
    const totalPapers = this.data.stats.totalPapers || 1
    
    // 进度计算逻辑：【（已掌握单词数/总词汇数）+（已读论文数/论文总数）】/2
    const wordProgress = masteredWords / totalWords
    const paperProgress = papersRead / totalPapers
    const overallProgress = (wordProgress + paperProgress) / 2
    const progressPercent = Math.min(overallProgress, 1) // 确保不超过100%
    const progressText = Math.round(progressPercent * 100) // 转换为百分制
    
    // 绘制学习进度标题
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`学习进度 ${progressText}%`, width / 2, achievementY + 20)

    // 绘制进度条
    const progressY = achievementY + 35
    const progressWidth = width - 48
    const progressHeight = 4
    
    // 进度条背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    this.roundRect(ctx, 24, progressY, progressWidth, progressHeight, 2)
    ctx.fill()
    
    // 进度条填充
    ctx.fillStyle = 'rgba(251, 191, 36, 0.8)'
    this.roundRect(ctx, 24, progressY, progressWidth * progressPercent, progressHeight, 2)
    ctx.fill()
  },

  // 绘制二维码区域
  drawQRSection(ctx, width, height) {
    const qrY = height - 120  // 从height-80调整到height-120，向上移动40像素，为底部文字留出空间
    
    // 绘制二维码区域背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    this.roundRect(ctx, 24, qrY, width - 48, 80, 8)
    ctx.fill()
    ctx.stroke()

    // 绘制二维码
    const qrSize = 64
    const qrX = 40
    const qrCenterY = qrY + 40
    
    // 二维码背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    this.roundRect(ctx, qrX, qrCenterY - qrSize/2, qrSize, qrSize, 6)
    ctx.fill()
    
    // 模拟二维码图案
    ctx.fillStyle = '#1E3A8A'
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(qrX + i * 8, qrCenterY - qrSize/2 + j * 8, 6, 6)
        }
      }
    }

    // 绘制二维码右侧文字
    const textX = qrX + qrSize + 16
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('扫码体验小程序', textX, qrCenterY - 10)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('开启你的AI论文词汇学习之旅', textX, qrCenterY + 8)
    ctx.fillText('随时随地，高效学习', textX, qrCenterY + 22)
  },

  // 绘制底部品牌信息
  drawFooter(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('AI Pacab+ | 2025', width / 2, height - 8)  // 从height-12调整到height-8，稍微向上移动
  },

  // 辅助方法：绘制圆角矩形
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  },





  // 保存分享卡片
  saveShareCard(canvas) {
    console.log('开始保存分享卡片...')
    
    // 先检查相册权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.writePhotosAlbum'] === false) {
          // 用户之前拒绝了权限，引导用户手动开启
          wx.showModal({
            title: '需要相册权限',
            content: '保存分享卡片需要相册权限，请在设置中开启',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    if (settingRes.authSetting['scope.writePhotosAlbum']) {
                      // 用户在设置中开启了权限，重新保存
                      this.saveImageToAlbum(canvas)
                    }
                  }
                })
              } else {
                wx.hideLoading()
                this.setData({ isGeneratingCard: false })
              }
            }
          })
        } else {
          // 直接保存或申请权限
          this.saveImageToAlbum(canvas)
        }
      }
    })
  },

  // 保存图片到相册
  saveImageToAlbum(canvas) {
    wx.canvasToTempFilePath({
      canvas: canvas,
      fileType: 'png',
      quality: 1.0, // 最高质量
      success: (res) => {
        console.log('Canvas转图片成功:', res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            console.log('图片保存到相册成功')
            wx.hideLoading()
            this.setData({ isGeneratingCard: false })
            
            wx.showModal({
              title: '分享卡片已生成',
              content: '图片已保存到相册，你可以在朋友圈分享这张学习成果卡片！',
              showCancel: false,
              confirmText: '知道了'
            })
          },
          fail: (err) => {
            console.error('保存图片失败:', err)
            wx.hideLoading()
            this.setData({ isGeneratingCard: false })
            
            if (err.errMsg.includes('auth deny')) {
              // 权限被拒绝，引导用户开启
              wx.showModal({
                title: '保存失败',
                content: '需要相册权限才能保存分享卡片，请在设置中开启相册权限',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting()
                  }
                }
              })
            } else {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          }
        })
      },
      fail: (err) => {
        console.error('生成图片失败:', err)
        wx.hideLoading()
        this.setData({ isGeneratingCard: false })
        wx.showToast({
          title: '生成失败',
          icon: 'none'
        })
      }
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})