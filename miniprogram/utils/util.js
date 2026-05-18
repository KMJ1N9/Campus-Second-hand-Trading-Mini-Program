/**
 * @typedef {Object} ConfirmOptions
 * @property {string} [title]
 * @property {string} [content]
 * @property {string} [confirmText]
 * @property {string} [cancelText]
 * @property {string} [confirmColor]
 */

var util = {
  /**
   * 格式化日期为相对时间或日期字符串
   * @param {Date|string|number|Object} date
   * @returns {string}
   */
  formatTime: function (date) {
    if (!date) return '未知';

    if (typeof date === 'object' && date.$date) {
      date = date.$date;
    }

    if (typeof date === 'string') {
      if (!/^\d/.test(date)) {
        return '未知';
      }

      var parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        var replacedDate = date.replace(/-/g, '/');
        parsedDate = new Date(replacedDate);
      }

      if (isNaN(parsedDate.getTime())) {
        var isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([+-]\d{2}):(\d{2}))?$/);
        if (isoMatch) {
          var year = parseInt(isoMatch[1]);
          var month = parseInt(isoMatch[2]) - 1;
          var day = parseInt(isoMatch[3]);
          var hours = parseInt(isoMatch[4]);
          var minutes = parseInt(isoMatch[5]);
          var seconds = parseInt(isoMatch[6]);
          parsedDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
        }
      }

      date = parsedDate;
    }

    if (typeof date === 'number') {
      if (date < 10000000000) {
        date = date * 1000;
      }
      date = new Date(date);
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) return '未知';

    var now = Date.now();
    var diff = now - date.getTime();
    var minute = 60 * 1000;
    var hour = 60 * minute;
    var day = 24 * hour;

    if (diff < minute) return '刚刚';
    if (diff < hour) return Math.floor(diff / minute) + '分钟前';
    if (diff < day) return Math.floor(diff / hour) + '小时前';
    if (diff < 3 * day) return Math.floor(diff / day) + '天前';

    var dateYear = date.getFullYear();
    var dateMonth = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');

    if (dateYear === new Date().getFullYear()) {
      return dateMonth + '-' + d;
    }
    return dateYear + '-' + dateMonth + '-' + d;
  },

  /**
   * @param {number} price
   * @returns {string}
   */
  formatPrice: function (price) {
    if (typeof price !== 'number' || isNaN(price)) return '¥0.00';
    if (price % 1 === 0) return '¥' + price;
    return '¥' + price.toFixed(2);
  },

  /**
   * @param {number} num
   * @returns {string}
   */
  formatNumber: function (num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return String(num);
  },

  /**
   * @param {Function} fn
   * @param {number} [delay=300]
   * @returns {Function}
   */
  debounce: function (fn, delay) {
    if (delay === undefined) delay = 300;
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(context, args); }, delay);
    };
  },

  /**
   * @param {Function} fn
   * @param {number} [delay=300]
   * @returns {Function}
   */
  throttle: function (fn, delay) {
    if (delay === undefined) delay = 300;
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  },

  /**
   * @param {string} id
   * @returns {string}
   */
  getCategoryName: function (id) {
    var map = {
      textbook: '教材',
      digital: '电子',
      life: '生活',
      clothes: '服饰',
      sport: '运动',
      other: '其他'
    };
    return map[id] || '其他';
  },

  /**
   * @param {string} id
   * @returns {string}
   */
  getConditionName: function (id) {
    var map = {
      'new': '全新',
      like_new: '几乎全新',
      used: '使用过',
      old: '较旧'
    };
    return map[id] || '未知';
  },

  /**
   * @param {string} title
   * @param {string} [icon='none']
   * @param {number} [duration=2000]
   */
  showToast: function (title, icon, duration) {
    if (icon === undefined) icon = 'none';
    if (duration === undefined) duration = 2000;
    wx.showToast({ title: title, icon: icon, duration: duration });
  },

  /**
   * @param {string} [title='加载中...']
   */
  showLoading: function (title) {
    if (title === undefined) title = '加载中...';
    wx.showLoading({ title: title, mask: true });
  },

  hideLoading: function () {
    wx.hideLoading();
  },

  /**
   * @param {ConfirmOptions} options
   * @returns {Promise<boolean>}
   */
  showConfirm: function (options) {
    return new Promise(function (resolve) {
      wx.showModal({
        title: options.title || '提示',
        content: options.content || '',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        confirmColor: options.confirmColor || '#DC2626',
        success: function (res) { resolve(res.confirm); }
      });
    });
  },

  /**
   * @param {string[]} urls
   * @param {number} [current=0]
   */
  previewImages: function (urls, current) {
    if (current === undefined) current = 0;
    wx.previewImage({ urls: urls, current: urls[current] || urls[0] });
  },

  /**
   * @param {number} [count=9]
   * @returns {Promise<string[]>}
   */
  chooseImage: function (count) {
    if (count === undefined) count = 9;
    return new Promise(function (resolve, reject) {
      wx.chooseImage({
        count: count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) { resolve(res.tempFilePaths); },
        fail: reject
      });
    });
  },

  /**
   * @param {string[]} filePaths
   * @returns {Promise<string[]>}
   */
  uploadImages: function (filePaths) {
    var promises = filePaths.map(function (filePath) {
      var cloudPath = 'goods/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.jpg';
      return wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath
      }).then(function (res) { return res.fileID; });
    });
    return Promise.all(promises);
  }
};

module.exports = util;
