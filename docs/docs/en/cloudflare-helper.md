# Manual Site Verification Relay

> Use this when Cloudflare, Turnstile, or another site check requires user interaction. The personal edition only opens an isolated temporary page and resumes the original action after verification. It does not solve CAPTCHAs, spoof device signals, or automatically bypass site security controls.

## Overview

- **Open a temporary page on demand**: A user-initiated action such as manual identification or manual refresh can open the target site in a tab or temporary window when verification is required.
- **The user completes verification**: For sliders, image selection, Turnstile, or other human checks, switch to the temporary page and follow the site's instructions yourself.
- **Resume after verification**: After the site accepts the current browser session, the extension can continue the original identification or refresh workflow.
- **Safe defaults**: Temporary verification pages are disabled for background automation by default, and automatic refresh does not use them by default. Popup, side-panel, and settings-page entry points can be controlled separately.
- **Site-level rate limiting**: Batch refresh and check-in operations continue to use site-level rate limits and bounded staggering.

## Steps

1. Sign in to the target site, then run "Auto Identify" or a manual refresh in the extension.
2. If site verification is required, use the prompt to open a temporary page.
3. Switch to that page and complete the site's verification yourself. Do not use CAPTCHA-solving, answer-proxying, or automatic-click tools.
4. Return to the extension after verification. The original action should continue; if it does not, retry once manually.
5. If verification repeats, stop retrying, increase the refresh interval, and contact the site about account or access restrictions.

## Opening mode

Under **Settings → Data Refresh**, choose how temporary verification pages open:

- **Tab in the current window**: Adds an inactive tab to the existing window to reduce interruptions.
- **Separate temporary window**: Provides a more isolated browsing context but may bring the browser to the foreground.

In both modes, the user must complete verification manually.

## Safety notes

- No IP rotation, device-fingerprint spoofing, or CAPTCHA solving is performed.
- The extension cannot guarantee that a site will accept the session; site risk controls, account state, and network conditions remain under the site's control.
- Optional Cookie and Web Request permissions are used only after user authorization and only when the selected workflow needs them. They can be revoked at any time.
- If the browser blocks the temporary page, check extension permissions and popup settings instead of retrying rapidly.

## Troubleshooting

| Scenario | What to do |
| --- | --- |
| The temporary page does not open | Check whether the browser blocked popups and whether you granted the relevant optional permissions. |
| The page remains on "Just a moment" | Wait for the site check; if an interactive check appears, complete it yourself. Stop and try later if it does not progress. |
| 401/403 remains after verification | Sign in again, confirm that the account or token is valid, and retry manually. |
| An automated task does not open a verification page | This is the personal edition's safe default: background automation does not initiate manual verification relay. |
| 429 occurs repeatedly | Increase the refresh interval, reduce concurrent or batch operations, and follow the site's limits. |

## Related documentation

- [Automatic Refresh and Real-time Data](./auto-refresh.md)
- [Automatic Check-in](./auto-checkin.md)
- [Permission Management (Optional Permissions)](./permissions.md)
