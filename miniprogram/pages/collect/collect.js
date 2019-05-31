// pages/collect/collect.js
const app = getApp();
const config = "https://www.zamonia.cn/Flea/";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //列表
    collectList: [],
    orderList: [],

    //管理
    logged: false,
    collect: true,

    // 下单
    selectList: [],
    totalprice: 0,
    totalnum: 0,
    all: false,

    // 卖家
    seller:{},
    hidden_seller:true
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 监听页面显示
   */
  onShow: function() {
    // 同步登录状态
    if (this.data.logged != app.globalData.logged) {
      this.setData({
        "logged": app.globalData.logged
      })
    }
    // 登录状态时进行新查询
    if (app.globalData.logged == true) {
      this.onGetCollect();
      this.onGetOrder();
    }
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 读取收藏中商品所有信息
   */ 
  onGetCollect() {
    var that = this;
    wx.request({
      url: config + 'getCollect.action',
      data: {
        openid: app.globalData.openid,
      },
      success(res) {
        console.log("查询收藏成功，收藏数：", res.data.length);
        that.setData({
          "collectList": res.data,
        })
      }
    })
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 读取订单信息
   */
  onGetOrder(){
    var that=this;
    wx.request({
      url: config+'getBuyerOrder.action',
      data:{
        openid:app.globalData.openid,
      },
      success(res){
        console.log("查询订单成功，订单数：", res.data.length);
        that.setData({
          "orderList": res.data,
        })
      }
    })
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 删除收藏夹中的商品
   */
  onDeleteCollection: function(e) {
    var that = this;
    wx.showModal({
      title: '删除',
      content: '确认从收藏中移除该商品吗',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: config + 'deleteCollect.action',
            data: {
              openid: app.globalData.openid,
              gid: e.currentTarget.dataset.gid
            },
            success(res) {
              if (res.data.success) {
                wx.showToast({
                  title: '操作成功',
                })
                that.onGetCollect()
              } else {
                wx.showToast({
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
   * @author 王晗 on 2019/5/9
   * @apiNote 切换到收藏夹
   */
  onCart() {
    this.setData({
      "collect": true,
    })
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 切换到订单
   */
  onBuy() {
    this.setData({
      "collect": false,
    })
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 商品checkbox选中内容更改
   * @param 触发选中内容更改的事件e
   */
  checkboxChange(e) {
    var i = 0,
      total = 0;
    var selectList = [];
    // 计算总量和总价格
    for (i = 0; i < e.detail.value.length; i++) {
      var index = parseInt(e.detail.value[i]);
      total += parseFloat(this.data.collectList[index].num * this.data.collectList[index].price);
      selectList.push({
        gid: this.data.collectList[index].gid,
        num: this.data.collectList[index].num,
        index: index
      });
    }
    this.setData({
      "totalnum": e.detail.value.length,
      "totalprice": total,
    })
    this.data.selectList = selectList;
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 全选
   * @param 点击全选按钮的事件e
   */
  selectAll(e) {
    this.setData({
      "all": e.detail.value
    })
    if (e.detail.value) {
      var i = 0,
        total = 0;
      var selectList = [];
      // 计算总价格
      for (i = 0; i < this.data.collectList.length; i++) {
        total += parseFloat(this.data.collectList[i].num * this.data.collectList[i].price);
        selectList.push({
          gid: this.data.collectList[i].gid,
          num: this.data.collectList[i].num,
          index: i
        });
      }
      this.setData({
        "totalnum": this.data.collectList.length,
        "totalprice": total,
      })
      this.data.selectList = selectList;
    } else {
      // 全不选
      this.setData({
        "totalnum": 0,
        "totalprice": 0,
      })
      this.data.selectList=[];
    }
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 点击商品跳转
   * @param 点击商品的事件e（包含商品详情页面url：e.currentTarget.dataset.link）
   */
  enterGoods(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.link,
    })
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 减少商品数量
   * @param 点击减少的事件e（包含商品在列表中的下标e.currentTarget.dataset.index）
   */
  dec: function(e) {
    var index = e.currentTarget.dataset.index;
    var i = 0,
      total = 0;

    if (this.data.collectList[index].num <= 1) {
      wx.showToast({
        icon: "none",
        title: '不能再减啦',
      })
      return;
    } else {
      var num = "collectList[" + index + "].num";
      this.setData({
        [num]: this.data.collectList[index].num - 1
      })
    }

    // 计算总量和总价格
    for (i = 0; i < this.data.selectList.length; i++) {
      if (index == this.data.selectList[i].index) {
        total = parseFloat(this.data.totalprice) - parseFloat(this.data.collectList[index].price);
        var selectnum = "selectList[" + i + "].num";
        this.setData({
          "totalprice": total,
          [selectnum]: this.data.selectList[i].num - 1
        })
      }
    }
  },

  /**
   * @author 王晗 on 2019/5/9
   * @apiNote 增加商品数量
   * @param 点击增加的事件e（包含商品在列表中的下标e.currentTarget.dataset.index）
   */
  add: function(e) {
    var index = e.currentTarget.dataset.index;
    var i = 0,
      total = 0;

    if (this.data.collectList[index].num >= this.data.collectList[index].count) {
      wx.showToast({
        icon: 'none',
        title: '不能超过库存',
      })
      return;
    } else {
      var num = "collectList[" + index + "].num";
      this.setData({
        [num]: this.data.collectList[index].num + 1
      })
    }
    // 计算总量和总价格
    for (i = 0; i < this.data.selectList.length; i++) {
      if (index == this.data.selectList[i].index) {
        total = parseFloat(this.data.totalprice) + parseFloat(this.data.collectList[index].price);
        var selectnum = "selectList[" + i + "].num";
        this.setData({
          "totalprice": total,
          [selectnum]: this.data.selectList[i].num + 1
        })
      }
    }
  },

  /**
   * @author 王晗 on 2019/5/15
   * @apiNote 获取卖家信息
   * @param 事件e（包含卖家编号e.currentTarget.dataset.openid）
   */
  getSeller: function (e) {
    var that = this;
    wx.request({
      url: config + 'getSellerdata.action',
      data: {
        key:1,
        openid: e.currentTarget.dataset.openid
      }, success(res) {
        that.setData({
          "seller": res.data.sellerdata,
          "hidden_seller": false
        })
      }
    })
  },

  /**
   * @author 王晗 on 2019/5/15
   * @apiNote 卖家信息弹出框确认
   */
  confirm: function () {
    this.setData({
      "hidden_seller": true
    })
  },

  /**
   * @author 王晗 on 2019/5/15
   * @apiNote 向卖家发起通话
   */
  phoneCall() {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.seller.phonenumber
    })
  },

  /**
   * @author 王晗 on 2019/5/15
   * @apiNote 将卖家加入通讯录
   */
  addContact() {
    var that = this;
    wx.addPhoneContact({
      firstName: that.data.seller.name,
      mobilePhoneNumber: that.data.seller.phonenumber
    })
  },

  /**
   * @author 王晗 on 2019/5/15
   * @apiNote 发送订单操作
   */
  onSendOrder(e){
    var that=this;
    wx.showModal({
      title: '想买',
      content: '确定发送这些愿望吗',
      success(res) {
        if (res.confirm) {
          // 收货地址存在性检查
          wx.request({
            url: config + 'getAddress.action',
            data: {
              key: 0,
              openid: e.currentTarget.dataset.openid
            },
            success(res) {
              if (!res.data) {
                wx.showToast({
                  icon: 'none',
                  title: '没有设置收货地址',
                })
                return;
              }
            }
          })

          var i=0,templist=[];
          for(i=0;i<that.data.selectList.length;i++){
            wx.request({
              url: config+'addOrder.action',
              data:{
                openid:app.globalData.openid,
                gid:that.data.selectList[i].gid,
                num:that.data.selectList[i].num
              },success(res){
                templist.push(res.data.success);
                if(templist.length==i){
                  wx.showToast({
                    title: '愿望已经发送',
                  })
                  // 价格计算复原
                  that.setData({
                    "all": false,
                    "totalnum": 0,
                    "totalprice": 0,
                  })
                  that.onGetOrder();
                }
              }
            })
          }
        } else if (res.cancel) {
          return;
        }
      }
    })
    
  }

})