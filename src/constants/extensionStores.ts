import type { ExtensionStoreId } from "~/utils/browser"

// These IDs belong to upstream Chromium store listings. The personal enhanced
// edition is not distributed through them; they are retained only so update
// logic can identify an installation that came from an upstream store.
// Firefox is excluded because its runtime ID cannot be matched reliably using
// the same Chromium extension-ID mechanism.
export const UPSTREAM_CHROMIUM_STORE_IDS: Record<
  Exclude<ExtensionStoreId, "firefox">,
  string
> = {
  chrome: "lapnciffpekdengooeolaienkeoilfeo",
  edge: "pcokpjaffghgipcgjhapgdpeddlhblaa",
}
