# 云开发使用指南

## 概述

本项目已集成微信小程序云开发功能，支持词汇数据的云端存储和同步。

## 配置步骤

### 1. 开通云开发

1. 登录微信公众平台
2. 进入小程序管理后台
3. 点击"开发"→"开发管理"→"云开发"
4. 开通云开发服务
5. 创建云环境，记录环境ID

### 2. 更新环境ID

在 `app.js` 文件中，将 `your-env-id` 替换为你的实际云环境ID：

```javascript
wx.cloud.init({
  env: 'your-actual-env-id', // 替换为你的环境ID
  traceUser: true,
})
```

### 3. 部署云函数

1. 在微信开发者工具中，右键点击 `cloudfunctions/vocabularyManager` 文件夹
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

## 云数据库集合

### vocabulary 集合

存储词汇数据的集合，包含以下字段：

- `_id`: 文档ID（自动生成）
- `word`: 词汇
- `meaning`: 含义
- `pronunciation`: 音标
- `sentence`: 例句
- `translation`: 翻译
- `category`: 分类
- `paperTitle`: 来源论文
- `difficulty`: 难度等级
- `studyCount`: 学习次数
- `correctCount`: 正确次数
- `lastStudyTime`: 最后学习时间
- `status`: 学习状态
- `weeklyStudyCount`: 周学习次数
- `createTime`: 创建时间
- `updateTime`: 更新时间

## 云函数API

### vocabularyManager 云函数

支持以下操作：

#### 1. 添加单个词汇
```javascript
wx.cloud.callFunction({
  name: 'vocabularyManager',
  data: {
    action: 'add',
    data: {
      word: 'example',
      meaning: '示例',
      // ... 其他字段
    }
  }
})
```

#### 2. 获取词汇列表
```javascript
wx.cloud.callFunction({
  name: 'vocabularyManager',
  data: {
    action: 'get',
    data: {
      page: 1,
      pageSize: 20,
      category: 'GRE高频词' // 可选
    }
  }
})
```

#### 3. 更新词汇
```javascript
wx.cloud.callFunction({
  name: 'vocabularyManager',
  data: {
    action: 'update',
    data: {
      _id: 'document-id',
      studyCount: 5,
      // ... 其他更新字段
    }
  }
})
```

#### 4. 删除词汇
```javascript
wx.cloud.callFunction({
  name: 'vocabularyManager',
  data: {
    action: 'delete',
    data: {
      _id: 'document-id'
    }
  }
})
```

#### 5. 批量添加词汇
```javascript
wx.cloud.callFunction({
  name: 'vocabularyManager',
  data: {
    action: 'batchAdd',
    data: {
      words: [
        { word: 'word1', meaning: 'meaning1' },
        { word: 'word2', meaning: 'meaning2' }
      ]
    }
  }
})
```

#### 6. 按分类获取词汇
```javascript
wx.cloud.callFunction({
  name: 'vocabularyManager',
  data: {
    action: 'getByCategory',
    data: {
      category: 'GRE高频词'
    }
  }
})
```

## 本地方法

在 `app.js` 中已添加以下云数据库操作方法：

### 1. syncWordsToCloud()
将本地词汇数据同步到云端

### 2. getWordsFromCloud()
从云端获取词汇数据

### 3. updateWordInCloud(wordId, updateData)
更新云端词汇数据

### 4. deleteWordFromCloud(wordId)
删除云端词汇

## 使用示例

### 同步本地词汇到云端
```javascript
const app = getApp()
app.syncWordsToCloud()
```

### 从云端获取词汇
```javascript
const app = getApp()
app.getWordsFromCloud().then(words => {
  console.log('从云端获取的词汇:', words)
})
```

### 更新学习进度
```javascript
const app = getApp()
app.updateWordInCloud('word-id', {
  studyCount: 5,
  correctCount: 3,
  lastStudyTime: new Date()
})
```

## 注意事项

1. 确保云开发环境已正确配置
2. 云函数部署后需要等待几分钟才能生效
3. 注意云数据库的读写权限设置
4. 建议在开发环境中测试云函数功能
5. 生产环境中注意数据安全和备份

## 故障排除

### 云函数调用失败
- 检查云函数是否已正确部署
- 确认环境ID是否正确
- 查看云开发控制台的错误日志

### 数据库操作失败
- 检查数据库集合是否存在
- 确认数据库权限设置
- 验证数据格式是否正确

### 网络连接问题
- 检查网络连接
- 确认小程序已授权网络访问
- 查看微信开发者工具的网络面板
