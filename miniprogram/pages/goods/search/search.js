const api = require('../../../utils/api.js');
const storage = require('../../../utils/storage.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    keyword: '',
    historyList: [],
    results: [],
    loading: false
  },

  onLoad: function () {
    this.setData({ historyList: storage.getSearchHistory() });
    this._debouncedSearch = util.debounce(this._doSearch.bind(this), 300);
  },

  onInput: function (e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    this._debouncedSearch(keyword);
  },

  _doSearch: function (keyword) {
    if (!keyword.trim()) return;

    storage.addSearchHistory(keyword);
    this.setData({
      historyList: storage.getSearchHistory(),
      loading: true
    });

    api.searchGoods(keyword).then(res => {
      this.setData({
        results: res.data || [],
        loading: false
      });
    }).catch(() => {
      this.setData({ loading: false });
      util.showToast('搜索失败');
    });
  },

  onSearch: function (e) {
    const keyword = e.detail.value || this.data.keyword;
    if (!keyword.trim()) return;

    storage.addSearchHistory(keyword);
    this.setData({
      keyword: keyword,
      historyList: storage.getSearchHistory(),
      loading: true
    });

    api.searchGoods(keyword).then(res => {
      this.setData({
        results: res.data || [],
        loading: false
      });
    }).catch(() => {
      this.setData({ loading: false });
      util.showToast('搜索失败');
    });
  },

  onClear: function () {
    this.setData({ keyword: '', results: [] });
  },

  onHistoryTap: function (e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.onSearch({ detail: { value: keyword } });
  },

  onClearHistory: function () {
    storage.clearSearchHistory();
    this.setData({ historyList: [] });
  },

  onCancel: function () {
    wx.navigateBack({ delta: 1 });
  },

  onGoodsTap: function (e) {
    const goods = e.detail.goods;
    if (!goods || !goods._id) return;
    wx.navigateTo({ url: '/pages/goods/detail/detail?id=' + goods._id });
  }
});
