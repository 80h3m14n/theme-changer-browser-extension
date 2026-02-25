# Page Theme Toggle — Notes

This simple browser extension injects a lightweight CSS theme into pages to provide a few selectable themes (Modern Dark, Dark Gray, Sepia, Light) and optional per-site persistence.



## Why some sites don't style perfectly

- The extension injects a single <style> element into the page's document and toggles a root class (e.g. `extension-theme-modern-dark`).
- Some sites use powerful, highly-customized rendering pipelines (map tile canvases, WebGL layers, shadow DOM, or inline styles applied by complex JavaScript). On those pages our injected CSS can't reliably override every visual surface without breaking functionality or visibility.
- Privileged pages (chrome://, about: pages, the extensions gallery, PDF viewer) cannot be scripted by extensions; attempts to script them will fail and the extension shows a friendly message.

Examples of causes:

- Canvas/WebGL map tiles: maps.google.com uses canvas/WebGL and multiple layered elements; blanket color overrides can hide map tiles or map controls if applied too aggressively.
- Shadow DOM and isolated widgets: some components live in shadow roots, which normal CSS can't reach.
- Inline styles with !important: pages that set inline styles with high specificity or use strong filters may override or conflict with injected CSS.

What you can do to help

- If you find a site where the theme looks wrong (for example, Google Maps), please list it in an issue or file a quick note here and include a short description and a screenshot; that helps me add conservative, site-specific rules that don't break other pages.
- Use the popup's "Toggle" button to remove an injected theme if it causes problems on a page.
- Use the "Remember for this site" checkbox only when you're confident the theme works well for that hostname.


## Future updates

- Add a small content script that can observe and reapply safe rules after SPA navigations.
- Provide per-site overrides (opt-out or site-specific CSS snippets) that are stored and applied automatically.
- Offer a visual preview and a lightweight toggling mechanism that doesn't attempt to recolor canvases or WebGL layers by default.

- Add several ways to change a page's theme, including:

- **Injecting CSS files** via `<link>` tags into the document's `<head>`.
- **Modifying existing styles** by updating or replacing elements in the document's `<style>` tags.
- **Using JavaScript** to dynamically alter styles, such as changing `document.body.style` or `getComputedStyle`.
- **Overriding default styles** by applying custom CSS rules with higher specificity.
- **Using shadow DOM** to inject styles into components that isolate their styling.




Thank you for testing — list any problematic sites you find and I'll add targeted, conservative fixes for them.
