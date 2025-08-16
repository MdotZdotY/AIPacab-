// pages/import/import_dpr.js
const app = getApp()

Page({
  data: {
    importResult: null,
    isImporting: false,
    showPreview: false,
    previewWords: []
  },

  onLoad() {
    // 页面加载时的初始化
  },

  // 导入DPR词汇
  importDPRVocabulary() {
    this.setData({ isImporting: true })
    
    try {
      // 读取词汇文件内容
      const content = this.getDPRVocabularyContent()
      
      // 解析词汇
      const VocabularyManager = require('../../utils/vocabularyManager.js')
      const manager = new VocabularyManager()
      const words = manager.parseVocabularyFile(content, 'Dense Passage Retrieval for Open-Domain Question Answering')
      
      // 添加新词汇
      const result = manager.addNewWords(words)
      
      this.setData({
        importResult: result,
        isImporting: false
      })

      wx.showModal({
        title: '导入完成',
        content: `成功导入 ${result.added} 个新词汇\n跳过 ${result.skipped} 个重复词汇\n当前词汇库共有 ${result.total} 个词汇`,
        showCancel: false,
        success: () => {
          // 通知统计页面更新
          this.notifyStatsUpdate()
          // 返回管理页面
          wx.navigateBack()
        }
      })
    } catch (error) {
      this.setData({ isImporting: false })
      wx.showToast({
        title: '导入失败',
        icon: 'none'
      })
      console.error('导入错误:', error)
    }
  },

  // 预览DPR词汇
  previewDPRVocabulary() {
    try {
      const content = this.getDPRVocabularyContent()
      const VocabularyManager = require('../../utils/vocabularyManager.js')
      const manager = new VocabularyManager()
      const words = manager.parseVocabularyFile(content, 'Dense Passage Retrieval for Open-Domain Question Answering')
      
      this.setData({
        previewWords: words,
        showPreview: true
      })

      wx.showToast({
        title: `解析到 ${words.length} 个词汇`,
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: '解析失败',
        icon: 'none'
      })
      console.error('解析错误:', error)
    }
  },

  // 获取DPR词汇内容
  getDPRVocabularyContent() {
    return `GRE高频词汇

●Paradigm
○词性: n.
○音标: /ˈpærədaɪm/
○中文解释: 范式；典范
○例句: This work introduced a new paradigm for information retrieval.
○例句翻译: 这项工作为信息检索引入了一种新的范式。

●Subsequently
○词性: adv.
○音标: /ˈsʌbsɪkwəntli/
○中文解释: 随后；后来
○例句: The model was pre-trained and subsequently fine-tuned on a specific task.
○例句翻译: 该模型经过了预训练，随后在特定任务上进行了微调。

●Robust
○词性: adj.
○音标: /roʊˈbʌst/
○中文解释: 稳健的；强大的
○例句: A robust retriever must handle a wide variety of questions.
○例句翻译: 一个稳健的检索器必须能处理各种各样的问题。

●Prevalent
○词性: adj.
○音标: /ˈprɛvələnt/
○中文解释: 流行的；普遍的
○例句: The use of sparse vectors was the most prevalent method.
○例句翻译: 使用稀疏向量曾是最流行的方法。

●Explicitly
○词性: adv.
○音标: /ɪkˈsplɪsɪtli/
○中文解释: 明确地
○例句: We explicitly train the model to distinguish between relevant and irrelevant passages.
○例句翻译: 我们明确地训练模型来区分相关和不相关的段落。

●Crucial
○词性: adj.
○音标: /ˈkruːʃl/
○中文解释: 至关重要的
○例句: The selection of negative samples is crucial for training performance.
○例句翻译: 负样本的选择对训练性能至关重要。

●Albeit
○词性: conj.
○音标: /ɔːlˈbiːɪt/
○中文解释: 尽管；虽然
○例句: The system achieves high accuracy, albeit with high computational cost.
○例句翻译: 该系统实现了高准确率，尽管计算成本很高。

●Leverage
○词性: v.
○音标: /ˈlɛvərɪdʒ/
○中文解释: 利用
○例句: We leverage in-batch negatives to improve the training process.
○例句翻译: 我们利用批内负样本来改进训练过程。

TOEFL高频词汇

●Component
○词性: n.
○音标: /kəmˈpoʊnənt/
○中文解释: 组成部分；组件
○例句: The retriever is a key component of the open-domain QA system.
○例句翻译: 检索器是开放域问答系统的一个关键组成部分。

●Strategy
○词性: n.
○音标: /ˈstrætədʒi/
○中文解释: 策略
○例句: Our training strategy involves using gold passages and hard negatives.
○例句翻译: 我们的训练策略涉及使用标准答案段落和难负样本。

●Demonstrate
○词性: v.
○音标: /ˈdɛmənstreɪt/
○中文解释: 证明；展示
○例句: We demonstrate that our dense retriever outperforms BM25.
○例句翻译: 我们证明了我们的密集检索器优于BM25。

●Evaluation
○词性: n.
○音标: /ɪˌvæljuˈeɪʃn/
○中文解释: 评估
○例句: The evaluation is conducted on several public benchmarks.
○例句翻译: 评估是在几个公开的基准数据集上进行的。

●Achieve
○词性: v.
○音标: /əˈtʃiːv/
○中文解释: 实现；达到
○例句: Our model is able to achieve state-of-the-art results.
○例句翻译: 我们的模型能够达到最先进的结果。

●Significant
○词性: adj.
○音标: /sɪɡˈnɪfɪkənt/
○中文解释: 显著的
○例句: We observed a significant improvement in retrieval accuracy.
○例句翻译: 我们观察到检索准确率有了显著的提升。

●Approach
○词性: n.
○音标: /əˈproʊtʃ/
○中文解释: 方法；途径
○例句: This approach relies on learning dense representations of text.
○例句翻译: 这种方法依赖于学习文本的密集表示。

●Collection
○词性: n.
○音标: /kəˈlɛkʃn/
○中文解释: 集合；文集
○例句: The retriever searches over a large collection of documents.
○例句翻译: 检索器在一个大型的文档集合中进行搜索。

IELTS高频词汇

●Effective
○词性: adj.
○音标: /ɪˈfɛktɪv/
○中文解释: 有效的
○例句: Creating effective negative samples is a major challenge.
○例句翻译: 创建有效的负样本是一个主要挑战。

●Improvement
○词性: n.
○音标: /ɪmˈpruːvmənt/
○中文解释: 提升；改进
○例句: The improvement over the baseline is more than 10 percentage points.
○例句翻译: 相较于基线模型的提升超过了10个百分点。

●Challenge
○词性: n.
○音标: /ˈtʃæləndʒ/
○中文解释: 挑战
○例句: A key challenge is the lexical gap between questions and answers.
○例句翻译: 一个关键的挑战是问题与答案之间的词汇鸿沟。

●Initial
○词性: adj.
○音标: /ɪˈnɪʃl/
○中文解释: 初始的
○例句: The initial stage of the pipeline is passage retrieval.
○例句翻译: 这个流程的初始阶段是段落检索。

●Performance
○词性: n.
○音标: /pərˈfɔːrməns/
○中文解释: 性能；表现
○例句: The reader's performance heavily depends on the quality of retrieved passages.
○例句翻译: 阅读器的性能在很大程度上取决于所检索段落的质量。

●System
○词性: n.
○音标: /ˈsɪstəm/
○中文解释: 系统
○例句: We developed a full open-domain question answering system.
○例句翻译: 我们开发了一个完整的开放域问答系统。

●Method
○词性: n.
○音标: /ˈmɛθəd/
○中文解释: 方法
○例句: Our method uses two independent BERT encoders.
○例句翻译: 我们的方法使用了两个独立的BERT编码器。

●Typically
○词性: adv.
○音标: /ˈtɪpɪkli/
○中文解释: 通常；典型地
○例句: Reader models are typically based on large pre-trained language models.
○例句翻译: 阅读器模型通常基于大型的预训练语言模型。

AI领域常用及专有词汇

●Encoder
○词性: n.
○音标: /ɪnˈkoʊdər/
○中文解释: 编码器
○例句: A BERT-based encoder is used to generate vector representations.
○例句翻译: 一个基于BERT的编码器被用来生成向量表示。

●Embedding
○词性: n.
○音标: /ɪmˈbɛdɪŋ/
○中文解释: 嵌入
○例句: Each passage is converted into a 768-dimensional embedding.
○例句翻译: 每个段落都被转换成一个768维的嵌入向量。

●Fine-tuning
○词性: v./n.
○音标: /ˈfaɪn ˌtuːnɪŋ/
○中文解释: 微调
○例句: Fine-tuning is performed on question-answer pairs.
○例句翻译: 微调是在问答对上进行的。

●State-of-the-art
○词性: adj./n.
○音标: /ˌsteɪt əv ði ˈɑːrt/
○中文解释: 最先进的 (SOTA)
○例句: DPR achieved state-of-the-art results on multiple QA datasets.
○例句翻译: DPR在多个问答数据集上取得了最先进的结果。

●Dual-encoder
○词性: n.
○音标: /ˈduːəl ɪnˈkoʊdər/
○中文解释: 双编码器
○例句: The dual-encoder architecture allows for efficient pre-computation of passage vectors.
○例句翻译: 双编码器架构允许对段落向量进行高效的预计算。

●Cross-encoder
○词性: n.
○音标: /krɔːs ɪnˈkoʊdər/
○中文解释: 交叉编码器
○例句: A cross-encoder architecture is computationally expensive for retrieval.
○例句翻译: 交叉编码器架构对于检索任务来说计算成本太高。

●In-batch Negatives
○词性: n.
○音标: /ɪn-bætʃ ˈnɛɡətɪvz/
○中文解释: 批内负样本
○例句: Training is improved by using in-batch negatives, where other passages in the same batch serve as negative examples.
○例句翻译: 通过使用批内负样本，训练效果得到了提升，即同一批次中的其他段落被用作负例。

●Dot Product
○词性: n.
○音标: /dɑːt ˈprɑːdʌkt/
○中文解释: 点积
○例句: The relevance score is computed as the dot product of the question and passage embeddings.
○例句翻译: 相关性分数通过问题和段落嵌入的点积来计算。

●Corpus
○词性: n.
○音标: /ˈkɔːrpəs/
○中文解释: 语料库
○例句: The entire Wikipedia corpus was used for passage retrieval.
○例句翻译: 整个维基百科语料库被用于段落检索。`
  },

  // 关闭预览
  closePreview() {
    this.setData({
      showPreview: false,
      previewWords: []
    })
  },

  // 通知统计更新
  notifyStatsUpdate() {
    if (typeof wx !== 'undefined' && wx.getAppBaseInfo) {
      try {
        const eventChannel = wx.getAppBaseInfo().eventChannel
        if (eventChannel) {
          eventChannel.emit('vocabularyUpdated', {
            timestamp: Date.now(),
            action: 'addNewWords'
          })
        }
      } catch (e) {
        console.log('事件通知失败，但不影响功能:', e)
      }
    }
  }
})
