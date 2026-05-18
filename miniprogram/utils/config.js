/**
 * 全局配置文件
 * 所有环境相关的常量统一由此文件管理
 */

var config = {
  // 云开发环境 ID
  CLOUD_ENV_ID: 'cloud1-d6g8tzj977f52ac4f',

  // 联系信息
  CONTACT_EMAIL: '666666@qq.com',

  // API 超时与限制
  DEFAULT_PAGE_SIZE: 10,
  MAX_IMAGES: 9,
  MAX_TITLE_LENGTH: 30,
  MAX_DESC_LENGTH: 500,
  MAX_TAGS: 5,
  SEARCH_DEBOUNCE_MS: 300,
  HISTORY_MAX: 50,
  MESSAGE_PAGE_SIZE: 20,

  // 分类
  CATEGORIES: [
    { id: 'all', name: '全部', icon: 'all' },
    { id: 'textbook', name: '教材', icon: 'book' },
    { id: 'digital', name: '电子', icon: 'computer' },
    { id: 'life', name: '生活', icon: 'home' },
    { id: 'clothes', name: '服饰', icon: 'clothes' },
    { id: 'sport', name: '运动', icon: 'sport' },
    { id: 'other', name: '其他', icon: 'other' }
  ],

  // 成色
  CONDITIONS: [
    { id: 'new', name: '全新' },
    { id: 'like_new', name: '几乎全新' },
    { id: 'used', name: '使用过' },
    { id: 'old', name: '较旧' }
  ]
};

module.exports = config;
