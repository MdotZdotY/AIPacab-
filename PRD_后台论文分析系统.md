# AI Pacab+ 后台论文分析系统 - 产品需求文档 (PRD)

> **版本**: v1.1  
> **创建日期**: 2024年12月  
> **最后更新**: 2024年12月1日  
> **项目**: AI Pacab+ 小程序后台功能扩展  

## 📋 项目概述

### 项目背景
AI Pacab+ 是一款专为AI论文阅读设计的词汇学习小程序。为了提供更丰富、更专业的论文分析内容，需要开发一个后台系统，通过LLM自动分析论文并提取相关词汇，然后通过小程序更新机制注入到用户本地设备。

### 项目目标
- 建立论文列表维护系统
- 实现LLM自动论文分析
- 提取GRE/TOEFL/IELTS/AI专业词汇
- 通过小程序更新机制注入数据
- 保持完全本地存储，无云端依赖

### 核心原则
1. **本地存储优先**: 所有数据最终存储在用户本地设备
2. **零破坏性**: 不影响现有小程序功能和UI
3. **数据兼容**: 完全沿用现有数据结构
4. **成本可控**: LLM调用成本完全可控

## 🎯 功能需求

### 1. 论文管理模块

#### 1.1 论文列表维护
**功能描述**: 维护待分析的论文列表

**输入数据**:
```csv
title,url,authors,year,journal,category,status
"Attention Is All You Need","https://arxiv.org/abs/1706.03762","Ashish Vaswani et al.",2017,"NIPS","AI专业词汇","pending"
```

**功能特性**:
- 支持CSV/Excel批量导入
- 论文信息验证
- 链接有效性检查
- 重复检测和去重
- 处理状态跟踪

**状态管理**:
- `pending`: 待处理
- `processing`: 处理中
- `completed`: 已完成
- `failed`: 处理失败

#### 1.2 论文内容抓取
**功能描述**: 自动下载和解析论文内容

**支持格式**:
- PDF文件
- 文本文件
- 网页内容

**处理流程**:
1. 下载论文文件
2. 解析文本内容
3. 内容清洗和格式化
4. 分块处理（长论文分段）

### 2. LLM分析模块

#### 2.1 论文分析
**分析维度**:
1. **背景解读 (background)**
   - 研究背景和动机
   - 要解决的核心问题
   - 研究的重要性和意义
   - 字数: 200-300字

2. **关键概念 (keyConcepts)**
   - 核心技术和方法
   - 主要创新点
   - 关键技术术语
   - 字数: 300-400字

3. **论文亮点 (highlights)**
   - 主要贡献和成果
   - 实验结果和性能提升
   - 对领域的影响和意义
   - 字数: 200-300字

#### 2.2 词汇提取
**提取类别**:
- GRE高频词汇
- TOEFL高频词汇
- IELTS高频词汇
- AI专业词汇

**词汇信息**:
- 词汇本身
- 中文含义
- 词性
- 在论文中的上下文例句

#### 2.3 LLM提示词设计
```
你是一个专业的AI论文分析专家。请分析以下论文内容，并按照指定格式返回分析结果。

论文标题：[论文标题]
论文内容：[论文文本内容]

请从以下三个维度进行分析：

1. 背景解读（background）：
   - 研究背景和动机
   - 要解决的核心问题
   - 研究的重要性和意义
   - 字数控制在200-300字

2. 关键概念（keyConcepts）：
   - 核心技术和方法
   - 主要创新点
   - 关键技术术语
   - 字数控制在300-400字

3. 论文亮点（highlights）：
   - 主要贡献和成果
   - 实验结果和性能提升
   - 对领域的影响和意义
   - 字数控制在200-300字

4. 词汇提取（vocabulary）：
   请提取以下四类词汇，每类词汇要求：
   - GRE高频词汇：学术写作中常用的高级词汇
   - TOEFL高频词汇：学术英语中的核心词汇
   - IELTS高频词汇：学术英语中的常用词汇
   - AI专业词汇：人工智能领域的专业术语
   
   每个词汇需要包含：
   - 词汇本身
   - 中文含义
   - 词性
   - 在论文中的上下文例句

请严格按照以下JSON格式返回结果：
{
  "background": "背景解读内容",
  "keyConcepts": "关键概念内容", 
  "highlights": "论文亮点内容",
  "vocabulary": {
    "gre": [
      {
        "word": "词汇",
        "meaning": "中文含义",
        "partOfSpeech": "词性",
        "context": "上下文例句"
      }
    ],
    "toefl": [...],
    "ielts": [...],
    "ai": [...]
  }
}
```

### 3. 数据打包模块

#### 3.1 数据格式转换
**论文数据格式**:
```javascript
{
  id: 13,                    // 自动递增
  title: '论文标题',         // 论文标题
  authors: '作者列表',       // 作者信息
  year: 2024,              // 发表年份
  journal: '期刊/会议',     // 期刊/会议名称
  abstract: '论文摘要',     // 论文摘要
  url: '论文链接',          // 论文URL
  category: 'AI专业词汇',   // 分类
  get wordCount() { ... }, // 动态计算词汇数量
  background: '背景解读',   // LLM生成
  keyConcepts: '关键概念',  // LLM生成
  highlights: '论文亮点'    // LLM生成
}
```

**词汇数据格式**:
```javascript
{
  id: "auto_increment",
  word: "词汇",
  meaning: "中文含义",
  pronunciation: "音标",
  sentence: "例句",
  translation: "翻译",
  paperTitle: "来源论文标题",
  category: "词汇分类", // GRE高频词/TOEFL高频词/IELTS高频词/AI专业词汇
  difficulty: "难度等级",
  status: "learning", // learning, review, mastered
  studyCount: 0,
  correctCount: 0,
  lastStudyTime: null,
  weeklyStudyCount: 0
}
```

#### 3.2 版本管理
**版本控制**:
- 基于时间戳的版本号
- 增量更新机制
- 数据完整性验证

**更新包格式**:
```javascript
{
  "version": "2024-01-01T00:00:00Z",
  "papers": [...],
  "vocabulary": [...],
  "deleted": [...],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 4. 小程序集成模块

#### 4.1 数据注入机制
**更新检测**:
```javascript
// app.js
App({
  globalData: {
    dataVersion: '2024-01-01',
    updateUrl: 'https://your-server.com/api/data/update'
  },
  
  checkDataUpdate() {
    const currentVersion = wx.getStorageSync('dataVersion') || '0'
    const serverVersion = this.globalData.dataVersion
    
    if (currentVersion < serverVersion) {
      this.downloadDataUpdate()
    }
  }
})
```

**数据合并策略**:
- 论文数据: 基于ID进行更新
- 词汇数据: 基于词汇文本去重
- 保留用户学习进度

#### 4.2 兼容性保证
**数据结构兼容**:
- 完全沿用现有字段结构
- 保持现有显示逻辑不变
- 用户界面完全不变

#### 4.3 论文排序逻辑
**排序规则**:
- **主要排序**: 按发表年份由近到远（最新发表的论文排在最上面）
- **次要排序**: 同年发表的论文按标题字母顺序排序

**排序实现**:
```javascript
// 论文排序逻辑
papers.sort((a, b) => {
  // 首先按年份排序（由近到远）
  if (b.year !== a.year) {
    return b.year - a.year;
  }
  // 同年发表的论文按标题字母顺序排序
  return a.title.localeCompare(b.title);
});
```

**排序效果示例**:
- 2024年论文排在最前面
- 2020年有5篇论文时，按标题字母顺序排列：
  1. Dense Passage Retrieval for Open-Domain Question Answering
  2. Human-Centered Artificial Intelligence: Reliable, Safe & Trustworthy
  3. Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting
  4. Language Models are Few-Shot Learners
  5. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks

**应用范围**:
- 论文列表页面初始加载
- 论文搜索和过滤结果
- 数据更新合并后的排序
- 后台系统生成的数据包排序

## 🛠 技术架构

### 1. 系统架构

```
后台管理系统 (独立运行)
├── 论文管理模块
│   ├── 论文列表维护 (CSV/Excel导入)
│   ├── 论文内容抓取 (PDF解析)
│   └── 分析结果生成
├── LLM分析模块
│   ├── 背景解读生成
│   ├── 关键概念提取
│   ├── 论文亮点总结
│   └── 词汇分类提取
├── 数据打包模块
│   ├── 数据格式转换
│   ├── 版本管理
│   └── 压缩打包
└── 小程序集成模块
    ├── 数据注入脚本
    ├── 版本更新检测
    └── 本地存储更新
```

### 2. 技术栈

**后端服务**:
- **Python + FastAPI**: 轻量级后台服务
- **SQLite**: 本地数据库存储处理状态
- **Redis**: 任务队列和缓存
- **Docker**: 容器化部署

**LLM集成**:
- **OpenAI GPT-4**: 主要分析模型
- **Claude**: 备选分析模型
- **本地模型**: Ollama + Llama2 (降低成本)

**数据处理**:
- **PyPDF2/pdfplumber**: PDF解析
- **pandas**: 数据处理
- **requests**: HTTP请求

### 3. 配置文件

#### 3.1 系统配置 (config.json)
```json
{
  "llm": {
    "provider": "openai",
    "api_key": "sk-xxxxx",
    "model": "gpt-4",
    "base_url": "https://api.openai.com/v1",
    "max_tokens": 4000,
    "temperature": 0.7,
    "retry_count": 3,
    "timeout": 30
  },
  "papers": {
    "storage_path": "./papers/",
    "max_file_size": "50MB",
    "supported_formats": ["pdf", "txt"]
  },
  "database": {
    "path": "./data/papers.db",
    "backup_interval": "daily"
  },
  "processing": {
    "batch_size": 5,
    "max_concurrent": 3,
    "delay_between_requests": 1
  }
}
```

#### 3.2 论文列表 (papers_list.csv)
```csv
title,url,authors,year,journal,category,status
"Attention Is All You Need","https://arxiv.org/abs/1706.03762","Ashish Vaswani et al.",2017,"NIPS","AI专业词汇","completed"
"New Paper Title","https://arxiv.org/abs/xxxxx","Author Name",2024,"arXiv","AI专业词汇","pending"
```

## 📊 数据流程

### 1. 完整工作流程

```
1. 论文列表维护
   ↓
2. 后台系统处理
   ├── 下载论文PDF
   ├── 解析论文内容
   ├── LLM分析生成
   └── 数据格式转换
   ↓
3. 数据打包发布
   ├── 版本管理
   ├── 数据验证
   └── 发布更新
   ↓
4. 小程序自动更新
   ├── 版本检测
   ├── 数据下载
   └── 本地存储更新
```

### 2. 用户使用流程

```
用户打开小程序
    ↓
自动检查数据更新
    ↓
下载新数据包（如有）
    ↓
更新本地存储
    ↓
用户正常使用
    ├── 查看论文列表
    ├── 阅读论文分析
    ├── 学习相关词汇
    └── 点击原文链接跳转浏览器
```

## 🔒 安全考虑

### 1. 数据安全
- **本地存储**: 所有数据存储在本地，不上传云端
- **API密钥**: 环境变量存储，配置文件加密
- **访问控制**: 限制配置文件访问权限

### 2. 系统安全
- **输入验证**: 论文内容验证和过滤
- **错误处理**: 完善的异常处理机制
- **限流控制**: API调用频率限制

## 💰 成本控制

### 1. LLM成本优化
- **批量处理**: 减少API调用次数
- **本地缓存**: 避免重复分析
- **智能重试**: 错误重试机制
- **模型选择**: 使用成本较低的模型进行初步筛选

### 2. 存储优化
- **数据压缩**: 压缩存储数据
- **增量更新**: 只传输变更数据
- **定期清理**: 清理临时文件

## 📈 监控和运维

### 1. 监控指标
- 论文处理成功率
- LLM API调用频率和成本
- 数据同步状态
- 系统性能指标

### 2. 日志记录
- 处理过程日志
- 错误日志和告警
- 用户操作日志

## 🚀 部署方案

### 1. 开发环境
- 本地Python环境
- SQLite数据库
- 本地文件存储

### 2. 生产环境
- 独立服务器部署
- 定期数据更新
- 自动打包和发布

## 📋 开发计划

### 阶段一: 基础架构 (1-2周)
- [ ] 搭建后台系统框架
- [ ] 实现论文列表管理
- [ ] 配置LLM API集成

### 阶段二: 核心功能 (2-3周)
- [ ] 实现论文内容抓取
- [ ] 开发LLM分析模块
- [ ] 实现词汇提取功能

### 阶段三: 数据集成 (1-2周)
- [ ] 开发数据打包模块
- [ ] 实现小程序数据注入
- [ ] 测试数据兼容性

### 阶段四: 优化部署 (1周)
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 部署和测试

## ✅ 验收标准

### 1. 功能验收
- [ ] 能够批量导入论文列表
- [ ] 能够自动下载和解析论文
- [ ] 能够通过LLM生成高质量分析
- [ ] 能够提取准确的词汇分类
- [ ] 能够成功注入到小程序

### 2. 质量验收
- [ ] 数据格式完全兼容现有结构
- [ ] 用户界面和功能完全不变
- [ ] 处理成功率 > 95%
- [ ] 数据准确性 > 90%

### 3. 性能验收
- [ ] 单篇论文处理时间 < 5分钟
- [ ] 系统响应时间 < 2秒
- [ ] 内存使用 < 2GB
- [ ] 磁盘使用 < 10GB

## 📞 联系信息

- **项目负责人**: [项目负责人]
- **技术负责人**: [技术负责人]
- **产品负责人**: [产品负责人]

---

**文档版本**: v1.1  
**最后更新**: 2024年12月1日  
**更新内容**: 新增论文排序逻辑规范  
**下次评审**: [评审日期]
