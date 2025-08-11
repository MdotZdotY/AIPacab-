// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  
  switch (action) {
    case 'add':
      return await addVocabulary(data)
    case 'get':
      return await getVocabulary(data)
    case 'update':
      return await updateVocabulary(data)
    case 'delete':
      return await deleteVocabulary(data)
    case 'batchAdd':
      return await batchAddVocabulary(data)
    case 'getByCategory':
      return await getVocabularyByCategory(data)
    default:
      return {
        success: false,
        error: '未知操作类型'
      }
  }
}

// 添加单个词汇
async function addVocabulary(data) {
  try {
    const result = await db.collection('vocabulary').add({
      data: {
        ...data,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return {
      success: true,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取词汇列表
async function getVocabulary(data) {
  try {
    const { page = 1, pageSize = 20, category } = data || {}
    let query = db.collection('vocabulary')
    
    if (category) {
      query = query.where({
        category: category
      })
    }
    
    const result = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get()
    
    return {
      success: true,
      data: result.data,
      total: result.data.length
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 更新词汇
async function updateVocabulary(data) {
  try {
    const { _id, ...updateData } = data
    const result = await db.collection('vocabulary').doc(_id).update({
      data: {
        ...updateData,
        updateTime: db.serverDate()
      }
    })
    return {
      success: true,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 删除词汇
async function deleteVocabulary(data) {
  try {
    const { _id } = data
    const result = await db.collection('vocabulary').doc(_id).remove()
    return {
      success: true,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 批量添加词汇
async function batchAddVocabulary(data) {
  try {
    const { words } = data
    const batchData = words.map(word => ({
      ...word,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }))
    
    const result = await db.collection('vocabulary').add({
      data: batchData
    })
    
    return {
      success: true,
      data: result,
      count: words.length
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 按分类获取词汇
async function getVocabularyByCategory(data) {
  try {
    const { category } = data
    const result = await db.collection('vocabulary')
      .where({
        category: category
      })
      .get()
    
    return {
      success: true,
      data: result.data,
      count: result.data.length
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
