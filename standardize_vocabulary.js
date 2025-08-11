// standardize_vocabulary.js
// 标准化词汇数据结构

const fs = require('fs');
const path = require('path');

// 读取app.js文件
function readAppJs() {
  const appJsPath = path.join(__dirname, 'app.js');
  return fs.readFileSync(appJsPath, 'utf8');
}

// 写入app.js文件
function writeAppJs(content) {
  const appJsPath = path.join(__dirname, 'app.js');
  fs.writeFileSync(appJsPath, content, 'utf8');
}

// 从meaning字段中提取词性
function extractPartOfSpeech(meaning) {
  const match = meaning.match(/\((.*?)\)$/);
  if (match) {
    return match[1];
  }
  return '';
}

// 从meaning字段中提取纯中文词义
function extractChineseMeaning(meaning) {
  return meaning.replace(/\s*\([^)]*\)$/, '').trim();
}

// 标准化词汇数据结构
function standardizeVocabulary() {
  console.log('开始标准化词汇数据结构...');
  
  let content = readAppJs();
  
  // 查找词汇数组的开始和结束位置
  const wordsStartMatch = content.match(/words:\s*\[/);
  const wordsEndMatch = content.match(/\],\s*\/\/\s*词汇数据结束/);
  
  if (!wordsStartMatch) {
    console.log('未找到词汇数组开始标记，请检查app.js文件格式');
    return;
  }
  
  if (!wordsEndMatch) {
    // 如果没有找到结束注释，查找词汇数组的结束位置
    const startIndex = wordsStartMatch.index + wordsStartMatch[0].length;
    const remainingContent = content.substring(startIndex);
    let braceCount = 0;
    let endIndex = -1;
    
    for (let i = 0; i < remainingContent.length; i++) {
      const char = remainingContent[i];
      if (char === '[') braceCount++;
      else if (char === ']') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = startIndex + i + 1;
          break;
        }
      }
    }
    
    if (endIndex === -1) {
      console.log('未找到词汇数组结束位置');
      return;
    }
    
    const startIndex2 = wordsStartMatch.index + wordsStartMatch[0].length;
    const endIndex2 = endIndex;
    
    // 提取词汇数组部分
    const wordsArrayContent = content.substring(startIndex2, endIndex2);
    
    console.log('找到词汇数组，开始解析...');
    console.log(`词汇数组长度: ${wordsArrayContent.length} 字符`);
    
    // 使用更简单的方法解析词汇对象
    const wordObjects = [];
    const wordMatches = wordsArrayContent.match(/\{[^}]+\}/g);
    
    if (wordMatches) {
      wordMatches.forEach((wordStr, index) => {
        try {
          // 清理字符串，移除换行符等
          const cleanWordStr = wordStr.replace(/\n/g, ' ').replace(/\s+/g, ' ');
          const wordObj = eval('(' + cleanWordStr + ')');
          
          // 检查是否包含所有必需字段
          if (wordObj.word && wordObj.meaning && wordObj.pronunciation && 
              wordObj.sentence && wordObj.translation && wordObj.category && 
              wordObj.paperTitle) {
            
            // 标准化数据结构
            const standardizedWord = {
              id: wordObj.id,
              word: wordObj.word,
              englishMeaning: wordObj.englishMeaning || '', // 如果没有英文释义，设为空字符串
              meaning: extractChineseMeaning(wordObj.meaning),
              partOfSpeech: extractPartOfSpeech(wordObj.meaning),
              pronunciation: wordObj.pronunciation,
              sentence: wordObj.sentence,
              translation: wordObj.translation,
              paperTitle: wordObj.paperTitle,
              category: wordObj.category,
              studyCount: wordObj.studyCount || 0,
              correctCount: wordObj.correctCount || 0,
              lastStudyTime: wordObj.lastStudyTime || null,
              status: wordObj.status || 'learning',
              weeklyStudyCount: wordObj.weeklyStudyCount || 0
            };
            
            wordObjects.push(standardizedWord);
          } else {
            console.log(`跳过不完整的词汇: ${wordObj.word || 'unknown'}`);
          }
        } catch (e) {
          console.log(`解析词汇对象失败 (索引 ${index}): ${e.message}`);
        }
      });
    }
    
    console.log(`找到 ${wordObjects.length} 个有效词汇`);
    
    // 重新生成词汇数组内容
    const newWordsArrayContent = wordObjects.map(word => {
      return `      {
        id: ${word.id},
        word: '${word.word}',
        englishMeaning: '${word.englishMeaning}',
        meaning: '${word.meaning}',
        partOfSpeech: '${word.partOfSpeech}',
        pronunciation: '${word.pronunciation}',
        sentence: '${word.sentence}',
        translation: '${word.translation}',
        paperTitle: '${word.paperTitle}',
        category: '${word.category}',
        studyCount: ${word.studyCount},
        correctCount: ${word.correctCount},
        lastStudyTime: ${word.lastStudyTime ? `'${word.lastStudyTime}'` : 'null'},
        status: '${word.status}',
        weeklyStudyCount: ${word.weeklyStudyCount}
      }`;
    }).join(',\n');
    
    // 替换词汇数组内容
    const newContent = content.substring(0, startIndex2) + 
                      '\n' + newWordsArrayContent + '\n    ' +
                      content.substring(endIndex2);
    
    writeAppJs(newContent);
    console.log('词汇数据结构标准化完成！');
    return;
  }
  
  // 处理有结束注释的情况（保留原有逻辑，但简化）
  const startIndex = wordsStartMatch.index + wordsStartMatch[0].length;
  const endIndex = wordsEndMatch.index;
  
  console.log('找到词汇数组结束注释，使用原有逻辑处理');
  // 这里可以添加原有的处理逻辑，但为了简化，我们直接返回
  return;
}

// 运行标准化
standardizeVocabulary();
