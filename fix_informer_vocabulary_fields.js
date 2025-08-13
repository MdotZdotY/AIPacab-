// fix_informer_vocabulary_fields.js
// 修复app.js中Informer论文词汇的空字段

const fs = require('fs');
const path = require('path');

// Informer论文词汇的完整数据
const informerVocabulary = {
  'Multi-horizon Forecasting': {
    englishMeaning: 'The prediction of a time series for multiple steps into the future.',
    meaning: '多步预测',
    partOfSpeech: 'noun phrase',
    pronunciation: '/ˈmʌl.ti həˈraɪ.zən ˈfɔːr.kæst.ɪŋ/',
    sentence: 'We propose a novel interpretable deep learning model for **multi-horizon forecasting**.',
    translation: '我们为多步预测提出了一种新颖的、可解释的深度学习模型。'
  },
  'Recurrent Neural Network (RNN)': {
    englishMeaning: 'A class of artificial neural networks where connections between nodes form a directed graph along a temporal sequence.',
    meaning: '循环神经网络',
    partOfSpeech: 'noun phrase',
    pronunciation: '/rɪˈkɝː.ənt ˈnʊr.əl ˈnet.wɝːk/',
    sentence: 'In particular, **recurrent neural networks** (RNNs) have become a popular choice for time series forecasting...',
    translation: '特别是，循环神经网络（RNN）已成为时间序列预测的流行选择...'
  },
  'Self-attention': {
    englishMeaning: 'An attention mechanism relating different positions of a single sequence to compute a representation of the sequence.',
    meaning: '自注意力',
    partOfSpeech: 'noun',
    pronunciation: '/self əˈten.ʃən/',
    sentence: 'On the other hand, **self-attention** mechanisms... have been shown to be very effective in learning long-term dependencies.',
    translation: '另一方面，自注意力机制...已被证明在学习长期依赖关系方面非常有效。'
  },
  'Transformer': {
    englishMeaning: 'A deep learning model architecture that uses self-attention, differentially weighting the significance of each part of the input data.',
    meaning: 'Transformer模型',
    partOfSpeech: 'noun',
    pronunciation: '/trænsˈfɔːr.mɚ/',
    sentence: 'In particular, our proposed model, the Temporal Fusion **Transformer** (TFT), is designed to incorporate the best ideas from... transformers.',
    translation: '特别是，我们提出的模型——时间融合变换器（TFT），旨在融合...变换器的最佳思想。'
  },
  'Encoder': {
    englishMeaning: 'The part of a neural network that maps the input to a different representation, often a lower-dimensional one.',
    meaning: '编码器',
    partOfSpeech: 'noun',
    pronunciation: '/ɪnˈkoʊ.dɚ/',
    sentence: 'The **encoder** is designed to extract the long-range dependencies of the inputs.',
    translation: '编码器旨在提取输入的长程依赖关系。'
  },
  'Decoder': {
    englishMeaning: 'The part of a neural network that generates the output sequence from the encoder\'s representation.',
    meaning: '解码器',
    partOfSpeech: 'noun',
    pronunciation: '/diːˈkoʊ.dɚ/',
    sentence: 'The **decoder** can generate long sequential outputs through one forward procedure.',
    translation: '解码器可以通过一次前向传播过程生成长的序列输出。'
  },
  'State-of-the-art': {
    englishMeaning: 'The highest level of general development, as of a device, technique, or scientific field, achieved at a particular time.',
    meaning: '最先进的水平',
    partOfSpeech: 'noun / adjective',
    pronunciation: '/steɪt əv ði ɑːrt/',
    sentence: '...the canonical Transformer has become the **state-of-the-art** model for sequence modeling tasks.',
    translation: '……标准的Transformer已成为序列建模任务中最先进的模型。'
  },
  'Benchmark': {
    englishMeaning: 'A standard or point of reference against which things may be compared or assessed.',
    meaning: '基准',
    partOfSpeech: 'noun',
    pronunciation: '/ˈbentʃ.mɑːrk/',
    sentence: 'We demonstrate significant performance improvements over existing **benchmarks**.',
    translation: '我们展示了相较于现有基准的显著性能提升。'
  },
  'Autoregressive decoding': {
    englishMeaning: 'A decoding process where each output element is generated based on the previously generated elements in a step-by-step manner.',
    meaning: '自回归解码',
    partOfSpeech: 'noun phrase',
    pronunciation: '/ˌɔː.t̬oʊ.rɪˈɡres.ɪv diːˈkoʊ.dɪŋ/',
    sentence: 'The dynamic decoding of vanilla Transformer makes the inference speed for long-sequence predictions unbearably slow due to its **autoregressive decoding** fashion.',
    translation: '原始Transformer的动态解码由于其自回归的解码方式，使得长序列预测的推理速度慢得难以忍受。'
  },
  'Hyperparameter': {
    englishMeaning: 'A parameter whose value is used to control the learning process and which is set before the learning process begins.',
    meaning: '超参数',
    partOfSpeech: 'noun',
    pronunciation: '/ˈhaɪ.pɚ pəˈræm.ə.t̬ɚ/',
    sentence: 'We conduct the experiments of **hyperparameter** sensitivity on the ETTh1 dataset.',
    translation: '我们在ETTh1数据集上进行了超参数敏感性的实验。'
  },
  'Ubiquitous': {
    englishMeaning: 'Present, appearing, or found everywhere.',
    meaning: '无处不在的，普遍存在的',
    partOfSpeech: 'adjective',
    pronunciation: '/juːˈbɪk.wə.t̬əs/',
    sentence: 'With the **ubiquitous** nature of time series data in the modern world, forecasting is an important task in many domains...',
    translation: '随着时间序列数据在现代世界中的无处不在，预测在许多领域都是一项重要任务...'
  },
  'Ablation': {
    englishMeaning: 'In machine learning, a study wherein components of an AI system are removed or replaced to determine their impact on the performance of the system.',
    meaning: '消融研究',
    partOfSpeech: 'noun',
    pronunciation: '/əˈbleɪ.ʃən/',
    sentence: 'We also perform a full **ablation** analysis to evaluate the contribution of each component of Informer.',
    translation: '我们还进行了一次完整的消融分析，以评估Informer各个组件的贡献。'
  },
  'Robust': {
    englishMeaning: 'Strong and healthy; vigorous. In a technical sense, able to withstand or overcome adverse conditions.',
    meaning: '鲁棒的，稳健的',
    partOfSpeech: 'adjective',
    pronunciation: '/ˈroʊ.bʌst/',
    sentence: 'The self-attention distilling operation privileges the superior tokens with dominant features and builds a focused self-attention feature map on the next layer, which makes the model more **robust** to noisy inputs.',
    translation: '自注意力蒸馏操作优先考虑具有主导特征的优越词元，并在下一层构建一个集中的自注意力特征图，这使得模型对噪声输入更加鲁棒。'
  },
  'Empirical': {
    englishMeaning: 'Based on, concerned with, or verifiable by observation or experience rather than theory or pure logic.',
    meaning: '基于经验的，实证的',
    partOfSpeech: 'adjective',
    pronunciation: '/ɪmˈpɪr.ɪ.kəl/',
    sentence: 'We establish that Informer shows high **empirical** performance in our experiments...',
    translation: '我们证实了Informer在我们的实验中表现出很高的实证性能...'
  },
  'Prohibitively': {
    englishMeaning: 'To an extent that forbids or prevents something, especially because of the high cost.',
    meaning: '(成本)过高地，令人望而却步地',
    partOfSpeech: 'adverb',
    pronunciation: '/proʊˈhɪb.ə.t̬ɪv.li/',
    sentence: 'However, the `L`-quadratic computation and memory usage per layer make it **prohibitively** expensive for LSTF problems.',
    translation: '然而，每层`L`的二次方计算量和内存使用量使其在长序列时间序列预测问题上的成本高得令人望而却步。'
  },
  'Limitation': {
    englishMeaning: 'A limiting rule or circumstance; a restriction.',
    meaning: '限制，局限性',
    partOfSpeech: 'noun',
    pronunciation: '/ˌlɪm.əˈteɪ.ʃən/',
    sentence: '...allowing for processing longer sequential inputs under the memory usage **limitation**.',
    translation: '...允许在内存使用限制下处理更长的序列输入。'
  },
  'Significant': {
    englishMeaning: 'Sufficiently great or important to be worthy of attention; noteworthy.',
    meaning: '显著的，重要的',
    partOfSpeech: 'adjective',
    pronunciation: '/sɪɡˈnɪf.ə.kənt/',
    sentence: 'Using a range of real-world datasets, we demonstrate **significant** performance improvements over existing benchmarks.',
    translation: '通过一系列真实世界的数据集，我们展示了相较于现有基准的显著性能提升。'
  },
  'Component': {
    englishMeaning: 'A part or element of a larger whole.',
    meaning: '组件，组成部分',
    partOfSpeech: 'noun',
    pronunciation: '/kəmˈpoʊ.nənt/',
    sentence: 'This section details each of the main **components** of Informer, from bottom to top.',
    translation: '本节从下至上详细介绍了Informer的每一个主要组件。'
  },
  'Utilize': {
    englishMeaning: 'To make practical and effective use of.',
    meaning: '利用',
    partOfSpeech: 'verb',
    pronunciation: '/ˈjuː.t̬əl.aɪz/',
    sentence: 'The encoder is designed to **utilize** the ProbSparse self-attention mechanism...',
    translation: '编码器被设计用来利用ProbSparse自注意力机制...'
  },
  'Efficient': {
    englishMeaning: 'Achieving maximum productivity with minimum wasted effort or expense.',
    meaning: '高效的',
    partOfSpeech: 'adjective',
    pronunciation: '/ɪˈfɪʃ.ənt/',
    sentence: 'We design an **efficient** time-series forecasting model, named Informer...',
    translation: '我们设计了一个高效的时间序列预测模型，名为Informer...'
  },
  'Dominate': {
    englishMeaning: 'To be the most important or conspicuous person or thing.',
    meaning: '主导，支配',
    partOfSpeech: 'verb',
    pronunciation: '/ˈdɑː.mə.neɪt/',
    sentence: 'The self-attention distilling operation privileges the superior tokens with **dominant** features...',
    translation: '自注意力蒸馏操作优先考虑具有主导特征的优越词元...'
  },
  'Require': {
    englishMeaning: 'To need something or make something necessary.',
    meaning: '需要，要求',
    partOfSpeech: 'verb',
    pronunciation: '/rɪˈkwaɪər/',
    sentence: 'Multi-horizon time series forecasting often **requires** a model to be aware of inputs of various natures.',
    translation: '多步时间序列预测通常要求模型能够感知各种性质的输入。'
  },
  'Generate': {
    englishMeaning: 'To produce or create something.',
    meaning: '生成，产生',
    partOfSpeech: 'verb',
    pronunciation: '/ˈdʒen.ə.reɪt/',
    sentence: 'The decoder receives long sequence inputs, including the start token and the target sequence, then **generates** outputs in a generative way.',
    translation: '解码器接收长序列输入，包括起始词元和目标序列，然后以生成的方式产出输出。'
  },
  'Architecture': {
    englishMeaning: 'The complex or carefully designed structure of something.',
    meaning: '架构，结构',
    partOfSpeech: 'noun',
    pronunciation: '/ˈɑːr.kə.tek.tʃɚ/',
    sentence: 'We propose a novel attention-based **architecture** which addresses these challenges...',
    translation: '我们提出了一种新颖的、基于注意力的架构来应对这些挑战...'
  },
  'Incorporate': {
    englishMeaning: 'To take in or contain something as part of a whole; to include.',
    meaning: '包含，并入',
    partOfSpeech: 'verb',
    pronunciation: '/ɪnˈkɔːr.pə.reɪt/',
    sentence: '...our proposed model, the Informer, is designed to **incorporate** the best ideas from recurrent neural networks (RNNs) and transformers.',
    translation: '...我们提出的模型——Informer，旨在融合循环神经网络（RNN）和变换器的最佳思想。'
  },
  'Demonstrate': {
    englishMeaning: 'To clearly show the existence or truth of something by giving proof or evidence.',
    meaning: '展示，证明',
    partOfSpeech: 'verb',
    pronunciation: '/ˈdem.ən.streɪt/',
    sentence: 'Using a range of real-world datasets, we **demonstrate** significant performance improvements over existing benchmarks.',
    translation: '通过一系列真实世界的数据集，我们展示了相较于现有基准的显著性能提升。'
  },
  'Interaction': {
    englishMeaning: 'Communication or direct involvement with someone or something.',
    meaning: '交互，相互作用',
    partOfSpeech: 'noun',
    pronunciation: '/ˌɪn.t̬ɚˈæk.ʃən/',
    sentence: 'We also demonstrate how Informer can be used to understand the importance of different features and visualize temporal **interactions**.',
    translation: '我们还演示了如何使用Informer来理解不同特征的重要性并可视化时间上的相互作用。'
  },
  'Challenge': {
    englishMeaning: 'A task or situation that tests someone\'s abilities.',
    meaning: '挑战',
    partOfSpeech: 'noun',
    pronunciation: '/ˈtʃæl.ɪndʒ/',
    sentence: 'In this paper, we propose a novel attention-based architecture which addresses these **challenges**...',
    translation: '在这篇论文中，我们提出了一种新颖的基于注意力的架构，它解决了这些挑战...'
  },
  'Propose': {
    englishMeaning: 'To put forward an idea or plan for consideration.',
    meaning: '提出，提议',
    partOfSpeech: 'verb',
    pronunciation: '/prəˈpoʊz/',
    sentence: 'To address the first challenge, we **propose** a ProbSparse self-attention mechanism.',
    translation: '为了应对第一个挑战，我们提出了一种ProbSparse自注意力机制。'
  },
  'Evaluate': {
    englishMeaning: 'To form an idea of the amount, number, or value of; to assess.',
    meaning: '评估',
    partOfSpeech: 'verb',
    pronunciation: '/ɪˈvæl.ju.eɪt/',
    sentence: 'We also perform a full ablation analysis to **evaluate** the contribution of each component of Informer.',
    translation: '我们还进行了一次完整的消融分析，以评估Informer各个组件的贡献。'
  }
};

// 修复app.js中的词汇字段
function fixVocabularyFields() {
  const appJsPath = path.join(__dirname, 'app.js');
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  let updatedCount = 0;
  
  // 遍历所有Informer词汇
  for (const [word, data] of Object.entries(informerVocabulary)) {
    // 构建正则表达式来匹配词汇对象
    const wordPattern = new RegExp(
      `(\\{\\s*id:\\s*\\d+,\\s*word:\\s*'${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*englishMeaning:\\s*'[^']*',\\s*meaning:\\s*'[^']*',\\s*partOfSpeech:\\s*'[^']*',\\s*pronunciation:\\s*'[^']*',\\s*sentence:\\s*'[^']*',\\s*translation:\\s*'[^']*',\\s*paperTitle:\\s*'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting',\\s*category:\\s*'[^']*',\\s*difficulty:\\s*'[^']*',\\s*studyCount:\\s*\\d+,\\s*correctCount:\\s*\\d+,\\s*lastStudyTime:\\s*[^,]+,\\s*status:\\s*'[^']*',\\s*weeklyStudyCount:\\s*\\d+\\s*\\})`,
      'g'
    );
    
    // 构建替换字符串
    const replacement = `{
        id: $1,
        word: '${word}',
        englishMeaning: '${data.englishMeaning}',
        meaning: '${data.meaning}',
        partOfSpeech: '${data.partOfSpeech}',
        pronunciation: '${data.pronunciation}',
        sentence: '${data.sentence}',
        translation: '${data.translation}',
        paperTitle: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting',
        category: '${word.includes('(') ? 'AI专业词汇' : 'GRE高频词'}',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      }`;
    
    // 执行替换
    const newContent = content.replace(wordPattern, replacement);
    if (newContent !== content) {
      content = newContent;
      updatedCount++;
      console.log(`✓ 已修复词汇: ${word}`);
    }
  }
  
  // 保存修改后的文件
  fs.writeFileSync(appJsPath, content, 'utf8');
  console.log(`\n修复完成！共更新了 ${updatedCount} 个词汇的字段。`);
}

// 主函数
function main() {
  try {
    console.log('开始修复Informer论文词汇字段...');
    fixVocabularyFields();
    console.log('Informer论文词汇字段修复完成！');
  } catch (error) {
    console.error('修复过程中发生错误:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  informerVocabulary,
  fixVocabularyFields
};

