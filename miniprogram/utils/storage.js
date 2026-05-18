const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  HISTORY: 'historyList',
  SEARCH_HISTORY: 'searchHistory',
  SETTINGS: 'appSettings',
  USER_LOGGED_IN: 'userLoggedIn'
};

const storage = {
  get: function (key) {
    try {
      return wx.getStorageSync(key);
    } catch (e) {
      return null;
    }
  },

  set: function (key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove: function (key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  clear: function () {
    try {
      wx.clearStorageSync();
      return true;
    } catch (e) {
      return false;
    }
  },

  /* 用户信息 */
  getUserInfo: function () {
    return this.get(STORAGE_KEYS.USER_INFO);
  },

  setUserInfo: function (info) {
    return this.set(STORAGE_KEYS.USER_INFO, info);
  },

  /* 用户是否主动登录过（清除缓存后需要重新登录） */
  hasUserLoggedIn: function () {
    return this.get(STORAGE_KEYS.USER_LOGGED_IN) === true;
  },

  setUserLoggedIn: function (loggedIn) {
    return this.set(STORAGE_KEYS.USER_LOGGED_IN, loggedIn);
  },

  /* 搜索历史 */
  getSearchHistory: function () {
    return this.get(STORAGE_KEYS.SEARCH_HISTORY) || [];
  },

  addSearchHistory: function (keyword) {
    if (!keyword.trim()) return;
    let list = this.getSearchHistory();
    list = list.filter(item => item !== keyword);
    list.unshift(keyword);
    if (list.length > 20) list.pop();
    this.set(STORAGE_KEYS.SEARCH_HISTORY, list);
  },

  clearSearchHistory: function () {
    this.remove(STORAGE_KEYS.SEARCH_HISTORY);
  },

  /* 设置 */
  getSettings: function () {
    return this.get(STORAGE_KEYS.SETTINGS) || {};
  },

  setSettings: function (settings) {
    const current = this.getSettings();
    return this.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  }
};

module.exports = storage;
