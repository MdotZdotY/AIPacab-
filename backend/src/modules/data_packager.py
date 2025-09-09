"""
数据打包模块
负责数据格式转换、版本管理和更新包生成
"""

import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
import hashlib

logger = logging.getLogger(__name__)


class DataFormatConverter:
    """数据格式转换器"""
    
    def __init__(self):
        self.paper_id_counter = 13  # 从现有最大ID开始
        self.vocabulary_id_counter = 1
    
    def convert_analysis_to_paper_data(self, analysis_result: Dict, paper_info: Dict) -> Dict:
        """将分析结果转换为论文数据格式"""
        paper_data = {
            "id": self.paper_id_counter,
            "title": paper_info['title'],
            "authors": paper_info['authors'],
            "year": paper_info['year'],
            "journal": paper_info['journal'],
            "abstract": analysis_result.get('abstract', paper_info.get('abstract', '')),
            "url": paper_info['url'],
            "category": paper_info.get('category', 'AI专业词汇'),
            "background": analysis_result['background'],
            "keyConcepts": analysis_result['keyConcepts'],
            "highlights": analysis_result['highlights']
        }
        
        self.paper_id_counter += 1
        logger.info(f"转换论文数据: {paper_info['title']}")
        return paper_data
    
    def convert_vocabulary_to_words_data(self, vocabulary_list: List[Dict]) -> List[Dict]:
        """将词汇列表转换为词汇数据格式"""
        words_data = []
        
        for word_data in vocabulary_list:
            # 分配唯一ID
            word_data['id'] = self.vocabulary_id_counter
            self.vocabulary_id_counter += 1
            
            # 确保所有必需字段存在
            if 'partOfSpeech' not in word_data:
                word_data['partOfSpeech'] = ''
            
            words_data.append(word_data)
        
        logger.info(f"转换词汇数据: {len(words_data)} 个词汇")
        return words_data
    
    def generate_word_count_function(self, paper_title: str) -> str:
        """生成动态计算词汇数量的函数"""
        return f"get wordCount() {{ return getPaperWordCount('{paper_title}') }}"


class VersionManager:
    """版本管理器"""
    
    def __init__(self):
        self.version = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.update_package = {
            "version": self.version,
            "papers": [],
            "vocabulary": [],
            "deleted": [],
            "timestamp": datetime.now().isoformat(),
            "checksum": ""
        }
    
    def add_papers(self, papers_data: List[Dict]):
        """添加论文数据到更新包"""
        self.update_package["papers"].extend(papers_data)
        logger.info(f"添加 {len(papers_data)} 篇论文到更新包")
    
    def add_vocabulary(self, vocabulary_data: List[Dict]):
        """添加词汇数据到更新包"""
        self.update_package["vocabulary"].extend(vocabulary_data)
        logger.info(f"添加 {len(vocabulary_data)} 个词汇到更新包")
    
    def add_deleted_items(self, deleted_items: List[Dict]):
        """添加删除项目到更新包"""
        self.update_package["deleted"].extend(deleted_items)
        logger.info(f"添加 {len(deleted_items)} 个删除项目到更新包")
    
    def calculate_checksum(self):
        """计算更新包校验和"""
        # 先移除现有的校验和字段，然后计算
        temp_package = self.update_package.copy()
        temp_package.pop('checksum', None)
        content = json.dumps(temp_package, sort_keys=True, ensure_ascii=False)
        checksum = hashlib.md5(content.encode('utf-8')).hexdigest()
        self.update_package["checksum"] = checksum
        logger.info(f"计算校验和: {checksum}")
    
    def create_update_package(self) -> Dict:
        """创建更新包"""
        self.calculate_checksum()
        return self.update_package
    
    def save_update_package(self, file_path: str):
        """保存更新包到文件"""
        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(self.update_package, f, ensure_ascii=False, indent=2)
            logger.info(f"更新包已保存到: {file_path}")
        except Exception as e:
            logger.error(f"保存更新包失败: {e}")
            raise e


class MiniProgramDataInjector:
    """小程序数据注入器"""
    
    def __init__(self, miniprogram_path: str):
        self.miniprogram_path = miniprogram_path
        # 如果路径已经包含utils，直接使用；否则添加utils
        if miniprogram_path.endswith("utils"):
            self.papers_data_file = os.path.join(miniprogram_path, "papersData.js")
            self.vocabulary_manager_file = os.path.join(miniprogram_path, "vocabularyManager.js")
        else:
            self.papers_data_file = os.path.join(miniprogram_path, "utils", "papersData.js")
            self.vocabulary_manager_file = os.path.join(miniprogram_path, "utils", "vocabularyManager.js")
    
    def inject_papers_data(self, new_papers: List[Dict]):
        """注入新论文数据到papersData.js - 使用改进的安全注入逻辑"""
        try:
            # 使用改进的数据注入器
            from ..improved_data_injector import ImprovedDataInjector
            
            injector = ImprovedDataInjector(self.papers_data_file)
            success = injector.inject_papers_data_safely(new_papers)
            
            if success:
                logger.info(f"成功注入 {len(new_papers)} 篇论文到小程序")
            else:
                logger.error("论文数据注入失败")
            
            return success
            
        except ImportError:
            # 如果改进的注入器不可用，使用原有逻辑
            logger.warning("使用原有数据注入逻辑")
            return self._inject_papers_data_legacy(new_papers)
        except Exception as e:
            logger.error(f"注入论文数据失败: {e}")
            return False
    
    def _inject_papers_data_legacy(self, new_papers: List[Dict]):
        """原有的数据注入逻辑（作为备用）"""
        try:
            if not os.path.exists(self.papers_data_file):
                logger.error(f"论文数据文件不存在: {self.papers_data_file}")
                return False
            
            # 创建备份
            self._create_backup()
            
            # 读取现有论文数据
            with open(self.papers_data_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 找到papers数组的结束位置
            papers_end = content.rfind(']')
            if papers_end == -1:
                logger.error("未找到papers数组结束位置")
                return False
            
            # 构建新论文数据
            new_papers_js = []
            for paper in new_papers:
                paper_js = self._convert_paper_to_js(paper)
                new_papers_js.append(paper_js)
            
            # 插入新论文数据
            new_content = content[:papers_end] + ',\n\n' + ',\n\n'.join(new_papers_js) + '\n' + content[papers_end:]
            
            # 写回文件
            with open(self.papers_data_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            logger.info(f"成功注入 {len(new_papers)} 篇论文到小程序")
            return True
            
        except Exception as e:
            logger.error(f"注入论文数据失败: {e}")
            return False
    
    def _create_backup(self):
        """创建备份文件"""
        try:
            if not os.path.exists(self.papers_data_file):
                return
            
            backup_dir = "data/backups"
            os.makedirs(backup_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(backup_dir, f"papersData_backup_{timestamp}.js")
            
            with open(self.papers_data_file, 'r', encoding='utf-8') as src:
                with open(backup_file, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            
            logger.info(f"备份已创建: {backup_file}")
            
        except Exception as e:
            logger.error(f"创建备份失败: {e}")
    
    def _convert_paper_to_js(self, paper: Dict) -> str:
        """将论文数据转换为JavaScript格式"""
        # 转义特殊字符
        def escape_js_string(text):
            if not text:
                return ""
            return str(text).replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')
        
        js_template = f"""  {{
    id: {paper['id']},
    title: '{escape_js_string(paper['title'])}',
    authors: '{escape_js_string(paper['authors'])}',
    year: {paper['year']},
    journal: '{escape_js_string(paper['journal'])}',
    abstract: '{escape_js_string(paper['abstract'])}',
    url: '{escape_js_string(paper['url'])}',
    get wordCount() {{ return getPaperWordCount('{escape_js_string(paper['title'])}') }},
    category: '{escape_js_string(paper['category'])}',
    background: `{escape_js_string(paper['background'])}`,
    keyConcepts: `{escape_js_string(paper['keyConcepts'])}`,
    highlights: `{escape_js_string(paper['highlights'])}`
  }}"""
        return js_template
    
    def create_vocabulary_update_file(self, vocabulary_data: List[Dict], file_path: str):
        """创建词汇更新文件（JS格式）"""
        try:
            update_data = {
                "version": datetime.now().strftime("%Y%m%d_%H%M%S"),
                "vocabulary": vocabulary_data,
                "timestamp": datetime.now().isoformat()
            }
            
            # 生成JS格式内容
            js_content = f"""// 词汇更新数据
// 自动生成于: {datetime.now().isoformat()}

const vocabularyUpdate = {json.dumps(update_data, ensure_ascii=False, indent=2)}

module.exports = vocabularyUpdate
"""
            
            # 确保文件扩展名为.js
            if not file_path.endswith('.js'):
                file_path = file_path.replace('.json', '.js')
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(js_content)
            
            logger.info(f"词汇更新文件已创建: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"创建词汇更新文件失败: {e}")
            return False


class DataPackager:
    """数据打包器 - 整合所有数据打包功能"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.converter = DataFormatConverter()
        self.version_manager = VersionManager()
        self.injector = MiniProgramDataInjector(
            config.get('miniprogram', {}).get('data_path', '../utils/')
        )
    
    def package_analysis_results(self, analysis_results: List[Dict]) -> Dict:
        """打包分析结果"""
        papers_data = []
        vocabulary_data = []
        
        for result in analysis_results:
            paper_info = result['paper_info']
            
            # 转换论文数据
            paper_data = self.converter.convert_analysis_to_paper_data(result, paper_info)
            papers_data.append(paper_data)
            
            # 提取词汇数据
            from .llm_analyzer import VocabularyExtractor
            extractor = VocabularyExtractor()
            paper_vocabulary = extractor.extract_vocabulary_from_analysis(result, paper_info['title'])
            vocabulary_data.extend(paper_vocabulary)
        
        # 词汇去重
        vocabulary_data = self._deduplicate_vocabulary(vocabulary_data)
        
        # 转换词汇格式
        vocabulary_data = self.converter.convert_vocabulary_to_words_data(vocabulary_data)
        
        # 创建更新包
        self.version_manager.add_papers(papers_data)
        self.version_manager.add_vocabulary(vocabulary_data)
        
        update_package = self.version_manager.create_update_package()
        
        logger.info(f"数据打包完成: {len(papers_data)} 篇论文, {len(vocabulary_data)} 个词汇")
        return update_package
    
    def _deduplicate_vocabulary(self, vocabulary_list: List[Dict]) -> List[Dict]:
        """词汇去重 - 改进版本，确保与现有词汇去重"""
        try:
            # 使用改进的词汇管理器进行去重
            from ..improved_vocabulary_manager import ImprovedVocabularyManager
            
            vocabulary_manager = ImprovedVocabularyManager()
            
            # 获取现有词汇
            existing_vocabulary = vocabulary_manager._load_existing_vocabulary()
            
            # 使用改进的去重逻辑
            deduplicated_vocabulary = vocabulary_manager._deduplicate_vocabulary(
                vocabulary_list, existing_vocabulary
            )
            
            logger.info(f"改进词汇去重: {len(vocabulary_list)} -> {len(deduplicated_vocabulary)}")
            return deduplicated_vocabulary
            
        except ImportError:
            # 如果改进的词汇管理器不可用，使用原有逻辑
            logger.warning("使用原有词汇去重逻辑")
            return self._deduplicate_vocabulary_legacy(vocabulary_list)
        except Exception as e:
            logger.error(f"改进词汇去重失败: {e}")
            return self._deduplicate_vocabulary_legacy(vocabulary_list)
    
    def _deduplicate_vocabulary_legacy(self, vocabulary_list: List[Dict]) -> List[Dict]:
        """原有的词汇去重逻辑（作为备用）"""
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
    
    def save_update_package(self, update_package: Dict, output_path: str):
        """保存更新包"""
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(update_package, f, ensure_ascii=False, indent=2)
            logger.info(f"更新包已保存到: {output_path}")
        except Exception as e:
            logger.error(f"保存更新包失败: {e}")
            raise e
    
    def inject_to_miniprogram(self, papers_data: List[Dict], vocabulary_data: List[Dict]):
        """注入数据到小程序 - 改进版本，使用安全的词汇管理"""
        try:
            # 注入论文数据
            papers_success = self.injector.inject_papers_data(papers_data)
            
            # 使用改进的词汇管理器处理词汇数据
            vocabulary_success = self._inject_vocabulary_safely(vocabulary_data)
            
            if papers_success and vocabulary_success:
                logger.info("数据注入到小程序成功")
                return True
            else:
                logger.error("数据注入到小程序失败")
                return False
                
        except Exception as e:
            logger.error(f"注入数据到小程序失败: {e}")
            return False
    
    def _inject_vocabulary_safely(self, vocabulary_data: List[Dict]) -> bool:
        """安全地注入词汇数据"""
        try:
            # 使用改进的词汇管理器
            from ..improved_vocabulary_manager import ImprovedVocabularyManager
            
            vocabulary_file = os.path.join(
                self.config.get('miniprogram', {}).get('data_path', '../utils/'),
                'vocabulary_update.js'
            )
            
            vocabulary_manager = ImprovedVocabularyManager(vocabulary_file)
            
            # 安全地添加新词汇
            result = vocabulary_manager.add_new_vocabulary_safely(vocabulary_data)
            
            if result['success']:
                logger.info(f"词汇注入成功: 添加 {result['added_count']} 个，跳过 {result['skipped_count']} 个")
                return True
            else:
                logger.error(f"词汇注入失败: {result['message']}")
                return False
                
        except ImportError:
            # 如果改进的词汇管理器不可用，使用原有逻辑
            logger.warning("使用原有词汇注入逻辑")
            return self._inject_vocabulary_legacy(vocabulary_data)
        except Exception as e:
            logger.error(f"安全词汇注入失败: {e}")
            return self._inject_vocabulary_legacy(vocabulary_data)
    
    def _inject_vocabulary_legacy(self, vocabulary_data: List[Dict]) -> bool:
        """原有的词汇注入逻辑（作为备用）"""
        try:
            vocabulary_file = os.path.join(
                self.config.get('miniprogram', {}).get('data_path', '../utils/'),
                'vocabulary_update.js'
            )
            return self.injector.create_vocabulary_update_file(vocabulary_data, vocabulary_file)
        except Exception as e:
            logger.error(f"原有词汇注入失败: {e}")
            return False
    
    def validate_update_package(self, update_package: Dict) -> bool:
        """验证更新包"""
        try:
            # 检查必需字段
            required_fields = ['version', 'papers', 'vocabulary', 'timestamp', 'checksum']
            for field in required_fields:
                if field not in update_package:
                    logger.error(f"更新包缺少必需字段: {field}")
                    return False
            
            # 验证校验和 - 先保存原始校验和，然后重新计算
            original_checksum = update_package['checksum']
            
            # 临时移除校验和字段，重新计算
            temp_package = update_package.copy()
            temp_package.pop('checksum', None)
            content = json.dumps(temp_package, sort_keys=True, ensure_ascii=False)
            calculated_checksum = hashlib.md5(content.encode('utf-8')).hexdigest()
            
            if original_checksum != calculated_checksum:
                logger.error(f"更新包校验和验证失败: 原始={original_checksum}, 计算={calculated_checksum}")
                return False
            
            # 验证论文数据格式
            for paper in update_package['papers']:
                if not self._validate_paper_data(paper):
                    return False
            
            # 验证词汇数据格式
            for word in update_package['vocabulary']:
                if not self._validate_vocabulary_data(word):
                    return False
            
            logger.info("更新包验证通过")
            return True
            
        except Exception as e:
            logger.error(f"验证更新包失败: {e}")
            return False
    
    def _validate_paper_data(self, paper: Dict) -> bool:
        """验证论文数据格式"""
        required_fields = ['id', 'title', 'authors', 'year', 'journal', 'url', 'category']
        for field in required_fields:
            if field not in paper:
                logger.error(f"论文数据缺少字段: {field}")
                return False
        
        # 检查必需的分析字段
        analysis_fields = ['background', 'keyConcepts', 'highlights']
        for field in analysis_fields:
            if field not in paper or not paper[field]:
                logger.error(f"论文数据缺少分析字段: {field}")
                return False
        
        return True
    
    def _validate_vocabulary_data(self, word: Dict) -> bool:
        """验证词汇数据格式"""
        required_fields = ['word', 'meaning', 'category', 'paperTitle']
        for field in required_fields:
            if field not in word or not word[field]:
                logger.error(f"词汇数据缺少字段: {field}")
                return False
        
        return True