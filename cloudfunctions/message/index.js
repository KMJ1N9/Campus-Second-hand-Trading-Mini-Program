const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return { success: false, error: '请先登录' };
  }

  const { action = 'send', toId, content, type, goodsId, targetUserId, page = 1, pageSize = 20 } = event;

  try {
    switch (action) {

      case 'send': {
        if (!toId || !content) return { success: false, error: '缺少消息内容' };

        await db.collection('messages').add({
          data: {
            from_id: openid,
            to_id: toId,
            goods_id: goodsId || '',
            content: content,
            type: type || 'text',
            is_read: false,
            create_time: new Date()
          }
        });

        return { success: true };
      }

      case 'getMessages': {
        if (!targetUserId) return { success: false, error: '缺少目标用户ID' };

        const messages = await db.collection('messages')
          .where(_.or([
            { from_id: openid, to_id: targetUserId },
            { from_id: targetUserId, to_id: openid }
          ]))
          .orderBy('create_time', 'asc')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();

        const unreadIds = messages.data
          .filter(m => m.to_id === openid && !m.is_read)
          .map(m => m._id);

        if (unreadIds.length > 0) {
          const updatePromises = unreadIds.map(id =>
            db.collection('messages').doc(id).update({ data: { is_read: true } })
          );
          await Promise.all(updatePromises);
        }

        return { success: true, data: messages.data };
      }

      case 'getConversations': {
        const sentMessages = await db.collection('messages')
          .where({ from_id: openid })
          .orderBy('create_time', 'desc')
          .limit(100)
          .get();

        const receivedMessages = await db.collection('messages')
          .where({ to_id: openid })
          .orderBy('create_time', 'desc')
          .limit(100)
          .get();

        const allMessages = [...sentMessages.data, ...receivedMessages.data];
        const conversationMap = {};

        allMessages.forEach(msg => {
          const partnerId = msg.from_id === openid ? msg.to_id : msg.from_id;
          if (!conversationMap[partnerId] || conversationMap[partnerId].create_time < msg.create_time) {
            conversationMap[partnerId] = msg;
          }
        });

        const conversations = Object.values(conversationMap)
          .sort((a, b) => new Date(b.create_time) - new Date(a.create_time));

        return { success: true, data: conversations };
      }

      default:
        return { success: false, error: '未知操作' };
    }

  } catch (e) {
    console.error('message error:', e);
    return { success: false, error: e.message };
  }
};
