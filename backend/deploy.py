#!/usr/bin/env python3
"""
AI Pacab+ 后台系统部署脚本
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 9):
        print("❌ Python版本过低，需要Python 3.9+")
        return False
    print(f"✅ Python版本: {sys.version}")
    return True

def check_dependencies():
    """检查依赖包"""
    print("检查依赖包...")
    
    required_packages = [
        'fastapi', 'uvicorn', 'openai', 'anthropic', 
        'pandas', 'requests', 'PyPDF2', 'python-multipart'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n缺少依赖包: {', '.join(missing_packages)}")
        print("请运行: pip install -r requirements.txt")
        return False
    
    return True

def setup_directories():
    """创建必要的目录"""
    print("创建目录结构...")
    
    directories = [
        'data',
        'papers', 
        'logs',
        'config'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ {directory}/")
    
    return True

def setup_config():
    """设置配置文件"""
    print("设置配置文件...")
    
    config_file = Path("config/config.json")
    example_config = Path("config/config.example.json")
    
    if not config_file.exists():
        if example_config.exists():
            shutil.copy(example_config, config_file)
            print("✅ 配置文件已创建，请编辑 config/config.json 设置API密钥")
        else:
            print("❌ 配置文件模板不存在")
            return False
    else:
        print("✅ 配置文件已存在")
    
    return True

def setup_papers_list():
    """设置论文列表"""
    print("设置论文列表...")
    
    papers_file = Path("config/papers_list.csv")
    example_papers = Path("config/papers_list.example.csv")
    
    if not papers_file.exists():
        if example_papers.exists():
            shutil.copy(example_papers, papers_file)
            print("✅ 论文列表已创建")
        else:
            print("❌ 论文列表模板不存在")
            return False
    else:
        print("✅ 论文列表已存在")
    
    return True

def run_tests():
    """运行测试"""
    print("运行系统测试...")
    
    try:
        result = subprocess.run([sys.executable, "test_system.py"], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ 系统测试通过")
            return True
        else:
            print("❌ 系统测试失败")
            print(result.stdout)
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ 测试运行失败: {e}")
        return False

def create_startup_script():
    """创建启动脚本"""
    print("创建启动脚本...")
    
    if os.name == 'nt':  # Windows
        script_content = """@echo off
echo Starting AI Pacab+ Backend System...
python start.py
pause
"""
        script_path = "start.bat"
    else:  # Linux/Mac
        script_content = """#!/bin/bash
echo "Starting AI Pacab+ Backend System..."
python3 start.py
"""
        script_path = "start.sh"
        os.chmod(script_path, 0o755)
    
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    print(f"✅ 启动脚本已创建: {script_path}")
    return True

def main():
    """主部署函数"""
    print("AI Pacab+ 后台系统部署")
    print("=" * 50)
    
    steps = [
        ("检查Python版本", check_python_version),
        ("检查依赖包", check_dependencies),
        ("创建目录结构", setup_directories),
        ("设置配置文件", setup_config),
        ("设置论文列表", setup_papers_list),
        ("运行系统测试", run_tests),
        ("创建启动脚本", create_startup_script)
    ]
    
    for step_name, step_func in steps:
        print(f"\n{step_name}...")
        if not step_func():
            print(f"❌ {step_name}失败，部署中止")
            return False
    
    print("\n" + "=" * 50)
    print("🎉 部署完成！")
    print("\n下一步:")
    print("1. 编辑 config/config.json 设置API密钥")
    print("2. 编辑 config/papers_list.csv 添加论文")
    print("3. 运行 python start.py 启动系统")
    print("4. 或运行 start.bat (Windows) / start.sh (Linux/Mac)")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)