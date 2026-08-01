# Getting Started

In just a few minutes, you can start your journey of intelligent AI asset management. All API Hub can help you automatically sync quotas, perform daily check-ins, and integrate with your favorite AI tools with one click.

## 1. Installation

The personal enhanced edition is published only through `qianbkk/all-api-hub`; upstream browser-store packages are not personal-edition distribution channels.

| Channel | Intended use | Download | Update method |
|---|---|---|---|
| Stable | Recommended personal-edition release for daily use | [Download latest Stable](https://github.com/qianbkk/all-api-hub/releases/latest) | Download and reinstall manually |
| Nightly | Preview personal-edition changes before Stable | [Download Nightly](https://github.com/qianbkk/all-api-hub/releases/tag/nightly) | Download and reinstall manually; may be unstable |
| Source build | Development, review, or custom builds | [Open the personal repository](https://github.com/qianbkk/all-api-hub) | Pull, build, and install it yourself |

::: warning Installation source
The similarly named Chrome, Edge, and Firefox store listings are published by the upstream project, not by this personal enhanced edition. To receive the features, branding, update source, and security policy documented here, install only a Release from the personal repository above. Manual personal-edition builds do not auto-update; Star / Watch the repository for release notifications.
:::

<details>
<summary>📦 Safari, another browser, or mobile? (Click to expand)</summary>

- **Safari (Mac)**: Requires installation via Xcode. See the [Safari Installation Guide](./safari-install.md).
- **QQ / 360 / Brave / Vivaldi / Opera, etc.**: Download the Chrome package from the personal Stable Release and load it manually. See the [Other Browser Installation Guide](./other-browser-install.md).
- **Mobile**: Availability depends on whether the browser can load an external extension. See [Mobile FAQ](./faq.md#mobile-browser-support).

</details>

<a id="add-site"></a>
## 2. Add Your First Account

This is the most crucial step for using the plugin. We **highly recommend using the "Auto-Recognize" feature**, which is as simple as scanning a QR code to log in.

### 2.1 Auto-Recognize (Recommended)

::: tip First Step
Open and log in to your AI proxy station website in your browser first.
:::

1. Click the plugin icon in the top-right corner of your browser to open the main page.
2. Click **`Add Account`**.
3. Enter the URL of the site in the dialog that appears.
4. Click **`Auto-Recognize`**.
5. After confirming the information is correct, click **`Confirm Addition`**.

::: tip Don't have an account yet?
If you are looking for stable, efficient, and highly compatible AI relay services, try our partners:

- [Dola Seed on BytePlus ModelArk](https://www.byteplus.com/en/product/modelark?utm_campaign=hw&utm_content=all-api-hub&utm_medium=devrel_tool_web&utm_source=OWO&utm_term=all-api-hub): Register through BytePlus ModelArk to get 500,000 free inference tokens per model.
- [Qiniu Cloud AI](https://s.qiniu.com/qE3eai): An enterprise MaaS platform with one-stop access to 150+ mainstream global models. Enterprise users can claim 12 million free tokens.
- [Fenno.ai](https://api.fenno.ai/register?redirect=/purchase?tab=subscription%26group=16&aff=VS3FMCGW4XK4): A stable and efficient Codex relay provider compatible with OpenAI and Anthropic protocols, ready for Codex, Claude Code, OpenCode, and other coding tools. All API Hub users can subscribe to the 9.9 RMB / $150-equivalent Coding Plan.
- [PackyCode](https://www.packyapi.com/register?aff=all-api-hub): Enter the `all-api-hub` promo code during recharge to get 10% off. [Setup guide](./sponsor-guides/packycode.md)
- [Xingchen AI](https://ai.centos.hk): 1:1 top-up ratio, invoicing support, and Claude pricing as low as 40% of the standard price. [Setup guide](./sponsor-guides/xingchen.md)
- [Atlas Cloud](https://www.atlascloud.ai/console/coding-plan?utm_source=github&utm_medium=link&utm_campaign=all-api-hub): One AI API for 300+ curated video, image, and LLM models, with a new coding plan promotion for more budget-friendly API access.
- [AICodeMirror](https://www.aicodemirror.com/register?invitecode=7IQNR8): Official high-stability relay services for Claude Code / Codex / Gemini CLI. Register through this link to get 20% off your first top-up, and enterprise customers can get up to 25% off.
- [RunAPI](https://runapi.co/register?aff=cvDm): Register and contact a RunAPI administrator to receive a ￥7 free credit. [Setup guide](./sponsor-guides/runapi.md)
- [Unity2.ai](https://unity2.ai/register?ref=9NjKJ86j&source=allapihub): A high-performance AI model API relay platform for developers, teams, and enterprises, with 5,000 RPM-level concurrency. Register through this link to receive $2 in balance, then join the official group for another $10, up to $12 in free credits.
- [Suixiang AI Relay](https://sui-xiang.com/): API relay services for Claude, Codex, Gemini, and more, with pay-as-you-go billing, daily check-in test credits, redundant routes, and automatic failover.
- [Infistar.ai](https://infistar.ai/register?aff=ALLAPIHUB&ref_source=link): Every available model is verified through real calls, with load balancing across 10,000+ official API and account-pool supply routes, full-modal support for text, video, images, embeddings, and reranking, transparent pricing and usage, and prices from 10% of official rates.
:::

> **Manual verification tip**: If a site requires Cloudflare or another security check, a manual identification action can open a temporary page. Switch to that page and complete the verification yourself; the workflow continues after verification succeeds. The extension does not solve or bypass CAPTCHAs automatically.

<a id="manual-addition"></a>
### 2.2 Manual Addition (Alternative)

If auto detection fails, click **"Manual Add"**, select the site type, and enter the account information yourself. See the [manual account addition guide](./account-management.md#manual-addition) for the required fields, where to find the Access Token, and important precautions.

---

## 3. Supported Site Types

No matter which architecture you use, there is a good chance we support it:
- **Account-site compatible architectures**: One API, New API, Veloera, One-Hub, Done-Hub, Sub2API, and more.
- **Specialized account platforms and compatible implementations**: AIHubMix, AnyRouter, Neo-API, Super-API, v-api, and more.
- **Self-hosted admin backends**: New API, Veloera, Done-Hub, [Octopus](https://github.com/bestruirui/octopus), AxonHub, Claude Code Hub, and more, for channel management, migration, and partial model sync.

::: tip Compatibility Tip
Relay sites built on account-site compatible architectures can usually be added as accounts. AxonHub, Octopus, Claude Code Hub, and similar systems are mainly used as self-hosted admin backends. For a complete compatibility list, please check [Supported Sites and System Types](./supported-sites.md).
:::

<a id="quick-export-sites"></a>
## 4. Quick Export and Integration

After adding an account, you can "push" these configurations to other AI tools with one click, eliminating the need for manual copy-pasting.

1. Go to the **`Key Management`** page.
2. Find the Key you want to export, and select **`Export to CherryStudio`**, **`Export to CC Switch`**, etc., from the menu.
3. Your AI client will automatically launch and complete the configuration.

> For a complete list, please see [Supported Export Tools and Integration Targets](./supported-export-tools.md).

---

## 5. In-depth Guide to Core Features

### 📊 Asset Dashboard & Statistics
- **[Overview & Real-time Refresh](./auto-refresh.md)**: Centrally view balances, usage, and health status across multiple sites.
- **[Balance History](./balance-history.md)**: Visualize asset change trends with historical data.
- **[Usage Analytics](./usage-analytics.md)**: Multi-dimensional analysis of consumption, model distribution, and latency.

### 🔑 Key Management & Quick Integration
- **[Token Management](./key-management.md)**: Centrally manage site tokens, with support for one-click completion.
- **[API Credential Library](./api-credential-profiles.md)**: Save `Base URL + API Key` without needing an account, then copy, verify, and view models from it.
- **[Web API Sniffing](./web-ai-api-check.md)**: Quickly identify and test API configurations within a webpage.

### ⚡ Automation & Information Tracking
- **[Auto Check-in Flow](./auto-checkin.md)**: Automatically complete check-ins for all sites daily.
- **[Site Announcements](./site-announcements.md)**: Fetch announcements from saved sites in the background and centrally review maintenance, model changes, pricing updates, and other messages.
- **[Redemption Assistant](./redemption-assist.md)**: Automatically recognize redemption codes on webpages and claim them with one click.
- **[Bookmark Management](./bookmark-management.md)**: Centrally collect console links, documentation, recharge portals, and more.

### 🛡️ Stability & Security Protection
- **[Manual Site Verification Relay](./cloudflare-helper.md)**: During a manual action, open a temporary page and let the user complete the site's verification before continuing.
- **[WebDAV Sync & Encryption](./webdav-sync.md)**: Supports cross-device encrypted backups, ensuring data is never lost.

### 🔔 Notification Channels
- **[Task notifications](./task-notifications.md)**: Enable them in **`Settings → General → Notifications`** to receive background task result reminders through browser system notifications, Telegram Bot, Feishu Bot, DingTalk Bot, WeCom Bot, ntfy, or generic webhook delivery.

### 🛠️ Self-hosted Site Operation Tools
- **[Self-hosted Site Management](./self-hosted-site-management.md)**: Directly add, delete, modify, and query channels within the plugin.
- **[Model Sync & Redirection](./managed-site-model-sync.md)**: Batch sync upstream models and configure mapping logic.

---

## 6. Other Information

- [Frequently Asked Questions FAQ](./faq.md)
- [Changelog](./changelog.md)
- [Permissions Explanation](./permissions.md)
- [Data Import and Export](./data-management.md)
