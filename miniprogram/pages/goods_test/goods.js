// pages/goods/goods.js
const app = getApp();
const config="https://www.zamonia.cn/Flea/";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    gid: "",      //商品编号
    goods: {},    //json格式商品数据
    seller:{},    //json格式卖家数据
    num:1,        //默认订单数
    hidden_order:true,    //订单确认框默认隐藏
    hidden_seller: true   //卖家信息框默认隐藏
  },

  /**
   * @author 张尔爽 on 2019/5/6
   * @apiNote 监听页面加载--获取商品gid，查询确认编号商品的全部信息
   * @param options 包含查询字符串：商品编号gid
   */
  onLoad: function(options) {
    this.data.gid=options.gid;
    this.onGoodsMessageGet();
  },

  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote  从数据库中获取该商品所有信息
   */
  onGoodsMessageGet: function() {
    var that=this;
    wx.request({
      url: config+'showGoodsinfo.action',
      data:{
        gid:that.data.gid,
      },
      success(res){
        if(res.data.success){
          that.setData({
            "goods": res.data.result,
            "goods.frac": res.data.result.price * 10 % 10,
            "goods.price": Math.floor(res.data.result.price)
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '获取失败',
          })
        }
        
      }
    })
  },

  /**
   * @author 张尔爽 on 2019/5/10
   * @apiNote  商品加入收藏
   */
  onCollect: function() {
    var that=this;
    // 登录检查
    if (!app.globalData.logged) {
      wx.showToast({
        icon: 'none',
        title: '您还没有登录',
      })
      return;
    }
    wx.request({
      url: config+'addCollect.action',
      data:{
        openid:app.globalData.openid,
        gid:that.data.gid
      },success(res){
        if (res.data.success) {
          wx.showToast({
            title: '收藏成功',
            duration: 1000
          })
        }
        // 收藏失败说明该用户已经收藏过该商品
        else {
          wx.showToast({
            icon: "none",
            title: '不能重复收藏',
            duration: 1000
          })
        }
      }
    })
  },

  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote 获取卖家信息
   */
  getSeller:function(){
    var that=this;
    wx.request({
      url: config +'getSellerdata.action',
      data:{
        key:1,
        openid:that.data.goods.openid
      },success(res){
        that.setData({
          "seller": res.data.sellerdata,
          "hidden_seller":false
        })
      }
    })
  },
  
  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote 卖家信息框的确认和取消按钮功能，关闭信息框
   */
  confirm:function(){
    this.setData({
      "hidden_seller":true
    })
  },

  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote 向卖家拨打电话
   */
  phoneCall(){
    var that=this;
    wx.makePhoneCall({
      phoneNumber: that.data.seller.phonenumber
    })
  },

  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote 将卖家信息加入手机通讯录
   */
  addContact(){
    var that=this;
    wx.addPhoneContact({
      firstName: that.data.seller.name,
      mobilePhoneNumber:that.data.seller.phonenumber
    })
  },

  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote 提交订单
   */
  addOrder(){
    if (!app.globalData.logged) {
      wx.showToast({
        icon: 'none',
        title: '您还没有登录',
      })
      return;
    }
    this.setData({
      "hidden_order":false
    })
  },

  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote 实时获取用户输入的订单数
   * @param 订单数量的输入框键入事件e（包含用户输入的订单数e.detail.value）
   */
  getNum(e){
    this.setData({
      "num":e.detail.value
    })
  },

  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote 用户输入订单数后确认
   */
  orderConfirm(){
    var that=this;
    // 判断用户输入的数量，不能多于库存
    if(that.data.num>that.data.goods.count){
      wx.showToast({
        icon:'none',
        title: '比库存还多＞﹏＜',
      })
      return;
    }
    // 隐藏订单输入弹窗
    this.setData({
      "hidden_order": true
    })
    wx.request({
      url: config + 'addOrder.action',
      data: {
        openid: app.globalData.openid,
        gid: that.data.gid,
        num: that.data.num
      },success(res){
        if(res.data.success){
          wx.showToast({
            title: '下单成功',
          })
          //默认订单数重置为1
          that.setData({
            num:1
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '下单失败',
          })
        }
      }
    })

  },

  /**
   * @author 张尔爽 on 2019/5/17
   * @apiNote 用户打开订单弹窗后点击取消，弹窗关闭
   */
  orderCancel(){
    this.setData({
      "hidden_order": true
    })
  },

  /**
   * @author 张尔爽 on 2019/5/26
   * @apiNote 用户点击商品图片预览
   * @param 用户点击图片事件e（包含图片url：e.currentTarget.dataset.url）
   */
  previewPic(e){
    wx.previewImage({
      urls: [e.currentTarget.dataset.url],
    })
  }
})