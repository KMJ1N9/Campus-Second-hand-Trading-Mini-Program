const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { id, updateData } = event;

  if (!openid) return { success: false, error: '请先登录' };
  if (!id) return { success: false, error: '缺少商品ID' };

  try {
    const goodsResult = await db.collection('goods').doc(id).get();
    const goods = goodsResult.data;

    if (!goods) return { success: false, error: '商品不存在' };
    if (goods.seller_id !== openid) return { success: false, error: '无权操作该商品' };

    const data = {
      ...updateData,
      update_time: new Date()
    };

    // 删除操作
    if (updateData.status === 'deleted') {
      await db.collection('goods').doc(id).remove();
      return { success: true, message: '已删除' };
    }

    // 如果是修改状态为sold，更新卖家信息
    await db.collection('goods').doc(id).update({ data });

    return { success: true, data: { _id: id, ...data } };

  } catch (e) {
    console.error('updateGoods error:', e);
    return { success: false, error: e.message };
  }
};
