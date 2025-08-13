// standardize_categories.js
// 标准化词汇分类名称

const fs = require('fs');
const path = require('path');

// 标准化分类名称
function standardizeCategories() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  // 获取现有词汇
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) {
    throw new Error('未找到词汇数组');
  }
  
  const existingWordsStr = wordsMatch[1];
  const existingWords = eval('[' + existingWordsStr + ']');
  
  // 标准化分类名称
  const standardizedWords = existingWords.map(word => {
    let category = word.category || '';
    
    // 标准化分类名称
    if (category.includes('GRE高频词')) {
      category = 'GRE高频词';
    } else if (category.includes('TOEFL高频词')) {
      category = 'TOEFL高频词';
    } else if (category.includes('IELTS高频词')) {
      category = 'IELTS高频词';
    } else if (category.includes('AI专业词汇') || category.includes('AI领域专有词')) {
      category = 'AI专业词汇';
    }
    
    return {
      ...word,
      category: category
    };
  });
  
  console.log(`标准化前词汇数量: ${existingWords.length}`);
  console.log(`标准化后词汇数量: ${standardizedWords.length}`);
  
  // 统计分类
  const categoryStats = {};
  standardizedWords.forEach(word => {
    if (!categoryStats[word.category]) {
      categoryStats[word.category] = 0;
    }
    categoryStats[word.category]++;
  });
  
  console.log('分类统计:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`- ${category}: ${count}个`);
  });
  
  // 构建新的词汇数组
  const newWordsArrayStr = standardizedWords.map(word => {
    return `      {
        id: ${word.id},
        word: '${word.word}',
        englishMeaning: '${(word.englishMeaning || '').replace(/'/g, "\\'")}',
        meaning: '${(word.meaning || '').replace(/'/g, "\\'")}',
        partOfSpeech: '${word.partOfSpeech || ''}',
        pronunciation: '${word.pronunciation || ''}',
        sentence: '${(word.sentence || '').replace(/'/g, "\\'")}',
        translation: '${(word.translation || '').replace(/'/g, "\\'")}',
        paperTitle: '${word.paperTitle || ''}',
        category: '${word.category || ''}',
        difficulty: '${word.difficulty || 'medium'}',
        studyCount: ${word.studyCount || 0},
        correctCount: ${word.correctCount || 0},
        lastStudyTime: ${word.lastStudyTime ? `new Date('${word.lastStudyTime}')` : 'null'},
        status: '${word.status || 'learning'}',
        weeklyStudyCount: ${word.weeklyStudyCount || 0}
      }`;
  }).join(',\n');
  
  // 替换词汇数组
  const newContent = content.replace(
    /words:\s*\[([\s\S]*?)\]/,
    `words: [\n${newWordsArrayStr}\n    ]`
  );
  
  // 写入文件
  fs.writeFileSync(appJsPath, newContent, 'utf8');
  console.log(`成功标准化app.js中的分类名称`);
  
  return standardizedWords;
}

// 生成标准化报告
function generateStandardizeReport(standardizedWords) {
  const categoryStats = {};
  standardizedWords.forEach(word => {
    if (!categoryStats[word.category]) {
      categoryStats[word.category] = 0;
    }
    categoryStats[word.category]++;
  });
  
  const report = `# 词汇分类标准化报告

## 概述

成功标准化了词汇库中的分类名称，确保分类的一致性。

## 标准化结果

### 基本统计
- **总词汇数量**: ${standardizedWords.length}个
- **标准化分类**: 4个主要分类

### 分类统计
${Object.entries(categoryStats).map(([category, count]) => `- **${category}**: ${count}个`).join('\n')}

### 标准化规则
- **GRE高频词**: 包含"GRE高频词"的所有分类
- **TOEFL高频词**: 包含"TOEFL高频词"的所有分类  
- **IELTS高频词**: 包含"IELTS高频词"的所有分类
- **AI专业词汇**: 包含"AI专业词汇"或"AI领域专有词"的所有分类

## 技术实现

### 标准化流程
1. 读取app.js中的词汇数组
2. 应用分类名称标准化规则
3. 更新词汇分类字段
4. 保存到app.js文件
5. 生成标准化报告

### 标准化规则
- 统一GRE高频词分类名称
- 统一TOEFL高频词分类名称
- 统一IELTS高频词分类名称
- 统一AI专业词汇分类名称

## 注意事项

- 所有词汇的分类名称已标准化
- 词汇的其他信息保持不变
- 标准化过程不会影响词汇的学习状态

## 后续操作

1. 在微信开发者工具中重新编译小程序
2. 测试词汇分类显示
3. 检查统计页面的分类统计
4. 验证词汇筛选功能

---
*标准化时间: ${new Date().toLocaleString()}*
*标准化脚本版本: v1.0*
`;

  return report;
}

// 主函数
function main() {
  try {
    console.log('=== 开始标准化词汇分类名称 ===');
    
    // 标准化分类
    console.log('1. 标准化词汇分类名称...');
    const standardizedWords = standardizeCategories();
    
    // 生成报告
    console.log('2. 生成标准化报告...');
    const report = generateStandardizeReport(standardizedWords);
    
    // 保存报告
    const reportPath = path.join(__dirname, 'CATEGORY_STANDARDIZE_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log('=== 标准化完成 ===');
    console.log(`成功标准化${standardizedWords.length}个词汇的分类名称`);
    console.log(`详细报告已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('标准化失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  standardizeCategories,
  generateStandardizeReport
};

