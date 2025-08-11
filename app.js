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
      const savedWords = wx.getStorageSync('words')
      if (Array.isArray(savedWords) && savedWords.length > 0) {
        // 只有当本地存储有词汇数据时才使用
        console.log('从本地存储加载了', savedWords.length, '个词汇')
        this.globalData.words = this.normalizeCategories(savedWords)
        // 回写一次，统一历史数据中的分类别名
        wx.setStorageSync('words', this.globalData.words)
      } else {
        // 本地存储为空或不存在时，使用内置默认词库
        console.log('使用默认词汇数据，共', this.globalData.words.length, '个词汇')
        this.globalData.words = this.normalizeCategories(this.globalData.words)
        wx.setStorageSync('words', this.globalData.words)
      }
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
    words: [
      // GRE高频词汇
      {
        id: 1,
        word: 'Abstract',
        meaning: '抽象的 (形容词)',
        pronunciation: '/ˈæb.strækt/',
        sentence: 'The paper begins with an abstract that summarizes the main findings of the research.',
        translation: '论文以摘要开头，总结了研究的主要发现。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning', // learning, review, mastered
        weeklyStudyCount: 0
      },
      {
        id: 2,
        word: 'Complexity',
        meaning: '复杂性 (名词)',
        pronunciation: '/kəmˈplɛk.sə.t̬i/',
        sentence: 'In terms of computational complexity, self-attention layers are faster than recurrent layers when the sequence length n is smaller than the representation dimensionality d.',
        translation: '在计算复杂度方面，当序列长度n小于表示维度d时，自注意力层比循环层更快。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning', // learning, review, mastered
        weeklyStudyCount: 0
      },
      {
        id: 3,
        word: 'Constraint',
        meaning: '约束，限制 (名词)',
        pronunciation: '/kənˈstreɪnt/',
        sentence: 'The fundamental constraint of sequential computation, however, remains.',
        translation: '然而，顺序计算的基本约束仍然存在。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning', // learning, review, mastered
        weeklyStudyCount: 0
      },
      {
        id: 4,
        word: 'Dominant',
        meaning: '占主导地位的，显著的 (形容词)',
        pronunciation: '/ˈdɑː.mə.nənt/',
        sentence: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder.',
        translation: '主导的序列转换模型基于复杂的循环或卷积神经网络，包括编码器和解码器。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning', // learning, review, mastered
        weeklyStudyCount: 0
      },
      {
        id: 5,
        word: 'Fundamental',
        meaning: '基础的，根本的 (形容词)',
        pronunciation: '/ˌfʌn.dəˈmen.t̬əl/',
        sentence: 'The fundamental constraint of sequential computation, however, remains.',
        translation: '然而，顺序计算的基本约束仍然存在。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning', // learning, review, mastered
        weeklyStudyCount: 0
      },
      {
        id: 6,
        word: 'Component',
        meaning: '组成部分, 组件 (名词)',
        pronunciation: '/kəmˈpoʊ.nənt/',
        sentence: 'To evaluate the importance of different components of the Transformer, we varied our base model in different ways.',
        translation: '为了评估Transformer不同组件的重要性,我们以不同方式改变基础模型。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 8,
        correctCount: 6,
        lastStudyTime: '2024-12-20T10:30:00.000Z',
        status: 'review', // 测试复习词库
        weeklyStudyCount: 0
      },
      {
        id: 7,
        word: 'Alignment',
        meaning: '对齐，校准 (名词)',
        pronunciation: '/əˈlaɪn.mənt/',
        sentence: 'The alignment of the positions to steps in computation time.',
        translation: '将位置与计算时间步骤对齐。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 12,
        correctCount: 10,
        lastStudyTime: '2024-12-20T11:15:00.000Z',
        status: 'review', // 测试复习词库
        weeklyStudyCount: 0
      },
      {
        id: 8,
        word: 'Generalize',
        meaning: '泛化，归纳 (动词)',
        pronunciation: '/ˈdʒen.ə.rəl.aɪz/',
        sentence: 'We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing.',
        translation: '我们通过成功应用于英语成分句法分析，表明Transformer能够很好地泛化到其他任务。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning', // learning, review, mastered
        weeklyStudyCount: 0
      },
      {
        id: 9,
        word: 'Inherently',
        meaning: '内在地，固有地 (副词)',
        pronunciation: '/ɪnˈhɪr.ənt.li/',
        sentence: 'This inherently sequential nature precludes parallelization within training examples.',
        translation: '这种固有的顺序性质阻止了训练样本内的并行化。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning'
      },
      {
        id: 10,
        word: 'Integral',
        meaning: '必要的，完整的 (形容词)',
        pronunciation: '/ˈɪn.t̬ə.ɡrəl/',
        sentence: 'Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks.',
        translation: '注意力机制已成为各种任务中引人注目的序列建模和转换模型的必要组成部分。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning'
      },
      {
        id: 11,
        word: 'Propose',
        meaning: '提议，提出 (动词)',
        pronunciation: '/prəˈpoʊz/',
        sentence: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
        translation: '我们提出了一种新的简单网络架构Transformer，完全基于注意力机制，完全摒弃了循环和卷积。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning'
      },
      {
        id: 12,
        word: 'Superior',
        meaning: '更好的，优越的 (形容词)',
        pronunciation: '/səˈpɪr.i.ɚ/',
        sentence: 'Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
        translation: '在两个机器翻译任务上的实验表明，这些模型在质量上更优越，同时更具并行性，训练时间显著减少。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning'
      },
      {
        id: 13,
        word: 'Vary',
        meaning: '变化，改变 (动词)',
        pronunciation: '/ˈver.i/',
        sentence: 'To evaluate the importance of different components of the Transformer, we varied our base model in different ways, measuring the change in performance on English-to-German translation.',
        translation: '为了评估Transformer不同组件的重要性，我们以不同方式改变基础模型，测量英德翻译性能的变化。',
        category: 'GRE高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'easy',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning'
      },

      // TOEFL高频词汇
      {
        id: 14,
        word: 'Achieve',
        meaning: '实现，达到 (动词)',
        pronunciation: '/əˈtʃiːv/',
        sentence: 'Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU.',
        translation: '我们的模型在WMT 2014英德翻译任务上达到28.4 BLEU，比现有最佳结果（包括集成）提高了超过2 BLEU。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 15,
        word: 'Align',
        meaning: '对齐，使一致 (动词)',
        pronunciation: '/əˈlaɪn/',
        sentence: 'Aligning the positions to steps in computation time, they generate a sequence of hidden states ht as a function of the previous hidden state ht−1 and the input for position t.',
        translation: '将位置与计算时间步骤对齐，它们生成隐藏状态序列ht，作为前一个隐藏状态ht−1和位置t输入的函数。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 16,
        word: 'Architecture',
        meaning: '架构，结构 (名词)',
        pronunciation: '/ˈɑːr.kə.tek.tʃɚ/',
        sentence: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.',
        translation: '我们提出了一种新的简单网络架构Transformer，完全基于注意力机制。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 17,
        word: 'Component',
        meaning: '组成部分，组件 (名词)',
        pronunciation: '/kəmˈpoʊ.nənt/',
        sentence: 'To evaluate the importance of different components of the Transformer, we varied our base model in different ways.',
        translation: '为了评估Transformer不同组件的重要性，我们以不同方式改变基础模型。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 18,
        word: 'Compose',
        meaning: '组成，构成 (动词)',
        pronunciation: '/kəmˈpoʊz/',
        sentence: 'The encoder is composed of a stack of N=6 identical layers.',
        translation: '编码器由N=6个相同层的堆栈组成。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 19,
        word: 'Configuration',
        meaning: '配置 (名词)',
        pronunciation: '/kənˌfɪɡ.jəˈreɪ.ʃən/',
        sentence: 'The configuration of this model is listed in the bottom line of Table 3.',
        translation: '此模型的配置列在表3的底行。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 20,
        word: 'Dimension',
        meaning: '维度，尺寸 (名词)',
        pronunciation: '/ˌdaɪˈmen.ʃən/',
        sentence: 'To facilitate these residual connections, all sub-layers in the model, as well as the embedding layers, produce outputs of dimension dmodel=512.',
        translation: '为了促进这些残差连接，模型中的所有子层以及嵌入层都产生维度dmodel=512的输出。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 21,
        word: 'Encode',
        meaning: '编码 (动词)',
        pronunciation: '/ɪnˈkoʊd/',
        sentence: 'Sentences were encoded using byte-pair encoding.',
        translation: '句子使用字节对编码进行编码。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 22,
        word: 'Establish',
        meaning: '建立，确立 (动词)',
        pronunciation: '/ɪˈstæb.lɪʃ/',
        sentence: 'On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8.',
        translation: '在WMT 2014英法翻译任务上，我们的模型建立了新的单模型最先进BLEU分数41.8。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 23,
        word: 'Implement',
        meaning: '实现，实施 (动词)',
        pronunciation: '/ˈɪm.plə.ment/',
        sentence: 'That is, the output of each sub-layer is LayerNorm(x+Sublayer(x)), where Sublayer(x) is the function implemented by the sub-layer itself.',
        translation: '也就是说，每个子层的输出是LayerNorm(x+Sublayer(x))，其中Sublayer(x)是由子层本身实现的函数。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 24,
        word: 'Improve',
        meaning: '提升，改善 (动词)',
        pronunciation: '/ɪmˈpruːv/',
        sentence: 'This hurts perplexity, as the model learns to be more unsure, but improves accuracy and BLEU score.',
        translation: '这会损害困惑度，因为模型学会更加不确定，但提高了准确性和BLEU分数。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 25,
        word: 'Linear',
        meaning: '线性的 (形容词)',
        pronunciation: '/ˈlɪn.i.ɚ/',
        sentence: 'This consists of two linear transformations with a ReLU activation in between.',
        translation: '这由两个线性变换组成，中间有ReLU激活。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 26,
        word: 'Mechanism',
        meaning: '机制 (名词)',
        pronunciation: '/ˈmek.ə.nɪ.zəm/',
        sentence: 'The best performing models also connect the encoder and decoder through an attention mechanism.',
        translation: '性能最佳的模型还通过注意力机制连接编码器和解码器。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 27,
        word: 'Parallel',
        meaning: '并行的 (形容词)',
        pronunciation: '/ˈper.ə.lel/',
        sentence: 'In this work we employ h=8 parallel attention layers, or heads.',
        translation: '在这项工作中，我们使用h=8个并行注意力层或头。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 28,
        word: 'Parameter',
        meaning: '参数 (名词)',
        pronunciation: '/pəˈræm.ə.t̬ɚ/',
        sentence: 'We performed only a small number of experiments to select the dropout, both attention and residual (section 5.4), learning rates and beam size on the Section 22 development set, all other parameters remained unchanged from the English-to-German base translation model.',
        translation: '我们只进行了少量实验来选择dropout、注意力和残差（第5.4节）、学习率和束搜索大小在Section 22开发集上，所有其他参数与英德基础翻译模型保持不变。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 29,
        word: 'Recurrent',
        meaning: '循环的 (形容词)',
        pronunciation: '/rɪˈkɝː.ənt/',
        sentence: 'Recurrent neural networks, long short-term memory [13] and gated recurrent [7] neural networks in particular, have been firmly established as state of the art approaches in sequence modeling.',
        translation: '循环神经网络，特别是长短期记忆[13]和门控循环[7]神经网络，已被牢固确立为序列建模的最先进方法。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 30,
        word: 'Residual',
        meaning: '残差的 (形容词)',
        pronunciation: '/rɪˈzɪdʒ.u.əl/',
        sentence: 'We employ a residual connection [11] around each of the two sub-layers, followed by layer normalization [1].',
        translation: '我们在两个子层中的每一个周围使用残差连接[11]，然后进行层归一化[1]。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 31,
        word: 'Sequence',
        meaning: '序列 (名词)',
        pronunciation: '/ˈsiː.kwəns/',
        sentence: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.',
        translation: '主导的序列转换模型基于复杂的循环或卷积神经网络。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 32,
        word: 'Significant',
        meaning: '显著的，重要的 (形容词)',
        pronunciation: '/sɪɡˈnɪf.ə.kənt/',
        sentence: 'Recent work has achieved significant improvements in computational efficiency through factorization tricks [21] and conditional computation [32].',
        translation: '最近的工作通过分解技巧[21]和条件计算[32]在计算效率方面取得了显著改进。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 33,
        word: 'Typical',
        meaning: '典型的 (形容词)',
        pronunciation: '/ˈtɪp.ɪ.kəl/',
        sentence: 'This mimics the typical encoder-decoder attention mechanisms in sequence-to-sequence models such as [38, 2, 9].',
        translation: '这模仿了序列到序列模型中典型的编码器-解码器注意力机制，如[38, 2, 9]。',
        category: 'TOEFL高频词',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },

      // AI专业词汇
      {
        id: 34,
        word: 'Attention Mechanism',
        meaning: '注意力机制 (名词短语)',
        pronunciation: '/əˈten.ʃən ˈmek.ə.nɪ.zəm/',
        sentence: 'The best performing models also connect the encoder and decoder through an attention mechanism.',
        translation: '性能最佳的模型还通过注意力机制连接编码器和解码器。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 35,
        word: 'Auto-Regressive',
        meaning: '自回归 (形容词)',
        pronunciation: '/ˌɔː.t̬oʊ.rɪˈɡres.ɪv/',
        sentence: 'At each step the model is auto-regressive [10], consuming the previously generated symbols as additional input when generating the next.',
        translation: '在每一步，模型都是自回归的[10]，在生成下一个时消耗先前生成的符号作为额外输入。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 36,
        word: 'BLEU',
        meaning: '双语评估辅助指标 (名词)',
        pronunciation: '/bluː/',
        sentence: 'Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task.',
        translation: '我们的模型在WMT 2014英德翻译任务上达到28.4 BLEU。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 37,
        word: 'Decoder',
        meaning: '解码器 (名词)',
        pronunciation: '/diːˈkoʊ.dɚ/',
        sentence: 'Given z, the decoder then generates an output sequence (y1,...,ym) of symbols one element at a time.',
        translation: '给定z，解码器然后一次一个元素地生成符号的输出序列(y1,...,ym)。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 38,
        word: 'Dropout',
        meaning: '随机失活 (名词)',
        pronunciation: '/ˈdrɑːp.aʊt/',
        sentence: 'We apply dropout [33] to the output of each sub-layer, before it is added to the sub-layer input and normalized.',
        translation: '我们将dropout[33]应用于每个子层的输出，然后将其添加到子层输入并进行归一化。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 39,
        word: 'Embedding',
        meaning: '嵌入 (名词)',
        pronunciation: '/ɪmˈbed.ɪŋ/',
        sentence: 'We use learned embeddings to convert the input tokens and output tokens to vectors of dimension dmodel.',
        translation: '我们使用学习的嵌入将输入标记和输出标记转换为维度dmodel的向量。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 40,
        word: 'Encoder',
        meaning: '编码器 (名词)',
        pronunciation: '/ɪnˈkoʊ.dɚ/',
        sentence: 'The encoder maps an input sequence of symbol representations (x1,...,xn) to a sequence of continuous representations z=(z1,...,zn).',
        translation: '编码器将符号表示的输入序列(x1,...,xn)映射到连续表示序列z=(z1,...,zn)。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 41,
        word: 'Feed-Forward Network',
        meaning: '前馈网络 (名词短语)',
        pronunciation: '/ˈfiːdˌfɔːr.wɚd ˈnet.wɝːk/',
        sentence: 'The first is a multi-head self-attention mechanism, and the second is a simple, position-wise fully connected feed-forward network.',
        translation: '第一个是多头自注意力机制，第二个是简单的、位置式全连接前馈网络。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 42,
        word: 'Hyperparameter',
        meaning: '超参数 (名词)',
        pronunciation: '/ˈhaɪ.pɚ.pəˌræm.ə.t̬ɚ/',
        sentence: 'These hyperparameters were chosen after experimentation on the development set.',
        translation: '这些超参数是在开发集上实验后选择的。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 43,
        word: 'Layer Normalization',
        meaning: '层归一化 (名词短语)',
        pronunciation: '/ˈleɪ.ɚ ˌnɔːr.məl.əˈzeɪ.ʃən/',
        sentence: 'We employ a residual connection [11] around each of the two sub-layers, followed by layer normalization [1].',
        translation: '我们在两个子层中的每一个周围使用残差连接[11]，然后进行层归一化[1]。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 44,
        word: 'Perplexity',
        meaning: '困惑度 (名词)',
        pronunciation: '/pɚˈplek.sə.t̬i/',
        sentence: 'This hurts perplexity, as the model learns to be more unsure, but improves accuracy and BLEU score.',
        translation: '这会损害困惑度，因为模型学会更加不确定，但提高了准确性和BLEU分数。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 45,
        word: 'Positional Encoding',
        meaning: '位置编码 (名词短语)',
        pronunciation: '/pəˈzɪʃ.ən.əl ɪnˈkoʊ.dɪŋ/',
        sentence: 'We add "positional encodings" to the input embeddings at the bottoms of the encoder and decoder stacks.',
        translation: '我们在编码器和解码器堆栈底部的输入嵌入中添加"位置编码"。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 46,
        word: 'Regularization',
        meaning: '正则化 (名词)',
        pronunciation: '/ˌreɡ.jə.ləˈzeɪ.ʃən/',
        sentence: 'We employ three types of regularization during training.',
        translation: '我们在训练期间使用三种类型的正则化。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 47,
        word: 'Self-Attention',
        meaning: '自注意力 (名词短语)',
        pronunciation: '/self əˈten.ʃən/',
        sentence: 'Self-attention, sometimes called intra-attention is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence.',
        translation: '自注意力，有时称为内部注意力，是一种注意力机制，将单个序列的不同位置关联起来以计算序列的表示。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 48,
        word: 'State-of-the-art',
        meaning: '当前最佳水平 (名词短语/形容词)',
        pronunciation: '/steɪt.əv.ði.ɑːrt/',
        sentence: 'Our model establishes a new single-model state-of-the-art BLEU score of 41.8.',
        translation: '我们的模型建立了新的单模型最先进BLEU分数41.8。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },
      {
        id: 49,
        word: 'Transduction',
        meaning: '转换，转导 (名词)',
        pronunciation: '/trænsˈdʌk.ʃən/',
        sentence: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.',
        translation: '主导的序列转换模型基于复杂的循环或卷积神经网络。',
        category: 'AI专业词汇',
        paperTitle: 'Attention Is All You Need',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null
      },

      // Learning the Bitter Lesson 论文词汇
      {
        id: 50,
        word: 'Primacy',
        meaning: '首要地位，卓越 (noun)',
        pronunciation: '/ˈpraɪ.mə.si/',
        sentence: 'Sutton\'s thesis emphasizes the **primacy** of general methods that harness computational power over human-designed representations and domain-specific knowledge.',
        translation: '',
        category: 'GRE高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 62,
        word: 'Embracement',
        meaning: '拥抱，欣然接受 (noun)',
        pronunciation: '/ɪmˈbreɪ.smənt/',
        sentence: 'We analyze two decades of CVPR abstracts and titles using large language models (LLMs) to assess the field\'s **embracement** of these principles.',
        translation: '',
        category: 'GRE高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 63,
        word: 'Systematically',
        meaning: '系统地，有条理地 (adverb)',
        pronunciation: '/ˌsɪs.təˈmæt̬.ɪ.kəl.i/',
        sentence: 'Our methodology leverages state-of-the-art natural language processing techniques to **systematically** evaluate the evolution of research approaches in computer vision.',
        translation: '',
        category: 'GRE高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 64,
        word: 'Alignment',
        meaning: '对齐，一致 (noun)',
        pronunciation: '/əˈlaɪn.mənt/',
        sentence: 'This study examines the **alignment** of Conference on Computer Vision and Pattern Recognition (CVPR) research with the principles of the "bitter lesson" proposed by Rich Sutton.',
        translation: '',
        category: 'TOEFL高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 65,
        word: 'Principle',
        meaning: '原则，原理 (noun)',
        pronunciation: '/ˈprɪn.sə.pəl/',
        sentence: 'The field of Computer Vision (CV) exemplifies the **principles** of Sutton\'s "bitter lesson."',
        translation: '',
        category: 'TOEFL高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 66,
        word: 'Comprehensive',
        meaning: '全面的，综合的 (adjective)',
        pronunciation: '/ˌkɑːm.prəˈhen.sɪv/',
        sentence: 'This method allows us to uncover patterns and trends that may not be immediately apparent through traditional research methods, providing a more **comprehensive** understanding of the current state of ML research.',
        translation: '',
        category: 'TOEFL高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 67,
        word: 'Examines',
        meaning: '检查，研究 (verb)',
        pronunciation: '/ɪɡˈzæm.ɪnz/',
        sentence: 'This study **examines** the alignment of Conference on Computer Vision and Pattern Recognition (CVPR) research with the principles of the "bitter lesson".',
        translation: '',
        category: 'IELTS高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'medium',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 68,
        word: 'Methodology',
        meaning: '方法论 (noun)',
        pronunciation: '/ˌmeθ.əˈdɑː.lə.dʒi/',
        sentence: 'Our **methodology** leverages state-of-the-art natural language processing techniques to systematically evaluate the evolution of research approaches in computer vision.',
        translation: '',
        category: 'IELTS高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 69,
        word: 'Implications',
        meaning: '含义，可能的影响 (noun (plural))',
        pronunciation: '/ˌɪm.pləˈkeɪ.ʃənz/',
        sentence: 'We discuss the **implications** of these findings for the future direction of computer vision research and its potential impact on broader artificial intelligence development.',
        translation: '',
        category: 'IELTS高频词',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 70,
        word: 'Heuristics',
        meaning: '启发式；启发法 (noun (plural))',
        pronunciation: '/hjʊˈrɪs.tɪks/',
        sentence: '...leveraging computation through search algorithms and optimization techniques rather than depending on human-designed **heuristics** and problem-specific strategies?',
        translation: '',
        category: 'AI专业词汇',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 71,
        word: 'Paradigm Shift',
        meaning: '范式转移 (noun phrase)',
        pronunciation: '/ˈper.ə.daɪm ʃɪft/',
        sentence: '...CV underwent a **paradigm shift** with embracing deep learning, particularly Convolutional Neural Networks.',
        translation: '',
        category: 'AI专业词汇',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
        difficulty: 'hard',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      },
      {
        id: 72,
        word: 'Hand-crafted features',
        meaning: '手工设计特征 (noun phrase)',
        pronunciation: '/hændˈkræf.tɪd ˈfiː.tʃɚz/',
        sentence: 'Traditionally reliant on **hand-crafted features** like SIFT, HOG, and Haar cascades for object detection and image classification.',
        translation: '',
        category: 'AI专业词汇',
        paperTitle: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
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