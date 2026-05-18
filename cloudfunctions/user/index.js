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

  const { action = 'get', userData, targetUserId, targetUserIds } = event;

  try {
    switch (action) {

      case 'get': {
        const user = await db.collection('users').doc(openid).get().catch(() => null);
        if (!user || !user.data) {
          return { success: true, data: null };
        }
        return { success: true, data: user.data };
      }

      case 'register': {
        const regData = userData || event;
        let user = await db.collection('users').doc(openid).get().catch(() => null);
        if (user && user.data) {
          await db.collection('users').doc(openid).update({
            data: {
              nickname: regData.nickname || user.data.nickname,
              avatar: regData.avatar || user.data.avatar,
              is_auth: true,
              update_time: new Date()
            }
          });
        } else {
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

      case 'update': {
        if (!userData) return { success: false, error: '缺少用户数据' };
        await db.collection('users').doc(openid).update({
          data: { ...userData, update_time: new Date() }
        });
        return { success: true };
      }

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
    console.error('user error:', e);
    return { success: false, error: e.message };
  }
};
