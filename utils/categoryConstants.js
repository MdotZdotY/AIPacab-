// utils/categoryConstants.js
// 统一的分类常量定义和标准化函数

// 标准分类常量
export const CATEGORIES = {
  GRE: 'GRE高频词',
  TOEFL: 'TOEFL高频词', 
  AI: 'AI专业词汇',
  IELTS: 'IELTS高频词'
}

// 分类名称映射表（旧名称 -> 新名称）
export const CATEGORY_MAPPING = {
  'GRE高频词汇': CATEGORIES.GRE,
  'GRE高频词': CATEGORIES.GRE,  // 添加实际数据中使用的格式
  'TOEFL高频词汇': CATEGORIES.TOEFL,
  'TOEFL高频词': CATEGORIES.TOEFL,  // 添加实际数据中使用的格式
  'AI领域常用及专有词汇': CATEGORIES.AI,
  'AI专业词汇': CATEGORIES.AI,  // 添加实际数据中使用的格式
  'AI领域内常用词和专有词': CATEGORIES.AI,
  'IELTS高频词汇': CATEGORIES.IELTS,
  'IELTS高频词': CATEGORIES.IELTS  // 添加实际数据中使用的格式
}

// 分类显示名称映射（用于UI显示）
export const CATEGORY_DISPLAY_NAMES = {
  [CATEGORIES.GRE]: 'GRE',
  [CATEGORIES.TOEFL]: 'TOEFL',
  [CATEGORIES.AI]: 'AI专业',
  [CATEGORIES.IELTS]: 'IELTS'
}

// 分类筛选器配置
export const CATEGORY_FILTERS = [
  { display: 'GRE', value: CATEGORIES.GRE },
  { display: 'TOEFL', value: CATEGORIES.TOEFL },
  { display: 'IELTS', value: CATEGORIES.IELTS },
  { display: 'AI专业', value: CATEGORIES.AI }
]

// 分类列表（用于选择器等）
export const CATEGORY_LIST = [
  CATEGORIES.GRE,
  CATEGORIES.TOEFL,
  CATEGORIES.IELTS,
  CATEGORIES.AI
]

/**
 * 标准化分类名称
 * @param {string} category - 原始分类名称
 * @returns {string} - 标准化后的分类名称
 */
export function normalizeCategory(category) {
  if (!category) return CATEGORIES.AI // 默认分类
  return CATEGORY_MAPPING[category] || category
}

/**
 * 获取分类的显示名称
 * @param {string} category - 分类名称
 * @returns {string} - 显示名称
 */
export function getCategoryDisplayName(category) {
  return CATEGORY_DISPLAY_NAMES[category] || category
}

/**
 * 批量标准化词汇分类
 * @param {Array} words - 词汇数组
 * @returns {Array} - 标准化后的词汇数组
 */
export function normalizeWordsCategories(words) {
  if (!Array.isArray(words)) return []
  
  return words.map(word => ({
    ...word,
    category: normalizeCategory(word.category)
  }))
}

/**
 * 验证分类名称是否有效
 * @param {string} category - 分类名称
 * @returns {boolean} - 是否有效
 */
export function isValidCategory(category) {
  return CATEGORY_LIST.includes(category)
}

/**
 * 获取所有分类的统计信息
 * @param {Array} words - 词汇数组
 * @returns {Object} - 分类统计信息
 */
export function getCategoryStats(words) {
  const stats = {}
  
  // 初始化所有分类
  CATEGORY_LIST.forEach(category => {
    stats[category] = 0
  })
  
  // 统计每个分类的词汇数量
  words.forEach(word => {
    const normalizedCategory = normalizeCategory(word.category)
    if (stats.hasOwnProperty(normalizedCategory)) {
      stats[normalizedCategory]++
    }
  })
  
  return stats
}

/**
 * 获取分类摘要信息（用于统计页面）
 * @param {Array} words - 词汇数组
 * @returns {Object} - 分类摘要
 */
export function getCategorySummary(words) {
  const stats = getCategoryStats(words)
  
  return {
    gre: { 
      total: stats[CATEGORIES.GRE], 
      mastered: words.filter(w => normalizeCategory(w.category) === CATEGORIES.GRE && w.status === 'mastered').length 
    },
    toefl: { 
      total: stats[CATEGORIES.TOEFL], 
      mastered: words.filter(w => normalizeCategory(w.category) === CATEGORIES.TOEFL && w.status === 'mastered').length 
    },
    ielts: { 
      total: stats[CATEGORIES.IELTS], 
      mastered: words.filter(w => normalizeCategory(w.category) === CATEGORIES.IELTS && w.status === 'mastered').length 
    },
    ai: { 
      total: stats[CATEGORIES.AI], 
      mastered: words.filter(w => normalizeCategory(w.category) === CATEGORIES.AI && w.status === 'mastered').length 
    }
  }
}
