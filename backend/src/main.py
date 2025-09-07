"""
AI Pacab+ 后台论文分析系统主程序
"""

import os
import json
import logging
import argparse
from datetime import datetime
from typing import Dict, List

# 导入自定义模块
from modules.paper_manager import PaperManager
from modules.llm_analyzer import LLMClientManager, PaperAnalyzer, VocabularyExtractor
from modules.data_packager import DataPackager
from modules.miniprogram_integration import MiniProgramIntegrationManager

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/backend.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class BackendSystem:
    """后台系统主类"""
    
    def __init__(self, config_path: str = "config/config.json"):
        self.config = self._load_config(config_path)
        self._init_components()
    
    def _load_config(self, config_path: str) -> Dict:
        """加载配置文件"""
        try:
            if not os.path.exists(config_path):
                logger.error(f"配置文件不存在: {config_path}")
                raise FileNotFoundError(f"配置文件不存在: {config_path}")
            
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            logger.info(f"配置文件加载成功: {config_path}")
            return config
            
        except Exception as e:
            logger.error(f"加载配置文件失败: {e}")
            raise e
    
    def _init_components(self):
        """初始化各个组件"""
        try:
            # 初始化论文管理器
            self.paper_manager = PaperManager(self.config)
            
            # 初始化LLM客户端管理器
            self.llm_client_manager = LLMClientManager(self.config)
            
            # 初始化论文分析器
            self.paper_analyzer = PaperAnalyzer(self.llm_client_manager)
            
            # 初始化词汇提取器
            self.vocabulary_extractor = VocabularyExtractor()
            
            # 初始化数据打包器
            self.data_packager = DataPackager(self.config)
            
            # 初始化小程序集成管理器
            self.miniprogram_integration = MiniProgramIntegrationManager(self.config)
            
            logger.info("所有组件初始化完成")
            
        except Exception as e:
            logger.error(f"组件初始化失败: {e}")
            raise e
    
    def process_pending_papers(self) -> bool:
        """处理待处理的论文 - 增强版本，包含数据保护机制"""
        try:
            logger.info("开始处理待处理论文...")
            
            # 初始化数据保护管理器
            import sys
            from pathlib import Path
            current_dir = Path(__file__).parent.parent
            sys.path.insert(0, str(current_dir))
            from data_protection_manager import DataProtectionManager
            protection_manager = DataProtectionManager("../utils/papersData.js")
            
            # 在操作前创建备份
            if not protection_manager.auto_backup_before_operation("论文处理"):
                logger.warning("创建备份失败，但继续执行操作")
            
            # 获取待处理论文
            pending_papers = self.paper_manager.list_manager.get_pending_papers()
            
            if not pending_papers:
                logger.info("没有待处理的论文")
                return True
            
            logger.info(f"找到 {len(pending_papers)} 篇待处理论文")
            
            # 批量处理论文
            papers_data = self.paper_manager.batch_process_papers(pending_papers)
            
            if not papers_data:
                logger.error("论文处理失败")
                return False
            
            # 分析论文
            analysis_results = self.paper_analyzer.batch_analyze_papers(papers_data)
            
            if not analysis_results:
                logger.error("论文分析失败")
                return False
            
            # 打包数据
            update_package = self.data_packager.package_analysis_results(analysis_results)
            
            # 验证更新包
            if not self.data_packager.validate_update_package(update_package):
                logger.error("更新包验证失败")
                return False
            
            # 保存更新包
            output_path = f"data/update_package_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            self.data_packager.save_update_package(update_package, output_path)
            
            # 注入到小程序（使用改进的注入逻辑）
            papers_data = update_package['papers']
            vocabulary_data = update_package['vocabulary']
            
            injection_success = self.data_packager.inject_to_miniprogram(papers_data, vocabulary_data)
            
            if injection_success:
                # 验证注入后的数据完整性
                integrity_check = protection_manager.validate_data_integrity()
                if integrity_check['status'] == 'success':
                    logger.info("数据注入成功，完整性验证通过")
                else:
                    logger.warning(f"数据注入完成，但完整性检查发现问题: {integrity_check['message']}")
                
                # 更新论文状态
                for paper_info in pending_papers:
                    self.paper_manager.list_manager.update_paper_status(
                        paper_info['title'], 'completed'
                    )
                
                logger.info("论文处理完成")
                return True
            else:
                logger.error("数据注入失败，尝试恢复备份")
                if protection_manager.emergency_recovery():
                    logger.info("已从备份恢复数据")
                else:
                    logger.error("恢复备份失败")
                return False
                
        except Exception as e:
            logger.error(f"处理待处理论文失败: {e}")
            return False
    
    def add_new_paper(self, title: str, url: str, authors: str, year: int, 
                      journal: str, category: str = "AI专业词汇") -> bool:
        """添加新论文"""
        try:
            logger.info(f"添加新论文: {title}")
            
            # 验证URL
            if not self.paper_manager.list_manager.validate_url(url):
                logger.error(f"论文URL无效: {url}")
                return False
            
            # 添加论文
            result = self.paper_manager.list_manager.add_paper(
                title, url, authors, year, journal, category
            )
            
            if result:
                logger.info(f"论文添加成功: {title}")
                return True
            else:
                logger.error(f"论文添加失败: {title}")
                return False
                
        except Exception as e:
            logger.error(f"添加新论文失败: {e}")
            return False
    
    def get_system_status(self) -> Dict:
        """获取系统状态"""
        try:
            # 获取论文统计
            papers = self.paper_manager.list_manager.papers
            paper_stats = {
                'total': len(papers),
                'pending': len([p for p in papers if p['status'] == 'pending']),
                'processing': len([p for p in papers if p['status'] == 'processing']),
                'completed': len([p for p in papers if p['status'] == 'completed']),
                'failed': len([p for p in papers if p['status'] == 'failed'])
            }
            
            # 获取系统信息
            system_info = {
                'version': '2.0.0',
                'timestamp': datetime.now().isoformat(),
                'config_loaded': bool(self.config),
                'llm_provider': self.config.get('llm', {}).get('provider', 'unknown'),
                'papers_stats': paper_stats
            }
            
            return system_info
            
        except Exception as e:
            logger.error(f"获取系统状态失败: {e}")
            return {'error': str(e)}
    
    def reset_processing_papers(self) -> bool:
        """重置处于processing状态的论文为pending状态"""
        try:
            logger.info("开始重置processing状态的论文...")
            
            reset_count = self.paper_manager.list_manager.reset_processing_papers()
            
            if reset_count > 0:
                logger.info(f"成功重置 {reset_count} 篇论文的状态")
                return True
            else:
                logger.info("没有需要重置的论文")
                return True
                
        except Exception as e:
            logger.error(f"重置processing状态论文失败: {e}")
            return False
    
    def reset_failed_papers(self) -> bool:
        """重置处于failed状态的论文为pending状态"""
        try:
            logger.info("开始重置failed状态的论文...")
            
            reset_count = self.paper_manager.list_manager.reset_failed_papers()
            
            if reset_count > 0:
                logger.info(f"成功重置 {reset_count} 篇论文的状态")
                return True
            else:
                logger.info("没有需要重置的论文")
                return True
                
        except Exception as e:
            logger.error(f"重置failed状态论文失败: {e}")
            return False
    
    def create_miniprogram_update_files(self) -> bool:
        """创建小程序更新文件"""
        try:
            logger.info("创建小程序更新文件...")
            
            # 创建更新代码
            update_code_path = "data/miniprogram_update.js"
            success = self.miniprogram_integration.create_miniprogram_update_code(update_code_path)
            
            if success:
                logger.info("小程序更新文件创建成功")
                return True
            else:
                logger.error("小程序更新文件创建失败")
                return False
                
        except Exception as e:
            logger.error(f"创建小程序更新文件失败: {e}")
            return False


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='AI Pacab+ 后台论文分析系统')
    parser.add_argument('--config', default='config/config.json', help='配置文件路径')
    parser.add_argument('--action', choices=['process', 'add', 'status', 'create-update'], 
                       default='process', help='执行的操作')
    parser.add_argument('--title', help='论文标题（添加论文时使用）')
    parser.add_argument('--url', help='论文URL（添加论文时使用）')
    parser.add_argument('--authors', help='论文作者（添加论文时使用）')
    parser.add_argument('--year', type=int, help='论文年份（添加论文时使用）')
    parser.add_argument('--journal', help='期刊/会议（添加论文时使用）')
    
    args = parser.parse_args()
    
    try:
        # 创建后台系统实例
        backend = BackendSystem(args.config)
        
        if args.action == 'process':
            # 处理待处理论文
            success = backend.process_pending_papers()
            if success:
                print("论文处理完成")
            else:
                print("论文处理失败")
                exit(1)
        
        elif args.action == 'add':
            # 添加新论文
            if not all([args.title, args.url, args.authors, args.year, args.journal]):
                print("添加论文需要提供所有必需参数: --title, --url, --authors, --year, --journal")
                exit(1)
            
            success = backend.add_new_paper(
                args.title, args.url, args.authors, args.year, args.journal
            )
            if success:
                print(f"论文添加成功: {args.title}")
            else:
                print(f"论文添加失败: {args.title}")
                exit(1)
        
        elif args.action == 'status':
            # 获取系统状态
            status = backend.get_system_status()
            print(json.dumps(status, ensure_ascii=False, indent=2))
        
        elif args.action == 'create-update':
            # 创建小程序更新文件
            success = backend.create_miniprogram_update_files()
            if success:
                print("小程序更新文件创建成功")
            else:
                print("小程序更新文件创建失败")
                exit(1)
    
    except Exception as e:
        logger.error(f"程序执行失败: {e}")
        print(f"程序执行失败: {e}")
        exit(1)


if __name__ == "__main__":
    main()