var edit = require("../edit.js");

Page({
  data: {
    note: {
      type: 'note',
    },
    editable: true
  },

  onLoad(query){
    // 获取从编辑页面传过来的数据
    var that = this;
    var eventChannel = that.getOpenerEventChannel();
    eventChannel.on('initData', function (data) {
      console.log(data.data);
      that.setData({
        note: data.data,
        editable: query.edit == 'disable' ? false : true
      })
    })
  },

  // 将更新后的数据传给行程定制页面
  onUnload(e){
    var eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('acceptData', {data: this.data.note});
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
    var note = this.data.note;
    note.content = e.detail.value;

    this.setData({
      note,
    })

    console.log(e.detail.value);
  },
})