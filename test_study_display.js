// test_study_display.js
// 测试学习页面的词性信息显示

// 模拟词汇数据
const testWords = [
  {
    id: 1,
    word: 'Fully-connected layer',
    meaning: '全连接层 (noun phrase)',
    partOfSpeech: 'noun phrase',
    englishMeaning: 'A layer in an artificial neural network in which every neuron in the layer is connected to every neuron in the preceding layer.',
    paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
  },
  {
    id: 2,
    word: 'Convolutional',
    meaning: '卷积的 (adjective)',
    partOfSpeech: 'adjective',
    englishMeaning: 'Relating to or involving convolution.',
    paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
  },
  {
    id: 3,
    word: 'Neural network',
    meaning: '神经网络',
    partOfSpeech: 'noun phrase',
    englishMeaning: 'A computer system modeled on the human brain and nervous system.',
    paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
  }
];

// 测试词性信息处理函数
function testPartOfSpeechProcessing() {
  console.log('=== 测试词性信息处理 ===\n');
  
  testWords.forEach((word, index) => {
    console.log(`测试词汇 ${index + 1}: ${word.word}`);
    console.log(`原始 meaning: "${word.meaning}"`);
    console.log(`原始 partOfSpeech: "${word.partOfSpeech}"`);
    
    // 模拟处理后的meaning（移除词性信息）
    const processedMeaning = word.meaning ? 
      word.meaning.replace(/\s*\([^)]*\)$/, '').trim() : 
      word.meaning;
    
    console.log(`处理后的 meaning: "${processedMeaning}"`);
    console.log(`应该显示的格式: "${processedMeaning} (${word.partOfSpeech})"`);
    console.log('---');
  });
}

// 测试测试选项生成
function testOptionGeneration() {
  console.log('\n=== 测试测试选项生成 ===\n');
  
  testWords.forEach((word, index) => {
    console.log(`测试词汇 ${index + 1}: ${word.word}`);
    
    // 模拟generateOptions函数的逻辑
    const cleanMeaning = word.meaning ? 
      word.meaning.replace(/\s*\([^)]*\)$/, '').trim() : 
      word.meaning;
    
    const correctOption = word.partOfSpeech ? 
      `${cleanMeaning} (${word.partOfSpeech})` : 
      cleanMeaning;
    
    console.log(`生成的正确选项: "${correctOption}"`);
    console.log('---');
  });
}

// 测试答案比较逻辑
function testAnswerComparison() {
  console.log('\n=== 测试答案比较逻辑 ===\n');
  
  testWords.forEach((word, index) => {
    console.log(`测试词汇 ${index + 1}: ${word.word}`);
    
    // 模拟处理后的meaning
    const correctAnswer = word.meaning ? 
      word.meaning.replace(/\s*\([^)]*\)$/, '').trim() : 
      word.meaning;
    
    // 模拟用户选择的答案（包含词性信息）
    const selectedAnswer = `${correctAnswer} (${word.partOfSpeech})`;
    
    // 模拟selectAnswer函数的比较逻辑
    const selectedMeaning = selectedAnswer.replace(/\s*\([^)]*\)$/, '');
    const isCorrect = selectedMeaning === correctAnswer;
    
    console.log(`正确答案: "${correctAnswer}"`);
    console.log(`用户选择: "${selectedAnswer}"`);
    console.log(`提取的含义: "${selectedMeaning}"`);
    console.log(`比较结果: ${isCorrect ? '正确' : '错误'}`);
    console.log('---');
  });
}

// 运行所有测试
function runAllTests() {
  console.log('开始测试学习页面的词性信息显示...\n');
  
  testPartOfSpeechProcessing();
  testOptionGeneration();
  testAnswerComparison();
  
  console.log('\n测试完成！');
  console.log('\n预期结果:');
  console.log('1. meaning字段应该只显示纯中文意思，不包含词性信息');
  console.log('2. partOfSpeech字段应该单独显示词性信息（灰色字体）');
  console.log('3. 测试选项应该正确显示格式：中文意思 (词性)');
  console.log('4. 答案比较应该正确工作');
}

// 执行测试
runAllTests();