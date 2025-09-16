const data = require('./cityInfo.js'); 

Page({
    data: {
        cityList: [],   // 城市选择器
        provinces: [],  // 省份
        cities: [], // 城市
        cityIndex: [0, 0],
        tempList: [],   // picker 当前选择
        tempIndex: [0, 0],

        startTime: '',  // 出行时间选择
        endTime: '',
        days: 0
    },

    //上报城市点击次数
    // reportCityAnalytics(e){
    //     var tocity=this.data.endChoices[this.data.endIndex];
    //     wx.reportAnalytics('choose_city', {
    //         city:tocity,
    //     });
    // },

    onLoad(query){
        // 获取城市列表
        this.initCities();
    },

    // 从 cityInfo 获取省市列表
    initCities(e){
        var provinces = data.provinces;
        var cities = data.cities;

        this.setData({
            cityList: [provinces, cities[0]],
            provinces,
            cities,
            tempList: [provinces, cities[0]],
        })
    },
    
    // 省市联动，第一列改变第二列随之变化
    columnChange(e){
        console.log(e);
        if(e.detail.column === 0){
            this.setData({
                tempList: [this.data.provinces, this.data.cities[e.detail.value]],
                tempIndex: [e.detail.value, 0]
            })
        }
    },

    // 确定后，将 picker 选择的城市同步
    cityChange(e){
        console.log(e)
        var index = e.detail.value;
        if(index[1] === 'e'){
            index[1] = 0;
        }
        this.setData({
            cityList: this.data.tempList,
            cityIndex: index
        })
    },

    // 监听 calendar 组件日期选择
    listener(e){
        console.log(e)

        this.setData({
            startTime:e.detail.inTime,
            endTime:e.detail.outTime,
            days: e.detail.days
        })
    },

    //提交表单
    handleSubmit(e){
        // this.reportCityAnalytics();      // 上报数据

        var place = this.data.cityList[1][this.data.cityIndex[1]];
        var days = this.data.days;
        var startTime = this.data.startTime;
        var endTime = this.data.endTime;

        if(days === 0){
            wx.showToast({
                title: '请选择出行时间',
                image: '../../images/smile.png'
            })
            return false;
        }

        wx.navigateTo({
            url:'../planning/planning'+'?place=' + place +  '&days=' + days + '&startTime=' + startTime + '&endTime=' + endTime + '&mode=0'
        })
    }
});