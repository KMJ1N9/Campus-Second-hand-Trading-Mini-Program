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

  const { action = 'get', userData, goodsId, toId, content, type, targetUserId, targetUserIds, page = 1, pageSize = 20 } = event;

  try {
    switch (action) {

      /* ===== 获取用户信息（不自动创建） ===== */
      case 'get': {
        const user = await db.collection('users').doc(openid).get().catch(() => null);
        if (!user || !user.data) {
          return { success: true, data: null };
        }
        return { success: true, data: user.data };
      }

      /* ===== 注册/登录（用户主动授权后调用） ===== */
      case 'register': {
        const { userData: regData } = event;
        let user = await db.collection('users').doc(openid).get().catch(() => null);
        if (user && user.data) {
          // 已存在则更新头像昵称
          await db.collection('users').doc(openid).update({
            data: {
              nickname: regData.nickname || user.data.nickname,
              avatar: regData.avatar || user.data.avatar,
              is_auth: true,
              update_time: new Date()
            }
          });
        } else {
          // 新用户注册
          await db.collection('users').add({
            data: {
              _id: openid,
              nickname: regData.nickname || '微信用户',
              avatar: regData.avatar || '',
              is_auth: true,
              create_time: new Date(),
              update_time: new Date()
            }
          });
        }
        const updated = await db.collection('users').doc(openid).get();
        return { success: true, data: updated.data };
      }

      /* ===== 更新用户信息 ===== */
      case 'update': {
        if (!userData) return { success: false, error: '缺少用户数据' };
        await db.collection('users').doc(openid).update({
          data: { ...userData, update_time: new Date() }
        });
        return { success: true };
      }

      /* ===== 收藏/取消收藏 ===== */
      case 'toggleCollection': {
        if (!goodsId) return { success: false, error: '缺少商品ID' };

        const exist = await db.collection('collections')
          .where({ user_id: openid, goods_id: goodsId })
          .get();

        if (exist.data.length > 0) {
          await db.collection('collections').doc(exist.data[0]._id).remove();
          await db.collection('goods').doc(goodsId).update({
            data: { like_count: _.inc(-1) }
          });
          return { success: true, liked: false };
        } else {
          await db.collection('collections').add({
            data: { user_id: openid, goods_id: goodsId, create_time: new Date() }
          });
          await db.collection('goods').doc(goodsId).update({
            data: { like_count: _.inc(1) }
          });
          return { success: true, liked: true };
        }
      }

      /* ===== 获取收藏列表 ===== */
      case 'getCollections': {
        const totalResult = await db.collection('collections')
          .where({ user_id: openid })
          .count();

        const collections = await db.collection('collections')
          .where({ user_id: openid })
          .orderBy('create_time', 'desc')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .get();

        // N+1 prevention: batch fetch goods
        const goodsIds = collections.data.map(c => c.goods_id);
        if (goodsIds.length === 0) {
          return { success: true, data: [], total: 0 };
        }

        const goodsResults = await db.collection('goods')
          .where({ _id: _.in(goodsIds) })
          .get();

        const goodsMap = {};
        goodsResults.data.forEach(g => { goodsMap[g._id] = g; });

        const data = collections.data
          .map(c => goodsMap[c.goods_id])
          .filter(Boolean);

        return { success: true, data, total: totalResult.total };
      }

      /* ===== 发送消息 ===== */
      case 'sendMessage': {
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

      /* ===== 获取消息列表 ===== */
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

        // Mark as read
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

      /* ===== 获取对话列表 ===== */
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

      /* ===== 根据ID获取用户信息（脱敏） ===== */
      case 'getUserById': {
        if (!targetUserId) return { success: false, error: '缺少用户ID' };
        const userResult = await db.collection('users').doc(targetUserId).get().catch(() => null);
        if (!userResult || !userResult.data) return { success: false, error: '用户不存在' };
        const u = userResult.data;
        delete u.phone;
        delete u.wechat_id;
        delete u.student_id;
        return { success: true, data: u };
      }

      /* ===== 批量获取用户信息（脱敏） ===== */
      case 'getUsersByIds': {
        if (!targetUserIds || !Array.isArray(targetUserIds) || targetUserIds.length === 0) {
          return { success: true, data: [] };
        }
        const usersResult = await db.collection('users')
          .where({ _id: _.in(targetUserIds) })
          .get();
        const users = usersResult.data.map(u => {
          delete u.phone;
          delete u.wechat_id;
          delete u.student_id;
          return u;
        });
        return { success: true, data: users };
      }

      default:
        return { success: false, error: '未知操作' };
    }

  } catch (e) {
    console.error('getUserInfo error:', e);
    return { success: false, error: e.message };
  }
};
