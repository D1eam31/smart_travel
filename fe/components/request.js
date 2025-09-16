const request = (url) => {
  return new Promise((resolve,reject)=>{
    wx.request({
      url: url,
      success:(result)=>{
        resolve(result);
      },
      fail:(err)=>{
        reject(err);
      }
    })
  })
}

module.exports = {
  request,
}