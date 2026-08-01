# All API Hub 个人增强版统一改造文档

## 1. 版本定位与分支约定

- 魔改仓库：<https://github.com/qianbkk/all-api-hub>
- 上游来源：<https://github.com/qixing-jk/all-api-hub>
- `main`：魔改版唯一默认开发、发布与更新追踪分支。
- `upstream-sync`：上游原始代码镜像分支，仅用于审查上游变化，禁止直接作为魔改版发布源。
- `.github/workflows/sync-upstream.yml`：每日或手动将上游 `main` 镜像到 `upstream-sync`；任何进入 `main` 的上游变化都必须经过人工审查与合并。

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

应用只检查 `qianbkk/all-api-hub` 的 Release；CI、测试、文档和发布工作流只监听 `main`；上游通过独立工作流镜像到 `upstream-sync`。这将“产品更新”和“上游跟踪”彻底分离。

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
- i18next CLI 键提取与 `extract --dry-run --ci --quiet`：通过；七套 About 语言资源按提取器确定性顺序整理，CI 干跑显示 `No files were updated`。
- i18n 命名空间、静态翻译键和西班牙语资源一致性：3 项测试通过。
- TypeScript `tsc --noEmit`：通过；此前 3 个 React 类型错误确认来自隔离副本 `.wxt/types/imports.d.ts` 的陈旧绝对路径，重新指向隔离源码后错误消失。
- ESLint 全项目检查：通过。
- Knip 未使用代码检查：通过；已删除 `src/constants/about.ts` 中未使用的 `RELEASES_URL` 和 `UPSTREAM_REPO_URL` 导出。
- Prettier 全项目检查：通过。
- 安全默认值、签到错峰、调度、公告分类、更新源、About 等 11 个关键测试文件共 247 项测试通过；About 个人 Stable / Nightly 目标测试另行复跑 2 项通过。
- 文档脚本测试 10 项通过，129 份 Markdown 链接检查 0 警告。
- 本地并行 Vitest coverage 曾在资源争用下出现大量统一 15 秒超时，和远端原始失败模式不同，已停止该失真运行；远端仍按两个独立分片进行完整验证。

文档发布地址保持为 `https://qianbkk.github.io/all-api-hub/`。部署已改用 GitHub Pages 官方 Actions Artifact 流程，不再创建或依赖 `gh-pages` 分支；更新日志的原始数据回退也只读取 `main`。本轮修复了安全默认值调整造成的两项过期单元测试期望、个人仓库 Release API 的三项 E2E 拦截地址，以及动态翻译键导致的 i18n 提取差异。nightly 在配置 `PAT_TOKEN` 时更新标签和 Release；Fork 未配置该可选 Secret 时仍完成构建与校验，并明确安全跳过发布写入。

## 8. 最新上游审查（2026-08-01）

- 上游公开 `main` 与个人 `upstream-sync` 均为 `b12c2ddc0fe1ca0446ac42bcc3ae88dc77a8366b`，跟踪分支已同步，无需强制移动。
- 个人增强版当前基底为上游 `46f02dc6b03d02b571ed631d4c4f698bfaf78742`；最新上游比该基底增加 8 个提交。
- `v3.54.0`（`770d94df35f1de0993d8505d2ac32da580d633cc`）是最新上游 `main` 的祖先，不是独立旁支；其发布提交只更新上游版本号和上游变更日志，不能直接替换个人版发布元数据。

审查结论：

1. README 刷新和站点排序：内容可作为后续文档维护参考，但直接合并会覆盖个人品牌、分支说明和更新源，本轮不 cherry-pick。
2. 自动保护回退策略与开发触发器：引入按功能自动绕过配置，并继续以自动安全挑战处理为产品能力；这与个人版“后台默认关闭、仅保留用户可见人工验证接力”的安全边界冲突，本轮明确不吸收。
3. Unified API Guidance：是跨 151 个文件的大型新手引导功能，依赖上游最新自动回退策略、设置结构和产品分析契约。它不属于当前多站账号管理核心需求，整批移植风险高，本轮不吸收；未来如确有需求，应以独立功能分支重新设计，而不是直接覆盖个人版。
4. CONTRIBUTING 验证说明：仅为上游贡献流程文档，不影响运行时；个人仓库已有自己的验证记录，本轮不移植。
5. 未发现可以脱离上述大型功能、且不改变个人品牌或安全策略的独立 bug fix，因此本轮不对 `main` 手工移植上游代码。

后续上游变化继续只进入 `upstream-sync`，每次按“独立修复、功能依赖、安全边界、个人品牌与更新源”五项逐一审查后再决定是否手工移植。

### 8.1 二次复检增量

2026-08-01 二次全面复检时，上游在第一次验收后又新增 2 个提交，`upstream-sync` 已继续同步至 `4fec675ddec96d0eb28382eade96ee90012b813e`：

1. `7f4b5c8d` 新增验证页面标签页模式公告。个人版吸收其“减少窗口抢焦点”的使用提示，但改写为人工验证接力说明，明确不会自动破解或绕过安全挑战，并将公告来源保留在个人仓库。
2. `4fec675d` 新增巴西葡萄牙语（`pt-BR`）完整界面资源、语言切换、日期自然语言输入和相应测试。该功能与个人品牌及安全边界无冲突，已手工移植到 `main`。

本次仍未引入自动保护绕过逻辑；个人版的 `enabled: false`、`useForAutoRefresh: false` 和用户可见人工验证原则保持不变。

## 9. 个人版品牌、链接与发行渠道复检（2026-08-01）

本轮对所有用户可见入口进行了独立性审查，覆盖 README、About、Manifest 本地化名称、应用简介、VuePress 首页与 SEO、安装文档、FAQ、合作站点教程、Issue 模板、Safari Bundle ID 和 GitHub Actions。

主要修正：

1. README 中的仓库、Releases、文档、Issues 和安装渠道统一指向 `qianbkk/all-api-hub`；上游链接只用于许可证、作者归属和历史技术引用。
2. About 页面移除上游 Chrome、Edge、Firefox 商店下载卡片，改为个人 Stable 与 Nightly Release。
3. 九套浏览器 Manifest 本地化名称和简介、七套应用 UI / About 语言资源统一标识个人增强版，并说明更新、公告、文档和反馈追踪个人仓库。
4. 中英日安装、FAQ、其他浏览器指南和 12 份合作站点教程不再推荐或链接上游商店包；个人版仅通过 Stable、Nightly 和源码构建分发，手动安装不会自动更新。
5. 删除已无用户界面用途的上游商店页面 URL；保留的 Chrome / Edge 扩展 ID 已重命名为 `UPSTREAM_CHROMIUM_STORE_IDS`，仅作为识别上游商店安装来源的兼容标记，不是个人版发布目标。
6. 普通用户文档中的旧上游文档域名和普通仓库入口已清理；`docs/superpowers` 的历史设计稿保留原始地址，以维持历史技术上下文。
7. Issue 模板、文档 Issue tracker、CI 发布配置和 Safari Bundle ID 已切换到个人仓库命名空间。
8. `scripts/update-release-extra-notes.sh` 已删除旧文档域名、上游商店 URL 和“优先商店版”说明；Stable / Nightly Release 附加说明只描述个人仓库的手动安装与更新边界。
9. `scripts/prepare-safari-release-assets.sh` 与发布工作流默认 Safari Bundle ID 均改为 `io.github.qianbkk.allapihub`。
10. 浏览器商店提交任务新增 `publish_browser_stores` 显式开关，默认关闭；仅手动触发且个人商店凭据完整时运行，缺少可选 Secrets 时安全跳过，不影响个人 Release 构建。
11. VuePress 生产构建使用 `/all-api-hub/` 基路径；主题 Logo 保持根相对资源路径，由 VuePress 只添加一次 base，避免生成 `/all-api-hub/all-api-hub/512.png`。

发行边界：Chrome Web Store、Edge Add-ons 和 Firefox Add-ons 中的同名扩展仍属于上游发行版，不代表个人增强版。个人版用户应只从 `https://github.com/qianbkk/all-api-hub/releases` 获取安装包。
