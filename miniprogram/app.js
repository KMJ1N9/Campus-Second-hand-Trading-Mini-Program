var config = require('./utils/config.js');

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: config.CLOUD_ENV_ID,
        traceUser: true
      });
    }

    this.checkLoginStatus();
  },

  checkLoginStatus: function () {
    var userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      this.globalData.isLogin = false;
    } else {
      this.globalData.isLogin = true;
      this.globalData.userInfo = userInfo;
    }
  },

  globalData: {
    isLogin: false,
    userInfo: null,
    categories: config.CATEGORIES,
    conditions: config.CONDITIONS,
    defaultAvatar: '/assets/images/default-avatar.png'
  }
});
