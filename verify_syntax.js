// verify_syntax.js
// 验证app.js和papersData.js的语法是否正确

const fs = require('fs');
const path = require('path');

function verifySyntax() {
  try {
    console.log('开始验证语法...');
    
    // 验证papersData.js
    console.log('验证 utils/papersData.js...');
    const papersDataPath = path.join(__dirname, 'utils', 'papersData.js');
    const papersContent = fs.readFileSync(papersDataPath, 'utf8');
    
    // 尝试解析JavaScript代码
    eval(papersContent);
    console.log('✓ utils/papersData.js 语法正确');
    
    // 验证app.js
    console.log('验证 app.js...');
    const appJsPath = path.join(__dirname, 'app.js');
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    
    // 尝试解析JavaScript代码
    eval(appContent);
    console.log('✓ app.js 语法正确');
    
    console.log('所有文件语法验证通过！');
    return true;
  } catch (error) {
    console.error('语法验证失败:', error.message);
    return false;
  }
}

// 运行验证
if (require.main === module) {
  verifySyntax();
}

module.exports = { verifySyntax };

