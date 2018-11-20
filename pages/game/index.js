// pages/game/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
   
  },
  context: null,
  //赢法的统计数组
  myWin: [],
  computerWin: [],
  wins: [],
  over:false,
  me:true,
  chressBord: [],//棋盘

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let logo = new Image();
    // logo.src = 'img/logo.png';
    // logo.onload = function () {
    //   context.drawImage(logo, 0, 0, 450, 450);
     
    // }
    this.iniWins()
    this.initChressBord()
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
    if (this.over) {
      return;
    }
    if (!this.me) {
      return;
    }
    var x = e.touches[0].x - 15;
    var y = e.touches[0].y - 15;
    if(x < 0) {
      x = 0
    }
    if (y < 0) {
      y = 0
    }
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);
    if (this.chressBord[i][j] == 0) {
      this.oneStep(i, j, me);
      this.chressBord[i][j] = 1;//我        

      for (var k = 0; k < count; k++) {
        if (this.wins[i][j][k]) {
          this.myWin[k]++;
          this.computerWin[k] = 6;//这个位置对方不可能赢了
          if (this.myWin[k] == 5) {
            console.log('你赢了');
            this.over = true;
          }
        }
      }
      if (!over) {
        this.me = !this.me;
        this.computerAI();
      }
    }
  },

  /**
   * 画旗子
   */
  oneStep (i, j, me) {
    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);//画圆
    context.closePath();
    //渐变
    var gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);

    if (me) {
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#636766');
    } else {
      gradient.addColorStop(0, '#d1d1d1');
      gradient.addColorStop(1, '#f9f9f9');
    }
    context.fillStyle = gradient;
    context.fill();
  },

  //绘画棋盘
  drawChessBoard () {
    for (var i = 0; i < 15; i++) {
      this.context.save()
      this.context.moveTo(15 + i * 30, 15)
      this.context.lineTo(15 + i * 30, 435)
      this.context.stroke()
      
      this.context.moveTo(15, 15 + i * 30);
      this.context.lineTo(435, 15 + i * 30);
      this.context.stroke();
      this.context.restore()
     }
    this.context.draw()
  },

  /**
   * 赢法统计
   */
  iniWins () {
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
  },

  computerAI () {
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
          for (var k = 0; k < count; k++) {
            if (this.wins[i][j][k]) {
              if (this.myWin[k] == 1) {
                myScore[i][j] += 200;
              } else if (myWin[k] == 2) {
                myScore[i][j] += 400;
              } else if (myWin[k] == 3) {
                myScore[i][j] += 2000;
              } else if (myWin[k] == 4) {
                myScore[i][j] += 10000;
              }

              if (this.computerWin[k] == 1) {
                computerScore[i][j] += 220;
              } else if (this.computerWin[k] == 2) {
                computerScore[i][j] += 420;
              } else if (computerWin[k] == 3) {
                computerScore[i][j] += 2100;
              } else if (computerWin[k] == 4) {
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
  },

  /**
   * 初始化棋盘内存信息
   */
  initChressBord () {
    for(var i = 0; i< 15; i++) {
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