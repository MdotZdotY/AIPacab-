// utils/dataCleanup.js
// 数据清理工具 - 用于清理和标准化历史数据

const { normalizeWordsCategories, getCategoryStats } = require('./categoryConstants.js')

/**
 * 数据清理工具类
 */
class DataCleanup {
  constructor() {
    this.cleanupLog = []
  }

  /**
   * 清理词汇数据中的分类名称
   * @param {Array} words - 词汇数组
   * @returns {Object} - 清理结果
   */
  cleanVocabularyCategories(words) {
    console.log('开始清理词汇分类数据...')
    
    if (!Array.isArray(words)) {
      console.warn('词汇数据格式错误，跳过清理')
      return { success: false, message: '词汇数据格式错误' }
    }

    const originalCount = words.length
    const originalCategories = this.getUniqueCategories(words)
    
    console.log('清理前分类统计:', originalCategories)
    
    // 标准化分类名称
    const cleanedWords = normalizeWordsCategories(words)
    
    // 检查清理结果
    const cleanedCategories = this.getUniqueCategories(cleanedWords)
    const changedCount = this.countChangedCategories(words, cleanedWords)
    
    console.log('清理后分类统计:', cleanedCategories)
    console.log(`共清理了 ${changedCount} 个词汇的分类名称`)
    
    // 记录清理日志
    this.cleanupLog.push({
      timestamp: new Date().toISOString(),
      operation: 'cleanVocabularyCategories',
      originalCount,
      changedCount,
      originalCategories,
      cleanedCategories
    })
    
    return {
      success: true,
      cleanedWords,
      originalCount,
      changedCount,
      originalCategories,
      cleanedCategories,
      message: `成功清理了 ${changedCount} 个词汇的分类名称`
    }
  }

  /**
   * 获取唯一的分类列表
   * @param {Array} words - 词汇数组
   * @returns {Object} - 分类统计
   */
  getUniqueCategories(words) {
    const categories = {}
    words.forEach(word => {
      if (word.category) {
        categories[word.category] = (categories[word.category] || 0) + 1
      }
    })
    return categories
  }

  /**
   * 统计分类名称发生变化的词汇数量
   * @param {Array} originalWords - 原始词汇数组
   * @param {Array} cleanedWords - 清理后的词汇数组
   * @returns {number} - 变化数量
   */
  countChangedCategories(originalWords, cleanedWords) {
    let changedCount = 0
    for (let i = 0; i < originalWords.length; i++) {
      if (originalWords[i].category !== cleanedWords[i].category) {
        changedCount++
      }
    }
    return changedCount
  }

  /**
   * 验证数据完整性
   * @param {Array} words - 词汇数组
   * @returns {Object} - 验证结果
   */
  validateDataIntegrity(words) {
    console.log('开始验证数据完整性...')
    
    const issues = []
    const stats = {
      totalWords: words.length,
      validWords: 0,
      invalidWords: 0,
      missingFields: {},
      duplicateIds: [],
      invalidCategories: []
    }

    const usedIds = new Set()
    const categoryStats = getCategoryStats(words)

    words.forEach((word, index) => {
      let isValid = true
      
      // 检查必需字段
      const requiredFields = ['id', 'word', 'meaning', 'category']
      requiredFields.forEach(field => {
        if (!word[field]) {
          issues.push(`词汇 ${index + 1}: 缺少必需字段 "${field}"`)
          stats.missingFields[field] = (stats.missingFields[field] || 0) + 1
          isValid = false
        }
      })

      // 检查重复ID
      if (word.id && usedIds.has(word.id)) {
        stats.duplicateIds.push(word.id)
        issues.push(`词汇 ${index + 1}: 重复的ID "${word.id}"`)
        isValid = false
      } else if (word.id) {
        usedIds.add(word.id)
      }

      // 检查分类有效性
      if (word.category && !categoryStats.hasOwnProperty(word.category)) {
        stats.invalidCategories.push(word.category)
        issues.push(`词汇 ${index + 1}: 无效的分类 "${word.category}"`)
        isValid = false
      }

      if (isValid) {
        stats.validWords++
      } else {
        stats.invalidWords++
      }
    })

    console.log('数据完整性验证完成:', stats)
    
    return {
      success: issues.length === 0,
      stats,
      issues,
      message: issues.length === 0 ? '数据完整性验证通过' : `发现 ${issues.length} 个问题`
    }
  }

  /**
   * 修复数据问题
   * @param {Array} words - 词汇数组
   * @returns {Object} - 修复结果
   */
  fixDataIssues(words) {
    console.log('开始修复数据问题...')
    
    const fixedWords = []
    const fixes = []
    let nextId = 1
    const usedIds = new Set()

    words.forEach((word, index) => {
      const fixedWord = { ...word }
      let hasFixes = false

      // 修复缺失的ID
      if (!fixedWord.id || typeof fixedWord.id !== 'number') {
        while (usedIds.has(nextId)) {
          nextId++
        }
        fixedWord.id = nextId
        usedIds.add(nextId)
        fixes.push(`词汇 ${index + 1}: 修复缺失的ID -> ${fixedWord.id}`)
        hasFixes = true
        nextId++
      } else if (usedIds.has(fixedWord.id)) {
        // 修复重复ID
        while (usedIds.has(nextId)) {
          nextId++
        }
        const oldId = fixedWord.id
        fixedWord.id = nextId
        usedIds.add(nextId)
        fixes.push(`词汇 ${index + 1}: 修复重复ID ${oldId} -> ${fixedWord.id}`)
        hasFixes = true
        nextId++
      } else {
        usedIds.add(fixedWord.id)
      }

      // 修复缺失的字段
      if (!fixedWord.word) {
        fixedWord.word = `词汇_${fixedWord.id}`
        fixes.push(`词汇 ${index + 1}: 修复缺失的词汇 -> ${fixedWord.word}`)
        hasFixes = true
      }

      if (!fixedWord.meaning) {
        fixedWord.meaning = '含义待补充'
        fixes.push(`词汇 ${index + 1}: 修复缺失的含义`)
        hasFixes = true
      }

      if (!fixedWord.category) {
        fixedWord.category = 'AI专业词汇'
        fixes.push(`词汇 ${index + 1}: 修复缺失的分类 -> ${fixedWord.category}`)
        hasFixes = true
      }

      // 标准化分类名称
      const originalCategory = fixedWord.category
      fixedWord.category = normalizeCategory(fixedWord.category)
      if (originalCategory !== fixedWord.category) {
        fixes.push(`词汇 ${index + 1}: 标准化分类 "${originalCategory}" -> "${fixedWord.category}"`)
        hasFixes = true
      }

      // 确保其他字段有默认值
      fixedWord.studyCount = fixedWord.studyCount || 0
      fixedWord.correctCount = fixedWord.correctCount || 0
      fixedWord.status = fixedWord.status || 'learning'
      fixedWord.weeklyStudyCount = fixedWord.weeklyStudyCount || 0

      fixedWords.push(fixedWord)
    })

    console.log(`数据修复完成，共修复 ${fixes.length} 个问题`)
    
    return {
      success: true,
      fixedWords,
      fixes,
      fixCount: fixes.length,
      message: `成功修复了 ${fixes.length} 个数据问题`
    }
  }

  /**
   * 执行完整的数据清理流程
   * @param {Array} words - 词汇数组
   * @returns {Object} - 清理结果
   */
  performFullCleanup(words) {
    console.log('开始执行完整的数据清理流程...')
    
    const results = {
      originalCount: words.length,
      steps: [],
      finalWords: words,
      success: true
    }

    try {
      // 步骤1: 验证数据完整性
      const validation = this.validateDataIntegrity(words)
      results.steps.push({
        step: 'validateDataIntegrity',
        result: validation
      })

      // 步骤2: 修复数据问题
      const fixResult = this.fixDataIssues(words)
      results.steps.push({
        step: 'fixDataIssues',
        result: fixResult
      })
      results.finalWords = fixResult.fixedWords

      // 步骤3: 清理分类名称
      const cleanupResult = this.cleanVocabularyCategories(results.finalWords)
      results.steps.push({
        step: 'cleanVocabularyCategories',
        result: cleanupResult
      })
      results.finalWords = cleanupResult.cleanedWords

      // 步骤4: 最终验证
      const finalValidation = this.validateDataIntegrity(results.finalWords)
      results.steps.push({
        step: 'finalValidation',
        result: finalValidation
      })

      results.success = finalValidation.success
      results.message = `数据清理完成，共处理 ${results.originalCount} 个词汇`

    } catch (error) {
      console.error('数据清理过程中发生错误:', error)
      results.success = false
      results.message = `数据清理失败: ${error.message}`
    }

    return results
  }

  /**
   * 获取清理日志
   * @returns {Array} - 清理日志
   */
  getCleanupLog() {
    return this.cleanupLog
  }

  /**
   * 清除清理日志
   */
  clearCleanupLog() {
    this.cleanupLog = []
  }
}

module.exports = DataCleanup
