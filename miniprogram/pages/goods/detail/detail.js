const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    goodsId: '',
    goods: {},
    seller: {},
    isLiked: false,
    loading: true,
    util: util
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ goodsId: options.id });
      this.loadDetail();
    }
  },

  loadDetail: function () {
    this.setData({ loading: true });

    api.getGoodsDetail(this.data.goodsId).then(res => {
      if (res.data) {
        const goods = {
          ...res.data.goods,
          price: Number(res.data.goods.price) || 0,
          originalPrice: res.data.goods.originalPrice || res.data.goods.original_price || null,
          original_price: res.data.goods.original_price || null,
          conditionName: res.data.goods.conditionName || util.getConditionName(res.data.goods.condition),
          categoryName: res.data.goods.categoryName || util.getCategoryName(res.data.goods.category),
          like_count: Number(res.data.goods.like_count) || 0,
          view_count: res.data.view_count || Number(res.data.goods.view_count) || 0,
          create_time: res.data.goods.create_time,
          publishTimeText: util.formatTime(res.data.goods.create_time)
        };

        this.setData({
          goods: goods,
          seller: res.data.seller || {},
          loading: false
        });

        api.addHistory(this.data.goodsId);
        wx.setNavigationBarTitle({ title: res.data.goods.title || '商品详情' });

        this.checkIsLiked();
      } else {
        util.showToast('商品不存在');
        setTimeout(() => wx.navigateBack(), 1500);
      }
    }).catch(() => {
      this.setData({ loading: false });
      util.showToast('加载失败');
    });
  },

  checkIsLiked: function () {
    api.getCollections(1, 50).then(res => {
      const liked = (res.data || []).some(item =>
        item.goods_id === this.data.goodsId || item._id === this.data.goodsId
      );
      this.setData({ isLiked: liked });
    }).catch(() => {});
  },

  onPreviewImage: function (e) {
    const index = e.currentTarget.dataset.index;
    util.previewImages(this.data.goods.images || [], index);
  },

  onToggleLike: async function () {
    try {
      const res = await api.toggleCollection(this.data.goodsId);
      const isLiked = res.liked;
      this.setData({ isLiked });
      util.showToast(isLiked ? '已收藏' : '已取消收藏');

      const goods = { ...this.data.goods };
      goods.like_count = (goods.like_count || 0) + (isLiked ? 1 : -1);
      if (goods.like_count < 0) goods.like_count = 0;
      this.setData({ goods });
    } catch (err) {
      util.showToast('操作失败，请先登录');
    }
  },

  onContactSeller: function () {
    if (!this.data.seller._id) {
      util.showToast('卖家信息加载中...');
      return;
    }
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (userInfo._id === this.data.seller._id) {
      util.showToast('这是你自己发布的商品');
      return;
    }
    wx.navigateTo({
      url: '/pages/chat/chat?targetUserId=' + this.data.seller._id + '&goodsId=' + this.data.goodsId
    });
  },

  onShare: function () {},

  onShareAppMessage: function () {
    return {
      title: this.data.goods.title || '二手商品',
      path: '/pages/goods/detail/detail?id=' + this.data.goodsId,
      imageUrl: this.data.goods.images ? this.data.goods.images[0] : ''
    };
  }
});
