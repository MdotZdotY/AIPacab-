const fs = require('fs');
const path = require('path');

function cleanAppJs() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('开始清理app.js文件...');
  
  // 删除重复的字段块
  content = content.replace(/\s*difficulty: 'medium',\s*studyCount: 0,\s*correctCount: 0,\s*lastStudyTime: null,\s*status: 'learning',\s*weeklyStudyCount: 0\s*\},\s*difficulty: 'medium',\s*studyCount: 0,\s*correctCount: 0,\s*lastStudyTime: null,\s*status: 'learning',\s*weeklyStudyCount: 0\s*\},/g, `
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },`);
  
  // 修复重复的category字段
  content = content.replace(/category: '[^']*'category: '[^']*'/g, (match) => {
    const categoryMatch = match.match(/category: '([^']*)'/);
    return `category: '${categoryMatch[1]}'`;
  });
  
  // 确保每个词汇对象都有正确的结构
  const wordPattern = /\{[^}]*word: '[^']*'[^}]*\}/g;
  let wordMatches = content.match(wordPattern);
  
  if (wordMatches) {
    wordMatches.forEach(match => {
      // 检查是否缺少必要的字段
      if (!match.includes('difficulty:') || !match.includes('studyCount:') || !match.includes('correctCount:')) {
        console.log('发现不完整的词汇对象');
      }
    });
  }
  
  // 确保文件以正确的结构结束
  if (!content.trim().endsWith('}]')) {
    content = content.replace(/\s*$/, `
    ]
  }
})
`);
  }
  
  // 保存清理后的内容
  fs.writeFileSync(appJsPath, content, 'utf8');
  
  console.log('app.js文件清理完成！');
}

cleanAppJs();