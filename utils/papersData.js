// utils/papersData.js
// 统一维护论文列表，供首页统计与论文页展示使用

// 动态计算论文词汇数量的函数
function getPaperWordCount(paperTitle) {
  try {
    const app = getApp()
    const words = app.globalData.words || []
    return words.filter(word => word.paperTitle === paperTitle).length
  } catch (e) {
    console.warn('获取论文词汇数量失败:', e)
    return 0
  }
}

const papers = [
  {
    id: 1,
    title: 'Attention Is All You Need',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin',
    year: 2017,
    journal: 'NIPS',
    abstract: '这篇论文提出了一种全新的、简单的网络架构——Transformer。Transformer模型架构完全摒弃了循环和卷积，仅依赖于注意力机制来处理输入和输出之间的全局依赖关系。',
    url: 'https://arxiv.org/abs/1706.03762',
    get wordCount() { return getPaperWordCount('Attention is all you need') }, // 动态计算词汇数量
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
    title: 'ImageNet Classification with Deep Convolutional Neural Networks',
    authors: 'Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton',
    year: 2012,
    journal: 'NIPS',
    abstract: '这篇论文提出了一种名为AlexNet的深度卷积神经网络架构，在ImageNet大规模视觉识别挑战赛中取得了突破性成果，标志着深度学习在计算机视觉领域的"王者归来"。',
    url: 'https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf',
    get wordCount() { return getPaperWordCount('ImageNet Classification with Deep Convolutional Neural Networks') }, // 动态计算词汇数量
    category: 'AI专业词汇',
    background: `在2012年之前，尽管机器学习已应用于物体识别，但其性能受限于当时相对较小的数据集（如CIFAR-10/100，量级在数万张图片）。这些数据集足以解决简单的识别任务，但对于现实世界中形态各异的物体，其复杂性远超这些小数据集所能覆盖的范围。虽然学界已认识到需要更大规模的数据集，但直到ImageNet这样拥有数百万张高分辨率、带标签图像的数据库出现，才为训练更大、更强大的模型提供了可能。然而，有了数据，还需要一个有足够学习能力且能有效利用这些数据的模型。卷积神经网络（CNNs）因其对图像特性的良好假设（如统计平稳性和像素局部依赖性）而被认为是理想选择，但其巨大的计算开销使得在大规模高分辨率图像上的应用一直受到限制。`,
    keyConcepts: `这篇论文的核心是提出并验证了一个名为AlexNet的深度卷积神经网络架构。该网络不仅规模巨大（包含约6000万参数和65万个神经元），更重要的是，它集成了一系列创新且高效的技术来应对大规模训练的挑战：

* **ReLU激活函数 (Rectified Linear Units)**：用f(x)=max(0,x)这种非饱和的激活函数取代了传统的tanh或sigmoid函数。这极大地加快了梯度下降的收敛速度，使得训练深层网络成为可能。

* **多GPU并行训练 (Training on Multiple GPUs)**：由于当时单个GPU的显存（3GB）无法容纳整个网络，作者设计了一种高效的双GPU并行方案，将网络的不同部分部署在两个GPU上，并只在特定层进行通信，从而解决了显存瓶颈，同时缩短了训练时间。

* **局部响应归一化 (Local Response Normalization, LRN)**：受生物神经元侧抑制现象的启发，LRN在相邻的神经元特征图之间创造了竞争机制，增强了模型的泛化能力，并降低了错误率。

* **重叠池化 (Overlapping Pooling)**：采用步长小于池化核尺寸的池化操作（例如步长为2，核尺寸为3），这种方式能减少过拟合并提升性能。

* **Dropout**：在全连接层中，以0.5的概率随机"丢弃"神经元。这种技术极大地减少了神经元之间复杂的共适应关系，强迫网络学习到更鲁棒的特征，是一种非常高效的模型融合方法，被证明能有效防止过拟合。

* **数据增强 (Data Augmentation)**：通过图像平移、水平翻转以及改变RGB通道强度等方式，在计算上几乎零成本地极大地扩充了训练数据集，有效缓解了过拟合问题。`,
    highlights: `本论文最大的亮点在于其实验结果的压倒性优势，它标志着深度学习在计算机视觉领域乃至整个人工智能领域的"王者归来"。

* **性能突破**：在当年的ImageNet大规模视觉识别挑战赛（ILSVRC-2012）中，AlexNet取得了15.3%的top-5错误率，而第二名的成绩仅为26.2%。这一前所未有的巨大性能提升，有力地证明了深度卷积神经网络在复杂视觉识别任务上的巨大潜力。

* **技术革命**：它不仅终结了传统手工设计特征方法的统治地位，也向整个学界和业界展示了"更深、更大的网络 + 更大的数据 + 更强的算力（GPU） + 更有效的训练技巧（ReLU/Dropout等）"这一黄金法则。

* **历史意义**：AlexNet的成功直接引爆了深度学习的革命，开启了至今仍在持续的人工智能新浪潮，为后续的深度学习发展奠定了重要基础。`
  }
]

module.exports = papers




