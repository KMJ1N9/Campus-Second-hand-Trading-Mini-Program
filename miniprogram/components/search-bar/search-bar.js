Component({
  properties: {
    placeholder: {
      type: String,
      value: '搜索你想要的二手商品...'
    },
    value: {
      type: String,
      value: ''
    },
    showAction: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onInput: function (e) {
      const value = e.detail.value;
      this.triggerEvent('input', { value });
    },

    onSearch: function (e) {
      const value = e.detail.value || this.data.value;
      this.triggerEvent('search', { value });
    },

    onFocus: function () {
      this.triggerEvent('focus');
    },

    onClear: function () {
      this.triggerEvent('input', { value: '' });
      this.triggerEvent('clear');
    },

    onCancel: function () {
      this.triggerEvent('cancel');
    }
  }
});
