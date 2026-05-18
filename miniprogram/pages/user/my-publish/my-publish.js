const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    activeTab: 'selling',
    goodsList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: true,
    loadingMore: false
  },

  onLoad: function () {
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

  /* Tab 切换 */
  onTabChange: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab, goodsList: [] });
    this.loadGoods();
  },

  /* 加载商品 */
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
      status: this.data.activeTab,
      page: page,
      pageSize: this.data.pageSize
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
      util.showToast('加载失败');
    });
  },

  /* 商品点击 -> 进入详情 */
  onGoodsTap: function (e) {
    const goods = e.detail.goods;
    if (!goods || !goods._id) return;
    api.addHistory(goods._id);
    wx.navigateTo({ url: '/pages/goods/detail/detail?id=' + goods._id });
  },

  /* 编辑 */
  onEdit: function (e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    app.globalData.editId = id;
    wx.switchTab({ url: '/pages/publish/publish' });
  },

  /* 删除 */
  onDelete: function (e) {
    const id = e.currentTarget.dataset.id;
    util.showConfirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这件商品吗？',
      confirmText: '删除',
      confirmColor: '#DC2626'
    }).then(confirmed => {
      if (!confirmed) return;
      util.showLoading('删除中...');
      api.deleteGoods(id).then(() => {
        util.hideLoading();
        util.showToast('已删除');
        // 从列表中移除
        const goodsList = this.data.goodsList.filter(item => item._id !== id);
        this.setData({ goodsList });
      }).catch(() => {
        util.hideLoading();
        util.showToast('删除失败');
      });
    });
  },

  /* 去发布 */
  onGoPublish: function () {
    wx.switchTab({ url: '/pages/publish/publish' });
  }
});
