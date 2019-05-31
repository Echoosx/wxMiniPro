// pages/personal/personal.js
const app = getApp()
const config = "https://www.zamonia.cn/Flea/"

Page({
  data: {
    avatarUrl: 'https://www.zamonia.cn/statics/icon/user-unlogin.png', //未登录状态头像url
    message: "请点击头像登录", //提示信息
    // userInfo: {},
    // userData_id: '',                    //用户数据id

    //前端用户数据集
    userinfo: {
      name: " ",
      sex: " ",
      school: " ",
      phonenumber: " ",
      mail: " ",
      userName: " ",
      telNumber:" "
    },

    wintitle: "", //弹窗的标题
    wininfo: "", //预显示
    placeholder: "", //Input提示
    info: "", //用户的输入值
    hiddenmodalput: true, //子弹窗的初始状态为隐藏
    star: []
  },

  /**
   * @author 董禹威 on 2019/5/13
   * @apiNote 监听页面加载--自动登录
   */
  onLoad: function() {
    var that = this;
    // 获取用户头像用户名
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            // 获取用户头像和微信昵称
            success: res => {
              this.setData({
                "avatarUrl": res.userInfo.avatarUrl,
                "message": res.userInfo.nickName,
                "userinfo.name": "读取中...",
                "userinfo.sex": "读取中...",
                "userinfo.school": "读取中...",
                "userinfo.phonenumber": "读取中...",
                "userinfo.mail": "读取中...",
                "userinfo.userName": "读取中..."
              })
              app.globalData.logged = true;
              that.onLogin();
            }
          })
        }
      }
    })
  },

  /**
   * @author 董禹威 on 2019/5/13
   * @apiNote 用户点击头像手动授权登录
   */
  onGetUserInfo: function(e) {
    if (!app.globalData.logged && e.detail.userInfo) {
      this.onLogin();
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        // userInfo: e.detail.userInfo,
        message: e.detail.userInfo.nickName
      })
    }
  },

  /**
   * @author 董禹威 on 2019/5/13
   * @apiNote 登录操作，获取openid
   */
  onLogin: function() {
    var that = this;
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: config + 'getOpenid.action',
            data: {
              code: res.code
            },
            success(res) {
              app.globalData.logged = true;
              app.globalData.openid = res.data.openid
              that.onGetUserdata();
            }
          })
        }
      }
    })
  },

  /**
   * @author 董禹威 on 2019/5/19
   * @apiNote 获取用户信息
   */
  onGetUserdata: function() {
    var that = this;
    wx.request({
      url: config + 'showUserdata.action',
      data: {
        openid: app.globalData.openid
      },
      success(res) {
        console.log("数据库userdata查询成功：", res.data);
        that.setData({
          "userinfo.name": res.data.name === undefined ? null : res.data.name,
          "userinfo.sex": res.data.sex === undefined ? null : res.data.sex,
          "userinfo.school": res.data.school === undefined ? null : res.data.school,
          "userinfo.phonenumber": res.data.phonenumber === undefined ? null : res.data.phonenumber,
          "userinfo.mail": res.data.mail === undefined ? null : res.data.mail,
          "userinfo.userName": res.data.userName === undefined ? null : res.data.userName,
          "userinfo.telNumber": res.data.telNumber === undefined ? null : res.data.telNumber,
        })
      }
    })
  },

  /**
   * @author 董禹威 on 2019/5/19
   * @apiNote 数据库操作：更新用户数据
   */
  onUserdataUpdate: function(key, value) {
    var that = this;
    wx.request({
      url: config + 'updateUserdata.action',
      data: {
        openid: app.globalData.openid,
        key: key,
        value: value
      },
      success(res) {
        console.log("数据库[userdata]更新成功,更新条数：", res.data.update)
      }
    })
  },

  /**
   * @author 董禹威 on 2019/5/19
   * @apiNote 实时获取用户输入框中的内容
   * @param 订单数量的输入框键入事件e（包含用户输入内容e.detail.value）
   */
  onInput: function(e) {
    this.setData({
      "info": e.detail.value
    })
  },

  /**
   * @author 董禹威 on 2019/5/20
   * @apiNote 修改姓名
   */
  setName: function() {
    if (app.globalData.logged) {
      this.setData({
        wintitle: "修改昵称",
        wininfo: this.data.userinfo.name == "暂无信息" ? "" : this.data.userinfo.name,
        info: this.data.userinfo.name == "暂无信息" ? "" : this.data.userinfo.name,
        placeholder: "请输入您的昵称",
        change: "name",
        hiddenmodalput: !this.data.hiddenmodalput,
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请登录',
      })
    }
  },

  /**
   * @author 董禹威 on 2019/5/20
   * @apiNote 修改性别
   */
  setGender: function() {
    if (app.globalData.logged) {
      var that = this;
      this.setData({
        wintitle: "设置性别",
      })
      wx.showActionSheet({
        itemList: ['男', '女'],
        success(res) {
          if (res.tapIndex == 0) {
            that.onUserdataUpdate("sex", "男")
            that.setData({
              "userinfo.sex": "男"
            })
          } else {
            that.onUserdataUpdate("sex", "女")
            that.setData({
              "userinfo.sex": "女"
            })
          }
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请登录',
      })
    }
  },

    /**
   * @author 董禹威 on 2019/5/20
   * @apiNote 修改学校/单位
   */
  setSchool: function() {
    if (app.globalData.logged) {
      this.setData({
        wintitle: "修改学校/单位",
        wininfo: this.data.userinfo.school == "暂无信息" ? "" : this.data.userinfo.school,
        info: this.data.userinfo.school == "暂无信息" ? "" : this.data.userinfo.school,
        placeholder: "请输入您所在学校/单位",
        change: "school",
        hiddenmodalput: !this.data.hiddenmodalput,
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请登录',
      })
    }
  },

  /**
   * @author 董禹威 on 2019/5/20
   * @apiNote 修改联系电话
   */
  setPhonenumber: function() {
    if (app.globalData.logged) {
      this.setData({
        wintitle: "修改联系电话",
        wininfo: this.data.userinfo.phonenumber == "暂无信息" ? "" : this.data.userinfo.phonenumber,
        info: this.data.userinfo.phonenumber == "暂无信息" ? "" : this.data.userinfo.phonenumber,
        placeholder: "请输入您的联系电话",
        change: "phonenumber",
        hiddenmodalput: !this.data.hiddenmodalput
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请登录',
      })
    }
  },

  /**
   * @author 董禹威 on 2019/5/20
   * @apiNote 修改email
   */
  setEmail: function() {
    if (app.globalData.logged) {
      this.setData({
        wintitle: "修改电子邮箱",
        wininfo: this.data.userinfo.phonenumber == "暂无信息" ? "" : this.data.userinfo.mail,
        info: this.data.userinfo.phonenumber == "暂无信息" ? "" : this.data.userinfo.mail,
        placeholder: "请输入您的电子邮箱",
        change: "mail",
        hiddenmodalput: !this.data.hiddenmodalput
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请登录',
      })
    }
  },

  /**
   * @author 董禹威 on 2019/5/25
   * @apiNote 用户引导进入“更多”页面
   */
  goMore: function() {
    wx.navigateTo({
      url: 'more',
    })
  },

  /**
   * @author 董禹威 on 2019/5/20
   * @apiNote 用户修改弹窗取消，弹窗关闭
   */
  cancel: function() {
    this.setData({
      hiddenmodalput: true,
    });
  },

  /**
   * @author 董禹威 on 2019/5/20
   * @apiNote 用户修改弹窗确认，修改成功，弹窗关闭
   */
  confirm: function() {
    if(this.data.info==""){
      this.setData({
        hiddenmodalput: true,
      })
      return;
    }
    this.onUserdataUpdate(this.data.change, this.data.info)
    var temp = "userinfo." + this.data.change;
    this.setData({
      [temp]: this.data.info,
      hiddenmodalput: true,
    })
    wx.showToast({
      title: '修改成功',
    })
  },

  /**
   * @author 董禹威 on 2019/5/27
   * @apiNote 设置收货地址
   */
  setAddress: function() {
    var that = this;
    if (!app.globalData.logged) {
      wx.showToast({
        icon: 'none',
        title: '请登录',
      })
      return;
    }
    wx.chooseAddress({
      success(res) {
        // 渲染前端
        that.setData({
          "userinfo.userName": res.userName,
          "userinfo.telNumber": res.telNumber
        })
        // 后端数据库更新
        wx.request({
          url: config + 'setAddress.action',
          data: {
            openid: app.globalData.openid,
            userName: res.userName,
            postalCode: res.postalCode,
            provinceName: res.provinceName,
            cityName: res.cityName,
            countyName: res.countyName,
            detailInfo: res.detailInfo,
            nationalCode: res.nationalCode,
            telNumber: res.telNumber
          },
          success(res) {
            if (res.data.success) {
              wx.showToast({
                title: '设置成功',
              })
              console.log("收货地址变更成功");
            } else {
              console.log("收货地址变更失败");
            }
          }
        })
      }
    })
  }
})