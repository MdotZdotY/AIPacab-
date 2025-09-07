#!/usr/bin/env python3
"""
改进的词汇管理器
确保新词汇追加的安全性，防止影响原有词汇
"""

import json
import os
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

class ImprovedVocabularyManager:
    """改进的词汇管理器"""
    
    def __init__(self, vocabulary_file: str = "../utils/vocabulary_update.json"):
        self.vocabulary_file = vocabulary_file
        self.backup_dir = "data/vocabulary_backups"
        os.makedirs(self.backup_dir, exist_ok=True)
    
    def add_new_vocabulary_safely(self, new_vocabulary: List[Dict], existing_vocabulary: List[Dict] = None) -> Dict:
        """安全地添加新词汇，确保不影响原有词汇"""
        try:
            # 1. 创建备份
            if not self._create_vocabulary_backup():
                logger.warning("创建词汇备份失败，但继续执行")
            
            # 2. 获取现有词汇（如果未提供）
            if existing_vocabulary is None:
                existing_vocabulary = self._load_existing_vocabulary()
            
            # 3. 验证新词汇数据
            validated_vocabulary = self._validate_vocabulary_data(new_vocabulary)
            if not validated_vocabulary:
                return {
                    'success': False,
                    'message': '新词汇数据验证失败',
                    'added_count': 0,
                    'skipped_count': len(new_vocabulary)
                }
            
            # 4. 去重处理
            deduplicated_vocabulary = self._deduplicate_vocabulary(validated_vocabulary, existing_vocabulary)
            
            # 5. 分配ID
            vocabulary_with_ids = self._assign_vocabulary_ids(deduplicated_vocabulary, existing_vocabulary)
            
            # 6. 合并词汇
            merged_vocabulary = self._merge_vocabulary_safely(existing_vocabulary, vocabulary_with_ids)
            
            # 7. 验证合并结果
            if not self._validate_merged_vocabulary(merged_vocabulary, existing_vocabulary):
                logger.error("合并后词汇验证失败")
                return {
                    'success': False,
                    'message': '合并后词汇验证失败',
                    'added_count': 0,
                    'skipped_count': len(new_vocabulary)
                }
            
            # 8. 保存结果
            if self._save_vocabulary_update(vocabulary_with_ids):
                return {
                    'success': True,
                    'message': '词汇添加成功',
                    'added_count': len(vocabulary_with_ids),
                    'skipped_count': len(new_vocabulary) - len(vocabulary_with_ids),
                    'total_count': len(merged_vocabulary)
                }
            else:
                return {
                    'success': False,
                    'message': '保存词汇更新失败',
                    'added_count': 0,
                    'skipped_count': len(new_vocabulary)
                }
                
        except Exception as e:
            logger.error(f"安全添加词汇失败: {e}")
            return {
                'success': False,
                'message': f'添加失败: {e}',
                'added_count': 0,
                'skipped_count': len(new_vocabulary)
            }
    
    def _create_vocabulary_backup(self) -> bool:
        """创建词汇备份"""
        try:
            if not os.path.exists(self.vocabulary_file):
                return True  # 文件不存在，无需备份
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(self.backup_dir, f"vocabulary_backup_{timestamp}.json")
            
            with open(self.vocabulary_file, 'r', encoding='utf-8') as src:
                with open(backup_file, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            
            logger.info(f"词汇备份已创建: {backup_file}")
            return True
            
        except Exception as e:
            logger.error(f"创建词汇备份失败: {e}")
            return False
    
    def _load_existing_vocabulary(self) -> List[Dict]:
        """加载现有词汇"""
        try:
            if not os.path.exists(self.vocabulary_file):
                return []
            
            with open(self.vocabulary_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            return data.get('vocabulary', [])
            
        except Exception as e:
            logger.error(f"加载现有词汇失败: {e}")
            return []
    
    def _validate_vocabulary_data(self, vocabulary: List[Dict]) -> List[Dict]:
        """验证词汇数据"""
        try:
            validated_vocabulary = []
            required_fields = ['word', 'chineseMeaning', 'englishMeaning', 'partOfSpeech', 'pronunciation', 'context', 'translation']
            
            for word_data in vocabulary:
                # 检查必需字段
                if not all(field in word_data and word_data[field] for field in required_fields):
                    logger.warning(f"词汇数据不完整，跳过: {word_data.get('word', 'Unknown')}")
                    continue
                
                # 检查词汇长度
                if len(word_data['word']) < 2 or len(word_data['word']) > 50:
                    logger.warning(f"词汇长度异常，跳过: {word_data['word']}")
                    continue
                
                # 检查中英文含义
                if len(word_data['chineseMeaning']) < 2 or len(word_data['englishMeaning']) < 5:
                    logger.warning(f"词汇含义过短，跳过: {word_data['word']}")
                    continue
                
                validated_vocabulary.append(word_data)
            
            logger.info(f"词汇验证: {len(vocabulary)} -> {len(validated_vocabulary)}")
            return validated_vocabulary
            
        except Exception as e:
            logger.error(f"验证词汇数据失败: {e}")
            return []
    
    def _deduplicate_vocabulary(self, new_vocabulary: List[Dict], existing_vocabulary: List[Dict]) -> List[Dict]:
        """词汇去重"""
        try:
            # 创建现有词汇的集合（不区分大小写）
            existing_word_set = set()
            for word_data in existing_vocabulary:
                if 'word' in word_data:
                    existing_word_set.add(word_data['word'].lower())
            
            # 过滤重复词汇
            unique_vocabulary = []
            for word_data in new_vocabulary:
                word_key = word_data['word'].lower()
                if word_key not in existing_word_set:
                    unique_vocabulary.append(word_data)
                    existing_word_set.add(word_key)  # 防止新词汇内部重复
                else:
                    logger.debug(f"跳过重复词汇: {word_data['word']}")
            
            logger.info(f"词汇去重: {len(new_vocabulary)} -> {len(unique_vocabulary)}")
            return unique_vocabulary
            
        except Exception as e:
            logger.error(f"词汇去重失败: {e}")
            return []
    
    def _assign_vocabulary_ids(self, vocabulary: List[Dict], existing_vocabulary: List[Dict]) -> List[Dict]:
        """为词汇分配唯一ID"""
        try:
            # 获取最大ID
            max_id = 0
            for word_data in existing_vocabulary:
                if 'id' in word_data and isinstance(word_data['id'], int):
                    max_id = max(max_id, word_data['id'])
            
            # 为新词汇分配ID
            vocabulary_with_ids = []
            for i, word_data in enumerate(vocabulary):
                new_word_data = word_data.copy()
                new_word_data['id'] = max_id + i + 1
                new_word_data['studyCount'] = 0
                new_word_data['correctCount'] = 0
                new_word_data['lastStudyTime'] = None
                new_word_data['status'] = 'learning'
                new_word_data['weeklyStudyCount'] = 0
                vocabulary_with_ids.append(new_word_data)
            
            logger.info(f"为 {len(vocabulary_with_ids)} 个词汇分配了ID")
            return vocabulary_with_ids
            
        except Exception as e:
            logger.error(f"分配词汇ID失败: {e}")
            return []
    
    def _merge_vocabulary_safely(self, existing_vocabulary: List[Dict], new_vocabulary: List[Dict]) -> List[Dict]:
        """安全地合并词汇"""
        try:
            # 确保原有词汇不被修改
            merged_vocabulary = existing_vocabulary.copy()
            
            # 添加新词汇
            merged_vocabulary.extend(new_vocabulary)
            
            # 验证合并结果
            if len(merged_vocabulary) != len(existing_vocabulary) + len(new_vocabulary):
                logger.error("词汇合并数量不匹配")
                return existing_vocabulary  # 返回原有词汇
            
            logger.info(f"词汇合并成功: {len(existing_vocabulary)} + {len(new_vocabulary)} = {len(merged_vocabulary)}")
            return merged_vocabulary
            
        except Exception as e:
            logger.error(f"合并词汇失败: {e}")
            return existing_vocabulary  # 返回原有词汇
    
    def _validate_merged_vocabulary(self, merged_vocabulary: List[Dict], original_vocabulary: List[Dict]) -> bool:
        """验证合并后的词汇"""
        try:
            # 检查原有词汇是否被保留
            original_ids = {word.get('id') for word in original_vocabulary if 'id' in word}
            merged_ids = {word.get('id') for word in merged_vocabulary if 'id' in word}
            
            if not original_ids.issubset(merged_ids):
                logger.error("原有词汇ID丢失")
                return False
            
            # 检查ID唯一性
            all_ids = [word.get('id') for word in merged_vocabulary if 'id' in word]
            if len(all_ids) != len(set(all_ids)):
                logger.error("词汇ID重复")
                return False
            
            # 检查词汇唯一性
            all_words = [word.get('word', '').lower() for word in merged_vocabulary if 'word' in word]
            if len(all_words) != len(set(all_words)):
                logger.error("词汇重复")
                return False
            
            logger.info("合并后词汇验证通过")
            return True
            
        except Exception as e:
            logger.error(f"验证合并词汇失败: {e}")
            return False
    
    def _save_vocabulary_update(self, new_vocabulary: List[Dict]) -> bool:
        """保存词汇更新"""
        try:
            update_data = {
                "version": datetime.now().strftime("%Y%m%d_%H%M%S"),
                "vocabulary": new_vocabulary,
                "timestamp": datetime.now().isoformat(),
                "count": len(new_vocabulary)
            }
            
            with open(self.vocabulary_file, 'w', encoding='utf-8') as f:
                json.dump(update_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"词汇更新已保存: {self.vocabulary_file}")
            return True
            
        except Exception as e:
            logger.error(f"保存词汇更新失败: {e}")
            return False
    
    def get_vocabulary_statistics(self) -> Dict:
        """获取词汇统计信息"""
        try:
            existing_vocabulary = self._load_existing_vocabulary()
            
            return {
                'total_count': len(existing_vocabulary),
                'by_status': self._count_by_status(existing_vocabulary),
                'by_difficulty': self._count_by_difficulty(existing_vocabulary),
                'by_paper': self._count_by_paper(existing_vocabulary)
            }
            
        except Exception as e:
            logger.error(f"获取词汇统计失败: {e}")
            return {}
    
    def _count_by_status(self, vocabulary: List[Dict]) -> Dict:
        """按状态统计词汇"""
        status_count = {}
        for word in vocabulary:
            status = word.get('status', 'unknown')
            status_count[status] = status_count.get(status, 0) + 1
        return status_count
    
    def _count_by_difficulty(self, vocabulary: List[Dict]) -> Dict:
        """按难度统计词汇"""
        difficulty_count = {}
        for word in vocabulary:
            difficulty = word.get('difficulty', 'unknown')
            difficulty_count[difficulty] = difficulty_count.get(difficulty, 0) + 1
        return difficulty_count
    
    def _count_by_paper(self, vocabulary: List[Dict]) -> Dict:
        """按论文统计词汇"""
        paper_count = {}
        for word in vocabulary:
            paper = word.get('paperTitle', 'unknown')
            paper_count[paper] = paper_count.get(paper, 0) + 1
        return paper_count

# 使用示例
if __name__ == "__main__":
    manager = ImprovedVocabularyManager()
    
    # 示例新词汇
    new_vocabulary = [
        {
            "word": "Transformer",
            "chineseMeaning": "变换器",
            "englishMeaning": "A neural network architecture based on attention mechanisms",
            "partOfSpeech": "noun",
            "pronunciation": "/trænsˈfɔːrmər/",
            "context": "The Transformer architecture has revolutionized natural language processing.",
            "translation": "Transformer架构彻底改变了自然语言处理领域。",
            "paperTitle": "Test Paper"
        }
    ]
    
    # 安全添加词汇
    result = manager.add_new_vocabulary_safely(new_vocabulary)
    print(f"添加结果: {result}")
    
    # 获取统计信息
    stats = manager.get_vocabulary_statistics()
    print(f"统计信息: {stats}")

