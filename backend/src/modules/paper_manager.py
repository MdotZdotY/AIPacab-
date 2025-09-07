"""
论文管理模块
负责论文列表维护、内容抓取和状态跟踪
"""

import os
import pandas as pd
import requests
import PyPDF2
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class PaperListManager:
    """论文列表管理器"""
    
    def __init__(self, config_file: str = "config/papers_list.csv"):
        self.config_file = config_file
        self.papers = self.load_papers()
        self.db_path = "data/papers.db"
        self._init_database()
    
    def _init_database(self):
        """初始化数据库"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS papers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                authors TEXT,
                year INTEGER,
                journal TEXT,
                category TEXT DEFAULT 'AI专业词汇',
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def load_papers(self) -> List[Dict]:
        """从CSV文件加载论文列表"""
        try:
            if os.path.exists(self.config_file):
                # 尝试不同的编码格式
                encodings = ['utf-8', 'gbk', 'gb2312', 'utf-8-sig']
                df = None
                
                for encoding in encodings:
                    try:
                        df = pd.read_csv(self.config_file, encoding=encoding)
                        logger.info(f"成功使用 {encoding} 编码加载论文列表")
                        break
                    except UnicodeDecodeError:
                        continue
                
                if df is None:
                    logger.error("无法使用任何编码格式加载论文列表")
                    return []
                
                return df.to_dict('records')
            else:
                logger.warning(f"论文列表文件不存在: {self.config_file}")
                return []
        except Exception as e:
            logger.error(f"加载论文列表失败: {e}")
            return []
    
    def save_papers(self):
        """保存论文列表到CSV文件"""
        try:
            os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
            df = pd.DataFrame(self.papers)
            df.to_csv(self.config_file, index=False, encoding='utf-8-sig')
            logger.info(f"论文列表已保存到: {self.config_file}")
        except Exception as e:
            logger.error(f"保存论文列表失败: {e}")
    
    def add_paper(self, title: str, url: str, authors: str, year: int, 
                  journal: str, category: str = "AI专业词汇") -> Dict:
        """添加新论文到列表"""
        new_paper = {
            "title": title,
            "url": url,
            "authors": authors,
            "year": year,
            "journal": journal,
            "category": category,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        # 检查重复
        if not self._is_duplicate(new_paper):
            self.papers.append(new_paper)
            self.save_papers()
            self._save_to_database(new_paper)
            logger.info(f"添加新论文: {title}")
            return new_paper
        else:
            logger.warning(f"论文已存在: {title}")
            return None
    
    def _is_duplicate(self, paper: Dict) -> bool:
        """检查论文是否重复"""
        for existing_paper in self.papers:
            if (existing_paper['title'] == paper['title'] or 
                existing_paper['url'] == paper['url']):
                return True
        return False
    
    def _save_to_database(self, paper: Dict):
        """保存论文到数据库"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO papers (title, url, authors, year, journal, category, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                paper['title'], paper['url'], paper['authors'], 
                paper['year'], paper['journal'], paper['category'], paper['status']
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"保存论文到数据库失败: {e}")
    
    def update_paper_status(self, title: str, status: str):
        """更新论文处理状态"""
        for paper in self.papers:
            if paper['title'] == title:
                paper['status'] = status
                paper['updated_at'] = datetime.now().isoformat()
                break
        
        self.save_papers()
        self._update_database_status(title, status)
        logger.info(f"更新论文状态: {title} -> {status}")
    
    def _update_database_status(self, title: str, status: str):
        """更新数据库中的论文状态"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE papers SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE title = ?
            ''', (status, title))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"更新数据库状态失败: {e}")
    
    def get_pending_papers(self) -> List[Dict]:
        """获取待处理的论文列表"""
        return [paper for paper in self.papers if paper['status'] == 'pending']
    
    def get_processing_papers(self) -> List[Dict]:
        """获取处于processing状态的论文列表"""
        return [paper for paper in self.papers if paper['status'] == 'processing']
    
    def reset_processing_papers(self) -> int:
        """重置所有处于processing状态的论文为pending状态"""
        try:
            processing_papers = self.get_processing_papers()
            if not processing_papers:
                logger.info("没有处于processing状态的论文需要重置")
                return 0
            
            # 更新内存中的状态
            reset_count = 0
            for paper in self.papers:
                if paper['status'] == 'processing':
                    paper['status'] = 'pending'
                    paper['updated_at'] = datetime.now().isoformat()
                    reset_count += 1
            
            # 保存到CSV文件
            self.save_papers()
            
            # 更新数据库
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE papers SET status = 'pending', updated_at = CURRENT_TIMESTAMP
                WHERE status = 'processing'
            ''')
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            logger.info(f"成功重置 {reset_count} 篇论文的状态: processing -> pending")
            return reset_count
            
        except Exception as e:
            logger.error(f"重置processing状态论文失败: {e}")
            return 0
    
    def reset_failed_papers(self) -> int:
        """重置所有处于failed状态的论文为pending状态"""
        try:
            failed_papers = [p for p in self.papers if p['status'] == 'failed']
            if not failed_papers:
                logger.info("没有处于failed状态的论文需要重置")
                return 0
            
            # 更新内存中的状态
            reset_count = 0
            for paper in self.papers:
                if paper['status'] == 'failed':
                    paper['status'] = 'pending'
                    paper['updated_at'] = datetime.now().isoformat()
                    reset_count += 1
            
            # 保存到CSV文件
            self.save_papers()
            
            # 更新数据库
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE papers SET status = 'pending', updated_at = CURRENT_TIMESTAMP
                WHERE status = 'failed'
            ''')
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            logger.info(f"成功重置 {reset_count} 篇论文的状态: failed -> pending")
            return reset_count
            
        except Exception as e:
            logger.error(f"重置failed状态论文失败: {e}")
            return 0
    
    def validate_url(self, url: str) -> bool:
        """验证论文链接有效性"""
        try:
            response = requests.head(url, timeout=10)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"URL验证失败: {url} - {e}")
            return False


class PaperContentFetcher:
    """论文内容抓取器"""
    
    def __init__(self, storage_path: str = "papers/"):
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)
    
    def download_paper(self, url: str, paper_id: str) -> str:
        """下载论文文件"""
        try:
            logger.info(f"开始下载论文: {url}")
            
            # 处理arXiv链接，将abs改为pdf
            if 'arxiv.org/abs/' in url:
                pdf_url = url.replace('/abs/', '/pdf/')
                logger.info(f"转换arXiv链接为PDF: {pdf_url}")
                url = pdf_url
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # 确定文件类型
            content_type = response.headers.get('content-type', '')
            if 'pdf' in content_type or url.endswith('.pdf') or '/pdf/' in url:
                file_path = os.path.join(self.storage_path, f"{paper_id}.pdf")
            else:
                file_path = os.path.join(self.storage_path, f"{paper_id}.txt")
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"论文下载完成: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"下载论文失败: {url} - {e}")
            raise Exception(f"下载论文失败: {e}")
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """从PDF提取文本"""
        try:
            logger.info(f"开始解析PDF: {pdf_path}")
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        page_text = page.extract_text()
                        text += page_text + "\n"
                    except Exception as e:
                        logger.warning(f"解析第{page_num + 1}页失败: {e}")
                        continue
                
                cleaned_text = self.clean_text(text)
                logger.info(f"PDF解析完成，提取文本长度: {len(cleaned_text)}")
                return cleaned_text
                
        except Exception as e:
            logger.error(f"PDF解析失败: {pdf_path} - {e}")
            raise Exception(f"PDF解析失败: {e}")
    
    def extract_abstract(self, text: str) -> str:
        """从论文文本中提取摘要"""
        import re
        
        # 常见的摘要标识符
        abstract_patterns = [
            r'Abstract\s*[:\-]?\s*(.*?)(?=\n\s*\n|\n\s*Keywords|\n\s*1\.|\n\s*Introduction)',
            r'摘要\s*[:\-]?\s*(.*?)(?=\n\s*\n|\n\s*关键词|\n\s*1\.|\n\s*引言)',
            r'Summary\s*[:\-]?\s*(.*?)(?=\n\s*\n|\n\s*Keywords|\n\s*1\.|\n\s*Introduction)'
        ]
        
        for pattern in abstract_patterns:
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                abstract = match.group(1).strip()
                # 清理摘要内容
                abstract = re.sub(r'\s+', ' ', abstract)
                if len(abstract) > 50:  # 确保摘要有足够长度
                    return abstract[:500]  # 限制摘要长度
        
        return ""
    
    def clean_text(self, text: str) -> str:
        """清洗文本内容"""
        import re
        
        # 移除多余的空白字符
        text = re.sub(r'\s+', ' ', text)
        
        # 移除特殊字符但保留基本标点
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\"\']', '', text)
        
        # 移除过短的行
        lines = text.split('\n')
        cleaned_lines = [line.strip() for line in lines if len(line.strip()) > 10]
        
        return '\n'.join(cleaned_lines).strip()
    
    def extract_text_from_file(self, file_path: str) -> str:
        """从文件提取文本"""
        if file_path.endswith('.pdf'):
            return self.extract_text_from_pdf(file_path)
        elif file_path.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise Exception(f"不支持的文件格式: {file_path}")


class PaperManager:
    """论文管理器 - 整合列表管理和内容抓取"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.list_manager = PaperListManager(
            config.get('papers_list_path', 'config/papers_list.csv')
        )
        self.content_fetcher = PaperContentFetcher(
            config.get('papers', {}).get('storage_path', 'papers/')
        )
    
    def process_paper(self, paper: Dict) -> Dict:
        """处理单篇论文"""
        try:
            # 清理文件名中的特殊字符
            import re
            clean_title = re.sub(r'[<>:"/\\|?*]', '_', paper['title'])
            paper_id = f"paper_{clean_title.replace(' ', '_')}"
            
            # 下载论文
            file_path = self.content_fetcher.download_paper(paper['url'], paper_id)
            
            # 提取文本
            content = self.content_fetcher.extract_text_from_file(file_path)
            
            # 提取摘要
            abstract = self.content_fetcher.extract_abstract(content)
            
            # 更新论文信息，添加摘要
            paper_with_abstract = paper.copy()
            paper_with_abstract['abstract'] = abstract
            
            # 更新状态
            self.list_manager.update_paper_status(paper['title'], 'processing')
            
            return {
                'paper_info': paper_with_abstract,
                'content': content,
                'file_path': file_path
            }
            
        except Exception as e:
            logger.error(f"处理论文失败: {paper['title']} - {e}")
            self.list_manager.update_paper_status(paper['title'], 'failed')
            raise e
    
    def batch_process_papers(self, papers: List[Dict]) -> List[Dict]:
        """批量处理论文"""
        results = []
        batch_size = self.config.get('processing', {}).get('batch_size', 5)
        
        for i in range(0, len(papers), batch_size):
            batch = papers[i:i + batch_size]
            logger.info(f"处理批次 {i//batch_size + 1}: {len(batch)} 篇论文")
            
            for paper in batch:
                try:
                    result = self.process_paper(paper)
                    results.append(result)
                except Exception as e:
                    logger.error(f"批次处理失败: {paper['title']} - {e}")
                    continue
            
            # 批次间延迟
            delay = self.config.get('processing', {}).get('delay_between_requests', 1)
            if i + batch_size < len(papers):
                import time
                time.sleep(delay)
        
        return results