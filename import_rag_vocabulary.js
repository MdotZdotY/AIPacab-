// import_rag_vocabulary.js
// 导入 RAG 论文词汇到现有词汇库

const VocabularyManager = require('./utils/vocabularyManager.js')
const vocabularyManager = new VocabularyManager()

// RAG 论文词汇数据
const ragVocabularyData = [
  // GRE高频词
  {
    word: "Substantial",
    meaning: "大量的，实质性的 (adjective)",
    pronunciation: "/səbˈstæn.ʃəl/",
    sentence: "Pre-trained neural language models have been shown to learn a substantial amount of in-depth knowledge from data.",
    translation: "预训练的神经语言模型已被证明能从数据中学到大量的深度知识。",
    category: "GRE高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Provenance",
    meaning: "来源，出处 (noun)",
    pronunciation: "/ˈprɑː.və.nəns/",
    sentence: "Additionally, providing provenance for their decisions and updating their world knowledge remain open research problems.",
    translation: "此外，为其决策提供来源依据以及更新其世界知识仍然是开放的研究问题。",
    category: "GRE高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Hallucination",
    meaning: "幻觉 (在AI领域指模型虚构信息) (noun)",
    pronunciation: "/həˌluː.səˈneɪ.ʃən/",
    sentence: "Qualitatively, we find that RAG models hallucinate less and generate factually correct text more often than BART.",
    translation: "在定性方面，我们发现RAG模型比BART更少产生幻觉，并且更频繁地生成事实正确的文本。",
    category: "GRE高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Mitigate",
    meaning: "减轻，缓和 (verb)",
    pronunciation: "/ˈmɪt̬.ə.ɡeɪt/",
    sentence: "In order to mitigate these risks, AI systems could be employed to fight against misleading content and automated spam/phishing.",
    translation: "为了减轻这些风险，可以采用人工智能系统来对抗误导性内容和自动化的垃圾邮件/网络钓鱼。",
    category: "GRE高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Analogous",
    meaning: "类似的，可类比的 (adjective)",
    pronunciation: "/əˈnæl.ə.ɡəs/",
    sentence: "Our document index can be seen as a large external memory for neural networks to attend to, analogous to memory networks.",
    translation: "我们的文档索引可以被看作是神经网络可关注的一个大型外部记忆库，与记忆网络类似。",
    category: "GRE高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },

  // TOEFL高频词
  {
    word: "Precisely",
    meaning: "精确地 (adverb)",
    pronunciation: "/prəˈsaɪs.li/",
    sentence: "However, their ability to access and precisely manipulate knowledge is still limited...",
    translation: "然而，它们访问和精确操控知识的能力仍然有限...",
    category: "TOEFL高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Formulation",
    meaning: "构想，公式化表达 (noun)",
    pronunciation: "/ˌfɔːr.mjəˈleɪ.ʃən/",
    sentence: "We compare two RAG formulations, one which conditions on the same retrieved passages across the whole generated sequence...",
    translation: "我们比较了两种RAG的构想，其中一种是在整个生成序列中都以相同的检索段落为条件...",
    category: "TOEFL高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Diverse",
    meaning: "多样的 (adjective)",
    pronunciation: "/dɪˈvɝːs/",
    sentence: "It has obtained state-of-the-art results on a diverse set of generation tasks...",
    translation: "它在一系列多样化的生成任务上取得了最先进的成果...",
    category: "TOEFL高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Validate",
    meaning: "验证 (verb)",
    pronunciation: "/ˈvæl.ə.deɪt/",
    sentence: "We conducted an thorough investigation of the learned retrieval component, validating its effectiveness...",
    translation: "我们对学习到的检索组件进行了彻底的调查，验证了其有效性...",
    category: "TOEFL高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Unify",
    meaning: "统一，整合 (verb)",
    pronunciation: "/ˈjuː.nə.faɪ/",
    sentence: "Our work unifies previous successes in incorporating retrieval into individual tasks...",
    translation: "我们的工作统一了以往将检索整合到单个任务中的成功案例...",
    category: "TOEFL高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Component",
    meaning: "组件，组成部分 (noun)",
    pronunciation: "/kəmˈpoʊ.nənt/",
    sentence: "Our models leverage two components: (i) a retriever... and (ii) a generator...",
    translation: "我们的模型利用了两个组件：(i)一个检索器...以及(ii)一个生成器...",
    category: "TOEFL高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Demonstrate",
    meaning: "展示，证明 (verb)",
    pronunciation: "/ˈdem.ən.streɪt/",
    sentence: "RAG demonstrates that neither a re-ranker nor extractive reader is necessary for state-of-the-art performance.",
    translation: "RAG证明了，要达到最先进的性能，既不需要重排序器也不需要抽取式阅读器。",
    category: "TOEFL高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },

  // IELTS高频词
  {
    word: "Architecture",
    meaning: "架构，结构 (noun)",
    pronunciation: "/ˈɑːr.kə.tek.tʃɚ/",
    sentence: "...their performance lags behind task-specific architectures.",
    translation: "...它们的性能落后于为特定任务设计的架构。",
    category: "IELTS高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Approach",
    meaning: "方法，方式 (noun)",
    pronunciation: "/əˈproʊtʃ/",
    sentence: "We endow pre-trained, parametric-memory generation models with a non-parametric memory through a general-purpose fine-tuning approach...",
    translation: "我们通过一种通用的微调方法，为预训练的、基于参数化记忆的生成模型赋予了非参数化记忆...",
    category: "IELTS高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Paradigm",
    meaning: "范式，典范 (noun)",
    pronunciation: "/ˈper.ə.daɪm/",
    sentence: "We compare RAG to the popular extractive QA paradigm...",
    translation: "我们将RAG与流行的抽取式问答范式进行比较...",
    category: "IELTS高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Recipe",
    meaning: "方案，方法 (引申义) (noun)",
    pronunciation: "/ˈres.ə.pi/",
    sentence: "We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) models...",
    translation: "我们为检索增强生成（RAG）模型探索了一种通用的微调方案...",
    category: "IELTS高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Crucially",
    meaning: "至关重要地 (adverb)",
    pronunciation: "/ˈkruː.ʃəl.i/",
    sentence: "Crucially, by using pre-trained access mechanisms, the ability to access knowledge is present without additional training.",
    translation: "至关重要的是，通过使用预训练的访问机制，访问知识的能力无需额外训练就已具备。",
    category: "IELTS高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Isolate",
    meaning: "孤立，单独考虑 (verb)",
    pronunciation: "/ˈaɪ.sə.leɪt/",
    sentence: "Prior work has shown that retrieval improves performance across a variety of NLP tasks when considered in isolation.",
    translation: "以往的研究表明，当单独考虑时，检索可以提高各种自然语言处理任务的性能。",
    category: "IELTS高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Procedure",
    meaning: "程序，步骤 (noun)",
    pronunciation: "/prəˈsiː.dʒɚ/",
    sentence: "We refer to this decoding procedure as \"Thorough Decoding.\"",
    translation: "我们将此解码程序称为"彻底解码"。",
    category: "IELTS高频词",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },

  // AI专业词汇
  {
    word: "Retrieval-Augmented Generation (RAG)",
    meaning: "检索增强生成 (noun phrase)",
    pronunciation: "/rɪˈtriː.vəl ɔːɡˈment.ɪd ˌdʒen.əˈreɪ.ʃən/",
    sentence: "We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) models...",
    translation: "我们为检索增强生成（RAG）模型探索了一种通用的微调方案...",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Fine-tuning",
    meaning: "微调 (noun)",
    pronunciation: "/ˈfaɪnˌtuː.nɪŋ/",
    sentence: "...and achieve state-of-the-art results when fine-tuned on downstream NLP tasks.",
    translation: "...并且在针对下游自然语言处理任务进行微调时取得了最先进的成果。",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Downstream Task",
    meaning: "下游任务 (noun phrase)",
    pronunciation: "/ˈdaʊn.striːm tæsk/",
    sentence: "Pre-trained models with a differentiable access mechanism to explicit non-parametric memory have so far been only investigated for extractive downstream tasks.",
    translation: "迄今为止，那些拥有对显式非参数化记忆的可微调访问机制的预训练模型，仅在抽取式的下游任务中得到研究。",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Parametric Memory",
    meaning: "参数化记忆 (noun phrase)",
    pronunciation: "/ˌper.əˈmet.rɪk ˈmem.ər.i/",
    sentence: "We introduce RAG models where the parametric memory is a pre-trained seq2seq model...",
    translation: "我们引入了RAG模型，其中的参数化记忆是一个预训练的序列到序列模型...",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Non-parametric Memory",
    meaning: "非参数化记忆 (noun phrase)",
    pronunciation: "/ˌnɑnˌper.əˈmet.rɪk ˈmem.ər.i/",
    sentence: "...and the non-parametric memory is a dense vector index of Wikipedia...",
    translation: "...而非参数化记忆则是一个稠密的维基百科向量索引...",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Retriever",
    meaning: "检索器 (noun)",
    pronunciation: "/rɪˈtriː.vɚ/",
    sentence: "...accessed with a pre-trained neural retriever.",
    translation: "...通过一个预训练的神经检索器进行访问。",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Seq2seq (Sequence-to-Sequence)",
    meaning: "序列到序列 (noun/adjective)",
    pronunciation: "/ˈsiː.kwəns.təˈsiː.kwəns/",
    sentence: "We introduce RAG models where the parametric memory is a pre-trained seq2seq model...",
    translation: "我们引入了RAG模型，其中的参数化记忆是一个预训练的序列到序列模型...",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Extractive",
    meaning: "抽取式 (adjective)",
    pronunciation: "/ɪkˈstræk.tɪv/",
    sentence: "We compare RAG to the popular extractive QA paradigm...",
    translation: "我们将RAG与流行的抽取式问答范式进行比较...",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Abstractive",
    meaning: "抽象式，生成式 (adjective)",
    pronunciation: "/æbˈstræk.tɪv/",
    sentence: "To test RAG's natural language generation (NLG) in a knowledge-intensive setting, we use the MSMARCO NLG task v2.1.",
    translation: "为了在知识密集型环境中测试RAG的自然语言生成（NLG）能力，我们使用了MSMARCO NLG v2.1任务。",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Marginalize",
    meaning: "边缘化 (求边缘概率) (verb)",
    pronunciation: "/ˈmɑːr.dʒɪ.nəl.aɪz/",
    sentence: "For final prediction y, we treat z as a latent variable and marginalize over seq2seq predictions given different documents.",
    translation: "对于最终的预测y，我们将z视为一个潜变量，并在给定不同文档的情况下，对seq2seq的预测进行边缘化处理。",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Latent Variable",
    meaning: "潜变量，隐变量 (noun phrase)",
    pronunciation: "/ˈleɪ.tənt ˈver.i.ə.bəl/",
    sentence: "To train the retriever and generator end-to-end, we treat the retrieved document as a latent variable.",
    translation: "为了端到端地训练检索器和生成器，我们将检索到的文档视为一个潜变量。",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  },
  {
    word: "Ablation",
    meaning: "消融研究 (noun)",
    pronunciation: "/əˈbleɪ.ʃən/",
    sentence: "To assess the effectiveness of the retrieval mechanism, we run ablations where we freeze the retriever during training.",
    translation: "为了评估检索机制的有效性，我们进行了消融实验，在训练期间冻结了检索器。",
    category: "AI专业词汇",
    paperTitle: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
  }
]

// 执行导入
function importRAGVocabulary() {
  console.log('开始导入 RAG 论文词汇...')
  
  try {
    // 使用 VocabularyManager 添加新词汇
    const result = vocabularyManager.addNewWords(ragVocabularyData)
    
    console.log('导入完成！')
    console.log('总词汇数:', result.total)
    console.log('新增词汇数:', result.added)
    console.log('跳过重复词汇数:', result.skipped)
    
    // 显示详细统计
    const stats = vocabularyManager.getVocabularyStats()
    console.log('\n词汇库统计:')
    console.log('按分类统计:', stats.byCategory)
    console.log('按论文统计:', stats.byPaper)
    
    return result
    
  } catch (error) {
    console.error('导入失败:', error)
    throw error
  }
}

// 如果直接运行此脚本
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { importRAGVocabulary, ragVocabularyData }
}

// 在微信小程序环境中运行
if (typeof wx !== 'undefined') {
  // 导出到全局，供其他页面调用
  wx.importRAGVocabulary = importRAGVocabulary
  console.log('RAG 词汇导入功能已加载，可通过 wx.importRAGVocabulary() 调用')
}
