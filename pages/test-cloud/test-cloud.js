// pages/test-cloud/test-cloud.js
Page({
  data: {
    testResults: [],
    loading: false
  },

  onLoad() {
    console.log('云函数测试页面加载')
  },

  // 测试添加词汇
  async testAddVocabulary() {
    this.setData({ loading: true })
    try {
      const result = await wx.cloud.callFunction({
        name: 'vocabularyManager',
        data: {
          action: 'add',
          data: {
            word: 'TestWord',
            meaning: '测试词汇',
            pronunciation: '/test/',
            sentence: 'This is a test sentence.',
            translation: '这是一个测试句子。',
            category: '测试分类',
            paperTitle: '测试论文',
            difficulty: 'easy',
            studyCount: 0,
            correctCount: 0,
            status: 'learning'
          }
        }
      })
      
      this.addTestResult('添加词汇测试', result.result.success ? '成功' : '失败', result.result)
    } catch (error) {
      this.addTestResult('添加词汇测试', '失败', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 测试获取词汇
  async testGetVocabulary() {
    this.setData({ loading: true })
    try {
      const result = await wx.cloud.callFunction({
        name: 'vocabularyManager',
        data: {
          action: 'get',
          data: {
            page: 1,
            pageSize: 10
          }
        }
      })
      
      this.addTestResult('获取词汇测试', result.result.success ? '成功' : '失败', result.result)
    } catch (error) {
      this.addTestResult('获取词汇测试', '失败', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 测试批量添加
  async testBatchAdd() {
    this.setData({ loading: true })
    try {
      const result = await wx.cloud.callFunction({
        name: 'vocabularyManager',
        data: {
          action: 'batchAdd',
          data: {
            words: [
              {
                word: 'BatchTest1',
                meaning: '批量测试1',
                category: '测试分类',
                difficulty: 'easy'
              },
              {
                word: 'BatchTest2',
                meaning: '批量测试2',
                category: '测试分类',
                difficulty: 'medium'
              }
            ]
          }
        }
      })
      
      this.addTestResult('批量添加测试', result.result.success ? '成功' : '失败', result.result)
    } catch (error) {
      this.addTestResult('批量添加测试', '失败', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 测试按分类获取
  async testGetByCategory() {
    this.setData({ loading: true })
    try {
      const result = await wx.cloud.callFunction({
        name: 'vocabularyManager',
        data: {
          action: 'getByCategory',
          data: {
            category: '测试分类'
          }
        }
      })
      
      this.addTestResult('按分类获取测试', result.result.success ? '成功' : '失败', result.result)
    } catch (error) {
      this.addTestResult('按分类获取测试', '失败', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 测试本地云数据库方法
  async testLocalMethods() {
    this.setData({ loading: true })
    try {
      const app = getApp()
      
      // 测试同步到云端
      await app.syncWordsToCloud()
      this.addTestResult('本地同步到云端', '成功', '已同步本地词汇数据')
      
      // 测试从云端获取
      const words = await app.getWordsFromCloud()
      this.addTestResult('从云端获取词汇', '成功', `获取到 ${words.length} 个词汇`)
      
    } catch (error) {
      this.addTestResult('本地方法测试', '失败', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 添加测试结果
  addTestResult(testName, status, result) {
    const testResults = this.data.testResults
    testResults.push({
      name: testName,
      status: status,
      result: result,
      time: new Date().toLocaleTimeString()
    })
    this.setData({ testResults })
  },

  // 清空测试结果
  clearResults() {
    this.setData({ testResults: [] })
  },

  // 运行所有测试
  async runAllTests() {
    this.clearResults()
    await this.testAddVocabulary()
    await this.testGetVocabulary()
    await this.testBatchAdd()
    await this.testGetByCategory()
    await this.testLocalMethods()
  }
})
