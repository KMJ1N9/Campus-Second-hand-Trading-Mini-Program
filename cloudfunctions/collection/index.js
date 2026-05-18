const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return { success: false, error: '请先登录' };
  }

  const { action = 'toggle', goodsId, page = 1, pageSize = 20 } = event;

  try {
    switch (action) {

      case 'toggle': {
        if (!goodsId) return { success: false, error: '缺少商品ID' };

        const exist = await db.collection('collections')
          .where({ user_id: openid, goods_id: goodsId })
          .get();

        if (exist.data.length > 0) {
          await db.collection('collections').doc(exist.data[0]._id).remove();
          await db.collection('goods').doc(goodsId).update({
            data: { like_count: _.inc(-1) }
          });
          return { success: true, liked: false };
        } else {
          await db.collection('collections').add({
            data: { user_id: openid, goods_id: goodsId, create_time: new Date() }
          });
          await db.collection('goods').doc(goodsId).update({
            data: { like_count: _.inc(1) }
          });
          return { success: true, liked: true };
        }
      }

      case 'list': {
        const totalResult = await db.collection('collections')
          .where({ user_id: openid })
          .count();

        const collections = await db.collection('collections')
          .where({ user_id: openid })
          .orderBy('create_time', 'desc')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();

        const goodsIds = collections.data.map(c => c.goods_id);
        if (goodsIds.length === 0) {
          return { success: true, data: [], total: 0 };
        }

        const goodsResults = await db.collection('goods')
          .where({ _id: _.in(goodsIds) })
          .get();

        const goodsMap = {};
        goodsResults.data.forEach(g => { goodsMap[g._id] = g; });

        const data = collections.data
          .map(c => goodsMap[c.goods_id])
          .filter(Boolean);

        return { success: true, data, total: totalResult.total };
      }

      default:
        return { success: false, error: '未知操作' };
    }

  } catch (e) {
    console.error('collection error:', e);
    return { success: false, error: e.message };
  }
};
