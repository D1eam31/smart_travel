const app = getApp();
Page({
    data: {
        logoUrl: '../../images/logo.jpg',
        title: '智慧游',
        descriptions: ['欢迎使用智慧游，我们将为您提供', '个性化的行程定制服务！'],
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        isLogin: app.globalData.isLogin,
        tarUrl: '',
        type: ''
    },

    onLoad(query){
        if(!(query.tarUrl == undefined)){
            this.setData({
                tarUrl: query.tarUrl,
            })
        }
    },

    onTap() {
        // 不能使用
        if (!this.data.canIUse) {
            this.getAuthorize();
        }
    },

    //授权获取个人信息
    getAuthorize() {
        wx.authorize({
            scope: 'scope.userInfo',
            success: (res) => {
                this.getUserInfo();
            },
            fail: err => {
                const errTable = {
                    '10001': '服务器数据异常',
                    '10002': '网络异常，请查看您的网络设置',
                    '10003': '需要授权',
                    '10004': '未登录，请先登录百度账号',
                    '10005': '获取授权失败'
                };
                wx.showToast(errTable[err.errCode] || '请稍后重试');
            }
        });
    },

    // 获取用户信息的回调函数
    getUserInfo(e) {
        wx.login({
            success(res){
                if(res.code){
                    console.log(res.code);
                }else{
                    console.log('登录失败');
                    console.log(res.errMsg);
                }
            }
        })

        if(e.detail.userInfo == undefined){       //用户拒绝登录
            wx.showToast({
                title:'登录失败',
                image:'/images/error.png'
            })
            return false;
        }
        console.log(e)
        app.globalData.isLogin=true
        app.globalData.user=e.detail.userInfo
        this.setData('isLogin',true)
        wx.setStorage({
            key: 'userInfo',
            data: {
                nickName:e.detail.userInfo.nickName,
                avatarUrl:e.detail.userInfo.avatarUrl
            }
        });
        wx.showToast({
            title:'已登录,'+e.detail.userInfo.nickName,
            icon:"none",
        })
        
        //跳转
        var tarUrl = this.data.tarUrl;
        var toUrl = "../" + tarUrl + "/" + tarUrl;
        console.log(toUrl);
        if(tarUrl==''){     // 用户页登录
            wx.navigateBack({
                delta:1,
            })
        }else{  // 首页登录
            wx.navigateTo({
                url:toUrl
            });
        }
    },
});
