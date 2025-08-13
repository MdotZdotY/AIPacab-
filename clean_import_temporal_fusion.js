const fs = require('fs');
const path = require('path');

// 解析论文概要部分
function parsePaperSummary() {
  return {
    background: `多步时间序列预测在现实世界中至关重要，它能帮助各行各业根据历史数据对未来趋势做出长期规划，例如零售商预测未来一周的商品需求，或能源公司规划未来数月的电力负荷。传统的时间序列预测模型，如ARIMA等统计方法，虽然经典但难以处理复杂的非线性和多变量关系。而深度学习模型，特别是基于循环神经网络（RNN）和长短期记忆网络（LSTM）的模型，虽然表现出色，但通常缺乏可解释性，用户无法理解模型为何做出特定的预测，这在许多需要高可靠性和决策依据的场景中是致命缺陷。此外，现有的模型大多难以同时利用不同类型的数据输入（如静态元数据、已知的未来事件和历史时变数据），并且在性能和可解释性之间往往难以兼顾。`,
    keyConcepts: `为解决上述挑战，该论文提出了一种全新的深度学习架构——**时间融合变换器（Temporal Fusion Transformer, TFT）**。TFT旨在实现卓越预测性能与高可解释性的统一。其核心架构由多个精心设计的组件构成：
1.  **门控残差网络 (Gated Residual Network, GRN)**：作为模型的基础构建块，GRN通过门控机制，使得模型能够根据需要跳过不必要的层，从而适应不同数据集的复杂性。
2.  **变量选择网络 (Variable Selection Networks)**：TFT能够处理多种类型的输入（静态、历史和未来已知的时变变量）。通过为每种输入配备变量选择网络，模型能自动学习并识别出对预测最重要的变量，去除不相关的噪声。
3.  **静态协变量编码器 (Static Covariate Encoders)**：该组件将静态元数据（如商店ID、商品类别）编码成向量，用于初始化模型中的GRN，从而影响整个模型的动态行为。
4.  **可解释的多头注意力 (Interpretable Multi-Head Attention)**：TFT采用了基于Transformer的自注意力机制来学习长期的时间依赖关系。与标准Transformer不同，TFT的注意力机制经过修改，可以揭示出哪些历史时间点对特定预测最为重要，从而增强了模型的可解释性。
5.  **时间融合解码器 (Temporal Fusion Decoder)**：这是模型的"集大成者"，它将所有处理过的输入信息（静态、历史和未来）进行有效融合，并结合位置编码和注意力结果，最终生成多步预测。`,
    highlights: `本研究最大的亮点在于其**性能与可解释性的兼得**。TFT不仅在多个真实的、大规模时间序列数据集上取得了超越当时所有先进模型的预测精度，更重要的是，它提供了两种维度的深度洞察力：
1.  **识别关键变量**：通过变量选择网络，TFT能够清晰地量化不同输入特征（如特定商品、节假日促销）对预测的重要性，帮助用户理解哪些因素在驱动预测结果。
2.  **揭示时间模式**：其可解释的注意力机制能够可视化地展示出模型在做预测时关注了哪些历史时间模式。例如，在零售预测中，模型可能会自动关注到去年同期的销售高峰，或是在预测流感爆发时，识别出某些具有周期性或突变性的早期模式。
论文通过具体的案例分析，展示了如何利用TFT识别出具有持续性影响的时间模式、定位导致模式突变的断点（regime changes），这使得TFT不仅是一个精准的"黑箱"预测器，更是一个强大的商业和科学洞察工具。`
  };
}

// 更新论文数据
function updatePapersData() {
  const papersDataPath = path.join(__dirname, 'utils', 'papersData.js');
  const content = fs.readFileSync(papersDataPath, 'utf8');
  
  // 找到papers数组的结束位置
  const papersMatch = content.match(/const papers = \[([\s\S]*?)\]/);
  if (!papersMatch) {
    console.error('无法找到papers数组');
    return;
  }
  
  const papersArray = papersMatch[1];
  const existingPapersCount = (papersArray.match(/\{/g) || []).length;
  
  // 生成新论文对象
  const paperSummary = parsePaperSummary();
  const newPaperCode = `  {
    id: ${existingPapersCount + 1},
    title: 'Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting',
    authors: 'Bryan Lim, Sercan Ö. Arik, Nicolas Loeff, Tomas Pfister',
    year: 2019,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种名为时间融合变换器（Temporal Fusion Transformer, TFT）的深度学习架构，旨在实现卓越预测性能与高可解释性的统一，在多个真实时间序列数据集上取得了超越当时所有先进模型的预测精度。',
    url: 'https://arxiv.org/pdf/1912.09363',
    get wordCount() { return getPaperWordCount('Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting') },
    category: 'AI专业词汇',
    background: \`${paperSummary.background}\`,
    keyConcepts: \`${paperSummary.keyConcepts}\`,
    highlights: \`${paperSummary.highlights}\`
  }`;
  
  // 更新文件内容
  const updatedContent = content.replace(
    /const papers = \[([\s\S]*?)\]/,
    `const papers = [$1${existingPapersCount > 0 ? ',' : ''}\n${newPaperCode}\n]`
  );
  
  fs.writeFileSync(papersDataPath, updatedContent, 'utf8');
  console.log('论文数据已更新到 utils/papersData.js');
}

// 更新词汇数据 - 只更新paperTitle字段
function updateVocabularyData() {
  const appJsPath = path.join(__dirname, 'app.js');
  const content = fs.readFileSync(appJsPath, 'utf8');
  
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
  
  let updatedContent = content;
  let updateCount = 0;
  
  // 逐个更新词汇的paperTitle字段
  wordsToUpdate.forEach(word => {
    const pattern = new RegExp(`(word: '${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?)(paperTitle: '[^']*')([\\s\\S]*?)(category: '[^']*')`, 'g');
    
    updatedContent = updatedContent.replace(pattern, (match, p1, p2, p3, p4) => {
      updateCount++;
      return `${p1}paperTitle: 'Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting'${p3}${p4}`;
    });
  });
  
  // 保存更新后的内容
  fs.writeFileSync(appJsPath, updatedContent, 'utf8');
  console.log(`成功更新了 ${updateCount} 个词汇的paperTitle字段`);
}

// 主函数
function main() {
  try {
    console.log('开始清理导入Temporal Fusion Transformer论文数据...');
    
    // 更新论文数据
    updatePapersData();
    
    // 更新词汇数据
    updateVocabularyData();
    
    console.log('清理导入完成！');
  } catch (error) {
    console.error('导入过程中发生错误:', error);
  }
}

main();