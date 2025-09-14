Component({
    properties:{
        maxtime: {
            type: Number,
            value: 7
        },
        inTime: {
            type: 'String',
            value: ''
        },
        outTime: {
            type: 'String',
            value: ''
        },
        disabled: {
            type: Boolean,
            value: false,
        }
    },

    data: {
        //日历主体
        calendar: [],
        // 构建顶部星期
        date: ['日', '一', '二', '三', '四', '五', '六'],
        // inTime: '',
        // outTime: '',
        toDay:'2021-3-16',
        //当前年月和选择年月
        thisMonth:[2021,3],
        selectCalendar:[],
        days: 0
    },

    lifetimes:{
        attached(){
            console.log("demo");
            console.log(this.data.inTime);

            var that = this;
            // 获取本月时间
            var nowTime = new Date();
            var year = nowTime.getFullYear();
            var month = nowTime.getMonth();
            var day=nowTime.getDate();
            var time = [];
            var timeArray = {};
            //今天时间
            var toDay=year+'-'+(month+1 < 10 ? '0' + (month+1) : month+1)+'-'+(day < 10 ? '0' + day : day)
            var thisMonth=[year,month+1]
            that.setData({        //设置今天时间
                toDay:toDay,
                thisMonth:thisMonth,
                selectCalendar:thisMonth
            })
            // 循环6个月的数据
            for (var i = 0 ; i < 6; i++) {
                year = month+1 > 12 ? year + 1 : year;
                month = month+1 > 12 ? 1 : month+1;
                // 每个月的数据
                time = that.dataInit(year, month);
                // 接收数据
                timeArray[year + '年' + month+ '月'] = time;
            };
            that.setData({
                calendar: timeArray
            });
            console.log("calendar:")
            console.log(timeArray)
        },
    },

    methods:{

        // 日历初始化
        dataInit (setYear, setMonth) {
            // 当前时间/传入的时间
            var now = setYear ? new Date(setYear, setMonth) : new Date();
            var year = setYear || now.getFullYear();
            // 传入的月份已经加1
            var month = setMonth || now.getMonth() + 1;
            // 构建某日数据时使用
            var obj = {};
            // 需要遍历的日历数组数据
            var dateArr = [];
            // 需要的格子数，为当前星期数+当月天数
            var arrLen = 0;
            // 该月加1的数值，如果大于11，则为下年，月份重置为1
            // 目标月1号对应的星期
            var startWeek = new Date(year + '-' + (month < 10 ? '0' + month : month) + '-01').getDay();
            //获取目标月有多少天
            var dayNums = new Date(year, month < 10 ? '0' + month : month, 0).getDate();
            var num = 0;
            // 计算当月需要的格子数 = 当前星期数+当月天数
            arrLen = startWeek * 1 + dayNums * 1;
            for (var i = 0; i < arrLen; i++) {
            if (i >= startWeek) {
                num = i - startWeek + 1;
                obj = {
                /*
                * 返回值说明
                * isToday ： 2018-12-27
                * dateNum :  27
                */
                isToday: year + '-' + (month < 10 ? '0' + month : month) + '-' + (num < 10 ? '0' + num : num),
                dateNum: num
                }
            } else {
                // 填补空缺
                // 例如2018-12月第一天是星期6，则需要补6个空格
                obj = {};
            }
            dateArr[i] = obj;
            };
            return dateArr;
        },

        //转到上下月份
        switchMonth(e) {
            var index = e.currentTarget.dataset.index;
            var t=[this.data.selectCalendar[0],this.data.selectCalendar[1]]
            if (parseInt(index) === 1) {
                t=t[1]+1>12?[t[0]+1,t[1]-11]:[t[0],t[1]+1]
            } else if (parseInt(index) === -1) {
                t=t[1]-1<1?[t[0]-1,t[1]+11]:[t[0],t[1]-1]
            }
            this.setData({
                selectCalendar:t
            })
        },

        // 点击了日期，选择入住时间或者离店时间
        dayClick (e) {
            var that = this;
            var eTime = e.currentTarget.dataset.day;
            var inTime = that.data.inTime;
            var outTime = that.data.outTime;
            var startDay=Date.parse(inTime);
            var endDay=Date.parse(eTime);
            var days=(endDay-startDay)/(1000*60*60*24)+1;

            // 组件被禁用
            if(that.data.disabled){
                return;
            }

            // 该语句放在dayClick函数的所有if判断之前
            if(eTime < that.data.toDay) {
                wx.showToast({
                    title: '时间不早于今天',
                    icon: 'none'
                })
                return false;
            }

            if (inTime == '' || (new Date(eTime) <= new Date(inTime)) || outTime != '') {
                // 如果入住时间为空或选择的时间小于等于入住时间，则选择的时间为入住时间
                inTime = eTime;
                outTime = '';
                days = 0;
            } else {
                if(days>that.properties.maxtime){
                    wx.showToast({
                        title: '时间不超过' + that.data.maxtime + '天',
                        icon: 'none'
                    });
                    inTime='';
                    days = 0;
                }else{
                    outTime = eTime;
                }
            };

            that.setData({
                inTime: inTime,
                outTime: outTime,
                days: days,
            })

            // detail对象，提供给事件监听函数
            var myEventDetail = {   
                inTime: that.data.inTime,
                outTime: that.data.outTime,
                days: days
            }
            var myEventOption = {bubbles:true}      // 触发事件的选项
            this.triggerEvent('myevent', myEventDetail, myEventOption);
        },
    },
})
