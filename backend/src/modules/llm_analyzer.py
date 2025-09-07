"""
LLM分析模块
负责论文内容分析和词汇提取
"""

import json
import time
import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class LLMClientManager:
    """LLM客户端管理器"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.clients = {}
        self._init_clients()
    
    def _init_clients(self):
        """初始化LLM客户端"""
        provider = self.config['llm']['provider']
        
        if provider == 'openai':
            try:
                from openai import OpenAI
                self.clients['openai'] = OpenAI(
                    api_key=self.config['llm']['api_key'],
                    base_url=self.config['llm']['base_url'],
                    timeout=self.config['llm'].get('timeout', 120)
                )
                logger.info("OpenAI客户端初始化成功")
            except Exception as e:
                logger.error(f"OpenAI客户端初始化失败: {e}")
        
        elif provider == 'claude':
            try:
                import anthropic
                self.clients['claude'] = anthropic.Anthropic(
                    api_key=self.config['llm']['api_key']
                )
                logger.info("Claude客户端初始化成功")
            except Exception as e:
                logger.error(f"Claude客户端初始化失败: {e}")
        
        else:
            logger.error(f"不支持的LLM提供商: {provider}")
    
    def analyze_paper(self, paper_content: str, paper_title: str) -> Dict:
        """分析论文内容"""
        prompt = self._build_analysis_prompt(paper_content, paper_title)
        provider = self.config['llm']['provider']
        
        try:
            if provider == 'openai':
                response = self.clients['openai'].chat.completions.create(
                    model=self.config['llm']['model'],
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=self.config['llm']['max_tokens'],
                    temperature=self.config['llm']['temperature']
                )
                return self._parse_openai_response(response.choices[0].message.content)
            
            elif provider == 'claude':
                response = self.clients['claude'].messages.create(
                    model=self.config['llm']['model'],
                    max_tokens=self.config['llm']['max_tokens'],
                    temperature=self.config['llm']['temperature'],
                    messages=[{"role": "user", "content": prompt}]
                )
                return self._parse_claude_response(response.content[0].text)
            
            else:
                raise Exception(f"不支持的LLM提供商: {provider}")
        
        except Exception as e:
            logger.error(f"LLM分析失败: {e}")
            raise Exception(f"LLM分析失败: {e}")
    
    def _build_analysis_prompt(self, paper_content: str, paper_title: str) -> str:
        """构建分析提示词"""
        # 限制内容长度避免token超限
        max_content_length = 8000
        if len(paper_content) > max_content_length:
            paper_content = paper_content[:max_content_length] + "..."
        
        prompt = f"""你是一个专业的AI论文分析专家。请分析以下论文内容，并按照指定格式返回分析结果。

论文标题：{paper_title}
论文内容：{paper_content}

请从以下四个维度进行分析：

1. 论文摘要（abstract）：
   - 将论文的英文摘要翻译成中文
   - 保持学术性和准确性
   - 字数控制在150-200字

2. 背景解读（background）：
   - 研究背景和动机
   - 要解决的核心问题
   - 研究的重要性和意义
   - 字数控制在200-300字

3. 关键概念（keyConcepts）：
   - 核心技术和方法
   - 主要创新点
   - 关键技术术语
   - 字数控制在300-400字

4. 论文亮点（highlights）：
   - 主要贡献和成果
   - 实验结果和性能提升
   - 对领域的影响和意义
   - 字数控制在200-300字

5. 词汇提取（vocabulary）：
   请提取以下四类词汇，每类词汇要求：
   - GRE高频词汇：GRE考试中常见的高频词汇
   - TOEFL高频词汇：TOEFL考试中常见的高频词汇
   - IELTS高频词汇：IELTS考试中常见的高频词汇
   - AI专业词汇：人工智能领域的专业术语
   
   每篇论文提取的四类词汇总数不少于20个，每类词汇不少于5个。
   
   每个词汇需要包含：
   - 词汇本身（英文）
   - 中文释义
   - 英文释义
   - 词性（如：noun, verb, adjective, adverb等）
   - 音标（使用国际音标IPA格式）
   - 在论文中的例句（英文原文）
   - 例句的中文翻译

请严格按照以下JSON格式返回结果：
{{
  "abstract": "论文摘要中文翻译",
  "background": "背景解读内容",
  "keyConcepts": "关键概念内容", 
  "highlights": "论文亮点内容",
  "vocabulary": {{
    "gre": [
      {{
        "word": "词汇",
        "chineseMeaning": "中文释义",
        "englishMeaning": "英文释义",
        "partOfSpeech": "词性",
        "pronunciation": "音标",
        "context": "在论文中的例句（英文）",
        "translation": "例句的中文翻译"
      }}
    ],
    "toefl": [],
    "ielts": [],
    "ai": []
  }}
}}"""
        
        return prompt
    
    def _parse_openai_response(self, response_text: str) -> Dict:
        """解析OpenAI响应"""
        try:
            # 提取JSON部分
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise Exception("响应中未找到JSON格式")
            
            json_str = response_text[json_start:json_end]
            result = json.loads(json_str)
            
            # 验证结果格式
            self._validate_analysis_result(result)
            return result
            
        except Exception as e:
            logger.error(f"解析OpenAI响应失败: {e}")
            logger.error(f"原始响应: {response_text}")
            raise Exception(f"解析OpenAI响应失败: {e}")
    
    def _parse_claude_response(self, response_text: str) -> Dict:
        """解析Claude响应"""
        try:
            # 提取JSON部分
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise Exception("响应中未找到JSON格式")
            
            json_str = response_text[json_start:json_end]
            result = json.loads(json_str)
            
            # 验证结果格式
            self._validate_analysis_result(result)
            return result
            
        except Exception as e:
            logger.error(f"解析Claude响应失败: {e}")
            logger.error(f"原始响应: {response_text}")
            raise Exception(f"解析Claude响应失败: {e}")
    
    def _validate_analysis_result(self, result: Dict) -> bool:
        """验证分析结果格式"""
        required_fields = ['background', 'keyConcepts', 'highlights', 'vocabulary']
        vocabulary_categories = ['gre', 'toefl', 'ielts', 'ai']
        
        # 检查必需字段
        for field in required_fields:
            if field not in result:
                raise Exception(f"缺少必需字段: {field}")
        
        # 检查词汇分类
        if not isinstance(result['vocabulary'], dict):
            raise Exception("vocabulary字段必须是字典类型")
        
        total_vocabulary_count = 0
        for category in vocabulary_categories:
            if category not in result['vocabulary']:
                raise Exception(f"缺少词汇分类: {category}")
            
            if not isinstance(result['vocabulary'][category], list):
                raise Exception(f"词汇分类{category}必须是列表类型")
            
            category_count = len(result['vocabulary'][category])
            total_vocabulary_count += category_count
            
            # 检查每类词汇数量
            if category_count < 5:
                raise Exception(f"词汇分类{category}的词汇数量不足，当前{category_count}个，要求至少5个")
        
        # 检查总词汇数量
        if total_vocabulary_count < 20:
            raise Exception(f"总词汇数量不足，当前{total_vocabulary_count}个，要求至少20个")
        
        return True


class PaperAnalyzer:
    """论文分析器"""
    
    def __init__(self, llm_client_manager: LLMClientManager):
        self.llm_client = llm_client_manager
        self.retry_count = 3
        self.retry_delay = 2
    
    def analyze_paper(self, paper_data: Dict) -> Dict:
        """分析单篇论文"""
        paper_id = paper_data['paper_info']['id'] if 'id' in paper_data['paper_info'] else 'unknown'
        paper_title = paper_data['paper_info']['title']
        paper_content = paper_data['content']
        
        logger.info(f"开始分析论文: {paper_title}")
        
        for attempt in range(self.retry_count):
            try:
                # 调用LLM分析
                analysis_result = self.llm_client.analyze_paper(paper_content, paper_title)
                
                # 验证分析结果
                if self._validate_analysis_result(analysis_result):
                    logger.info(f"论文分析成功: {paper_title}")
                    return analysis_result
                else:
                    raise Exception("分析结果验证失败")
            
            except Exception as e:
                if attempt == self.retry_count - 1:
                    logger.error(f"论文分析失败 (尝试{self.retry_count}次): {paper_title} - {e}")
                    raise Exception(f"论文分析失败 (尝试{self.retry_count}次): {e}")
                else:
                    logger.warning(f"分析失败，重试中... (尝试 {attempt + 1}/{self.retry_count}): {paper_title}")
                    time.sleep(self.retry_delay * (2 ** attempt))  # 指数退避
        
        return None
    
    def _validate_analysis_result(self, result: Dict) -> bool:
        """验证分析结果"""
        try:
            # 检查必需字段
            required_fields = ['background', 'keyConcepts', 'highlights', 'vocabulary']
            for field in required_fields:
                if field not in result:
                    logger.error(f"缺少必需字段: {field}")
                    return False
            
            # 检查内容长度
            if len(result['background']) < 50:
                logger.error("背景解读内容过短")
                return False
            
            if len(result['keyConcepts']) < 50:
                logger.error("关键概念内容过短")
                return False
            
            if len(result['highlights']) < 50:
                logger.error("论文亮点内容过短")
                return False
            
            # 检查词汇分类
            vocabulary_categories = ['gre', 'toefl', 'ielts', 'ai']
            for category in vocabulary_categories:
                if category not in result['vocabulary']:
                    logger.error(f"缺少词汇分类: {category}")
                    return False
                
                if not isinstance(result['vocabulary'][category], list):
                    logger.error(f"词汇分类{category}必须是列表类型")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"验证分析结果失败: {e}")
            return False
    
    def batch_analyze_papers(self, papers_data: List[Dict]) -> List[Dict]:
        """批量分析论文"""
        results = []
        
        for i, paper_data in enumerate(papers_data):
            try:
                logger.info(f"分析进度: {i + 1}/{len(papers_data)}")
                result = self.analyze_paper(paper_data)
                
                # 添加论文信息到结果中
                result['paper_info'] = paper_data['paper_info']
                result['analysis_timestamp'] = datetime.now().isoformat()
                
                results.append(result)
                
                # 添加延迟避免API限制
                if i < len(papers_data) - 1:
                    time.sleep(1)
                
            except Exception as e:
                logger.error(f"批量分析失败: {paper_data['paper_info']['title']} - {e}")
                continue
        
        logger.info(f"批量分析完成: {len(results)}/{len(papers_data)} 成功")
        return results


class VocabularyExtractor:
    """词汇提取器"""
    
    def __init__(self):
        self.category_mapping = {
            'gre': 'GRE高频词',
            'toefl': 'TOEFL高频词',
            'ielts': 'IELTS高频词',
            'ai': 'AI专业词汇'
        }
    
    def extract_vocabulary_from_analysis(self, analysis_result: Dict, paper_title: str) -> List[Dict]:
        """从分析结果中提取词汇数据"""
        vocabulary_data = []
        vocabulary = analysis_result.get('vocabulary', {})
        
        for category, words_list in vocabulary.items():
            if category not in self.category_mapping:
                continue
            
            for word_info in words_list:
                if not self._validate_word_info(word_info):
                    continue
                
                word_data = {
                    "word": word_info['word'],
                    "meaning": word_info.get('chineseMeaning', word_info.get('meaning', '')),
                    "englishMeaning": word_info.get('englishMeaning', ''),
                    "pronunciation": word_info.get('pronunciation', ''),
                    "sentence": word_info.get('context', ''),
                    "translation": word_info.get('translation', ''),
                    "paperTitle": paper_title,
                    "category": self.category_mapping[category],
                    "difficulty": self._get_difficulty(word_info['word']),
                    "status": "learning",
                    "studyCount": 0,
                    "correctCount": 0,
                    "lastStudyTime": None,
                    "weeklyStudyCount": 0,
                    "partOfSpeech": word_info.get('partOfSpeech', ''),
                    "source": "LLM提取",
                    "extractedAt": datetime.now().isoformat()
                }
                vocabulary_data.append(word_data)
        
        logger.info(f"从论文 {paper_title} 提取了 {len(vocabulary_data)} 个词汇")
        return vocabulary_data
    
    def _validate_word_info(self, word_info: Dict) -> bool:
        """验证词汇信息"""
        required_fields = ['word', 'chineseMeaning', 'englishMeaning', 'partOfSpeech', 'pronunciation', 'context', 'translation']
        for field in required_fields:
            if field not in word_info or not word_info[field]:
                return False
        
        # 检查词汇长度
        if len(word_info['word']) < 2 or len(word_info['word']) > 50:
            return False
        
        return True
    
    def _get_difficulty(self, word: str) -> str:
        """根据词汇长度确定难度"""
        if len(word) <= 5:
            return 'easy'
        elif len(word) <= 8:
            return 'medium'
        else:
            return 'hard'
    
    def deduplicate_vocabulary(self, vocabulary_list: List[Dict]) -> List[Dict]:
        """词汇去重"""
        seen_words = set()
        unique_vocabulary = []
        
        for word_data in vocabulary_list:
            word_key = word_data['word'].lower()
            if word_key not in seen_words:
                seen_words.add(word_key)
                unique_vocabulary.append(word_data)
            else:
                logger.debug(f"跳过重复词汇: {word_data['word']}")
        
        logger.info(f"词汇去重: {len(vocabulary_list)} -> {len(unique_vocabulary)}")
        return unique_vocabulary