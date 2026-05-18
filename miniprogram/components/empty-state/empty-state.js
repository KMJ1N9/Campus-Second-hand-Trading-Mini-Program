Component({
  properties: {
    title: String,
    description: String,
    icon: String,
    actionText: String
  },

  methods: {
    onAction: function () {
      this.triggerEvent('action');
    }
  }
});
