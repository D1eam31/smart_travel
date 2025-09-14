var edit = require("../edit.js");

Page({
  data: {
    more: false,
    transport: {
      type: 'transport',
    },
    editable: true
  },

  // 获取从编辑页面传过来的数据
  onLoad(query){
    var that = this;
    var eventChannel = that.getOpenerEventChannel();
    eventChannel.on('initData', function (data) {
      console.log(data.data);
      that.setData({
        transport: data.data,
        editable: query.edit == 'disable' ? false : true
      })
    })
  },

  // 将更新后的数据传给行程定制页面
  onUnload(e){
    var eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('acceptData', {data: this.data.transport});
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

  // 获取输入内容
  input(e){
    // console.log(e);
    var value = e.detail.value;
    var type = e.currentTarget.dataset.type;
    var transport = this.data.transport;

    switch(type){
      case 'startPlace': transport.startPlace = value; break;
      case 'endPlace': transport.endPlace = value; break;
      case 'price': transport.price = parseInt(value); break;
      case 'num': transport.num = parseInt(value); break;
      case 'people': transport.people = parseInt(value); break;
      case 'remark': transport.remark = value; break;
      default: console.log(type); break;
    }

    this.setData({
      transport,
    })

    console.log(transport);
  },

  // 选择交通工具
  chooseTrans(e){
    // console.log(e);
    var transport = this.data.transport;
    switch(e.currentTarget.dataset.trans){
      case 'plane': transport.name = '飞机'; break;
      case 'train': transport.name = '高铁'; break;
      case 'taxi': transport.name = '打车'; break;
      case 'other': transport.name = '其他'; break;
    }
    this.setData({
      transport,
    })
  },

  // 完成编辑，返回刚才页面
  done(e){
    edit.done();
  }
})