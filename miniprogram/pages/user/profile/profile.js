const api = require('../../../utils/api.js');
const storage = require('../../../utils/storage.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    form: {
      avatar: '',
      nickname: '',
      phone: '',
      wechat_id: '',
      school: '',
      student_id: ''
    },
    errors: {},
    saving: false
  },

  onLoad: function () {
    this.loadUserInfo();
  },

  loadUserInfo: function () {
    const userInfo = storage.getUserInfo();
    if (userInfo) {
      this.setData({ form: { ...this.data.form, ...userInfo } });
    } else {
      api.getUserInfo().then(res => {
        if (res.data) {
          storage.setUserInfo(res.data);
          this.setData({ form: { ...this.data.form, ...res.data } });
        }
      }).catch(() => {});
    }
  },

  /* ===== 微信原生头像选择 ===== */
  onChooseAvatar: function (e) {
    const avatarUrl = e.detail.avatarUrl;
    if (!avatarUrl) return;
    this.setData({ 'form.avatar': avatarUrl });
  },

  /* ===== 微信原生昵称输入 ===== */
  onNicknameChange: function (e) {
    const nickname = e.detail.value;
    if (nickname) {
      this.setData({ 'form.nickname': nickname.trim() });
      if (this.data.errors.nickname) {
        const errors = { ...this.data.errors };
        delete errors.nickname;
        this.setData({ errors });
      }
    }
  },

  onInputChange: function (e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ ['form.' + field]: value });
    if (this.data.errors[field]) {
      const errors = { ...this.data.errors };
      delete errors[field];
      this.setData({ errors });
    }
  },

  validate: function () {
    const errors = {};
    const form = this.data.form;

    if (!form.nickname || !form.nickname.trim()) {
      errors.nickname = '昵称不能为空';
    }
    if (form.nickname && form.nickname.length > 20) {
      errors.nickname = '昵称不能超过20个字符';
    }
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
      errors.phone = '请输入正确的手机号';
    }
    if (form.school && form.school.length > 30) {
      errors.school = '学校名称不能超过30个字符';
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  onSave: function () {
    if (!this.validate()) return;
    if (this.data.saving) return;

    this.setData({ saving: true });
    util.showLoading('保存中...');

    const form = { ...this.data.form };
    delete form.avatar; // 头像单独处理

    const saveData = Object.assign({}, form);
    // 如果头像被更新为临时路径，先上传
    const savePromise = form.avatar && form.avatar.startsWith('http')
      ? Promise.resolve()
      : (this.data.form.avatar && !this.data.form.avatar.startsWith('cloud://')
        ? this.uploadAvatar().then(fileID => { saveData.avatar = fileID; })
        : Promise.resolve());

    // Clean empty values
    Object.keys(saveData).forEach(key => {
      if (saveData[key] === undefined || saveData[key] === null) {
        delete saveData[key];
      }
    });
    if (saveData.avatar && saveData.avatar.startsWith('http')) {
      delete saveData.avatar; // don't send temp URLs
    }

    savePromise.then(() => {
      return api.updateUserInfo(saveData);
    }).then(() => {
      const updated = { ...this.data.form, ...saveData };
      storage.setUserInfo(updated);
      util.hideLoading();
      util.showToast('保存成功');
      setTimeout(() => wx.navigateBack(), 1500);
    }).catch(() => {
      util.hideLoading();
      util.showToast('保存失败，请重试');
    }).finally(() => {
      this.setData({ saving: false });
    });
  },

  uploadAvatar: function () {
    const avatarUrl = this.data.form.avatar;
    const cloudPath = 'avatars/' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) + '.png';
    return wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: avatarUrl
    }).then(res => res.fileID);
  }
});
