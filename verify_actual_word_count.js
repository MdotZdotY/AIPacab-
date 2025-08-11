// verify_actual_word_count.js
// 验证实际的词汇数量

// 读取app.js文件来获取实际的词汇数据
const fs = require('fs');
const path = require('path');

function verifyActualWordCount() {
  console.log('=== 验证实际词汇数量 ===\n');
  
  try {
    // 读取app.js文件
    const appJsPath = path.join(__dirname, 'app.js');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // 统计Attention is all you need论文的词汇数量
    const attentionMatches = appJsContent.match(/paperTitle:\s*'Attention is all you need'/g);
    const attentionCount = attentionMatches ? attentionMatches.length : 0;
    
    console.log(`Attention is all you need 论文词汇数量: ${attentionCount}`);
    
    // 统计ImageNet论文的词汇数量
    const imagenetMatches = appJsContent.match(/paperTitle:\s*'ImageNet Classification with Deep Convolutional Neural Networks'/g);
    const imagenetCount = imagenetMatches ? imagenetMatches.length : 0;
    
    console.log(`ImageNet Classification with Deep Convolutional Neural Networks 论文词汇数量: ${imagenetCount}`);
    
    console.log('\n=== 验证完成 ===');
    console.log('这些数字应该与论文页面显示的词汇数量一致。');
    
    return { attentionCount, imagenetCount };
    
  } catch (error) {
    console.error('读取文件失败:', error);
    return { attentionCount: 0, imagenetCount: 0 };
  }
}

// 执行验证
verifyActualWordCount();