// debug_parsing.js
// 调试GPT-3词汇解析过程

const fs = require('fs');
const path = require('path');

function debugParsing() {
  const gpt3File = path.join(__dirname, 'docs', 'Language Models are Few-Shot Learners.txt');
  const content = fs.readFileSync(gpt3File, 'utf8');
  
  const lines = content.split('\n');
  let inVocabularySection = false;
  let lineCount = 0;
  
  console.log('=== 调试解析过程 ===\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    lineCount++;
    
    // 检测词汇清单部分的开始
    if (line.includes('### **3. 论文词汇清单**')) {
      inVocabularySection = true;
      console.log(`第${lineCount}行: 进入词汇部分`);
      continue;
    }
    
    // 如果不在词汇部分，跳过
    if (!inVocabularySection) {
      continue;
    }
    
    // 检测分类标题
    if (line.includes('GRE高频词') || line.includes('TOEFL高频词') || line.includes('IELTS高频词') || line.includes('AI领域专有词')) {
      console.log(`第${lineCount}行: 分类标题 - ${line}`);
      continue;
    }
    
    // 检测新词汇
    if (line.startsWith('* **') && line.includes('**')) {
      console.log(`第${lineCount}行: 词汇行 - ${line}`);
      continue;
    }
    
    // 检测属性行
    if (line.startsWith('* **')) {
      console.log(`第${lineCount}行: 属性行 - ${line}`);
      
      // 测试正则匹配
      if (line.includes('英文释义')) {
        const match = line.match(/\*\*英文释义\*\*:\s*(.+)/);
        console.log(`  英文释义匹配结果:`, match ? match[1].trim() : '未匹配');
      } else if (line.includes('中文释义')) {
        const match = line.match(/\*\*中文释义\*\*:\s*(.+)/);
        console.log(`  中文释义匹配结果:`, match ? match[1].trim() : '未匹配');
      } else if (line.includes('词性')) {
        const match = line.match(/\*\*词性\*\*:\s*(.+)/);
        console.log(`  词性匹配结果:`, match ? match[1].trim() : '未匹配');
      } else if (line.includes('音标')) {
        const match = line.match(/\*\*音标\*\*:\s*(.+)/);
        console.log(`  音标匹配结果:`, match ? match[1].trim() : '未匹配');
      } else if (line.includes('在论文中的例句')) {
        const match = line.match(/\*\*在论文中的例句 \(英文\)\*\*:\s*(.+)/);
        console.log(`  例句匹配结果:`, match ? match[1].trim() : '未匹配');
      } else if (line.includes('例句中文翻译')) {
        const match = line.match(/\*\*例句中文翻译\*\*:\s*(.+)/);
        console.log(`  翻译匹配结果:`, match ? match[1].trim() : '未匹配');
      }
    }
    
    // 只显示前50行调试信息
    if (lineCount > 50) {
      console.log('... (省略后续行)');
      break;
    }
  }
}

debugParsing();

