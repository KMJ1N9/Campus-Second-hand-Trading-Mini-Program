const api = require('../../utils/api.js');
const storage = require('../../utils/storage.js');
const app = getApp();

Page({
  data: {
    userInfo: null,
    stats: {
      publishCount: 0,
      collectCount: 0,
      historyCount: 0
    },
    unreadCount: 0,
    isLoggedIn: false,
    loginTempAvatar: '',
    loginTempNickname: ''
  },

  onShow: function () {
    this.loadUserInfo();
    this.loadStats();
  },

  loadUserInfo: function () {
    const cached = storage.getUserInfo();
    const hasLoggedIn = storage.hasUserLoggedIn();
    
    if (cached && cached._id && hasLoggedIn) {
      this.setData({ userInfo: cached, isLoggedIn: true });
      api.getUserInfo().then(res => {
        if (res.data) {
          storage.setUserInfo(res.data);
          this.setData({ userInfo: res.data, isLoggedIn: true });
        } else {
          storage.setUserInfo(null);
          storage.setUserLoggedIn(false);
          this.setData({ userInfo: null, isLoggedIn: false });
        }
      }).catch(() => {});
    } else {
      this.setData({ userInfo: null, isLoggedIn: false });
    }
  },

  loadStats: function () {
    if (!this.data.isLoggedIn) return;
    api.getGoodsList({ status: 'selling', pageSize: 1 }).then(res => {
      this.setData({ 'stats.publishCount': res.total || 0 });
    }).catch(() => {});
    api.getCollections(1, 1).then(res => {
      this.setData({ 'stats.collectCount': res.total || 0 });
    }).catch(() => {});
    api.getHistory().then(list => {
      this.setData({ 'stats.historyCount': list.length });
    });
  },

  /* ===== 微信原生头像选择（button open-type=chooseAvatar） ===== */
  onChooseAvatar: function (e) {
    const avatarUrl = e.detail.avatarUrl;
    if (!avatarUrl) return;

    // 上传头像到云存储
    wx.showLoading({ title: '更新中...' });
    const cloudPath = 'avatars/' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) + '.png';
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: avatarUrl
    }).then(res => {
      const fileID = res.fileID;
      const updated = { ...this.data.userInfo, avatar: fileID };
      this.setData({ userInfo: updated });
      storage.setUserInfo(updated);
      return api.updateUserInfo({ avatar: fileID });
    }).then(() => {
      wx.hideLoading();
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '头像更新失败', icon: 'none' });
    });
  },

  /* ===== 微信原生昵称输入（input type=nickname） ===== */
  onNicknameChange: function (e) {
    const nickname = e.detail.value;
    if (!nickname || !nickname.trim()) return;
    const updated = { ...this.data.userInfo, nickname: nickname.trim() };
    this.setData({ userInfo: updated });
    storage.setUserInfo(updated);
    api.updateUserInfo({ nickname: nickname.trim() }).catch(() => {});
  },

  /* ===== 登录时选择头像 ===== */
  onLoginChooseAvatar: function (e) {
    const avatarUrl = e.detail.avatarUrl;
    if (!avatarUrl) return;
    this.setData({ loginTempAvatar: avatarUrl });
  },

  /* ===== 登录时输入昵称 ===== */
  onLoginNicknameChange: function (e) {
    const nickname = e.detail.value;
    if (!nickname || !nickname.trim()) return;
    this.setData({ loginTempNickname: nickname.trim() });
    this.tryCompleteLogin();
  },

  /* ===== 尝试完成登录（头像和昵称都获取到后执行） ===== */
  tryCompleteLogin: function () {
    const { loginTempAvatar, loginTempNickname } = this.data;
    
    if (!loginTempAvatar || !loginTempNickname) return;
    
    wx.showLoading({ title: '登录中...' });
    
    const profile = {
      nickname: loginTempNickname || '微信用户',
      avatar: loginTempAvatar || ''
    };
    
    let uploadPromise = Promise.resolve();
    
    if (loginTempAvatar) {
      uploadPromise = wx.cloud.uploadFile({
        cloudPath: 'avatars/' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) + '.png',
        filePath: loginTempAvatar
      }).then(res => {
        profile.avatar = res.fileID;
        return res.fileID;
      });
    }
    
    uploadPromise.then(() => {
      return api.registerUser(profile);
    }).then(result => {
      if (result.data) {
        storage.setUserInfo(result.data);
        storage.setUserLoggedIn(true);
        this.setData({ 
          userInfo: result.data, 
          isLoggedIn: true,
          loginTempAvatar: '',
          loginTempNickname: ''
        });
        this.loadStats();
        wx.hideLoading();
        wx.showToast({ title: '登录成功', icon: 'none' });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '登录失败', icon: 'none' });
    });
  },

  onGoProfile: function () {
    if (!this.data.isLoggedIn) { 
      wx.showToast({ title: '请先授权登录', icon: 'none' });
      return; 
    }
    wx.navigateTo({ url: '/pages/user/profile/profile' });
  },

  onGoMyPublish: function () {
    if (!this.data.isLoggedIn) { 
      wx.showToast({ title: '请先授权登录', icon: 'none' });
      return; 
    }
    wx.navigateTo({ url: '/pages/user/my-publish/my-publish' });
  },

  onGoCollection: function () {
    if (!this.data.isLoggedIn) { 
      wx.showToast({ title: '请先授权登录', icon: 'none' });
      return; 
    }
    wx.navigateTo({ url: '/pages/user/collection/collection' });
  },

  onGoHistory: function () {
    wx.navigateTo({ url: '/pages/user/history/history' });
  },

  onGoMessage: function () {
    if (!this.data.isLoggedIn) { 
      wx.showToast({ title: '请先授权登录', icon: 'none' });
      return; 
    }
    wx.navigateTo({ url: '/pages/message/message' });
  },

  onGoSetting: function () {
    wx.navigateTo({ url: '/pages/setting/setting' });
  }
});
