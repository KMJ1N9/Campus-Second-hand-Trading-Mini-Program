const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const validator = require('../../utils/validator.js');
const app = getApp();

Page({
  data: {
    editId: '',
    isEditing: false,
    categories: [],
    conditions: [],
    form: {
      images: [],
      title: '',
      price: '',
      originalPrice: '',
      category: '',
      condition: '',
      description: '',
      location: '',
      tags: []
    },
    tagInput: '',
    errors: {},
    submitting: false
  },

  onLoad: function () {
    this.setData({
      categories: app.globalData.categories,
      conditions: app.globalData.conditions
    });
  },

  onShow: function () {
    const editId = app.globalData.editId;
    if (editId) {
      this.setData({ editId, isEditing: true });
      this.loadGoods(editId);
      delete app.globalData.editId;
    }
  },

  loadGoods: function (id) {
    api.getGoodsDetail(id).then(res => {
      const goods = res.data;
      this.setData({
        form: {
          images: goods.images || [],
          title: goods.title || '',
          price: String(goods.price || ''),
          originalPrice: goods.originalPrice ? String(goods.originalPrice) : '',
          category: goods.category || '',
          condition: goods.condition || '',
          description: goods.description || '',
          location: goods.location || '',
          tags: goods.tags || []
        },
        tagInput: (goods.tags || []).join(', ')
      });
    }).catch(() => {
      util.showToast('加载商品信息失败');
    });
  },

  /* 图片变更 */
  onImagesChange: function (e) {
    this.setData({ 'form.images': e.detail.images });
    if (this.data.errors.images) {
      this.setData({ 'errors.images': '' });
    }
  },

  /* 文本字段变更 */
  onFieldChange: function (e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ ['form.' + field]: value });

    if (this.data.errors[field]) {
      this.setData({ ['errors.' + field]: '' });
    }
  },

  /* 分类选择 */
  onCategorySelect: function (e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      'form.category': this.data.form.category === id ? '' : id
    });
    if (this.data.errors.category) {
      this.setData({ 'errors.category': '' });
    }
  },

  /* 成色选择 */
  onConditionSelect: function (e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      'form.condition': this.data.form.condition === id ? '' : id
    });
    if (this.data.errors.condition) {
      this.setData({ 'errors.condition': '' });
    }
  },

  /* 标签输入 */
  onTagInput: function (e) {
    const value = e.detail.value;
    this.setData({ tagInput: value });
    const tags = value.split(',').map(t => t.trim()).filter(t => t).slice(0, 5);
    this.setData({ 'form.tags': tags });
  },

  /* 提交 */
  onSubmit: async function () {
    if (this.data.submitting) return;

    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo._id) {
      util.showToast('请先登录');
      setTimeout(() => wx.switchTab({ url: '/pages/mine/mine' }), 1500);
      return;
    }

    const formData = { ...this.data.form };

    const result = validator.validateGoods(formData);
    if (!result.valid) {
      this.setData({ errors: result.errors });
      util.showToast('请完善商品信息');
      return;
    }

    this.setData({ submitting: true });

    try {
      // 上传图片到云存储
      let imageUrls = [];
      if (formData.images.some(img => !img.startsWith('cloud://'))) {
        imageUrls = await util.uploadImages(formData.images);
      } else {
        imageUrls = formData.images;
      }

      const payload = {
        ...formData,
        images: imageUrls,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null
      };

      if (this.data.isEditing) {
        await api.updateGoods(this.data.editId, payload);
      } else {
        await api.publishGoods(payload);
      }

      util.showToast(this.data.isEditing ? '保存成功！' : '发布成功！', 'success');
      setTimeout(() => {
        this.resetForm();
        wx.switchTab({ url: '/pages/mine/mine' });
      }, 1500);

    } catch (err) {
      util.showToast('发布失败，请重试');
      console.error('发布失败:', err);
    } finally {
      this.setData({ submitting: false });
    }
  },

  resetForm: function () {
    this.setData({
      editId: '',
      isEditing: false,
      form: {
        images: [],
        title: '',
        price: '',
        originalPrice: '',
        category: '',
        condition: '',
        description: '',
        location: '',
        tags: []
      },
      tagInput: '',
      errors: {},
      submitting: false
    });
  }
});
