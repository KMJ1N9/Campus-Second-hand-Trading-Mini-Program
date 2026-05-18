# 校园二手交易平台

基于微信小程序原生框架 + 微信云开发的校园二手商品交易平台。

## 技术栈

- **前端**：微信小程序原生框架（WXML + WXSS + JavaScript）
- **后端**：微信云开发（云函数 + 云数据库 + 云存储）
- **测试**：Jest

## 项目结构

```
├── miniprogram/                 # 小程序前端
│   ├── app.js                   # 应用入口，云环境初始化，登录状态检查
│   ├── app.json                 # 全局配置（页面路由、tabBar、权限声明）
│   ├── app.wxss                 # 全局样式（设计令牌 CSS Custom Properties）
│   ├── pages/                   # 页面
│   │   ├── index/               # 首页 — 商品瀑布流展示
│   │   ├── category/            # 分类 — 按分类筛选商品
│   │   ├── publish/             # 发布 — 发布/编辑商品
│   │   ├── mine/                # 我的 — 个人中心、登录
│   │   ├── setting/             # 设置 — 缓存管理、关于、反馈
│   │   ├── chat/                # 聊天 — 实时私聊（数据库 watch）
│   │   ├── message/             # 消息 — 会话列表
│   │   ├── goods/
│   │   │   ├── detail/          # 商品详情
│   │   │   ├── search/          # 商品搜索（防抖）
│   │   │   └── list/            # 商品列表
│   │   └── user/
│   │       ├── profile/         # 个人资料编辑
│   │       ├── collection/      # 我的收藏
│   │       ├── my-publish/      # 我的发布
│   │       └── history/         # 浏览历史
│   ├── components/              # 通用组件
│   │   ├── goods-card/          # 商品卡片（瀑布流适配）
│   │   ├── search-bar/          # 搜索栏
│   │   ├── skeleton/            # 骨架屏加载态
│   │   ├── empty-state/         # 空状态占位
│   │   ├── image-upload/        # 图片上传（1-9 张）
│   │   └── toast/               # 轻提示
│   └── utils/                   # 工具模块
│       ├── api.js               # API 请求统一管理（所有云函数调用代理）
│       ├── util.js              # 通用工具函数（格式化、防抖、对话框）
│       ├── validator.js         # 前端表单校验
│       ├── storage.js           # 本地存储封装
│       ├── config.js            # 全局配置常量
│       └── errorCodes.js        # 错误码枚举与映射
├── cloudfunctions/              # 云函数（后端）
│   ├── getUserInfo/             # 用户：注册、登录、更新、查询
│   ├── getGoodsList/            # 商品列表（分页、筛选、排序）
│   ├── getGoodsDetail/          # 商品详情 + 卖家信息
│   ├── publishGoods/            # 发布商品（含服务端校验 + 内容安全审核）
│   ├── updateGoods/             # 更新/删除商品
│   └── searchGoods/             # 商品全文搜索
└── tests/                       # 单元测试
    └── validator.test.js        # validator.js 测试（16 个用例）
```

## 功能清单

| 模块 | 功能 |
|------|------|
| 首页 | 商品瀑布流展示、下拉刷新、分类筛选 |
| 分类 | 按 6 大分类浏览商品 |
| 搜索 | 关键词搜索（防抖 300ms）、搜索历史 |
| 发布 | 多图上传、表单校验（前端 + 服务端双重校验）、内容安全审核 |
| 商品详情 | 图文展示、卖家信息、收藏、联系卖家、浏览次数 |
| 聊天 | 实时私聊（云数据库 watch API）、乐观更新 |
| 消息 | 会话列表、未读标记 |
| 个人中心 | 微信原生头像/昵称授权、个人资料编辑 |
| 我的收藏 | 收藏列表、取消收藏 |
| 我的发布 | 已发布商品管理、下架 |
| 浏览历史 | 浏览记录（本地存储，最多 50 条） |
| 设置 | 清除缓存、关于页面、意见反馈 |

## 快速开始

### 环境要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 稳定版
- 微信小程序 AppID（已配置：`wx0c4d54c24d540539`）
- 微信云开发环境（已配置：`cloud1-d6g8tzj977f52ac4f`）

### 本地运行

1. 克隆项目后在微信开发者工具中打开项目根目录
2. 工具会自动识别 `miniprogram/` 为小程序目录、`cloudfunctions/` 为云函数目录
3. 在云开发控制台开通云开发，创建环境并替换 `miniprogram/utils/config.js` 中的 `CLOUD_ENV_ID`
4. 在云开发控制台创建以下数据库集合：
   - `users` — 用户表
   - `goods` — 商品表
   - `messages` — 消息表
5. 在微信开发者工具中右键每个云函数目录 → **上传并部署**
6. 编译运行小程序

### 运行测试

```bash
npm install --save-dev jest
npx jest tests/validator.test.js
```

## 云函数说明

所有云函数统一通过 `miniprogram/utils/api.js` 调用，禁止页面直接调用 `wx.cloud.callFunction`。

| 云函数 | 入口 action | 说明 |
|--------|------------|------|
| `getUserInfo` | `get` / `register` / `update` / `getUserById` / `getUsersByIds` / `toggleCollection` / `getCollections` / `sendMessage` / `getMessages` / `getConversations` | 用户、收藏、聊天统一入口 |
| `getGoodsList` | — | 商品分页列表，支持分类/排序/状态筛选 |
| `getGoodsDetail` | — | 商品详情 + 卖家信息，自动增加浏览次数 |
| `publishGoods` | — | 发布商品，含服务端完整校验 + 文本/图片安全审核 |
| `updateGoods` | — | 更新或删除（软删除）商品 |
| `searchGoods` | — | 商品全文搜索 |

## 配置

所有环境相关常量集中在 `miniprogram/utils/config.js`：

- 云环境 ID、联系邮箱
- 分类列表（6 大类）、成色列表（4 级）
- 各类限制参数（图片数量、标题长度、描述长度、分页大小等）
- 搜索防抖延迟、历史记录上限

## 数据模型

### users

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 用户 openid |
| `nickname` | string | 昵称 |
| `avatar` | string | 头像云存储 fileID |
| `is_auth` | boolean | 是否已授权 |
| `create_time` | date | 创建时间 |
| `update_time` | date | 更新时间 |

### goods

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 自动生成 |
| `title` | string | 标题（≤30 字） |
| `price` | number | 价格（≥0.01） |
| `originalPrice` | number | 原价（可选） |
| `description` | string | 描述（≤500 字） |
| `images` | string[] | 云存储 fileID 数组 |
| `category` | string | 分类 ID |
| `condition` | string | 成色 ID |
| `status` | string | 状态：selling / sold / deleted |
| `seller_id` | string | 卖家 openid |
| `like_count` | number | 收藏数 |
| `view_count` | number | 浏览数 |
| `create_time` | date | 发布时间 |
| `update_time` | date | 更新时间 |

### messages

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 自动生成 |
| `from_id` | string | 发送者 openid |
| `to_id` | string | 接收者 openid |
| `content` | string | 消息内容 |
| `type` | string | 消息类型（text） |
| `goods_id` | string | 关联商品 ID（可选） |
| `is_read` | boolean | 是否已读 |
| `create_time` | date | 发送时间 |

## 设计规范

- 代码风格：[CLAUDE.md](CLAUDE.md)
- 技能使用：[skills.md](skills.md)
- 配色系统：WDX inline token（`app.wxss`）
- TabBar 图标：自定义图标（`miniprogram/assets/icons/`）
