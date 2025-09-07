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
    get wordCount() { return getPaperWordCount('Attention is all you need') },
    background: `Transformer架构的提出源于对传统序列建模方法的局限性认识。传统的RNN和LSTM在处理长序列时存在梯度消失和计算效率低下的问题，而CNN虽然并行化程度高，但难以捕获长距离依赖关系。该研究旨在设计一种全新的架构，完全基于注意力机制来处理序列数据，从而在保持计算效率的同时实现更好的性能。这项工作的意义在于为自然语言处理领域带来了革命性的变化，奠定了现代大语言模型的基础架构。`,
    keyConcepts: `论文的核心创新是提出了完全基于注意力机制的Transformer架构，包括多头自注意力机制（Multi-Head Self-Attention）、位置编码（Positional Encoding）和残差连接等关键技术。多头注意力允许模型同时关注不同位置的信息，增强了模型的表示能力。位置编码解决了注意力机制本身不具备位置信息的问题。架构还采用了编码器-解码器结构，编码器负责理解输入序列，解码器负责生成输出序列。关键技术术语包括：Self-Attention（自注意力）、Multi-Head Attention（多头注意力）、Positional Encoding（位置编码）、Layer Normalization（层归一化）、Feed-Forward Network（前馈网络）。`,
    highlights: `Transformer在机器翻译任务上取得了显著的性能提升，在WMT 2014英德翻译和英法翻译数据集上分别达到了28.4和41.8的BLEU分数，超越了当时所有最先进的模型。更重要的是，该架构具有出色的并行化能力，训练时间大幅缩短。Transformer的成功为后续的BERT、GPT等预训练模型奠定了基础，彻底改变了自然语言处理领域的发展方向。该论文的影响力不仅体现在技术突破上，更在于其开创性的设计理念对AI领域的深远影响。`
  },

  {
    id: 2,
    title: 'ImageNet Classification with Deep Convolutional Neural Networks',
    authors: 'Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton',
    year: 2012,
    journal: 'NIPS',
    abstract: '这篇论文提出了一种名为AlexNet的深度卷积神经网络架构，在ImageNet大规模视觉识别挑战赛中取得了突破性成果，标志着深度学习在计算机视觉领域的"王者归来"。',
    url: 'https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf',
    get wordCount() { return getPaperWordCount('ImageNet Classification with Deep Convolutional Neural Networks') },
    background: `在2012年之前，计算机视觉领域主要依赖手工设计的特征提取方法，如SIFT、HOG等，这些方法虽然有效但需要大量的人工经验和领域知识。ImageNet大规模视觉识别挑战赛的举办为深度学习在计算机视觉领域的应用提供了重要契机。该研究旨在证明深度卷积神经网络在大规模图像分类任务上的优越性，挑战传统机器学习方法的统治地位。研究的重要性在于标志着深度学习时代的到来，为计算机视觉领域带来了根本性的变革。`,
    keyConcepts: `AlexNet的核心技术包括深度卷积神经网络架构、ReLU激活函数、Dropout正则化技术和数据增强等创新。网络采用8层结构，包含5个卷积层和3个全连接层，参数量达到6000万。ReLU激活函数解决了传统Sigmoid和Tanh激活函数的梯度消失问题，显著加速了训练过程。Dropout技术通过随机失活神经元来防止过拟合。数据增强技术包括随机裁剪、水平翻转和颜色变换等。关键技术术语包括：Convolutional Neural Network（卷积神经网络）、ReLU Activation（ReLU激活函数）、Dropout（随机失活）、Data Augmentation（数据增强）、GPU Acceleration（GPU加速）。`,
    highlights: `AlexNet在ImageNet ILSVRC-2012竞赛中取得了15.3%的top-5错误率，相比第二名的方法（26.2%）有了显著提升，这一突破性成果震惊了整个计算机视觉领域。该模型不仅性能优异，还证明了GPU并行计算在深度学习训练中的巨大潜力。AlexNet的成功重新点燃了神经网络的研究热情，开启了深度学习在计算机视觉领域的黄金时代，为后续的VGG、ResNet等更深度网络架构的发展奠定了基础。`
  },

  {
    id: 3,
    title: 'Training language models to follow instructions with human feedback',
    authors: 'Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul Christiano, Jan Leike, Ryan Lowe',
    year: 2022,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种结合人类反馈的训练方法，即基于人类反馈的强化学习（RLHF），来解决大型语言模型的对齐问题，推出了InstructGPT模型并证明了该方法的有效性。',
    url: 'https://arxiv.org/pdf/2203.02155',
    get wordCount() { return getPaperWordCount('Training language models to follow instructions with human feedback') },
    background: `随着大型语言模型规模的不断增大，模型虽然具备了强大的语言生成能力，但往往难以准确理解和执行人类的指令，存在对齐问题。传统的监督微调方法虽然能够提升模型在特定任务上的表现，但难以确保模型行为符合人类价值观和偏好。该研究旨在通过人类反馈的强化学习（RLHF）方法来解决这一对齐问题，使模型能够更好地理解和执行人类指令。研究的重要性在于为构建安全、有用、诚实的大型语言模型提供了重要技术路径。`,
    keyConcepts: `论文提出了基于人类反馈的强化学习（RLHF）框架，包括三个关键步骤：监督微调（SFT）、奖励模型训练（RM）和强化学习优化（PPO）。监督微调阶段使用人类标注的指令-回答对来训练模型。奖励模型训练阶段通过人类对模型输出的排序来学习人类偏好。强化学习优化阶段使用PPO算法来最大化奖励模型的输出。关键技术术语包括：Reinforcement Learning from Human Feedback（人类反馈强化学习）、Proximal Policy Optimization（近端策略优化）、Reward Model（奖励模型）、Instruction Following（指令遵循）、Alignment（对齐）。`,
    highlights: `InstructGPT模型在遵循人类指令方面表现出色，在TruthfulQA数据集上的准确率从GPT-3的17.6%提升到58.2%，在Helpful数据集上的表现也显著优于GPT-3。更重要的是，该模型在保持有用性的同时，显著减少了有害内容的生成。RLHF方法的成功证明了人类反馈在模型对齐中的重要作用，为后续的ChatGPT、Claude等对话模型的发展奠定了技术基础。这项工作对构建安全可靠的AI系统具有重要的指导意义。`
  },

{
    id: 4,
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    authors: 'Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela',
    year: 2020,
    journal: 'NeurIPS',
    abstract: '这篇论文提出了一种名为RAG（检索增强生成）的架构，将预训练的序列到序列模型与大规模文档检索机制相结合，在知识密集型NLP任务上取得了显著成果。',
    url: 'https://arxiv.org/pdf/2005.11401',
    get wordCount() { return getPaperWordCount('Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks') },
    background: `传统的生成式语言模型虽然具备强大的语言理解和生成能力，但在处理需要外部知识的任务时存在局限性，容易出现幻觉问题。模型的知识主要来源于训练数据，难以获取最新的、特定领域的知识。该研究旨在将检索机制与生成模型相结合，通过检索相关文档来增强模型的生成能力，解决知识密集型任务中的信息不足问题。研究的重要性在于为构建知识感知的AI系统提供了新的技术范式。`,
    keyConcepts: `RAG架构的核心思想是将预训练的生成模型与密集检索系统相结合。系统首先使用查询编码器将用户问题编码为向量，然后在知识库中检索相关文档，最后将检索到的文档与原始问题一起输入生成模型。关键技术包括密集段落检索（DPR）、生成式解码器和端到端训练策略。DPR使用双编码器架构来学习查询和段落的密集表示。关键技术术语包括：Retrieval-Augmented Generation（检索增强生成）、Dense Passage Retrieval（密集段落检索）、Knowledge-Intensive Tasks（知识密集型任务）、Hallucination（幻觉）、End-to-End Training（端到端训练）。`,
    highlights: `RAG在多个知识密集型任务上取得了显著成果，在Natural Questions数据集上的准确率达到44.5%，在TriviaQA数据集上达到56.8%，超越了传统的生成式模型。更重要的是，RAG能够提供可解释的答案，用户可以查看生成答案所依据的源文档。该方法的成功证明了检索与生成结合的有效性，为后续的WebGPT、LaMDA等知识增强模型的发展提供了重要启示。RAG范式已成为构建知识感知AI系统的重要技术路径。`
  },

{
    id: 5,
    title: 'Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings',
    authors: 'Authors not specified in the document',
    year: 2024,
    journal: 'arXiv',
    abstract: '这篇论文通过实证分析，检验顶级计算机视觉会议CVPR在过去二十年的研究趋势是否与萨顿的"惨痛教训"原则相符，首次对"惨痛的教训"这一AI领域的宏观指导原则进行了大规模、长周期的量化实证分析。',
    url: 'https://arxiv.org/pdf/2410.09649v1',
    get wordCount() { return getPaperWordCount('Learning the Bitter Lesson: Empirical Evidence from 20 Years of CVPR Proceedings') },
    background: `计算机视觉领域在过去二十年中经历了从传统机器学习方法到深度学习方法的重大转变。萨顿的'惨痛教训'理论认为，计算能力的提升比算法创新更重要，但这一理论在计算机视觉领域缺乏系统性的实证验证。该研究旨在通过分析CVPR会议过去二十年的论文，验证'惨痛教训'在计算机视觉领域是否成立，为领域发展提供宏观指导。研究的重要性在于为理解技术发展趋势和制定研究策略提供了重要依据。`,
    keyConcepts: `研究采用了大规模文献计量学方法，分析了CVPR会议从2000年到2019年的论文数据，包括方法类型、性能指标、计算资源使用等维度。研究将方法分为传统方法和深度学习方法两大类，并分析了它们在性能提升和计算需求方面的差异。关键技术术语包括：Bitter Lesson（惨痛教训）、Computational Power（计算能力）、Algorithm Innovation（算法创新）、Empirical Analysis（实证分析）、Literature Mining（文献挖掘）、Performance Scaling（性能扩展）。`,
    highlights: `研究结果证实了'惨痛教训'在计算机视觉领域的有效性，发现计算能力的提升确实比算法创新带来了更大的性能提升。深度学习方法相比传统方法在性能上有显著优势，但同时也需要更多的计算资源。这一发现为研究者和从业者提供了重要启示：在追求算法创新的同时，不应忽视计算能力提升的重要性。该研究为理解技术发展趋势和制定研究策略提供了重要的实证依据。`
  },

{
    id: 6,
    title: 'Language Models are Few-Shot Learners',
    authors: 'Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared D. Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, Dario Amodei',
    year: 2020,
    journal: 'arXiv',
    abstract: '这篇论文探索并证明了模型规模是实现强大的少样本学习能力的关键因素，推出了拥有1750亿参数的GPT-3模型，并展示了其在40多个NLP基准任务上的强大少样本学习能力。',
    url: 'https://arxiv.org/pdf/2005.14165',
    get wordCount() { return getPaperWordCount('Language Models are Few-Shot Learners') },
    background: `传统的机器学习方法通常需要大量的标注数据来训练模型，但在实际应用中，获取大量高质量标注数据往往成本高昂且耗时。少样本学习能力对于构建实用的AI系统至关重要。该研究旨在探索模型规模与少样本学习能力之间的关系，验证'规模定律'在自然语言处理领域的适用性。研究的重要性在于为构建更智能、更实用的语言模型提供了重要指导。`,
    keyConcepts: `GPT-3采用了与GPT-2相同的Transformer架构，但规模大幅扩展，参数量达到1750亿。模型通过自回归语言建模进行预训练，学习预测下一个词的概率分布。在推理阶段，模型通过上下文学习（In-Context Learning）来适应新任务，无需额外的参数更新。关键技术术语包括：Few-Shot Learning（少样本学习）、In-Context Learning（上下文学习）、Scaling Laws（规模定律）、Autoregressive Language Modeling（自回归语言建模）、Parameter Scaling（参数扩展）。`,
    highlights: `GPT-3在40多个NLP基准任务上展现了强大的少样本学习能力，在SuperGLUE基准上的平均性能达到71.8%，接近人类水平。模型能够通过简单的提示来完成复杂的推理任务，如数学问题求解、代码生成等。更重要的是，GPT-3展现了'涌现能力'，即在达到一定规模后突然出现的新能力。该模型的成功证明了规模定律的有效性，为后续的PaLM、Chinchilla等更大规模模型的发展奠定了基础。`
  },

{
    id: 7,
    title: 'Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting',
    authors: 'Bryan Lim, Sercan Ö. Arik, Nicolas Loeff, Tomas Pfister',
    year: 2019,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种名为时间融合变换器（Temporal Fusion Transformer, TFT）的深度学习架构，旨在实现卓越预测性能与高可解释性的统一，在多个真实时间序列数据集上取得了超越当时所有先进模型的预测精度。',
    url: 'https://arxiv.org/pdf/1912.09363',
    get wordCount() { return getPaperWordCount('Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting') },
    background: `时间序列预测在金融、能源、交通等领域具有重要应用价值，但传统方法往往难以处理多变量、多时间尺度的复杂时间序列数据。深度学习虽然在某些任务上表现出色，但在时间序列预测中往往缺乏可解释性，难以满足实际应用的需求。该研究旨在设计一种既具有强大预测能力又具备高可解释性的时间序列预测模型，解决多时间范围预测中的技术挑战。研究的重要性在于为构建可信赖的时间序列预测系统提供了重要技术方案。`,
    keyConcepts: `TFT采用了注意力机制来处理时间序列数据，包括静态协变量编码器、时间协变量编码器和门控机制等关键组件。模型使用变量选择网络来自动识别重要的输入特征，通过时间融合解码器来生成多时间范围的预测。关键技术术语包括：Temporal Fusion Transformer（时间融合变换器）、Multi-horizon Forecasting（多时间范围预测）、Variable Selection Network（变量选择网络）、Gated Residual Network（门控残差网络）、Interpretable Attention（可解释注意力）。`,
    highlights: `TFT在多个真实时间序列数据集上取得了超越当时所有先进模型的预测精度，在电力需求预测任务上的MAE相比最佳基线方法降低了7.2%。更重要的是，模型提供了丰富的可解释性分析，包括特征重要性、注意力权重和预测不确定性等。该模型的成功证明了注意力机制在时间序列预测中的有效性，为后续的Informer、Autoformer等模型的发展提供了重要启示。`
  },

{
    id: 8,
    title: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting',
    authors: 'Haoyi Zhou, Shanghang Zhang, Jieqi Peng, Shuai Zhang, Jianxin Li, Hui Xiong, Wancai Zhang',
    year: 2020,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种名为Informer的新型高效Transformer架构，通过ProbSparse自注意力机制、自注意力蒸馏和生成式解码器三大创新，成功解决了长序列时间序列预测中的效率瓶颈问题。',
    url: 'https://arxiv.org/pdf/2012.07436',
    get wordCount() { return getPaperWordCount('Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting') },
    background: `长序列时间序列预测在金融、能源、交通等领域具有重要应用价值，但传统方法往往难以处理长序列数据中的复杂依赖关系。Transformer虽然在某些任务上表现出色，但在处理长序列时存在计算复杂度高、内存消耗大的问题。该研究旨在设计一种高效的Transformer变体，专门用于长序列时间序列预测任务，解决传统Transformer的效率瓶颈问题。研究的重要性在于为长序列预测任务提供了高效的技术解决方案。`,
    keyConcepts: `Informer通过三个关键创新来解决效率问题：ProbSparse自注意力机制、自注意力蒸馏和生成式解码器。ProbSparse注意力通过稀疏化注意力矩阵来降低计算复杂度，自注意力蒸馏通过逐层减少序列长度来提升效率，生成式解码器通过一次性生成所有预测值来避免逐步解码。关键技术术语包括：ProbSparse Self-Attention（概率稀疏自注意力）、Self-Attention Distilling（自注意力蒸馏）、Generative Decoder（生成式解码器）、Long Sequence Forecasting（长序列预测）、Computational Efficiency（计算效率）。`,
    highlights: `Informer在多个长序列时间序列预测任务上取得了显著成果，在ETT数据集上的预测误差相比最佳基线方法降低了37.2%，同时训练时间减少了50%以上。模型能够处理长达1000个时间步的输入序列，为长序列预测任务提供了实用的解决方案。该模型的成功证明了注意力机制优化在提升效率方面的重要性，为后续的Autoformer、FEDformer等高效模型的发展奠定了基础。`
  },

{
    id: 9,
    title: 'Machine Learning: The High-Interest Credit Card of Technical Debt',
    authors: 'D. Sculley, Gary Holt, Daniel Golovin, Eugene Davydov, Todd Phillips, Dietmar Ebner, Vinay Chaudhary, Michael Young, Jean-Francois Crespo, Dan Dennison',
    year: 2014,
    journal: 'NIPS',
    abstract: '这篇论文创造性地将"技术债务"框架应用于机器学习系统，系统性地识别并分析了ML特有的技术债务，包括边界侵蚀、纠缠、隐藏反馈循环等问题，为构建和维护大规模机器学习系统提供了重要指导。',
    url: 'https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/43146.pdf',
    get wordCount() { return getPaperWordCount('Machine Learning: The High-Interest Credit Card of Technical Debt') },
    background: `机器学习系统在企业中的广泛应用带来了新的技术挑战，传统的软件工程方法难以完全适用于ML系统的开发和维护。ML系统具有数据依赖性强、模型复杂、反馈循环长等特点，容易积累技术债务。该研究旨在将'技术债务'概念引入机器学习领域，系统性地识别和分析ML特有的技术债务类型，为构建和维护大规模ML系统提供指导。研究的重要性在于为ML工程实践提供了重要的理论框架。`,
    keyConcepts: `研究识别了ML系统特有的技术债务类型，包括边界侵蚀、纠缠、隐藏反馈循环、未声明的消费者、数据依赖、配置复杂性、外部世界变化和反模式等。边界侵蚀指模型边界在部署后逐渐偏离训练时的假设，纠缠指模型组件之间的复杂依赖关系，隐藏反馈循环指模型预测对训练数据产生的间接影响。关键技术术语包括：Technical Debt（技术债务）、Boundary Erosion（边界侵蚀）、Entanglement（纠缠）、Hidden Feedback Loops（隐藏反馈循环）、Data Dependencies（数据依赖）、Configuration Complexity（配置复杂性）。`,
    highlights: `该研究为ML工程实践提供了重要的理论框架，帮助开发者和运维人员更好地理解和应对ML系统中的技术债务。研究提出的分类法和最佳实践为构建可维护、可扩展的ML系统提供了重要指导。该工作对推动ML工程化发展具有重要意义，为后续的MLOps、ML系统设计等研究领域奠定了基础。`
  },

{
    id: 10,
    title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
    authors: 'Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, Denny Zhou',
    year: 2022,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种名为思维链提示（Chain-of-Thought Prompting, CoT）的新方法，通过展示中间推理步骤来显著提升大型语言模型在复杂推理任务上的性能，并发现了思维链作为一种新兴能力的重要特性。',
    url: 'https://arxiv.org/pdf/2201.11903',
    get wordCount() { return getPaperWordCount('Chain-of-Thought Prompting Elicits Reasoning in Large Language Models') },
    background: `大型语言模型虽然在许多任务上表现出色，但在复杂推理任务上往往表现不佳，难以进行多步骤的逻辑推理。传统的提示方法通常要求模型直接给出答案，但这种方式难以激发模型的推理能力。该研究旨在通过展示中间推理步骤来提升大型语言模型在复杂推理任务上的性能，探索思维链提示的有效性。研究的重要性在于为提升AI系统的推理能力提供了重要技术路径。`,
    keyConcepts: `思维链提示的核心思想是在提示中包含中间推理步骤，引导模型进行逐步推理。研究发现在模型规模达到一定程度后，思维链提示能够显著提升模型在数学推理、常识推理等任务上的性能。关键技术术语包括：Chain-of-Thought Prompting（思维链提示）、Emergent Ability（涌现能力）、Multi-step Reasoning（多步骤推理）、In-Context Learning（上下文学习）、Scaling Laws（规模定律）、Few-shot Learning（少样本学习）。`,
    highlights: `思维链提示在多个复杂推理任务上取得了显著成果，在GSM8K数学推理数据集上将GPT-3的性能从17.9%提升到58.1%。更重要的是，研究发现思维链是一种涌现能力，只有在模型规模达到一定程度后才会出现。该方法的成功为提升AI系统的推理能力提供了重要启示，为后续的思维树、程序辅助推理等更高级推理方法的发展奠定了基础。`
  },

{
    id: 11,
    title: 'Wide & Deep Learning for Recommender Systems',
    authors: 'Heng-Tze Cheng, Levent Koc, Jeremiah Harmsen, Tal Shaked, Tushar Chandra, Hrishi Aradhye, Glen Anderson, Greg Corrado, Wei Chai, Mustafa Ispir, Rohan Anil, Zakaria Haque, Lichan Hong, Vihan Jain, Xiaobing Liu, Hemal Shah',
    year: 2016,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种名为Wide & Deep的混合模型框架，通过联合训练线性模型和深度神经网络，成功地将记忆能力和泛化能力结合在一起，为现代大规模推荐系统树立了新的范式。',
    url: 'https://arxiv.org/pdf/1606.07792',
    get wordCount() { return getPaperWordCount('Wide & Deep Learning for Recommender Systems') },
    background: `推荐系统在互联网应用中具有重要地位，但传统方法往往难以同时处理记忆能力和泛化能力。线性模型虽然能够记忆用户行为模式，但泛化能力有限；深度模型虽然具备强大的泛化能力，但难以记忆稀疏特征。该研究旨在设计一种混合模型架构，将线性模型和深度模型的优势结合起来，为推荐系统提供更好的解决方案。研究的重要性在于为现代推荐系统的发展奠定了重要基础。`,
    keyConcepts: `Wide & Deep模型采用并行架构，包含Wide部分和Deep部分。Wide部分使用线性模型来处理稀疏特征，具备记忆能力；Deep部分使用深度神经网络来处理密集特征，具备泛化能力。两部分通过联合训练来学习最优的权重组合。关键技术术语包括：Wide & Deep Learning（宽深学习）、Memorization（记忆）、Generalization（泛化）、Sparse Features（稀疏特征）、Dense Features（密集特征）、Joint Training（联合训练）。`,
    highlights: `Wide & Deep模型在Google Play应用推荐系统中取得了显著成果，相比纯深度模型，点击率提升了3.9%，应用安装率提升了1%。该模型成功地将记忆能力和泛化能力结合起来，为推荐系统提供了更优的解决方案。该架构的成功为后续的DeepFM、xDeepFM等混合模型的发展奠定了基础，成为现代推荐系统的重要技术范式。`
  },

{
    id: 12,
    title: 'Dense Passage Retrieval for Open-Domain Question Answering',
    authors: 'Vladimir Karpukhin, Barlas Oğuz, Sewon Min, Patrick Lewis, Ledell Wu, Sergey Edunov, Danqi Chen, Wen-tau Yih',
    year: 2020,
    journal: 'arXiv',
    abstract: '这篇论文提出了一种名为DPR（Dense Passage Retrieval）的密集向量检索方法，通过双编码器架构和创新的训练策略，在开放域问答任务中显著超越了传统的稀疏检索方法如BM25。',
    url: 'https://arxiv.org/pdf/2004.04906',
    get wordCount() { return getPaperWordCount('Dense Passage Retrieval for Open-Domain Question Answering') },
    background: `开放域问答系统需要从大规模文档集合中检索相关信息来回答问题，但传统的稀疏检索方法如BM25往往难以捕获查询和文档之间的语义相似性。密集检索方法虽然能够学习语义表示，但在实际应用中往往效果不佳。该研究旨在设计一种高效的密集检索方法，专门用于开放域问答任务，提升检索的准确性和效率。研究的重要性在于为构建高质量的开放域问答系统提供了重要技术方案。`,
    keyConcepts: `DPR采用双编码器架构，使用BERT作为查询编码器和段落编码器，将查询和段落分别编码为密集向量。模型通过对比学习来训练编码器，学习查询和正负段落之间的相似性。关键技术术语包括：Dense Passage Retrieval（密集段落检索）、Dual Encoder（双编码器）、Contrastive Learning（对比学习）、Open-Domain QA（开放域问答）、Semantic Similarity（语义相似性）、Retrieval Accuracy（检索准确性）。`,
    highlights: `DPR在多个开放域问答数据集上取得了显著成果，在Natural Questions数据集上的准确率达到41.5%，相比BM25方法提升了15.2%。更重要的是，DPR的检索速度比传统方法快10倍以上，为实际应用提供了重要优势。该方法的成功证明了密集检索在开放域问答中的有效性，为后续的ColBERT、ANCE等更先进检索方法的发展奠定了基础。`
  },

{
    id: 13,
    title: 'Human-Centered Artificial Intelligence: Reliable, Safe & Trustworthy',
    authors: 'Ben Shneiderman',
    year: 2020,
    journal: 'arXiv',
    abstract: '这篇论文提出了以人为中心的人工智能（HCAI）框架，强调AI系统应该增强人类能力而非取代人类，并提出了可靠性、安全性和可信赖性三个核心原则。',
    url: 'https://arxiv.org/pdf/2002.04087',
    get wordCount() { return getPaperWordCount('Human-Centered Artificial Intelligence: Reliable, Safe & Trustworthy') },
    background: `人工智能技术的快速发展带来了新的机遇和挑战，但传统的AI系统设计往往以技术为中心，忽视了人类用户的需求和体验。随着AI系统在关键领域的广泛应用，如何构建可靠、安全、可信赖的AI系统成为重要议题。该研究旨在提出以人为中心的AI设计理念，强调AI系统应该增强人类能力而非取代人类，为构建更好的AI系统提供指导原则。研究的重要性在于为AI系统的设计和应用提供了重要的伦理和技术框架。`,
    keyConcepts: `HCAI框架强调AI系统应该具备可靠性、安全性和可信赖性三个核心特征。可靠性指系统能够稳定地执行预期功能，安全性指系统不会对用户或环境造成伤害，可信赖性指用户能够理解和信任系统的行为。关键技术术语包括：Human-Centered AI（以人为中心的AI）、Reliability（可靠性）、Safety（安全性）、Trustworthiness（可信赖性）、Human-AI Collaboration（人机协作）、Explainable AI（可解释AI）。`,
    highlights: `HCAI框架为AI系统的设计和应用提供了重要的指导原则，强调AI应该作为人类的合作伙伴而非替代品。该框架在医疗、金融、教育等关键领域的应用证明了其有效性，为构建更安全、更可信赖的AI系统提供了重要启示。该工作对推动AI技术的负责任发展具有重要意义，为后续的AI伦理、AI治理等研究领域奠定了基础。`
  },

  {
    id: 14,
    title: 'A Survey of Scientific Large Language Models: From Data Foundations to Agent Frontiers',
    authors: 'Ming Hu, Chenglong Ma, Wei Li, Wanghan Xu, Jiamin Wu, etc',
    year: 2025,
    journal: 'arXiv',
    abstract: '本综述提出了一个全面的、以数据为中心的综合分析，将科学大语言模型（Sci-LLMs）的发展重新定义为模型与其底层数据基础之间的协同演化。论文系统分析了超过270个预训练和后训练数据集，检查了190多个基准数据集，并提供了科学数据挑战的统一分类法，包括异构性、多尺度特性和不确定性。它引入了科学AI的评估维度，并探索了从静态评估向过程导向和发现驱动评估的转变。该工作为构建可信赖、持续进化的AI系统提供了见解，这些系统可以作为加速科学发现的真正合作伙伴。',
    url: 'https://arxiv.org/abs/2508.21148',
    get wordCount() { return getPaperWordCount('A Survey of Scientific Large Language Models: From Data Foundations to Agent Frontiers') },
    category: 'AI专业词汇',
    background: `科学大语言模型（Sci-LLMs）正在重塑科学知识的表示、整合与应用方式，但其发展受限于科学数据的复杂性。本研究旨在通过数据中心的视角，系统分析Sci-LLMs的演进过程，强调模型与数据基础之间的协同演化关系。核心问题在于科学数据具有多模态、跨尺度和领域特异性等挑战，与通用自然语言处理数据集存在显著差异。研究的重要性在于为构建可信赖、持续进化的人工智能系统提供路线图，推动Sci-LLMs成为加速科学发现的真正合作伙伴。该综述覆盖了从数据基础到智能体前沿的全链条分析，对AI4Science领域具有纲领性意义。`,
    keyConcepts: `论文提出了科学数据的统一分类法（包括文本、视觉、符号表示、结构化数据、时间序列和多组学整合）和科学知识的层次模型（事实层、理论层、方法技术层、建模仿真层和洞察层）。核心技术包括针对Sci-LLMs的预训练与后训练方法，涉及超过270个数据集的处理策略。创新点在于将科学数据挑战归纳为异构性、多尺度性和不确定性，要求模型具备领域不变性表示和跨模态推理能力。关键术语包括：Multimodal（多模态）、Cross-scale（跨尺度）、Domain-specific（领域特异性）、Uncertainty-laden（不确定性负载）、Domain Invariance（领域不变性）。论文还系统分类了通用基础模型（如Galactica）和领域专用模型（覆盖物理、化学、材料科学等），并引入了半自动化标注管道和专家验证等新兴解决方案。`,
    highlights: `本综述的主要贡献在于首次以数据为中心构建了Sci-LLMs的系统性框架，分析了190多个评估数据集，揭示了评估范式从静态考试向过程性和发现性评估的转变。论文提出了面向闭环系统的范式迁移，即基于Sci-LLMs的自主智能体能够主动实验、验证并贡献于动态演进的知识库。成果包括对270+数据集的深度分析和跨学科模型的全景展示，为领域提供了权威的参考资源和开发指南。这项工作对推动科学AI的可信进化具有里程碑意义，其提出的数据质量标准（准确性、完整性、时效性、可追溯性）和评估维度（知识理解、科学推理、多模态处理）将成为后续研究的重要基础。`
  }
,

  {
    id: 13,
    title: 'Intern-S1: A Scientific Multimodal Foundation Model',
    authors: 'Lei Bai, Zhongrui Cai, Yuhang Cao, Maosong Cao etc',
    year: 2025,
    journal: 'arXiv',
    abstract: '近年来，众多开源基础模型在广泛关注的领域取得了显著进展，性能已十分接近闭源模型。然而，在高价值但更具挑战性的科学专业领域，这些领域要么仍依赖专家模型，要么通用基础模型的进展显著滞后于热门领域，远不足以推动科学研究变革，且开源模型与闭源模型之间存在巨大差距。为弥合这一差距并进一步探索通用人工智能（AGI），我们推出了Intern-S1——一个具备通用理解和推理能力，且拥有分析多模态科学数据专业知识的专用通用模型。Intern-S1是一个多模态混合专家（MoE）模型，拥有280亿激活参数和2410亿总参数，基于5T token（其中包含超过2.5T来自科学领域的token）进行了持续预训练。在后训练阶段，Intern-S1在InternBootCamp中先后经历了离线和在线强化学习（RL），我们提出了混合奖励（MoR）方法以协同推进超过1000个任务的RL训练。通过算法、数据和训练系统的综合创新，Intern-S1在在线RL训练中达到了顶级性能。在综合评估基准上，Intern-S1在通用推理任务上展现了与开源模型竞争的性能，并在科学领域显著优于开源模型，在分子合成规划、反应条件预测、晶体热力学稳定性预测等专业任务上超越了最先进的闭源模型。',
    url: 'https://arxiv.org/abs/2508.15763',
    get wordCount() { return getPaperWordCount('Intern-S1: A Scientific Multimodal Foundation Model') },
    category: 'AI专业词汇',
    background: `科学研究因其推动人类社会取得根本性突破的潜力而被认为是人工智能发展（AGI）的终极目标之一，这对AI系统提出了极其严格的要求。它要求模型不仅能理解和捕捉从分子结构到时间序列信号等多种低资源分布的科学模态的内在规律，还要能执行长期、严谨的推理过程，如假设验证和实验设计优化。这共同催生了对具备科学模态理解能力的多模态大型推理模型的需求，以作为加速科学发现的基础工具。尽管开源多模态大模型（主要以视觉-语言模态为中心）和大型推理模型（LRMs）在自然图像理解、数学问题求解和代码生成等广受关注的领域取得了快速进展，性能甚至接近或部分超越了闭源模型，但在高价值、更具挑战性的科学场景中，开源基础模型的进展显著滞后，且与闭源模型存在巨大差距，限制了其对前沿研究的贡献。本研究旨在弥合科学理解与推理能力上的这一差距，并推动开源模型向AGI更进一步。`,
    keyConcepts: `Intern-S1的核心技术在于其作为一个专为科学领域设计的多模态混合专家（Mixture-of-Experts, MoE）基础模型。其核心技术方法包括：1) **大规模多模态预训练**：模型以5T token（其中超过2.5T来自科学领域）进行持续预训练，具备处理图像、文本及科学数据（如非自然视觉数据、分子结构、时间序列信号）的能力。2) **混合专家架构**：模型总参数量达241B，其中激活参数为28B，通过MoE结构高效扩展模型容量以处理复杂科学任务。3) **创新的强化学习训练范式（InternBootCamp）**：在后训练阶段，模型先后经历离线和在线强化学习（RL）训练。其中关键创新是提出了**混合奖励（Mixture-of-Rewards, MoR）** 机制，能够协同地对超过1000个不同任务同时进行RL训练，解决了多任务协同优化的挑战。4) **综合系统优化**：集成了算法、数据（涵盖低资源科学模态）和训练系统的创新，确保了在线RL训练达到顶级性能。主要创新点在于首次将MoE架构与针对科学领域的多模态预训练和大规模多任务RL（通过MoR）相结合，专门针对科学领域数据低资源、多模态、需严谨推理的特点进行优化。关键技术术语包括：Multimodal Foundation Model（多模态基础模型）、Mixture-of-Experts (MoE)（混合专家）、Reinforcement Learning (RL)（强化学习）、Mixture-of-Rewards (MoR)（混合奖励）、Continual Pre-training（持续预训练）、Scientific Modalities（科学模态）。`,
    highlights: `Intern-S1的主要贡献和成果包括：1) **模型性能卓越**：在综合评估基准上，Intern-S1在通用推理任务上表现出与顶级开源模型竞争的性能，并在科学领域（如图像-文本和纯文本科学任务）显著超越所有开源模型，甚至在某些专业任务（如分子合成规划、反应条件预测、晶体热力学稳定性预测）上超越了当前最先进的闭源模型（如Grok-4, Gemini 2.5 Pro）。图1直观展示了其相对于开源和闭源模型的优势。2) **技术创新性强**：提出了混合奖励（MoR）这一新颖的RL训练方法，成功实现了超千任务的高效协同训练，并结合MoE架构和大规模科学数据预训练，为科学AI模型设立了新的技术标杆。3) **推动领域发展**：作为强大的开源科学多模态模型，它极大地弥合了开源与闭源模型在科学能力上的差距，为科学研究提供了可用的基础工具，加速了科学发现进程。同时，该研究代表了向通用人工智能（AGI）迈进的重要一步，探索了在能力增长不均衡的领域（见图2）发展通用智能系统的可行路径。模型已开源，可供社区使用和进一步发展。`
  },

  {
    id: 14,
    title: 'Qwen-Image Technical Report',
    authors: 'Chenfei Wu, Jiahao Li, Jingren Zhou, Junyang Lin etc',
    year: 2025,
    journal: 'arXiv',
    abstract: '我们推出Qwen-Image，这是Qwen系列中的图像生成基础模型，在复杂文本渲染和精确图像编辑方面实现了显著进展。为解决复杂文本渲染的挑战，我们设计了包含大规模数据收集、过滤、标注、合成和平衡的综合数据管道。此外，我们采用渐进式训练策略，从非文本到文本渲染开始，从简单到复杂的文本输入演进，并逐步扩展到段落级描述。这种课程学习方法显著增强了模型的原生文本渲染能力。因此，Qwen-Image不仅在英语等字母语言中表现优异，在更具挑战性的汉字等表意文字语言上也取得了显著进展。为增强图像编辑一致性，我们引入了改进的多任务训练范式，不仅包含传统的文本到图像（T2I）和文本-图像到图像（TI2I）任务，还包括图像到图像（I2I）重建，有效对齐了Qwen2.5-VL和MMDiT的潜在表示。',
    url: 'https://arxiv.org/abs/2508.02324',
    get wordCount() { return getPaperWordCount('Qwen-Image Technical Report') },
    category: 'AI专业词汇',
    background: `图像生成模型作为现代人工智能的基础组成部分，能够从文本提示合成或修改视觉上引人注目且语义连贯的内容。尽管基于扩散的架构取得了显著进展，但仍存在两个关键挑战：首先，在文本到图像生成中，使模型输出与复杂多方面的提示保持一致仍然是一个重大障碍，现有模型在处理多行文本渲染、非字母语言渲染（如中文）、局部文本插入或文本与视觉元素无缝集成等任务时存在困难；其次，在图像编辑中，实现编辑输出与原始图像之间的精确对齐面临双重挑战：视觉一致性（仅修改目标区域同时保留其他视觉细节）和语义连贯性（在结构变化期间保持全局语义）。Qwen-Image的研究旨在通过综合数据工程、渐进学习策略和增强的多任务训练范式来解决这些核心问题，推动图像生成技术的发展。`,
    keyConcepts: `Qwen-Image的核心技术包括：1）综合数据管道（comprehensive data pipeline），包含大规模数据收集、过滤、标注、合成和平衡，确保训练数据的质量和多样性；2）渐进式训练策略（progressive training strategy），采用课程学习方法，从非文本到文本渲染，从简单到复杂的文本输入演进，逐步扩展到段落级描述，显著提升模型的文本渲染能力；3）改进的多任务训练范式（enhanced multi-task training paradigm），整合T2I、TI2I和I2I重建任务，在共享潜在空间中实现多目标优化；4）双编码机制（dual-encoding mechanism），分别通过Qwen2.5-VL提取语义特征和通过VAE编码器获取重建特征，使编辑模块能够在保持语义一致性和视觉保真度之间取得平衡；5）MMDiT架构（Multi-Modal Diffusion Transformer），作为基础模型架构处理多模态输入。这些创新技术共同解决了复杂文本渲染和精确图像编辑的核心挑战。`,
    highlights: `Qwen-Image的主要贡献包括：1）在复杂文本渲染方面取得突破性进展，特别是在中文等表意文字语言上表现卓越，显著超越现有最先进模型；2）提出创新的双编码机制和多任务训练范式，有效解决了图像编辑中的语义一致性和视觉保真度平衡问题；3）在多个公开基准测试中达到最先进性能，包括GenEval、DPG和OneIG-Bench用于通用图像生成，以及GEdit、ImgEdit和GSO用于图像编辑；4）在LongText-Bench、ChineseWord和CVTG-2K等文本渲染基准上表现出色，证明了其卓越的文本生成能力；5）通过综合数据工程和渐进式训练策略，建立了可扩展的高效训练框架，为后续研究提供了重要参考。这些成果确立了Qwen-Image在图像生成领域的领先地位，推动了多模态人工智能技术的发展。`
  }
]

module.exports = papers




