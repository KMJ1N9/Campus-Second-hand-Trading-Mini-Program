const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { id } = event;

  if (!id) {
    return { success: false, error: '缺少商品ID' };
  }

  try {
    const goodsResult = await db.collection('goods').doc(id).get();
    const goods = goodsResult.data;

    if (!goods) {
      return { success: false, error: '商品不存在' };
    }

    // 增加浏览量
    await db.collection('goods').doc(id).update({
      data: {
        view_count: db.command.inc(1)
      }
    });

    // 获取卖家信息
    let seller = null;
    if (goods.seller_id) {
      const sellerResult = await db.collection('users').doc(goods.seller_id).get();
      seller = sellerResult.data || null;

      if (seller) {
        delete seller.phone;
        delete seller.wechat_id;
        delete seller.student_id;
      }
    }

    return {
      success: true,
      data: {
        goods: goods,
        seller: seller,
        view_count: (goods.view_count || 0) + 1
      }
    };
  } catch (e) {
    console.error('getGoodsDetail error:', e);
    return { success: false, error: e.message };
  }
};
