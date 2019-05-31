// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  // var googsid = event.goodsid
  try {
    return await db.collection('goodsInfo').doc(event.goodsid).update({
      data:{
        exist:false
      },
      success(res){
        console.log("[transaction][更新商品状态] 成功：",res);
      },fail(err){
        console.err("[transaction][更新商品状态] 失败：",err);
      }
    })
  } catch (e) {
    console.log(e)
  }
}