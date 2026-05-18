/**
 * API 请求统一管理模块
 * 所有云函数调用均通过此模块代理，禁止在页面中直接调用 wx.cloud.callFunction
 */

var db = wx.cloud.database();
var _ = db.command;

var api = {
  db: db,
  _: _,

  /**
   * 通用云函数调用封装
   * @param {string} name - 云函数名称
   * @param {Object} [data={}] - 请求参数
   * @returns {Promise<{success: boolean, data?: *, error?: string}>}
   */
  callFunction: function (name, data) {
    if (data === undefined) data = {};
    return wx.cloud.callFunction({ name: name, data: data })
      .then(function (res) { return res.result; })
      .catch(function (err) {
        console.error('[API] ' + name + ' 调用失败:', err);
        throw err;
      });
  },

  /* ========== 商品接口 ========== */

  /**
   * @param {Object} [params]
   * @param {string} [params.category='all']
   * @param {string} [params.keyword='']
   * @param {string} [params.sort='create_time']
   * @param {string} [params.order='desc']
   * @param {number} [params.page=1]
   * @param {number} [params.pageSize=10]
   * @param {string} [params.status='selling']
   */
  getGoodsList: function (params) {
    if (params === undefined) params = {};
    var category = params.category || 'all';
    var keyword = params.keyword || '';
    var sort = params.sort || 'create_time';
    var order = params.order || 'desc';
    var page = params.page || 1;
    var pageSize = params.pageSize || 10;
    var status = params.status || 'selling';

    return this.callFunction('getGoodsList', {
      category: category, keyword: keyword, sort: sort, order: order,
      page: page, pageSize: pageSize, status: status
    });
  },

  /**
   * @param {string} id
   */
  getGoodsDetail: function (id) {
    return this.callFunction('getGoodsDetail', { id: id });
  },

  /**
   * @param {Object} goodsData
   */
  publishGoods: function (goodsData) {
    return this.callFunction('publishGoods', { goodsData: goodsData });
  },

  /**
   * @param {string} id
   * @param {Object} updateData
   */
  updateGoods: function (id, updateData) {
    return this.callFunction('updateGoods', { id: id, updateData: updateData });
  },

  /**
   * @param {string} id
   */
  deleteGoods: function (id) {
    return this.callFunction('updateGoods', { id: id, updateData: { status: 'deleted' } });
  },

  /**
   * @param {string} keyword
   * @param {Object} [params]
   */
  searchGoods: function (keyword, params) {
    if (params === undefined) params = {};
    return this.callFunction('searchGoods', Object.assign({ keyword: keyword }, params));
  },

  /* ========== 用户接口 ========== */

  getUserInfo: function () {
    return this.callFunction('getUserInfo');
  },

  /**
   * @param {Object} userData
   */
  registerUser: function (userData) {
    return this.callFunction('getUserInfo', { action: 'register', userData: userData });
  },

  /**
   * @param {Object} userData
   */
  updateUserInfo: function (userData) {
    return this.callFunction('getUserInfo', { action: 'update', userData: userData });
  },

  /**
   * @param {string} userId
   */
  getUserById: function (userId) {
    return this.callFunction('getUserInfo', { action: 'getUserById', targetUserId: userId });
  },

  /**
   * @param {string[]} userIds
   */
  getUsersByIds: function (userIds) {
    return this.callFunction('getUserInfo', { action: 'getUsersByIds', targetUserIds: userIds });
  },

  /* ========== 收藏接口 ========== */

  /**
   * @param {string} goodsId
   */
  toggleCollection: function (goodsId) {
    return this.callFunction('getUserInfo', { action: 'toggleCollection', goodsId: goodsId });
  },

  /**
   * @param {number} [page=1]
   * @param {number} [pageSize=10]
   */
  getCollections: function (page, pageSize) {
    if (page === undefined) page = 1;
    if (pageSize === undefined) pageSize = 10;
    return this.callFunction('getUserInfo', { action: 'getCollections', page: page, pageSize: pageSize });
  },

  /* ========== 聊天接口 ========== */

  /**
   * @param {string} toId
   * @param {string} content
   * @param {string} [type='text']
   * @param {string} [goodsId='']
   */
  sendMessage: function (toId, content, type, goodsId) {
    if (type === undefined) type = 'text';
    if (goodsId === undefined) goodsId = '';
    return this.callFunction('getUserInfo', {
      action: 'sendMessage', toId: toId, content: content, type: type, goodsId: goodsId
    });
  },

  /**
   * @param {string} targetUserId
   * @param {number} [page=1]
   * @param {number} [pageSize=20]
   */
  getMessages: function (targetUserId, page, pageSize) {
    if (page === undefined) page = 1;
    if (pageSize === undefined) pageSize = 20;
    return this.callFunction('getUserInfo', {
      action: 'getMessages', targetUserId: targetUserId, page: page, pageSize: pageSize
    });
  },

  getConversations: function () {
    return this.callFunction('getUserInfo', { action: 'getConversations' });
  },

  /* ========== 历史记录 ========== */

  /**
   * @param {string} goodsId
   */
  addHistory: function (goodsId) {
    wx.getStorage({
      key: 'historyList',
      success: function (res) {
        var list = res.data || [];
        list = list.filter(function (item) { return item.goodsId !== goodsId; });
        list.unshift({ goodsId: goodsId, time: Date.now() });
        if (list.length > 50) list.pop();
        wx.setStorage({ key: 'historyList', data: list });
      },
      fail: function () {
        wx.setStorage({ key: 'historyList', data: [{ goodsId: goodsId, time: Date.now() }] });
      }
    });
  },

  /**
   * @returns {Promise<Array<{goodsId: string, time: number}>>}
   */
  getHistory: function () {
    return new Promise(function (resolve) {
      wx.getStorage({
        key: 'historyList',
        success: function (res) { resolve(res.data || []); },
        fail: function () { resolve([]); }
      });
    });
  },

  /**
   * @returns {Promise<boolean>}
   */
  clearHistory: function () {
    return new Promise(function (resolve) {
      wx.removeStorage({
        key: 'historyList',
        success: function () { resolve(true); },
        fail: function () { resolve(false); }
      });
    });
  }
};

module.exports = api;
