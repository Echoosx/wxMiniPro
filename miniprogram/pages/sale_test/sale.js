// pages/sale/sale.js
const app = getApp();
const config = "https://www.zamonia.cn/Flea/";
var _animation;
var _animationIndexList = [];
const _ANIMATION_TIME = 200;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    onsaleList: [],//在售商品订单列表

    ordernoaccList: [],//未处理订单刘表
    orderaccList: [],//已接受订单列表
    orderrejList: [],//已拒绝订单列表

    logged: false,//标记用户登录状态
    onsale: true,
    orderChoose: 0,//标记，用于切换未处理 已接受 已拒绝页面
    buyer:{},//存储买家信息列表
    hidden_seller: true//标记买家信息弹出框显示或隐藏
  },

  /**
   * @author 黄伟 2019/5/6
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    _animation = wx.createAnimation({
      duration: _ANIMATION_TIME,
      timingFunction: 'linear', // "linear","ease","ease-in","ease-in-out","ease-out","step-start","step-end"
      delay: 0,
      transformOrigin: '50% 50% 0'
    })
  },

  /**
   * @author 黄伟 on 2019/5/6
   * @apiNote 监听页面显示
   */
  onShow: function() {
    // 同步登录状态
    if (this.data.logged != app.globalData.logged) {
      this.setData({
        "logged": app.globalData.logged
      })
    }
    //登录状态时进行新查询
    if (app.globalData.logged == true) {
      this.onGetGoodsOnsale();
      this.getAcceptOrder();
      this.getNoAcceptOrder();
      this.getRejectOrder();
    }
    this.setData({
      "control_show": true,
      "control": "管理",
      "onsale": true
    })
  },

  /**
   * @author 黄伟 on 2019/5/7
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.onShow();
    //模拟加载
    setTimeout(function() {
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 700);
    this.onGetGoodsOnsale();
    this.getAcceptOrder();
    this.getNoAcceptOrder();
    this.getRejectOrder();
  },



   /**
   * @author 黄伟 on 2019/5/7
   * @apiNote 读取正在销售的商品所有信息
   */
  onGetGoodsOnsale() {
    var that = this;
    wx.request({
      url: config + 'getOnsale.action',
      data: {
        openid: app.globalData.openid
      },
      success(res) {
        that.setData({
          "onsaleList": res.data
        })

        //用于显示在售栏中 未处理愿望箭头
        var i = 0;
        _animationIndexList = [];
        for (i = 0; i < that.data.onsaleList.length; i++) {
          _animationIndexList.push(0);
          that.rotate(i, 0);
        }
        that.getGoodsOrder(res.data)
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/8
   * @apiNote 下架商品
   * @param 点击下架商品按钮的事件e
   */
  onDeleteOrder: function(e) {
    var that = this;
    wx.showModal({
      title: '下架商品',
      content: '商品下架后不可恢复，您确定要下架此商品吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在下架',
          })
          wx.request({
            url: config + 'deleteOnsale.action',
            data: {
              openid: app.globalData.openid,
              gid: e.currentTarget.dataset.gid
            },
            success(res) {
              if (res.data.success) {
                wx.hideLoading();
                wx.showToast({
                  title: '操作成功',
                })
                that.onGetGoodsOnsale();
              } else {
                wx.showToast({
                  icon: 'none',
                  title: '操作失败',
                })
              }
            }
          })
        }
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/9
   * @apiNote 跳转到修改商品页面
   * @param 点击修改商品按钮的事件e
   */
  onChangeOrder(e) {
    wx.navigateTo({
      url: "/pages/revise_test/revise?gid=" + e.currentTarget.dataset.gid,
    })
  },

/**
   * @author 黄伟 on 2019/5/16
   * @apiNote 设置标记以便 在售信息，有人想买 之间的切换
   */
  onSale() {
    this.setData({
      "onsale": true
    })
  },

/**
   * @author 黄伟 on 2019/5/16
   * @apiNote 设置标记以便 在售信息，有人想买 之间的切换
   */
  onOrder() {
    this.setData({
      "onsale": false
    })
  },

  /**
   * @author 黄伟 on 2019/5/15
   * @apiNote 获取未处理订单
   */
  getNoAcceptOrder() {
    var that = this;
    wx.request({
      url: config + 'getSellerOrder.action',
      data: {
        key: 0,
        openid: app.globalData.openid
      },
      success(res) {
        that.setData({
          "ordernoaccList": res.data
        })
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/15
   * @apiNote 获取已接受订单
   */
  getAcceptOrder() {
    var that = this;
    wx.request({
      url: config + 'getSellerOrder.action',
      data: {
        key: 1,
        openid: app.globalData.openid
      },
      success(res) {
        that.setData({
          "orderaccList": res.data
        })
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/15
   * @apiNote 获取已拒绝订单
   */
  getRejectOrder() {
    var that = this;
    wx.request({
      url: config + 'getSellerOrder.action',
      data: {
        key: 2,
        openid: app.globalData.openid
      },
      success(res) {
        that.setData({
          "orderrejList": res.data
        })
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/15
   * @apiNote 从数据库读取单个商品名下的订单信息
   * @param 商品列表
   */
  getGoodsOrder(list) {
    var that = this;
    var i = 0,
      j = 0;
    var templist = [];
    for (i = 0; i < list.length; i++) {
      wx.request({
        url: config + 'getGoodsOrder.action',
        data: {
          gid: list[i].gid
        },
        success(res) {
          templist.push(res.data);
          if (templist.length == i) {
            for (i = 0; i < that.data.onsaleList.length; i++) {
              var order_1 = "onsaleList[" + i + "].order";
              that.setData({
                [order_1]: []
              })
              for (j = 0; j < templist.length; j++) {
                if (templist[j].length > 0 && that.data.onsaleList[i].gid == templist[j][0].gid) {
                  var order_2 = "onsaleList[" + i + "].order";
                  that.setData({
                    [order_2]: templist[j]
                  })
                }
              }
            }
          }
        }
      })
    }
  },

  /**
   * @author 黄伟 on 2019/5/12
   * @apiNote 接受订单
   * @param 包含点击接受订单按钮的事件e
   */
  acceptOrder(e) {
    var that = this;
    wx.showModal({
      title: '接受愿望',
      content: '确定要接受该愿望吗',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: config + 'acceptOrder.action',
            data: {
              oid: e.currentTarget.dataset.oid
            },
            success(res) {
              if (res.data.success) {
                wx.showToast({
                  title: '已接受该愿望',
                })
                that.getNoAcceptOrder();
                that.getRejectOrder();
                that.getAcceptOrder();
                that.getGoodsOrder(that.data.onsaleList);
              } else {
                wx.showToast({
                  icon: 'none',
                  title: '接受愿望失败',
                })
              }
            }
          })
        } else {
          return;
        }
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/12
   * @apiNote 拒绝订单
   * @param 包含点击拒绝订单按钮的事件e
   */
  rejectOrder(e) {
    var that = this;
    wx.showModal({
      title: '拒绝愿望',
      content: '确定要拒绝该愿望吗',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: config + 'rejectOrder.action',
            data: {
              openid: app.globalData.openid,
              oid: e.currentTarget.dataset.oid
            },
            success(res) {
              if (res.data.success) {
                wx.showToast({
                  title: '已拒绝该愿望',
                })
                that.getNoAcceptOrder();
                that.getRejectOrder();
                that.getGoodsOrder(that.data.onsaleList);
              } else {
                wx.showToast({
                  icon: 'none',
                  title: '拒绝愿望失败',
                })
              }
            }
          })
        } else {
          return;
        }
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/16
   * @apiNote 用于 未处理愿望箭头的旋转
   * @param i用于标记第几件商品的箭头
   * @param n代表旋转的圈数
   */
  rotate: function(i, n) {
    //顺时针旋转180度
    _animation.rotate(180 * n).step()
    var animation = "onsaleList[" + i + "].animation";
    this.setData({
      //输出动画
      [animation]: _animation.export()
    })
  },

  /**
   * @author 黄伟 on 2019/5/16
   * @apiNote 显示商品名下订单信息
   * @param 点击未处理愿望箭头触发事件
   */
  showGoodsOrder(e) {
    var i = e.currentTarget.dataset.index;
    _animationIndexList[i]++;
    this.rotate(i, _animationIndexList[i]);
    var show = "onsaleList[" + i + "].show";
    if (this.data.onsaleList[i].show == true) {
      this.setData({
        [show]: false
      })
    } else {
      this.setData({
        [show]: true
      })
    }
  },

  /**
   * @author 黄伟 on 2019/5/16
   * @apiNote 切换 未处理 已接受 已拒绝页面
   * @param 点击切换订单种类的事件e
   */
  orderChange(e) {
    var choose = parseInt(e.currentTarget.dataset.choose);
    this.setData({
      orderChoose: choose
    })
  },

  /**
   * @author 黄伟 on 2019/5/15
   * @apiNote 在已接受订单页面获取买家信息
   * @param 点击买家姓名的事件e
   */
  getBuyer: function(e) {
    var that = this;
    wx.request({
      url: config + 'getAddress.action',
      data: {
        key: 1,
        openid: e.currentTarget.dataset.openid
      },
      success(res) {
        that.setData({
          "buyer": res.data,
          "hidden_seller": false
        })
      }
    })
  },

  /**
   * @author 黄伟 on 2019/5/16
   * @apiNote 用于点击 拒绝订单 接受订单 下架商品 按钮后弹出确认信息
   */
  confirm: function() {
    this.setData({
      "hidden_seller": true
    })
  },

  /**
   * @author 黄伟 on 2019/5/16
   * @apiNote 拨打买家电话
   */
  phoneCall() {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.buyer.telNumber
    })
  },

  /**
   * @author 黄伟 on 2019/5/16
   * @apiNote 将买家添加到本机联系人
   */
  addContact() {
    var that = this;
    wx.addPhoneContact({
      firstName: that.data.buyer.userName,
      mobilePhoneNumber: that.data.buyer.telNumber
    })
  },

})