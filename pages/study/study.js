// pages/study/study.js
const app = getApp()
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
    emptySubMessage: '', // 空状态副消息
    // 用户手动设置的按钮状态标志
    userSetMeaning: false,
    userSetTranslation: false,
    userSetPaperInfo: false,
    // 发音相关状态
    isPlaying: false, // 是否正在播放发音
    pronunciationError: false // 发音是否出错
  },

  onLoad() {
    // 初始化学习页面

    // 初始化发音播放器
    this.initAudioPlayer()
    
    // 发音功能已改为使用免费TTS服务，无需插件
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

  // 初始化音频播放器
  initAudioPlayer() {
    this.audio = wx.createInnerAudioContext()
    this.audio.obeyMuteSwitch = false
    
    // 音频播放器事件监听
    this.audio.onError(err => {
      console.warn('音频播放错误:', err)
      this.setData({
        isPlaying: false,
        pronunciationError: true
      })
      wx.hideLoading()
      wx.showToast({ 
        title: '发音播放失败', 
        icon: 'none',
        duration: 2000
      })
      
      // 3秒后重置错误状态
      setTimeout(() => {
        this.setData({ pronunciationError: false })
      }, 3000)
    })
    
    this.audio.onPlay(() => {
      console.log('开始播放发音')
      this.setData({ isPlaying: true })
      wx.hideLoading()
    })
    
    this.audio.onEnded(() => {
      console.log('发音播放完成')
      this.setData({ isPlaying: false })
    })
    
    this.audio.onStop(() => {
      console.log('发音播放停止')
      this.setData({ isPlaying: false })
    })
    
    // 初始化TTS缓存
    this.ttsCache = {}
    this.ttsCacheSize = 50 // 限制缓存大小
    
    // 初始化发音历史记录
    this.pronunciationHistory = []
    this.maxHistorySize = 20
    
    // 从本地存储恢复发音历史记录
    try {
      const savedHistory = wx.getStorageSync('pronunciationHistory')
      if (savedHistory && Array.isArray(savedHistory)) {
        this.pronunciationHistory = savedHistory
        console.log('从本地存储恢复发音历史记录:', savedHistory.length, '条')
      }
    } catch (e) {
      console.warn('恢复发音历史记录失败:', e)
    }
  },

  onShow() {
    // 页面显示时重新加载数据
    // 页面显示时刷新词汇列表
    this.loadWords()
    if (this.getTabBar && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    
    // 重新启动学习会话计时
    try {
      if (this._statsSession) {
        this._statsSession.startSession()
      }
    } catch (e) {
      console.warn('重新启动学习会话失败:', e)
    }
  },

  onHide() {
    // 页面隐藏时结束学习会话计时
    try {
      if (this._statsSession) this._statsSession.endSession()
    } catch (e) {
      console.warn('结束学习会话失败:', e)
    }
    // 学习页面隐藏，已结束学习会话
    
    // 页面隐藏时重置用户手动设置标志，下次进入时恢复默认状态
    this.setData({
      userSetMeaning: false,
      userSetTranslation: false,
      userSetPaperInfo: false
    })
  },



  // 加载词汇
  loadWords() {
    const words = app.globalData.words
    
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
        break
      case 'test':
        // 测试模式：从复习词库中随机获取词汇
        filteredWords = words.filter(word => word.status === 'review')
        this.shuffleArray(filteredWords)
        this.setData({ isTestMode: true })
        break
      case 'learning':
        // 学习模式：显示学习词库中的词汇
        filteredWords = words.filter(word => word.status === 'learning')
        this.shuffleArray(filteredWords)
        break
      default:
        // 默认模式：显示学习词库中的词汇
        filteredWords = words.filter(word => word.status === 'learning')
    }

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
    
    if (words.length === 0) {
      // 词汇列表为空
      this.showEmptyState()
      return
    }
    
    if (currentIndex < words.length) {
      const currentWord = words[currentIndex]
      // 设置当前词汇数据
      
      // 处理meaning字段，移除词性信息，只保留纯中文意思
      let displayWord = currentWord
      if (currentWord.meaning) {
        // 移除meaning中的词性信息，格式如 "全连接层 (noun phrase)" -> "全连接层"
        const cleanMeaning = currentWord.meaning.replace(/\s*\([^)]*\)$/, '').trim()
        // 创建当前词汇的副本，避免修改原始数据
        displayWord = { ...currentWord, meaning: cleanMeaning }
      }
      
      // 生成测试选项
      let options = []
      if (this.data.isTestMode) {
        options = this.generateOptions(displayWord)
      }

      // 调试信息
          // 设置当前词汇显示数据
      
      // 准备要设置的数据
      const setDataObj = {
        currentWord: displayWord,
        options,
        isEmptyState: false // 重置空状态
      }
      
      // 只有当用户未手动设置按钮状态时，才应用默认状态
      if (!this.data.userSetMeaning) {
        setDataObj.showMeaning = mode !== 'test'
      }
      if (!this.data.userSetTranslation) {
        setDataObj.showTranslation = mode !== 'test'
      }
      if (!this.data.userSetPaperInfo) {
        setDataObj.showPaperInfo = mode !== 'test'
      }
      
      this.setData(setDataObj)
      // 当前词汇设置完成
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
      isTestMode: mode === 'test',
      // 切换模式时重置用户手动设置标志，恢复默认行为
      userSetMeaning: false,
      userSetTranslation: false,
      userSetPaperInfo: false
    })

    this.loadWords()
  },

  // 显示/隐藏含义
  toggleMeaning() {
    this.setData({
      showMeaning: !this.data.showMeaning,
      userSetMeaning: true // 标记用户已手动设置此状态
    })
  },

  // 显示/隐藏翻译
  toggleTranslation() {
    this.setData({
      showTranslation: !this.data.showTranslation,
      userSetTranslation: true // 标记用户已手动设置此状态
    })
  },

  // 显示/隐藏论文信息
  togglePaperInfo() {
    this.setData({
      showPaperInfo: !this.data.showPaperInfo,
      userSetPaperInfo: true // 标记用户已手动设置此状态
    })
  },

  // 播放发音（音频播放）
  playPronunciation() {
    const word = (this.data.currentWord && this.data.currentWord.word || '').trim()
    if (!word) {
      wx.showToast({ title: '无法获取词汇', icon: 'none' })
      return
    }

    // 如果正在播放，先停止
    if (this.data.isPlaying) {
      this.audio.stop()
      return
    }

    // 处理词组，移除特殊字符，保留连字符和空格
    const clean = word.replace(/[^a-zA-Z\-\s']/g, '')
    if (!clean) {
      wx.showToast({ title: '无法播放发音', icon: 'none' })
      return
    }

    // 重置错误状态
    this.setData({ pronunciationError: false })

    // 命中缓存直接播放
    if (this.ttsCache && this.ttsCache[clean]) {
      console.log('使用缓存的发音:', clean)
      this.audio.src = this.ttsCache[clean]
      this.audio.play()
      return
    }

    // 对于长词组或连字符单词，尝试分段播放
    if (clean.length > 20 || clean.includes(' ') || clean.includes('-')) {
      this.playLongPhrase(clean)
    } else {
      // 使用TTS服务播放发音
      this.playWithFreeTTS(clean)
    }
  },

  // 播放长词组或连字符单词
  playLongPhrase(phrase) {
    // 显示加载提示
    wx.showLoading({ title: '加载发音中...' })
    
    // 检查是否是常见词组，提供特殊处理
    const specialPhrases = {
      'feed-forward neural network': 'feed-forward neural network',
      'convolutional neural network': 'convolutional neural network',
      'recurrent neural network': 'recurrent neural network',
      'deep learning': 'deep learning',
      'machine learning': 'machine learning',
      'artificial intelligence': 'artificial intelligence',
      'natural language processing': 'natural language processing',
      'computer vision': 'computer vision',
      'reinforcement learning': 'reinforcement learning',
      'transfer learning': 'transfer learning'
    }
    
    const lowerPhrase = phrase.toLowerCase()
    if (specialPhrases[lowerPhrase]) {
      // 使用优化后的词组
      this.tryTTSServices(specialPhrases[lowerPhrase], 0)
        .then(success => {
          if (!success) {
            this.playPhraseSegments(phrase)
          }
        })
    } else {
      // 尝试播放完整词组
      this.tryTTSServices(phrase, 0)
        .then(success => {
          if (!success) {
            // 如果完整词组播放失败，尝试分段播放
            this.playPhraseSegments(phrase)
          }
        })
    }
  },

  // 分段播放词组或连字符单词
  playPhraseSegments(phrase) {
    // 检查是否包含连字符
    if (phrase.includes('-')) {
      // 连字符单词，直接使用tryDictionaryAPI处理
      this.tryDictionaryAPI(phrase)
        .then(success => {
          if (!success) {
            // 如果播放失败，显示发音提示
            this.showLocalPronunciation(phrase)
          }
        })
      return
    }
    
    // 按空格分割词组
    const segments = phrase.split(/\s+/)
    
    if (segments.length <= 1) {
      // 单个词，尝试播放
      this.tryTTSServices(phrase, 0)
        .then(success => {
          if (!success) {
            // 如果播放失败，显示发音提示
            this.showLocalPronunciation(phrase)
          }
        })
      return
    }
    
    // 显示分段播放选项
    wx.hideLoading()
    wx.showModal({
      title: '词组发音',
      content: `"${phrase}" 较长，建议分段播放：\n\n${segments.map((seg, index) => `${index + 1}. ${seg}`).join('\n')}`,
      confirmText: '分段播放',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.playSegmentsSequentially(segments, 0)
        }
      }
    })
  },

  // 顺序播放分段
  playSegmentsSequentially(segments, index) {
    return new Promise((resolve) => {
      if (index >= segments.length) {
        wx.hideLoading()
        resolve(true)
        return
      }
      
      const segment = segments[index]
      console.log(`播放分段 ${index + 1}/${segments.length}: ${segment}`)
      
      // 跳过空字符串或只包含特殊字符的段
      if (!segment || segment.trim() === '' || /^[^a-zA-Z]+$/.test(segment)) {
        console.log(`跳过无效分段: ${segment}`)
        setTimeout(() => {
          this.playSegmentsSequentially(segments, index + 1)
            .then(() => resolve(true))
        }, 100)
        return
      }
      
      // 处理包含连字符的单词，将其拆分为多个部分
      if (segment.includes('-')) {
        console.log(`检测到连字符单词: ${segment}`)
        const subSegments = segment.split('-').filter(s => s.trim() !== '')
        if (subSegments.length > 1) {
          console.log(`将连字符单词拆分为: ${subSegments.join(', ')}`)
          
          // 检查是否有预设的分割规则
          const lowerSegment = segment.toLowerCase()
          if (this.syllableRules && this.syllableRules[lowerSegment]) {
            const presetSegments = this.syllableRules[lowerSegment]
            console.log(`使用预设分割规则: ${presetSegments.join(' - ')}`)
            this.playSubSegmentsSequentially(presetSegments, 0)
              .then(() => {
                setTimeout(() => {
                  this.playSegmentsSequentially(segments, index + 1)
                    .then(() => resolve(true))
                }, 1000)
              })
              .catch(() => {
                setTimeout(() => {
                  this.playSegmentsSequentially(segments, index + 1)
                    .then(() => resolve(true))
                }, 500)
              })
            return
          }
          
          // 对于没有预设规则的连字符单词，尝试按连字符分割
          // 如果分割后的单词仍然太长，进一步按音节分割
          const processedSegments = []
          for (const subSegment of subSegments) {
            if (subSegment.length > 8) {
              // 尝试按音节分割长单词
              const syllables = this.splitIntoSyllables(subSegment)
              if (syllables.length > 1) {
                console.log(`长单词进一步分割: ${subSegment} -> [${syllables.join(', ')}]`)
                processedSegments.push(...syllables)
              } else {
                processedSegments.push(subSegment)
              }
            } else {
              processedSegments.push(subSegment)
            }
          }
          
          console.log(`最终分割结果: ${processedSegments.join(' - ')}`)
          
          // 递归播放子分段
          this.playSubSegmentsSequentially(processedSegments, 0)
            .then(() => {
              // 子分段播放完成后，继续下一个主分段
              setTimeout(() => {
                this.playSegmentsSequentially(segments, index + 1)
                  .then(() => resolve(true))
              }, 1000)
            })
            .catch(() => {
              // 子分段播放失败，继续下一个主分段
              setTimeout(() => {
                this.playSegmentsSequentially(segments, index + 1)
                  .then(() => resolve(true))
              }, 500)
            })
          return
        }
      }
      
      wx.showLoading({ title: `播放 ${segment}...` })
      
      // 清理之前的事件监听器
      this.audio.offCanplay()
      this.audio.offError()
      
      // 直接使用有道词典播放单个词
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(segment)}&type=2`
      
      this.audio.src = audioUrl
      this.audio.play()
      
      let isResolved = false
      
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          wx.hideLoading()
          console.log(`分段播放超时: ${segment}`)
          // 超时后继续下一段
          setTimeout(() => {
            this.playSegmentsSequentially(segments, index + 1)
              .then(() => resolve(true))
          }, 500)
        }
      }, 3000)
      
      this.audio.onCanplay(() => {
        if (!isResolved) {
          isResolved = true
          clearTimeout(timeout)
          this.cachePronunciation(segment, audioUrl)
          wx.hideLoading()
          console.log(`分段播放成功: ${segment}`)
          
          // 等待播放完成后播放下一段
          setTimeout(() => {
            this.playSegmentsSequentially(segments, index + 1)
              .then(() => resolve(true))
          }, 2000) // 等待2秒
        }
      })
      
      this.audio.onError(() => {
        if (!isResolved) {
          isResolved = true
          clearTimeout(timeout)
          wx.hideLoading()
          console.log(`分段播放失败: ${segment}`)
          // 播放失败后继续下一段
          setTimeout(() => {
            this.playSegmentsSequentially(segments, index + 1)
              .then(() => resolve(true))
          }, 500)
        }
      })
    })
  },

  // 播放连字符单词的子分段
  playSubSegmentsSequentially(subSegments, index) {
    return new Promise((resolve, reject) => {
      if (index >= subSegments.length) {
        resolve(true)
        return
      }
      
      const subSegment = subSegments[index]
      console.log(`播放子分段 ${index + 1}/${subSegments.length}: ${subSegment}`)
      
      // 跳过空字符串
      if (!subSegment || subSegment.trim() === '') {
        setTimeout(() => {
          this.playSubSegmentsSequentially(subSegments, index + 1)
            .then(() => resolve(true))
            .catch(() => reject())
        }, 100)
        return
      }
      
      // 清理之前的事件监听器
      this.audio.offCanplay()
      this.audio.offError()
      
      // 使用有道词典播放单个词
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(subSegment)}&type=2`
      
      this.audio.src = audioUrl
      this.audio.play()
      
      let isResolved = false
      
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          console.log(`子分段播放超时: ${subSegment}`)
          // 超时后继续下一段
          setTimeout(() => {
            this.playSubSegmentsSequentially(subSegments, index + 1)
              .then(() => resolve(true))
              .catch(() => reject())
          }, 500)
        }
      }, 3000)
      
      this.audio.onCanplay(() => {
        if (!isResolved) {
          isResolved = true
          clearTimeout(timeout)
          this.cachePronunciation(subSegment, audioUrl)
          console.log(`子分段播放成功: ${subSegment}`)
          
          // 等待播放完成后播放下一段
          setTimeout(() => {
            this.playSubSegmentsSequentially(subSegments, index + 1)
              .then(() => resolve(true))
              .catch(() => reject())
          }, 1500) // 等待1.5秒
        }
      })
      
      this.audio.onError(() => {
        if (!isResolved) {
          isResolved = true
          clearTimeout(timeout)
          console.log(`子分段播放失败: ${subSegment}`)
          // 播放失败后继续下一段
          setTimeout(() => {
            this.playSubSegmentsSequentially(subSegments, index + 1)
              .then(() => resolve(true))
              .catch(() => reject())
          }, 500)
        }
      })
    })
  },

    // 初始化音节规则
  initSyllableRules() {
    if (!this.syllableRules) {
      this.syllableRules = {
        'interpretable': ['interpretable'],
        'simultaneously': ['simultaneously'],
        'classification': ['classification'],
        'regularization': ['regularization'],
        'optimization': ['optimization'],
        'implementation': ['implementation'],
        'dimensionality': ['dimensionality'],
        'representation': ['representation'],
        'architecture': ['architecture'],
        'backpropagation': ['backpropagation'],
        'convolutional': ['convolutional'],
        'transformer': ['transformer'],
        'multi-horizon': ['multi-horizon'],
        'forecasting': ['forecasting'],
        'cross-encoder': ['cross-encoder'],
        'downstream': ['downstream'],
        'back-propagation': ['back-propagation'],
        'fine-tuning': ['fine-tuning'],
        'in-batch': ['in-batch'],
        'negatives': ['negatives'],
        'generalized': ['generalized'],
        'linear': ['linear'],
        'model': ['model'],
        'non-parametric': ['non-parametric'],
        'memory': ['memory'],
        'logistic': ['logistic'],
        'regression': ['regression'],
        // 常见机器学习词汇
        'algorithm': ['algorithm'],
        'parameter': ['parameter'],
        'gradient': ['gradient'],
        'activation': ['activation'],
        'convolution': ['convolution'],
        'clustering': ['clustering'],
        'framework': ['framework'],
        'evaluation': ['evaluation'],
        // 常见统计词汇
        'statistical': ['statistical'],
        'probability': ['probability'],
        'distribution': ['distribution'],
        'hypothesis': ['hypothesis'],
        'correlation': ['correlation'],
        'covariance': ['covariance'],
        'variance': ['variance'],
        'deviation': ['deviation'],
        'confidence': ['confidence'],
        'significance': ['significance'],
        'generalization': ['generalization'],
        'pre-training': ['pre-training'],
        'gating mechanism': ['gating mechanism'],
        'comprehensive': ['comprehensive'],
        'in-batch negatives': ['in-batch negatives'],
        'brittleness': ['brittle', 'ness'],
        'hyperparameter': ['hyper', 'parameter']
      }
    }
  },

  // 将长单词分割为音节
  splitIntoSyllables(word) {
    const lowerWord = word.toLowerCase()
    
    // 确保音节规则已初始化
    this.initSyllableRules()
    
    // 检查是否有精确匹配的规则
    if (this.syllableRules[lowerWord]) {
      return this.syllableRules[lowerWord]
    }
    
    // 通用音节分割规则
    const syllables = []
    let current = ''
    
    // 特殊后缀处理
    const suffixes = ['tion', 'sion', 'ment', 'ness', 'able', 'ible', 'ful', 'less', 'ing', 'ed', 'er', 'est']
    let hasSuffix = false
    
    for (const suffix of suffixes) {
      if (lowerWord.endsWith(suffix)) {
        const prefix = lowerWord.slice(0, -suffix.length)
        if (prefix.length >= 3) {
          // 分割前缀和后缀
          const prefixSyllables = this.splitWordIntoSyllables(prefix)
          syllables.push(...prefixSyllables, suffix)
          hasSuffix = true
          break
        }
      }
    }
    
    if (!hasSuffix) {
      // 常规音节分割
      for (let i = 0; i < lowerWord.length; i++) {
        const char = lowerWord[i]
        current += char
        
        // 在元音后分割（改进规则）
        if ('aeiou'.includes(char) && i < lowerWord.length - 1) {
          const nextChar = lowerWord[i + 1]
          // 如果下一个字符也是元音，或者当前音节已经足够长，则分割
          if ('aeiou'.includes(nextChar) || current.length >= 3) {
            // 避免分割出太短的音节
            if (current.length >= 2) {
              syllables.push(current)
              current = ''
            }
          }
        }
      }
      
      // 添加剩余部分
      if (current) {
        syllables.push(current)
      }
    }
    
    // 如果分割结果不合理，返回原单词
    if (syllables.length === 1 || syllables.some(s => s.length < 2)) {
      return [word]
    }
    
    return syllables
  },

  // 辅助函数：将单词分割为音节
  splitWordIntoSyllables(word) {
    const syllables = []
    let current = ''
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i]
      current += char
      
      // 在元音后分割
      if ('aeiou'.includes(char) && i < word.length - 1) {
        const nextChar = word[i + 1]
        if ('aeiou'.includes(nextChar) || current.length >= 3) {
          if (current.length >= 2) {
            syllables.push(current)
            current = ''
          }
        }
      }
    }
    
    if (current) {
      syllables.push(current)
    }
    
    return syllables.length > 0 ? syllables : [word]
  },

  // 使用免费TTS服务播放发音
  playWithFreeTTS(word) {
    // 显示加载提示
    wx.showLoading({ title: '加载发音中...' })

    // 尝试多个免费的TTS服务，按优先级排序
    return this.tryTTSServices(word, 0)
  },

  // 尝试多个TTS服务
  tryTTSServices(word, serviceIndex) {
    return new Promise((resolve) => {
      const services = [
        // 服务1: Dictionary API (最稳定)
        () => this.tryDictionaryAPI(word),
        // 服务2: 备选TTS服务
        () => this.tryFallbackTTS(word),
        // 服务3: 本地发音提示
        () => this.showLocalPronunciation(word)
      ]

      if (serviceIndex >= services.length) {
        // 所有服务都失败了
        wx.hideLoading()
        this.setData({ pronunciationError: true })
        wx.showToast({ 
          title: '发音服务暂时不可用', 
        icon: 'none',
        duration: 2000
        })
        resolve(false)
        return
      }

      services[serviceIndex]()
        .then(success => {
          if (success) {
            // 服务成功，不需要尝试下一个
            resolve(true)
            return
          }
          // 当前服务失败，尝试下一个
          this.tryTTSServices(word, serviceIndex + 1)
            .then(result => resolve(result))
        })
        .catch(() => {
          // 当前服务出错，尝试下一个
          this.tryTTSServices(word, serviceIndex + 1)
            .then(result => resolve(result))
        })
    })
  },

  // 尝试Dictionary API
  tryDictionaryAPI(word) {
    return new Promise((resolve) => {
      // 确保音节规则已初始化
      this.initSyllableRules()
      // 对于包含缩写的词组，使用特殊处理
      if (word.includes('(') && word.includes(')')) {
        // 提取主要词组部分，忽略缩写
        const mainPart = word.replace(/\s*\([^)]*\)\s*$/, '').trim()
        if (mainPart.includes(' ')) {
          const segments = mainPart.split(' ')
          this.playSegmentsSequentially(segments, 0)
            .then(() => resolve(true))
            .catch(() => resolve(false))
          return
        }
      }
      
      // 对于普通词组，尝试分段播放
      if (word.includes(' ')) {
        // 首先检查是否有预设的完整词组规则
        const lowerWord = word.toLowerCase()
        if (this.syllableRules && this.syllableRules[lowerWord]) {
          console.log(`使用预设词组规则: ${word} -> [${this.syllableRules[lowerWord].join(', ')}]`)
          this.playSegmentsSequentially(this.syllableRules[lowerWord], 0)
            .then(() => resolve(true))
            .catch(() => resolve(false))
          return
        }
        
        const segments = word.split(' ')
        console.log(`词组检测: ${word} -> [${segments.join(', ')}]`)
        
        // 检查是否有需要进一步分割的复合词
        const processedSegments = []
        for (const segment of segments) {
          // 首先检查是否包含连字符
          if (segment.includes('-')) {
            console.log(`检测到混合分隔符: ${segment}`)
            // 处理连字符单词
            const hyphenSegments = segment.split('-').filter(s => s.trim() !== '')
            
            // 检查是否有预设的分割规则
            const lowerSegment = segment.toLowerCase()
            if (this.syllableRules && this.syllableRules[lowerSegment]) {
              const presetSegments = this.syllableRules[lowerSegment]
              console.log(`使用预设分割规则: ${presetSegments.join(' - ')}`)
              processedSegments.push(...presetSegments)
            } else {
              // 对于没有预设规则的连字符单词，进一步处理
              for (const subSegment of hyphenSegments) {
                if (subSegment.length > 8) {
                  const syllables = this.splitIntoSyllables(subSegment)
                  if (syllables.length > 1) {
                    console.log(`长单词进一步分割: ${subSegment} -> [${syllables.join(', ')}]`)
                    processedSegments.push(...syllables)
                  } else {
                    processedSegments.push(subSegment)
                  }
                } else {
                  processedSegments.push(subSegment)
                }
              }
            }
          } else if (segment.length > 8) {
            // 尝试按音节分割长单词
            const subSegments = this.splitIntoSyllables(segment)
            if (subSegments.length > 1) {
              console.log(`长单词分割: ${segment} -> [${subSegments.join(', ')}]`)
              processedSegments.push(...subSegments)
            } else {
              processedSegments.push(segment)
            }
          } else {
            processedSegments.push(segment)
          }
        }
        
        console.log(`最终处理结果: ${processedSegments.join(' - ')}`)
        
        // 对于所有词组，都进行分段播放以确保稳定性
        this.playSegmentsSequentially(processedSegments, 0)
          .then(() => resolve(true))
          .catch(() => resolve(false))
        return
      }
      
      // 对于长单词（超过12个字符），尝试分段播放
      // 注意：连字符单词优先按连字符分割，不进行音节分割
      if (word.length > 12 && !word.includes('-')) {
        console.log(`长单词检测: ${word} (${word.length}字符)，尝试分段播放`)
        // 尝试按音节分段
        const syllables = this.splitIntoSyllables(word)
        if (syllables.length > 1) {
          console.log(`将长单词拆分为音节: ${syllables.join(' - ')}`)
          this.playSegmentsSequentially(syllables, 0)
            .then(() => resolve(true))
            .catch(() => resolve(false))
          return
        }
      }
      
      // 单个词使用有道词典
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`
      
      // 清理之前的事件监听器
      this.audio.offCanplay()
      this.audio.offError()
      
      this.audio.src = audioUrl
      this.audio.play()
      
      let isResolved = false
      
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          resolve(false)
        }
      }, 3000)
      
      this.audio.onCanplay(() => {
        if (!isResolved) {
          isResolved = true
          clearTimeout(timeout)
          this.cachePronunciation(word, audioUrl)
          resolve(true)
        }
      })
      
      this.audio.onError(() => {
        if (!isResolved) {
          isResolved = true
          clearTimeout(timeout)
          resolve(false)
        }
      })
    })
  },

  // 尝试备选TTS服务
  tryFallbackTTS(word) {
    return new Promise((resolve) => {
      // 使用Dictionary API作为备选
      const audioUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      
      wx.request({
        url: audioUrl,
        method: 'GET',
        timeout: 5000,
        success: (res) => {
          if (res.data && res.data.length > 0 && res.data[0].phonetics && res.data[0].phonetics.length > 0) {
            const phonetic = res.data[0].phonetics.find(p => p.audio && p.audio.trim())
            if (phonetic && phonetic.audio) {
              this.cachePronunciation(word, phonetic.audio)
              this.audio.src = phonetic.audio
              this.audio.play()
              resolve(true)
              return
            }
          }
          resolve(false)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  },

  // 显示本地发音提示
  showLocalPronunciation(word) {
    return new Promise((resolve) => {
      wx.hideLoading()
      
      // 生成发音提示
      const pronunciation = this.generatePronunciationHint(word)
      
      // 添加发音指导
      const pronunciationGuide = this.getPronunciationGuide(word)
      
      wx.showModal({
        title: '发音提示',
        content: `${word}\n\n音标: ${pronunciation}\n\n${pronunciationGuide}`,
        showCancel: false,
        confirmText: '知道了',
        success: () => {
          resolve(true)
        }
      })
    })
  },

  // 获取发音指导
  getPronunciationGuide(word) {
    const lowerWord = word.toLowerCase()
    
    // 常见发音指导
    const guides = {
      'embedding': '发音要点：\n• em- 发 /ɪm/\n• -bed- 发 /bed/\n• -ding 发 /dɪŋ/\n\n整体读作：ɪmˈbedɪŋ',
      'neural': '发音要点：\n• neu- 发 /njʊə/\n• -ral 发 /rəl/\n\n整体读作：ˈnjʊərəl',
      'network': '发音要点：\n• net- 发 /net/\n• -work 发 /wɜːk/\n\n整体读作：ˈnetwɜːk',
      'algorithm': '发音要点：\n• al- 发 /æl/\n• -go- 发 /ɡə/\n• -rithm 发 /rɪðəm/\n\n整体读作：ˈælɡərɪðəm',
      'dot product': '发音要点：\n• dot 发 /dɒt/\n• product 发 /ˈprɒdʌkt/\n\n整体读作：dɒt ˈprɒdʌkt',
      'matrix': '发音要点：\n• ma- 发 /meɪ/\n• -trix 发 /trɪks/\n\n整体读作：ˈmeɪtrɪks',
      'vector': '发音要点：\n• vec- 发 /vek/\n• -tor 发 /tə/\n\n整体读作：ˈvektə',
      'tensor': '发音要点：\n• ten- 发 /ten/\n• -sor 发 /sə/\n\n整体读作：ˈtensə',
      'transduction': '发音要点：\n• trans- 发 /træns/\n• -duc- 发 /dʌk/\n• -tion 发 /ʃən/\n\n整体读作：trænsˈdʌkʃən',
      'sparse feature': '发音要点：\n• sparse 发 /spɑːs/\n• feature 发 /ˈfiːtʃə/\n\n整体读作：spɑːs ˈfiːtʃə',
      'recurrent neural network': '发音要点：\n• recurrent 发 /rɪˈkɜːrənt/\n• neural 发 /ˈnjʊərəl/\n• network 发 /ˈnetwɜːk/\n\n整体读作：rɪˈkɜːrənt ˈnjʊərəl ˈnetwɜːk',
      'hand-crafted features': '发音要点：\n• hand 发 /hænd/\n• crafted 发 /ˈkrɑːftɪd/\n• features 发 /ˈfiːtʃəz/\n\n整体读作：hænd ˈkrɑːftɪd ˈfiːtʃəz',
      'interpretable': '发音要点：\n• in- 发 /ɪn/\n• -ter- 发 /tɜː/\n• -pre- 发 /prə/\n• -ta- 发 /tə/\n• -ble 发 /bəl/\n\n整体读作：ɪnˈtɜːprətəbəl',
      'cross-encoder': '发音要点：\n• cross 发 /krɔːs/\n• encoder 发 /ɪnˈkəʊdə/\n\n整体读作：krɔːs ɪnˈkəʊdə',
      'downstream task': '发音要点：\n• downstream 发 /ˈdaʊnstriːm/\n• task 发 /tɑːsk/\n\n整体读作：ˈdaʊnstriːm tɑːsk',
      'back-propagation': '发音要点：\n• back 发 /bæk/\n• pro- 发 /prə/\n• -pa- 发 /pə/\n• -ga- 发 /ɡə/\n• -tion 发 /ʃən/\n\n整体读作：bæk ˌprɒpəˈɡeɪʃən',
      'fine-tuning': '发音要点：\n• fine 发 /faɪn/\n• tuning 发 /ˈtjuːnɪŋ/\n\n整体读作：faɪn ˈtjuːnɪŋ',
      'in-batch negatives': '发音要点：\n• in 发 /ɪn/\n• batch 发 /bætʃ/\n• negatives 发 /ˈneɡətɪvz/\n\n整体读作：ɪn bætʃ ˈneɡətɪvz',
      'generalized linear model': '发音要点：\n• generalized 发 /ˈdʒenərəlaɪzd/\n• linear 发 /ˈlɪniə/\n• model 发 /ˈmɒdəl/\n\n整体读作：ˈdʒenərəlaɪzd ˈlɪniə ˈmɒdəl',
      'non-parametric memory': '发音要点：\n• non 发 /nɒn/\n• parametric 发 /ˌpærəˈmetrɪk/\n• memory 发 /ˈmeməri/\n\n整体读作：nɒn ˌpærəˈmetrɪk ˈmeməri',
      'logistic regression': '发音要点：\n• logistic 发 /ləˈdʒɪstɪk/\n• regression 发 /rɪˈɡreʃən/\n\n整体读作：ləˈdʒɪstɪk rɪˈɡreʃən',
      'multi-horizon forecasting': '发音要点：\n• multi-horizon 发 /ˈmʌlti həˈraɪzən/\n• forecasting 发 /ˈfɔːkɑːstɪŋ/\n\n整体读作：ˈmʌlti həˈraɪzən ˈfɔːkɑːstɪŋ',
      'generalization': '发音要点：\n• gen- 发 /dʒen/\n• -er- 发 /ər/\n• -al- 发 /əl/\n• -i- 发 /ɪ/\n• -za- 发 /zeɪ/\n• -tion 发 /ʃən/\n\n整体读作：ˌdʒenərəlaɪˈzeɪʃən',
      'pre-training': '发音要点：\n• pre 发 /priː/\n• training 发 /ˈtreɪnɪŋ/\n\n整体读作：priː ˈtreɪnɪŋ'
    }
    
    if (guides[lowerWord]) {
      return guides[lowerWord]
    }
    
    // 通用指导
    return '发音建议：\n• 注意重音位置\n• 元音发音要准确\n• 辅音要清晰\n\n建议使用在线词典或发音工具进行练习。'
  },

  // 生成发音提示
  generatePronunciationHint(word) {
    // 改进的发音规则提示
    const pronunciationRules = {
      // 常见单词的发音
      'embedding': 'ɪmˈbedɪŋ',
      'neural': 'ˈnjʊərəl',
      'network': 'ˈnetwɜːk',
      'algorithm': 'ˈælɡərɪðəm',
      'parameter': 'pəˈræmɪtə',
      'gradient': 'ˈɡreɪdiənt',
      'activation': 'ˌæktɪˈveɪʃən',
      'backpropagation': 'ˌbækprɒpəˈɡeɪʃən',
      'convolution': 'ˌkɒnvəˈluːʃən',
      'regularization': 'ˌreɡjʊləraɪˈzeɪʃən',
      'optimization': 'ˌɒptɪmaɪˈzeɪʃən',
      'classification': 'ˌklæsɪfɪˈkeɪʃən',
      'regression': 'rɪˈɡreʃən',
      'clustering': 'ˈklʌstərɪŋ',
      'dimensionality': 'daɪˌmenʃəˈnælɪti',
      'representation': 'ˌreprɪzenˈteɪʃən',
      'architecture': 'ˈɑːkɪtektʃə',
      'framework': 'ˈfreɪmwɜːk',
      'implementation': 'ˌɪmplɪmenˈteɪʃən',
      'evaluation': 'ɪˌvæljuˈeɪʃən',
      // 添加更多常见词汇
      'dot': 'dɒt',
      'product': 'ˈprɒdʌkt',
      'matrix': 'ˈmeɪtrɪks',
      'vector': 'ˈvektə',
      'tensor': 'ˈtensə',
      'layer': 'ˈleɪə',
      'weight': 'weɪt',
      'bias': 'ˈbaɪəs',
      'loss': 'lɒs',
      'accuracy': 'ˈækjərəsi',
      'precision': 'prɪˈsɪʒən',
      'recall': 'rɪˈkɔːl',
      'f1': 'ef wʌn',
      'epoch': 'ˈiːpɒk',
      'batch': 'bætʃ',
      'momentum': 'məˈmentəm',
      'dropout': 'ˈdrɒpaʊt',
      'pooling': 'ˈpuːlɪŋ',
      'padding': 'ˈpædɪŋ',
      'stride': 'straɪd',
      'kernel': 'ˈkɜːnəl',
      'filter': 'ˈfɪltə',
      'feature': 'ˈfiːtʃə',
      'label': 'ˈleɪbəl',
      'dataset': 'ˈdeɪtəset',
      'training': 'ˈtreɪnɪŋ',
      'testing': 'ˈtestɪŋ',
      'validation': 'ˌvælɪˈdeɪʃən',
      'transduction': 'trænsˈdʌkʃən',
      'sparse': 'spɑːs',
      'feature': 'ˈfiːtʃə',
      'recurrent': 'rɪˈkɜːrənt',
      'neural': 'ˈnjʊərəl',
      'network': 'ˈnetwɜːk',
      'connection': 'kəˈnekʃən',
      'hand': 'hænd',
      'crafted': 'ˈkrɑːftɪd',
      'features': 'ˈfiːtʃəz',
      'interpretable': 'ɪnˈtɜːprətəbəl',
      'cross': 'krɔːs',
      'encoder': 'ɪnˈkəʊdə',
      'downstream': 'ˈdaʊnstriːm',
      'task': 'tɑːsk',
      'back': 'bæk',
      'propagation': 'ˌprɒpəˈɡeɪʃən',
      'fine': 'faɪn',
      'tuning': 'ˈtjuːnɪŋ',
      'in': 'ɪn',
      'batch': 'bætʃ',
      'negatives': 'ˈneɡətɪvz',
      'generalized': 'ˈdʒenərəlaɪzd',
      'linear': 'ˈlɪniə',
      'model': 'ˈmɒdəl',
      'non': 'nɒn',
      'parametric': 'ˌpærəˈmetrɪk',
      'memory': 'ˈmeməri',
      'logistic': 'ləˈdʒɪstɪk',
      'regression': 'rɪˈɡreʃən',
      // 常见机器学习词汇发音
      'algorithm': 'ˈælɡərɪðəm',
      'parameter': 'pəˈræmɪtə',
      'gradient': 'ˈɡreɪdiənt',
      'activation': 'ˌæktɪˈveɪʃən',
      'convolution': 'ˌkɒnvəˈluːʃən',
      'clustering': 'ˈklʌstərɪŋ',
      'framework': 'ˈfreɪmwɜːk',
      'evaluation': 'ɪˌvæljuˈeɪʃən',
      // 常见统计词汇发音
      'statistical': 'stəˈtɪstɪkəl',
      'probability': 'ˌprɒbəˈbɪlɪti',
      'distribution': 'ˌdɪstrɪˈbjuːʃən',
      'hypothesis': 'haɪˈpɒθəsɪs',
      'correlation': 'ˌkɒrəˈleɪʃən',
      'covariance': 'kəʊˈveəriəns',
      'variance': 'ˈveəriəns',
      'deviation': 'ˌdiːviˈeɪʃən',
      'confidence': 'ˈkɒnfɪdəns',
      'significance': 'sɪɡˈnɪfɪkəns',
      'forecasting': 'ˈfɔːkɑːstɪŋ',
      'generalization': 'ˌdʒenərəlaɪˈzeɪʃən',
      'pre': 'priː',
      'training': 'ˈtreɪnɪŋ'
    }
    
    const lowerWord = word.toLowerCase()
    
    // 检查是否有精确匹配
    if (pronunciationRules[lowerWord]) {
      return pronunciationRules[lowerWord]
    }
    
    // 通用发音规则
    const generalRules = {
      'a': 'æ 或 ə',
      'e': 'i: 或 e',
      'i': 'aɪ 或 ɪ',
      'o': 'əʊ 或 ɒ',
      'u': 'ju: 或 ʌ',
      'th': 'θ 或 ð',
      'ch': 'tʃ',
      'sh': 'ʃ',
      'ph': 'f',
      'qu': 'kw',
      'tion': 'ʃən',
      'sion': 'ʒən',
      'ing': 'ɪŋ',
      'ed': 'd 或 t',
      'er': 'ə',
      'or': 'ə',
      'ar': 'ɑː',
      'ir': 'ɜː',
      'ur': 'ɜː',
      'oo': 'uː',
      'ee': 'iː',
      'ai': 'eɪ',
      'ay': 'eɪ',
      'oi': 'ɔɪ',
      'oy': 'ɔɪ',
      'ou': 'aʊ',
      'ow': 'aʊ',
      'ea': 'iː 或 e',
      'oa': 'əʊ'
    }
    
    let hint = lowerWord
    Object.keys(generalRules).forEach(key => {
      hint = hint.replace(new RegExp(key, 'g'), `[${generalRules[key]}]`)
    })
    
    return hint
  },



  // 缓存发音
  cachePronunciation(word, audioUrl) {
    if (!this.ttsCache) {
      this.ttsCache = {}
    }
    
    // 限制缓存大小
    const cacheKeys = Object.keys(this.ttsCache)
    if (cacheKeys.length >= this.ttsCacheSize) {
      // 删除最旧的缓存项
      const oldestKey = cacheKeys[0]
      delete this.ttsCache[oldestKey]
    }
    
    this.ttsCache[word] = audioUrl
    console.log('缓存发音:', word, '->', audioUrl)
    
    // 记录发音历史
    this.recordPronunciationHistory(word)
  },

  // 记录发音历史
  recordPronunciationHistory(word) {
    if (!this.pronunciationHistory) {
      this.pronunciationHistory = []
    }
    
    // 移除重复项
    this.pronunciationHistory = this.pronunciationHistory.filter(item => item.word !== word)
    
    // 添加到历史记录开头
    this.pronunciationHistory.unshift({
      word: word,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString()
    })
    
    // 限制历史记录大小
    if (this.pronunciationHistory.length > this.maxHistorySize) {
      this.pronunciationHistory = this.pronunciationHistory.slice(0, this.maxHistorySize)
    }
    
    console.log('记录发音历史:', word)
  },

  // 清除发音缓存
  clearPronunciationCache() {
    this.ttsCache = {}
    console.log('发音缓存已清除')
    wx.showToast({ 
      title: '发音缓存已清除', 
      icon: 'success',
      duration: 1500
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
    
    // 保存发音历史记录到本地存储
    try {
      if (this.pronunciationHistory && this.pronunciationHistory.length > 0) {
        wx.setStorageSync('pronunciationHistory', this.pronunciationHistory)
        console.log('发音历史记录已保存到本地存储')
      }
    } catch (e) {
      console.warn('保存发音历史记录失败:', e)
    }
    
    // 页面卸载时重置用户手动设置标志
    this.setData({
      userSetMeaning: false,
      userSetTranslation: false,
      userSetPaperInfo: false
    })
  }
})