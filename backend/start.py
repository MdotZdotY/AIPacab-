#!/usr/bin/env python3
"""
AI Pacab+ 后台论文分析系统启动脚本
"""

import os
import sys
import json
import logging
from pathlib import Path

# 添加src目录到Python路径
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

from main import BackendSystem

def setup_logging():
    """设置日志"""
    log_dir = current_dir / "logs"
    log_dir.mkdir(exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_dir / 'backend.log', encoding='utf-8'),
            logging.StreamHandler()
        ]
    )

def check_config():
    """检查配置文件"""
    config_path = current_dir / "config" / "config.json"
    
    if not config_path.exists():
        print(f"配置文件不存在: {config_path}")
        print("请复制 config.example.json 为 config.json 并配置相关参数")
        return False
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # 检查API密钥
        api_key = config.get('llm', {}).get('api_key', '')
        if not api_key or api_key == 'your-api-key-here':
            print("请在配置文件中设置有效的LLM API密钥")
            return False
        
        print("配置文件检查通过")
        return True
        
    except Exception as e:
        print(f"配置文件检查失败: {e}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("AI Pacab+ 后台论文分析系统 v2.0")
    print("=" * 60)
    
    # 设置日志
    setup_logging()
    
    # 检查配置文件
    if not check_config():
        sys.exit(1)
    
    try:
        # 创建后台系统实例
        config_path = str(current_dir / "config" / "config.json")
        backend = BackendSystem(config_path)
        
        print("\n系统初始化完成")
        print("可用操作:")
        print("1. 处理待处理论文")
        print("2. 添加新论文")
        print("3. 查看系统状态")
        print("4. 重置processing状态论文")
        print("5. 重置failed状态论文")
        print("6. 创建小程序更新文件")
        print("7. 退出")
        
        while True:
            try:
                choice = input("\n请选择操作 (1-7): ").strip()
                
                if choice == '1':
                    print("\n开始处理待处理论文...")
                    success = backend.process_pending_papers()
                    if success:
                        print("✅ 论文处理完成")
                    else:
                        print("❌ 论文处理失败")
                
                elif choice == '2':
                    print("\n添加新论文")
                    title = input("论文标题: ").strip()
                    url = input("论文URL: ").strip()
                    authors = input("作者: ").strip()
                    year = int(input("年份: ").strip())
                    journal = input("期刊/会议: ").strip()
                    
                    success = backend.add_new_paper(title, url, authors, year, journal)
                    if success:
                        print("✅ 论文添加成功")
                    else:
                        print("❌ 论文添加失败")
                
                elif choice == '3':
                    print("\n系统状态:")
                    status = backend.get_system_status()
                    print(json.dumps(status, ensure_ascii=False, indent=2))
                
                elif choice == '4':
                    print("\n重置processing状态的论文...")
                    success = backend.reset_processing_papers()
                    if success:
                        print("✅ 论文状态重置成功")
                    else:
                        print("❌ 论文状态重置失败")
                
                elif choice == '5':
                    print("\n重置failed状态的论文...")
                    success = backend.reset_failed_papers()
                    if success:
                        print("✅ 论文状态重置成功")
                    else:
                        print("❌ 论文状态重置失败")
                
                elif choice == '6':
                    print("\n创建小程序更新文件...")
                    success = backend.create_miniprogram_update_files()
                    if success:
                        print("✅ 小程序更新文件创建成功")
                    else:
                        print("❌ 小程序更新文件创建失败")
                
                elif choice == '7':
                    print("退出系统")
                    break
                
                else:
                    print("无效选择，请重新输入")
            
            except KeyboardInterrupt:
                print("\n\n用户中断，退出系统")
                break
            except Exception as e:
                print(f"操作失败: {e}")
    
    except Exception as e:
        print(f"系统启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()