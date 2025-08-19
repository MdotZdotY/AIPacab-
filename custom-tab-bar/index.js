Component({
  data: {
    selected: 0
  },
  
  lifetimes: {
    attached() {
      // 组件初始化时，根据当前页面路径设置选中状态
      const pages = getCurrentPages()
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        const currentPath = '/' + currentPage.route
        const map = ['/pages/index/index','/pages/study/study','/pages/manage/manage','/pages/papers/papers','/pages/stats/stats']
        const index = map.indexOf(currentPath)
        if (index !== -1) {
          this.setData({ selected: index })
        }
      }
    }
  },
  
  methods: {
    switchTab(index) {
      this.setData({ selected: index })
    },
    onSwitch(e) {
      const path = e.currentTarget.dataset.path
      const map = ['/pages/index/index','/pages/study/study','/pages/manage/manage','/pages/papers/papers','/pages/stats/stats']
      const index = map.indexOf(path)
      
      // 立即更新选中状态
      this.setData({ selected: index })
      
      // 跳转到对应页面
      wx.switchTab({ 
        url: path,
        success: () => {
          console.log('标签栏切换成功，当前选中:', index)
        },
        fail: (err) => {
          console.error('标签栏切换失败:', err)
        }
      })
    }
  }
})


