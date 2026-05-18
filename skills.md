# Claude Code 技能分级清单 & 落地指南

> 适用场景：代码编写 / 架构设计 / 排错调试 / 课程文档与答辩材料生成

---

## 第一部分：技能分级清单

### 🔥 必装核心（8 个）— 每个项目每次会话都应优先启用

| # | 技能名称 | 来源 | 核心用途 | 在我的项目里的具体用法 |
|---|---------|------|---------|---------------------|
| 1 | **karpathy-guidelines** | andrej-karpathy | 编码行为准则：先思考再编码、简单优先、精准修改、目标驱动 | 所有代码编写前启用，避免过度设计、无效代码、范围蔓延；写任何函数/组件前先声明假设和成功标准 |
| 2 | **brainstorming** | superpowers | 功能设计前强制讨论，禁止未获批就写代码 | 新功能/新模块/架构变更前：先出设计方案，用户确认后再动手；用于课程大作业的需求澄清和架构选型讨论 |
| 3 | **writing-plans** | superpowers | 把需求转成可执行的实施计划（2-5分钟/任务、精确文件路径、完整命令） | 任何超 3 步的任务前先写计划；课程项目答辩时计划文档可直接作为"开发过程记录"附在报告里 |
| 4 | **systematic-debugging** | superpowers | 四阶段调试法：根因调查→模式分析→假设与测试→实施修复（铁律：未定位根因前禁止修代码） | 任何 bug/测试失败/异常行为第一时间启用；课程大作业排错时避免"改了 5 次还没好"的恶性循环 |
| 5 | **verification-before-completion** | superpowers | 完成宣告前必须跑验证命令、读输出、拿证据（铁律：无新鲜验证结果不可说"已完成"） | 每次说"修好了"之前先运行测试/启动服务/浏览器验证；提交前过一遍 |
| 6 | **requesting-code-review** | superpowers | 派出代码审查子代理，用独立上下文检查：规范性、安全性、边界情况、测试覆盖 | 每完成一个功能模块后立即启用；大作业合并分支前做最终审查 |
| 7 | **coding-standards** | everything-claude-code | 跨项目编码规范：命名、不可变性、可读性、KISS/DRY/YAGNI | 项目初始化时启用一次，建立全项目编码风格；自媒体系统前后端一致性保障 |
| 8 | **webapp-testing** | anthropics | Playwright 浏览器自动化测试本地 Web 应用 | 自媒体新闻系统前端功能验证；课程项目演示前的冒烟测试；截图留档给答辩材料 |

### ✅ 强烈推荐（14 个）— 大幅提升效率，给项目加分

| # | 技能名称 | 来源 | 核心用途 | 在我的项目里的具体用法 |
|---|---------|------|---------|---------------------|
| 9 | **subagent-driven-development** | superpowers | 按计划逐任务派发子代理执行，每个任务过"规范合规→代码质量"双层审查 | 有完整计划后，让多个独立功能并行开发；分布式框架各组件并行实现 |
| 10 | **dispatching-parallel-agents** | superpowers | 把 N 个独立任务同时派发给 N 个子代理，并行执行 | 多个测试文件失败时并行修；同时写前后端代码；多个模块同时重构 |
| 11 | **executing-plans** | superpowers | 加载写好的计划、审阅、执行所有任务、设置审查检查点、完成后报告 | 大任务拆分后的全自动执行（适合在独立会话中跑长任务） |
| 12 | **test-driven-development** | superpowers | 严格 TDD：先写失败测试→看它失败→写最少代码通过→重构（铁律：无失败测试前禁止生产代码） | 分布式框架核心算法实现；自媒体系统业务逻辑层；任何"算不错就不能错"的代码 |
| 13 | **finishing-a-development-branch** | superpowers | 完成后自动检测环境、跑测试验证、给出合并/PR/保留/丢弃 4 种选项 | 功能开发完毕后规范化收尾；课程大作业阶段性提交 |
| 14 | **receiving-code-review** | superpowers | 处理审查反馈：禁止表演性认同、必须先验证再改、提供有理有据的异议模板 | 导师/同学给代码意见时，系统化处理而非盲从 |
| 15 | **using-git-worktrees** | superpowers | 创建隔离工作区，不影响主工作目录 | 课程大作业的多个实验性方案并行尝试；重构前做安全隔离 |
| 16 | **frontend-design** | anthropics | 生产级前端界面设计，避"AI 塑料感"：独特美学、字体、配色、动效 | 自媒体新闻系统前端；答辩展示用的可视化看板；项目门户页 |
| 17 | **api-design** | everything-claude-code | REST API 设计规范：资源命名、状态码、分页、过滤、错误响应、版本控制 | 自媒体系统后端 API 设计；分布式框架各节点通信接口定义 |
| 18 | **backend-patterns** | everything-claude-code | 后端架构模式：API设计、数据库优化、Node.js/Express/Next.js | 自媒体系统服务端架构；分布式框架 Master/Worker 节点设计 |
| 19 | **slides** | ui-ux-pro-max | HTML 演示文稿生成，Chart.js 图表、设计令牌、响应式布局 | 课程答辩 PPT（直接生成 HTML，在浏览器演示比 PowerPoint 更出彩） |
| 20 | **article-writing** | everything-claude-code | 技术文章/教程/博客写作，统一风格和可信度 | 课程设计报告/实验报告/技术文档；自媒体系统配套技术博客 |
| 21 | **changelog-generator** | awesome-claude-skills | 从 git 提交记录自动生成用户友好的版本发布说明 | 课程项目各迭代版本说明；自媒体系统对外发布日志 |
| 22 | **documentation-lookup** | everything-claude-code | 用 Context7 MCP 查最新库/框架文档，而非依赖训练数据 | 用陌生框架/库时（如新出的分布式中间件）；确保使用最新 API |

### ⚙️ 按需启用（16 个）— 遇到特定场景才启用

| # | 技能名称 | 来源 | 触发场景 |
|---|---------|------|---------|
| 23 | **database-designer** / **database-schema-designer** | claude-skills | 数据库表结构设计、ER 图、索引优化（自媒体系统用户/文章/评论库设计） |
| 24 | **deep-research** | everything-claude-code | 技术选型调研（"XX 分布式框架哪个适合我？"）、竞品分析、行业报告 |
| 25 | **mcp-builder** / **mcp-server-patterns** | anthropics / ecc | 开发 MCP 服务器（分布式框架中如果要用 MCP 协议做服务间通信） |
| 26 | **security-review** | everything-claude-code | 上线前的安全检查：认证、输入校验、密钥管理、API 端点 |
| 27 | **e2e-testing** | everything-claude-code | 端到端测试（Playwright Page Object Model、CI/CD 集成） |
| 28 | **docker-development** | claude-skills | Docker 容器化开发部署（分布式框架多节点一键启动） |
| 29 | **ci-cd-pipeline-builder** | claude-skills | CI/CD 流水线搭建 |
| 30 | **refactor-safely** | code-review-graph | 大范围重构前做影响分析，预览所有受影响位置 |
| 31 | **debug-issue** | code-review-graph | 知识图谱辅助调试：语义搜索、调用链追踪、执行流分析 |
| 32 | **explore-codebase** / **build-graph** | code-review-graph | 接手陌生代码库时快速理解结构；大型开源项目源码阅读 |
| 33 | **review-pr** / **review-delta** | code-review-graph | 结构化的 PR/分支差异审查（知识图谱增强版） |
| 34 | **competitive-ads-extractor** | awesome-claude-skills | 自媒体项目竞品分析、广告文案参考、市场定位研究 |
| 35 | **content-research-writer** | awesome-claude-skills | 自媒体内容研究与写作辅助（带引用和提纲迭代） |
| 36 | **frontend-slides** | everything-claude-code | 动画增强型 HTML 演示（从 PPT 转换或从零创建） |
| 37 | **canvas-design** | anthropics | 海报/封面图/架构图视觉设计（答辩展板、项目封面） |
| 38 | **image-enhancer** | awesome-claude-skills | 截图增强（论文/报告里放的截图更清晰） |

### ❌ 完全不用（30+ 个）— 与我的场景不匹配，直接剔除

以下技能与"分布式框架课程/自媒体系统/代码开发/答辩材料"场景无关，无需关注：

- **UI/品牌类**：algorithmic-art、brand-guidelines（仅 Anthropic 品牌）、brand、design-system、banner-design、theme-factory、slack-gif-creator、brand-voice
- **办公/商务类**：internal-comms、invoice-organizer、meeting-insights-analyzer、lead-research-assistant、investor-materials、investor-outreach、developer-growth-analysis
- **社交媒体类**：twitter-algorithm-optimizer、x-api、crosspost、content-engine、video-editing、fal-ai-media、youtube-downloader
- **平台/工具类**：all composio-skills（100+ 个第三方 API 自动化）、connect-apps、connect、domain-name-brainstormer、raffle-winner-picker、file-organizer、tailored-resume-generator
- **底层/元技能类**：using-superpowers、writing-skills、skill-creator、skill-share、agent-sort、everything-claude-code、strategic-compact、agent-introspection-debugging、eval-harness、dmux-workflows、mle-workflow、bun-runtime、nextjs-turbopack、market-research
- **桌面自动化类**：cua-driver、gui-automation
- **其他**：template-skill、generic-agent skill_search、langsmith-fetch

---

## 第二部分：必装技能的标准化调用话术

以下是 8 个必装技能的**可直接复制使用的触发话术**，每条话术精确匹配技能的触发条件：

### 1. karpathy-guidelines — 编码行为准则

```
请在写代码前先遵循 karpathy-guidelines：
- 先思考再编码，明确假设和成功标准
- 简单优先，用最少代码解决问题
- 精准修改，只改必须改的地方
- 完成后用验证命令证明代码正确
```

### 2. brainstorming — 功能设计

```
我有一个需求：[描述需求]。
请按照 brainstorming 流程，先和我讨论设计方案，
梳理清楚以下问题后再动手：
1. 核心功能和边界
2. 技术方案选型（至少 2 个选项及对比）
3. 数据流和组件关系
4. 潜在风险和边界情况
在我的确认之前，不要写任何代码。
```

### 3. writing-plans — 实施计划

```
基于已确认的设计方案，请按照 writing-plans 流程写出详细实施计划：
- 每个任务 2-5 分钟可完成
- 包含精确文件路径和完整代码
- 包含确切命令和期望输出
- 任务之间有清晰的依赖关系
完成后保存到 docs/plans/ 目录下。
```

### 4. systematic-debugging — 系统调试

```
遇到了一个 bug：[描述现象和复现步骤]。
请严格按照 systematic-debugging 的 4 阶段流程：
Phase 1: 根因调查（不要猜，用命令/tool 取证）
Phase 2: 模式分析（归纳证据，定位嫌疑代码）
Phase 3: 假设与测试（提出假设，创建最小复现用例）
Phase 4: 实施修复
在 Phase 1 完成前，不要提出任何修复方案。
```

### 5. verification-before-completion — 完成前验证

```
请现在就运行验证命令确认当前状态：
1. [测试命令]
2. [启动服务命令]
3. [浏览器检查点]
读取命令输出，汇报实际结果，不要假设任何步骤已成功。
```

### 6. requesting-code-review — 代码审查

```
请对当前的变更进行代码审查，聚焦以下方面：
- 逻辑正确性和边界情况
- 安全漏洞（注入、XSS、权限绕过）
- 代码可读性和可维护性
- 测试覆盖率和测试质量
问题按 Critical / Important / Minor 分级，并给出具体修改建议。
```

### 7. coding-standards — 编码规范

```
请在编写代码时遵循以下规范：
- 命名：描述性全名，禁止单字母变量（循环索引除外）
- 不可变性：优先 const/final，避免 mutation
- 函数：单一职责，短小精悍（不超过 30 行）
- 错误处理：不要吞异常，给出可操作的错误信息
- 注释：解释 WHY 而非 WHAT
- KISS/DRY/YAGNI 原则
```

### 8. webapp-testing — Web 测试

```
请用 Playwright 对当前 Web 应用进行测试：
- 启动本地服务（端口 XXXX）
- 验证以下页面/功能：[列表]
- 截图保存到 tests/screenshots/
- 检查浏览器控制台是否有报错
```

---

## 第三部分：通用项目开场指令

以下指令可直接套用到任何新项目的第一条消息中：

```
我正在开始一个新项目：[项目名称和一句话描述]。

请按以下流程启动项目工作流：

**Phase 0 — 环境扫描**
1. 查看当前目录结构，了解现有文件和配置
2. 检查是否有已存在的 CLAUDE.md 或项目规范文件

**Phase 1 — 需求澄清（brainstorming）**
3. 就以下问题和我逐项讨论确认：
   - 核心功能范围（MVP 包含什么，不包含什么）
   - 技术栈选型（每个关键技术的选择理由）
   - 数据模型概要（核心实体和关系）
   - 项目目录结构设计

**Phase 2 — 规范建立（coding-standards）**
4. 为项目定义统一的编码规范并写入 CLAUDE.md
5. 初始化 git 仓库（如未初始化），创建 .gitignore

**Phase 3 — 实施计划（writing-plans）**
6. 基于确认的设计方案，生成详细的实施计划
7. 计划包含：任务列表（每个 2-5 分钟）、文件路径、测试策略

**Phase 4 — 开发循环**
8. 按计划逐任务执行（executing-plans / subagent-driven-development）
9. 每完成一个功能模块：代码审查（requesting-code-review）→ 验证（verification-before-completion）→ 提交

**全程贯穿原则（karpathy-guidelines）**
- 先思考再编码，每次改动前声明假设和成功标准
- 简单优先，用最少代码解决问题
- 遇到 bug 立即切换 systematic-debugging，禁止乱改猜测

请从 Phase 0 开始。
```

---

## 第四部分：技能使用避坑指南

### 坑 1：技能不互斥，但别叠加过度
- 同一时间只让一个"流程性技能"主导对话（如 brainstorming 和 writing-plans 不能同时跑，前者输出设计、后者基于设计写计划）
- 流程性技能的调用顺序严格遵守：brainstorming → writing-plans → executing-plans → finishing-a-development-branch

### 坑 2：调试时最忌跳过根因调查
- systematic-debugging 的 Phase 1 是最容易被跳过的步骤，也是最重要的步骤
- 如果 3 次修复尝试都失败了，停止修复，退回 brainstorming 讨论架构层面的问题
- 修复后必须用 verification-before-completion 验证，绝不说"应该没问题了"

### 坑 3：TDD 不是所有场景都适用
- TDD 适用于：核心业务逻辑、算法实现、数据处理、API 接口
- TDD 不适用于：UI 样式调整、一次性脚本、探索性原型、配置文件
- 写计划时判断：这个任务的产出能否被自动化测试验证？不能就不强制 TDD

### 坑 4：代码审查不要在"刚写完"时立即触发
- 先跑一遍 verification-before-completion 确保基础功能正常
- 审查子代理是独立上下文，记得在 prompt 里把关键文件路径传过去
- 审查完成后，对于 Minor 级别的建议不要花太多时间

### 坑 5：slides 和 article-writing 的输入质量决定输出质量
- 生成答辩 PPT 前，先把核心论点、数据、结论整理成结构化大纲
- 生成课程报告前，先把模块功能列表、关键指标、截图准备好
- 不要期望直接给一句话就能生成高质量文档

### 坑 6：并行代理不是越多越好
- dispatching-parallel-agents 适用于完全独立的任务（不同文件、不同模块、无共享状态）
- 如果任务之间有依赖关系，必须串行执行
- 并行任务数量不超过 3-4 个，否则上下文开销反超收益

### 坑 7：知识图谱类技能需要预构建
- code-review-graph 系列的 build-graph 必须在首次使用前构建一次 SQLite 数据库
- 大项目（500+ 文件）构建需要时间，建议项目稳定后构建一次，后续增量更新
- 小项目（<50 文件）直接用代码审查技能即可，不需要额外建图谱

### 坑 8：不要混淆项目级和全局级技能
- superpowers 系列的技能（brainstorming、writing-plans、systematic-debugging 等）是通用的开发方法论，所有项目适用
- everything-claude-code 系列的技能偏重具体技术栈（React/Next.js/Node.js），确认技术栈匹配后再用
- ui-ux-pro-max 系列的技能依赖 shadcn/ui + Tailwind CSS，项目如果不是这套技术栈，只参考其设计理念

### 坑 9：技能描述 vs 实际能力有差距
- 技能本质是给 Claude 发的"系统指令"，不是外挂工具
- 技能的效果取决于 Claude 模型本身的能力边界和当前上下文
- 如果某个技能没有达到预期效果，可能是 prompt 不够具体，重新调整触发话术

### 坑 10：CLAUDE.md 和 skills.md 的职责分离
- CLAUDE.md：记录项目本身的信息（技术栈、目录结构、编码规范、常用命令）
- skills.md（本文件）：记录"什么时候该用什么技能"，是技能使用手册
- 不要把技能内容写进 CLAUDE.md，也不要把项目信息写进 skills.md
