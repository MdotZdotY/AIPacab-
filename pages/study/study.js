// pages/study/study.js
const app = getApp()
let si = null
const StatsManager = require('../../utils/statsManager.js')
const statsManager = new StatsManager()

Page({
  data: {
    mode: 'learning', // review, test, learning
    modeText: '学习模式',
    words: [],
    currentWord: null,
    currentIndex: 0,
    totalWords: 0,
    showMeaning: false,
    showTranslation: false,
    showPaperInfo: false,
    options: [], // 测试模式的选项
    isTestMode: false,
    isEmptyState: false, // 是否显示空状态
    emptyMessage: '', // 空状态主消息
    emptySubMessage: '' // 空状态副消息
  },

  onLoad() {
    console.log('onLoad 被调用')
    console.log('app.globalData:', app.globalData)
    console.log('app.globalData.words:', app.globalData.words)

    // 初始化发音播放器
    this.audio = wx.createInnerAudioContext()
    this.audio.obeyMuteSwitch = false
    this.audio.onError(err => console.warn('audio error:', err))
    this.ttsCache = {}

    // 尝试加载 WechatSI 插件（未授权时不阻塞启动）
    try {
      si = requirePlugin('WechatSI')
      this.setData({}) // 占位触发不需要
    } catch (e) {
      console.warn('WechatSI 插件未授权/不可用:', e)
      this.siUnavailable = true
    }
    // 开启学习会话计时
    try {
      const StatsManagerCtor = require('../../utils/statsManager.js')
      this._statsSession = new StatsManagerCtor()
      this._statsSession.startSession()
    } catch (e) { console.warn('启动学习会话失败', e) }
    
    // 初始化数据
    this.setData({
      totalWords: 0,
      currentIndex: 0
    })
  },

  onShow() {
    console.log('onShow 被调用')
    // 页面显示时刷新词汇列表
    this.loadWords()
    if (this.getTabBar && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },



  // 加载词汇
  loadWords() {
    const words = app.globalData.words
    console.log('总词汇数:', words.length)
    
    // 确保所有词汇都有正确的status字段
    words.forEach(word => {
      if (!word.status) {
        word.status = 'learning'
        word.weeklyStudyCount = word.weeklyStudyCount || 0
        word.studyCount = word.studyCount || 0
        word.correctCount = word.correctCount || 0
      }
    })
    
    let filteredWords = []

    // 根据模式筛选词汇
    switch (this.data.mode) {
      case 'review':
        // 复习模式：从复习词库中获取词汇
        filteredWords = words.filter(word => word.status === 'review')
        console.log('复习模式词汇数:', filteredWords.length)
        break
      case 'test':
        // 测试模式：从复习词库中随机获取词汇
        filteredWords = words.filter(word => word.status === 'review')
        this.shuffleArray(filteredWords)
        this.setData({ isTestMode: true })
        console.log('测试模式词汇数:', filteredWords.length)
        break
      case 'learning':
        // 学习模式：显示学习词库中的词汇
        filteredWords = words.filter(word => word.status === 'learning')
        this.shuffleArray(filteredWords)
        console.log('学习模式词汇数:', filteredWords.length)
        break
      default:
        // 默认模式：显示学习词库中的词汇
        filteredWords = words.filter(word => word.status === 'learning')
        console.log('默认模式词汇数:', filteredWords.length)
    }

    console.log('当前模式:', this.data.mode)
    console.log('筛选后词汇数:', filteredWords.length)

    this.setData({
      words: filteredWords,
      totalWords: filteredWords.length,
      currentIndex: 0
    })

    if (filteredWords.length > 0) {
      this.setCurrentWord()
    } else {
      // 显示空状态提示
      this.showEmptyState()
    }
  },

  // 设置当前词汇
  setCurrentWord() {
    const { words, currentIndex, mode } = this.data
    console.log('setCurrentWord - words.length:', words.length)
    console.log('setCurrentWord - currentIndex:', currentIndex)
    console.log('setCurrentWord - mode:', mode)
    
    if (words.length === 0) {
      console.log('setCurrentWord - 词汇列表为空')
      this.showEmptyState()
      return
    }
    
    if (currentIndex < words.length) {
      const currentWord = words[currentIndex]
      console.log('setCurrentWord - currentWord:', currentWord)
      
      // 处理meaning字段，移除词性信息，只保留纯中文意思
      if (currentWord.meaning) {
        // 移除meaning中的词性信息，格式如 "全连接层 (noun phrase)" -> "全连接层"
        currentWord.meaning = currentWord.meaning.replace(/\s*\([^)]*\)$/, '').trim()
      }
      
      // 生成测试选项
      let options = []
      if (this.data.isTestMode) {
        options = this.generateOptions(currentWord)
      }

      // 调试信息
      console.log('setCurrentWord调试:')
      console.log('- currentIndex:', currentIndex)
      console.log('- words.length:', words.length)
      
      this.setData({
        currentWord,
        options,
        // 测试模式下隐藏词义和语义，学习模式和复习模式显示论文来源
        showMeaning: mode !== 'test',
        showTranslation: mode !== 'test',
        showPaperInfo: mode !== 'test',
        isEmptyState: false // 重置空状态
      })
      console.log('setCurrentWord - 设置完成')
    } else {
      console.log('setCurrentWord - 索引超出范围，currentIndex:', currentIndex, 'words.length:', words.length)
      // 如果索引超出范围，重置为最后一个词汇
      if (words.length > 0) {
        this.setData({
          currentIndex: words.length - 1
        })
        this.setCurrentWord()
      } else {
        this.showEmptyState()
      }
    }
  },

  // 显示空状态提示
  showEmptyState() {
    const { mode } = this.data
    let message = ''
    let subMessage = ''
    
    switch (mode) {
      case 'review':
        message = '暂无需要复习的词汇'
        subMessage = '继续学习新词汇，当周学习次数达到5次时会自动进入复习词库'
        break
      case 'test':
        message = '暂无可测试的词汇'
        subMessage = '需要先有复习词库中的词汇才能进行测试'
        break
      case 'learning':
        message = '暂无需要学习的词汇'
        subMessage = '所有词汇都已学习完成！'
        break
      default:
        message = '暂无词汇'
        subMessage = '请先添加一些词汇'
    }
    
    this.setData({
      currentWord: null,
      options: [],
      totalWords: 0,
      currentIndex: 0,
      showMeaning: false,
      showTranslation: false,
      showPaperInfo: false,
      emptyMessage: message,
      emptySubMessage: subMessage,
      isEmptyState: true
    })
  },

  // 生成测试选项
  generateOptions(correctWord) {
    const allWords = app.globalData.words
    
    // 处理meaning字段，确保不包含词性信息
    const cleanMeaning = correctWord.meaning ? 
      correctWord.meaning.replace(/\s*\([^)]*\)$/, '').trim() : 
      correctWord.meaning
    
    // 为正确答案添加词性信息
    const correctOption = correctWord.partOfSpeech ? 
      `${cleanMeaning} (${correctWord.partOfSpeech})` : 
      cleanMeaning
    const options = [correctOption]
    
    console.log('generateOptions - 生成测试选项')
    console.log('- correctWord:', correctWord)
    console.log('- allWords.length:', allWords.length)
    
    // 随机选择3个错误选项
    const otherWords = allWords.filter(word => word.id !== correctWord.id)
    const shuffled = this.shuffleArray([...otherWords])
    
    console.log('- otherWords.length:', otherWords.length)
    console.log('- shuffled.length:', shuffled.length)
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      // 处理错误选项的meaning字段，确保不包含词性信息
      const cleanWrongMeaning = shuffled[i].meaning ? 
        shuffled[i].meaning.replace(/\s*\([^)]*\)$/, '').trim() : 
        shuffled[i].meaning
      
      // 为错误选项也添加词性信息
      const wrongOption = shuffled[i].partOfSpeech ? 
        `${cleanWrongMeaning} (${shuffled[i].partOfSpeech})` : 
        cleanWrongMeaning
      options.push(wrongOption)
    }
    
    const finalOptions = this.shuffleArray(options)
    console.log('- finalOptions:', finalOptions)
    
    return finalOptions
  },

  // 切换学习模式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    let modeText = ''
    
    switch (mode) {
      case 'review':
        modeText = '复习模式'
        break
      case 'test':
        modeText = '测试模式'
        break
      case 'learning':
        modeText = '学习模式'
        break
    }

    this.setData({
      mode,
      modeText,
      currentIndex: 0,
      isTestMode: mode === 'test'
    })

    this.loadWords()
  },

  // 显示/隐藏含义
  toggleMeaning() {
    this.setData({
      showMeaning: !this.data.showMeaning
    })
  },

  // 显示/隐藏翻译
  toggleTranslation() {
    this.setData({
      showTranslation: !this.data.showTranslation
    })
  },

  // 显示/隐藏论文信息
  togglePaperInfo() {
    this.setData({
      showPaperInfo: !this.data.showPaperInfo
    })
  },

  // 播放发音（WechatSI 语音合成）
  playPronunciation() {
    if (this.siUnavailable || !si) {
      wx.showToast({ title: '发音插件未授权，请在小程序后台添加 WechatSI 插件', icon: 'none' })
      return
    }
    const word = (this.data.currentWord && this.data.currentWord.word || '').trim()
    if (!word) return

    const clean = word.replace(/[^a-zA-Z\-\s']/g, '')

    // 防抖：切换新播放前停止
    try { this.audio.stop() } catch (e) {}

    // 命中缓存直接播
    if (this.ttsCache && this.ttsCache[clean]) {
      this.audio.src = this.ttsCache[clean]
      this.audio.play()
      return
    }

    si.textToSpeech({
      lang: 'en_US',
      tts: true,
      content: clean,
      success: (res) => {
        const url = res.filename
        this.ttsCache[clean] = url
        this.audio.src = url
        this.audio.play()
      },
      fail: () => {
        wx.showToast({ title: '发音失败', icon: 'none' })
      }
    })
  },



  // 选择答案（测试模式）
  selectAnswer(e) {
    const selectedAnswer = e.currentTarget.dataset.answer
    const correctAnswer = this.data.currentWord.meaning
    // 处理包含词性信息的选项，提取纯含义进行比较
    const selectedMeaning = selectedAnswer.replace(/\s*\([^)]*\)$/, '') // 移除词性信息
    const isCorrect = selectedMeaning === correctAnswer
    const { currentWord } = this.data
    
    console.log('selectAnswer - 答题')
    console.log('- selectedAnswer:', selectedAnswer)
    console.log('- correctAnswer:', correctAnswer)
    console.log('- isCorrect:', isCorrect)

    // 记录答题结果
    currentWord.lastAnswerCorrect = isCorrect
    console.log(`答题结果：${isCorrect ? '正确' : '错误'}`)

    // 更新学习记录
    this.updateStudyRecord(isCorrect)

    // 测试模式：答题一次视作一次学习事件
    console.log('测试模式：记录学习事件')
    statsManager.recordStudyEvent(1)

    // 如果回答正确，将词汇移到熟知词库
    if (isCorrect) {
      const wordIndex = app.globalData.words.findIndex(w => w.id === currentWord.id)
      if (wordIndex !== -1) {
        app.globalData.words[wordIndex].status = 'mastered'
        console.log(`词汇 "${currentWord.word}" 答题正确，已移至熟知词库`)
      } else {
        console.log(`词汇 "${currentWord.word}" 在全局词汇列表中未找到`)
      }
    }

    if (isCorrect) {
      wx.showModal({
        title: '回答正确！',
        content: '恭喜你！这个词汇已经掌握了！',
        showCancel: false,
        confirmText: '继续',
        success: () => {
          // 延迟后进入下一题
          setTimeout(() => {
            this.nextWord()
          }, 500)
        }
      })
    } else {
      wx.showToast({
        title: '回答错误',
        icon: 'error',
        duration: 2000
      })
      // 延迟后进入下一题
      setTimeout(() => {
        this.nextWord()
      }, 2000)
    }
  },

  // 更新学习记录
  updateStudyRecord(isCorrect) {
    const { currentWord, words, currentIndex, mode } = this.data
    const wordIndex = app.globalData.words.findIndex(w => w.id === currentWord.id)
    
    console.log('updateStudyRecord - 更新学习记录')
    console.log('- currentWord:', currentWord)
    console.log('- wordIndex:', wordIndex)
    console.log('- isCorrect:', isCorrect)
    console.log('- mode:', mode)
    
    if (wordIndex !== -1) {
      const word = app.globalData.words[wordIndex]
      
      // 确保词汇有正确的status字段
      if (!word.status) {
        word.status = 'learning'
        word.weeklyStudyCount = word.weeklyStudyCount || 0
        word.studyCount = word.studyCount || 0
        word.correctCount = word.correctCount || 0
      }
      
      // 更新学习次数和正确次数
      word.studyCount = (word.studyCount || 0) + 1
      if (isCorrect) {
        word.correctCount = (word.correctCount || 0) + 1
      }
      word.lastStudyTime = new Date().toISOString()
      
      // 根据模式处理词汇状态转换
      if (mode === 'test' && isCorrect) {
        // 测试模式且回答正确：从复习词库移到熟知词库
        word.status = 'mastered'
        console.log(`词汇 "${word.word}" 已移至熟知词库`)
      } else if (mode === 'learning') {
        // 学习模式：检查是否需要移到复习词库
        console.log(`学习模式：检查词汇 "${word.word}" 是否需要移到复习词库`)
        this.checkLearningProgress(word)
      }
      // 复习模式：不进行状态转换，仅用于复习查看

      // 本地累计统计：记录一次学习事件
      // 学习模式：每个词算1次；测试模式：在selectAnswer时已调用一次，这里不重复
      if (mode === 'learning') {
        console.log('学习模式：记录学习事件')
        statsManager.recordStudyEvent(1)
      }
    }
  },

  // 检查学习进度，决定是否移到复习词库
  checkLearningProgress(word) {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    console.log(`检查词汇 "${word.word}" 的学习进度`)
    console.log('- 当前时间:', now.toISOString())
    console.log('- 一周前时间:', oneWeekAgo.toISOString())
    
    // 获取一周内的学习记录
    const weeklyStudyCount = word.weeklyStudyCount || 0
    console.log(`词汇 "${word.word}" 当前周学习次数:`, weeklyStudyCount)
    
    if (weeklyStudyCount >= 5) {
      // 一周内学习次数达到5次，移到复习词库
      word.status = 'review'
      word.weeklyStudyCount = 0 // 重置周学习次数
      console.log(`词汇 "${word.word}" 已移至复习词库`)
      
      // 注意：不在这里重新加载词汇列表，避免重置进度
      // 词汇状态变化会在下次学习时生效
    } else {
      console.log(`词汇 "${word.word}" 当前周学习次数:`, weeklyStudyCount, '，未达到5次')
      // 增加周学习次数
      word.weeklyStudyCount = (word.weeklyStudyCount || 0) + 1
      console.log(`词汇 "${word.word}" 周学习次数增加到:`, word.weeklyStudyCount)
    }
  },

  // 下一个词汇
  nextWord() {
    const { currentIndex, totalWords, mode, isEmptyState } = this.data

    // 空状态时直接返回，防止误触
    if (isEmptyState || totalWords === 0) {
      console.log('nextWord - 空状态或总词汇数为0，直接返回')
      return
    }
    
    // 在学习模式和测试模式下，更新当前词汇的学习记录
    if ((mode === 'learning' || mode === 'test') && this.data.currentWord) {
      const isCorrect = mode === 'learning' ? true : this.data.currentWord.lastAnswerCorrect
      this.updateStudyRecord(isCorrect)
    }
    
    if (currentIndex < totalWords - 1) {
      console.log('nextWord - 移动到下一个词汇，currentIndex:', currentIndex, '->', currentIndex + 1)
      this.setData({
        currentIndex: currentIndex + 1
      })
      this.setCurrentWord()
    } else {
      console.log('nextWord - 已到达最后一个词汇，currentIndex:', currentIndex, 'totalWords:', totalWords)
      if (mode === 'learning') {
        const remainingWords = app.globalData.words.filter(word => word.status === 'learning')
        if (remainingWords.length > 0) {
          // 保存当前进度信息用于调试
          console.log('学习模式重新加载前 - currentIndex:', this.data.currentIndex, 'totalWords:', this.data.totalWords)
          this.loadWords()
          console.log('学习模式重新加载后 - currentIndex:', this.data.currentIndex, 'totalWords:', this.data.totalWords)
          wx.showToast({
            title: '继续学习更多词汇',
            icon: 'success',
            duration: 1500
          })
          return
        }
      }
      
      if (mode === 'review') {
        const remainingWords = app.globalData.words.filter(word => word.status === 'review')
        if (remainingWords.length > 0) {
          // 保存当前进度信息用于调试
          console.log('复习模式重新加载前 - currentIndex:', this.data.currentIndex, 'totalWords:', this.data.totalWords)
          this.loadWords()
          console.log('复习模式重新加载后 - currentIndex:', this.data.currentIndex, 'totalWords:', this.data.totalWords)
          wx.showToast({
            title: '继续复习更多词汇',
            icon: 'success',
            duration: 1500
          })
          return
        }
      }
      
      if (mode === 'test') {
        const remainingWords = app.globalData.words.filter(word => word.status === 'review')
        if (remainingWords.length > 0) {
          // 保存当前进度信息用于调试
          console.log('测试模式重新加载前 - currentIndex:', this.data.currentIndex, 'totalWords:', this.data.totalWords)
          this.loadWords()
          console.log('测试模式重新加载后 - currentIndex:', this.data.currentIndex, 'totalWords:', this.data.totalWords)
          wx.showToast({
            title: '继续测试更多词汇',
            icon: 'success',
            duration: 1500
          })
          return
        }
      }
      
      wx.showModal({
        title: '学习完成',
        content: '恭喜你完成了本次学习！',
        showCancel: false,
        success: () => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    }
  },

  // 上一个词汇
  prevWord() {
    const { currentIndex, totalWords } = this.data
    if (currentIndex > 0 && totalWords > 0) {
      this.setData({
        currentIndex: currentIndex - 1
      })
      this.setCurrentWord()
    }
  },

  // 工具函数：数组洗牌
  shuffleArray(array) {
    console.log('shuffleArray - 洗牌前数组长度:', array.length)
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    console.log('shuffleArray - 洗牌后数组长度:', array.length)
    return array
  },

  // 返回首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 去添加词汇
  goToManage() {
    wx.switchTab({
      url: '/pages/manage/manage'
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 页面卸载时保存状态
  onUnload() {
    // 结束学习会话计时
    try {
      if (this._statsSession) this._statsSession.endSession()
    } catch (e) {}
    console.log('学习页面卸载')
  }
})