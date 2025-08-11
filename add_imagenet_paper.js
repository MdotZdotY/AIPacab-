// add_imagenet_paper.js
// 将ImageNet Classification with Deep Convolutional Neural Networks论文添加到论文数据表中

const fs = require('fs')
const path = require('path')

// 读取papersData.js文件
function readPapersData() {
  const papersDataPath = path.join(__dirname, 'utils', 'papersData.js')
  return fs.readFileSync(papersDataPath, 'utf8')
}

// 写入papersData.js文件
function writePapersData(content) {
  const papersDataPath = path.join(__dirname, 'utils', 'papersData.js')
  fs.writeFileSync(papersDataPath, content, 'utf8')
}

// 解析ImageNet论文摘要文件
function parseImageNetSummary() {
  const filePath = path.join(__dirname, 'vocabulary', 'ImageNet Classification with Deep Convolutional Neural Networks_Sum.txt')
  const content = fs.readFileSync(filePath, 'utf8')
  
  // 提取论文基本信息
  const titleMatch = content.match(/\* 论文名 \(Title\): (.+)/)
  const yearMatch = content.match(/\* 论文发表时间 \(Publication Time\): (\d+)年/)
  const urlMatch = content.match(/\* 论文地址 \(URL\): (.+)/)
  
  // 提取摘要内容 - 查找"论文概要"部分
  let abstract = ''
  const abstractStart = content.indexOf('论文概要')
  if (abstractStart !== -1) {
    const abstractEnd = content.indexOf('论文背景解读', abstractStart)
    if (abstractEnd !== -1) {
      abstract = content.substring(abstractStart + 4, abstractEnd).trim()
    }
  }
  
  // 提取背景内容 - 查找"论文背景解读"部分
  let background = ''
  const backgroundStart = content.indexOf('论文背景解读')
  if (backgroundStart !== -1) {
    const backgroundEnd = content.indexOf('论文关键概念', backgroundStart)
    if (backgroundEnd !== -1) {
      background = content.substring(backgroundStart + 6, backgroundEnd).trim()
    }
  }
  
  // 提取关键概念 - 查找"论文关键概念"部分
  let keyConcepts = ''
  const keyConceptsStart = content.indexOf('论文关键概念')
  if (keyConceptsStart !== -1) {
    const keyConceptsEnd = content.indexOf('论文亮点', keyConceptsStart)
    if (keyConceptsEnd !== -1) {
      keyConcepts = content.substring(keyConceptsStart + 6, keyConceptsEnd).trim()
    }
  }
  
  // 提取论文亮点 - 查找"论文亮点"部分
  let highlights = ''
  const highlightsStart = content.indexOf('论文亮点')
  if (highlightsStart !== -1) {
    highlights = content.substring(highlightsStart + 4).trim()
  }
  
  return {
    title: titleMatch ? titleMatch[1].trim() : 'ImageNet Classification with Deep Convolutional Neural Networks',
    year: yearMatch ? parseInt(yearMatch[1]) : 2012,
    url: urlMatch ? urlMatch[1].trim() : 'https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf',
    abstract: abstract || '这篇论文提出了一种名为AlexNet的深度卷积神经网络架构，在ImageNet大规模视觉识别挑战赛中取得了突破性成果。',
    background: background,
    keyConcepts: keyConcepts,
    highlights: highlights
  }
}

// 添加ImageNet论文到papersData.js
function addImageNetPaper() {
  console.log('=== 开始添加ImageNet论文到论文数据表 ===')
  
  // 读取现有论文数据
  let content = readPapersData()
  
  // 解析ImageNet论文摘要
  const imageNetData = parseImageNetSummary()
  console.log('解析ImageNet论文摘要完成')
  
  // 获取当前论文数量以确定新ID
  const papersMatch = content.match(/const papers = \[([\s\S]*?)\]/)
  if (!papersMatch) {
    console.error('未找到论文数组')
    return
  }
  
  const papersArray = papersMatch[1]
  const existingPapersCount = (papersArray.match(/\{/g) || []).length
  const newId = existingPapersCount + 1
  
  console.log(`现有论文数量: ${existingPapersCount}`)
  console.log(`新论文ID: ${newId}`)
  
  // 构建新的论文对象
  const newPaper = {
    id: newId,
    title: imageNetData.title,
    authors: 'Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton',
    year: imageNetData.year,
    journal: 'NIPS',
    abstract: imageNetData.abstract,
    url: imageNetData.url,
    wordCount: 28, // 从该论文提取的词汇数量
    category: 'AI专业词汇',
    background: imageNetData.background,
    keyConcepts: imageNetData.keyConcepts,
    highlights: imageNetData.highlights
  }
  
  // 格式化新论文对象为JavaScript代码
  const newPaperCode = `  {
    id: ${newPaper.id},
    title: '${newPaper.title}',
    authors: '${newPaper.authors}',
    year: ${newPaper.year},
    journal: '${newPaper.journal}',
    abstract: '${newPaper.abstract.replace(/'/g, "\\'")}',
    url: '${newPaper.url}',
    wordCount: ${newPaper.wordCount},
    category: '${newPaper.category}',
    background: \`${newPaper.background.replace(/`/g, '\\`')}\`,
    keyConcepts: \`${newPaper.keyConcepts.replace(/`/g, '\\`')}\`,
    highlights: \`${newPaper.highlights.replace(/`/g, '\\`')}\`
  }`
  
  // 在现有论文数组的末尾添加新论文
  const updatedContent = content.replace(
    /const papers = \[([\s\S]*?)\]/,
    `const papers = [$1${existingPapersCount > 0 ? ',' : ''}\n${newPaperCode}\n]`
  )
  
  // 写入文件
  writePapersData(updatedContent)
  
  console.log('=== ImageNet论文添加完成 ===')
  console.log(`论文标题: ${newPaper.title}`)
  console.log(`作者: ${newPaper.authors}`)
  console.log(`年份: ${newPaper.year}`)
  console.log(`词汇数: ${newPaper.wordCount}`)
  console.log(`分类: ${newPaper.category}`)
  
  return newPaper
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    const result = addImageNetPaper()
    console.log('\n添加结果:')
    console.log(`- 论文ID: ${result.id}`)
    console.log(`- 论文标题: ${result.title}`)
    console.log(`- 词汇数量: ${result.wordCount}`)
  } catch (error) {
    console.error('添加失败:', error)
  }
}

module.exports = {
  addImageNetPaper,
  parseImageNetSummary
}
