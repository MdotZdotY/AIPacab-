#!/usr/bin/env python3
"""
数据保护管理器
提供数据备份、恢复和验证功能，防止数据丢失
"""

import json
import os
import shutil
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DataProtectionManager:
    """数据保护管理器"""
    
    def __init__(self, papers_data_file: str, backup_dir: str = "data/backups"):
        self.papers_data_file = papers_data_file
        self.backup_dir = backup_dir
        self.max_backups = 10  # 保留最近10个备份
        os.makedirs(backup_dir, exist_ok=True)
    
    def create_backup(self, description: str = "") -> Optional[str]:
        """创建数据备份"""
        try:
            if not os.path.exists(self.papers_data_file):
                logger.warning("论文数据文件不存在，跳过备份")
                return None
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"papersData_backup_{timestamp}.js"
            backup_path = os.path.join(self.backup_dir, backup_filename)
            
            # 复制文件
            shutil.copy2(self.papers_data_file, backup_path)
            
            # 创建备份元数据
            metadata = {
                "timestamp": timestamp,
                "description": description,
                "source_file": self.papers_data_file,
                "backup_file": backup_path,
                "file_size": os.path.getsize(backup_path),
                "created_at": datetime.now().isoformat()
            }
            
            metadata_file = backup_path.replace('.js', '_metadata.json')
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            logger.info(f"备份已创建: {backup_path}")
            
            # 清理旧备份
            self._cleanup_old_backups()
            
            return backup_path
            
        except Exception as e:
            logger.error(f"创建备份失败: {e}")
            return None
    
    def restore_backup(self, backup_path: str = None) -> bool:
        """恢复备份"""
        try:
            if backup_path is None:
                # 使用最新的备份
                backup_path = self.get_latest_backup()
                if not backup_path:
                    logger.error("没有找到可用的备份文件")
                    return False
            
            if not os.path.exists(backup_path):
                logger.error(f"备份文件不存在: {backup_path}")
                return False
            
            # 创建当前文件的备份（以防恢复失败）
            current_backup = self.create_backup("恢复前的备份")
            
            # 恢复文件
            shutil.copy2(backup_path, self.papers_data_file)
            
            logger.info(f"已从备份恢复: {backup_path}")
            return True
            
        except Exception as e:
            logger.error(f"恢复备份失败: {e}")
            return False
    
    def get_latest_backup(self) -> Optional[str]:
        """获取最新的备份文件"""
        try:
            backup_files = []
            for filename in os.listdir(self.backup_dir):
                if filename.startswith('papersData_backup_') and filename.endswith('.js'):
                    backup_path = os.path.join(self.backup_dir, filename)
                    backup_files.append((backup_path, os.path.getmtime(backup_path)))
            
            if not backup_files:
                return None
            
            # 按修改时间排序，返回最新的
            backup_files.sort(key=lambda x: x[1], reverse=True)
            return backup_files[0][0]
            
        except Exception as e:
            logger.error(f"获取最新备份失败: {e}")
            return None
    
    def list_backups(self) -> List[Dict]:
        """列出所有备份"""
        try:
            backups = []
            for filename in os.listdir(self.backup_dir):
                if filename.startswith('papersData_backup_') and filename.endswith('.js'):
                    backup_path = os.path.join(self.backup_dir, filename)
                    metadata_file = backup_path.replace('.js', '_metadata.json')
                    
                    backup_info = {
                        "filename": filename,
                        "path": backup_path,
                        "size": os.path.getsize(backup_path),
                        "modified": datetime.fromtimestamp(os.path.getmtime(backup_path)).isoformat()
                    }
                    
                    # 读取元数据
                    if os.path.exists(metadata_file):
                        try:
                            with open(metadata_file, 'r', encoding='utf-8') as f:
                                metadata = json.load(f)
                                backup_info.update(metadata)
                        except:
                            pass
                    
                    backups.append(backup_info)
            
            # 按时间排序
            backups.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            return backups
            
        except Exception as e:
            logger.error(f"列出备份失败: {e}")
            return []
    
    def _cleanup_old_backups(self):
        """清理旧备份"""
        try:
            backups = self.list_backups()
            
            if len(backups) <= self.max_backups:
                return
            
            # 删除多余的备份
            backups_to_delete = backups[self.max_backups:]
            for backup in backups_to_delete:
                try:
                    os.remove(backup['path'])
                    metadata_file = backup['path'].replace('.js', '_metadata.json')
                    if os.path.exists(metadata_file):
                        os.remove(metadata_file)
                    logger.info(f"已删除旧备份: {backup['filename']}")
                except Exception as e:
                    logger.error(f"删除备份失败 {backup['filename']}: {e}")
                    
        except Exception as e:
            logger.error(f"清理旧备份失败: {e}")
    
    def validate_data_integrity(self) -> Dict:
        """验证数据完整性"""
        try:
            if not os.path.exists(self.papers_data_file):
                return {
                    "status": "error",
                    "message": "论文数据文件不存在"
                }
            
            # 检查文件大小
            file_size = os.path.getsize(self.papers_data_file)
            if file_size == 0:
                return {
                    "status": "error",
                    "message": "论文数据文件为空"
                }
            
            # 检查文件格式
            with open(self.papers_data_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 基本格式检查
            if 'const papers = [' not in content:
                return {
                    "status": "error",
                    "message": "文件格式不正确，缺少papers数组"
                }
            
            if 'module.exports = papers' not in content:
                return {
                    "status": "warning",
                    "message": "文件格式可能不完整，缺少module.exports"
                }
            
            # 统计论文数量
            paper_count = content.count('id:')
            
            return {
                "status": "success",
                "message": "数据完整性验证通过",
                "file_size": file_size,
                "paper_count": paper_count
            }
            
        except Exception as e:
            logger.error(f"验证数据完整性失败: {e}")
            return {
                "status": "error",
                "message": f"验证失败: {e}"
            }
    
    def auto_backup_before_operation(self, operation_name: str) -> bool:
        """在操作前自动创建备份"""
        try:
            backup_path = self.create_backup(f"操作前备份: {operation_name}")
            return backup_path is not None
        except Exception as e:
            logger.error(f"自动备份失败: {e}")
            return False
    
    def emergency_recovery(self) -> bool:
        """紧急恢复功能"""
        try:
            logger.warning("执行紧急恢复...")
            
            # 检查当前文件状态
            integrity_check = self.validate_data_integrity()
            if integrity_check['status'] == 'success':
                logger.info("当前数据完整，无需恢复")
                return True
            
            # 尝试恢复最新备份
            if self.restore_backup():
                # 验证恢复结果
                new_integrity_check = self.validate_data_integrity()
                if new_integrity_check['status'] == 'success':
                    logger.info("紧急恢复成功")
                    return True
                else:
                    logger.error("恢复后数据仍然不完整")
                    return False
            else:
                logger.error("紧急恢复失败")
                return False
                
        except Exception as e:
            logger.error(f"紧急恢复失败: {e}")
            return False

# 使用示例
if __name__ == "__main__":
    manager = DataProtectionManager("../utils/papersData.js")
    
    # 创建备份
    backup_path = manager.create_backup("测试备份")
    print(f"备份创建: {'成功' if backup_path else '失败'}")
    
    # 列出备份
    backups = manager.list_backups()
    print(f"找到 {len(backups)} 个备份")
    
    # 验证数据完整性
    integrity = manager.validate_data_integrity()
    print(f"数据完整性: {integrity['status']} - {integrity['message']}")

