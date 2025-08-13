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
  },
  {
    id: 3,
    title: 'Training language models to follow instructions with human feedback',
    authors: 'Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul Christiano, Jan Leike, Ryan Lowe',
    year: 2022,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种结合人类反馈的训练方法，即基于人类反馈的强化学习（RLHF），来解决大型语言模型的对齐问题，推出了InstructGPT模型并证明了该方法的有效性。',
    url: 'https://arxiv.org/pdf/2203.02155',
    get wordCount() { return getPaperWordCount('Training language models to follow instructions with human feedback') }, // 动态计算词汇数量
    category: 'AI专业词汇',
    background: `大型语言模型（LLMs）如GPT-3虽然在预训练后获得了强大的语言生成和世界知识，但它们并不总是能很好地理解并遵循用户的具体指令。模型的原始目标（预测下一个词）与用户期望的目标（生成有用、安全、遵循指令的回答）之间存在偏差，这种现象被称为"对齐失败"（alignment problem）。

例如，一个未经对齐的模型可能会生成不真实的内容（幻觉）、包含偏见或有害言论，或者直接拒绝回答无害的问题。传统的做法是通过微调来让模型适应特定任务，但这往往需要大量的标注数据，且无法保证模型能泛化到所有类型的指令。因此，如何让大型语言模型更好地与人类的意图对齐，成为一个亟待解决的关键问题。`,
    keyConcepts: `为解决对齐问题，该论文提出了一种结合了人类反馈的训练方法，即基于人类反馈的强化学习（Reinforcement Learning from Human Feedback, RLHF）。该方法的核心思想是使用人类偏好作为奖励信号，来训练模型生成更符合期望的输出。整个流程分为三个关键步骤：

* **监督微调 (Supervised Fine-Tuning, SFT)**：首先，收集一批由人类标注员编写的高质量"指令-回答"样本对，用这些数据对预训练的GPT-3模型进行初步的监督微调。这使得模型初步具备了遵循指令的能力。

* **训练奖励模型 (Reward Modeling, RM)**：让SFT模型对同一条指令生成多个不同的回答。然后，让人类标注员对这些回答进行排序，评判哪个更好。利用这些包含人类偏好排序的数据，训练一个独立的"奖励模型"，这个模型学会了预测哪个回答会更受人类偏爱，并为其打分。

* **强化学习微调 (Reinforcement Learning Fine-Tuning)**：将奖励模型作为强化学习环境中的奖励函数。使用近端策略优化（Proximal Policy Optimization, PPO）算法，进一步微调SFT模型。在这一阶段，模型生成一个回答后，会得到奖励模型给出的分数，并根据这个分数更新自己的策略（即参数），从而学会生成能获得更高奖励（即更受人类偏爱）的回答。为了防止模型在迎合奖励模型时偏离原始语言能力太远，还在奖励函数中加入了KL散度惩罚项。`,
    highlights: `本研究最大的亮点是推出了InstructGPT模型，并系统性地证明了RLHF是解决大型语言模型对齐问题的有效途径。论文通过广泛的实验表明：

* **显著更受人类偏爱**：尽管InstructGPT模型（13亿参数）比GPT-3（1750亿参数）小100多倍，但在遵循指令方面，其输出被人类标注员认为显著优于GPT-3。

* **更真实、更低毒性**：与GPT-3相比，InstructGPT模型在生成内容时产生"幻觉"的频率更低，即更加真实可靠，并且其生成有害或有毒内容的倾向也显著降低。

* **良好的泛化能力**：InstructGPT在公开的NLP数据集上并没有出现严重的性能下降，表明该对齐方法在提升指令遵循能力的同时，并未损害模型本身已有的核心技能。

* **历史意义**：这项工作是AI对齐领域的里程碑，它不仅提供了一套可行的、可扩展的方法论，也直接催生了后续更强大的对话模型（如ChatGPT），为开发更安全、更有用、更负责任的AI系统奠定了坚实的基础。`
  },
  {
    id: 7,
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    authors: 'Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela',
    year: 2020,
    journal: 'NeurIPS',
    abstract: '这篇论文提出了一种名为RAG（检索增强生成）的架构，将预训练的序列到序列模型与大规模文档检索机制相结合，在知识密集型NLP任务上取得了显著成果。',
    url: 'https://arxiv.org/pdf/2005.11401',
    get wordCount() { return getPaperWordCount('Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks') },
    category: 'AI专业词汇',
    background: `在大型语言模型（LLMs）的研究中，一个普遍的发现是，这些模型通过在海量文本上进行预训练，能够在其内部参数中存储大量的“事实知识”。然而，这种完全依赖“参数化记忆”的方式存在几个固有缺陷：首先，模型无法轻易地更新或修正其知识库，一旦世界发生变化，模型就需要昂贵的重新训练；其次，当模型生成一个事实性回答时，很难追溯其信息来源，缺乏可解释性；最后，这种模型有时会产生与事实不符的“幻觉”内容。虽然之前已有工作尝试将模型与外部知识库结合，但大多局限于答案是直接从文本中“抽取”出来的任务，而对于需要模型“生成”新文本的任务（如开放式问答、对话等），如何有效地结合检索与生成，仍是一个开放的研究问题。`,
    keyConcepts: `为解决上述挑战，该论文提出了一种通用的、可端到端微调的框架——**检索增强生成（Retrieval-Augmented Generation, RAG）**。RAG框架创新性地将两种类型的记忆结合起来：
1.  **参数化记忆 (Parametric Memory)**：这是一个预训练的序列到序列（seq2seq）模型，如BART。它负责语言生成，其知识存储在模型的权重参数中。
2.  **非参数化记忆 (Non-Parametric Memory)**：这是一个外部的、可随时访问的知识库，具体实现为一个由稠密向量（dense vectors）构成的维基百科索引。
RAG的工作流程是：当接收到一个输入（如一个问题）时，一个预训练的神经**检索器（Retriever）**会首先从非参数化记忆（维基百科索引）中检索出最相关的K个文档片段。然后，**生成器（Generator）**会将这些检索到的文档片段与原始输入拼接在一起，作为上下文，从而生成最终的、信息更丰富的回答。论文还探索了两种RAG的实现范式：一种是在生成整个序列时都使用同一批检索到的文档，另一种则允许在生成每个词元（token）时都可以参考不同的文档。`,
    highlights: `本研究最大的亮点在于**首次为生成式任务提供了一个通用且高效的、结合了参数化与非参数化记忆的框架**，并证明了其在多种知识密集型任务上的卓越性能。主要亮点包括：
1.  **性能突破**：RAG模型在三个开放域问答基准测试（Open-domain QA）上取得了当时最先进的（State-of-the-Art）成果，其性能不仅超越了纯参数化的seq2seq模型，也优于那些为特定任务设计的“检索-抽取”式架构。
2.  **生成质量更高**：在语言生成任务上，与强大的纯参数模型BART相比，RAG生成的文本更加具体、多样化，并且事实性更强，显著减少了“幻觉”现象。
3.  **知识可更新与可解释**：RAG框架的一个关键优势是其“即插即用”的知识库。论文通过实验证明，只需简单地替换外部的文档索引，就可以轻松地更新模型的知识，而无需重新训练整个模型。同时，由于可以查看模型检索到了哪些文档来生成答案，RAG为模型的决策提供了来源依据，增强了可解释性。这项工作为后续的检索增强语言模型研究奠定了坚实的基础。`
  },
  {
    id: 5,
    title: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
    authors: 'Authors not specified in the document',
    year: 2024,
    journal: 'arXiv',
    abstract: '这篇论文通过实证分析，检验顶级计算机视觉会议CVPR在过去二十年的研究趋势是否与萨顿的"惨痛教训"原则相符，首次对"惨痛的教训"这一AI领域的宏观指导原则进行了大规模、长周期的量化实证分析。',
    url: 'https://arxiv.org/pdf/2410.09649v1',
    get wordCount() { return getPaperWordCount('Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings') }, // 动态计算词汇数量
    category: 'AI专业词汇',
    background: `人工智能领域的先驱理查·萨顿（Rich Sutton）提出了著名的"惨痛的教训"（The Bitter Lesson）原则，其核心论点是：那些利用大规模计算、采用通用学习方法的AI系统，在长远来看总是胜过那些依赖于人类专家知识和手工设计特征的系统。尽管这一原则在AI社区影响深远，但缺少系统的、大规模的量化证据来验证其在具体科研领域的体现。计算机视觉（CV）领域的发展历程，从早期依赖SIFT、HOG等手工特征，到后来全面拥抱深度学习，似乎是"惨痛的教训"的一个典型例证。因此，本研究旨在通过实证分析，检验顶级计算机视觉会议CVPR在过去二十年的研究趋势是否与萨顿的"惨痛教训"原则相符。`,
    keyConcepts: `为量化分析研究趋势，论文采用了基于大型语言模型（LLM）的先进自然语言处理技术。研究者们构建了一个方法论，用于系统性地评估CVPR论文摘要和标题中所体现的研究方法演变。该方法的核心是定义了三个与"惨痛的教训"原则直接相关的维度：

* **通用方法 vs. 人类知识 (General Methods vs. Human Knowledge)**：评估研究是更倾向于可扩展的通用学习算法，还是更依赖于人类设计的领域特定知识。

* **利用计算 vs. 启发式搜索 (Search over Heuristics)**：评估研究是更强调通过搜索和优化技术来利用计算能力，还是依赖于人类设计的启发式策略。

* **学习 vs. 硬编码知识 (Learned vs. Hard-coded Knowledge)**：分析研究中的知识是模型通过学习获得的，还是被直接硬编码到系统中。

通过对每年随机抽样的200篇CVPR论文进行标注和分析，论文旨在揭示这些维度在过去20年间的演变模式与趋势。`,
    highlights: `本研究最大的亮点在于首次对"惨痛的教训"这一AI领域的宏观指导原则进行了大规模、长周期的量化实证分析。它不仅验证了该原则在计算机视觉领域的有效性，还揭示了该领域研究范式的重大转变。研究结果清晰地显示，CVPR的研究趋势显著地从依赖人类专家知识和手工特征，转向了拥抱通用学习算法和大规模计算。这项工作为理解AI研究的成功策略提供了宝贵的数据支持，并为未来计算机视觉乃至更广泛的人工智能领域的研究重点和方法论选择提供了重要参考。其创新的分析方法也为使用LLM进行科学计量学和科研趋势分析开辟了新的道路。`
  }
]

module.exports = papers




