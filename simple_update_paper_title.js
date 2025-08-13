const fs = require('fs');
const path = require('path');

function simpleUpdatePaperTitle() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('开始简单更新paperTitle字段...');
  
  // 定义需要更新的词汇列表
  const wordsToUpdate = [
    'Heterogeneous', 'Ablation', 'Ubiquitous', 'Novel', 'Regime',
    'Component', 'Utilize', 'Enhancement', 'Comprehensive', 'Quantile',
    'Simultaneously', 'Diverse', 'Architecture', 'Incorporate', 'Demonstrate',
    'Interaction', 'Persistent', 'Significant', 'Domain', 'Time Series Forecasting',
    'Multi-horizon Forecasting', 'Recurrent Neural Network (RNN)', 'Self-attention',
    'Covariate', 'Interpretable', 'Benchmark', 'Gating Mechanism', 'Residual Connection',
    'Long Short-Term Memory (LSTM)', 'Transformer'
  ];
  
  let updateCount = 0;
  
  // 逐个更新词汇的paperTitle字段
  wordsToUpdate.forEach(word => {
    const pattern = new RegExp(`(word: '${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?)(paperTitle: '[^']*')([\\s\\S]*?)(category: '[^']*')`, 'g');
    
    content = content.replace(pattern, (match, p1, p2, p3, p4) => {
      updateCount++;
      return `${p1}paperTitle: 'Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting'${p3}${p4}`;
    });
  });
  
  // 保存更新后的内容
  fs.writeFileSync(appJsPath, content, 'utf8');
  
  console.log(`成功更新了 ${updateCount} 个词汇的paperTitle字段`);
  console.log('更新完成！');
}

simpleUpdatePaperTitle();