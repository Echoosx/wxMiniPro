const app = getApp();
const config="https://www.zamonia.cn/Flea/"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 商品
    file:{
      name:"",
      count:0,
      unit:"",
      classify:"请选择",
      price:0,
      message:"",
      url: "img_plus.png",
    },

    classify:[
      "书籍",
      "日用百货",
      "户外",
      "电子产品",
      "桌上用品",
      "其他"
    ],

    valueNull:"",
    selectCss:"gray",
    submitting:false,
    orignUrl:""
  },

  /**
   * @author 张尔爽 on 2019/4/27
   * @apiNote 生成openid后五位与时间戳组合的字符串，防止图片重名
   */
  createTimeStamp: function () {
    var timeStamp = app.globalData.openid.slice(-5) +"_"+ parseInt(new Date().getTime() / 1000);
    return timeStamp;
  },

  /**
   * @author 张尔爽 on 2019/4/27
   * @apiNote 上传图片
   */
  doUpload:function(){
    var that = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        that.setData({
          "file.url": filePath,
        })
        wx.hideLoading();
      },
      fail: e => {
        console.error(e)
      }
    })
  },

  /**
   * @author 张尔爽 on 2019/5/6
   * @apiNote 修改种类
   */
  bindChangeClassify(){
    var that = this;
    var classifyLib={
      0:"书籍",
      1:"日用百货",
      2:"户外",
      3:"电子产品",
      4:"桌上用品",
      5:"其他",
    }
    wx.showActionSheet({
      itemList: ['书籍','日用百货','户外','电子产品','桌上用品','其他'],
      success(res){
        that.setData({
          "file.classify": classifyLib[res.tapIndex],
          "selectCss": "black"
        })
      }
    })
  },

  /**
   * @author 张尔爽 on 2019/5/6
   * @apiNote 输入检查
   * @param e,包含form内容e.detail.value.xxx
   */
  checkInput(e){
    // 登录检查
    if(!app.globalData.logged){
      wx.showToast({
        icon: 'none',
        title: '请登录',
      })
      return false;
    }
    // 名称非空
    if(e.detail.value.name==''){
      wx.showToast({
        icon:'none',
        title: '请输入商品名称',
      })
      return false;
    }
    // 数量非空
    if(e.detail.value.count==''){
      wx.showToast({
        icon: 'none',
        title: '请输入商品数量',
      })
      return false;
    }
    // 数量格式
    if (isNaN(e.detail.value.count)) {
      wx.showToast({
        icon: 'none',
        title: '请正确输入商品数量',
      })
      return false;
    }
    // 数量不得小于1
    if (parseInt(e.detail.value.count)<=0) {
      wx.showToast({
        icon: 'none',
        title: '商品数量不得小于1',
      })
      return false;
    }
    // 输入单位非空
    if (e.detail.value.unit == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入商品数量单位',
      })
      return false;
    }
    // 种类非空
    if (this.data.file.classify=="请选择") {
      wx.showToast({
        icon: 'none',
        title: '请选择商品种类',
      })
      return false;
    }
    // 价格非空
    if (e.detail.value.price == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入商品价格',
      })
      return false;
    }
    // 价格格式正确
    if (isNaN(e.detail.value.price)) {
      wx.showToast({
        icon: 'none',
        title: '请正确输入商品价格',
      })
      return false;
    }
    // 价格下限
    if (parseFloat(e.detail.value.price) < 0) {
      wx.showToast({
        icon: 'none',
        title: '商品价格不得为负',
      })
      return false;
    }
    // 价格上限
    if (parseFloat(e.detail.value.price) > 99999.9) {
      wx.showToast({
        icon: 'none',
        title: '商品单价不得超过99999.9元',
      })
      return false;
    }
    // 是否添加图片检查
    if(this.data.file.url=='img_plus.png'){
      wx.showToast({
        icon: 'none',
        title: '请添加商品图片',
      })
      return false;
    }
    return true;
  },

  /**
   * @author 张尔爽 on 2019/5/6
   * @apiNote 确认发布
   * @param 触发确认发布的事件e
   */
  onSubmit(e){
    if(!this.checkInput(e)){
      return
    }
    wx.request({
      url: config + 'getSellerdata.action',
      data: {
        key: 0,
        openid: app.globalData.openid
      }, success(res) {
        // 个人信息不完善不允许发布商品
        if(!res.data){
          wx.showToast({
            icon:'none',
            title: '个人信息不完善',
          })
          return;
        }
      }
    })
    this.setData({
      "submitting":true,
    })
    this.data.file.name=e.detail.value.name;
    this.data.file.count=e.detail.value.count;
    this.data.file.unit = e.detail.value.unit;
    this.data.file.price = e.detail.value.price;
    this.data.file.message = e.detail.value.message;

    wx.showLoading({
      title: '发布中',
    })
    this.doSubmit();
  },

  /**
   * @author 张尔爽 on 2019/5/6
   * @apiNote 发布商品的后台数据库操作
   */
  doSubmit: function () {
    var that = this;
    wx.uploadFile({
      url: config + 'upload.action',
      filePath: that.data.file.url,
      name: "image",
      header: {
        "content-type": "application/json"
      },
      formData: {
        "timestamp": that.createTimeStamp(),
      },
      success(res) {
        var data = JSON.parse(res.data)
        wx.request({
          url: config + 'addGoods.action',
          data: {
            openid: app.globalData.openid,
            name: that.data.file.name,
            count: that.data.file.count,
            unit: that.data.file.unit,
            price: that.data.file.price,
            classify: that.data.file.classify,
            message: that.data.file.message,
            url: data.url
          },
          success(res){
            console.log("数据库goodsinfo增加商品成功,gid:",res.data.gid);
            that.onReset();
            wx.hideLoading();
            wx.showToast({
              title: '发布成功',
            })
          }
        })
      }
    })
  },

  /**
   * @author 张尔爽 on 2019/5/6
   * @apiNote 清空发布商品页面
   */
  onReset(){
    this.setData({
      "valueNull": "",
      "file.url":"img_plus.png",
      "file.classify":"请选择",
      "selectCss":"gray",
      "submitting":false
    })
  }
})