# AI Pacab+ 后台论文分析系统

> **版本**: v2.0  
> **创建日期**: 2024年12月  
> **项目**: AI Pacab+ 小程序后台功能扩展  

## 📋 系统概述

AI Pacab+ 后台论文分析系统是一个自动化工具，用于分析AI论文并提取相关词汇，然后通过小程序更新机制注入到用户本地设备。

### 核心功能
- **论文管理**: 维护论文列表，自动抓取论文内容
- **LLM分析**: 生成背景解读、关键概念、论文亮点
- **词汇提取**: 自动提取GRE/TOEFL/IELTS/AI专业词汇
- **数据注入**: 通过小程序更新机制注入到用户本地

### 技术特点
- **完全本地化**: 所有数据最终存储在用户本地设备
- **零破坏性**: 不影响现有小程序功能和UI
- **数据兼容**: 完全沿用现有数据结构
- **成本可控**: LLM调用成本完全可控

## 🚀 快速开始

### 1. 环境要求
- Python 3.9+
- OpenAI API密钥 或 Claude API密钥

### 2. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

### 3. 配置系统
```bash
# 复制配置文件
cp config/config.example.json config/config.json

# 编辑配置文件，设置API密钥
vim config/config.json
```

### 4. 启动系统
```bash
python start.py
```

## 📁 目录结构

```
backend/
├── src/                    # 源代码
│   ├── modules/           # 核心模块
│   │   ├── paper_manager.py      # 论文管理模块
│   │   ├── llm_analyzer.py       # LLM分析模块
│   │   ├── data_packager.py      # 数据打包模块
│   │   └── miniprogram_integration.py  # 小程序集成模块
│   └── main.py            # 主程序
├── config/                # 配置文件
│   ├── config.json        # 系统配置
│   └── papers_list.csv    # 论文列表
├── data/                  # 数据目录
├── papers/                # 论文文件存储
├── logs/                  # 日志文件
├── requirements.txt       # Python依赖
├── start.py              # 启动脚本
└── README.md             # 说明文档
```

## ⚙️ 配置说明

### 配置文件 (config/config.json)
```json
{
  "llm": {
    "provider": "openai",           // LLM提供商: openai, claude
    "api_key": "your-api-key",      // API密钥
    "model": "gpt-4",               // 模型名称
    "max_tokens": 4000,             // 最大token数
    "temperature": 0.7,             // 温度参数
    "retry_count": 3,               // 重试次数
    "timeout": 30                   // 超时时间
  },
  "papers": {
    "storage_path": "./papers/",    // 论文存储路径
    "max_file_size": "50MB",        // 最大文件大小
    "supported_formats": ["pdf", "txt"]  // 支持的文件格式
  },
  "processing": {
    "batch_size": 5,                // 批处理大小
    "max_concurrent": 3,            // 最大并发数
    "delay_between_requests": 1     // 请求间延迟
  },
  "miniprogram": {
    "data_path": "../utils/",       // 小程序数据路径
    "update_url": "https://...",    // 更新URL
    "data_version": "20241201_000000"  // 数据版本
  }
}
```

### 论文列表 (config/papers_list.csv)
```csv
title,url,authors,year,journal,category,status
"论文标题","论文URL","作者","年份","期刊","分类","状态"
```

## 🛠 使用方法

### 1. 交互式使用
```bash
python start.py
```

系统会显示菜单，可以选择：
1. 处理待处理论文
2. 添加新论文
3. 查看系统状态
4. 创建小程序更新文件
5. 退出

### 2. 命令行使用
```bash
# 处理待处理论文
python src/main.py --action process

# 添加新论文
python src/main.py --action add --title "论文标题" --url "论文URL" --authors "作者" --year 2024 --journal "期刊"

# 查看系统状态
python src/main.py --action status

# 创建小程序更新文件
python src/main.py --action create-update
```

## 📊 工作流程

### 1. 论文处理流程
```
论文列表 → 内容抓取 → LLM分析 → 数据打包 → 小程序注入
```

### 2. 详细步骤
1. **论文列表维护**: 通过CSV文件管理论文列表
2. **内容抓取**: 自动下载并解析PDF论文
3. **LLM分析**: 调用LLM API进行多维度分析
4. **数据打包**: 将分析结果打包成小程序可用的格式
5. **小程序注入**: 通过更新机制注入到用户设备

## 🔧 核心模块

### 1. 论文管理模块 (paper_manager.py)
- `PaperListManager`: 论文列表管理
- `PaperContentFetcher`: 论文内容抓取
- `PaperManager`: 整合管理功能

### 2. LLM分析模块 (llm_analyzer.py)
- `LLMClientManager`: LLM客户端管理
- `PaperAnalyzer`: 论文分析器
- `VocabularyExtractor`: 词汇提取器

### 3. 数据打包模块 (data_packager.py)
- `DataFormatConverter`: 数据格式转换
- `VersionManager`: 版本管理
- `MiniProgramDataInjector`: 小程序数据注入

### 4. 小程序集成模块 (miniprogram_integration.py)
- `MiniProgramUpdateDetector`: 更新检测
- `MiniProgramDataUpdater`: 数据更新
- `MiniProgramIntegrationManager`: 集成管理

## 📈 监控和日志

### 日志文件
- `logs/backend.log`: 系统运行日志
- 包含详细的处理过程和错误信息

### 监控指标
- 论文处理成功率
- LLM API调用频率和成本
- 数据同步状态
- 系统性能指标

## 🔒 安全考虑

### 数据安全
- **本地存储**: 所有数据存储在本地，不上传云端
- **API密钥**: 环境变量存储，配置文件加密
- **访问控制**: 限制配置文件访问权限

### 系统安全
- **输入验证**: 论文内容验证和过滤
- **错误处理**: 完善的异常处理机制
- **限流控制**: API调用频率限制

## 💰 成本控制

### LLM成本优化
- **批量处理**: 减少API调用次数
- **本地缓存**: 避免重复分析
- **智能重试**: 错误重试机制
- **模型选择**: 使用成本较低的模型进行初步筛选

### 存储优化
- **数据压缩**: 压缩存储数据
- **增量更新**: 只传输变更数据
- **定期清理**: 清理临时文件

## 🐛 故障排除

### 常见问题

1. **配置文件错误**
   ```
   错误: 配置文件不存在
   解决: 复制 config.example.json 为 config.json
   ```

2. **API密钥无效**
   ```
   错误: API密钥验证失败
   解决: 检查配置文件中的API密钥是否正确
   ```

3. **论文下载失败**
   ```
   错误: 下载论文失败
   解决: 检查网络连接和论文URL是否有效
   ```

4. **LLM分析失败**
   ```
   错误: LLM分析失败
   解决: 检查API配额和网络连接
   ```

### 日志分析
查看 `logs/backend.log` 文件获取详细的错误信息。

## 📞 技术支持

- **项目地址**: [GitHub Repository]
- **问题反馈**: [Issues]
- **邮箱**: [your-email@example.com]

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**AI Pacab+ 后台系统** - 让论文分析更智能！ 🚀