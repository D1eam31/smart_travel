Page({
    data: {
        problemText:'',
        connectMsg:''
    },
    
    getProblem(e){
        console.log("getproblem:")
        var problemText=e.detail.value
        console.log(problemText)
        this.setData({
            problemText:problemText
        })
    },

    getConnect(e){
        console.log("getconnect:")
        var connectMsg=e.detail.value
        console.log(connectMsg)
        this.setData({
            connectMsg:connectMsg
        })
    },

    //提交反馈
    submitProblem(e){
        var that=this
        var text=that.data.problemText
        var mail=that.data.connectMsg
        if(text==''){
            console.log("内容为空")
            wx.showToast({
                title:'请输入反馈内容',
                image:'../../images/smile.png',
            })
            return;
        }
        wx.request({
            url: 'https://witrip.wizzstudio.com/problem/problem',
            method:'POST',
            dataType:'json',
            data:{
                "text":text,
                "mail":mail
            },
            success:res=>{
                console.log(res.statusCode)
                if(res.statusCode===200){
                    wx.showToast({
                        title: '反馈成功',
                        success(){
                            var timeout=setTimeout(function(){
                                wx.navigateBack()
                            }, 500);
                        }
                    });
                }else{
                    wx.showToast({
                        title: '反馈失败',
                        image:'../../images/error.png',
                        success(){
                            var timeout=setTimeout(function(){
                                wx.navigateBack()
                            }, 500);
                        }
                    });
                }
            }
        });

    }
});