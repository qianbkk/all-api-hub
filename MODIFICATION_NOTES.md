# All API Hub 个人增强版统一改造文档

## 1. 版本定位与分支约定

- 魔改仓库：<https://github.com/qianbkk/all-api-hub>
- 上游来源：<https://github.com/qixing-jk/all-api-hub>
- `personal-main`：魔改版唯一默认开发、发布与更新追踪分支。
- `upstream-sync`：上游原始代码镜像分支，仅用于审查上游变化，禁止直接作为魔改版发布源。
- `.github/workflows/sync-upstream.yml`：每日或手动将上游 `main` 镜像到 `upstream-sync`；任何进入 `personal-main` 的上游变化都必须经过人工审查与合并。

本版本延续上游许可证和作者归属。上游链接仅用于来源、历史记录与必要的技术引用；应用内更新、公告、文档原始数据和发布流程均追踪魔改仓库。

## 2. 架构分析结论

项目是基于 WXT 的 Manifest V3 浏览器扩展，前端使用 React 19 + TypeScript，数据默认存储于浏览器本地存储，后台任务由扩展 Service Worker 和 `alarms` 调度。

主要结构：

- `src/entrypoints/`：Popup、Options、Side Panel、Background 等扩展入口。
- `src/features/`：账号管理、余额历史、模型列表、签到、API Key、公告等业务页面和组件。
- `src/services/`：账号存储、站点适配器、签到调度、余额历史、公告、更新检查、通知、限流及临时浏览上下文。
- `src/types/`：跨模块数据契约。
- `src/locales/`：多语言资源。
- `tests/`：Vitest 单元与组件测试；`e2e/` 使用 Playwright。

上游最新版已经具备以下成熟基础能力，因此本次保留并复用，而不是重复实现：

1. 多站点、多账号及 New API / One API / Sub2API / 自定义后端适配器。
2. 余额和用量刷新、每日余额历史及变化展示。
3. 一键/定时签到、失败重试、结果通知与后台调度。
4. 模型分组、模型列表、倍率和价格获取；按账号充值比例换算人民币等效价格并支持跨站比较。
5. API Key 及 Base URL、分组、倍率等关联信息管理。
6. 站点公告拉取、去重、缓存、已读状态、通知及管理页面。
7. 站点级限流、失败状态、临时浏览上下文、WebDAV 加密备份等基础组件。

## 3. 精简与安全边界调整

### 3.1 关闭自动后台安全挑战处理

**调整内容**

`src/services/preferences/userPreferences.ts` 将临时浏览回退默认值改为：

- `enabled: false`
- `useForAutoRefresh: false`
- `useForManualRefresh: true`
- `tempContextMode: Tab`

**原因**

自动破解滑块、图片点选验证码、规避机器识别、伪造设备指纹或轮换 IP 会绕过平台安全控制。本版本不实现这些能力，也不承诺规避风控。

**失去的功能**

- 后台定时任务不会在无用户参与时自动通过验证码或 Cloudflare 等安全挑战。
- 发生挑战时，任务可能暂停或失败，需要用户在可见标签页中手动完成验证后重试。

**替代效果**

保留独立临时浏览上下文用于防止 Cookie/会话串号，但不改变网络身份或设备指纹。手动刷新可以显式打开可见标签页进行人工验证接力。

### 3.2 不保存站点明文密码

**调整内容**

未新增账号密码库，继续使用现有浏览器登录态、访问令牌、Cookie 容器和浏览器密码管理器。

**原因**

浏览器扩展本地存储不是专用密码保险库；集中保存明文密码会扩大泄露面。

**失去的功能**

扩展不能代替密码管理器自动填写任意站点账号密码。

**替代效果**

账号业务数据仍默认保存在本机；不同临时上下文隔离会话，凭据管理交给浏览器或用户认可的密码管理器。

### 3.3 移除上游产品动态控制

**调整内容**

运行时版本检查、产品公告、文档原始数据、赞助目录、仓库入口及 GitHub Actions 全部改为魔改仓库来源。产品公告 CTA 的 GitHub 白名单仅允许 `qianbkk/all-api-hub`。

**原因**

防止魔改版被上游发布、公告或远程目录意外改变，并确保版本提示属于魔改版自身。

**失去的功能**

上游发布新版本时，魔改版不会直接提示或自动采用；需先同步到 `upstream-sync` 并审查合并。

**替代效果**

魔改版拥有独立发布链路，同时保留可审计的上游追踪分支。

## 4. 新增功能

### 4.1 同站多账号签到错峰

**代码结构**

- `src/services/checkin/autoCheckin/accountStagger.ts`
- `src/services/checkin/autoCheckin/scheduler.ts`
- `tests/services/autoCheckin/accountStagger.test.ts`

**实现逻辑**

1. 将账号 `site_url` 规范化为 origin。
2. 不同 origin 的首个账号立即执行。
3. 相同 origin 的后续账号按顺序增加 30–300 秒的有界随机间隔。
4. 调度只分散请求负载，不修改 IP、浏览器指纹、Cookie 或安全信号。

**达成效果**

同站多账号不再同时发起签到，降低瞬时并发和站点压力；不同站点仍可并行执行。

### 4.2 公告关键事件识别

**代码结构**

- `src/services/siteAnnouncements/insights.ts`：本地确定性分类规则。
- `src/types/siteAnnouncements.ts`：分类和置信度数据契约。
- `src/services/siteAnnouncements/scheduler.ts`：抓取时生成分类。
- `src/services/siteAnnouncements/storage.ts`：分类字段校验、持久化和旧数据兼容。
- `src/features/SiteAnnouncements/components/SiteAnnouncementCard.tsx`：标签展示。
- `src/locales/*/siteAnnouncements.json`：多语言标签。
- `tests/services/siteAnnouncements/insights.test.ts`：规则测试。

**实现逻辑**

公告标题和正文只在本地使用正则规则识别：

- 模型上新 `model_launch`
- 特价/优惠 `promotion`
- 价格/倍率调整 `pricing_change`
- 维护/故障 `maintenance`

每个标签附带 `high` 或 `medium` 置信度；原文不会发送给外部模型。公共记录允许旧数据缺少分类字段，持久化层会过滤未知类型和非法置信度并归一化为空数组，UI 也使用空数组兜底。

**达成效果**

管理页面可直接看到模型上新、特价、倍率调整及维护标签，更容易从多站公告中定位关键变化。

### 4.3 魔改版独立更新与上游追踪

**代码结构**

- `src/constants/about.ts`
- `src/services/updates/releaseUpdateService.ts`
- `src/services/updates/releaseUpdateStatus.ts`
- `src/services/productAnnouncements/remoteFeed.ts`
- `src/services/productAnnouncements/urlPolicy.ts`
- `src/utils/navigation/docsLinks.ts`
- `src/features/AccountManagement/sponsors/constants.ts`
- `.github/workflows/*.yml`
- `.github/workflows/sync-upstream.yml`

**实现逻辑与效果**

应用只检查 `qianbkk/all-api-hub` 的 Release；CI、测试、文档和发布工作流只监听 `personal-main`；上游通过独立工作流镜像到 `upstream-sync`。这将“产品更新”和“上游跟踪”彻底分离。

## 5. 原需求覆盖关系

| 原需求 | 实现状态 | 说明 |
|---|---|---|
| 多站多账号、余额及每日历史 | 已由上游实现并保留 | 本地存储、后台 alarms、余额历史服务与管理页面继续使用。 |
| 一键/自动签到 | 已保留并增强 | 新增同 origin 30–300 秒错峰；不隔离 IP 或伪造指纹。 |
| 自动处理滑块/图片验证且不被识别 | 不实现 | 改为可见临时标签页的人工验证接力。 |
| 模型分组、列表、价格及币种换算 | 已由上游实现并保留 | 使用站点倍率与账号充值比例进行等效价格比较。 |
| API Key 及分组/倍率/Base URL | 已由上游实现并保留 | 继续复用账号运行时 Key 和 API 凭据功能。 |
| 公告抓取与关键信息识别 | 已增强 | 新增四类本地规则标签、持久化与 UI 展示。 |
| 基础组件与工具 | 已保留并补充 | 复用适配器、限流、调度、通知、存储和临时上下文。 |

## 6. 使用限制

- 仅对用户有权访问且允许自动化的站点启用抓取和签到。
- 不使用代理轮换、IP 隔离、设备指纹伪造或行为仿真来规避风控。
- 不破解 CAPTCHA、安全挑战或登录保护。
- 站点接口、页面或政策变化可能导致适配器失效，应尊重服务条款并及时停用异常任务。
- 账号、Key、余额和公告可能包含敏感信息；启用 WebDAV 前应使用加密备份并妥善保存密钥。

## 7. 验证记录

本轮在隔离 Node.js 24.18.1 环境下完成以下验证：

- `git diff --check`：通过，无空白错误。
- Prettier 全项目检查：通过。
- TypeScript `tsc --noEmit`：通过。
- ESLint 全项目检查：通过。
- 新增功能与签到调度定向测试：3 个测试文件、151 项测试全部通过。
- 全量 Vitest 首轮共执行 10,562 项测试，其中 10,502 项通过、1 项跳过；最初失败主要来自本机依赖安装中断导致的 `dayjs`、`react-arborist`、`motion-dom` 包内容/链接不完整，以及部分既有高耗时测试超时。恢复依赖后，受影响的 i18n、画布、签到调度等代表性测试均通过；另有 1 项既有 LDOH 协调器断言仍失败，与本次改动无直接调用关系。
- Chromium 生产构建已完成 Vite 打包阶段，仅有既有的动态/静态混合导入和大 chunk 警告；本机 WXT 进程在最终收尾阶段长时间未退出，因而终止等待，未将其误记为完整通过。远端 E2E 的两个干净环境均已成功完成扩展构建，其中 `dnr-required` 场景已完整通过。
- Knip 在本机环境无法解析项目 `tsconfig.json`（同一配置可被 TypeScript 正常解析）；远端干净环境同样在 Knip 步骤失败，需在完整运行结束后依据日志单独处理，不将其误记为通过。

文档发布地址为 `https://qianbkk.github.io/all-api-hub/`，发布工作流已成功部署到本仓库的 `gh-pages` 分支。CI 的 E2E 默认场景和单元测试分片仍在运行；最终状态以对应 GitHub Actions 运行记录为准。
