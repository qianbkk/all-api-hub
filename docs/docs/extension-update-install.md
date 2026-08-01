# 个人版安装渠道与更新说明

All API Hub 个人增强版只通过 `qianbkk/all-api-hub` 发布。浏览器商店里的同名扩展由上游项目维护，不是本个人版。

::: tip 简单结论
日常使用请安装 [个人 Stable](https://github.com/qianbkk/all-api-hub/releases/latest)；需要提前验证新改动时使用 [Nightly](https://github.com/qianbkk/all-api-hub/releases/tag/nightly)。两者都需要手动安装和升级。
:::

## 我该安装哪个版本？

| 你的情况 | 建议选择 | 更新方式 |
|---|---|---|
| 日常稳定使用 | [个人 Stable](https://github.com/qianbkk/all-api-hub/releases/latest) | 重新下载新版并手动安装 |
| 提前验证修复或新功能 | [个人 Nightly](https://github.com/qianbkk/all-api-hub/releases/tag/nightly) | 重新下载并手动安装，可能不稳定 |
| 开发、审查或自定义 | [个人仓库源码](https://github.com/qianbkk/all-api-hub) | 自行拉取、构建和加载 |
| Safari | 个人 Release 中的 Safari 产物或源码构建 | 参照 [Safari 安装指南](./safari-install.md) |
| QQ / 360 / 猎豹 / Brave / Vivaldi / Opera | 个人 Stable 中的 Chrome 包 | 参照 [其他浏览器安装指南](./other-browser-install.md) |

::: warning 不要混淆上游商店版
Chrome Web Store、Edge Add-ons 和 Firefox Add-ons 中现有的同名扩展属于上游发行渠道。安装这些包会得到上游版，而不是本文档描述的个人增强版；其更新、品牌和功能也不受 `qianbkk/all-api-hub` 控制。
:::

## 在插件里检查更新

打开 All API Hub 设置页，在版本与更新区域点击 **“立即检查”**。

个人版会读取：

1. `qianbkk/all-api-hub` 的最新正式 Release；
2. 当前安装版本与个人 Stable 的版本差异。

你可能会看到：

- **当前已是最新正式版**：无需处理。
- **发现可升级的新版本**：打开个人 Release 页面下载对应浏览器安装包。
- **检查失败**：可能是 GitHub 或网络暂时不可用，稍后重试即可。

个人版不会静默下载、替换扩展，也不会把上游商店版标记为个人版。

## 手动安装与更新

1. 先在设置中导出备份，避免切换安装来源时丢失数据。
2. 打开 [个人 Stable Release](https://github.com/qianbkk/all-api-hub/releases/latest)。
3. 下载与你的浏览器匹配的包，例如 Chrome、Firefox 或 Safari 构建产物。
4. 按浏览器要求解压并加载，或使用对应平台的安装流程。
5. 后续更新时重新下载新版并替换原安装目录，或移除旧版后重新安装。

::: warning 手动安装不会自动升级
个人版目前不通过浏览器商店分发，因此浏览器不会自动推送个人版更新。建议 Star / Watch 个人仓库，并定期使用插件内检查功能。
:::

## 常见问题

### “立即检查”会自动下载安装包吗？

不会。它只比较当前版本与个人 Stable，并提供个人 Release 入口。

### Nightly 适合长期使用吗？

不建议。Nightly 用于提前验证个人版变更，可能包含尚未完成的功能或回归问题。

### 可以同时安装上游商店版和个人版吗？

仅建议在明确测试时这样做。两个安装来源的扩展 ID、存储和更新行为可能不同，切换前应先导出备份，并确认当前打开的是哪一个版本。

### 手动安装版怎么更新？

重新下载新版安装包并加载新版目录。Chromium 系浏览器的具体步骤见 [其他浏览器安装指南](./other-browser-install.md#update-extension)。

## 相关文档

- [开始使用](./get-started.md)
- [其他浏览器安装指南](./other-browser-install.md)
- [Safari 扩展安装指南](./safari-install.md)
- [更新日志](./changelog.md)
