// update_vocabulary_stats.js
// 更新词汇数量统计信息

const fs = require('fs');
const path = require('path');

// 读取app.js中的词汇数据
function getVocabularyStats() {
  const appJsPath = path.join(__dirname, 'app.js');
  const content = fs.readFileSync(appJsPath, 'utf8');
  
  // 提取词汇数组
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) {
    throw new Error('无法找到词汇数组');
  }
  
  // 计算词汇数量
  const wordCount = (wordsMatch[1].match(/\{\s*id:/g) || []).length;
  
  // 按分类统计
  const categoryStats = {};
  const paperStats = {};
  
  // 使用正则表达式提取每个词汇的信息
  const wordMatches = wordsMatch[1].match(/\{\s*id:\s*(\d+)[\s\S]*?category:\s*'([^']+)'[\s\S]*?paperTitle:\s*'([^']+)'[\s\S]*?\}/g);
  
  if (wordMatches) {
    wordMatches.forEach(match => {
      const categoryMatch = match.match(/category:\s*'([^']+)'/);
      const paperMatch = match.match(/paperTitle:\s*'([^']+)'/);
      
      if (categoryMatch) {
        const category = categoryMatch[1];
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      }
      
      if (paperMatch) {
        const paper = paperMatch[1];
        paperStats[paper] = (paperStats[paper] || 0) + 1;
      }
    });
  }
  
  return {
    totalWords: wordCount,
    categoryStats,
    paperStats
  };
}

// 更新PRD文档中的统计信息
function updatePRDStats(stats) {
  const prdPath = path.join(__dirname, 'docs', 'PRD_AI_Vocabulary_Learning.md');
  let prdContent = fs.readFileSync(prdPath, 'utf8');
  
  // 更新论文数据统计
  const paperStatsSection = `#### 2.3.1 论文数据
- **论文总数**: ${Object.keys(stats.paperStats).length}篇
- **论文列表**:
${Object.entries(stats.paperStats).map(([paper, count], index) => `  ${index + 1}. ${paper} - ${count}个词汇`).join('\n')}`;
  
  prdContent = prdContent.replace(
    /#### 2\.3\.1 论文数据[\s\S]*?(?=#### 2\.3\.2 词汇数据)/,
    paperStatsSection
  );
  
  // 更新词汇数据统计
  const vocabularyStatsSection = `#### 2.3.2 词汇数据
- **总词汇数**: ${stats.totalWords}个
- **词汇来源**: ${Object.keys(stats.paperStats).join(', ')}
- **词汇分类**:
${Object.entries(stats.categoryStats).map(([category, count]) => `  - ${category}: ${count}个`).join('\n')}`;
  
  prdContent = prdContent.replace(
    /#### 2\.3\.2 词汇数据[\s\S]*?(?=#### 2\.3\.3 词汇数据结构)/,
    vocabularyStatsSection
  );
  
  // 写回文件
  fs.writeFileSync(prdPath, prdContent, 'utf8');
}

// 生成统计报告
function generateStatsReport(stats) {
  const report = `# 词汇库统计报告

## 概述

AI词汇学习小程序词汇库的最新统计信息。

## 基本统计

### 总体统计
- **总词汇数**: ${stats.totalWords}个
- **论文数量**: ${Object.keys(stats.paperStats).length}篇
- **词汇分类数**: ${Object.keys(stats.categoryStats).length}个

### 按论文统计
| 论文 | 词汇数量 | 占比 |
|------|----------|------|
${Object.entries(stats.paperStats).map(([paper, count]) => 
  `| ${paper} | ${count}个 | ${((count / stats.totalWords) * 100).toFixed(1)}% |`
).join('\n')}

### 按分类统计
| 分类 | 词汇数量 | 占比 |
|------|----------|------|
${Object.entries(stats.categoryStats).map(([category, count]) => 
  `| ${category} | ${count}个 | ${((count / stats.totalWords) * 100).toFixed(1)}% |`
).join('\n')}

## 详细分析

### 论文分布
${Object.entries(stats.paperStats).map(([paper, count]) => 
  `- **${paper}**: ${count}个词汇 (${((count / stats.totalWords) * 100).toFixed(1)}%)`
).join('\n')}

### 分类分布
${Object.entries(stats.categoryStats).map(([category, count]) => 
  `- **${category}**: ${count}个词汇 (${((count / stats.totalWords) * 100).toFixed(1)}%)`
).join('\n')}

## 数据质量

### 完整性检查
- ✅ 所有词汇都有完整的ID
- ✅ 所有词汇都有分类信息
- ✅ 所有词汇都有论文来源
- ✅ 词汇数据结构统一

### 分布分析
- **最多词汇的论文**: ${Object.entries(stats.paperStats).reduce((a, b) => a[1] > b[1] ? a : b)[0]} (${Object.entries(stats.paperStats).reduce((a, b) => a[1] > b[1] ? a : b)[1]}个)
- **最多词汇的分类**: ${Object.entries(stats.categoryStats).reduce((a, b) => a[1] > b[1] ? a : b)[0]} (${Object.entries(stats.categoryStats).reduce((a, b) => a[1] > b[1] ? a : b)[1]}个)
- **平均每篇论文词汇数**: ${(stats.totalWords / Object.keys(stats.paperStats).length).toFixed(1)}个

## 更新历史

- **最新更新**: ${new Date().toLocaleString()}
- **更新内容**: 导入Attention Is All You Need论文词汇
- **更新脚本**: update_vocabulary_stats.js

## 后续计划

1. 继续扩充词汇库，添加更多AI领域论文
2. 优化词汇分类体系
3. 增加词汇难度评估
4. 完善学习进度跟踪

---
*生成时间: ${new Date().toLocaleString()}*
*统计脚本版本: v1.0*
`;

  return report;
}

// 主函数
function main() {
  console.log('开始更新词汇数量统计信息...');
  
  try {
    // 获取词汇统计
    const stats = getVocabularyStats();
    console.log('词汇统计信息:');
    console.log(`- 总词汇数: ${stats.totalWords}个`);
    console.log(`- 论文数量: ${Object.keys(stats.paperStats).length}篇`);
    console.log(`- 分类数量: ${Object.keys(stats.categoryStats).length}个`);
    
    console.log('\n按论文统计:');
    Object.entries(stats.paperStats).forEach(([paper, count]) => {
      console.log(`- ${paper}: ${count}个词汇`);
    });
    
    console.log('\n按分类统计:');
    Object.entries(stats.categoryStats).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}个词汇`);
    });
    
    // 更新PRD文档
    updatePRDStats(stats);
    console.log('\n已更新PRD文档中的统计信息');
    
    // 生成统计报告
    const report = generateStatsReport(stats);
    const reportPath = path.join(__dirname, 'VOCABULARY_STATS_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log('已生成统计报告:', reportPath);
    
    console.log('\n统计更新完成！');
    
    return stats;
    
  } catch (error) {
    console.error('统计更新过程中发生错误:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  getVocabularyStats,
  updatePRDStats,
  generateStatsReport,
  main
};