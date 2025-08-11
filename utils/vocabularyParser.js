// utils/vocabularyParser.js
// 词汇解析器 - 用于解析特定格式的词汇文档

class VocabularyParser {
  constructor() {
    this.categories = {
      'GRE高频词汇': 'GRE高频词',
      'TOEFL高频词汇': 'TOEFL高频词', 
      'AI领域常用及专有词汇': 'AI专业词汇'
    }
  }

  // 解析文本文件中的词汇
  parseTextFile(content) {
    const words = []
    const lines = content.split('\n')
    let currentCategory = ''
    let currentWord = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 检测分类标题
      if (line.includes('GRE高频词汇') || line.includes('TOEFL高频词汇') || line.includes('AI领域常用及专有词汇')) {
        currentCategory = this.categories[line] || line
        continue
      }

      // 检测新词汇（以●开头）
      if (line.startsWith('●')) {
        // 保存前一个词汇
        if (currentWord) {
          words.push(currentWord)
        }
        
        // 开始新词汇
        const wordText = line.substring(1).trim()
        currentWord = {
          word: wordText,
          category: currentCategory,
          pronunciation: '',
          meaning: '',
          sentence: '',
          translation: '',
          paperTitle: 'Attention Is All You Need',
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
        } else if (
          content.startsWith('例句翻译:') ||
          content.startsWith('中文翻译:') ||
          content.startsWith('译文:') ||
          (content.startsWith('翻译:') && !content.startsWith('中文解释:'))
        ) {
          let value = content
            .replace('例句翻译:', '')
            .replace('中文翻译:', '')
            .replace('译文:', '')
            .replace('翻译:', '')
            .trim()
          value = value.replace(/\d+$/, '').trim()
          currentWord.translation = value
        }
      }
    }

    // 添加最后一个词汇
    if (currentWord) {
      words.push(currentWord)
    }

    return words
  }

  // 根据词汇确定难度
  getDifficulty(word) {
    // 简单的难度判断逻辑
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
}

module.exports = VocabularyParser