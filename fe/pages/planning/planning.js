import {request} from "../../components/request.js";

const app = getApp();

Page({
  data: {
    // 上一级页面传来的信息
    place: '',
    startTime: '',
    endTime: '',
    days: 0,

    // 模式 0 表示自定义编辑，模式 1 表示推荐方案编辑，模式 2 表示已收藏方案
    mode: 0,

    // 方案信息是否获取完毕，渲染 timeline
    loading: true,

    // 方案头图
    planImg: '',
    showReco: false,    // 只有四个城市展示推荐方案卡片
    recoImg: '',    // 推荐方案展示图

    // 当前方案信息
    planInfo: [],

    // 编辑信息
    dayIndex: 0,    
    showBtn: true,    // 展示编辑按钮，是否允许编辑
    editBtn: false,   // 是否展开编辑按钮（添加景点等

    // 推荐方案信息
    planMsg: [],    // 包括多套方案的 planInfo
    planID: [],   // 方案 ID 和图片
    planIndex: 0,   // 选择哪套方案

    // 预算信息
    budget: [],
    total: 0,
    showBudget: false,
    budgetHeight: 0,    // 预算框高度（覆盖全屏

    // 保存过的方案
    storeEdit: false,    // 是否进入编辑状态
    timeKey: '',     // 方案的时间戳
    timeIndex: -1,    // 此方案在方案目录数组的 index，保存修改方案用
    createTime: '',     // 方案创建时间
  },


  // 初始化数据
  onLoad(query){
    var mode = parseInt(query.mode);

    this.setData({
      mode,
      place: query.place,
      days: parseInt(query.days),
      startTime: query.startTime,
      endTime: query.endTime
    })
    
    if(mode === 1){     // 推荐方案
      this.initReco(this.data.place, this.data.days);
    }else if(mode === 2){     // 本地保存的方案
      var timeIndex = parseInt(query.timeIndex);
      // 初始化已存储方案的 planInfo
      var planIndex = wx.getStorageSync('planIndex');
      var planItem = planIndex[timeIndex];
      var stor = wx.getStorageSync(planItem.timeKey);
      this.setData({
        planInfo: stor.planInfo,
        planImg: stor.planImg,
        timeIndex,
        timeKey: planItem.timeKey,
        createTime: planItem.createTime
      })
      console.log(this.data.planInfo.length);
    }else{    // DIY 方案
     // 初始化自定义方案的 planInfo
      var showReco = true;
      var recoImg = '';
      switch(query.place){
        case '西安': recoImg = 'https://witrip.wizzstudio.com/images/image/300c16000000zi90pB11F_D_350_170_Q90.jpg'; break;
        case '重庆': recoImg = 'https://witrip.wizzstudio.com/images/image/10030e00000077tj23C12_D_350_170_Q90.jpg'; break;
        case '广州': recoImg = 'https://witrip.wizzstudio.com/images/image/100611000000r2hddE033_D_350_170_Q90.jpg'; break;
        case '北京': recoImg = 'https://witrip.wizzstudio.com/images/image/100r060000001yhqw2450_D_350_170_Q90.jpg'; break;
        default: showReco = false; break;
      }
      this.setData({
        recoImg,
        planImg: '../../images/planImg_0.jpg',
        showReco
      })
      this.initInfo();
    }

    // 计算预算框高度
    var budgetHeight = app.globalData.windowHeight - app.globalData.CustomBar - 100/750*app.globalData.windowWidth;
    this.setData({
      budgetHeight
    })
  },

  ////////////////////////////////////////
  /////   自定义方案

  // 初始化自定义方案数据
  initInfo(e){
    var item = [{
        type: 'transport',
        name: '',
        key: 0,
        transY: 0
      },{
        type: 'spot',
        name: '',
        key: 1,
        transY: 0
      },{
        type: 'hotel',
        name: '',
        key: 2,
        transY: 0
      },{
        type: 'restaurant',
        name: '',
        key: 3,
        transY: 0
      }];

    var planInfo = [];
    var days = this.data.days;
    for(let i = 0; i < days; i++){
      planInfo[i] = item;
    }

    this.setData({
      planInfo,
    })
  },

  // 切换到推荐方案页面
  recommand(e){
    var place = this.data.place;
    var days = this.data.days;
    var startTime = this.data.startTime;
    var endTime = this.data.endTime;
    wx.navigateTo({
      url: '../planning/planning?place=' + place + '&days=' + days + '&startTime=' + startTime + '&endTime=' +endTime + '&mode=' + 1
    })
  },


  ////////////////////////////////////////
  /////   推荐方案

  // 加载推荐方案信息
  initReco(place, days){
    var planID;    // 方案 ID 和图片数据
    var planMsg;   // 方案内景点名和景点价格信息
    var that = this;
  
    request('https://witrip.wizzstudio.com/cityapi/city/?city_name=' + place)
    // 获取对应天数和地点的方案 ID 和方案图片
    .then((res) => {
      // console.log('res1', res.data[0]);
      planID = [];
      res.data[0].spotlist.forEach((item) => {
        if(item.spotlist_day == days){
          planID.push({
            ID: item.spotlist_id,
            img: item.spotlist_image
          })
        }
      })
  
      return planID;
    })
    // 通过方案 ID 和获取方案信息
    .then((planID) => {
      // console.log('planID', planID);
      var promise = [];
      planID.forEach((item) => {
        promise.push(request('https://witrip.wizzstudio.com/cityapi/ls/?spotlist_id=' + item.ID));
      })
  
      return Promise.all(promise);
    })
    // 组成方案列表
    .then((res) => {
      // console.log('res2', res);
      planMsg = [];
      res.map((planItem) => {
        let spots = [];
        let index = 0;
        let key = 0;
        spots[0] = [];
        planItem.data.map((spotList) => {
          if(spotList.list_day !== index + 1){
            index = index + 1;
            spots[index] = [];
            key = 0;
          }
          spots[index].push({
            type: 'spot',
            name: spotList.spotname,
            price: spotList.spot_prize,
            key,
          })
          key += 1;
        })
        planMsg.push(spots);
      })
  
      console.log('planMsg1', planMsg);
    })
    .catch(err => {
      console.log('err', err);
    })
  
    // 用计时器实现同步效果，直到方案中有数据才停止加载
    var async = setInterval(() => {
      if(planMsg != undefined && planMsg.length != 0){
        that.setData({
          loading: false,
          planID: planID,
          planMsg: planMsg,
          planInfo: planMsg[0],
          planImg: planID[0].img 
        })
        console.log('planMsg', planMsg);

        // 加载预算信息
        that.initBudget();
        clearInterval(async);
      }
    }, 1000);
  },

  // 更换推荐方案
  changeReco(e){
    var planIndex = (this.data.planIndex + 1)%this.data.planID.length ;
    var planImg = this.data.planID[planIndex].img;
    var planInfo = this.data.planMsg[planIndex];
    this.setData({
      planIndex,
      planImg,
      planInfo,
    })
    wx.showToast({
      title: '更换到第' + (planIndex + 1) + '套方案',
      icon: 'none'
    })
  },

  // 已保存方案的编辑按钮
  editPlan(e){
    this.setData({
      storeEdit: true
    })
  },


  ////////////////////////////////////////
  /////   编辑操作
  
  // 页面向上滚动时，隐藏编辑按钮
  onPageScroll(e){
    // console.log(e);
    this.setData({
      showBtn: e.scrollTop < 200
    })
  },

  // 更换方案图片，先不做上传，用本地三张图片替换来实现
  loadImg(e){
    var str = this.data.planImg;
    str = str.split('_')[1];
    var index = parseInt(str);
    if(!isNaN(index)){
      this.setData({
        planImg: '../../images/planImg_' + (index + 1)%3 + '.jpg'
      })
    }else{
      this.setData({
        planImg: '../../images/planImg_0.jpg'
      })
    }
  },

  // 待完善
  // 时刻更新 planInfo，从 timeline 组件获取最新 planInfo
  getInfo(e){
    console.log('getInfo', e);
    this.setData({
      planInfo: e.detail.planInfo,
      dayIndex: e.detail.dayIndex
    })
  },

  // 跳转到信息编辑页面
  toEdit(e){
    console.log(e);
    var that = this;

    var dayIndex = that.data.dayIndex; // 第几天
    var index;  // 点击第几项
    var planInfo = that.data.planInfo;  

    if(e.type !== 'click'){  // 新建一个列表项
      index = planInfo[dayIndex].length;
      var msg = {type: e.type, name: '', key: index, transY: 0}; 
    }else{
      index = e.detail.index; 
      var msg = planInfo[dayIndex][index]; // 点击的列表本来含有的信息
    }

    console.log('toEdit');
    console.log(planInfo);

    // 酒店最大可选天数应小于方案天数
    var days = '';
    if(msg.type == 'hotel'){
      days = '&days=' + that.data.days;
    }
    // 是否可编辑
    var edit = that.data.mode == 2 && !that.data.storeEdit ? 'disable' : 'able';
    console.log(edit);

    wx.navigateTo({
      url: '../edit/' + msg.type + '/' + msg.type + '?edit=' + edit + '&days=' + days,
      events: {
        acceptData: function (data) {   // 从编辑页面获取信息
          console.log(data.data);
          planInfo[dayIndex][index] = data.data;
          console.log(planInfo);
          that.setData({
            planInfo,
          })
        }
      },
      success: (res) => {
        res.eventChannel.emit('initData', {data: msg});  // 将此项信息传给编辑页面
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },

  // 展开或收起编辑按钮
  editBtn(e){
    console.log('planning_edit', e);
    var type = e.currentTarget.dataset.type;
    if(type === undefined){   // 展开或收起编辑按钮
      this.setData({
        editBtn: !this.data.editBtn
      })
    }else{    // 打开编辑页面
      this.setData({  
        editBtn: false
      })

      console.log(type);
      this.toEdit({type: type});  // 新建一个列表项
    }
  },


  ////////////////////////////////////////
  /////   预算

  // 计算预算信息
  initBudget(e){
    var planInfo = this.data.planInfo;
    var budget = [];
    var total = 0;
    planInfo.forEach((day, index) => {
      budget[index] = [];
      day.forEach((item) => {
        var price = parseInt(item.price);
        var num = isNaN(parseInt(item.num)) ? 1 : item.num;   // 若没有选择票数，默认为 1 张
        if(item.price > 0 && !isNaN(price)){
          total = total + price*num;
          budget[index].push({
            name: item.name,
            price: price*num
          })
        }
      })
    })
    this.setData({
      budget,
      total
    })
    console.log('budget');
    console.log(budget);
  },

  // 显示预算框
  showBudget(e){
    this.initBudget();    // 每次弹出预算框的时候重新计算预算信息
    this.setData({
      showBudget: true
    })
  },

  // 关闭预算框
  closeBudget(e){
    this.setData({
      showBudget: false
    })
  },


  ////////////////////////////////////////
  /////   收藏方案或更新方案

  storePlan(e){
    var that = this;
    var date = new Date();
    var timeKey;    // 时间戳
    var createTime;   // 创建时间

     // 更新方案目录数组
    var planIndex = wx.getStorageSync('planIndex');
    // 如果是已收藏方案，恢复不可编辑状态，并且对修改数据保存
    if(that.data.mode == 2){
      that.setData({
        storeEdit: false,
      })
      timeKey = that.data.timeKey;    // 不改变时间戳
      createTime = that.data.createTime;  
      planIndex[that.data.timeIndex] = {
        timeKey: timeKey,
        place: that.data.place,
        startTime: that.data.startTime,
        endTime: that.data.endTime,
        days: that.data.days,
        planImg: that.data.planImg,
        createTime: createTime
      }
    }else{    // 其他情况，存储为新方案
      timeKey = date.getTime().toString();  // 创建新的时间戳作为存储方案的 key
      createTime = date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日'+' '+date.getHours()+':'+(date.getMinutes()<10?'0':'')+date.getMinutes();
      if(planIndex == ''){
        planIndex = [];
      }
      planIndex.unshift({
        timeKey: timeKey,
        place: that.data.place,
        startTime: that.data.startTime,
        endTime: that.data.endTime,
        days: that.data.days,
        planImg: that.data.planImg,
        createTime: createTime
      })
    }

    // 存储最新收藏方案列表
    wx.setStorageSync('planIndex', planIndex);

    // 对方案中数组按 key 排序
    var info = that.data.planInfo;
    var planInfo = [];
    info.map((daily, i1) => {
      planInfo[i1] = [];
      daily.map((item, i2) => {
        planInfo[i1][item.key] = item;
        planInfo[i1][item.key].transY = 0;
      })
    })
    console.log('store planInfo', planInfo);
       
     // 存储方案信息
    wx.setStorage({
      key: timeKey,
      data:{
        planInfo,
        planImg: that.data.planImg
      },
      success:res=>{
        wx.showToast({
          title:'收藏成功！'
        });
        setTimeout(() => {
          wx.switchTab({
            url: '../hisPlan/hisPlan'
          })
        }, 500);
      }
    })
  }
});