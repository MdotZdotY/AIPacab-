// clean_rag_vocabulary.js
// 清理RAG论文词汇数据中的重复和错误结构

const fs = require('fs')
const path = require('path')

// RAG论文词汇的完整数据
const ragVocabularyData = {
  'Substantial': {
    meaning: '大量的，实质性的 (adjective)',
    partOfSpeech: 'adjective',
    pronunciation: '/səbˈstæn.ʃəl/',
    sentence: 'Pre-trained neural language models have been shown to learn a substantial amount of in-depth knowledge from data.',
    translation: '预训练的神经语言模型已被证明能从数据中学到大量的深度知识。'
  },
  'Provenance': {
    meaning: '来源，出处 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/ˈprɑː.və.nəns/',
    sentence: 'Additionally, providing provenance for their decisions and updating their world knowledge remain open research problems.',
    translation: '此外，为其决策提供来源依据以及更新其世界知识仍然是开放的研究问题。'
  },
  'Mitigate': {
    meaning: '减轻，缓和 (verb)',
    partOfSpeech: 'verb',
    pronunciation: '/ˈmɪt.ɪ.ɡeɪt/',
    sentence: 'RAG models can mitigate the problem of hallucination by providing access to external knowledge.',
    translation: 'RAG模型可以通过提供外部知识访问来减轻幻觉问题。'
  },
  'Precisely': {
    meaning: '精确地 (adverb)',
    partOfSpeech: 'adverb',
    pronunciation: '/prɪˈsaɪs.li/',
    sentence: 'The model can precisely retrieve relevant documents for the given query.',
    translation: '模型可以精确地检索给定查询的相关文档。'
  },
  'Formulation': {
    meaning: '构想，公式化表达 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/ˌfɔːr.mjuˈleɪ.ʃən/',
    sentence: 'The formulation of the retrieval-augmented generation approach combines parametric and non-parametric memory.',
    translation: '检索增强生成方法的构想结合了参数化和非参数化记忆。'
  },
  'Diverse': {
    meaning: '多样的 (adjective)',
    partOfSpeech: 'adjective',
    pronunciation: '/daɪˈvɜːrs/',
    sentence: 'The model can access diverse sources of information through the retrieval mechanism.',
    translation: '模型可以通过检索机制访问多样化的信息源。'
  },
  'Validate': {
    meaning: '验证 (verb)',
    partOfSpeech: 'verb',
    pronunciation: '/ˈvæl.ɪ.deɪt/',
    sentence: 'We validate our approach on multiple knowledge-intensive tasks.',
    translation: '我们在多个知识密集型任务上验证了我们的方法。'
  },
  'Unify': {
    meaning: '统一，整合 (verb)',
    partOfSpeech: 'verb',
    pronunciation: '/ˈjuː.nɪ.faɪ/',
    sentence: 'RAG unifies the retrieval and generation processes in a single model.',
    translation: 'RAG在单个模型中统一了检索和生成过程。'
  },
  'Component': {
    meaning: '组件，组成部分 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/kəmˈpoʊ.nənt/',
    sentence: 'The retriever and generator are the two main components of the RAG model.',
    translation: '检索器和生成器是RAG模型的两个主要组件。'
  },
  'Demonstrate': {
    meaning: '展示，证明 (verb)',
    partOfSpeech: 'verb',
    pronunciation: '/ˈdem.ən.streɪt/',
    sentence: 'Our experiments demonstrate the effectiveness of the retrieval-augmented approach.',
    translation: '我们的实验证明了检索增强方法的有效性。'
  },
  'Architecture': {
    meaning: '架构，结构 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/ˈɑːr.kɪ.tek.tʃər/',
    sentence: 'The RAG architecture consists of a retriever and a generator.',
    translation: 'RAG架构由检索器和生成器组成。'
  },
  'Approach': {
    meaning: '方法，方式 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/əˈproʊtʃ/',
    sentence: 'This approach combines the benefits of both parametric and non-parametric memory.',
    translation: '这种方法结合了参数化和非参数化记忆的优势。'
  },
  'Paradigm': {
    meaning: '范式，典范 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/ˈper.ə.daɪm/',
    sentence: 'RAG represents a new paradigm for knowledge-intensive natural language processing.',
    translation: 'RAG代表了知识密集型自然语言处理的新范式。'
  },
  'Recipe': {
    meaning: '方案，方法 (引申义) (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/ˈres.ɪ.pi/',
    sentence: 'The paper provides a recipe for building effective retrieval-augmented models.',
    translation: '该论文提供了构建有效检索增强模型的方案。'
  },
  'Crucially': {
    meaning: '至关重要地 (adverb)',
    partOfSpeech: 'adverb',
    pronunciation: '/ˈkruː.ʃəl.i/',
    sentence: 'Crucially, the model can access external knowledge during generation.',
    translation: '至关重要的是，模型在生成过程中可以访问外部知识。'
  },
  'Isolate': {
    meaning: '孤立，单独考虑 (verb)',
    partOfSpeech: 'verb',
    pronunciation: '/ˈaɪ.sə.leɪt/',
    sentence: 'We isolate the effects of retrieval by comparing with baseline models.',
    translation: '我们通过与基线模型比较来孤立检索的效果。'
  },
  'Procedure': {
    meaning: '程序，步骤 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/prəˈsiː.dʒər/',
    sentence: 'The training procedure involves jointly optimizing the retriever and generator.',
    translation: '训练程序涉及联合优化检索器和生成器。'
  },
  'Retrieval-Augmented Generation (RAG)': {
    meaning: '检索增强生成 (noun phrase)',
    partOfSpeech: 'noun phrase',
    pronunciation: '/rɪˈtriː.vəl ɔːɡˈmentɪd ˌdʒenəˈreɪʃən/',
    sentence: 'Retrieval-Augmented Generation combines parametric memory with non-parametric memory.',
    translation: '检索增强生成将参数化记忆与非参数化记忆相结合。'
  },
  'Fine-tuning': {
    meaning: '微调 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/faɪn ˈtjuːnɪŋ/',
    sentence: 'Fine-tuning is performed on downstream tasks to adapt the model.',
    translation: '在下游任务上进行微调以适配模型。'
  },
  'Downstream Task': {
    meaning: '下游任务 (noun phrase)',
    partOfSpeech: 'noun phrase',
    pronunciation: '/ˈdaʊn.striːm tæsk/',
    sentence: 'The model is evaluated on various downstream tasks.',
    translation: '模型在各种下游任务上进行评估。'
  },
  'Parametric Memory': {
    meaning: '参数化记忆 (noun phrase)',
    partOfSpeech: 'noun phrase',
    pronunciation: '/ˌper.əˈmet.rɪk ˈmem.ər.i/',
    sentence: 'Parametric memory is stored in the model parameters.',
    translation: '参数化记忆存储在模型参数中。'
  },
  'Non-parametric Memory': {
    meaning: '非参数化记忆 (noun phrase)',
    partOfSpeech: 'noun phrase',
    pronunciation: '/nɒn ˌper.əˈmet.rɪk ˈmem.ər.i/',
    sentence: 'Non-parametric memory is accessed with a pre-trained neural retriever.',
    translation: '非参数化记忆通过预训练的神经检索器进行访问。'
  },
  'Retriever': {
    meaning: '检索器 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/rɪˈtriː.vər/',
    sentence: 'The retriever component finds relevant documents for the input query.',
    translation: '检索器组件为输入查询找到相关文档。'
  },
  'Seq2seq (Sequence-to-Sequence)': {
    meaning: '序列到序列 (noun/adjective)',
    partOfSpeech: 'noun/adjective',
    pronunciation: '/ˈsiː.kwəns.təˈsiː.kwəns/',
    sentence: 'We introduce RAG models where the parametric memory is a pre-trained seq2seq model.',
    translation: '我们引入了RAG模型，其中的参数化记忆是一个预训练的序列到序列模型。'
  },
  'Extractive': {
    meaning: '抽取式 (adjective)',
    partOfSpeech: 'adjective',
    pronunciation: '/ɪkˈstræk.tɪv/',
    sentence: 'We compare RAG to the popular extractive QA paradigm.',
    translation: '我们将RAG与流行的抽取式问答范式进行比较。'
  },
  'Abstractive': {
    meaning: '抽象式，生成式 (adjective)',
    partOfSpeech: 'adjective',
    pronunciation: '/æbˈstræk.tɪv/',
    sentence: 'To test RAG\'s natural language generation (NLG) in a knowledge-intensive setting, we use the MSMARCO NLG task v2.1.',
    translation: '为了在知识密集型环境中测试RAG的自然语言生成（NLG）能力，我们使用了MSMARCO NLG v2.1任务。'
  },
  'Marginalize': {
    meaning: '边缘化 (求边缘概率) (verb)',
    partOfSpeech: 'verb',
    pronunciation: '/ˈmɑːr.dʒɪ.nəl.aɪz/',
    sentence: 'For final prediction y, we treat z as a latent variable and marginalize over seq2seq predictions given different documents.',
    translation: '对于最终的预测y，我们将z视为一个潜变量，并在给定不同文档的情况下，对seq2seq的预测进行边缘化处理。'
  },
  'Latent Variable': {
    meaning: '潜变量，隐变量 (noun phrase)',
    partOfSpeech: 'noun phrase',
    pronunciation: '/ˈleɪ.tənt ˈver.i.ə.bəl/',
    sentence: 'To train the retriever and generator end-to-end, we treat the retrieved document as a latent variable.',
    translation: '为了端到端地训练检索器和生成器，我们将检索到的文档视为一个潜变量。'
  },
  'Ablation': {
    meaning: '消融研究 (noun)',
    partOfSpeech: 'noun',
    pronunciation: '/əˈbleɪ.ʃən/',
    sentence: 'To assess the effectiveness of the retrieval mechanism, we run ablations where we freeze the retriever during training.',
    translation: '为了评估检索机制的有效性，我们进行了消融实验，在训练期间冻结了检索器。'
  }
}

// 清理词汇数据
function cleanRAGVocabularyData() {
  console.log('开始清理RAG论文词汇数据...')
  
  const appJsPath = path.join(__dirname, 'app.js')
  let appJsContent = fs.readFileSync(appJsPath, 'utf8')
  
  // 统计清理的词汇数量
  let cleanedCount = 0
  
  // 遍历所有需要清理的词汇
  for (const [word, data] of Object.entries(ragVocabularyData)) {
    // 构建搜索模式 - 查找重复和错误的结构
    const searchPattern = new RegExp(
      `\\{\\s*id:\\s*\\{\\s*id:\\s*\\d+,\\s*word:\\s*'${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*englishMeaning:\\s*'',\\s*meaning:\\s*'',\\s*partOfSpeech:\\s*'',\\s*pronunciation:\\s*'',\\s*sentence:\\s*'',\\s*translation:\\s*'',,\\s*word:\\s*'${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*englishMeaning:\\s*'',\\s*meaning:\\s*'[^']*',\\s*partOfSpeech:\\s*'[^']*',\\s*pronunciation:\\s*'[^']*',\\s*sentence:\\s*'[^']*',\\s*translation:\\s*'[^']*',\\s*paperTitle:\\s*'[^']*',\\s*category:\\s*'[^']*',\\s*difficulty:\\s*'[^']*',\\s*studyCount:\\s*\\d+,\\s*correctCount:\\s*\\d+,\\s*lastStudyTime:\\s*null,\\s*status:\\s*'[^']*',\\s*weeklyStudyCount:\\s*\\d+\\s*\\}`,
      'g'
    )
    
    // 构建正确的替换内容
    const replacement = `{
        id: $1,
        word: '${word}',
        englishMeaning: '',
        meaning: '${data.meaning}',
        partOfSpeech: '${data.partOfSpeech}',
        pronunciation: '${data.pronunciation}',
        sentence: '${data.sentence}',
        translation: '${data.translation}',
        paperTitle: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        category: '${getCategory(word)}',
        difficulty: 'easy',
        studyCount: 0,
        correctCount: 0,
        lastStudyTime: null,
        status: 'learning',
        weeklyStudyCount: 0
      }`
    
    // 执行替换
    const newContent = appJsContent.replace(searchPattern, replacement)
    
    if (newContent !== appJsContent) {
      appJsContent = newContent
      cleanedCount++
      console.log(`✅ 清理词汇: ${word}`)
    } else {
      console.log(`⚠️  未找到需要清理的词汇: ${word}`)
    }
  }
  
  // 写回文件
  fs.writeFileSync(appJsPath, appJsContent, 'utf8')
  
  console.log(`\n清理完成！共清理了 ${cleanedCount} 个词汇的数据。`)
  return cleanedCount
}

// 根据词汇名称获取分类
function getCategory(word) {
  if (['Substantial', 'Provenance', 'Mitigate', 'Analogous'].includes(word)) {
    return 'GRE高频词'
  } else if (['Precisely', 'Formulation', 'Diverse', 'Validate', 'Unify', 'Component', 'Demonstrate'].includes(word)) {
    return 'TOEFL高频词'
  } else if (['Architecture', 'Approach', 'Paradigm', 'Recipe', 'Crucially', 'Isolate', 'Procedure'].includes(word)) {
    return 'IELTS高频词'
  } else {
    return 'AI专业词汇'
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    const cleanedCount = cleanRAGVocabularyData()
    console.log(`\n🎉 成功清理了 ${cleanedCount} 个RAG论文词汇的数据！`)
  } catch (error) {
    console.error('清理失败:', error)
  }
}

module.exports = { cleanRAGVocabularyData, ragVocabularyData }
