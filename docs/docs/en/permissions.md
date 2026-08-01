# Permission Management (Optional Permissions)

> Optional Cookie and Web Request permissions are used only for manual verification relay or authenticated requests to connected sites. They are not granted by default, and core offline features do not depend on them.

## Overview

- **Centralized management**: Review, grant, or revoke optional permissions on the Permissions page.
- **Manual verification relay**: When a user-initiated identification or refresh action encounters a site check, the user can complete it on a temporary page and then continue the original action.
- **No automatic bypass**: These permissions are not used to solve CAPTCHAs, spoof device signals, rotate IP addresses, or evade site security controls.
- **Revocable at any time**: Disabling optional permissions does not affect core offline management features.

## Accessing the settings

1. Open the extension and go to **Settings**.
2. If the browser supports optional permissions, open **Permission Management / Permissions**.
3. Review the purpose and current state of each permission before allowing it.

## Common permissions

- **Cookies**: Read necessary session cookies on connected site domains so a request can continue in the same session after the user completes verification.
- **Web Request**: Determine whether a request was blocked and whether the user should be prompted to open a temporary verification page.
- **Web Request Blocking**: When supported by the browser and required by the selected workflow, attach necessary authentication information to requests for authorized sites.

The extension does not use these permissions to scan unrelated sites. Their scope is limited to connected sites and workflows that you initiate or explicitly enable.

## Safe defaults

- The user must explicitly confirm permissions in the browser dialog.
- Temporary verification pages are disabled for background automation by default.
- Automatic refresh does not use manual verification relay by default.
- Manual refresh, settings-page, side-panel, and popup entry points can be configured separately.
- Sliders, image selection, Turnstile, and other interactive checks must be completed by the user.

## When should I grant them?

Consider granting them only when needed:

- Manual identification or refresh often requires site verification in the same browser session.
- Browsers such as Firefox require extra permissions to preserve necessary session state after verification.

They can remain disabled when:

- You only use offline management, price viewing, or manual data entry.
- Your sites do not require additional security verification.
- You do not want the extension to read site cookies or observe related requests.

## Privacy and revocation

- Account and site settings are stored locally by default; network requests are made only for features you enable.
- Revoke permissions on the Permissions page or in the browser's extension manager.
- After revocation, workflows that depend on manual verification relay may be unavailable, while other core features remain usable.

## Troubleshooting

- **Nothing happens after Allow**: Check for a blocked permission prompt near the address bar.
- **The temporary page does not open**: Check popup settings and whether the current page entry point is allowed to use manual verification relay.
- **The request still fails after verification**: Sign in again, confirm the account or token is valid, and reduce the request rate.
- **An automated task does not open a page**: This is the safe default; background automation does not ask the user to complete verification.

## Related documentation

- [Manual Site Verification Relay](./cloudflare-helper.md)
- [Automatic Refresh and Real-time Data](./auto-refresh.md)
- [WebDAV Backup and Automatic Synchronization](./webdav-sync.md)
