const util = require('../../utils/util.js');

Component({
  properties: {
    goods: {
      type: Object,
      value: {}
    },
    layout: {
      type: String,
      value: 'grid'
    }
  },

  data: {
    util: util,
    displayGoods: {}
  },

  observers: {
    'goods': function(goods) {
      if (goods && typeof goods === 'object') {
        this.setData({
          displayGoods: {
            ...goods,
            price: this.formatPriceValue(goods.price),
            originalPrice: goods.originalPrice || goods.original_price || null,
            conditionName: goods.conditionName || util.getConditionName(goods.condition),
            categoryName: goods.categoryName || util.getCategoryName(goods.category),
            like_count: Number(goods.like_count) || 0,
            view_count: Number(goods.view_count) || 0
          }
        });
      }
    }
  },

  methods: {
    formatPriceValue: function(price) {
      const num = Number(price);
      return isNaN(num) ? 0 : num;
    },

    onTap: function () {
      this.triggerEvent('tap', { goods: this.data.goods });
    }
  }
});
