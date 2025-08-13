// fix_informer_import.js
// 修复Informer论文概要解析问题

const fs = require('fs');
const path = require('path');

// 修复解析Informer论文概要
function parseInformerSummary() {
  const informerFile = path.join(__dirname, 'docs', 'Informer Beyond Efficient Transformer for Long Sequence Time-Series Forecasting.txt');
  const content = fs.readFileSync(informerFile, 'utf8');
  
  let background = '';
  let keyConcepts = '';
  let highlights = '';
  
  const lines = content.split('\n');
  let currentSection = '';
  let inSummarySection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测论文概要部分的开始
    if (line.includes('### **2. 论文概要**')) {
      inSummarySection = true;
      continue;
    }
    
    // 检测词汇清单部分，结束概要解析
    if (line.includes('### **3. 论文词汇清单**')) {
      break;
    }
    
    // 如果不在概要部分，跳过
    if (!inSummarySection) {
      continue;
    }
    
    // 检测各个子部分
    if (line.includes('#### **论文背景解读**')) {
      currentSection = 'background';
      continue;
    } else if (line.includes('#### **论文关键概念**')) {
      currentSection = 'keyConcepts';
      continue;
    } else if (line.includes('#### **论文亮点**')) {
      currentSection = 'highlights';
      continue;
    }
    
    // 收集内容（保留原始格式）
    if (currentSection === 'background') {
      background += line + '\n';
    } else if (currentSection === 'keyConcepts') {
      keyConcepts += line + '\n';
    } else if (currentSection === 'highlights') {
      highlights += line + '\n';
    }
  }
  
  return {
    background: background.trim(),
    keyConcepts: keyConcepts.trim(),
    highlights: highlights.trim()
  };
}

// 修复论文数据文件
function fixPapersData() {
  const papersDataPath = path.join(__dirname, 'utils', 'papersData.js');
  const content = fs.readFileSync(papersDataPath, 'utf8');
  
  const summary = parseInformerSummary();
  
  // 生成正确的论文对象字符串
  const paperObjectStr = `  {
    id: 14,
    title: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting',
    authors: 'Haoyi Zhou, Shanghang Zhang, Jieqi Peng, Shuai Zhang, Jianxin Li, Hui Xiong, Wancai Zhang',
    year: 2020,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种名为Informer的新型高效Transformer架构，通过ProbSparse自注意力机制、自注意力蒸馏和生成式解码器三大创新，成功解决了长序列时间序列预测中的效率瓶颈问题。',
    url: 'https://arxiv.org/pdf/2012.07436',
    get wordCount() { return getPaperWordCount('Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting') },
    category: 'AI专业词汇',
    background: \`${summary.background}\`,
    keyConcepts: \`${summary.keyConcepts}\`,
    highlights: \`${summary.highlights}\`
  }`;
  
  // 找到最后一个论文对象的位置并替换
  const lastPaperMatch = content.match(/(\s*\{\s*id:\s*14,[\s\S]*?\}\s*)\n\s*\]/);
  if (lastPaperMatch) {
    const newContent = content.replace(
      lastPaperMatch[1],
      paperObjectStr
    );
    
    fs.writeFileSync(papersDataPath, newContent, 'utf8');
    console.log('论文概要已修复到 utils/papersData.js');
  } else {
    console.error('无法找到Informer论文对象进行修复');
  }
}

// 主函数
function main() {
  try {
    console.log('开始修复Informer论文概要...');
    fixPapersData();
    console.log('Informer论文概要修复完成！');
  } catch (error) {
    console.error('修复过程中发生错误:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseInformerSummary,
  fixPapersData
};

