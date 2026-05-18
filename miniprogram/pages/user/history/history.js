const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    list: [],
    loading: true
  },

  onShow: function () {
    this.loadHistory();
  },

  loadHistory: function () {
    this.setData({ loading: true });

    api.getHistory().then(historyList => {
      if (!historyList || historyList.length === 0) {
        this.setData({ list: [], loading: false });
        return;
      }

      const goodsIds = [...new Set(historyList.map(item => item.goodsId))];

      const promises = goodsIds.map(id =>
        api.getGoodsDetail(id)
          .then(res => {
            if (res && res.data) {
              return res.data.goods || res.data;
            }
            return null;
          })
          .catch(() => null)
      );

      Promise.all(promises).then(goodsArray => {
        const list = goodsArray.filter(item => item !== null);
        this.setData({ list, loading: false });
      }).catch(() => {
        this.setData({ loading: false });
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  onClearAll: function () {
    util.showConfirm({
      title: '清除历史',
      content: '确定要清除全部浏览记录吗？',
      confirmText: '清除'
    }).then(confirmed => {
      if (!confirmed) return;
      wx.removeStorage({
        key: 'historyList',
        success: () => {
          this.setData({ list: [] });
          util.showToast('已清除');
        }
      });
    });
  },

  onGoodsTap: function (e) {
    const goods = e.detail.goods;
    api.addHistory(goods._id);
    wx.navigateTo({ url: '/pages/goods/detail/detail?id=' + goods._id });
  }
});
