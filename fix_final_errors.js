const fs = require('fs');
const path = require('path');

function fixFinalErrors() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('开始修复最终错误...');
  
  // 修复重复的category字段
  content = content.replace(/category: '[^']*'category: '[^']*'/g, (match) => {
    const categoryMatch = match.match(/category: '([^']*)'/);
    return `category: '${categoryMatch[1]}'`;
  });
  
  // 修复缺少结束字段的词汇对象
  const missingFieldsPattern = /paperTitle: '[^']*',\s*category: '[^']*',\s*$/gm;
  content = content.replace(missingFieldsPattern, (match) => {
    return match + `
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },`;
  });
  
  // 确保文件以正确的结构结束
  if (!content.trim().endsWith('}]')) {
    content = content.replace(/\s*$/, `
    ]
  }
})
`);
  }
  
  // 保存修复后的内容
  fs.writeFileSync(appJsPath, content, 'utf8');
  
  console.log('最终错误修复完成！');
}

fixFinalErrors();