// 一些编辑页面公用的 js 函数

// 绑定在 bindinput，监听 input 输入，输入不能为空格，输入为空返回 true
function exam(e){
  // console.log(e);
  var value = e.detail.value;
  var reg = /^\S/;
  return !reg.test(value);
}

// 绑定于 “显示更多” button 的点击事件，点击展示或收起更多信息填写
function showMore(that){
  that.setData({
    more: !that.data.more
  })
}

// 完成编辑，返回刚才页面
function done(e){
  wx.navigateBack({
    delta: 1,
  })
}

module.exports = {
  exam,
  showMore,
  done
}