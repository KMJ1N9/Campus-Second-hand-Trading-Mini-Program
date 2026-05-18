const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const {
    category = 'all',
    keyword = '',
    sort = 'create_time',
    order = 'desc',
    page = 1,
    pageSize = 10,
    status = 'selling'
  } = event;

  try {
    let query = db.collection('goods').where({
      status: status
    });

    if (category && category !== 'all') {
      query = query.where({ category: category });
    }

    if (keyword) {
      query = query.where(
        _.or([
          { title: db.RegExp({ regexp: keyword, options: 'i' }) },
          { description: db.RegExp({ regexp: keyword, options: 'i' }) }
        ])
      );
    }

    const sortField = sort === 'price' ? 'price' : sort === 'view_count' ? 'view_count' : 'create_time';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const totalResult = await query.count();
    const total = totalResult.total;

    const result = await query
      .orderBy(sortField, sortOrder)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      success: true,
      data: result.data,
      total: total,
      page: page,
      pageSize: pageSize
    };
  } catch (e) {
    console.error('getGoodsList error:', e);
    return { success: false, error: e.message, data: [] };
  }
};
