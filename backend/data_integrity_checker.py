#!/usr/bin/env python3
"""
数据完整性检查器
用于检查论文数据的完整性，确保所有论文都包含必需的分析字段
"""

import json
import os
import re
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

class DataIntegrityChecker:
    """数据完整性检查器"""
    
    def __init__(self, papers_data_file: str):
        self.papers_data_file = papers_data_file
        self.required_fields = ['id', 'title', 'authors', 'year', 'journal', 'abstract', 'url']
        self.analysis_fields = ['background', 'keyConcepts', 'highlights']
    
    def check_data_integrity(self) -> Dict:
        """检查数据完整性"""
        try:
            if not os.path.exists(self.papers_data_file):
                return {
                    'status': 'error',
                    'message': '论文数据文件不存在',
                    'papers': [],
                    'issues': []
                }
            
            # 解析论文数据
            papers = self._parse_papers_data()
            if papers is None:
                return {
                    'status': 'error',
                    'message': '解析论文数据失败',
                    'papers': [],
                    'issues': []
                }
            
            # 检查每篇论文的完整性
            issues = []
            for paper in papers:
                paper_issues = self._check_paper_integrity(paper)
                if paper_issues:
                    issues.extend(paper_issues)
            
            # 生成报告
            report = {
                'status': 'success' if not issues else 'warning',
                'message': f'检查完成，发现 {len(issues)} 个问题',
                'papers': papers,
                'issues': issues,
                'summary': self._generate_summary(papers, issues)
            }
            
            return report
            
        except Exception as e:
            logger.error(f"数据完整性检查失败: {e}")
            return {
                'status': 'error',
                'message': f'检查失败: {e}',
                'papers': [],
                'issues': []
            }
    
    def _parse_papers_data(self) -> Optional[List[Dict]]:
        """解析论文数据"""
        try:
            with open(self.papers_data_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            papers = []
            
            # 使用正则表达式匹配每篇论文
            paper_pattern = r'{\s*id:\s*(\d+),.*?title:\s*[\'"]([^\'"]+)[\'"],.*?authors:\s*[\'"]([^\'"]+)[\'"],.*?year:\s*(\d+),.*?journal:\s*[\'"]([^\'"]+)[\'"],.*?abstract:\s*[\'"]([^\'"]+)[\'"],.*?url:\s*[\'"]([^\'"]+)[\'"]'
            
            matches = re.findall(paper_pattern, content, re.DOTALL)
            
            for match in matches:
                paper = {
                    'id': int(match[0]),
                    'title': match[1],
                    'authors': match[2],
                    'year': int(match[3]),
                    'journal': match[4],
                    'abstract': match[5],
                    'url': match[6]
                }
                
                # 检查分析字段
                paper_id = int(match[0])
                background = self._extract_field(content, paper_id, 'background')
                key_concepts = self._extract_field(content, paper_id, 'keyConcepts')
                highlights = self._extract_field(content, paper_id, 'highlights')
                
                if background:
                    paper['background'] = background
                if key_concepts:
                    paper['keyConcepts'] = key_concepts
                if highlights:
                    paper['highlights'] = highlights
                
                papers.append(paper)
            
            return papers
            
        except Exception as e:
            logger.error(f"解析论文数据失败: {e}")
            return None
    
    def _extract_field(self, content: str, paper_id: int, field_name: str) -> Optional[str]:
        """提取特定字段的内容"""
        try:
            pattern = rf'id:\s*{paper_id}.*?{field_name}:\s*`([^`]+)`'
            match = re.search(pattern, content, re.DOTALL)
            return match.group(1) if match else None
        except:
            return None
    
    def _check_paper_integrity(self, paper: Dict) -> List[Dict]:
        """检查单篇论文的完整性"""
        issues = []
        
        # 检查必需字段
        for field in self.required_fields:
            if field not in paper or not paper[field]:
                issues.append({
                    'type': 'missing_required_field',
                    'paper_id': paper.get('id', 'Unknown'),
                    'paper_title': paper.get('title', 'Unknown'),
                    'field': field,
                    'severity': 'error'
                })
        
        # 检查分析字段
        missing_analysis_fields = []
        for field in self.analysis_fields:
            if field not in paper or not paper[field]:
                missing_analysis_fields.append(field)
        
        if missing_analysis_fields:
            issues.append({
                'type': 'missing_analysis_fields',
                'paper_id': paper.get('id', 'Unknown'),
                'paper_title': paper.get('title', 'Unknown'),
                'fields': missing_analysis_fields,
                'severity': 'warning'
            })
        
        # 检查字段长度
        for field in self.analysis_fields:
            if field in paper and paper[field]:
                if len(paper[field]) < 50:
                    issues.append({
                        'type': 'field_too_short',
                        'paper_id': paper.get('id', 'Unknown'),
                        'paper_title': paper.get('title', 'Unknown'),
                        'field': field,
                        'length': len(paper[field]),
                        'severity': 'warning'
                    })
        
        return issues
    
    def _generate_summary(self, papers: List[Dict], issues: List[Dict]) -> Dict:
        """生成检查摘要"""
        total_papers = len(papers)
        papers_with_issues = len(set(issue['paper_id'] for issue in issues))
        
        error_count = len([issue for issue in issues if issue['severity'] == 'error'])
        warning_count = len([issue for issue in issues if issue['severity'] == 'warning'])
        
        missing_analysis_count = len([issue for issue in issues if issue['type'] == 'missing_analysis_fields'])
        
        return {
            'total_papers': total_papers,
            'papers_with_issues': papers_with_issues,
            'error_count': error_count,
            'warning_count': warning_count,
            'missing_analysis_count': missing_analysis_count,
            'integrity_score': max(0, 100 - (error_count * 20 + warning_count * 5))
        }
    
    def generate_report(self, output_file: str = None) -> str:
        """生成详细的检查报告"""
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"data/integrity_report_{timestamp}.json"
        
        report = self.check_data_integrity()
        
        try:
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            
            logger.info(f"完整性报告已生成: {output_file}")
            return output_file
            
        except Exception as e:
            logger.error(f"生成报告失败: {e}")
            return None
    
    def print_summary(self):
        """打印检查摘要"""
        report = self.check_data_integrity()
        
        if report['status'] == 'error':
            print(f"❌ 检查失败: {report['message']}")
            return
        
        summary = report['summary']
        
        print("=" * 60)
        print("📊 数据完整性检查报告")
        print("=" * 60)
        print(f"📄 总论文数: {summary['total_papers']}")
        print(f"⚠️  有问题的论文数: {summary['papers_with_issues']}")
        print(f"❌ 错误数量: {summary['error_count']}")
        print(f"⚠️  警告数量: {summary['warning_count']}")
        print(f"📝 缺少分析字段的论文数: {summary['missing_analysis_count']}")
        print(f"🎯 完整性评分: {summary['integrity_score']}/100")
        print("=" * 60)
        
        if report['issues']:
            print("\n🔍 详细问题列表:")
            for i, issue in enumerate(report['issues'], 1):
                severity_icon = "❌" if issue['severity'] == 'error' else "⚠️"
                print(f"{i}. {severity_icon} 论文 {issue['paper_id']}: {issue['paper_title']}")
                
                if issue['type'] == 'missing_required_field':
                    print(f"   缺少必需字段: {issue['field']}")
                elif issue['type'] == 'missing_analysis_fields':
                    print(f"   缺少分析字段: {', '.join(issue['fields'])}")
                elif issue['type'] == 'field_too_short':
                    print(f"   字段 {issue['field']} 内容过短: {issue['length']} 字符")
                
                print()
        else:
            print("\n✅ 所有论文数据完整，没有发现问题！")

# 使用示例
if __name__ == "__main__":
    checker = DataIntegrityChecker("../utils/papersData.js")
    checker.print_summary()
    
    # 生成详细报告
    report_file = checker.generate_report()
    if report_file:
        print(f"\n📋 详细报告已保存到: {report_file}")

