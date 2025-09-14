const { exam, showMore } = require("../edit.js");
// 引入
var edit = require("../edit.js");

Page({
  data: {
    more: false,
    days: 0,    // 酒店选择天数不超过旅行天数
    hotel: {
      type: 'hotel',
    },
    editable: true
  },

   // 获取从编辑页面传过来的数据
   onLoad(query){
    var that = this;
    var days = parseInt(query.days);
    if(isNaN(days)) days = 7;
    var eventChannel = that.getOpenerEventChannel();
    eventChannel.on('initData', function (data) {
      console.log(data.data);
      that.setData({
        hotel: data.data,
        days,
        editable: query.edit == 'disable' ? false : true
      })
    })

    console.log(that.data.hotel.startTime);
  },

  // 将更新后的数据传给行程定制页面
  onUnload(e){
    var eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('acceptData', {data: this.data.hotel});
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

  // 获取输入信息
  input(e){
    var value = e.detail.value;
    var type = e.currentTarget.dataset.type;
    var hotel = this.data.hotel;

    switch(type){
      case 'name': hotel.name = value; break;
      case 'price': hotel.price = parseInt(value); break;
      case 'num': hotel.num = parseInt(value); break;
      case 'people': hotel.people = parseInt(value); break;
      case 'remark': hotel.remark = value; break;
      default: console.log(type); break;
    }

    this.setData({
      hotel,
    })

    console.log(hotel);
  },

  // 监听 calendar 组件日期选择
  listener(e){
    console.log(e)
    var hotel = this.data.hotel;
    hotel.startTime = e.detail.inTime;
    hotel.endTime = e.detail.outTime;
    hotel.days = e.detail.days;
    this.setData({
     hotel,
    })
  },

  // 完成编辑，返回刚才页面
  done(e){
    edit.done();
  }
})