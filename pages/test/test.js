// pages/test/test.js
const app = getApp()

Page({
  data: {
    words: [],
    currentWord: null,
    currentIndex: 0,
    totalWords: 0,
    progressPercent: 0,
    options: [],
    selectedAnswer: null,
    isAnswered: false,
    isCorrect: false,
    score: 0,
    totalScore: 0
  },

  onLoad() {
    this.loadTestWords()
  },

  onShow() {
    this.loadTestWords()
  },

  // 加载测试词汇
  loadTestWords() {
    const words = app.globalData.words.filter(word => word.studyCount > 0)
    const shuffledWords = this.shuffleArray([...words])
    
    this.setData({
      words: shuffledWords,
      totalWords: shuffledWords.length,
      currentIndex: 0,
      score: 0,
      totalScore: 0
    })

    if (shuffledWords.length > 0) {
      this.setCurrentQuestion()
    }
  },

  // 设置当前题目
  setCurrentQuestion() {
    const { words, currentIndex } = this.data
    if (currentIndex < words.length) {
      const currentWord = words[currentIndex]
      const options = this.generateOptions(currentWord)
      
      this.setData({
        currentWord,
        options,
        selectedAnswer: null,
        isAnswered: false,
        isCorrect: false,
        progressPercent: ((currentIndex + 1) / words.length) * 100
      })
    }
  },

  // 生成选项
  generateOptions(correctWord) {
    const allWords = app.globalData.words
    const options = [correctWord.meaning]
    
    // 随机选择3个错误选项
    const otherWords = allWords.filter(word => word.id !== correctWord.id)
    const shuffled = this.shuffleArray([...otherWords])
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      options.push(shuffled[i].meaning)
    }
    
    return this.shuffleArray(options)
  },

  // 选择答案
  selectAnswer(e) {
    if (this.data.isAnswered) return
    
    const selectedAnswer = e.currentTarget.dataset.answer
    const correctAnswer = this.data.currentWord.meaning
    const isCorrect = selectedAnswer === correctAnswer

    this.setData({
      selectedAnswer,
      isAnswered: true,
      isCorrect,
      score: this.data.score + (isCorrect ? 1 : 0),
      totalScore: this.data.totalScore + 1
    })

    // 更新学习记录
    this.updateStudyRecord(isCorrect)

    // 延迟后进入下一题
    setTimeout(() => {
      this.nextQuestion()
    }, 1500)
  },

  // 更新学习记录
  updateStudyRecord(isCorrect) {
    const { currentWord } = this.data
    const wordIndex = app.globalData.words.findIndex(w => w.id === currentWord.id)
    
    if (wordIndex !== -1) {
      app.globalData.words[wordIndex].studyCount++
      if (isCorrect) {
        app.globalData.words[wordIndex].correctCount++
      }
      app.globalData.words[wordIndex].lastStudyTime = new Date().toISOString()
    }
  },

  // 下一题
  nextQuestion() {
    const { currentIndex, totalWords } = this.data
    if (currentIndex < totalWords - 1) {
      this.setData({
        currentIndex: currentIndex + 1
      })
      this.setCurrentQuestion()
    } else {
      // 测试完成
      this.showTestResult()
    }
  },

  // 显示测试结果
  showTestResult() {
    const { score, totalScore } = this.data
    const accuracy = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
    
    wx.showModal({
      title: '测试完成',
      content: `得分：${score}/${totalScore}\n正确率：${accuracy}%\n${this.getResultMessage(accuracy)}`,
      confirmText: '重新测试',
      cancelText: '返回首页',
      success: (res) => {
        if (res.confirm) {
          this.loadTestWords()
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  },

  // 获取结果消息
  getResultMessage(accuracy) {
    if (accuracy >= 90) return '优秀！继续保持！'
    if (accuracy >= 80) return '良好，还有提升空间'
    if (accuracy >= 60) return '及格，需要多加练习'
    return '需要加强学习，建议复习基础词汇'
  },

  // 工具函数：数组洗牌
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  },

  // 返回首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})