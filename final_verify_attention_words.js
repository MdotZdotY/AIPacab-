// final_verify_attention_words.js
// 最终验证Attention词汇的词性信息

const fs = require('fs');
const path = require('path');

function finalVerifyAttentionWords() {
  console.log('最终验证Attention Is All You Need词汇的词性信息...\n');
  
  // 读取源文件
  const sourcePath = path.join(__dirname, 'vocabulary', 'AttentionIsAllYouNeed_Voca.txt');
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  
  // 读取app.js文件
  const appJsPath = path.join(__dirname, 'app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  
  // 解析源文件中的Attention词汇
  const sourceWords = [];
  const lines = sourceContent.split('\n');
  let currentCategory = '';
  let currentWord = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测分类标题
    if (line.includes('### **GRE高频词**')) {
      currentCategory = 'GRE高频词';
      continue;
    } else if (line.includes('### **TOEFL高频词**')) {
      currentCategory = 'TOEFL高频词';
      continue;
    } else if (line.includes('### **IELTS高频词**')) {
      currentCategory = 'IELTS高频词';
      continue;
    } else if (line.includes('### **AI领域专有词**')) {
      currentCategory = 'AI专业词汇';
      continue;
    }
    
    // 检测新词汇
    if (line.startsWith('* **') && line.includes('**') && 
        !line.includes('英文释义') && !line.includes('中文释义') && 
        !line.includes('词性') && !line.includes('音标') && 
        !line.includes('在论文中的例句') && !line.includes('例句中文翻译')) {
      
      const wordMatch = line.match(/\*\*([^*]+)\*\*/);
      if (wordMatch) {
        const wordText = wordMatch[1].trim();
        if (wordText && !wordText.includes('：') && !wordText.includes(':')) {
          currentWord = { 
            word: wordText, 
            partOfSpeech: '',
            category: currentCategory
          };
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
  
  // 解析app.js中的Attention词汇
  const appWords = [];
  const wordMatches = appJsContent.match(/\{\s*id:\s*\d+[\s\S]*?word:\s*'([^']+)'[\s\S]*?partOfSpeech:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?paperTitle:\s*'Attention is all you need'[\s\S]*?\}/g);
  
  if (wordMatches) {
    wordMatches.forEach(match => {
      const wordMatch = match.match(/word:\s*'([^']+)'/);
      const posMatch = match.match(/partOfSpeech:\s*'([^']+)'/);
      const categoryMatch = match.match(/category:\s*'([^']+)'/);
      
      if (wordMatch && posMatch && categoryMatch) {
        appWords.push({
          word: wordMatch[1],
          partOfSpeech: posMatch[1],
          category: categoryMatch[1]
        });
      }
    });
  }
  
  console.log('Attention Is All You Need词汇词性信息验证:');
  console.log('=' .repeat(80));
  
  let correctCount = 0;
  let totalCount = sourceWords.length;
  
  sourceWords.forEach(sourceWord => {
    const appWord = appWords.find(w => w.word === sourceWord.word);
    
    if (appWord) {
      if (sourceWord.partOfSpeech === appWord.partOfSpeech) {
        console.log(`✅ ${sourceWord.word} (${sourceWord.category}): ${sourceWord.partOfSpeech} - 正确`);
        correctCount++;
      } else {
        console.log(`❌ ${sourceWord.word} (${sourceWord.category}): 源文件=${sourceWord.partOfSpeech}, app.js=${appWord.partOfSpeech} - 不匹配`);
      }
    } else {
      console.log(`⚠️  ${sourceWord.word} (${sourceWord.category}): ${sourceWord.partOfSpeech} - 在app.js中未找到`);
    }
  });
  
  console.log('=' .repeat(80));
  console.log(`验证结果: ${correctCount}/${totalCount} 个词汇词性信息正确 (${((correctCount/totalCount)*100).toFixed(1)}%)`);
  
  // 按分类统计
  const categoryStats = {};
  sourceWords.forEach(word => {
    if (!categoryStats[word.category]) {
      categoryStats[word.category] = { total: 0, correct: 0 };
    }
    categoryStats[word.category].total++;
    
    const appWord = appWords.find(w => w.word === word.word);
    if (appWord && appWord.partOfSpeech === word.partOfSpeech) {
      categoryStats[word.category].correct++;
    }
  });
  
  console.log('\n按分类统计:');
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);
    console.log(`- ${category}: ${stats.correct}/${stats.total} (${accuracy}%)`);
  });
  
  return { sourceWords, appWords, correctCount, totalCount, categoryStats };
}

if (require.main === module) {
  finalVerifyAttentionWords();
}

module.exports = { finalVerifyAttentionWords };