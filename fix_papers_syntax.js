// fix_papers_syntax.js
// 修复papersData.js中的语法错误

const fs = require('fs');
const path = require('path');

function fixPapersSyntax() {
  try {
    console.log('开始修复papersData.js语法错误...');
    
    const papersDataPath = path.join(__dirname, 'utils', 'papersData.js');
    let content = fs.readFileSync(papersDataPath, 'utf8');
    
    // 修复模板字符串中的反引号问题
    // 将模板字符串中的反引号转义
    content = content.replace(/`O\(L\^2\)`/g, "\\`O(L^2)\\`");
    content = content.replace(/`O\(L log L\)`/g, "\\`O(L log L)\\`");
    
    // 修复其他可能的反引号问题
    content = content.replace(/`([^`]+)`/g, (match, p1) => {
      // 如果是在模板字符串内部，需要转义
      if (match.includes('O(L^2)') || match.includes('O(L log L)')) {
        return `\\`${p1}\\``;
      }
      return match;
    });
    
    // 保存修复后的文件
    fs.writeFileSync(papersDataPath, content, 'utf8');
    console.log('✓ papersData.js语法错误已修复');
    
    // 验证修复结果
    console.log('验证修复结果...');
    const testContent = fs.readFileSync(papersDataPath, 'utf8');
    
    // 检查是否还有语法错误
    try {
      // 尝试解析JavaScript代码
      eval(testContent);
      console.log('✓ 语法验证通过');
    } catch (error) {
      console.error('⚠ 仍有语法错误:', error.message);
    }
    
  } catch (error) {
    console.error('修复过程中发生错误:', error);
  }
}

// 运行修复
if (require.main === module) {
  fixPapersSyntax();
}

module.exports = { fixPapersSyntax };

