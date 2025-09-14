//app.js
App({
    globalData:{
        isLogin:false,
        user:{},
        loginButton:false,
        statusBarHeight: 20,
        Custom: 0,
        CustomBar: 0,
        windowWidth: 0,
    },

    onLaunch (e){
        var that = this
        // 获取登录信息
        wx.getStorage({
            key: 'userInfo',
            success: res => {
                if(!(res.data ==='')){
                    that.globalData.isLogin=true;
                    that.globalData.loginButton=false;
                    that.globalData.user=res.data;
                    console.log(res.data)
                }
            },
            fail:res=>{
                console.log("未登录")
            }
        });

        // 自定义导航栏，获取系统信息
        wx.getSystemInfo({
            success: e => {
                that.globalData.StatusBar = e.statusBarHeight;
                let custom = wx.getMenuButtonBoundingClientRect();
                that.globalData.Custom = custom;  
                that.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
                that.globalData.windowHeight = e.windowHeight;
                that.globalData.windowWidth = e.windowWidth
                // console.log( that.globalData.StatusBar );
                // console.log(custom);
            }
        })
    }
});