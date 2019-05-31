//app.js
App({
  //小程序完成初始化时调用
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
  },
  //全局变量
  globalData: {
    image:"/images/sold.png",
    openid: null,
    logged:false
  },
})
