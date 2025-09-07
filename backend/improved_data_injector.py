#!/usr/bin/env python3
"""
改进的数据注入器
解决现有数据注入逻辑的问题，确保现有论文数据不被覆盖
"""

import json
import os
import re
import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class ImprovedDataInjector:
    """改进的数据注入器"""
    
    def __init__(self, papers_data_file: str):
        self.papers_data_file = papers_data_file
        self.backup_dir = "data/backups"
        os.makedirs(self.backup_dir, exist_ok=True)
    
    def inject_papers_data_safely(self, new_papers: List[Dict]) -> bool:
        """安全地注入新论文数据，确保现有数据不被覆盖"""
        try:
            # 1. 创建备份
            if not self._create_backup():
                logger.error("创建备份失败")
                return False
            
            # 2. 读取现有数据
            existing_papers = self._parse_existing_papers()
            if existing_papers is None:
                logger.error("解析现有论文数据失败")
                return False
            
            # 3. 检查新论文是否已存在
            new_papers_filtered = self._filter_existing_papers(existing_papers, new_papers)
            if not new_papers_filtered:
                logger.info("没有新论文需要添加")
                return True
            
            # 4. 合并数据
            merged_papers = existing_papers + new_papers_filtered
            
            # 5. 验证数据完整性
            if not self._validate_papers_data(merged_papers):
                logger.error("数据验证失败")
                return False
            
            # 6. 生成新的papersData.js文件
            if not self._generate_papers_data_file(merged_papers):
                logger.error("生成论文数据文件失败")
                return False
            
            logger.info(f"成功注入 {len(new_papers_filtered)} 篇新论文")
            return True
            
        except Exception as e:
            logger.error(f"安全注入论文数据失败: {e}")
            # 尝试恢复备份
            self._restore_backup()
            return False
    
    def _create_backup(self) -> bool:
        """创建当前文件的备份"""
        try:
            if not os.path.exists(self.papers_data_file):
                return True  # 文件不存在，无需备份
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(self.backup_dir, f"papersData_backup_{timestamp}.js")
            
            with open(self.papers_data_file, 'r', encoding='utf-8') as src:
                with open(backup_file, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            
            logger.info(f"备份已创建: {backup_file}")
            return True
            
        except Exception as e:
            logger.error(f"创建备份失败: {e}")
            return False
    
    def _parse_existing_papers(self) -> Optional[List[Dict]]:
        """解析现有论文数据"""
        try:
            if not os.path.exists(self.papers_data_file):
                return []
            
            with open(self.papers_data_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 使用正则表达式解析论文数据
            papers = []
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
                
                # 检查是否有分析字段
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
            
            logger.info(f"解析到 {len(papers)} 篇现有论文")
            return papers
            
        except Exception as e:
            logger.error(f"解析现有论文数据失败: {e}")
            return None
    
    def _extract_field(self, content: str, paper_id: int, field_name: str) -> Optional[str]:
        """提取特定字段的内容"""
        try:
            # 构建匹配模式
            pattern = rf'id:\s*{paper_id}.*?{field_name}:\s*`([^`]+)`'
            match = re.search(pattern, content, re.DOTALL)
            return match.group(1) if match else None
        except:
            return None
    
    def _filter_existing_papers(self, existing_papers: List[Dict], new_papers: List[Dict]) -> List[Dict]:
        """过滤已存在的论文"""
        existing_titles = {paper['title'] for paper in existing_papers}
        existing_urls = {paper['url'] for paper in existing_papers}
        
        filtered_papers = []
        for paper in new_papers:
            if paper['title'] not in existing_titles and paper['url'] not in existing_urls:
                filtered_papers.append(paper)
            else:
                logger.warning(f"论文已存在，跳过: {paper['title']}")
        
        return filtered_papers
    
    def _validate_papers_data(self, papers: List[Dict]) -> bool:
        """验证论文数据的完整性"""
        try:
            for paper in papers:
                # 检查必需字段
                required_fields = ['id', 'title', 'authors', 'year', 'journal', 'abstract', 'url']
                for field in required_fields:
                    if field not in paper or not paper[field]:
                        logger.error(f"论文 {paper.get('title', 'Unknown')} 缺少必需字段: {field}")
                        return False
                
                # 检查分析字段（如果存在）
                analysis_fields = ['background', 'keyConcepts', 'highlights']
                for field in analysis_fields:
                    if field in paper and not paper[field]:
                        logger.warning(f"论文 {paper['title']} 的 {field} 字段为空")
            
            logger.info(f"数据验证通过，共 {len(papers)} 篇论文")
            return True
            
        except Exception as e:
            logger.error(f"数据验证失败: {e}")
            return False
    
    def _generate_papers_data_file(self, papers: List[Dict]) -> bool:
        """生成新的papersData.js文件"""
        try:
            content = self._generate_file_content(papers)
            
            with open(self.papers_data_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"论文数据文件已更新: {self.papers_data_file}")
            return True
            
        except Exception as e:
            logger.error(f"生成论文数据文件失败: {e}")
            return False
    
    def _generate_file_content(self, papers: List[Dict]) -> str:
        """生成文件内容"""
        content = """// utils/papersData.js
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
"""
        
        for i, paper in enumerate(papers):
            content += self._generate_paper_js(paper)
            if i < len(papers) - 1:
                content += ",\n\n"
            else:
                content += "\n"
        
        content += """]

module.exports = papers
"""
        
        return content
    
    def _generate_paper_js(self, paper: Dict) -> str:
        """生成单篇论文的JavaScript代码"""
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
    get wordCount() {{ return getPaperWordCount('{escape_js_string(paper['title'])}') }}"""
        
        # 添加分析字段（如果存在）
        if 'background' in paper:
            js_template += f""",
    background: `{escape_js_string(paper['background'])}`"""
        
        if 'keyConcepts' in paper:
            js_template += f""",
    keyConcepts: `{escape_js_string(paper['keyConcepts'])}`"""
        
        if 'highlights' in paper:
            js_template += f""",
    highlights: `{escape_js_string(paper['highlights'])}`"""
        
        js_template += "\n  }"
        
        return js_template
    
    def _restore_backup(self) -> bool:
        """恢复备份文件"""
        try:
            # 找到最新的备份文件
            backup_files = [f for f in os.listdir(self.backup_dir) if f.startswith('papersData_backup_')]
            if not backup_files:
                logger.error("没有找到备份文件")
                return False
            
            latest_backup = sorted(backup_files)[-1]
            backup_path = os.path.join(self.backup_dir, latest_backup)
            
            with open(backup_path, 'r', encoding='utf-8') as src:
                with open(self.papers_data_file, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            
            logger.info(f"已恢复备份: {latest_backup}")
            return True
            
        except Exception as e:
            logger.error(f"恢复备份失败: {e}")
            return False

# 使用示例
if __name__ == "__main__":
    injector = ImprovedDataInjector("../utils/papersData.js")
    
    # 示例：添加新论文
    new_papers = [
        {
            "id": 15,
            "title": "Test Paper",
            "authors": "Test Author",
            "year": 2024,
            "journal": "Test Journal",
            "abstract": "Test abstract",
            "url": "https://example.com",
            "background": "Test background",
            "keyConcepts": "Test concepts",
            "highlights": "Test highlights"
        }
    ]
    
    success = injector.inject_papers_data_safely(new_papers)
    print(f"注入结果: {'成功' if success else '失败'}")

