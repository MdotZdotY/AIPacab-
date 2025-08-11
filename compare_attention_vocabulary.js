// compare_attention_vocabulary.js
// 比较AttentionIsAllYouNeed_Voca.txt文件与系统中现有词汇的差异

const fs = require('fs')
const path = require('path')

// 解析AttentionIsAllYouNeed_Voca.txt文件
function parseAttentionVocabularyFile() {
  const filePath = path.join(__dirname, 'vocabulary', 'AttentionIsAllYouNeed_Voca.txt')
  const content = fs.readFileSync(filePath, 'utf8')
  
  const words = []
  const lines = content.split('\n')
  
  let currentWord = null
  let currentCategory = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 检查是否是分类标题
    if (line.startsWith('### **') && line.endsWith('**')) {
      currentCategory = line.replace(/### \*\*(.*?)\*\*/, '$1')
      continue
    }
    
    // 检查是否是单词标题
    if (line.startsWith('* **') && line.endsWith('**')) {
      if (currentWord) {
        words.push(currentWord)
      }
      
      const wordName = line.replace(/\* \*\*(.*?)\*\*/, '$1')
      currentWord = {
        word: wordName,
        category: currentCategory,
        pronunciation: '',
        englishMeaning: '',
        meaning: '',
        partOfSpeech: '',
        sentence: '',
        translation: '',
        paperTitle: 'Attention Is All You Need'
      }
      continue
    }
    
    // 解析单词属性
    if (currentWord) {
      if (line.startsWith('* **音标**:')) {
        currentWord.pronunciation = line.replace(/\* \*\*音标\*\*: (.*)/, '$1').trim()
      } else if (line.startsWith('* **英文解释**:')) {
        currentWord.englishMeaning = line.replace(/\* \*\*英文解释\*\*: (.*)/, '$1').trim()
      } else if (line.startsWith('* **中文解释**:')) {
        currentWord.meaning = line.replace(/\* \*\*中文解释\*\*: (.*)/, '$1').trim()
      } else if (line.startsWith('* **词性**:')) {
        currentWord.partOfSpeech = line.replace(/\* \*\*词性\*\*: (.*)/, '$1').trim()
      } else if (line.startsWith('* [cite_start]**例句**:')) {
        // 提取例句，可能跨多行
        let sentence = line.replace(/\* \[cite_start\]\*\*例句\*\*: (.*)/, '$1').trim()
        let j = i + 1
        while (j < lines.length && !lines[j].trim().startsWith('* **') && !lines[j].trim().startsWith('###')) {
          if (lines[j].trim()) {
            sentence += ' ' + lines[j].trim()
          }
          j++
        }
        currentWord.sentence = sentence.replace(/\[cite: \d+\]/, '').replace(/\(使用了其派生词 .*?\)/, '').trim()
      }
    }
  }
  
  // 添加最后一个单词
  if (currentWord) {
    words.push(currentWord)
  }
  
  return words
}

// 从app.js中提取现有的Attention Is All You Need词汇
function extractExistingAttentionWords() {
  const appJsPath = path.join(__dirname, 'app.js')
  const content = fs.readFileSync(appJsPath, 'utf8')
  
  const existingWords = []
  const wordMatches = content.match(/\{[^}]+\}/g)
  
  if (wordMatches) {
    wordMatches.forEach(wordStr => {
      try {
        const cleanWordStr = wordStr.replace(/\n/g, ' ').replace(/\s+/g, ' ')
        const wordObj = eval('(' + cleanWordStr + ')')
        if (wordObj.word && wordObj.paperTitle === 'Attention Is All You Need') {
          existingWords.push(wordObj)
        }
      } catch (e) {
        // 忽略解析错误
      }
    })
  }
  
  return existingWords
}

// 比较词汇并生成报告
function compareVocabulary() {
  console.log('=== 开始比较Attention Is All You Need词汇 ===')
  
  // 解析文件中的词汇
  const fileWords = parseAttentionVocabularyFile()
  console.log(`文件中词汇数量: ${fileWords.length}`)
  
  // 提取系统中现有的词汇
  const existingWords = extractExistingAttentionWords()
  console.log(`系统中现有Attention Is All You Need词汇数量: ${existingWords.length}`)
  
  // 创建现有词汇的集合
  const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()))
  
  // 找出缺失的词汇
  const missingWords = fileWords.filter(word => 
    !existingWordSet.has(word.word.toLowerCase())
  )
  
  console.log(`\n=== 缺失的词汇 (${missingWords.length}个) ===`)
  missingWords.forEach(word => {
    console.log(`- ${word.word} (${word.category})`)
  })
  
  // 检查现有词汇的数据结构完整性
  console.log(`\n=== 现有词汇数据结构检查 ===`)
  const incompleteWords = existingWords.filter(word => {
    return !word.englishMeaning || 
           !word.meaning || 
           !word.partOfSpeech || 
           !word.pronunciation || 
           !word.sentence || 
           !word.translation
  })
  
  console.log(`数据结构不完整的词汇数量: ${incompleteWords.length}`)
  incompleteWords.forEach(word => {
    const missingFields = []
    if (!word.englishMeaning) missingFields.push('英文释义')
    if (!word.meaning) missingFields.push('中文释义')
    if (!word.partOfSpeech) missingFields.push('词性')
    if (!word.pronunciation) missingFields.push('发音')
    if (!word.sentence) missingFields.push('例句')
    if (!word.translation) missingFields.push('例句翻译')
    
    console.log(`- ${word.word}: 缺失 ${missingFields.join(', ')}`)
  })
  
  // 统计信息
  console.log(`\n=== 统计信息 ===`)
  console.log(`文件总词汇数: ${fileWords.length}`)
  console.log(`系统现有词汇数: ${existingWords.length}`)
  console.log(`缺失词汇数: ${missingWords.length}`)
  console.log(`数据结构不完整词汇数: ${incompleteWords.length}`)
  
  return {
    fileWords,
    existingWords,
    missingWords,
    incompleteWords
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    const result = compareVocabulary()
    
    // 输出详细的缺失词汇信息
    if (result.missingWords.length > 0) {
      console.log(`\n=== 详细缺失词汇信息 ===`)
      result.missingWords.forEach(word => {
        console.log(`\n单词: ${word.word}`)
        console.log(`分类: ${word.category}`)
        console.log(`发音: ${word.pronunciation}`)
        console.log(`英文释义: ${word.englishMeaning}`)
        console.log(`中文释义: ${word.meaning}`)
        console.log(`词性: ${word.partOfSpeech}`)
        console.log(`例句: ${word.sentence}`)
        console.log(`论文来源: ${word.paperTitle}`)
      })
    }
  } catch (error) {
    console.error('比较失败:', error)
  }
}

module.exports = {
  parseAttentionVocabularyFile,
  extractExistingAttentionWords,
  compareVocabulary
}

