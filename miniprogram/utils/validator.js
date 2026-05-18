/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {Object<string, string>} errors
 */

/**
 * @typedef {Object} GoodsFormData
 * @property {string[]} [images]
 * @property {string} [title]
 * @property {(string|number)} [price]
 * @property {(string|number)} [originalPrice]
 * @property {string} [category]
 * @property {string} [condition]
 * @property {string} [description]
 */

var validator = {
  /**
   * @param {*} value
   * @param {string} fieldName
   * @returns {string} 错误信息，空字符串表示通过
   */
  required: function (value, fieldName) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return fieldName + '不能为空';
    }
    return '';
  },

  /**
   * @param {*} value
   * @param {number} max
   * @param {string} fieldName
   * @returns {string}
   */
  maxLength: function (value, max, fieldName) {
    if (value && value.length > max) {
      return fieldName + '不能超过' + max + '个字';
    }
    return '';
  },

  /**
   * @param {*} value
   * @param {string} fieldName
   * @returns {string}
   */
  isNumber: function (value, fieldName) {
    if (value && isNaN(Number(value))) {
      return fieldName + '必须是数字';
    }
    return '';
  },

  /**
   * @param {*} value
   * @param {number} min
   * @param {string} fieldName
   * @returns {string}
   */
  minValue: function (value, min, fieldName) {
    var num = Number(value);
    if (!isNaN(num) && num < min) {
      return fieldName + '不能小于' + min;
    }
    return '';
  },

  /**
   * 验证商品表单数据
   * @param {GoodsFormData} data
   * @returns {ValidationResult}
   */
  validateGoods: function (data) {
    var errors = {};

    if (!data.images || data.images.length === 0) {
      errors.images = '请至少上传1张商品图片';
    }
    if (data.images && data.images.length > 9) {
      errors.images = '最多上传9张图片';
    }

    var titleErr = this.required(data.title, '商品标题')
      || this.maxLength(data.title, 30, '商品标题');
    if (titleErr) errors.title = titleErr;

    var priceErr = this.required(data.price, '价格')
      || this.isNumber(data.price, '价格')
      || this.minValue(data.price, 0.01, '价格');
    if (priceErr) errors.price = priceErr;

    if (data.originalPrice) {
      var origErr = this.isNumber(data.originalPrice, '原价');
      if (origErr) errors.originalPrice = origErr;
    }

    if (!data.category) {
      errors.category = '请选择商品分类';
    }

    if (!data.condition) {
      errors.condition = '请选择商品成色';
    }

    var descErr = this.required(data.description, '商品描述')
      || this.maxLength(data.description, 500, '商品描述');
    if (descErr) errors.description = descErr;

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors
    };
  }
};

module.exports = validator;
