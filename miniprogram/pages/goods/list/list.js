const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    category: 'all',
    categoryName: '',
    goodsList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: true,
    loadingMore: false
  },

  onLoad: function (options) {
    const cat = options.cat || 'all';
    this.setData({
      category: cat,
      categoryName: util.getCategoryName(cat)
    });
    wx.setNavigationBarTitle({
      title: this.data.categoryName + ' · 商品列表'
    });
    this.loadGoods();
  },

  onPullDownRefresh: function () {
    this.loadGoods(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  loadGoods: function (refresh) {
    this.setData({
      loading: !refresh || this.data.goodsList.length === 0,
      page: 1,
      hasMore: true
    });
    return this.fetchGoods(1, !!refresh);
  },

  loadMore: function () {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true });
    const page = this.data.page + 1;
    this.fetchGoods(page, false);
  },

  fetchGoods: function (page, refresh) {
    return api.getGoodsList({
      category: this.data.category,
      page: page,
      pageSize: this.data.pageSize,
      status: 'selling'
    }).then(res => {
      const list = refresh ? res.data : [...this.data.goodsList, ...res.data];
      this.setData({
        goodsList: list,
        page: page,
        hasMore: res.data.length >= this.data.pageSize,
        loading: false,
        loadingMore: false
      });
    }).catch(() => {
      this.setData({ loading: false, loadingMore: false });
      util.showToast('加载失败，请重试');
    });
  },

  onGoodsTap: function (e) {
    const goods = e.detail.goods;
    if (!goods || !goods._id) return;
    api.addHistory(goods._id);
    wx.navigateTo({ url: '/pages/goods/detail/detail?id=' + goods._id });
  }
});
