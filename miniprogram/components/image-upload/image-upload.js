const util = require('../../utils/util.js');

Component({
  properties: {
    images: {
      type: Array,
      value: []
    },
    maxCount: {
      type: Number,
      value: 9
    },
    tip: {
      type: String,
      value: '最多上传9张图片，第一张为封面'
    },
    error: {
      type: String,
      value: ''
    }
  },

  methods: {
    onChoose: async function () {
      const remain = this.data.maxCount - this.data.images.length;
      if (remain <= 0) return;

      try {
        const tempFiles = await util.chooseImage(remain);
        this.triggerEvent('change', {
          images: [...this.data.images, ...tempFiles]
        });
      } catch (err) {
        console.log('取消选择图片');
      }
    },

    onRemove: function (e) {
      const index = e.currentTarget.dataset.index;
      const images = [...this.data.images];
      images.splice(index, 1);
      this.triggerEvent('change', { images });
    },

    onPreview: function (e) {
      const index = e.currentTarget.dataset.index;
      util.previewImages(this.data.images, index);
    }
  }
});
