//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  context: null,
  //赢法的统计数组
  myWin: [],
  computerWin: [],
  wins: [],
  winCounts: 0,
  over: false,
  me: true,
  chressBord: [],//棋盘
  perWidth: 0,
  
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.setCanvasSize()
    this.iniWins()
    this.initChressBord()
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  setCanvasSize() {
    let that = this
    wx.getSystemInfo({
      success(res) {
        that.canvasWidth = res.windowWidth
        // that.canvasHeight = res.windowHeight
        that.setData({
          canvasWidth: that.canvasWidth,
          canvasHeight: that.canvasWidth
        })
        that.perWidth = Math.floor(that.canvasWidth / 15)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    this.context = wx.createCanvasContext('firstCanvas')
    this.context.setStrokeStyle("#bfbfbf") //边框颜色
    this.context.setLineWidth(2)
    // 使用 wx.createContext 获取绘图上下文 context
    this.drawChessBoard();
  },
  setChess(e) {
    console.log('one more time')
    if (this.over) {
      return;
    }
    if (!this.me) {
      return;
    }
    var x = e.touches[0].x - 15;
    var y = e.touches[0].y - 15;
    if (x < 0) {
      x = 0
    }
    if (y < 0) {
      y = 0
    }
    var i = Math.round(x / this.perWidth);
    var j = Math.round(y / this.perWidth);
    if (this.chressBord[i][j] == 0) {
      this.oneStep(i, j, this.me);
      this.chressBord[i][j] = 1;//我        

      for (var k = 0; k < this.winCounts; k++) {
        if (this.wins[i][j][k]) {
          this.myWin[k]++;
          this.computerWin[k] = 6;//这个位置对方不可能赢了
          if (this.myWin[k] == 5) {
            wx.showModal({
              title: '提示',
              content: '你赢了,你牛逼。是否再来一局',
              success(res) {
                if (res.confirm) {
                  wx.switchTab({
                    url: '/pages/game/index'
                  })
                } else if (res.cancel) {

                }
              }
            })
            this.over = true;
          }
        }
      }
      if (!this.over) {
        this.me = !this.me;
        setTimeout(() => {
          this.computerAI();
        }, 500)
      }
    }
  },

  /**
   * 画旗子
   */
  oneStep(i, j, me) {
    this.context.beginPath();
    this.context.arc(15 + i * this.perWidth, 15 + j * this.perWidth, this.perWidth / 2, 0, 2 * Math.PI);//画圆
    this.context.closePath();

    if (this.me) {
      this.context.setFillStyle('#EEEEEE')
    } else {
      this.context.setFillStyle('#000000')
    }
    this.context.fill()

    this.context.draw(true)
  },

  //绘画棋盘
  drawChessBoard() {
    for (var i = 0; i < 15; i++) {
      this.context.save()
      this.context.moveTo(15 + i * this.perWidth, 15)
      this.context.lineTo(15 + i * this.perWidth, this.canvasWidth - 15)
      this.context.stroke()

      this.context.moveTo(15, 15 + i * this.perWidth)
      this.context.lineTo(this.canvasWidth - 15, 15 + i * this.perWidth)
      this.context.stroke()
      this.context.restore()
    }
    this.context.draw()
  },

  /**
   * 赢法统计
   */
  iniWins() {
    //赢法数组
    for (var i = 0; i < 15; i++) {
      this.wins[i] = [];
      for (var j = 0; j < 15; j++) {
        this.wins[i][j] = [];
      }
    }

    var count = 0; //赢法总数
    //横线赢法
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[i][j + k][count] = true;
        }
        count++;
      }
    }

    //竖线赢法
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[j + k][i][count] = true;
        }
        count++;
      }
    }

    //正斜线赢法
    for (var i = 0; i < 11; i++) {
      for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
          this.wins[i + k][j + k][count] = true;
        }
        count++;
      }
    }

    //反斜线赢法
    for (var i = 0; i < 11; i++) {
      for (var j = 14; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
          this.wins[i + k][j - k][count] = true;
        }
        count++;
      }
    }

    for (var i = 0; i < count; i++) {
      this.myWin[i] = 0;
      this.computerWin[i] = 0;
    }
    this.winCounts = count
  },

  computerAI() {
    var myScore = [];
    var computerScore = [];
    var max = 0;
    var u = 0, v = 0;
    for (var i = 0; i < 15; i++) {
      myScore[i] = [];
      computerScore[i] = [];
      for (var j = 0; j < 15; j++) {
        myScore[i][j] = 0;
        computerScore[i][j] = 0;
      }
    }
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 15; j++) {
        if (this.chressBord[i][j] == 0) {
          for (var k = 0; k < this.winCounts; k++) {
            if (this.wins[i][j][k]) {
              if (this.myWin[k] == 1) {
                myScore[i][j] += 200;
              } else if (this.myWin[k] == 2) {
                myScore[i][j] += 400;
              } else if (this.myWin[k] == 3) {
                myScore[i][j] += 2000;
              } else if (this.myWin[k] == 4) {
                myScore[i][j] += 10000;
              }

              if (this.computerWin[k] == 1) {
                computerScore[i][j] += 220;
              } else if (this.computerWin[k] == 2) {
                computerScore[i][j] += 420;
              } else if (this.computerWin[k] == 3) {
                computerScore[i][j] += 2100;
              } else if (this.computerWin[k] == 4) {
                computerScore[i][j] += 20000;
              }
            }
          }

          if (myScore[i][j] > max) {
            max = myScore[i][j];
            u = i;
            v = j;
          } else if (myScore[i][j] == max) {
            if (computerScore[i][j] > computerScore[u][v]) {
              u = i;
              v = j;
            }
          }

          if (computerScore[i][j] > max) {
            max = computerScore[i][j];
            u = i;
            v = j;
          } else if (computerScore[i][j] == max) {
            if (myScore[i][j] > myScore[u][v]) {
              u = i;
              v = j;
            }
          }
        }
      }
    }
    this.oneStep(u, v, false);
    this.chressBord[u][v] = 2;
    for (var k = 0; k < this.winCounts; k++) {
      if (this.wins[u][v][k]) {
        this.computerWin[k]++;
        this.myWin[k] = 6;//这个位置对方不可能赢了
        if (this.computerWin[k] == 5) {
          wx.showModal({
            title: '提示',
            content: '计算机赢了,你个渣渣。是否再来一局',
            success(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/game/index'
                })
              } else if (res.cancel) {

              }
            }
          })
          this.over = true;
        }
      }
    }
    if (!this.over) {
      this.me = !this.me;
    }
  },

  /**
   * 初始化棋盘内存信息
   */
  initChressBord() {
    for (var i = 0; i < 15; i++) {
      this.chressBord[i] = [];
      for (var j = 0; j < 15; j++) {
        this.chressBord[i][j] = 0;
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
