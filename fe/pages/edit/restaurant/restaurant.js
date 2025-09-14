var QQMapWX = require('../../../components/qqmap-wx-jssdk.js');
var qqmapsdk;
var edit = require("../edit.js");
var util = require("../../../utils/util.js");

Page({
  data: {
    more: false,
    restaurant: {
      type: 'restaurant',
    },
    suggestion: [],
    showSug: false,
    editable: true
  },

   
   onLoad(query){
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: util.mapkey
    });

    // 获取从编辑页面传过来的数据
    var that = this;
    var eventChannel = that.getOpenerEventChannel();
    eventChannel.on('initData', function (data) {
      console.log(data.data);
      that.setData({
        restaurant: data.data,
        editable: query.edit == 'disable' ? false : true
      })
    })
  },

  // 将更新后的数据传给行程定制页面
  onUnload(e){
    var eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('acceptData', {data: this.data.restaurant});
  },

  // 输入为空格，将输入框置为空
   exam(e){
    if(edit.exam(e)){
      return '';
    }
  },

  // 显示更多信息编辑
  showMore(e){
    var that = this;
    edit.showMore(that);
  },

  // 选择某项搜索提示，并将信息放入输入框
  enterSug(e){
    var restaurant = this.data.restaurant;
    var msg = this.data.suggestion[e.currentTarget.dataset.index];
    restaurant.name = msg.title;
    restaurant.place = msg.addr;
    this.setData({
      restaurant,
    })
    console.log('enterSug');
    console.log(this.data.restaurant);
  },

  // 根据输入景点名获取提示信息
  getSuggestion(e){
    var that = this;

    // 景点名称是否为空
    if(edit.exam(e)){
      var restaurant = that.data.restaurant;
      restaurant.name = '';
      restaurant.place = '';
      that.setData({
        restaurant,
        showSug: false,
        suggestion: []
      })
      return '';
    }

    //调用关键词提示接口
    qqmapsdk.getSuggestion({
      //获取输入框值并设置keyword参数
      keyword: e.detail.value,  //用户输入的关键词
      //region:'北京', //设置城市名，限制关键词所示的地域范围，非必填参数
      success: function(res) {//搜索成功后的回调
          // console.log(res);
          var sug = [];
          for (var i = 0; i < res.data.length; i++) {
            sug.push({ // 获取返回结果，放到sug数组中
              title: res.data[i].title,
              addr: res.data[i].address,
            });
          }
          that.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
            suggestion: sug,
            showSug: true
          });

          console.log(sug);
      },
      fail: function(error) {
          console.error(error);
      },
    });
  },

  // 获取输入内容
  input(e){
    // console.log(e);
    var value = e.detail.value;
    var type = e.currentTarget.dataset.type;
    var restaurant = this.data.restaurant;

    switch(type){
      case 'name': restaurant.name = value; break;
      case 'place': restaurant.place = value; break;
      case 'price': restaurant.price = parseInt(value); break;
      case 'people': restaurant.people = parseInt(value); break;
      case 'remark': restaurant.remark = value; break;
      default: console.log(type); break;
    }

    this.setData({
      restaurant,
      showSug: false,
    })

    console.log(restaurant);
  },

  // 完成编辑，返回刚才页面
  done(e){
    edit.done();
  }
})