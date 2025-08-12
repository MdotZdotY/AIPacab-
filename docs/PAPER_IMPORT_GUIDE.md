# 论文导入工具使用指南

## 概述

论文导入工具 (`paper_importer.js`) 是一个自动化工具，用于将新的论文文件从 `vocabulary` 目录导入到小程序中。该工具能够：

1. 自动扫描 `vocabulary` 目录中的新论文文件
2. 解析论文摘要文件 (`*_Sum.txt`) 和词汇文件 (`*_Voca.txt`)
3. 将论文信息添加到论文数据表
4. 将词汇数据添加到词汇库
5. 生成详细的导入报告

## 文件格式要求

### 论文摘要文件 (`*_Sum.txt`)
文件应包含以下结构：
```
论文原文链接：https://arxiv.org/abs/xxxx.xxxxx
论文名：论文标题

### 论文背景
论文背景内容...

### 论文关键概念
关键概念内容...

### 论文亮点
论文亮点内容...
```

### 词汇文件 (`*_Voca.txt`)
文件应包含以下结构：
```
论文原文链接：https://arxiv.org/abs/xxxx.xxxxx
论文名：论文标题

### **GRE高频词**

* **单词1**
    * **英文释义**: 英文释义内容
    * **中文释义**: 中文释义内容
    * **词性**: 词性
    * **音标**: 音标
    * **在论文中的例句 (英文)**: 例句内容
    * **例句中文翻译**: 例句翻译

### **TOEFL高频词**
...

### **AI专业词汇**
...
```

## 使用方法

### 1. 准备论文文件
将新的论文文件放入 `vocabulary` 目录：
- 论文摘要文件：`论文名_Sum.txt`
- 词汇文件：`论文名_Voca.txt`

### 2. 运行导入工具

#### 方法一：直接运行
```bash
node paper_importer.js
```

#### 方法二：在代码中使用
```javascript
const PaperImporter = require('./paper_importer.js')

const importer = new PaperImporter()
importer.importNewPapers()
  .then(report => {
    console.log('导入完成:', report)
    importer.generateReport()
  })
  .catch(error => {
    console.error('导入失败:', error)
  })
```

### 3. 测试工具功能
```bash
node test_paper_importer.js
```

## 导入流程

1. **扫描文件**：自动扫描 `vocabulary` 目录，识别完整的论文文件对
2. **解析摘要**：解析 `*_Sum.txt` 文件，提取论文背景、关键概念、亮点等信息
3. **解析词汇**：解析 `*_Voca.txt` 文件，提取词汇数据
4. **更新论文数据**：将论文信息添加到 `utils/papersData.js`
5. **更新词汇数据**：将词汇数据添加到 `app.js` 的 `globalData.words`
6. **生成报告**：生成详细的导入报告

## 输出文件

### 导入报告
工具会在项目根目录生成导入报告文件：
- 文件名格式：`PAPER_IMPORT_REPORT_YYYY-MM-DD.md`
- 包含导入时间、汇总信息、成功/失败详情

### 更新的文件
- `utils/papersData.js`：新增论文信息
- `app.js`：新增词汇数据

## 错误处理

工具具有完善的错误处理机制：

1. **文件缺失**：如果论文缺少摘要文件或词汇文件，会记录警告
2. **解析错误**：如果文件格式不正确，会记录具体错误信息
3. **重复数据**：自动检测并跳过已存在的论文和词汇
4. **部分失败**：即使部分论文导入失败，其他论文仍会继续处理

## 注意事项

1. **备份数据**：运行导入工具前，建议备份 `app.js` 和 `utils/papersData.js`
2. **文件格式**：确保论文文件格式符合要求
3. **编码格式**：文件应使用 UTF-8 编码
4. **文件命名**：文件名必须包含 `_Sum.txt` 或 `_Voca.txt` 后缀
5. **重复检查**：工具会自动检查重复数据，但建议手动确认

## 示例

### 输入文件结构
```
vocabulary/
├── AttentionIsAllYouNeed_Sum.txt
├── AttentionIsAllYouNeed_Voca.txt
├── NewPaper_Sum.txt
└── NewPaper_Voca.txt
```

### 运行结果
```
=== 开始执行论文导入流程 ===
=== 开始扫描vocabulary目录 ===
找到 2 个完整的论文文件对
--- 处理论文: NewPaper ---
解析摘要文件: NewPaper_Sum.txt
解析词汇文件: NewPaper_Voca.txt
更新论文数据: New Paper Title
论文 "New Paper Title" 已添加到论文数据表
更新词汇数据: 25 个词汇
25 个新词汇已添加到词汇库
论文 "NewPaper" 处理完成
=== 导入流程完成 ===
```

## 故障排除

### 常见问题

1. **找不到词汇数组**
   - 检查 `app.js` 文件中的 `globalData.words` 数组是否存在
   - 确保文件格式正确

2. **解析失败**
   - 检查文件编码是否为 UTF-8
   - 确认文件格式符合要求
   - 查看具体的错误信息

3. **重复导入**
   - 工具会自动跳过已存在的论文和词汇
   - 如需重新导入，请先删除现有数据

### 调试模式
运行测试脚本可以验证工具功能：
```bash
node test_paper_importer.js
```

## 更新日志

- v1.0：初始版本，支持基本的论文和词汇导入功能
- 支持自动扫描、解析、更新和报告生成
- 完善的错误处理和重复检测机制
