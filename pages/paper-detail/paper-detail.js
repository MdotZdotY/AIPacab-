// pages/paper-detail/paper-detail.js
const app = getApp()

Page({
  data: {
    paper: null,
    papers: [
      {
        id: 1,
        title: 'Attention Is All You Need',
        authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin',
        year: 2017,
        journal: 'NIPS',
        abstract: '这篇论文提出了一种全新的、简单的网络架构——Transformer。Transformer模型架构完全摒弃了循环和卷积，仅依赖于注意力机制来处理输入和输出之间的全局依赖关系。',
        url: 'https://arxiv.org/abs/1706.03762',
        wordCount: 49,
        category: 'AI专业词汇',
        background: `在《Attention Is All You Need》这篇论文发表之前，序列转换模型（sequence transduction models）主要由包含编码器和解码器的复杂循环神经网络（RNN）或卷积神经网络（CNN）构成。这些模型在当时取得了最先进的成果，并且通常会通过一种"注意力机制"来连接编码器和解码器。

然而，这些基于循环神经网络的模型存在一个固有的局限性，即它们按顺序处理数据。这种顺序性阻碍了在训练过程中的并行化，尤其是在处理长序列时，这一问题会变得更加严重，因为内存的限制会影响批量处理。尽管已有研究通过一些技巧来提升计算效率和模型性能，但顺序计算的根本性制约依然存在。

另一方面，注意力机制已成为各种序列建模和转换任务中不可或缺的一部分，它能够不受距离远近的影响，对输入或输出序列中的依赖关系进行建模。不过，在绝大多数情况下，这种注意力机制都是与循环网络结合使用的。`,
        keyConcepts: `这篇论文的核心是提出了一种全新的、简单的网络架构——**Transformer**。

Transformer模型架构完全摒弃了循环和卷积，仅依赖于注意力机制来处理输入和输出之间的全局依赖关系。其主要构成部分包括：

* **编码器-解码器结构（Encoder-Decoder Structure）**： Transformer沿用了主流的编码器-解码器架构。编码器负责将输入的符号序列映射成连续的表示形式，解码器则根据这种表示生成输出序列。
* **自注意力机制（Self-Attention）**： 这是Transformer的核心，它也被称为内部注意力（intra-attention）。在编码器中，自注意力机制使得每个位置都能注意到输入序列中的所有其他位置。在解码器中，自注意力机制同样使得每个位置都能注意到解码器中截至当前位置的所有位置。
* **多头注意力机制（Multi-Head Attention）**： 论文发现，将查询、键和值通过不同的、学习到的线性投影多次（h次）进行变换，然后并行地执行注意力功能，会带来益处。这种多头机制允许模型在不同位置共同关注来自不同表示子空间的信息。在该模型中，使用了8个并行的注意力头（h=8）。
* **按位置的前馈网络（Position-wise Feed-Forward Networks）**： 编码器和解码器的每一层都包含一个全连接的前馈网络。
* **位置编码（Positional Encoding）**： 由于模型中没有循环和卷积，为了让模型能够利用序列的顺序信息，研究者们在编码器和解码器的输入嵌入中加入了"位置编码"。`,
        highlights: `这篇论文的亮点在于其提出的Transformer模型在保证卓越性能的同时，具有更高的并行性和更低的训练成本。

* **性能卓越**： 在2014年WMT英德翻译任务上，该模型的BLEU值达到了28.4，比包括集成模型在内的先前最佳结果高出2.0 BLEU。在2014年WMT英法翻译任务上，该模型在8个GPU上训练3.5天后，创下了41.8的单模型BLEU分数新纪录。
* **训练成本显著降低**： Transformer模型可以实现更高程度的并行化，因此在训练时间上远少于之前的顶尖模型。在8个P100 GPU上训练了短短12个小时后，其翻译质量就能达到新的顶尖水平。
* **出色的泛化能力**： 论文还证明了Transformer模型可以很好地泛化到其他任务，例如，在训练数据量或大或小的情况下，都成功地应用于英语成分句法分析。
* **更优的可解释性**： 作为附带的好处，自注意力机制可以产生更具可解释性的模型。通过对模型中注意力分布的可视化，可以观察到不同的注意力头明显学会了执行不同的任务，其中许多头的行为似乎与句子的句法和语义结构有关。`
      },
      {
        id: 2,
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        authors: 'Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Yejin Choi, Veselin Stoyanov',
        year: 2020,
        journal: 'NeurIPS',
        abstract: '这篇论文提出了一种通用的、用于检索增强生成（Retrieval-Augmented Generation, RAG）模型的微调方法。RAG模型将预训练的参数化记忆和非参数化记忆相结合，用于语言生成。',
        url: 'https://arxiv.org/pdf/2005.11401',
        wordCount: 38,
        category: 'AI专业词汇',
        background: `在《Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks》这篇论文发表之前，大型预训练语言模型已经展示出在其参数中存储事实知识的能力，并在经过微调后，在下游的自然语言处理（NLP）任务中取得了业界顶尖的成果。然而，这些模型在访问和精确运用知识方面的能力仍然有限。因此，在知识密集型任务上，它们的表现落后于那些为特定任务设计的专门架构。此外，为模型的决策提供依据以及更新其世界知识仍然是悬而未决的研究难题。

一种解决方案是混合模型，它将参数化记忆（parametric memory）与非参数化记忆（non-parametric memory，即基于检索的记忆）相结合。这种混合模型可以解决上述部分问题，因为知识可以直接被修改和扩展，并且被访问的知识可以被审查和解释。不过，在当时，带有可微调的、对外部非参数化记忆进行访问机制的预训练模型，其研究仅限于抽取式的下游任务。`,
        keyConcepts: `这篇论文的核心是提出了一种通用的、用于检索增强生成（Retrieval-Augmented Generation, RAG）模型的微调方法。RAG模型将预训练的参数化记忆和非参数化记忆相结合，用于语言生成。

其主要构成部分包括：

* **参数化记忆（Parametric Memory）**： 这是一个预训练的序列到序列（seq2seq）模型。在这项研究中，作者使用了BART模型，这是一个拥有4亿参数的预训练seq2seq Transformer。
* **非参数化记忆（Non-parametric Memory）**： 这是一个维基百科的密集向量索引，通过一个预训练的神经检索器来访问。
* **检索器（Retriever）**： 该组件基于DPR（Dense Passage Retriever）模型，它采用双编码器架构，能根据查询输入，返回最相关的文本段落。
* **生成器（Generator）**： 该组件使用BART-large模型，它会基于原始输入和检索到的文档来生成目标序列。

论文探讨了两种RAG模型：

1. **RAG-Sequence**： 该模型在生成整个序列的过程中，始终以同一个检索到的文档为条件。
2. **RAG-Token**： 该模型在生成每个词元（token）时，都可以使用不同的检索文档。

在训练过程中，检索器和生成器会进行联合训练，而无需任何关于应检索何种文档的直接监督。`,
        highlights: `这篇论文的亮点在于其提出的RAG模型在一系列知识密集型NLP任务中取得了卓越的性能，并展示了其独特的优势。

* **性能卓越**： RAG模型在三个开放域问答任务上创造了当时的最佳纪录，其性能超越了参数化的seq2seq模型和为特定任务设计的"检索-抽取"式架构。
* **生成质量更高**： 在语言生成任务中，研究发现RAG模型比仅有参数化记忆的seq2seq基准模型生成的语言更具体、更多样、更忠于事实。
* **灵活性和有效性**： 即便是在抽取式任务中，无约束的生成也胜过了以往的抽取式方法。RAG模型甚至能在正确答案未包含在任何检索到的文档中的情况下生成正确答案。
* **可更新的知识**： RAG这类非参数化记忆模型的一大优势在于，其知识库可以在测试时轻松更新。研究人员通过更换不同年份的维基百科索引，成功证明了RAG模型的世界知识可以通过简单地替换其非参数化记忆来进行更新，而无需重新训练。
* **更少的参数，更强的性能**： 与拥有110亿参数的T5-11B模型相比，仅有6.26亿可训练参数的RAG模型在开放域问答任务上表现更优，这表明混合参数/非参数模型在实现强大的开放域问答性能方面，所需的参数要少得多。
* **更少的"幻觉"**： RAG模型更紧密地根植于真实的知识（此案例中为维基百科），因此能更少地产生"幻觉"，其生成的内容更符合事实，并提供了更好的可控性和可解释性。`
      }
    ]
  },

  onLoad(options) {
    const paperId = parseInt(options.id)
    const paper = this.data.papers.find(p => p.id === paperId)
    
    if (paper) {
      // 处理markdown标记
      const processedPaper = {
        ...paper,
        keyConcepts: this.removeMarkdown(paper.keyConcepts),
        highlights: this.removeMarkdown(paper.highlights)
      }
      this.setData({ paper: processedPaper })
    } else {
      wx.showToast({
        title: '论文不存在',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 移除markdown标记
  removeMarkdown(text) {
    if (!text) return text
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/\[cite_start\](.*?)\[cite_end\]/g, '$1') // 移除引用标记
      .replace(/\[cite: \d+\]/g, '') // 移除引用编号
      .replace(/^\s*[-*]\s+/gm, '• ') // 将markdown列表符号转换为圆点
      .replace(/^\s*\d+\.\s+/gm, (match, index) => `${index + 1}. `) // 保持数字列表格式
  },

  // 打开论文链接
  openPaperUrl() {
    const { paper } = this.data
    if (paper && paper.url) {
      // 立即记一次阅读事件（按按钮即认为阅读），避免用户确认弹窗被误操作导致未计数
      try {
        const StatsManager = require('../../utils/statsManager.js')
        const stats = new StatsManager()
        stats.recordPaperRead(paper.id)
      } catch (e) { console.warn('记录论文阅读失败', e) }
      wx.showModal({
        title: '打开链接',
        content: '是否在浏览器中打开论文链接？',
        success: (res) => {
          if (res.confirm) {
            // 在微信小程序中打开外部链接
            wx.setClipboardData({
              data: paper.url,
              success: () => {
                wx.showToast({
                  title: '链接已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    }
  },

  // 分享
  onShareAppMessage() {
    const { paper } = this.data
    return {
      title: paper ? `${paper.title} - AI词汇学习` : 'AI词汇学习 - 论文详情',
      path: `/pages/paper-detail/paper-detail?id=${paper ? paper.id : ''}`
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})