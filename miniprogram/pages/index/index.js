const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    categories: [],
    activeCategory: 'all',
    searchKeyword: '',
    sortType: 'create_time',

    goodsList: [],
    leftList: [],
    rightList: [],

    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    loadingMore: false,
    showBackTop: false
  },

  onLoad: function () {
    this.setData({ categories: app.globalData.categories });
    this.loadGoods();
  },

  onShow: function () {
    if (this.data.goodsList.length > 0) {
      this.loadGoods(true);
    }
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

  onPageScroll: function (e) {
    this.setData({ showBackTop: e.scrollTop > 500 });
  },

  /* 加载商品列表 */
  loadGoods: function (refresh = false) {
    if (this.data.loading) return;

    this.setData({
      loading: !refresh || this.data.goodsList.length === 0,
      page: 1,
      hasMore: true
    });

    return this.fetchGoods(1, refresh);
  },

  loadMore: function () {
    if (!this.data.hasMore || this.data.loadingMore) return;

    this.setData({ loadingMore: true });
    const nextPage = this.data.page + 1;
    this.fetchGoods(nextPage, false);
  },

  fetchGoods: function (page, refresh) {
    const { activeCategory, searchKeyword, sortType, pageSize } = this.data;

    let sort = 'create_time';
    let order = 'desc';
    if (sortType === 'price_asc') { sort = 'price'; order = 'asc'; }
    if (sortType === 'price_desc') { sort = 'price'; order = 'desc'; }
    if (sortType === 'view_count') { sort = 'view_count'; order = 'desc'; }

    return api.getGoodsList({
      category: activeCategory,
      keyword: searchKeyword,
      sort: sort,
      order: order,
      page: page,
      pageSize: pageSize
    }).then(res => {
      const rawList = refresh ? res.data : [...this.data.goodsList, ...res.data];
      
      const list = rawList.map(item => ({
        ...item,
        price: Number(item.price) || 0,
        originalPrice: item.originalPrice || item.original_price || null,
        original_price: item.original_price || null,
        conditionName: item.conditionName || util.getConditionName(item.condition),
        categoryName: item.categoryName || util.getCategoryName(item.category),
        like_count: Number(item.like_count) || 0,
        view_count: Number(item.view_count) || 0
      }));

      const leftList = [];
      const rightList = [];

      list.forEach((item, index) => {
        if (index % 2 === 0) {
          leftList.push(item);
        } else {
          rightList.push(item);
        }
      });

      this.setData({
        goodsList: list,
        leftList: leftList,
        rightList: rightList,
        page: page,
        hasMore: res.data.length >= pageSize,
        loading: false,
        loadingMore: false
      });
    }).catch(() => {
      this.setData({ loading: false, loadingMore: false });
      util.showToast('加载失败，请重试');
    });
  },

  /* 搜索 */
  onSearchInput: function (e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearch: function (e) {
    const keyword = e.detail.value || this.data.searchKeyword;
    this.setData({ searchKeyword: keyword });
    this.loadGoods(true);
  },

  onSearchFocus: function () {
    wx.navigateTo({ url: '/pages/goods/search/search' });
  },

  /* 分类切换 */
  onCategoryChange: function (e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeCategory) return;
    this.setData({ activeCategory: id });
    this.loadGoods(true);
  },

  /* 排序切换 */
  onSortChange: function (e) {
    const sort = e.currentTarget.dataset.sort;
    if (sort === this.data.sortType) return;
    this.setData({ sortType: sort });
    this.loadGoods(true);
  },

  /* 商品点击 */
  onGoodsTap: function (e) {
    const goods = e.detail.goods;
    if (!goods || !goods._id) return;
    api.addHistory(goods._id);
    wx.navigateTo({ url: '/pages/goods/detail/detail?id=' + goods._id });
  },

  /* 去发布 */
  onGoPublish: function () {
    wx.switchTab({ url: '/pages/publish/publish' });
  },

  /* 回到顶部 */
  onBackTop: function () {
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

});
