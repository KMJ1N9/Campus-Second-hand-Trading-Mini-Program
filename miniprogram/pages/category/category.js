const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    categories: [],
    activeCategory: 'all',
    activeCategoryName: '热门推荐',
    goodsList: [],
    leftList: [],
    rightList: [],
    loading: false
  },

  onLoad: function () {
    const categories = app.globalData.categories.filter(c => c.id !== 'all');
    this.setData({ categories });
    this.loadGoods();
  },

  loadGoods: function (categoryId) {
    this.setData({ loading: true });

    const id = categoryId || this.data.activeCategory;
    return api.getGoodsList({
      category: id,
      page: 1,
      pageSize: 20
    }).then(res => {
      const leftList = [];
      const rightList = [];
      (res.data || []).forEach((item, index) => {
        if (index % 2 === 0) leftList.push(item);
        else rightList.push(item);
      });

      this.setData({
        goodsList: res.data || [],
        leftList, rightList,
        loading: false
      });
    }).catch(() => {
      this.setData({ loading: false });
      util.showToast('加载失败');
    });
  },

  onCategoryTap: function (e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeCategory) return;

    const cat = app.globalData.categories.find(c => c.id === id);
    this.setData({
      activeCategory: id,
      activeCategoryName: cat ? cat.name : ''
    });
    this.loadGoods(id);
  },

  onGoodsTap: function (e) {
    const goods = e.detail.goods;
    if (!goods || !goods._id) return;
    wx.navigateTo({ url: '/pages/goods/detail/detail?id=' + goods._id });
  }
});
