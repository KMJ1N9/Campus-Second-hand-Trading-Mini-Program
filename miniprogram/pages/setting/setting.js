var util = require('../../utils/util.js');
var config = require('../../utils/config.js');

Page({
  data: {
    cacheSize: '0KB',
    showAbout: false
  },

  onLoad: function () {
    this.calcCacheSize();
  },

  calcCacheSize: function () {
    try {
      var res = wx.getStorageInfoSync();
      var sizeKB = Math.round(res.currentSize);
      this.setData({
        cacheSize: sizeKB >= 1024 ? (sizeKB / 1024).toFixed(1) + 'MB' : sizeKB + 'KB'
      });
    } catch (e) {
      this.setData({ cacheSize: '未知' });
    }
  },

  onClearCache: function () {
    util.showConfirm({
      title: '清除缓存',
      content: '确定要清除所有本地缓存数据吗？这将清除登录信息、浏览历史等。',
      confirmText: '清除',
      confirmColor: '#DC2626'
    }).then(function (confirmed) {
      if (!confirmed) return;
      try {
        wx.clearStorageSync();
        util.showToast('缓存已清除');
        this.setData({ cacheSize: '0KB' });
      } catch (e) {
        util.showToast('清除失败');
      }
    }.bind(this));
  },

  onAbout: function () {
    this.setData({ showAbout: true });
  },

  onCloseAbout: function () {
    this.setData({ showAbout: false });
  },

  onFeedback: function () {
    wx.showModal({
      title: '意见反馈',
      content: '请通过邮件联系我们：' + config.CONTACT_EMAIL,
      showCancel: false,
      confirmText: '好的'
    });
  },

  stopPropagation: function () {}
});
