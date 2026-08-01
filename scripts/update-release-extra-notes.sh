#!/usr/bin/env bash

set -euo pipefail

RELEASE_TAG="${1:-${RELEASE_TAG:-}}"
REPOSITORY="${GH_REPO:-${GITHUB_REPOSITORY:-}}"
DOCS_BASE_URL="${DOCS_BASE_URL:-https://qianbkk.github.io/all-api-hub}"

if [ -z "$RELEASE_TAG" ]; then
  echo "RELEASE_TAG is required." >&2
  exit 1
fi

if [ -z "$REPOSITORY" ]; then
  echo "GH_REPO or GITHUB_REPOSITORY is required." >&2
  exit 1
fi

release_json="$(gh release view "$RELEASE_TAG" --repo "$REPOSITORY" --json body,assets)"

appendix_file="$(mktemp)"
current_body_file="$(mktemp)"
combined_file="$(mktemp)"

cleanup() {
  rm -f "$appendix_file" "$current_body_file" "$combined_file"
}
trap cleanup EXIT

export RELEASE_JSON="$release_json"
export RELEASE_TAG
export DOCS_BASE_URL

node --input-type=module <<'EOF' > "$appendix_file"
const release = JSON.parse(process.env.RELEASE_JSON ?? "{}")
const releaseTag = process.env.RELEASE_TAG ?? ""
const docsBaseUrl = (process.env.DOCS_BASE_URL ?? "").replace(/\/+$/, "")
const isNightly = releaseTag === "nightly"

const assetNames = Array.isArray(release.assets)
  ? release.assets
      .map((asset) => asset?.name)
      .filter((name) => typeof name === "string" && name.length > 0)
  : []

const assetOrder = (name) => {
  if (/chrome\.zip$/i.test(name)) return 10
  if (/firefox\.zip$/i.test(name)) return 20
  if (/sources\.zip$/i.test(name)) return 30
  if (/safari-xcode-bundle\.zip$/i.test(name)) return 40
  if (/safari\.zip$/i.test(name)) return 50
  return 100
}

const describeAsset = (name) => {
  if (/chrome\.zip$/i.test(name)) {
    return "个人增强版 Chromium 手动安装包，适用于 Chrome、Edge、Brave、Vivaldi、Opera、Kiwi 等兼容浏览器；请先解压，再通过扩展管理页加载。"
  }

  if (/firefox\.zip$/i.test(name)) {
    return "个人增强版 Firefox 手动安装包；请按个人版安装文档使用，浏览器不会替你自动跟踪 GitHub Releases。"
  }

  if (/sources\.zip$/i.test(name)) {
    return "Firefox 发布/审核用源码包，通常不是普通用户直接安装的附件。"
  }

  if (/safari-xcode-bundle\.zip$/i.test(name)) {
    return "Safari 手动运行推荐包。Safari 暂无通用商店版入口；需要 Safari 版本时，请下载此文件并打开其中的 Xcode 工程运行。"
  }

  if (/safari\.zip$/i.test(name)) {
    return "Safari 原始构建包，通常作为 Xcode 工程生成输入使用；普通用户不要单独下载这个文件。"
  }

  return "发布附件。"
}

const lines = [
  "<!-- all-api-hub-release-extra:start -->",
  "## 附加说明",
  "",
  isNightly
    ? "> 当前为个人增强版 Nightly 预发布，基于 `main` 最新提交自动生成，仅适合提前验证个人仓库中的修复或协助测试。"
    : "> 当前为个人增强版 Stable 正式版。个人版只通过 qianbkk/all-api-hub Releases 提供安装包，不使用上游浏览器商店包作为发行渠道。",
  "",
  "### 安装渠道",
  "- Chrome / Edge / Brave / Vivaldi / Opera / Kiwi：下载个人 Release 中的 `*-chrome.zip`，解压后通过扩展管理页加载。",
  "- Firefox：下载个人 Release 中的 `*-firefox.zip`，并按个人版文档手动安装。",
  `- Safari：下载 \`*-safari-xcode-bundle.zip\`，并按 Safari 安装指南操作，${docsBaseUrl}/safari-install.html`,
  "",
  "### 使用说明",
  "- 上游 Chrome Web Store、Edge Add-ons 和 Firefox Add-ons 中的同名扩展不是个人增强版。",
  "- Stable 与 Nightly 均需手动安装和手动更新；扩展内版本提示只比较 qianbkk/all-api-hub 的 Stable Release，不会静默替换扩展。",
  "- 建议 Star / Watch 个人仓库，以便及时看到新版本发布通知。",
  "- Chromium 浏览器：下载 `*-chrome.zip`，先解压，再在扩展管理页选择“加载已解压的扩展程序”。",
  "- Firefox：`*-firefox.zip` 是个人版手动安装包；`*-sources.zip` 主要用于源码审查和发布流程。",
  "- Safari：请下载 `*-safari-xcode-bundle.zip`，解压后打开其中的 Xcode 工程；不要只下载 `*-safari.zip`。",
  "",
  "### 文档链接",
  `- 快速上手：${docsBaseUrl}/get-started.html`,
  `- 安装与更新说明：${docsBaseUrl}/extension-update-install.html`,
  `- 常见问题：${docsBaseUrl}/faq.html`,
  `- 更新日志：${docsBaseUrl}/changelog.html`,
]

lines.push("", "### 产物说明")

if (assetNames.length === 0) {
  lines.push("- 当前 release 暂未检测到附件。")
} else {
  assetNames
    .sort((left, right) => {
      const delta = assetOrder(left) - assetOrder(right)
      return delta !== 0 ? delta : left.localeCompare(right)
    })
    .forEach((name) => {
      lines.push(`- \`${name}\`：${describeAsset(name)}`)
    })
}

lines.push("<!-- all-api-hub-release-extra:end -->")

process.stdout.write(`${lines.join("\n")}\n`)
EOF

gh release view "$RELEASE_TAG" --repo "$REPOSITORY" --json body --jq ".body" > "$current_body_file"

perl -0pi -e 's/\n?<!-- all-api-hub-release-extra:start -->.*?<!-- all-api-hub-release-extra:end -->\n?//s' "$current_body_file"

cp "$current_body_file" "$combined_file"

if grep -q '[^[:space:]]' "$combined_file"; then
  printf '\n\n' >> "$combined_file"
else
  : > "$combined_file"
fi

cat "$appendix_file" >> "$combined_file"

gh release edit "$RELEASE_TAG" --repo "$REPOSITORY" --notes-file "$combined_file"
