const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    list: [],
    loading: true
  },

  onShow: function () {
    this.loadConversations();
  },

  loadConversations: function () {
    this.setData({ loading: true });

    api.getConversations().then(res => {
      const conversations = res.data || [];
      if (conversations.length === 0) {
        this.setData({ list: [], loading: false });
        return;
      }

      // Batch fetch partner user info
      const openid = (wx.getStorageSync('userInfo') || {})._id || '';

      const partnerIds = [...new Set(conversations.map(c =>
        c.from_id === openid ? c.to_id : c.from_id
      ))];

      api.getUsersByIds(partnerIds).then(userRes => {
        const users = userRes.data || [];
        const userMap = {};
        users.forEach(u => { userMap[u._id] = u; });

        const list = conversations.map(c => {
          const partnerId = c.from_id === openid ? c.to_id : c.from_id;
          const partner = userMap[partnerId] || {};
          return {
            userId: partnerId,
            avatar: partner.avatar || '',
            nickname: partner.nickname || '用户',
            lastMessage: c.content || '[图片]',
            timeText: util.formatTime(c.create_time),
            unread: c.to_id === openid && !c.is_read ? 1 : 0,
            goodsId: c.goods_id || ''
          };
        });

        this.setData({ list, loading: false });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  onOpenChat: function (e) {
    const userId = e.currentTarget.dataset.userId;
    const goodsId = e.currentTarget.dataset.goodsId || '';
    let url = '/pages/chat/chat?targetUserId=' + userId;
    if (goodsId) url += '&goodsId=' + goodsId;
    wx.navigateTo({ url: url });
  }
});
