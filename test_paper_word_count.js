// test_paper_word_count.js
// 测试论文词汇数量计算

// 模拟词汇数据
const mockWords = [
  {
    id: 1,
    word: 'Transformer',
    paperTitle: 'Attention is all you need',
    meaning: '变压器',
    partOfSpeech: 'noun'
  },
  {
    id: 2,
    word: 'Self-attention',
    paperTitle: 'Attention is all you need',
    meaning: '自注意力',
    partOfSpeech: 'noun'
  },
  {
    id: 3,
    word: 'Multi-head',
    paperTitle: 'Attention is all you need',
    meaning: '多头',
    partOfSpeech: 'adjective'
  },
  {
    id: 4,
    word: 'Convolutional',
    paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
    meaning: '卷积的',
    partOfSpeech: 'adjective'
  },
  {
    id: 5,
    word: 'Neural network',
    paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
    meaning: '神经网络',
    partOfSpeech: 'noun phrase'
  }
];

// 模拟 getApp 函数
global.getApp = () => ({
  globalData: {
    words: mockWords
  }
});

// 测试词汇数量计算函数
function testWordCountCalculation() {
  console.log('=== 测试论文词汇数量计算 ===\n');
  
  // 测试 Attention is all you need 论文
  const attentionWords = mockWords.filter(word => 
    word.paperTitle === 'Attention is all you need'
  );
  console.log(`Attention is all you need 论文词汇数量: ${attentionWords.length}`);
  attentionWords.forEach(word => {
    console.log(`  - ${word.word}: ${word.meaning}`);
  });
  
  console.log('\n---\n');
  
  // 测试 ImageNet 论文
  const imagenetWords = mockWords.filter(word => 
    word.paperTitle === 'ImageNet Classification with Deep Convolutional Neural Networks'
  );
  console.log(`ImageNet Classification with Deep Convolutional Neural Networks 论文词汇数量: ${imagenetWords.length}`);
  imagenetWords.forEach(word => {
    console.log(`  - ${word.word}: ${word.meaning}`);
  });
  
  console.log('\n=== 测试完成 ===');
  console.log('预期结果:');
  console.log('- Attention is all you need: 3个词汇');
  console.log('- ImageNet Classification with Deep Convolutional Neural Networks: 2个词汇');
}

// 执行测试
testWordCountCalculation();