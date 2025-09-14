var app = getApp();

Page({
    data: {
        planIndex: [],
    },

    onShow(e){
        var that=this;
        var planIndex=[];
        wx.getStorage({       // 获取存储的方案目录信息
            key: 'planIndex',
            success: res => {
                if(res.data!=''){
                    planIndex = res.data;
                }
                that.setData({
                    planIndex,
                })
                console.log("planIndex");
                console.log(that.data.planIndex);
            }
        });
    },
    
    //跳转到行程信息查看页面
    planDetail(e){
        var index = e.currentTarget.dataset.index;
        var planIntro = this.data.planIndex[index];
        wx.navigateTo({
            url: '../planning/planning?place=' + planIntro.place + '&days=' + planIntro.days + '&startTime=' + planIntro.startTime + '&endTime=' + planIntro.endTime + '&mode=' + 2 + '&timeKey=' + planIntro.timeKey + '&timeIndex=' + index,
        });
    },

    // 删除方案
    deletePlan(e){
        var index = e.currentTarget.dataset.index;
        var that = this;
        var planIndex = that.data.planIndex;
        var timeKey = that.data.planIndex[index].timeKey;   // 要删除方案

        wx.showModal({
            title: '提示',
            content: '您确定要删除此方案吗',
            cancelText: '保留',
            cancelColor: '#477fe7',
            confirmText: '删除',
            confirmColor: '#000000',
            success(res){
                if(res.confirm){    // 用户点击删除
                    planIndex.splice(index, 1)     // 在planIndex删除

                    console.log("删除后")
                    console.log(planIndex)
                    // 更新方案目录数组
                    that.setData({      
                        planIndex: planIndex
                    });
                    wx.setStorage({     
                        key: 'planIndex',
                        data: planIndex
                    });
                    // 删除此方案信息
                    wx.removeStorage({        
                        key: timeKey,
                        success: res => {
                            wx.showToast({
                                title: '删除成功！',
                            });
                        }
                    });
                }
            },
            fail(err){
                console.log(err);
            }
        })
    },

    // 创建行程，跳转到登录或信息填写页面
    createPlan(e){
        if(app.globalData.isLogin){
            wx.navigateTo({
                url: '../msgForm/msgForm'
            })
        }else{
            wx.navigateTo({
                url: '../login/login?tarUrl=msgForm'
            })
        }
    },
});