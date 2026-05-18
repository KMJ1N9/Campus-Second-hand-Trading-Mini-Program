const api = require('../../utils/api.js');
const storage = require('../../utils/storage.js');
const util = require('../../utils/util.js');

Page({
  data: {
    myId: '',
    myAvatar: '',
    targetUserId: '',
    goodsId: '',
    targetUser: {},
    messages: [],
    inputValue: '',
    loading: true,
    loadingMore: false,
    hasMore: true,
    scrollToId: 'msg-bottom',
    page: 1,
    pageSize: 20
  },

  onLoad: function (options) {
    const targetUserId = options.targetUserId || '';
    const goodsId = options.goodsId || '';
    const userInfo = storage.getUserInfo() || {};

    this.setData({
      myId: userInfo._id || '',
      myAvatar: userInfo.avatar || '',
      targetUserId: targetUserId,
      goodsId: goodsId
    });

    if (targetUserId) {
      this.loadTargetUser(targetUserId);
      this.loadMessages();
      this.startWatch();
    }
  },

  onUnload: function () {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = null;
    }
  },

  loadTargetUser: function (userId) {
    api.getUserById(userId).then(res => {
      if (res.data) {
        this.setData({
          targetUser: {
            avatar: res.data.avatar || '',
            nickname: res.data.nickname || '用户'
          }
        });
        wx.setNavigationBarTitle({ title: res.data.nickname || '聊天' });
      }
    }).catch(() => {});
  },

  loadMessages: function () {
    this.setData({ loading: true });

    api.getMessages(this.data.targetUserId, 1, this.data.pageSize).then(res => {
      const messages = res.data || [];
      this.setData({
        messages: messages,
        loading: false,
        page: 1,
        hasMore: messages.length >= this.data.pageSize
      });
      this.scrollToBottom();
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  loadMoreMessages: function () {
    if (!this.data.hasMore || this.data.loadingMore) return;

    this.setData({ loadingMore: true });
    const nextPage = this.data.page + 1;

    api.getMessages(this.data.targetUserId, nextPage, this.data.pageSize).then(res => {
      const olderMessages = res.data || [];
      const currentMessages = this.data.messages;

      const existingIds = {};
      currentMessages.forEach(m => { existingIds[m._id] = true; });
      const uniqueOlder = olderMessages.filter(m => !existingIds[m._id]);

      this.setData({
        messages: [...uniqueOlder, ...currentMessages],
        loadingMore: false,
        page: nextPage,
        hasMore: olderMessages.length >= this.data.pageSize
      });
    }).catch(() => {
      this.setData({ loadingMore: false });
    });
  },

  startWatch: function () {
    const db = wx.cloud.database();
    const _ = db.command;
    const openid = this.data.myId;
    const targetUserId = this.data.targetUserId;

    this._watcher = db.collection('messages')
      .where(_.or([
        { from_id: openid, to_id: targetUserId },
        { from_id: targetUserId, to_id: openid }
      ]))
      .orderBy('create_time', 'asc')
      .watch({
        onChange: (snapshot) => {
          const { docs } = snapshot;
          if (!docs || docs.length === 0) return;

          const existingIds = {};
          this.data.messages.forEach(m => { existingIds[m._id] = true; });

          let hasNew = false;
          const updatedMessages = docs.map(doc => {
            if (!existingIds[doc._id]) hasNew = true;
            return doc;
          });

          if (hasNew) {
            this.setData({ messages: updatedMessages });
            this.scrollToBottom();
          }
        },
        onError: (err) => {
          console.error('chat watch error:', err);
        }
      });
  },

  onInput: function (e) {
    this.setData({ inputValue: e.detail.value });
  },

  onSend: function () {
    const content = this.data.inputValue.trim();
    if (!content) return;

    const tempId = 'temp_' + Date.now();
    const tempMsg = {
      _id: tempId,
      from_id: this.data.myId,
      to_id: this.data.targetUserId,
      content: content,
      type: 'text',
      create_time: new Date()
    };

    this.setData({
      messages: [...this.data.messages, tempMsg],
      inputValue: ''
    });
    this.scrollToBottom();

    api.sendMessage(this.data.targetUserId, content, 'text', this.data.goodsId)
      .catch(() => util.showToast('发送失败'));
  },

  scrollToBottom: function () {
    setTimeout(() => {
      this.setData({ scrollToId: 'msg-bottom' });
    }, 100);
  }
});
