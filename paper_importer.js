// paper_importer.js
// 通用论文导入工具 - 自动扫描vocabulary目录并导入新论文

const fs = require('fs')
const path = require('path')
const VocabularyManager = require('./utils/vocabularyManager.js')

// 模拟微信小程序环境
global.wx = {
  setStorageSync: (key, data) => {
    console.log(`存储数据到 ${key}:`, data.length, '个词汇')
  },
  getStorageSync: (key) => {
    return []
  }
}

// 模拟应用实例
global.getApp = () => ({
  globalData: {
    words: []
  }
})

class PaperImporter {
  constructor() {
    this.vocabularyDir = path.join(__dirname, 'vocabulary')
    this.papersDataPath = path.join(__dirname, 'utils', 'papersData.js')
    this.appJsPath = path.join(__dirname, 'app.js')
    this.vocabularyManager = new VocabularyManager()
    this.importReport = {
      success: [],
      errors: [],
      summary: {}
    }
  }

  // 1. 扫描vocabulary目录，识别新的论文文件对
  scanNewPapers() {
    console.log('=== 开始扫描vocabulary目录 ===')
    
    const files = fs.readdirSync(this.vocabularyDir)
    const paperFiles = {}
    
    // 按论文名分组文件
    files.forEach(file => {
      if (file.endsWith('_Sum.txt') || file.endsWith('_Voca.txt')) {
        const paperName = file.replace(/_Sum\.txt$/, '').replace(/_Voca\.txt$/, '')
        
        if (!paperFiles[paperName]) {
          paperFiles[paperName] = { sum: null, voca: null }
        }
        
        if (file.endsWith('_Sum.txt')) {
          paperFiles[paperName].sum = file
        } else if (file.endsWith('_Voca.txt')) {
          paperFiles[paperName].voca = file
        }
      }
    })
    
    // 找出完整的论文文件对
    const completePapers = []
    for (const [paperName, files] of Object.entries(paperFiles)) {
      if (files.sum && files.voca) {
        completePapers.push({
          name: paperName,
          sumFile: files.sum,
          vocaFile: files.voca
        })
      } else {
        console.warn(`论文 "${paperName}" 缺少文件:`, files)
      }
    }
    
    console.log(`找到 ${completePapers.length} 个完整的论文文件对`)
    return completePapers
  }

  // 2. 解析Sum文件
  parseSummaryFile(filePath) {
    console.log(`解析摘要文件: ${path.basename(filePath)}`)
    
    const content = fs.readFileSync(filePath, 'utf8')
    
    // 提取论文基本信息
    const urlMatch = content.match(/论文原文链接：(.+)/)
    const titleMatch = content.match(/论文名：(.+)/)
    
    // 提取论文背景
    let background = ''
    const backgroundStart = content.indexOf('### 论文背景')
    if (backgroundStart !== -1) {
      const backgroundEnd = content.indexOf('### 论文关键概念', backgroundStart)
      if (backgroundEnd !== -1) {
        background = content.substring(backgroundStart + 6, backgroundEnd).trim()
      }
    }
    
    // 提取关键概念
    let keyConcepts = ''
    const keyConceptsStart = content.indexOf('### 论文关键概念')
    if (keyConceptsStart !== -1) {
      const keyConceptsEnd = content.indexOf('### 论文亮点', keyConceptsStart)
      if (keyConceptsEnd !== -1) {
        keyConcepts = content.substring(keyConceptsStart + 8, keyConceptsEnd).trim()
      }
    }
    
    // 提取论文亮点
    let highlights = ''
    const highlightsStart = content.indexOf('### 论文亮点')
    if (highlightsStart !== -1) {
      highlights = content.substring(highlightsStart + 6).trim()
    }
    
    // 生成摘要（从背景中提取前几句话）
    let abstract = ''
    if (background) {
      const sentences = background.split(/[。！？]/).filter(s => s.trim())
      abstract = sentences.slice(0, 2).join('。') + '。'
    }
    
    return {
      title: titleMatch ? titleMatch[1].trim() : path.basename(filePath, '_Sum.txt'),
      url: urlMatch ? urlMatch[1].trim() : '',
      abstract: abstract,
      background: background,
      keyConcepts: keyConcepts,
      highlights: highlights
    }
  }

  // 3. 解析Voca文件
  parseVocabularyFile(filePath, paperTitle) {
    console.log(`解析词汇文件: ${path.basename(filePath)}`)
    
    const content = fs.readFileSync(filePath, 'utf8')
    return this.parseMarkdownVocabulary(content, paperTitle)
  }

  // 解析Markdown格式的词汇文件
  parseMarkdownVocabulary(content, paperTitle) {
    const words = []
    const lines = content.split('\n')
    let currentCategory = ''
    let currentWord = null
    let wordId = this.getNextWordId()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 检测分类标题
      if (line.includes('GRE高频词')) {
        currentCategory = 'GRE高频词'
        continue
      } else if (line.includes('TOEFL高频词')) {
        currentCategory = 'TOEFL高频词'
        continue
      } else if (line.includes('IELTS高频词')) {
        currentCategory = 'IELTS高频词'
        continue
      } else if (line.includes('AI专业词汇') || line.includes('AI领域常用及专有词汇')) {
        currentCategory = 'AI专业词汇'
        continue
      }

      // 检测新词汇（以* **开头）
      if (line.startsWith('* **') && line.endsWith('**')) {
        // 保存前一个词汇
        if (currentWord && this.validateWord(currentWord)) {
          words.push(this.cleanWord(currentWord))
        }
        
        // 开始新词汇
        const wordText = line.replace('* **', '').replace('**', '').trim()
        currentWord = {
          id: wordId++,
          word: wordText,
          category: currentCategory,
          pronunciation: '',
          meaning: '',
          englishMeaning: '',
          sentence: '',
          translation: '',
          paperTitle: paperTitle,
          difficulty: this.getDifficulty(wordText),
          studyCount: 0,
          correctCount: 0,
          lastStudyTime: null,
          status: 'learning',
          weeklyStudyCount: 0
        }
        continue
      }

      // 解析词汇属性（以* **开头）
      if (line.startsWith('    * **') && currentWord) {
        const content = line.replace('    * **', '').replace('**:', '').trim()
        
        if (content.startsWith('英文释义')) {
          const englishMeaning = content.replace('英文释义', '').trim()
          currentWord.englishMeaning = englishMeaning
        } else if (content.startsWith('中文释义')) {
          const meaning = content.replace('中文释义', '').trim()
          currentWord.meaning = meaning
        } else if (content.startsWith('词性')) {
          const partOfSpeech = content.replace('词性', '').trim()
          currentWord.partOfSpeech = partOfSpeech
        } else if (content.startsWith('音标')) {
          const pronunciation = content.replace('音标', '').trim()
          currentWord.pronunciation = pronunciation
        } else if (content.startsWith('在论文中的例句')) {
          const sentence = content.replace('在论文中的例句 (英文)', '').trim()
          currentWord.sentence = sentence
        } else if (content.startsWith('例句中文翻译')) {
          const translation = content.replace('例句中文翻译', '').trim()
          currentWord.translation = translation
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
    try {
      const content = fs.readFileSync(this.appJsPath, 'utf8')
      const wordsMatch = content.match(/word: '([^']+)'/g)
      if (wordsMatch) {
        return wordsMatch.length + 1
      }
    } catch (error) {
      console.warn('获取词汇ID失败:', error.message)
    }
    return 1
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
      englishMeaning: word.englishMeaning.trim(),
      sentence: word.sentence.trim(),
      translation: word.translation.trim(),
      pronunciation: word.pronunciation.trim(),
      partOfSpeech: word.partOfSpeech.trim()
    }
  }

  // 获取词汇难度
  getDifficulty(word) {
    // 简单的难度判断逻辑
    if (word.length > 10) return 'hard'
    if (word.length > 6) return 'medium'
    return 'easy'
  }

  // 4. 更新论文数据
  updatePapersData(paperInfo) {
    console.log(`更新论文数据: ${paperInfo.title}`)
    
    let content = fs.readFileSync(this.papersDataPath, 'utf8')
    
    // 检查论文是否已存在
    if (content.includes(`title: '${paperInfo.title}'`)) {
      console.log(`论文 "${paperInfo.title}" 已存在，跳过添加`)
      return false
    }
    
    // 获取当前论文数量以确定新ID
    const papersMatch = content.match(/const papers = \[([\s\S]*?)\]/)
    if (!papersMatch) {
      throw new Error('未找到论文数组')
    }
    
    const papersArray = papersMatch[1]
    const existingPapersCount = (papersArray.match(/\{/g) || []).length
    const newId = existingPapersCount + 1
    
    // 构建新论文对象
    const newPaper = {
      id: newId,
      title: paperInfo.title,
      authors: '待补充', // 可以从Sum文件中提取
      year: new Date().getFullYear(), // 可以从Sum文件中提取
      journal: '待补充', // 可以从Sum文件中提取
      abstract: paperInfo.abstract,
      url: paperInfo.url,
      get wordCount() { return `getPaperWordCount('${paperInfo.title}')` },
      category: 'AI专业词汇',
      background: paperInfo.background,
      keyConcepts: paperInfo.keyConcepts,
      highlights: paperInfo.highlights
    }
    
    // 构建论文对象字符串
    const paperObjectStr = `  {
    id: ${newPaper.id},
    title: '${newPaper.title}',
    authors: '${newPaper.authors}',
    year: ${newPaper.year},
    journal: '${newPaper.journal}',
    abstract: '${newPaper.abstract.replace(/'/g, "\\'")}',
    url: '${newPaper.url}',
    get wordCount() { return ${newPaper.wordCount} },
    category: '${newPaper.category}',
    background: \`${newPaper.background.replace(/`/g, '\\`')}\`,
    keyConcepts: \`${newPaper.keyConcepts.replace(/`/g, '\\`')}\`,
    highlights: \`${newPaper.highlights.replace(/`/g, '\\`')}\`
  }`
    
    // 在论文数组末尾添加新论文
    const newContent = content.replace(
      /const papers = \[([\s\S]*?)\]/,
      `const papers = [$1${paperObjectStr}\n]`
    )
    
    // 写入文件
    fs.writeFileSync(this.papersDataPath, newContent, 'utf8')
    console.log(`论文 "${paperInfo.title}" 已添加到论文数据表`)
    
    return true
  }

  // 5. 更新词汇数据
  updateVocabularyData(words, paperTitle) {
    console.log(`更新词汇数据: ${words.length} 个词汇`)
    
    // 读取app.js文件
    let content = fs.readFileSync(this.appJsPath, 'utf8')
    
    // 获取现有词汇数组
    const wordsMatch = content.match(/words: \[([\s\S]*?)\]/)
    if (!wordsMatch) {
      console.warn('未找到词汇数组，可能需要手动添加词汇')
      return false
    }
    
    // 检查是否有重复词汇
    const existingWords = []
    const existingWordsMatch = content.match(/word: '([^']+)'/g)
    if (existingWordsMatch) {
      existingWordsMatch.forEach(match => {
        const word = match.match(/word: '([^']+)'/)[1]
        existingWords.push(word)
      })
    }
    
    // 过滤掉重复词汇
    const newWords = words.filter(word => !existingWords.includes(word.word))
    console.log(`过滤后新增词汇: ${newWords.length} 个`)
    
    if (newWords.length === 0) {
      console.log('没有新的词汇需要添加')
      return false
    }
    
    // 构建新词汇对象字符串
    const wordObjects = newWords.map(word => {
      return `      {
        id: ${word.id},
        word: '${word.word}',
        englishMeaning: '${(word.englishMeaning || '').replace(/'/g, "\\'")}',
        meaning: '${word.meaning.replace(/'/g, "\\'")}',
        partOfSpeech: '${word.partOfSpeech || ''}',
        pronunciation: '${word.pronunciation}',
        sentence: '${word.sentence.replace(/'/g, "\\'")}',
        translation: '${word.translation.replace(/'/g, "\\'")}',
        paperTitle: '${word.paperTitle}',
        category: '${word.category}',
        difficulty: '${word.difficulty}',
        studyCount: ${word.studyCount},
        correctCount: ${word.correctCount},
        lastStudyTime: ${word.lastStudyTime ? `new Date('${word.lastStudyTime}')` : 'null'},
        status: '${word.status}',
        weeklyStudyCount: ${word.weeklyStudyCount}
      }`
    }).join(',\n')
    
    // 在词汇数组末尾添加新词汇
    const newContent = content.replace(
      /words: \[([\s\S]*?)\]/,
      `words: [$1${wordObjects}\n    ]`
    )
    
    // 写入文件
    fs.writeFileSync(this.appJsPath, newContent, 'utf8')
    console.log(`${newWords.length} 个新词汇已添加到词汇库`)
    
    return true
  }

  // 6. 执行完整导入流程
  async importNewPapers() {
    console.log('=== 开始执行论文导入流程 ===')
    
    try {
      // 1. 扫描新论文
      const papers = this.scanNewPapers()
      
      if (papers.length === 0) {
        console.log('没有发现新的论文文件对')
        return this.importReport
      }
      
      // 2. 处理每个论文
      for (const paper of papers) {
        try {
          console.log(`\n--- 处理论文: ${paper.name} ---`)
          
          // 解析Sum文件
          const sumFilePath = path.join(this.vocabularyDir, paper.sumFile)
          const paperInfo = this.parseSummaryFile(sumFilePath)
          
          // 解析Voca文件
          const vocaFilePath = path.join(this.vocabularyDir, paper.vocaFile)
          const words = this.parseVocabularyFile(vocaFilePath, paperInfo.title)
          
          // 更新论文数据
          const paperUpdated = this.updatePapersData(paperInfo)
          
          // 更新词汇数据
          const wordsUpdated = this.updateVocabularyData(words, paperInfo.title)
          
          // 记录成功
          this.importReport.success.push({
            paper: paper.name,
            paperUpdated: paperUpdated,
            wordsCount: words.length,
            wordsUpdated: wordsUpdated
          })
          
          console.log(`论文 "${paper.name}" 处理完成`)
          
        } catch (error) {
          console.error(`处理论文 "${paper.name}" 时出错:`, error.message)
          this.importReport.errors.push({
            paper: paper.name,
            error: error.message
          })
        }
      }
      
      // 生成汇总报告
      this.importReport.summary = {
        totalPapers: papers.length,
        successCount: this.importReport.success.length,
        errorCount: this.importReport.errors.length,
        totalWords: this.importReport.success.reduce((sum, item) => sum + item.wordsCount, 0)
      }
      
      console.log('\n=== 导入流程完成 ===')
      console.log('汇总报告:', this.importReport.summary)
      
      return this.importReport
      
    } catch (error) {
      console.error('导入流程执行失败:', error)
      this.importReport.errors.push({
        paper: '整体流程',
        error: error.message
      })
      return this.importReport
    }
  }

  // 7. 生成导入报告
  generateReport() {
    const reportPath = path.join(__dirname, `PAPER_IMPORT_REPORT_${new Date().toISOString().split('T')[0]}.md`)
    
    let report = `# 论文导入报告

## 导入时间
${new Date().toLocaleString()}

## 汇总信息
- 总论文数: ${this.importReport.summary.totalPapers}
- 成功导入: ${this.importReport.summary.successCount}
- 导入失败: ${this.importReport.summary.errorCount}
- 总词汇数: ${this.importReport.summary.totalWords}

## 成功导入的论文
`
    
    this.importReport.success.forEach(item => {
      report += `### ${item.paper}
- 论文数据更新: ${item.paperUpdated ? '是' : '否'}
- 词汇数量: ${item.wordsCount}
- 词汇数据更新: ${item.wordsUpdated ? '是' : '否'}

`
    })
    
    if (this.importReport.errors.length > 0) {
      report += `## 导入失败的论文
`
      this.importReport.errors.forEach(item => {
        report += `### ${item.paper}
- 错误信息: ${item.error}

`
      })
    }
    
    fs.writeFileSync(reportPath, report, 'utf8')
    console.log(`导入报告已生成: ${reportPath}`)
    
    return reportPath
  }
}

// 导出类
module.exports = PaperImporter

// 如果直接运行此脚本
if (require.main === module) {
  const importer = new PaperImporter()
  
  importer.importNewPapers()
    .then(report => {
      importer.generateReport()
      console.log('论文导入完成！')
    })
    .catch(error => {
      console.error('论文导入失败:', error)
    })
}
