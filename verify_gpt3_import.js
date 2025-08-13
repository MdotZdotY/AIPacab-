// verify_gpt3_import.js
// 验证GPT-3词汇导入是否成功

const fs = require('fs');
const path = require('path');

function verifyGPT3Import() {
  console.log('=== 验证GPT-3词汇导入 ===\n');
  
  try {
    // 1. 验证papersData.js
    console.log('1. 验证papersData.js...');
    const papersData = require('./utils/papersData.js');
    const gpt3Paper = papersData.find(p => p.title === 'Language Models are Few-Shot Learners');
    
    if (gpt3Paper) {
      console.log('✓ GPT-3论文已成功添加到papersData.js');
      console.log(`  论文ID: ${gpt3Paper.id}`);
      console.log(`  标题: ${gpt3Paper.title}`);
      console.log(`  年份: ${gpt3Paper.year}`);
    } else {
      console.log('✗ 未找到GPT-3论文');
    }
    
    // 2. 验证app.js中的词汇
    console.log('\n2. 验证app.js中的词汇...');
    const appJsPath = path.join(__dirname, 'app.js');
    const content = fs.readFileSync(appJsPath, 'utf8');
    
    // 使用正则表达式查找GPT-3词汇
    const gpt3WordsMatch = content.match(/paperTitle: 'Language Models are Few-Shot Learners'/g);
    const gpt3WordsCount = gpt3WordsMatch ? gpt3WordsMatch.length : 0;
    
    console.log(`GPT-3词汇总数: ${gpt3WordsCount}个`);
    
    if (gpt3WordsCount > 0) {
      console.log('✓ GPT-3词汇已成功添加到app.js');
      
      // 显示前3个GPT-3词汇的基本信息
      console.log('\n前3个GPT-3词汇:');
      const lines = content.split('\n');
      let gpt3WordCount = 0;
      
      for (let i = 0; i < lines.length && gpt3WordCount < 3; i++) {
        const line = lines[i];
        if (line.includes("paperTitle: 'Language Models are Few-Shot Learners'")) {
          // 向上查找word字段
          for (let j = i - 10; j < i; j++) {
            if (j >= 0 && lines[j].includes("word: '")) {
              const wordMatch = lines[j].match(/word: '([^']+)'/);
              if (wordMatch) {
                gpt3WordCount++;
                console.log(`  ${gpt3WordCount}. ${wordMatch[1]}`);
                break;
              }
            }
          }
        }
      }
    } else {
      console.log('✗ 未找到GPT-3词汇');
    }
    
    // 3. 检查语法错误
    console.log('\n3. 检查语法错误...');
    try {
      require('./app.js');
      console.log('✓ app.js语法正确');
    } catch (error) {
      console.log('✗ app.js语法错误:', error.message);
    }
    
    console.log('\n=== 验证完成 ===');
    
  } catch (error) {
    console.error('验证失败:', error);
  }
}

verifyGPT3Import();
