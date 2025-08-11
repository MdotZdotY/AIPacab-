// app.js
App({
  onLaunch() {
    // 云开发功能已禁用，使用本地存储模式
    // if (wx.cloud) {
    //   try {
    //     wx.cloud.init({
    //       env: 'cloudbase-2g7pmtv3e63f7151', // 替换为你的环境ID
    //       traceUser: true,
    //     })
    //     console.log('云开发初始化成功')
    //   } catch (error) {
    //     console.error('云开发初始化失败:', error)
    //   }
    // } else {
    //   console.warn('当前环境不支持云开发')
    // }
    console.log('应用启动，使用本地存储模式')
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查是否需要重置词库（已禁用，保持默认词汇数据）
    // const RESET_FLAG = 'vocab_reset_2025_08_09'
    // try {
    //   if (!wx.getStorageSync(RESET_FLAG)) {
    //     wx.setStorageSync('words', [])
    //     wx.setStorageSync(RESET_FLAG, true)
    //     console.log('已清空词库（一次性重置）')
    //   }
    // } catch (e) {
    //   console.warn('重置词库失败:', e)
    // }

    // 从本地存储加载词汇数据
    this.loadVocabularyData()

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功', res)
      }
    })
  },

  // 从本地存储加载词汇数据
  loadVocabularyData() {
    try {
      // 强制使用内置词汇数据，忽略本地存储
      console.log('强制使用内置词汇数据，共', this.globalData.words.length, '个词汇')
      this.globalData.words = this.normalizeCategories(this.globalData.words)
      // 更新本地存储为内置数据
      wx.setStorageSync('words', this.globalData.words)
      console.log('已更新本地存储为内置词汇数据')
    } catch (error) {
      console.error('加载词汇数据失败:', error)
      // 如果加载失败，确保有默认数据
      if (!this.globalData.words || this.globalData.words.length === 0) {
        console.log('使用内置默认词汇数据')
      }
    }
  },
  
  // 统一规范分类名称，消除别名/空白差异
  normalizeCategories(words) {
    const aliasMap = new Map([
      ['GRE高频词', 'GRE高频词'],
      ['GRE高频词汇', 'GRE高频词'],
      ['TOEFL高频词', 'TOEFL高频词'],
      ['TOEFL高频词汇', 'TOEFL高频词'],
      ['AI专业词汇', 'AI专业词汇'],
      ['AI领域常用及专有词汇', 'AI专业词汇'],
      ['AI领域内常用词和专有词', 'AI专业词汇'],
      ['IELTS高频词', 'IELTS高频词'],
      ['IELTS高频词汇', 'IELTS高频词']
    ])
    return (words || []).map(w => ({
      ...w,
      category: aliasMap.get((w.category || '').trim()) || 'AI专业词汇'
    }))
  },
  
  // 添加云数据库操作方法
  async syncWordsToCloud() {
    try {
      const db = wx.cloud.database()
      const words = this.globalData.words
      
      // 批量上传词汇到云数据库
      for (let word of words) {
        await db.collection('vocabulary').add({
          data: word
        })
      }
      console.log('词汇同步到云端成功')
    } catch (error) {
      console.error('同步失败:', error)
    }
  },
  
  // 从云端获取词汇数据
  async getWordsFromCloud() {
    try {
      const db = wx.cloud.database()
      const result = await db.collection('vocabulary').get()
      console.log('从云端获取词汇成功:', result.data.length, '个词汇')
      return result.data
    } catch (error) {
      console.error('从云端获取词汇失败:', error)
      return []
    }
  },
  
  // 更新云端词汇数据
  async updateWordInCloud(wordId, updateData) {
    try {
      const db = wx.cloud.database()
      await db.collection('vocabulary').doc(wordId).update({
        data: updateData
      })
      console.log('云端词汇更新成功')
    } catch (error) {
      console.error('云端词汇更新失败:', error)
    }
  },
  
  // 删除云端词汇
  async deleteWordFromCloud(wordId) {
    try {
      const db = wx.cloud.database()
      await db.collection('vocabulary').doc(wordId).remove()
      console.log('云端词汇删除成功')
    } catch (error) {
      console.error('云端词汇删除失败:', error)
    }
  },
  globalData: {
    userInfo: null,
    // 词汇数据 - 从Attention Is All You Need论文中提取
        // 词汇数据 - 从论文中提取
    words: [
      {
        id: 1,
        word: 'Considerably',
        englishMeaning: 'By a notably large amount or to a notably large extent; significantly.',
        meaning: '相当大地，非常 (adverb)',
        partOfSpeech: 'adverb',
        pronunciation: '/kənˈsɪd.ə.r.ə.bli/',
        sentence: 'On the test data, we achieved top-1 and top-5 error rates of 37.5% and 17.0% which is considerably better than the previous state-of-the-art.',
        translation: '在测试数据上，我们取得了37.5%的top-1错误率和17.0%的top-5错误率，这比之前的最佳水平要好得多。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'GRE高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 2,
        word: 'Prohibitively',
        englishMeaning: 'To an extent that forbids or prevents something.',
        meaning: '(价格等)过高地，令人望而却步地 (adverb)',
        partOfSpeech: 'adverb',
        pronunciation: '/proʊˈhɪb.ə.t̬ɪv.li/',
        sentence: 'Despite the attractive qualities of CNNs, and despite the relative efficiency of their local architecture, they have still been prohibitively expensive to apply in large scale to high-resolution images.',
        translation: '尽管卷积神经网络具有吸引人的特性，并且其局部架构相对高效，但将它们大规模应用于高分辨率图像仍然是极其昂贵的。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'GRE高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 3,
        word: 'Inherent',
        englishMeaning: 'Existing in something as a permanent, essential, or characteristic attribute.',
        meaning: '固有的，内在的 (adjective)',
        partOfSpeech: 'adjective',
        pronunciation: '/ɪnˈhɪr.ənt/',
        sentence: 'We wrote a highly-optimized GPU implementation of 2D convolution and all the other operations inherent in training convolutional neural networks, which we make available publicly.',
        translation: '我们编写了一个高度优化的GPU实现，用于2D卷积以及训练卷积神经网络所固有的所有其他操作，并将其公开。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'GRE高频词',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 4,
        word: 'Ambiguity',
        englishMeaning: 'The quality of being open to more than one interpretation; inexactness.',
        meaning: '模棱两可，不明确 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/ˌæm.bɪˈɡjuː.ə.t̬i/',
        sentence: 'In some cases (grille, cherry) there is genuine ambiguity about the intended focus of the photograph.',
        translation: '在某些情况下（例如格栅、樱桃），照片的预期焦点确实存在模棱两可之处。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'GRE高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 5,
        word: 'Ultimately',
        englishMeaning: 'In the end; finally.',
        meaning: '最终，根本上 (adverb)',
        partOfSpeech: 'adverb',
        pronunciation: '/ˈʌl.tə.mət.li/',
        sentence: 'Ultimately we would like to use very large and deep convolutional nets on video sequences where the temporal structure provides very helpful information that is missing or far less obvious in static images.',
        translation: '最终，我们希望在视频序列上使用非常大且深的卷积网络，其中时间结构提供了在静态图像中缺失或远不明显的非常有用的信息。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'GRE高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 6,
        word: 'Efficient',
        englishMeaning: 'Achieving maximum productivity with minimum wasted effort or expense.',
        meaning: '高效的 (adjective)',
        partOfSpeech: 'adjective',
        pronunciation: '/ɪˈfɪʃ.ənt/',
        sentence: 'To make training faster, we used non-saturating neurons and a very efficient GPU implementation of the convolution operation.',
        translation: '为了加快训练速度，我们使用了非饱和神经元和一种非常高效的卷积运算GPU实现。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'TOEFL高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 7,
        word: 'Augment',
        englishMeaning: 'To make something greater by adding to it; to increase.',
        meaning: '增加，增强 (verb)',
        partOfSpeech: 'verb',
        pronunciation: '/ɑːɡˈment/',
        sentence: 'Simple recognition tasks can be solved quite well with datasets of this size, especially if they are augmented with label-preserving transformations.',
        translation: '对于这种规模的数据集，简单的识别任务可以很好地解决，特别是如果通过保留标签的变换来增强数据。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'TOEFL高频词',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 8,
        word: 'Capacity',
        englishMeaning: 'The ability or power to do, experience, or understand something.',
        meaning: '容量，能力 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/kəˈpæs.ə.t̬i/',
        sentence: 'Their capacity can be controlled by varying their depth and breadth, and they also make strong and mostly correct assumptions about the nature of images.',
        translation: '它们的能力可以通过改变其深度和广度来控制，并且它们对图像的性质做出了强有力且基本正确的假设。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'TOEFL高频词',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 9,
        word: 'Facilitate',
        englishMeaning: 'To make an action or process easy or easier.',
        meaning: '促进，使便利 (verb)',
        partOfSpeech: 'verb',
        pronunciation: '/fəˈsɪl.ə.teɪt/',
        sentence: 'Luckily, current GPUs, paired with a highly-optimized implementation of 2D convolution, are powerful enough to facilitate the training of interestingly-large CNNs...',
        translation: '幸运的是，当前的GPU，配上一个高度优化的2D卷积实现，其功能强大到足以促进那些规模大到有趣的卷积神经网络的训练...',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'TOEFL高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 10,
        word: 'Scheme',
        englishMeaning: 'A large-scale systematic plan or arrangement for attaining a particular object or putting a particular idea into effect.',
        meaning: '方案，计划 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/skiːm/',
        sentence: 'Without this scheme, our network suffers from substantial overfitting, which would have forced us to use much smaller networks.',
        translation: '如果没有这个方案，我们的网络会遭受严重的过拟合，这将迫使我们使用小得多的网络。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'TOEFL高频词',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 11,
        word: 'Initialize',
        englishMeaning: 'To set the starting value of a variable or process.',
        meaning: '初始化 (verb)',
        partOfSpeech: 'verb',
        pronunciation: '/ɪˈnɪʃ.ə.laɪz/',
        sentence: 'We initialized the weights in each layer from a zero-mean Gaussian distribution with standard deviation 0.01.',
        translation: '我们从一个均值为零、标准差为0.01的高斯分布中初始化了每一层的权重。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'TOEFL高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 12,
        word: 'Qualitative',
        englishMeaning: 'Relating to, measuring, or measured by the quality of something rather than its quantity.',
        meaning: '定性的 (adjective)',
        partOfSpeech: 'adjective',
        pronunciation: '/ˈkwɑː.lə.teɪ.t̬ɪv/',
        sentence: 'In the left panel of Figure 4 we qualitatively assess what the network has learned by computing its top-5 predictions on eight test images.',
        translation: '在图4的左侧面板中，我们通过计算网络对八张测试图像的top-5预测，来定性地评估网络学到了什么。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'TOEFL高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 13,
        word: 'Approach',
        englishMeaning: 'A way of dealing with a situation or problem.',
        meaning: '方法，途径 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/əˈproʊtʃ/',
        sentence: 'Current approaches to object recognition make essential use of machine learning methods.',
        translation: '当前的物体识别方法主要利用机器学习方法。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'IELTS高频词',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 14,
        word: 'Technique',
        englishMeaning: 'A way of carrying out a particular task, especially the execution or performance of an artistic work or a scientific procedure.',
        meaning: '技术，技巧 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/tekˈniːk/',
        sentence: 'To improve their performance, we can collect larger datasets, learn more powerful models, and use better techniques for preventing overfitting.',
        translation: '为了提升它们的性能，我们可以收集更大的数据集，学习更强大的模型，以及使用更好的技术来防止过拟合。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'IELTS高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 15,
        word: 'Consist of',
        englishMeaning: 'To be composed or made up of.',
        meaning: '由…组成 (phrasal verb)',
        partOfSpeech: 'phrasal verb',
        pronunciation: '/kənˈsɪst əv/',
        sentence: 'The neural network, which has 60 million parameters and 650,000 neurons, consists of five convolutional layers...',
        translation: '这个拥有6000万参数和65万个神经元的神经网络，由五个卷积层组成...',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'IELTS高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 16,
        word: 'Impose',
        englishMeaning: 'To force an unwelcome decision or ruling on someone.',
        meaning: '强加，施加 (verb)',
        partOfSpeech: 'verb',
        pronunciation: '/ɪmˈpoʊz/',
        sentence: 'Although the 1000 classes of ILSVRC make each training example impose 10 bits of constraint on the mapping from image to label, this turns out to be insufficient to learn so many parameters without considerable overfitting.',
        translation: '尽管ILSVRC的1000个类别使得每个训练样本对从图像到标签的映射施加了10比特的约束，但这对于学习如此多的参数而没有相当大的过拟合来说是不足够的。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'IELTS高频词',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 17,
        word: 'Convention',
        englishMeaning: 'A way in which something is usually done.',
        meaning: '惯例，常规 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/kənˈven.ʃən/',
        sentence: 'On this dataset we follow the convention in the literature of using half of the images for training and half for testing.',
        translation: '在这个数据集上，我们遵循文献中的惯例，即使用一半的图像进行训练，一半进行测试。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'IELTS高频词',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 18,
        word: 'Convolutional Neural Network (CNN)',
        englishMeaning: 'A class of deep neural networks, most commonly applied to analyzing visual imagery.',
        meaning: '卷积神经网络 (noun phrase)',
        partOfSpeech: 'noun phrase',
        pronunciation: '/ˌkɑːn.vəˈluː.ʃən.əl ˈnʊr.əl ˈnet.wɝːk/',
        sentence: 'We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images...',
        translation: '我们训练了一个大型的深度卷积神经网络来对120万张高分辨率图像进行分类...',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 19,
        word: 'Overfitting',
        englishMeaning: 'The production of an analysis that corresponds too closely or exactly to a particular set of data, and may therefore fail to fit additional data or predict future observations reliably.',
        meaning: '过拟合 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/ˌoʊ.vɚˈfɪt̬.ɪŋ/',
        sentence: 'To reduce overfitting in the fully-connected layers we employed a recently-developed regularization method called dropout...',
        translation: '为了减少全连接层中的过拟合，我们采用了一种最近开发的名为dropout的正则化方法...',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 20,
        word: 'Regularization',
        englishMeaning: 'A process in machine learning that adds a penalty term to the objective function to discourage complex models, thus avoiding overfitting.',
        meaning: '正则化 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/ˌreɡ.jə.ləˈzeɪ.ʃən/',
        sentence: 'To reduce overfitting in the fully-connected layers we employed a recently-developed regularization method called dropout that proved to be very effective.',
        translation: '为了减少全连接层中的过拟合，我们采用了一种最近开发的名为dropout的正则化方法，它被证明非常有效。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 21,
        word: 'Softmax',
        englishMeaning: 'A function that takes as input a vector of K real numbers, and normalizes it into a probability distribution consisting of K probabilities proportional to the exponentials of the input numbers.',
        meaning: 'Softmax函数 (归一化指数函数) (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/ˈsɑːft.mæks/',
        sentence: 'The neural network...consists of five convolutional layers...and three fully-connected layers with a final 1000-way softmax.',
        translation: '该神经网络...由五个卷积层...和三个带有最终1000路softmax的全连接层组成。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 22,
        word: 'Max-pooling',
        englishMeaning: 'A pooling operation that calculates the maximum value for patches of a feature map, and uses it to create a downsampled feature map.',
        meaning: '最大池化 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/mæks ˈpuː.lɪŋ/',
        sentence: 'The neural network... consists of five convolutional layers, some of which are followed by max-pooling layers...',
        translation: '该神经网络...由五个卷积层组成，其中一些层后面跟着最大池化层...',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 23,
        word: 'ReLU (Rectified Linear Unit)',
        englishMeaning: 'An activation function defined as the positive part of its argument: f(x) = max(0, x).',
        meaning: '修正线性单元 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/ˈriː.luː/',
        sentence: 'Deep convolutional neural networks with ReLUs train several times faster than their equivalents with tanh units.',
        translation: '带有ReLU的深度卷积神经网络比其带有tanh单元的等效网络训练速度快好几倍。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 24,
        word: 'Dropout',
        englishMeaning: 'A regularization technique for neural networks that prevents co-adaptation of neurons by setting the output of each hidden neuron to zero with a certain probability.',
        meaning: 'Dropout (随机失活) (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/ˈdrɑːp.aʊt/',
        sentence: 'The recently-introduced technique, called dropout, consists of setting to zero the output of each hidden neuron with probability 0.5.',
        translation: '最近引入的这项名为dropout的技术，其内容是以0.5的概率将每个隐藏神经元的输出设置为零。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 25,
        word: 'Fully-connected layer',
        englishMeaning: 'A layer in an artificial neural network in which every neuron in the layer is connected to every neuron in the preceding layer.',
        meaning: '全连接层 (noun phrase)',
        partOfSpeech: 'noun phrase',
        pronunciation: '/ˈfʊl.i kəˈnek.tɪd ˈleɪ.ɚ/',
        sentence: 'To reduce overfitting in the fully-connected layers we employed a recently-developed regularization method called dropout...',
        translation: '为了减少全连接层中的过拟合，我们采用了一种最近开发的名为dropout的正则化方法...',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 26,
        word: 'Back-propagation',
        englishMeaning: 'An algorithm for supervised learning of artificial neural networks using gradient descent, where the error is back-propagated through the network to adjust weights.',
        meaning: '反向传播 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/bæk ˌprɑː.pəˈɡeɪ.ʃən/',
        sentence: 'The neurons which are dropped out in this way do not contribute to the forward pass and do not participate in back-propagation.',
        translation: '以这种方式被丢弃的神经元既不参与前向传播，也不参与反向传播。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 27,
        word: 'Stochastic Gradient Descent (SGD)',
        englishMeaning: 'An iterative method for optimizing an objective function with suitable smoothness properties, where a single or a mini-batch of samples is used to approximate the gradient.',
        meaning: '随机梯度下降 (noun phrase)',
        partOfSpeech: 'noun phrase',
        pronunciation: '/stoʊˈkæs.tɪk ˈɡreɪ.di.ənt dɪˈsent/',
        sentence: 'We trained our models using stochastic gradient descent with a batch size of 128 examples, momentum of 0.9, and weight decay of 0.0005.',
        translation: '我们使用随机梯度下降法训练我们的模型，批量大小为128个样本，动量为0.9，权重衰减为0.0005。',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 28,
        word: 'Hyper-parameter',
        englishMeaning: 'A parameter whose value is used to control the learning process, and which is set before the learning process begins.',
        meaning: '超参数 (noun)',
        partOfSpeech: 'noun',
        pronunciation: '/ˈhaɪ.pɚ pəˈræm.ə.t̬ɚ/',
        sentence: 'The constants k, n, α, and β are hyper-parameters whose values are determined using a validation set...',
        translation: '常数k, n, α, 和β是超参数，其值通过一个验证集来确定...',
        paperTitle: 'ImageNet Classification with Deep Convolutional Neural Networks',
        category: 'AI专业词汇',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      }
    ]
  }
})