// fix_vocabulary_ids.js
// 修复词汇数据中的ID字段问题

const fs = require('fs')
const path = require('path')

// 修复词汇ID
function fixVocabularyIds() {
  console.log('开始修复词汇ID字段...')
  
  const appJsPath = path.join(__dirname, 'app.js')
  let appJsContent = fs.readFileSync(appJsPath, 'utf8')
  
  // 统计修复的数量
  let fixedCount = 0
  
  // 查找所有包含 $1 的ID字段并修复
  const searchPattern = /id: \$1,/g
  const matches = appJsContent.match(searchPattern)
  
  if (matches) {
    console.log(`找到 ${matches.length} 个需要修复的ID字段`)
    
    // 从第79个ID开始，因为前面的词汇已经有正确的ID
    let currentId = 84 // 从84开始，因为前面已经修复了79-83
    
    // 替换所有的 $1 为正确的ID
    appJsContent = appJsContent.replace(searchPattern, () => {
      const id = currentId++
      fixedCount++
      console.log(`✅ 修复ID: ${id}`)
      return `id: ${id},`
    })
    
    // 写回文件
    fs.writeFileSync(appJsPath, appJsContent, 'utf8')
    
    console.log(`\n修复完成！共修复了 ${fixedCount} 个ID字段。`)
  } else {
    console.log('未找到需要修复的ID字段。')
  }
  
  return fixedCount
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    const fixedCount = fixVocabularyIds()
    console.log(`\n🎉 成功修复了 ${fixedCount} 个词汇ID字段！`)
  } catch (error) {
    console.error('修复失败:', error)
  }
}

module.exports = { fixVocabularyIds }

