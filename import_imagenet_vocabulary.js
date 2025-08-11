// import_imagenet_vocabulary.js
// 将ImageNet Classification with Deep Convolutional Neural Networks论文的词汇导入到小程序词汇库中

const VocabularyManager = require('./utils/vocabularyManager.js')

// 模拟微信小程序环境
global.wx = {
  setStorageSync: (key, data) => {
    console.log(`存储数据到 ${key}:`, data.length, '个词汇')
  },
  getStorageSync: (key) => {
    return []
  }
}

// 模拟应用实例
global.getApp = () => ({
  globalData: {
    words: []
  }
})

// 解析ImageNet论文词汇文件
function parseImageNetVocabulary() {
  const words = []
  let currentCategory = ''
  let currentWord = null
  let wordId = 1

  // 从文件中解析的词汇数据
  const rawWords = [
    // GRE高频词
    {
      word: 'Considerably',
      category: 'GRE高频词',
      pronunciation: '/kənˈsɪd.ə.r.ə.bli/',
      meaning: '相当大地，非常 (adverb)',
      englishMeaning: 'By a notably large amount or to a notably large extent; significantly.',
      sentence: 'On the test data, we achieved top-1 and top-5 error rates of 37.5% and 17.0% which is considerably better than the previous state-of-the-art.',
      translation: '在测试数据上，我们取得了37.5%的top-1错误率和17.0%的top-5错误率，这比之前的最佳水平要好得多。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Prohibitively',
      category: 'GRE高频词',
      pronunciation: '/proʊˈhɪb.ə.t̬ɪv.li/',
      meaning: '(价格等)过高地，令人望而却步地 (adverb)',
      englishMeaning: 'To an extent that forbids or prevents something.',
      sentence: 'Despite the attractive qualities of CNNs, and despite the relative efficiency of their local architecture, they have still been prohibitively expensive to apply in large scale to high-resolution images.',
      translation: '尽管卷积神经网络具有吸引人的特性，并且其局部架构相对高效，但将它们大规模应用于高分辨率图像仍然是极其昂贵的。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Inherent',
      category: 'GRE高频词',
      pronunciation: '/ɪnˈhɪr.ənt/',
      meaning: '固有的，内在的 (adjective)',
      englishMeaning: 'Existing in something as a permanent, essential, or characteristic attribute.',
      sentence: 'We wrote a highly-optimized GPU implementation of 2D convolution and all the other operations inherent in training convolutional neural networks, which we make available publicly.',
      translation: '我们编写了一个高度优化的GPU实现，用于2D卷积以及训练卷积神经网络所固有的所有其他操作，并将其公开。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Ambiguity',
      category: 'GRE高频词',
      pronunciation: '/ˌæm.bɪˈɡjuː.ə.t̬i/',
      meaning: '模棱两可，不明确 (noun)',
      englishMeaning: 'The quality of being open to more than one interpretation; inexactness.',
      sentence: 'In some cases (grille, cherry) there is genuine ambiguity about the intended focus of the photograph.',
      translation: '在某些情况下（例如格栅、樱桃），照片的预期焦点确实存在模棱两可之处。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Ultimately',
      category: 'GRE高频词',
      pronunciation: '/ˈʌl.tə.mət.li/',
      meaning: '最终，根本上 (adverb)',
      englishMeaning: 'In the end; finally.',
      sentence: 'Ultimately we would like to use very large and deep convolutional nets on video sequences where the temporal structure provides very helpful information that is missing or far less obvious in static images.',
      translation: '最终，我们希望在视频序列上使用非常大且深的卷积网络，其中时间结构提供了在静态图像中缺失或远不明显的非常有用的信息。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },

    // TOEFL高频词
    {
      word: 'Efficient',
      category: 'TOEFL高频词',
      pronunciation: '/ɪˈfɪʃ.ənt/',
      meaning: '高效的 (adjective)',
      englishMeaning: 'Achieving maximum productivity with minimum wasted effort or expense.',
      sentence: 'To make training faster, we used non-saturating neurons and a very efficient GPU implementation of the convolution operation.',
      translation: '为了加快训练速度，我们使用了非饱和神经元和一种非常高效的卷积运算GPU实现。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Augment',
      category: 'TOEFL高频词',
      pronunciation: '/ɑːɡˈment/',
      meaning: '增加，增强 (verb)',
      englishMeaning: 'To make something greater by adding to it; to increase.',
      sentence: 'Simple recognition tasks can be solved quite well with datasets of this size, especially if they are augmented with label-preserving transformations.',
      translation: '对于这种规模的数据集，简单的识别任务可以很好地解决，特别是如果通过保留标签的变换来增强数据。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Capacity',
      category: 'TOEFL高频词',
      pronunciation: '/kəˈpæs.ə.t̬i/',
      meaning: '容量，能力 (noun)',
      englishMeaning: 'The ability or power to do, experience, or understand something.',
      sentence: 'Their capacity can be controlled by varying their depth and breadth, and they also make strong and mostly correct assumptions about the nature of images.',
      translation: '它们的能力可以通过改变其深度和广度来控制，并且它们对图像的性质做出了强有力且基本正确的假设。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Facilitate',
      category: 'TOEFL高频词',
      pronunciation: '/fəˈsɪl.ə.teɪt/',
      meaning: '促进，使便利 (verb)',
      englishMeaning: 'To make an action or process easy or easier.',
      sentence: 'Luckily, current GPUs, paired with a highly-optimized implementation of 2D convolution, are powerful enough to facilitate the training of interestingly-large CNNs...',
      translation: '幸运的是，当前的GPU，配上一个高度优化的2D卷积实现，其功能强大到足以促进那些规模大到有趣的卷积神经网络的训练...',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Dimension',
      category: 'TOEFL高频词',
      pronunciation: '/ˌdaɪˈmen.ʃən/',
      meaning: '维度，尺寸 (noun)',
      englishMeaning: 'A measurable extent of a particular kind, such as length, breadth, depth, or height.',
      sentence: 'ImageNet consists of variable-resolution images, while our system requires a constant input dimensionality.',
      translation: 'ImageNet包含可变分辨率的图像，而我们的系统需要一个固定的输入维度。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Scheme',
      category: 'TOEFL高频词',
      pronunciation: '/skiːm/',
      meaning: '方案，计划 (noun)',
      englishMeaning: 'A large-scale systematic plan or arrangement for attaining a particular object or putting a particular idea into effect.',
      sentence: 'Without this scheme, our network suffers from substantial overfitting, which would have forced us to use much smaller networks.',
      translation: '如果没有这个方案，我们的网络会遭受严重的过拟合，这将迫使我们使用小得多的网络。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Initialize',
      category: 'TOEFL高频词',
      pronunciation: '/ɪˈnɪʃ.ə.laɪz/',
      meaning: '初始化 (verb)',
      englishMeaning: 'To set the starting value of a variable or process.',
      sentence: 'We initialized the weights in each layer from a zero-mean Gaussian distribution with standard deviation 0.01.',
      translation: '我们从一个均值为零、标准差为0.01的高斯分布中初始化了每一层的权重。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Qualitative',
      category: 'TOEFL高频词',
      pronunciation: '/ˈkwɑː.lə.teɪ.t̬ɪv/',
      meaning: '定性的 (adjective)',
      englishMeaning: 'Relating to, measuring, or measured by the quality of something rather than its quantity.',
      sentence: 'In the left panel of Figure 4 we qualitatively assess what the network has learned by computing its top-5 predictions on eight test images.',
      translation: '在图4的左侧面板中，我们通过计算网络对八张测试图像的top-5预测，来定性地评估网络学到了什么。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },

    // IELTS高频词
    {
      word: 'Approach',
      category: 'IELTS高频词',
      pronunciation: '/əˈproʊtʃ/',
      meaning: '方法，途径 (noun)',
      englishMeaning: 'A way of dealing with a situation or problem.',
      sentence: 'Current approaches to object recognition make essential use of machine learning methods.',
      translation: '当前的物体识别方法主要利用机器学习方法。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Technique',
      category: 'IELTS高频词',
      pronunciation: '/tekˈniːk/',
      meaning: '技术，技巧 (noun)',
      englishMeaning: 'A way of carrying out a particular task, especially the execution or performance of an artistic work or a scientific procedure.',
      sentence: 'To improve their performance, we can collect larger datasets, learn more powerful models, and use better techniques for preventing overfitting.',
      translation: '为了提升它们的性能，我们可以收集更大的数据集，学习更强大的模型，以及使用更好的技术来防止过拟合。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Consist of',
      category: 'IELTS高频词',
      pronunciation: '/kənˈsɪst əv/',
      meaning: '由…组成 (phrasal verb)',
      englishMeaning: 'To be composed or made up of.',
      sentence: 'The neural network, which has 60 million parameters and 650,000 neurons, consists of five convolutional layers...',
      translation: '这个拥有6000万参数和65万个神经元的神经网络，由五个卷积层组成...',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Vary',
      category: 'IELTS高频词',
      pronunciation: '/ˈveə.ri/',
      meaning: '变化，不同 (verb)',
      englishMeaning: 'To differ in size, amount, degree, or nature from something else of the same general class.',
      sentence: 'Their capacity can be controlled by varying their depth and breadth...',
      translation: '它们的能力可以通过改变其深度和广度来控制...',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Architecture',
      category: 'IELTS高频词',
      pronunciation: '/ˈɑːr.kə.tek.tʃɚ/',
      meaning: '架构，结构 (noun)',
      englishMeaning: 'The complex or carefully designed structure of something.',
      sentence: 'Below, we describe some of the novel or unusual features of our network\'s architecture.',
      translation: '下面，我们描述了我们网络架构的一些新颖或不寻常的特点。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Impose',
      category: 'IELTS高频词',
      pronunciation: '/ɪmˈpoʊz/',
      meaning: '强加，施加 (verb)',
      englishMeaning: 'To force an unwelcome decision or ruling on someone.',
      sentence: 'Although the 1000 classes of ILSVRC make each training example impose 10 bits of constraint on the mapping from image to label, this turns out to be insufficient to learn so many parameters without considerable overfitting.',
      translation: '尽管ILSVRC的1000个类别使得每个训练样本对从图像到标签的映射施加了10比特的约束，但这对于学习如此多的参数而没有相当大的过拟合来说是不足够的。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Convention',
      category: 'IELTS高频词',
      pronunciation: '/kənˈven.ʃən/',
      meaning: '惯例，常规 (noun)',
      englishMeaning: 'A way in which something is usually done.',
      sentence: 'On this dataset we follow the convention in the literature of using half of the images for training and half for testing.',
      translation: '在这个数据集上，我们遵循文献中的惯例，即使用一半的图像进行训练，一半进行测试。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },

    // AI领域专有词
    {
      word: 'Convolutional Neural Network (CNN)',
      category: 'AI专业词汇',
      pronunciation: '/ˌkɑːn.vəˈluː.ʃən.əl ˈnʊr.əl ˈnet.wɝːk/',
      meaning: '卷积神经网络 (noun phrase)',
      englishMeaning: 'A class of deep neural networks, most commonly applied to analyzing visual imagery.',
      sentence: 'We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images...',
      translation: '我们训练了一个大型的深度卷积神经网络来对120万张高分辨率图像进行分类...',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Overfitting',
      category: 'AI专业词汇',
      pronunciation: '/ˌoʊ.vɚˈfɪt̬.ɪŋ/',
      meaning: '过拟合 (noun)',
      englishMeaning: 'The production of an analysis that corresponds too closely or exactly to a particular set of data, and may therefore fail to fit additional data or predict future observations reliably.',
      sentence: 'To reduce overfitting in the fully-connected layers we employed a recently-developed regularization method called "dropout"...',
      translation: '为了减少全连接层中的过拟合，我们采用了一种最近开发的名为"dropout"的正则化方法...',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Regularization',
      category: 'AI专业词汇',
      pronunciation: '/ˌreɡ.jə.ləˈzeɪ.ʃən/',
      meaning: '正则化 (noun)',
      englishMeaning: 'A process in machine learning that adds a penalty term to the objective function to discourage complex models, thus avoiding overfitting.',
      sentence: 'To reduce overfitting in the fully-connected layers we employed a recently-developed regularization method called "dropout" that proved to be very effective.',
      translation: '为了减少全连接层中的过拟合，我们采用了一种最近开发的名为"dropout"的正则化方法，它被证明非常有效。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Softmax',
      category: 'AI专业词汇',
      pronunciation: '/ˈsɑːft.mæks/',
      meaning: 'Softmax函数 (归一化指数函数) (noun)',
      englishMeaning: 'A function that takes as input a vector of K real numbers, and normalizes it into a probability distribution consisting of K probabilities proportional to the exponentials of the input numbers.',
      sentence: 'The neural network...consists of five convolutional layers...and three fully-connected layers with a final 1000-way softmax.',
      translation: '该神经网络...由五个卷积层...和三个带有最终1000路softmax的全连接层组成。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Max-pooling',
      category: 'AI专业词汇',
      pronunciation: '/mæks ˈpuː.lɪŋ/',
      meaning: '最大池化 (noun)',
      englishMeaning: 'A pooling operation that calculates the maximum value for patches of a feature map, and uses it to create a downsampled feature map.',
      sentence: 'The neural network... consists of five convolutional layers, some of which are followed by max-pooling layers...',
      translation: '该神经网络...由五个卷积层组成，其中一些层后面跟着最大池化层...',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'ReLU (Rectified Linear Unit)',
      category: 'AI专业词汇',
      pronunciation: '/ˈriː.luː/',
      meaning: '修正线性单元 (noun)',
      englishMeaning: 'An activation function defined as the positive part of its argument: f(x) = max(0, x).',
      sentence: 'Deep convolutional neural networks with ReLUs train several times faster than their equivalents with tanh units.',
      translation: '带有ReLU的深度卷积神经网络比其带有tanh单元的等效网络训练速度快好几倍。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Dropout',
      category: 'AI专业词汇',
      pronunciation: '/ˈdrɑːp.aʊt/',
      meaning: 'Dropout (随机失活) (noun)',
      englishMeaning: 'A regularization technique for neural networks that prevents co-adaptation of neurons by setting the output of each hidden neuron to zero with a certain probability.',
      sentence: 'The recently-introduced technique, called "dropout", consists of setting to zero the output of each hidden neuron with probability 0.5.',
      translation: '最近引入的这项名为"dropout"的技术，其内容是以0.5的概率将每个隐藏神经元的输出设置为零。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Fully-connected layer',
      category: 'AI专业词汇',
      pronunciation: '/ˈfʊl.i kəˈnek.tɪd ˈleɪ.ɚ/',
      meaning: '全连接层 (noun phrase)',
      englishMeaning: 'A layer in an artificial neural network in which every neuron in the layer is connected to every neuron in the preceding layer.',
      sentence: 'To reduce overfitting in the fully-connected layers we employed a recently-developed regularization method called "dropout"...',
      translation: '为了减少全连接层中的过拟合，我们采用了一种最近开发的名为"dropout"的正则化方法...',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Back-propagation',
      category: 'AI专业词汇',
      pronunciation: '/bæk ˌprɑː.pəˈɡeɪ.ʃən/',
      meaning: '反向传播 (noun)',
      englishMeaning: 'An algorithm for supervised learning of artificial neural networks using gradient descent, where the error is "back-propagated" through the network to adjust weights.',
      sentence: 'The neurons which are "dropped out" in this way do not contribute to the forward pass and do not participate in back-propagation.',
      translation: '以这种方式被"丢弃"的神经元既不参与前向传播，也不参与反向传播。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Stochastic Gradient Descent (SGD)',
      category: 'AI专业词汇',
      pronunciation: '/stoʊˈkæs.tɪk ˈɡreɪ.di.ənt dɪˈsent/',
      meaning: '随机梯度下降 (noun phrase)',
      englishMeaning: 'An iterative method for optimizing an objective function with suitable smoothness properties, where a single or a mini-batch of samples is used to approximate the gradient.',
      sentence: 'We trained our models using stochastic gradient descent with a batch size of 128 examples, momentum of 0.9, and weight decay of 0.0005.',
      translation: '我们使用随机梯度下降法训练我们的模型，批量大小为128个样本，动量为0.9，权重衰减为0.0005。',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    },
    {
      word: 'Hyper-parameter',
      category: 'AI专业词汇',
      pronunciation: '/ˈhaɪ.pɚ pəˈræm.ə.t̬ɚ/',
      meaning: '超参数 (noun)',
      englishMeaning: 'A parameter whose value is used to control the learning process, and which is set before the learning process begins.',
      sentence: 'The constants k, n, α, and β are hyper-parameters whose values are determined using a validation set...',
      translation: '常数k, n, α, 和β是超参数，其值通过一个验证集来确定...',
      paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks'
    }
  ]

  // 为每个词汇添加必要的字段
  return rawWords.map((word, index) => ({
    ...word,
    id: wordId + index,
    difficulty: getDifficulty(word.word),
    studyCount: 0,
    correctCount: 0,
    lastStudyTime: null,
    status: 'learning',
    weeklyStudyCount: 0
  }))
}

// 根据词汇确定难度
function getDifficulty(word) {
  if (word.length <= 5) return 'easy'
  if (word.length <= 8) return 'medium'
  return 'hard'
}

// 主函数：导入ImageNet词汇
function importImageNetVocabulary() {
  console.log('=== 开始导入ImageNet论文词汇 ===')
  
  const vocabularyManager = new VocabularyManager()
  
  // 解析词汇数据
  const newWords = parseImageNetVocabulary()
  console.log(`解析到 ${newWords.length} 个词汇`)
  
  // 显示词汇分类统计
  const categoryStats = {}
  newWords.forEach(word => {
    if (!categoryStats[word.category]) {
      categoryStats[word.category] = 0
    }
    categoryStats[word.category]++
  })
  
  console.log('词汇分类统计:')
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个`)
  })
  
  // 添加新词汇到词汇库
  const result = vocabularyManager.addNewWords(newWords)
  
  console.log('导入结果:')
  console.log(`  - 总词汇数: ${result.total}`)
  console.log(`  - 新增词汇数: ${result.added}`)
  console.log(`  - 跳过重复数: ${result.skipped}`)
  
  // 获取更新后的统计信息
  const stats = vocabularyManager.getVocabularyStats()
  
  console.log('更新后的统计信息:')
  console.log(`  - 总词汇数: ${stats.total}`)
  console.log('  - 按分类统计:')
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`    ${category}: ${count} 个`)
  })
  console.log('  - 按难度统计:')
  Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
    console.log(`    ${difficulty}: ${count} 个`)
  })
  console.log('  - 按论文统计:')
  Object.entries(stats.byPaper).forEach(([paper, count]) => {
    console.log(`    ${paper}: ${count} 个`)
  })
  
  console.log('=== ImageNet论文词汇导入完成 ===')
  
  return result
}

// 如果直接运行此脚本
if (require.main === module) {
  importImageNetVocabulary()
}

module.exports = {
  importImageNetVocabulary,
  parseImageNetVocabulary
}

