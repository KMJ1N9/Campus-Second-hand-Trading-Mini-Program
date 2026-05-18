const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 校验逻辑，与前端 validator.js 保持一致
function validateGoods(goodsData) {
  if (!goodsData.images || goodsData.images.length === 0) {
    return { valid: false, error: '请至少上传1张商品图片', code: 'ERR_GOODS_IMAGES_REQUIRED' };
  }
  if (goodsData.images.length > 9) {
    return { valid: false, error: '最多上传9张图片', code: 'ERR_GOODS_IMAGES_REQUIRED' };
  }

  if (!goodsData.title || !goodsData.title.trim()) {
    return { valid: false, error: '请输入商品标题', code: 'ERR_GOODS_TITLE_REQUIRED' };
  }
  if (goodsData.title.trim().length > 30) {
    return { valid: false, error: '商品标题不能超过30个字', code: 'ERR_GOODS_TITLE_REQUIRED' };
  }

  if (!goodsData.price && goodsData.price !== 0) {
    return { valid: false, error: '请输入价格', code: 'ERR_GOODS_PRICE_REQUIRED' };
  }
  const priceNum = Number(goodsData.price);
  if (isNaN(priceNum)) {
    return { valid: false, error: '价格必须是数字', code: 'ERR_GOODS_PRICE_REQUIRED' };
  }
  if (priceNum < 0.01) {
    return { valid: false, error: '价格不能小于0.01', code: 'ERR_GOODS_PRICE_REQUIRED' };
  }

  if (goodsData.originalPrice) {
    const origNum = Number(goodsData.originalPrice);
    if (isNaN(origNum)) {
      return { valid: false, error: '原价必须是数字', code: 'ERR_GOODS_PRICE_REQUIRED' };
    }
  }

  if (!goodsData.category) {
    return { valid: false, error: '请选择商品分类', code: 'ERR_GOODS_CATEGORY_REQUIRED' };
  }

  if (!goodsData.condition) {
    return { valid: false, error: '请选择商品成色', code: 'ERR_GOODS_CONDITION_REQUIRED' };
  }

  if (!goodsData.description || !goodsData.description.trim()) {
    return { valid: false, error: '请输入商品描述', code: 'ERR_GOODS_DESC_REQUIRED' };
  }
  if (goodsData.description.trim().length > 500) {
    return { valid: false, error: '商品描述不能超过500个字', code: 'ERR_GOODS_DESC_REQUIRED' };
  }

  return { valid: true };
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { goodsData } = event;

  if (!openid) {
    return { success: false, error: '请先登录', code: 'ERR_NOT_LOGIN' };
  }

  if (!goodsData) {
    return { success: false, error: '缺少商品数据', code: 'ERR_GOODS_VALIDATION' };
  }

  // 完整校验
  const validation = validateGoods(goodsData);
  if (!validation.valid) {
    return { success: false, error: validation.error, code: validation.code };
  }

  try {
    const title = goodsData.title.trim();
    const description = goodsData.description.trim();

    // 文本内容安全审核
    const textToCheck = title + '。' + description;
    const msgCheckResult = await cloud.openapi.security.msgSecCheck({
      content: textToCheck
    }).catch(err => {
      console.error('msgSecCheck error:', err);
      return null;
    });

    if (msgCheckResult && msgCheckResult.result && msgCheckResult.result.suggest === 'risky') {
      return {
        success: false,
        error: '商品信息包含违规内容，请修改后重试',
        code: 'ERR_CONTENT_RISKY'
      };
    }

    // 图片内容安全审核
    const images = goodsData.images || [];
    for (let i = 0; i < images.length; i++) {
      const imgFileId = images[i];
      if (!imgFileId.startsWith('cloud://')) continue;

      try {
        const downloadResult = await cloud.downloadFile({ fileID: imgFileId });
        const imgCheckResult = await cloud.openapi.security.imgSecCheck({
          media: {
            contentType: 'image/jpeg',
            value: downloadResult.fileContent
          }
        }).catch(err => {
          console.error('imgSecCheck error for image', i, ':', err.errCode);
          return null;
        });

        if (imgCheckResult && imgCheckResult.result && imgCheckResult.result.suggest === 'risky') {
          return {
            success: false,
            error: '商品图片包含违规内容，请更换后重试',
            code: 'ERR_IMAGE_RISKY'
          };
        }
      } catch (downloadErr) {
        console.error('downloadFile error for image', i, ':', downloadErr);
      }
    }

    const now = new Date();

    const data = {
      title: title,
      description: description,
      price: Number(goodsData.price),
      original_price: goodsData.originalPrice ? Number(goodsData.originalPrice) : null,
      images: images,
      category: goodsData.category,
      condition: goodsData.condition,
      status: 'selling',
      seller_id: openid,
      view_count: 0,
      like_count: 0,
      location: goodsData.location || '',
      tags: goodsData.tags || [],
      create_time: now,
      update_time: now
    };

    const result = await db.collection('goods').add({ data });

    return {
      success: true,
      data: { _id: result._id }
    };

  } catch (e) {
    console.error('publishGoods error:', e);
    return { success: false, error: e.message, code: 'ERR_UNKNOWN' };
  }
};
