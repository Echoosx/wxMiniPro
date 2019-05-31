// pages/home/home.js
const app = getApp();
const config="https://www.zamonia.cn/Flea/";

Page({

  /**
   * 页面的初始数据
   */
  data: {

    //轮播广告
    adUrls: [{
      url: 'https://www.zamonia.cn/statics/icon/ad_1.jpg'
    }, {
        url: 'https://www.zamonia.cn/statics/icon/ad_2.jpg'
    }, {
        url: 'https://www.zamonia.cn/statics/icon/ad_3.jpg'
    }],
    indicatorDots: true, //小点
    autoplay: true, //是否自动轮播
    interval: 6000, //间隔时间
    duration: 1500, //滑动时间

    //分类框
    classify: [{
        id: "book",
        text: "书籍",
        url: "../../images/classify_book.png",
        selected: true
      },
      {
        id: "things",
        text: "日用百货",
        url: "../../images/classify_things.png",
        selected: false
      },
      {
        id: "sports",
        text: "户外",
        url: "../../images/classify_sports.png",
        selected: false
      },
      {
        id: "electronic",
        text: "电子产品",
        url: "../../images/classify_ele.png",
        selected: false
      },
      {
        id: "desktop",
        text: "桌上用品",
        url: "../../images/classify_desktop.png",
        selected: false
      },
      {
        id: "other",
        text: "其他",
        url: "../../images/classify_other.png",
        selected: false
      }
    ],
    selectedClassify: "书籍",

    //商品
    goodList_left: [],
    goodList_right: [],
    page: 1,

    // 触底警告
    bottomdisplay: "false",

    // 搜索
    keyword: "",
    searchValue: "",
    searching:false
  },

  /**
   * @author 张尔爽 on 2019/5/6
   * @apiNote 监听页面加载--自动登录，查询默认类别商品
   * @param options 包含查询字符串
   */
  onLoad: function(options) {
    var that=this;
    wx.getSetting({
      success: res => {
        //如果已授权，默认自动登录
        if (res.authSetting['scope.userInfo']) {
          wx.login({
            success(res) {
              if (res.code) {
                wx.request({
                  url: config + 'getOpenid.action',
                  data: {
                    code: res.code
                  },
                  success(res) {
                    app.globalData.openid=res.data.openid;
                    app.globalData.logged=true;
                  }
                })
              }
            }
          })
        }
      }
    })
    that.getGoodsInfo(this.data.selectedClassify);
  },

  /**
   * @author 张尔爽 on 2019/5/6
   * @apiNote 监听小游戏回到前台的事件--查询当前默认类别商品
   */
  onShow() {
    this.getGoodsInfo(this.data.selectedClassify);
  },


  /**
   * @author 张尔爽 on 2019/5/7
   * @apiNote 监听用户下拉动作--模拟加载，重新加载前6件当前默认种类的商品
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 700);
    //搜索与种类查看分流
    if (this.data.searching) {
      this.getSearch(this.data.keyword);
    } else {
      this.getGoodsInfo(this.data.selectedClassify);
    }
  },


  /**
   * @author 张尔爽 on 2019/5/7
   * @apiNote 监听页面上拉触底事件的处理函数--加载当前选择种类下一页的商品
   */
  onReachBottom: function () {
    var that = this;
    // 不为搜索功能服务
    if (this.data.searching) {
      return;
    }
    wx.request({
      url: config + 'getGoods.action',
      data: {
        page: that.data.page,
        classify: that.data.selectedClassify
      },
      success(res) {
        var i = 0;
        var templist_left = [];
        var templist_right = [];
        if (res.data.select == 0) {
          // 获取不到更多商品，提示触底
          // that.setData({
          //   bottomdisplay: "true",
          // })
          wx.showToast({
            icon:'none',
            title: '没有更多啦~',
          })
          return;
        }
        // 将价格的整数部分与小数部分分开管理
        for (i = 0; i < res.data.list.length; i++) {
          res.data.list[i].frac = res.data.list[i].price * 10 % 10;
          res.data.list[i].price = Math.floor(res.data.list[i].price);
          if (i % 2 == 0) {
            templist_left.push(res.data.list[i]);
          } else {
            templist_right.push(res.data.list[i]);
          }
        }
        that.setData({
          "goodList_left": that.data.goodList_left.concat(templist_left),
          "goodList_right": that.data.goodList_right.concat(templist_right)
        })
        that.data.page++;
      }
    })
  },


  /**
   * @author 张尔爽 on 2019/5/9
   * @apiNote 从数据库中获取某种类的商品信息
   * @param selectedClassify 当前用户选择查看的商品种类
   */
  getGoodsInfo: function(selectedClassify) {
    var that=this;
    this.data.page = 1;
    this.setData({
      bottomdisplay:false
    });
    wx.request({
      url: config+'getGoods.action',
      data:{
        page:0,
        classify:selectedClassify
      },
      success(res){
        var i=0;
        var templist_left=[];
        var templist_right=[];
        for(i=0;i<res.data.list.length;i++){
          res.data.list[i].frac=res.data.list[i].price*10%10;
          res.data.list[i].price=Math.floor(res.data.list[i].price);
          if(i%2==0){
            templist_left.push(res.data.list[i]);
          }else{
            templist_right.push(res.data.list[i]);
          }
        }
        that.setData({
          "goodList_left":templist_left,
          "goodList_right": templist_right
        })
      }
    })
  },

  /**
   * @author 张尔爽 on 2019/5/9
   * @apiNote 获取用户选择的商品种类
   * @param 触发选择选择种类改变的前端事件e
   */
  onGetClassify(e) {
    this.data.searching=false;
    var i, temp;
    var selected;
    // 更改前端分类选择渲染效果
    for (i = 0; i < 6; i++) {
      selected = "classify[" + i + "].selected";
      this.setData({
        [selected]: false
      })
      if (this.data.classify[i].id == e.currentTarget.id) {
        temp = i;
      }
    }
    selected = "classify[" + temp + "].selected";
    this.setData({
      [selected]: true
    })

    // 构建种类index与种类名对照的字典
    var classifyLib = {
      "book": "书籍",
      "things": "日用百货",
      "sports": "户外",
      "electronic": "电子产品",
      "desktop": "桌上用品",
      "other": "其他"
    }
    this.setData({
      "selectedClassify": classifyLib[e.currentTarget.id]
    })
    //重新查询该种类商品
    this.getGoodsInfo(classifyLib[e.currentTarget.id]);
  },

  /**
   * @author 张尔爽 on 2019/5/9
   * @apiNote 获取用户输入关键词
   * @param 触发输入框内容改变的前端事件e
   */
  onGetSearch(e) {
    this.setData({
      "keyword": e.detail.value
    })
  },

  /**
   * @author 张尔爽 on 2019/5/9
   * @apiNote 查询框复原，种类选择提示清空
   */
  onSearch() {
    this.data.searching=true;
    this.getSearch(this.data.keyword);
    this.setData({
      "searchValue": ""
    })

    var i, selected;
    for (i = 0; i < 6; i++) {
      selected = "classify[" + i + "].selected";
      this.setData({
        [selected]: false
      })
    }
  },

  /**
   * @author 张尔爽 on 2019/5/9
   * @apiNote 从后台商品数据库中查询名字或描述含有关键字的商品
   * @param 用户输入的关键字keyword
   */
  getSearch: function(keyword) {
    var that = this;
    this.setData({
      bottomdisplay: false
    });
    wx.request({
      url: config + 'searchGoods.action',
      data: {
        keyword:keyword
      },
      success(res) {
        var i = 0;
        var templist_left = [];
        var templist_right = [];
        if (res.data.select == 0) {
          wx.showToast({
            icon: 'none',
            title: '没有查询到相关商品',
          })
          return;
        }else{
          wx.showToast({
            icon: 'none',
            title: '查询到'+res.data.select+'件相关商品',
          })
        }
        for (i = 0; i < res.data.list.length; i++) {
          res.data.list[i].frac = res.data.list[i].price * 10 % 10;
          res.data.list[i].price = Math.floor(res.data.list[i].price);
          if (i % 2 == 0) {
            templist_left.push(res.data.list[i]);
          } else {
            templist_right.push(res.data.list[i]);
          }
        }
        that.setData({
          "goodList_left": templist_left,
          "goodList_right": templist_right
        })
      }
    })
  },

  /**
   * @author 张尔爽 on 2019/5/9
   * @apiNote 商品加入收藏夹
   * @param 触发事件e（包含商品编号e.currentTarget.dataset.gid）
   */
  onCollect(e) {
    // 登录验证
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
        gid:e.currentTarget.dataset.gid
      },
      success(res){
        if(res.data.success){
          wx.showToast({
            title: '收藏成功',
            duration:1000
          })
        }
        else{
          wx.showToast({
            icon:"none",
            title: '不能重复收藏',
            duration:1000
          })
        }
      }
    })
  },
})