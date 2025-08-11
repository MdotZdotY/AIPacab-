Component({
  data: {
    selected: 0
  },
  methods: {
    switchTab(index) {
      this.setData({ selected: index })
    },
    onSwitch(e) {
      const path = e.currentTarget.dataset.path
      const map = ['/pages/index/index','/pages/study/study','/pages/manage/manage','/pages/papers/papers','/pages/stats/stats']
      const index = map.indexOf(path)
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})


