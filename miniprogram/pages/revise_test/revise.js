// pages/revise/revise.js
const app = getApp();
const config = "https://www.zamonia.cn/Flea/";
var chooseImage=false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
   
    classify: [
      "书籍",
      "日用百货",
      "户外",
      "电子产品",
      "桌上用品",
      "其他"
    ],

    selectCss: "black",//类别选择格式
    gid:"",
    goods: {},//商品所有信息列表
    submitting:false,//标记是否提交修改
    orignUrl:""//商品原始图片url
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.gid = options.gid;
    this.onGoodsMessageGet();
  },

   /**
   * @author 黄伟 on 2019/5/10
   * @apiNote 从数据库中获取商品所有信息
   */
  onGoodsMessageGet:function(){
    var that = this;
    wx.request({
      url: config + 'showGoodsinfo.action',
      data: {
        gid: that.data.gid,
      },
       success(res) {
         if(res.data.success){
           that.setData({
             "goods": res.data.result
           })
         }else{
           wx.showToast({
             icon:'none',
             title: '获取失败'
           })
         }  
        }
    })
  },
 
  // 生成时间戳
  createTimeStamp: function () {
    var timeStamp = app.globalData.openid.slice(-5) + "_" + parseInt(new Date().getTime() / 1000);
    return timeStamp;
  },
 
  /**
   * @author 黄伟 on 2019/5/11
   * @apiNote 修改商品图片
   */
  doRevise: function () {
    var that = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        chooseImage=true;
        that.data.orignUrl=that.data.goods.url;
        wx.showLoading({
          title: '修改中',
        })
        const filePath = res.tempFilePaths[0]
        that.setData({
          "goods.url": filePath,
        })
        wx.hideLoading();
      },
      fail: e => {
        console.error(e)
      }
    })
  },


  /**
   * @author 黄伟 on 2019/5/11
   * @apiNote 修改商品类型
   */
  bindChangeClassify() {
    var that = this;
    var classifyLib = {
      0: "书籍",
      1: "日用百货",
      2: "户外",
      3: "电子产品",
      4: "桌上用品",
      5: "其他",
    }
    wx.showActionSheet({
      itemList: ['书籍', '日用百货', '户外', '电子产品', '桌上用品', '其他'],
      success(res) {
        that.setData({
          "file.classify": classifyLib[res.tapIndex],
          "selectCss": "black"
        })
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/11
   * @apiNote 输入检查
   * @param 包含input内容的事件e
   */
  checkInput(e) {
    if (e.detail.value.name == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入商品名称',
      })
      return false;
    }
    if (e.detail.value.count == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入商品数量',
      })
      return false;
    }
    if (isNaN(e.detail.value.count)) {
      wx.showToast({
        icon: 'none',
        title: '请正确输入商品数量',
      })
      return false;
    }
    if (parseInt(e.detail.value.count) <= 0) {
      wx.showToast({
        icon: 'none',
        title: '商品数量不得小于1',
      })
      return false;
    }
    if (e.detail.value.unit == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入商品数量单位',
      })
      return false;
    }
    if (this.data.goods.classify == "请选择") {
      wx.showToast({
        icon: 'none',
        title: '请选择商品种类',
      })
      return false;
    }
    if (e.detail.value.price == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入商品价格',
      })
      return false;
    }
    if (isNaN(e.detail.value.price)) {
      wx.showToast({
        icon: 'none',
        title: '请正确输入商品价格',
      })
      return false;
    }
    if (parseFloat(e.detail.value.price) < 0) {
      wx.showToast({
        icon: 'none',
        title: '商品价格不得为负',
      })
      return false;
    }
    if (parseFloat(e.detail.value.price) > 99999) {
      wx.showToast({
        icon: 'none',
        title: '商品单价不得超过99999元',
      })
      return false;
    }
    if (this.data.goods.url == 'loading.gif') {
      wx.showToast({
        icon: 'none',
        title: '请添加商品图片',
      })
      return false;
    }
    return true;
  },

  /**
   * @author 黄伟 on 2019/5/11
   * @apiNote 确认修改
   * @param 包含点击修改按钮的事件e
   */
  onSubmit(e) {
    if (!this.checkInput(e)) {
      return
    }
    this.setData({
      "submitting": true,
    })
    this.data.goods.name = e.detail.value.name;
    this.data.goods.count = e.detail.value.count;
    this.data.goods.unit = e.detail.value.unit;
    this.data.goods.price = e.detail.value.price;
    this.data.goods.message = e.detail.value.message;

    wx.showLoading({
      title: '修改中',
    })
    this.doSubmit();
  },

  /**
   * @author 黄伟 on 2019/5/11
   * @apiNote 数据库修改操作
   */
  doSubmit: function () {
    var that = this;
    if(chooseImage){
      wx.uploadFile({
        url: config + 'upload.action',
        filePath: that.data.goods.url,
        name: "image",
        header: {
          "content-type": "application/json"
        },
        formData: {
          "timestamp": that.createTimeStamp(),
        },
        success(res) {
          var data = JSON.parse(res.data);
          wx.request({
            url: config + 'updateOnsale.action',
            data: {
              openid: app.globalData.openid,
              gid: that.data.gid,
              name: that.data.goods.name,
              count: that.data.goods.count,
              unit: that.data.goods.unit,
              price: that.data.goods.price,
              classify: that.data.goods.classify,
              message: that.data.goods.message,
              url: data.url
            },
            success(res) {
              wx.hideLoading();
              if (res.data.success) {
                wx.showToast({
                  title: '修改成功',
                  duration:1000
                })
                setTimeout(function () {
                  wx.navigateBack({

                  })
                }, 1200)
              } else {
                wx.showToast({
                  icon: 'none',
                  title: '修改失败',
                })
              }
            }
          })
        }
      })
      wx.request({
        url: config+'deletePic.action',
        data:{
          openid:app.globalData.openid,
          url: that.data.orignUrl,
        }
      })
    }else{
      wx.request({
        url: config + 'updateOnsale.action',
        data: {
          openid: app.globalData.openid,
          gid: that.data.gid,
          name: that.data.goods.name,
          count: that.data.goods.count,
          unit: that.data.goods.unit,
          price: that.data.goods.price,
          classify: that.data.goods.classify,
          message: that.data.goods.message,
          url: that.data.goods.url
        },
        success(res) {
          wx.hideLoading();
          if (res.data.success) {
            wx.showToast({
              title: '修改成功',
              duration:1000
            })
            setTimeout(function () {
              wx.navigateBack({
                
              })
            }, 1200)
          } else {
            wx.showToast({
              icon: 'none',
              title: '修改失败',
            })
          }
        }
      })
    }
  }
})