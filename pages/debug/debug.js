// pages/debug/debug.js
Page({
  data: {},
  onLoad() {
    wx.showToast({
      title: 'Debug page',
      icon: 'none'
    })
    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  }
})
