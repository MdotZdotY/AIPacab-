#!/usr/bin/env python3
"""
词汇完整性检查器
检查词汇数据的完整性和一致性
"""

import json
import os
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime

logger = logging.getLogger(__name__)

class VocabularyIntegrityChecker:
    """词汇完整性检查器"""
    
    def __init__(self, vocabulary_file: str = "../utils/vocabulary_update.json"):
        self.vocabulary_file = vocabulary_file
        self.required_fields = ['word', 'chineseMeaning', 'englishMeaning', 'partOfSpeech', 'pronunciation', 'context', 'translation']
        self.optional_fields = ['id', 'studyCount', 'correctCount', 'lastStudyTime', 'status', 'weeklyStudyCount', 'difficulty', 'paperTitle']
    
    def check_vocabulary_integrity(self) -> Dict:
        """检查词汇完整性"""
        try:
            # 加载词汇数据
            vocabulary_data = self._load_vocabulary_data()
            if vocabulary_data is None:
                return {
                    'status': 'error',
                    'message': '无法加载词汇数据',
                    'vocabulary': [],
                    'issues': []
                }
            
            # 检查词汇完整性
            issues = []
            for i, word_data in enumerate(vocabulary_data):
                word_issues = self._check_word_integrity(word_data, i)
                if word_issues:
                    issues.extend(word_issues)
            
            # 检查全局问题
            global_issues = self._check_global_integrity(vocabulary_data)
            issues.extend(global_issues)
            
            # 生成报告
            report = {
                'status': 'success' if not issues else 'warning',
                'message': f'检查完成，发现 {len(issues)} 个问题',
                'vocabulary': vocabulary_data,
                'issues': issues,
                'summary': self._generate_summary(vocabulary_data, issues)
            }
            
            return report
            
        except Exception as e:
            logger.error(f"词汇完整性检查失败: {e}")
            return {
                'status': 'error',
                'message': f'检查失败: {e}',
                'vocabulary': [],
                'issues': []
            }
    
    def _load_vocabulary_data(self) -> Optional[List[Dict]]:
        """加载词汇数据"""
        try:
            if not os.path.exists(self.vocabulary_file):
                logger.warning("词汇文件不存在")
                return []
            
            with open(self.vocabulary_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            return data.get('vocabulary', [])
            
        except Exception as e:
            logger.error(f"加载词汇数据失败: {e}")
            return None
    
    def _check_word_integrity(self, word_data: Dict, index: int) -> List[Dict]:
        """检查单个词汇的完整性"""
        issues = []
        
        # 检查必需字段
        for field in self.required_fields:
            if field not in word_data or not word_data[field]:
                issues.append({
                    'type': 'missing_required_field',
                    'index': index,
                    'word': word_data.get('word', 'Unknown'),
                    'field': field,
                    'severity': 'error'
                })
        
        # 检查字段长度
        if 'word' in word_data:
            word = word_data['word']
            if len(word) < 2:
                issues.append({
                    'type': 'word_too_short',
                    'index': index,
                    'word': word,
                    'length': len(word),
                    'severity': 'error'
                })
            elif len(word) > 50:
                issues.append({
                    'type': 'word_too_long',
                    'index': index,
                    'word': word,
                    'length': len(word),
                    'severity': 'warning'
                })
        
        # 检查中文含义
        if 'chineseMeaning' in word_data:
            meaning = word_data['chineseMeaning']
            if len(meaning) < 2:
                issues.append({
                    'type': 'chinese_meaning_too_short',
                    'index': index,
                    'word': word_data.get('word', 'Unknown'),
                    'length': len(meaning),
                    'severity': 'warning'
                })
        
        # 检查英文含义
        if 'englishMeaning' in word_data:
            meaning = word_data['englishMeaning']
            if len(meaning) < 5:
                issues.append({
                    'type': 'english_meaning_too_short',
                    'index': index,
                    'word': word_data.get('word', 'Unknown'),
                    'length': len(meaning),
                    'severity': 'warning'
                })
        
        # 检查ID
        if 'id' in word_data:
            word_id = word_data['id']
            if not isinstance(word_id, int) or word_id <= 0:
                issues.append({
                    'type': 'invalid_id',
                    'index': index,
                    'word': word_data.get('word', 'Unknown'),
                    'id': word_id,
                    'severity': 'error'
                })
        
        # 检查学习状态
        if 'status' in word_data:
            status = word_data['status']
            valid_statuses = ['learning', 'mastered', 'reviewing']
            if status not in valid_statuses:
                issues.append({
                    'type': 'invalid_status',
                    'index': index,
                    'word': word_data.get('word', 'Unknown'),
                    'status': status,
                    'severity': 'warning'
                })
        
        return issues
    
    def _check_global_integrity(self, vocabulary_data: List[Dict]) -> List[Dict]:
        """检查全局完整性问题"""
        issues = []
        
        # 检查ID唯一性
        ids = [word.get('id') for word in vocabulary_data if 'id' in word]
        if len(ids) != len(set(ids)):
            duplicate_ids = [id for id in ids if ids.count(id) > 1]
            issues.append({
                'type': 'duplicate_ids',
                'duplicate_ids': list(set(duplicate_ids)),
                'severity': 'error'
            })
        
        # 检查词汇唯一性
        words = [word.get('word', '').lower() for word in vocabulary_data if 'word' in word]
        if len(words) != len(set(words)):
            duplicate_words = [word for word in words if words.count(word) > 1]
            issues.append({
                'type': 'duplicate_words',
                'duplicate_words': list(set(duplicate_words)),
                'severity': 'error'
            })
        
        # 检查ID连续性
        if ids:
            ids.sort()
            expected_ids = list(range(min(ids), max(ids) + 1))
            missing_ids = set(expected_ids) - set(ids)
            if missing_ids:
                issues.append({
                    'type': 'missing_ids',
                    'missing_ids': sorted(list(missing_ids)),
                    'severity': 'warning'
                })
        
        return issues
    
    def _generate_summary(self, vocabulary_data: List[Dict], issues: List[Dict]) -> Dict:
        """生成检查摘要"""
        total_words = len(vocabulary_data)
        words_with_issues = len(set(issue.get('index', -1) for issue in issues if 'index' in issue))
        
        error_count = len([issue for issue in issues if issue['severity'] == 'error'])
        warning_count = len([issue for issue in issues if issue['severity'] == 'warning'])
        
        # 按类型统计问题
        issue_types = {}
        for issue in issues:
            issue_type = issue['type']
            issue_types[issue_type] = issue_types.get(issue_type, 0) + 1
        
        # 按状态统计词汇
        status_count = {}
        for word in vocabulary_data:
            status = word.get('status', 'unknown')
            status_count[status] = status_count.get(status, 0) + 1
        
        # 按难度统计词汇
        difficulty_count = {}
        for word in vocabulary_data:
            difficulty = word.get('difficulty', 'unknown')
            difficulty_count[difficulty] = difficulty_count.get(difficulty, 0) + 1
        
        return {
            'total_words': total_words,
            'words_with_issues': words_with_issues,
            'error_count': error_count,
            'warning_count': warning_count,
            'issue_types': issue_types,
            'status_count': status_count,
            'difficulty_count': difficulty_count,
            'integrity_score': max(0, 100 - (error_count * 20 + warning_count * 5))
        }
    
    def generate_report(self, output_file: str = None) -> str:
        """生成详细的检查报告"""
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"data/vocabulary_integrity_report_{timestamp}.json"
        
        report = self.check_vocabulary_integrity()
        
        try:
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            
            logger.info(f"词汇完整性报告已生成: {output_file}")
            return output_file
            
        except Exception as e:
            logger.error(f"生成报告失败: {e}")
            return None
    
    def print_summary(self):
        """打印检查摘要"""
        report = self.check_vocabulary_integrity()
        
        if report['status'] == 'error':
            print(f"❌ 检查失败: {report['message']}")
            return
        
        summary = report['summary']
        
        print("=" * 60)
        print("📚 词汇完整性检查报告")
        print("=" * 60)
        print(f"📖 总词汇数: {summary['total_words']}")
        print(f"⚠️  有问题的词汇数: {summary['words_with_issues']}")
        print(f"❌ 错误数量: {summary['error_count']}")
        print(f"⚠️  警告数量: {summary['warning_count']}")
        print(f"🎯 完整性评分: {summary['integrity_score']}/100")
        print("=" * 60)
        
        # 显示状态统计
        if summary['status_count']:
            print("\n📊 词汇状态统计:")
            for status, count in summary['status_count'].items():
                print(f"   {status}: {count}")
        
        # 显示难度统计
        if summary['difficulty_count']:
            print("\n📊 词汇难度统计:")
            for difficulty, count in summary['difficulty_count'].items():
                print(f"   {difficulty}: {count}")
        
        # 显示问题类型统计
        if summary['issue_types']:
            print("\n🔍 问题类型统计:")
            for issue_type, count in summary['issue_types'].items():
                print(f"   {issue_type}: {count}")
        
        if report['issues']:
            print("\n🔍 详细问题列表:")
            for i, issue in enumerate(report['issues'], 1):
                severity_icon = "❌" if issue['severity'] == 'error' else "⚠️"
                print(f"{i}. {severity_icon} {issue['type']}")
                
                if 'word' in issue:
                    print(f"   词汇: {issue['word']}")
                if 'index' in issue:
                    print(f"   位置: {issue['index']}")
                if 'field' in issue:
                    print(f"   字段: {issue['field']}")
                if 'message' in issue:
                    print(f"   详情: {issue['message']}")
                
                print()
        else:
            print("\n✅ 所有词汇数据完整，没有发现问题！")

# 使用示例
if __name__ == "__main__":
    checker = VocabularyIntegrityChecker()
    checker.print_summary()
    
    # 生成详细报告
    report_file = checker.generate_report()
    if report_file:
        print(f"\n📋 详细报告已保存到: {report_file}")

