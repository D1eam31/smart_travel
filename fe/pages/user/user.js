const app = getApp();
Page({
    data:{
        user:{},
        isLogin:false,
        toUrl:'../login/login',
    },

    onShow(e){
        if(app.globalData.isLogin){     // 已登录
            this.setData({
                user:{
                    avatarUrl:app.globalData.user.avatarUrl,
                    nickName:app.globalData.user.nickName
                },
                toUrl:'',
                isLogin:true
            })
        }
    },

    //登录
    toLogin(e){
        wx.navigateTo({
            url:'../login/login'
        })
    },

    //用户登录后才能开放此功能
    tapList(e){
        var curFunc=e.currentTarget.dataset.curFunc
        // console.log(e);
        if(!app.globalData.isLogin&&curFunc=='problem'){
            wx.showToast({
                title:'请登录后使用',
                image:'../../images/smile.png'
            })
        }else{
            wx.navigateTo({
              url: '../' + curFunc + '/' +curFunc,
            })
        }
    },

    noFunction(e){
        wx.showToast({
            title: '敬请期待',
            image:'../../images/smile.png'
        });
    },
});