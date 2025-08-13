const fs = require('fs');
const path = require('path');

// 解析词汇清单
function parseVocabulary() {
  const vocabularyData = [
    {
      word: 'Heterogeneous',
      englishMeaning: 'Diverse in character or content.',
      meaning: '异构的，多种多样的',
      partOfSpeech: 'adjective',
      pronunciation: '/ˌhet̬.ə.roʊˈdʒiː.ni.əs/',
      sentence: 'In this paper, we propose a novel attention-based architecture which addresses these challenges – learning temporal relationships at different scales, and interpretably integrating static covariates and other heterogeneous features into the predictions.',
      translation: '在这篇论文中，我们提出了一种新颖的基于注意力的架构，它解决了这些挑战——学习不同尺度上的时间关系，并可解释地将静态协变量和其他异构特征整合到预测中。',
      category: 'GRE高频词'
    },
    {
      word: 'Ablation',
      englishMeaning: 'In machine learning, an ablation study involves systematically removing parts of a model or algorithm to understand the contribution of each component.',
      meaning: '消融研究 (指通过移除模型部分来分析其贡献的实验)',
      partOfSpeech: 'noun',
      pronunciation: '/əˈbleɪ.ʃən/',
      sentence: 'We also perform a full ablation analysis to evaluate the contribution of each component of Temporal Fusion Transformer.',
      translation: '我们还进行了一次完整的消融分析，以评估时间融合变换器各个组件的贡献。',
      category: 'GRE高频词'
    },
    {
      word: 'Ubiquitous',
      englishMeaning: 'Present, appearing, or found everywhere.',
      meaning: '无处不在的，普遍存在的',
      partOfSpeech: 'adjective',
      pronunciation: '/juːˈbɪk.wə.t̬əs/',
      sentence: 'With the ubiquitous nature of time series data in the modern world, forecasting is an important task in many domains...',
      translation: '随着时间序列数据在现代世界中的无处不在，预测在许多领域都是一项重要任务...',
      category: 'GRE高频词'
    },
    {
      word: 'Novel',
      englishMeaning: 'New or unusual in an interesting way.',
      meaning: '新颖的',
      partOfSpeech: 'adjective',
      pronunciation: '/ˈnɑː.vəl/',
      sentence: 'We propose a novel interpretable deep learning model for multi-horizon forecasting.',
      translation: '我们为多步预测提出了一种新颖的、可解释的深度学习模型。',
      category: 'GRE高频词'
    },
    {
      word: 'Regime',
      englishMeaning: 'A particular way of operating or organizing a system; a pattern.',
      meaning: '模式，状况',
      partOfSpeech: 'noun',
      pronunciation: '/reɪˈʒiːm/',
      sentence: 'Our method also allows us to identify abrupt changes in the temporal pattern of the time series, which we term as regime changes.',
      translation: '我们的方法还允许我们识别时间序列中时间模式的突变，我们称之为模式变化。',
      category: 'GRE高频词'
    },
    {
      word: 'Component',
      englishMeaning: 'A part or element of a larger whole.',
      meaning: '组件，组成部分',
      partOfSpeech: 'noun',
      pronunciation: '/kəmˈpoʊ.nənt/',
      sentence: 'This section details each of the main components of Temporal Fusion Transformer, from bottom to top.',
      translation: '本节从下至上详细介绍了时间融合变换器的每一个主要组件。',
      category: 'TOEFL高频词'
    },
    {
      word: 'Utilize',
      englishMeaning: 'To make practical and effective use of.',
      meaning: '利用',
      partOfSpeech: 'verb',
      pronunciation: '/ˈjuː.t̬əl.aɪz/',
      sentence: 'Most real-world forecasting problems also contain static covariates, which we utilize to select the appropriate feature representations and better model their interactions.',
      translation: '大多数现实世界的预测问题也包含静态协变量，我们利用它们来选择合适的特征表示并更好地对其交互进行建模。',
      category: 'TOEFL高频词'
    },
    {
      word: 'Enhancement',
      englishMeaning: 'An increase or improvement in quality, value, or extent.',
      meaning: '增强，提升',
      partOfSpeech: 'noun',
      pronunciation: '/ɪnˈhæns.mənt/',
      sentence: 'The first is a sequence-to-sequence layer for locality enhancement, which is followed by a static enrichment layer and a temporal self-attention layer.',
      translation: '第一个是用于局部性增强的序列到序列层，其后是一个静态丰富层和一个时间自注意力层。',
      category: 'TOEFL高频词'
    },
    {
      word: 'Comprehensive',
      englishMeaning: 'Complete; including all or nearly all elements or aspects of something.',
      meaning: '全面的，综合的',
      partOfSpeech: 'adjective',
      pronunciation: '/ˌkɑːm.prəˈhen.sɪv/',
      sentence: 'We provide a comprehensive study on a variety of real-world datasets, and show that TFT achieves a new state-of-the-art.',
      translation: '我们对各种真实世界的数据集进行了全面的研究，并表明TFT达到了新的技术水平。',
      category: 'TOEFL高频词'
    },
    {
      word: 'Quantile',
      englishMeaning: 'Each of any set of values of a variate which divide a frequency distribution into equal groups, each containing the same fraction of the total population.',
      meaning: '分位数',
      partOfSpeech: 'noun',
      pronunciation: '/ˈkwɑːn.taɪl/',
      sentence: 'We focus on quantile forecasting, which is particularly useful for decision-making under uncertainty.',
      translation: '我们专注于分位数预测，这在不确定性下的决策中特别有用。',
      category: 'TOEFL高频词'
    },
    {
      word: 'Simultaneously',
      englishMeaning: 'At the same time.',
      meaning: '同时地',
      partOfSpeech: 'adverb',
      pronunciation: '/ˌsaɪ.məlˈteɪ.ni.əs.li/',
      sentence: 'Given these inputs, the goal of multi-horizon forecasting is to predict \`y(t)\` for a set of future time steps \`τ_1, ..., τ_{h_max}\` simultaneously.',
      translation: '给定这些输入，多步预测的目标是同时预测未来一组时间步 \`τ_1, ..., τ_{h_max}\` 的 \`y(t)\`。',
      category: 'TOEFL高频词'
    },
    {
      word: 'Diverse',
      englishMeaning: 'Showing a great deal of variety; very different.',
      meaning: '多样的',
      partOfSpeech: 'adjective',
      pronunciation: '/dɪˈvɝːs/',
      sentence: 'To handle this, our architecture uses separate variable selection networks to select relevant features at each time step for a diverse set of input types.',
      translation: '为了处理这个问题，我们的架构使用独立的变量选择网络，为各种不同类型的输入在每个时间步选择相关的特征。',
      category: 'TOEFL高频词'
    },
    {
      word: 'Architecture',
      englishMeaning: 'The complex or carefully designed structure of something.',
      meaning: '架构，结构',
      partOfSpeech: 'noun',
      pronunciation: '/ˈɑːr.kə.tek.tʃɚ/',
      sentence: 'We propose a novel attention-based architecture which addresses these challenges...',
      translation: '我们提出了一种新颖的、基于注意力的架构来应对这些挑战...',
      category: 'IELTS高频词'
    },
    {
      word: 'Incorporate',
      englishMeaning: 'To take in or contain something as part of a whole; to include.',
      meaning: '包含，并入',
      partOfSpeech: 'verb',
      pronunciation: '/ɪnˈkɔːr.pə.reɪt/',
      sentence: 'In particular, our proposed model, the Temporal Fusion Transformer (TFT), is designed to incorporate the best ideas from recurrent neural networks (RNNs) and transformers.',
      translation: '特别是，我们提出的模型——时间融合变换器（TFT），旨在融合循环神经网络（RNN）和变换器的最佳思想。',
      category: 'IELTS高频词'
    },
    {
      word: 'Demonstrate',
      englishMeaning: 'To clearly show the existence or truth of something by giving proof or evidence.',
      meaning: '展示，证明',
      partOfSpeech: 'verb',
      pronunciation: '/ˈdem.ən.streɪt/',
      sentence: 'Using a range of real-world datasets, we demonstrate significant performance improvements over existing benchmarks.',
      translation: '通过一系列真实世界的数据集，我们展示了相较于现有基准的显著性能提升。',
      category: 'IELTS高频词'
    },
    {
      word: 'Interaction',
      englishMeaning: 'Communication or direct involvement with someone or something.',
      meaning: '交互，相互作用',
      partOfSpeech: 'noun',
      pronunciation: '/ˌɪn.t̬ɚˈæk.ʃən/',
      sentence: 'We also demonstrate how TFT can be used to understand the importance of different features and visualize temporal interactions.',
      translation: '我们还演示了如何使用TFT来理解不同特征的重要性并可视化时间上的相互作用。',
      category: 'IELTS高频词'
    },
    {
      word: 'Persistent',
      englishMeaning: 'Continuing firmly or obstinately in a course of action in spite of difficulty or opposition.',
      meaning: '持续的',
      partOfSpeech: 'adjective',
      pronunciation: '/pɚˈsɪs.tənt/',
      sentence: 'Temporal Fusion Transformer is able to identify persistent temporal patterns (e.g. seasonality) with high accuracy.',
      translation: '时间融合变换器能够高精度地识别持续的时间模式（例如季节性）。',
      category: 'IELTS高频词'
    },
    {
      word: 'Significant',
      englishMeaning: 'Sufficiently great or important to be worthy of attention; noteworthy.',
      meaning: '显著的，重要的',
      partOfSpeech: 'adjective',
      pronunciation: '/sɪɡˈnɪf.ə.kənt/',
      sentence: 'We demonstrate significant performance improvements over existing benchmarks.',
      translation: '我们展示了相较于现有基准的显著性能提升。',
      category: 'IELTS高频词'
    },
    {
      word: 'Domain',
      englishMeaning: 'A specified sphere of activity or knowledge.',
      meaning: '领域',
      partOfSpeech: 'noun',
      pronunciation: '/doʊˈmeɪn/',
      sentence: 'With the ubiquitous nature of time series data in the modern world, forecasting is an important task in many domains.',
      translation: '随着时间序列数据在现代世界中的无处不在，预测在许多领域都是一项重要任务。',
      category: 'IELTS高频词'
    },
    {
      word: 'Time Series Forecasting',
      englishMeaning: 'A method for predicting future values based on previously observed values over time.',
      meaning: '时间序列预测',
      partOfSpeech: 'noun phrase',
      pronunciation: '/taɪm ˈsɪə.riːz ˈfɔːr.kæst.ɪŋ/',
      sentence: 'Multi-horizon time series forecasting often requires a model to be aware of inputs of various natures.',
      translation: '多步时间序列预测通常要求模型能够感知各种性质的输入。',
      category: 'AI专业词汇'
    },
    {
      word: 'Multi-horizon Forecasting',
      englishMeaning: 'The prediction of a time series for multiple steps into the future.',
      meaning: '多步预测',
      partOfSpeech: 'noun phrase',
      pronunciation: '/ˈmʌl.ti həˈraɪ.zən ˈfɔːr.kæst.ɪŋ/',
      sentence: 'We propose a novel interpretable deep learning model for multi-horizon forecasting.',
      translation: '我们为多步预测提出了一种新颖的、可解释的深度学习模型。',
      category: 'AI专业词汇'
    },
    {
      word: 'Recurrent Neural Network (RNN)',
      englishMeaning: 'A class of artificial neural networks where connections between nodes form a directed graph along a temporal sequence, allowing it to exhibit temporal dynamic behavior.',
      meaning: '循环神经网络',
      partOfSpeech: 'noun phrase',
      pronunciation: '/rɪˈkɝː.ənt ˈnʊr.əl ˈnet.wɝːk/',
      sentence: 'In particular, recurrent neural networks (RNNs) have become a popular choice for time series forecasting...',
      translation: '特别是，循环神经网络（RNN）已成为时间序列预测的流行选择...',
      category: 'AI专业词汇'
    },
    {
      word: 'Self-attention',
      englishMeaning: 'An attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence.',
      meaning: '自注意力',
      partOfSpeech: 'noun',
      pronunciation: '/self əˈten.ʃən/',
      sentence: 'On the other hand, self-attention mechanisms, popularized by the Transformer architecture, have been shown to be very effective in learning long-term dependencies.',
      translation: '另一方面，由Transformer架构推广的自注意力机制，已被证明在学习长期依赖关系方面非常有效。',
      category: 'AI专业词汇'
    },
    {
      word: 'Covariate',
      englishMeaning: 'A variable that is possibly predictive of the outcome under study. A covariate may be of direct interest or it may be a confounding variable or an effect modifier.',
      meaning: '协变量',
      partOfSpeech: 'noun',
      pronunciation: '/ˈkoʊˌver.i.ət/',
      sentence: 'The first group are static covariates, representing time-invariant features such as the item ID, its store location, etc.',
      translation: '第一组是静态协变量，代表不随时间变化的特征，例如商品ID、其商店位置等。',
      category: 'AI专业词汇'
    },
    {
      word: 'Interpretable',
      englishMeaning: 'Capable of being understood; intelligible. In AI, it refers to models whose decisions can be explained.',
      meaning: '可解释的',
      partOfSpeech: 'adjective',
      pronunciation: '/ɪnˈtɝː.prə.t̬ə.bəl/',
      sentence: 'In this paper, we introduce a novel deep learning model for interpretable multi-horizon forecasting.',
      translation: '在这篇论文中，我们介绍了一种用于可解释的多步预测的新颖深度学习模型。',
      category: 'AI专业词汇'
    },
    {
      word: 'Benchmark',
      englishMeaning: 'A standard or point of reference against which things may be compared or assessed.',
      meaning: '基准',
      partOfSpeech: 'noun',
      pronunciation: '/ˈbentʃ.mɑːrk/',
      sentence: 'We demonstrate significant performance improvements over existing benchmarks.',
      translation: '我们展示了相较于现有基准的显著性能提升。',
      category: 'AI专业词汇'
    },
    {
      word: 'Gating Mechanism',
      englishMeaning: 'A mechanism in neural networks that controls the flow of information.',
      meaning: '门控机制',
      partOfSpeech: 'noun phrase',
      pronunciation: '/ˈɡeɪ.tɪŋ ˈmek.ə.nɪ.zəm/',
      sentence: 'Key to this is our Gated Residual Network (GRN) which utilizes a gating mechanism to control the extent to which the layer contributes to the original input.',
      translation: '关键在于我们的门控残差网络（GRN），它利用门控机制来控制该层对原始输入贡献的程度。',
      category: 'AI专业词汇'
    },
    {
      word: 'Residual Connection',
      englishMeaning: 'A connection in a neural network that skips one or more layers, which helps in training deeper models by allowing gradients to flow through the network more easily.',
      meaning: '残差连接',
      partOfSpeech: 'noun phrase',
      pronunciation: '/ˈrez.ə.duː kəˈnek.ʃən/',
      sentence: 'Each GRN consists of a standard feed-forward network layer, with a residual connection to the original input.',
      translation: '每个GRN都由一个标准的前馈网络层组成，并带有一个到原始输入的残差连接。',
      category: 'AI专业词汇'
    },
    {
      word: 'Long Short-Term Memory (LSTM)',
      englishMeaning: 'A type of recurrent neural network (RNN) capable of learning long-term dependencies.',
      meaning: '长短期记忆网络',
      partOfSpeech: 'noun phrase',
      pronunciation: '/lɔŋ ʃɔrt tɜrm ˈmɛməri/',
      sentence: 'We use an LSTM encoder-decoder to provide locality enhancement, by processing inputs in a sequential fashion.',
      translation: '我们使用一个LSTM编码器-解码器，通过顺序处理输入来提供局部性增强。',
      category: 'AI专业词汇'
    },
    {
      word: 'Transformer',
      englishMeaning: 'A deep learning model architecture that uses self-attention, differentially weighting the significance of each part of the input data.',
      meaning: 'Transformer模型',
      partOfSpeech: 'noun',
      pronunciation: '/trænsˈfɔːr.mɚ/',
      sentence: 'In particular, our proposed model, the Temporal Fusion Transformer (TFT), is designed to incorporate the best ideas from recurrent neural networks (RNNs) and transformers.',
      translation: '特别是，我们提出的模型——时间融合变换器（TFT），旨在融合循环神经网络（RNN）和变换器的最佳思想。',
      category: 'AI专业词汇'
    }
  ];

  return vocabularyData;
}

// 检查并更新重复词汇
function checkAndUpdateDuplicates() {
  const appJsPath = path.join(__dirname, 'app.js');
  const content = fs.readFileSync(appJsPath, 'utf8');
  
  // 找到words数组
  const wordsMatch = content.match(/words: \[([\s\S]*?)\]/);
  if (!wordsMatch) {
    console.error('无法找到words数组');
    return;
  }
  
  const wordsArray = wordsMatch[1];
  const vocabularyData = parseVocabulary();
  
  // 检查每个新词汇是否已存在
  const existingWords = [];
  const newWords = [];
  
  vocabularyData.forEach(newWord => {
    // 检查是否已存在相同的词汇
    const existingWordPattern = new RegExp(`word: '${newWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g');
    const matches = wordsArray.match(existingWordPattern);
    
    if (matches && matches.length > 0) {
      console.log(`发现重复词汇: ${newWord.word}`);
      existingWords.push(newWord);
    } else {
      newWords.push(newWord);
    }
  });
  
  console.log(`\n重复词汇数量: ${existingWords.length}`);
  console.log(`新词汇数量: ${newWords.length}`);
  
  // 更新重复词汇的数据
  let updatedContent = content;
  existingWords.forEach(word => {
    // 找到现有的词汇条目并更新其数据
    const wordPattern = new RegExp(`(\\{[\\s\\S]*?word: '${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?)(englishMeaning: '[^']*')([\\s\\S]*?)(meaning: '[^']*')([\\s\\S]*?)(partOfSpeech: '[^']*')([\\s\\S]*?)(pronunciation: '[^']*')([\\s\\S]*?)(sentence: '[^']*')([\\s\\S]*?)(translation: '[^']*')([\\s\\S]*?)(paperTitle: '[^']*')([\\s\\S]*?)(category: '[^']*')([\\s\\S]*?\\})`, 'g');
    
    updatedContent = updatedContent.replace(wordPattern, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16) => {
      return `${p1}englishMeaning: '${word.englishMeaning}'${p3}meaning: '${word.meaning}'${p5}partOfSpeech: '${word.partOfSpeech}'${p7}pronunciation: '${word.pronunciation}'${p9}sentence: '${word.sentence}'${p11}translation: '${word.translation}'${p13}paperTitle: 'Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting'${p15}category: '${word.category}'${p16}`;
    });
  });
  
  // 保存更新后的内容
  fs.writeFileSync(appJsPath, updatedContent, 'utf8');
  console.log('已更新重复词汇的数据');
  
  return {
    existingWords: existingWords.length,
    newWords: newWords.length
  };
}

// 主函数
function main() {
  try {
    console.log('开始检查重复词汇...');
    
    const result = checkAndUpdateDuplicates();
    
    console.log(`\n检查完成！`);
    console.log(`- 重复词汇: ${result.existingWords} 个`);
    console.log(`- 新词汇: ${result.newWords} 个`);
    console.log(`- 总计: ${result.existingWords + result.newWords} 个词汇`);
  } catch (error) {
    console.error('检查过程中发生错误:', error);
  }
}

main();