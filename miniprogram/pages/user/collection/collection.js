const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    list: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: true,
    loadingMore: false
  },

  onLoad: function () {
    this.loadCollections();
  },

  onPullDownRefresh: function () {
    this.loadCollections(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  loadCollections: function (refresh) {
    this.setData({
      loading: !refresh || this.data.list.length === 0,
      page: 1,
      hasMore: true
    });
    return this.fetchCollections(1, !!refresh);
  },

  loadMore: function () {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true });
    const page = this.data.page + 1;
    this.fetchCollections(page, false);
  },

  fetchCollections: function (page, refresh) {
    return api.getCollections(page, this.data.pageSize).then(res => {
      const list = refresh ? (res.data || []) : [...this.data.list, ...(res.data || [])];
      this.setData({
        list: list,
        page: page,
        hasMore: (res.data || []).length >= this.data.pageSize,
        loading: false,
        loadingMore: false
      });
    }).catch(() => {
      this.setData({ loading: false, loadingMore: false });
      util.showToast('加载失败');
    });
  },

  onGoodsTap: function (e) {
    const goods = e.detail.goods;
    if (!goods) return;
    const id = goods._id || goods.goods_id;
    if (!id) return;
    api.addHistory(id);
    wx.navigateTo({ url: '/pages/goods/detail/detail?id=' + id });
  }
});
