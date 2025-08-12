// fix_app_js.js
// 修复app.js文件中的语法错误

const fs = require('fs');
const path = require('path');

function fixAppJs() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('开始修复app.js文件...');
  
  // 修复第1516行的字符串问题
  const line1516 = "        englishMeaning: 'The process of ensuring that an AI system\\'s behavior aligns with human values and intentions.',";
  const fixedLine1516 = "        englishMeaning: 'The process of ensuring that an AI system\\'s behavior aligns with human values and intentions.',";
  
  // 修复第1530行的字符串问题
  const line1530 = "        englishMeaning: 'A technique that uses human preferences to train a reward model, which is then used to optimize an agent\\'s behavior.',";
  const fixedLine1530 = "        englishMeaning: 'A technique that uses human preferences to train a reward model, which is then used to optimize an agent\\'s behavior.',";
  
  // 替换有问题的行
  content = content.replace(line1516, fixedLine1516);
  content = content.replace(line1530, fixedLine1530);
  
  // 检查是否还有其他未终止的字符串
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("englishMeaning: '") && !line.includes("',")) {
      console.log(`发现未终止的字符串在第 ${i + 1} 行: ${line}`);
    }
  }
  
  // 写回文件
  fs.writeFileSync(appJsPath, content, 'utf8');
  console.log('app.js文件修复完成');
  
  // 验证语法
  try {
    require('vm').runInNewContext(content, {}, { timeout: 1000 });
    console.log('✅ 语法检查通过');
  } catch (error) {
    console.error('❌ 语法检查失败:', error.message);
  }
}

// 运行修复
fixAppJs();