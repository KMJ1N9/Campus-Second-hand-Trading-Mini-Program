const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { keyword, page = 1, pageSize = 20 } = event;

  if (!keyword) {
    return { success: true, data: [] };
  }

  try {
    const result = await db.collection('goods')
      .where(_.and([
        { status: 'selling' },
        _.or([
          { title: db.RegExp({ regexp: keyword, options: 'i' }) },
          { description: db.RegExp({ regexp: keyword, options: 'i' }) },
          { tags: db.RegExp({ regexp: keyword, options: 'i' }) }
        ])
      ]))
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      success: true,
      data: result.data,
      total: result.data.length
    };

  } catch (e) {
    console.error('searchGoods error:', e);
    return { success: false, error: e.message, data: [] };
  }
};
