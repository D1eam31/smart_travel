
Component({
  properties: {
    planInfo:{
      type: Array,
      value: [],
    },
    disabled: {
      type: Boolean,
      value: false
    },
  },

  data: {
    // 天数选择
    days: 0,
    dayArr: [],
    dayIndex: 0,

    // 卡片操作数据
    touchIndex: -1,
    touchStartX: 0,
    touchStartY: 0,

    // 景点卡片是否左滑
    slide: false,  

    // 景点卡片是否点击删除
    delete: false,

    // 景点卡片是否点击
    tap: false,

    // 景点卡片是否进行长按拖动
    longpress: false,
    demoTop: 0, // 列表顶点高度 px
    itemHeight: 0,  // 列表项元素高度 px
    transY: 0,  // 拖动点 Y 方向偏移 px
  },

  lifetimes: {
    ready(e){
      console.log('ready');
      var that = this;

      // 初始化方案天数信息
      that.initDay();

      // 获取列表顶最高点 Y 坐标和列表项高度
      var demo = that.createSelectorQuery().in(that);
      demo.select('#demo').boundingClientRect();
      demo.selectViewport().scrollOffset();
      demo.exec(function(res){
        // console.log(res);
        that.setData({
          demoTop: res[0].top,
          itemHeight: res[0].bottom - res[0].top,
        })
        console.log('demoTop: ' + that.data.demoTop);
        console.log('itemHeight: ' + that.data.itemHeight);
      })
    },
  },

  methods: {

    ////////////////////////////////////////
    /////   天数切换

    // 初始化方案天数信息
    initDay(e){
      var days = this.data.planInfo.length;
      var dayArr = [];
      for(let i = 1; i <= days; i++){
        dayArr.push(i);
      }
      this.setData({
        days,
        dayArr,
        dayIndex: 0
      })
    },

    // 换到第几天
    changeDay(e){
      // console.log(e);
      this.setData({
        dayIndex: e.currentTarget.dataset.day,
        slide: false
      })
    },
      

    ////////////////////////////////////////
    /////   拖动排序

    // 长按拖动，实时计算拖动项位置和是否发生交换
    pressmove(e){
      // 长按拖动状态
      var touchIndex = this.data.touchIndex;   // 列表项序号
      var dayIndex = this.data.dayIndex;
      var key = this.data.planInfo[dayIndex][touchIndex].key;   // 列表项位置
      var nowY = e.changedTouches[0].pageY;   // 长按点的 Y 坐标
      // Y 方向偏移量，总式子
      var transY = nowY - (1/2 + touchIndex)*this.data.itemHeight - this.data.demoTop;
      // 更新列表项拖动位置
      this.setData({
        transY: transY,
      })

      // 计算拖动到了第几个列表项
      var endKey = touchIndex + Math.round(transY/this.data.itemHeight);
      if(endKey < 0){
        endKey = 0;
      }else if(endKey >= this.data.planInfo[dayIndex].length){
        endKey = this.data.planInfo[dayIndex].length - 1;
      }

      // 排序并重新渲染列表
      if(key != endKey){
        this.refresh(key, endKey);
      }
    },

    // 排序，位置交换后刷新每个列表项位置 transY，更新 key
    refresh(key, endKey){
      var that = this;
      // 更新 planList 的 key，即更新各列表项的位置
      var planInfo = that.data.planInfo;
      var planList = planInfo[that.data.dayIndex];
      var list = [];
      if(key < endKey){
        list = planList.map((item, index) => {
          if(item.key <= endKey && item.key > key){
            item.key = item.key - 1;
          }else if(item.key === key){
            item.key = endKey;
          }
          item.transY = (item.key - index)*that.data.itemHeight;
          return item;
        })
      }else if(key > endKey){
        list = planList.map((item, index) => {
          if(item.key >= endKey && item.key < key){
            item.key = item.key + 1;
          }else if(item.key === key){
            item.key = endKey;
          }
          item.transY = (item.key - index)*that.data.itemHeight;
          return item;
        })
      }

      planInfo[that.data.dayIndex] = list;

      that.setData({
        planInfo,
      })
      
      console.log('refresh');
    },


    ////////////////////////////////////////
    /////   删除操作

    // 执行删除操作
    deleteItem(e){
      var planInfo = this.data.planInfo;
      var planList = planInfo[this.data.dayIndex];
      var touchIndex = this.data.touchIndex;
      var deleteKey = planList[touchIndex].key;
      var itemHeight = this.data.itemHeight;

      // 删除此项
      planList.forEach((item, index) => {
        if(item.key > deleteKey){  // 被删除元素之后的 key 减一，transY 减 itemHeight
          item.key = item.key - 1;
          item.transY = item.transY - itemHeight;
        }
        if(index > touchIndex){  // transY 加 itemHeight
          item.transY = item.transY + itemHeight;
        }
      })
      planList.splice(touchIndex, 1);   

      planInfo[this.data.dayIndex] = planList;
      this.setData({
        planInfo,
        slide: false
      })

      this.getInfo();
    },


    ////////////////////////////////////////
    /////   点击操作

    // 点击且非长按事件，返回点击列表的序号，应跳转到编辑页面
    toEdit(index){
      console.log('timeline_edit', index);
      var myEventDetail = {
        index: index
      };  // detail对象，提供给事件监听函数
      var myEventOption = {};  // 触发事件的选项
      this.triggerEvent('click', myEventDetail, myEventOption);
    },


    ////////////////////////////////////////
    /////   卡片操作（长按、左滑、点击、滚动

    // 有任何操作，给 planning 页面返回最新 planInfo 数据
    getInfo(e){
      console.log('getInfo', e);
      var myEventDetail = {
        planInfo: this.data.planInfo,
        dayIndex: this.data.dayIndex
      };  
      var myEventOption = {}; 
      this.triggerEvent('refresh', myEventDetail, myEventOption);
    },

    // 是否长按进入拖动状态，longpress 在 listTouchStart 之后触发
    longPress(e){
      if(this.data.disabled) return;    // 禁用组件

      console.log('longpress!');

      var index = e.currentTarget.dataset.index;   // 选中的是第几个
      var nowY = e.changedTouches[0].pageY;   // 长按点的 Y 坐标
      var height = this.data.itemHeight;  // 列表项的高度
      var itemY = index*height + this.data.demoTop; // 列表项本来的 Y 坐标
      // Y 方向偏移量
      var transY = nowY - height/2 - itemY;   
      this.setData({
        longpress: true,
        slide: false,
        touchIndex: index,
        transY: transY
      })

      wx.vibrateShort();
    },

    // 开始移动
    listTouchStart(e){
      console.log('start!');

      if(e.currentTarget.dataset.delete == 'delete'){
        this.setData({
          delete: true
        })
      }

      this.setData({
        slide: false,
        tap: false,
        touchIndex: e.currentTarget.dataset.index,  // 触发对象
        touchStartX: e.touches[0].pageX,
        touchStartY: e.touches[0].pageY
      })

      console.log('touchIndex: ' + this.data.touchIndex);
      console.log('touchStartX: ' + this.data.touchStartX);
      console.log('touchStartY: ' + this.data.touchStartY);
    },

    // 移动中
    listTouchMove(e){
      if(this.data.disabled) return;    // 禁用组件

      // 处理拖动
      if(this.data.longpress){
        this.pressmove(e);
      }
    },

    // 移动结束
    listTouchEnd(e){
      var delta_x = e.changedTouches[0].pageX - this.data.touchStartX;    // x 方向移动距离，右滑为正·
      var delta_y = e.changedTouches[0].pageY - this.data.touchStartY;    // y 方向移动距离，下滑为正

      if(this.data.longpress){      // 拖动事件
        // 禁止操作
        if(this.data.disabled) return;

        this.setData({
          longpress: false,
          touchIndex: -1,
        })
        console.log('end!');
      } else if (delta_x < -30){   // 左滑事件
        // 禁止操作
        if(this.data.disabled) return;

        console.log('touchEndX: ' + e.changedTouches[0].pageX);
        console.log('slide!');
        this.setData({   
          slide: true
        })
      }else if(Math.abs(delta_x) < 10 && Math.abs(delta_y) < 10){     // 点击事件
        if(this.data.delete){     // 点击删除事件
          this.setData({
            delete: false
          }) 
          console.log('delete!');
        }else{
          this.setData({
            tap: true
          })
          console.log('tap!');
        }
      }else{    // 滚动事件
        console.log('scroll');
      }

      this.getInfo();
      if(this.data.tap){
        this.toEdit(this.data.touchIndex);
      }
    },
  }
})
