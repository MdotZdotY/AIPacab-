// utils/vocabularyManager.js
// 词汇管理工具 - 用于处理词汇库的更新和管理

const { normalizeCategory, CATEGORY_MAPPING } = require('./categoryConstants.js')

class VocabularyManager {
  constructor() {
    // 使用统一的分类映射
    this.categories = CATEGORY_MAPPING
  }

  // 解析新词汇文件
  parseVocabularyFile(content, paperTitle = '') {
    const words = []
    const lines = content.split('\n')
    let currentCategory = ''
    let currentWord = null
    let wordId = this.getNextWordId()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 检测分类标题
      if (line.includes('GRE高频词汇') || line.includes('TOEFL高频词汇') || line.includes('AI领域常用及专有词汇') || line.includes('IELTS高频词汇')) {
        currentCategory = normalizeCategory(line)
        continue
      }

      // 检测新词汇（以●开头）
      if (line.startsWith('●')) {
        // 保存前一个词汇
        if (currentWord && this.validateWord(currentWord)) {
          words.push(this.cleanWord(currentWord))
        }
        
        // 开始新词汇
        const wordText = line.substring(1).trim()
        currentWord = {
          id: wordId++,
          word: wordText,
          category: currentCategory,
          pronunciation: '',
          meaning: '',
          sentence: '',
          translation: '',
          paperTitle: paperTitle || 'Unknown Paper',
          difficulty: this.getDifficulty(wordText),
                  studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning', // learning, review, mastered
        weeklyStudyCount: 0
        }
        continue
      }

      // 解析词汇属性（以○开头）
      if (line.startsWith('○') && currentWord) {
        const content = line.substring(1).trim()
        
        if (content.startsWith('音标:')) {
          currentWord.pronunciation = content.replace('音标:', '').trim()
        } else if (content.startsWith('英文解释:')) {
          // 英文解释通常很长，我们只取主要部分
          const explanation = content.replace('英文解释:', '').trim()
          // 移除重复的数字
          currentWord.meaning = explanation.replace(/\d+/g, '').trim()
        } else if (content.startsWith('中文解释:')) {
          currentWord.meaning = content.replace('中文解释:', '').trim()
        } else if (content.startsWith('词性:')) {
          // 词性信息可以保留在meaning中
          const partOfSpeech = content.replace('词性:', '').trim()
          if (currentWord.meaning) {
            currentWord.meaning += ` (${partOfSpeech})`
          }
        } else if (content.startsWith('例句:')) {
          currentWord.sentence = content.replace('例句:', '').trim()
          // 移除重复的数字
          currentWord.sentence = currentWord.sentence.replace(/\d+/g, '').trim()
        }
      }
    }

    // 添加最后一个词汇
    if (currentWord && this.validateWord(currentWord)) {
      words.push(this.cleanWord(currentWord))
    }

    return words
  }

  // 获取下一个词汇ID
  getNextWordId() {
    const app = getApp()
    const existingWords = app.globalData.words || []
    if (existingWords.length === 0) return 1
    
    // 确保所有ID都是数字类型
    const validIds = existingWords
      .filter(word => word && word.id && typeof word.id === 'number')
      .map(w => w.id)
    
    if (validIds.length === 0) return 1
    
    // 找到最大ID并加1
    const maxId = Math.max(...validIds)
    return maxId + 1
  }

  // 添加新词汇到词汇库
  addNewWords(newWords) {
    const app = getApp()
    const existingWords = app.globalData.words || []
    
    // 检查重复词汇
    const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()))
    const uniqueNewWords = newWords.filter(word => 
      !existingWordSet.has(word.word.toLowerCase())
    )

    // 为新词汇分配唯一ID
    let nextId = this.getNextWordId()
    const wordsWithIds = uniqueNewWords.map(word => ({
      ...word,
      id: nextId++,
      studyCount: 0,
      correctCount: 0,
      lastStudyTime: null,
      status: 'learning',
      weeklyStudyCount: 0
    }))

    // 添加新词汇
    const updatedWords = [...existingWords, ...wordsWithIds]
    app.globalData.words = updatedWords

    // 保存到本地存储
    try {
      wx.setStorageSync('words', updatedWords)
      console.log('成功保存', updatedWords.length, '个词汇到本地存储')
      
      // 触发统计更新事件
      this.notifyStatsUpdate()
    } catch (e) {
      console.error('保存词汇数据失败:', e)
      throw new Error('保存失败，请重试')
    }

    return {
      total: updatedWords.length,
      added: wordsWithIds.length,
      skipped: newWords.length - wordsWithIds.length
    }
  }

  // 更新现有词汇
  updateExistingWords(updatedWords) {
    const app = getApp()
    const existingWords = app.globalData.words || []
    
    const updatedWordsMap = new Map(updatedWords.map(w => [w.word.toLowerCase(), w]))
    
    const result = existingWords.map(word => {
      const updatedWord = updatedWordsMap.get(word.word.toLowerCase())
      return updatedWord || word
    })

    app.globalData.words = result
    return result.length
  }

  // 删除词汇
  deleteWords(wordIds) {
    const app = getApp()
    const existingWords = app.globalData.words || []
    
    const wordIdSet = new Set(wordIds)
    const filteredWords = existingWords.filter(word => !wordIdSet.has(word.id))
    
    app.globalData.words = filteredWords
    return filteredWords.length
  }

  // 根据词汇确定难度
  getDifficulty(word) {
    if (word.length <= 5) return 'easy'
    if (word.length <= 8) return 'medium'
    return 'hard'
  }

  // 验证词汇数据
  validateWord(word) {
    return word.word && word.meaning && word.category
  }

  // 清理词汇数据
  cleanWord(word) {
    return {
      ...word,
      word: word.word.trim(),
      meaning: word.meaning.trim(),
      sentence: word.sentence.trim(),
      pronunciation: word.pronunciation.trim(),
      category: word.category.trim()
    }
  }

  // 导出词汇库
  exportVocabulary() {
    const app = getApp()
    return app.globalData.words || []
  }

  // 导入词汇库
  importVocabulary(words) {
    const app = getApp()
    app.globalData.words = words
    return words.length
  }

  // 获取词汇统计
  getVocabularyStats() {
    const app = getApp()
    const words = app.globalData.words || []
    
    const stats = {
      total: words.length,
      byCategory: {},
      byDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      },
      byPaper: {}
    }

    words.forEach(word => {
      // 按分类统计
      if (!stats.byCategory[word.category]) {
        stats.byCategory[word.category] = 0
      }
      stats.byCategory[word.category]++

      // 按难度统计
      stats.byDifficulty[word.difficulty]++

      // 按论文统计
      if (!stats.byPaper[word.paperTitle]) {
        stats.byPaper[word.paperTitle] = 0
      }
      stats.byPaper[word.paperTitle]++
    })

    return stats
  }

  // 搜索词汇
  searchWords(keyword, category = '', difficulty = '') {
    const app = getApp()
    const words = app.globalData.words || []
    
    return words.filter(word => {
      const matchesKeyword = !keyword || 
        word.word.toLowerCase().includes(keyword.toLowerCase()) ||
        word.meaning.toLowerCase().includes(keyword.toLowerCase()) ||
        word.sentence.toLowerCase().includes(keyword.toLowerCase())
      
      const matchesCategory = !category || word.category === category
      const matchesDifficulty = !difficulty || word.difficulty === difficulty
      
      return matchesKeyword && matchesCategory && matchesDifficulty
    })
  }

  // 通知统计更新
  notifyStatsUpdate() {
    // 触发自定义事件，通知其他页面更新统计
    if (typeof wx !== 'undefined' && wx.getAppBaseInfo) {
      try {
        const eventChannel = wx.getAppBaseInfo().eventChannel
        if (eventChannel) {
          eventChannel.emit('vocabularyUpdated', {
            timestamp: Date.now(),
            action: 'addNewWords'
          })
        }
      } catch (e) {
        console.log('事件通知失败，但不影响功能:', e)
      }
    }
  }
}

module.exports = VocabularyManager