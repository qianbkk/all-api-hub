# Personal Edition Installation and Updates

The All API Hub personal enhanced edition is published only through `qianbkk/all-api-hub`. Similarly named browser-store listings are maintained by the upstream project and are not this personal edition.

::: tip Simple answer
Use [Personal Stable](https://github.com/qianbkk/all-api-hub/releases/latest) for daily use. Use [Nightly](https://github.com/qianbkk/all-api-hub/releases/tag/nightly) only to test changes early. Both channels require manual installation and upgrades.
:::

## Which version should I install?

| Situation | Recommended channel | Update method |
|---|---|---|
| Stable daily use | [Personal Stable](https://github.com/qianbkk/all-api-hub/releases/latest) | Download the new package and reinstall manually |
| Early testing of fixes or features | [Personal Nightly](https://github.com/qianbkk/all-api-hub/releases/tag/nightly) | Download and reinstall manually; it may be unstable |
| Development, review, or customization | [Personal repository source](https://github.com/qianbkk/all-api-hub) | Pull, build, and load it yourself |
| Safari | Safari artifact from a personal Release or a source build | See the [Safari Installation Guide](./safari-install.md) |
| QQ / 360 / Cheetah / Brave / Vivaldi / Opera | Chrome package from Personal Stable | See the [Other Browser Installation Guide](./other-browser-install.md) |

::: warning Do not confuse upstream store builds with the personal edition
The existing similarly named listings in Chrome Web Store, Edge Add-ons, and Firefox Add-ons are upstream distribution channels. Installing them gives you the upstream edition, not the personal enhanced edition documented here. Their updates, branding, and features are not controlled by `qianbkk/all-api-hub`.
:::

## Check for updates inside the extension

Open the All API Hub settings page and click **Check now** in the version and update section.

The personal edition reads:

1. The latest stable Release from `qianbkk/all-api-hub`.
2. The difference between the installed version and Personal Stable.

Possible results include:

- **Already on the latest stable release**: no action is needed.
- **A newer release is available**: open the personal Release page and download the correct browser package.
- **Check failed**: GitHub or the network may be temporarily unavailable; retry later.

The personal edition never silently downloads or replaces the extension and never labels an upstream store build as a personal-edition release.

## Manual installation and updates

1. Export a backup from Settings before switching installation sources.
2. Open the [Personal Stable Release](https://github.com/qianbkk/all-api-hub/releases/latest).
3. Download the package for your browser, such as the Chrome, Firefox, or Safari artifact.
4. Extract and load it as required by the browser, or follow the platform-specific installation flow.
5. For future updates, download the new package and replace the loaded directory, or remove the old build and reinstall.

::: warning Manual builds do not auto-update
The personal edition is not currently distributed through browser stores, so the browser cannot automatically deliver personal-edition updates. Star / Watch the personal repository and use the in-extension check periodically.
:::

## Frequently asked questions

### Does “Check now” download the package automatically?

No. It only compares the installed version with Personal Stable and provides the personal Release link.

### Is Nightly suitable for long-term use?

No. Nightly is for early testing and may contain incomplete changes or regressions.

### Can I install the upstream store build and the personal edition together?

Only when intentionally testing. Different installation sources may use different extension IDs, storage, and update behavior. Export a backup first and verify which edition you have opened.

### How do I update a manually installed build?

Download the new package and load the new directory. For Chromium-family browsers, see [Other Browser Installation Guide](./other-browser-install.md#update-extension).

## Related documentation

- [Get Started](./get-started.md)
- [Other Browser Installation Guide](./other-browser-install.md)
- [Safari Extension Installation Guide](./safari-install.md)
- [Changelog](./changelog.md)
