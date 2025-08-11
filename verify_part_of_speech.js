// verify_part_of_speech.js
// 验证词性信息是否正确解析

const fs = require('fs');
const path = require('path');

function verifyPartOfSpeech() {
  console.log('开始验证词性信息...\n');
  
  // 读取源文件
  const sourcePath = path.join(__dirname, 'vocabulary', 'AttentionIsAllYouNeed_Voca.txt');
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  
  // 读取app.js文件
  const appJsPath = path.join(__dirname, 'app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  // 解析源文件中的词性信息
  const sourceWords = [];
  const lines = sourceContent.split('\n');
  let currentWord = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测新词汇
    if (line.startsWith('* **') && line.includes('**') && 
        !line.includes('英文释义') && !line.includes('中文释义') && 
        !line.includes('词性') && !line.includes('音标') && 
        !line.includes('在论文中的例句') && !line.includes('例句中文翻译')) {
      
      const wordMatch = line.match(/\*\*([^*]+)\*\*/);
      if (wordMatch) {
        const wordText = wordMatch[1].trim();
        if (wordText && !wordText.includes('：') && !wordText.includes(':')) {
          currentWord = { word: wordText, partOfSpeech: '' };
        }
      }
      continue;
    }
    
    // 解析词性
    if (currentWord && line.includes('**词性**:')) {
      const match = line.match(/\*\*词性\*\*: (.+)/);
      if (match) {
        currentWord.partOfSpeech = match[1].trim();
        sourceWords.push(currentWord);
        currentWord = null;
      }
    }
  }
  
  console.log('源文件中的词性信息:');
  sourceWords.forEach(word => {
    console.log(`- ${word.word}: ${word.partOfSpeech}`);
  });
  
  console.log(`\n源文件中共有 ${sourceWords.length} 个词汇`);
  
  // 解析app.js中的词性信息
  const appWords = [];
  const wordMatches = appJsContent.match(/\{\s*id:\s*\d+[\s\S]*?word:\s*'([^']+)'[\s\S]*?partOfSpeech:\s*'([^']+)'[\s\S]*?paperTitle:\s*'Attention is all you need'[\s\S]*?\}/g);
  
  if (wordMatches) {
    wordMatches.forEach(match => {
      const wordMatch = match.match(/word:\s*'([^']+)'/);
      const posMatch = match.match(/partOfSpeech:\s*'([^']+)'/);
      
      if (wordMatch && posMatch) {
        appWords.push({
          word: wordMatch[1],
          partOfSpeech: posMatch[1]
        });
      }
    });
  }
  
  console.log('\napp.js中的词性信息:');
  appWords.forEach(word => {
    console.log(`- ${word.word}: ${word.partOfSpeech}`);
  });
  
  console.log(`\napp.js中共有 ${appWords.length} 个Attention词汇`);
  
  // 比较词性信息
  console.log('\n词性信息比较:');
  let correctCount = 0;
  let totalCount = Math.min(sourceWords.length, appWords.length);
  
  for (let i = 0; i < totalCount; i++) {
    const sourceWord = sourceWords[i];
    const appWord = appWords[i];
    
    if (sourceWord.word === appWord.word) {
      if (sourceWord.partOfSpeech === appWord.partOfSpeech) {
        console.log(`✅ ${sourceWord.word}: ${sourceWord.partOfSpeech} (正确)`);
        correctCount++;
      } else {
        console.log(`❌ ${sourceWord.word}: 源文件=${sourceWord.partOfSpeech}, app.js=${appWord.partOfSpeech} (不匹配)`);
      }
    } else {
      console.log(`⚠️  词汇不匹配: 源文件=${sourceWord.word}, app.js=${appWord.word}`);
    }
  }
  
  console.log(`\n词性信息正确率: ${correctCount}/${totalCount} (${((correctCount/totalCount)*100).toFixed(1)}%)`);
  
  return { sourceWords, appWords, correctCount, totalCount };
}

if (require.main === module) {
  verifyPartOfSpeech();
}

module.exports = { verifyPartOfSpeech };