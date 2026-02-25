# Page Theme Toggle

Page Theme Toggle is a lightweight browser extension that injects custom CSS into web pages, allowing you to switch between several visual themes (Modern Dark, Dark Gray, Sepia, and Light). It also supports optional per-site theme persistence.

---

## Installation (Developer Mode)

Since this extension is loaded unpacked, you’ll need to enable Developer Mode in your browser.


### Loading the Extension on Google Chrome / Brave / Edge (Chromium-based browsers)

###  Options 1: Cloning the Repository

1. Open your browser.
2. Navigate to:

   ```
   chrome://extensions/
   ```

   (For Edge, use `edge://extensions/`)
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the project folder containing the extension files (where `manifest.json` is located).

```bash
git clone https://github.com/80h3m14n/theme-changer-browser-extension.git
```

6. The extension should now appear in your extensions list.
7. (Optional) Click the puzzle icon in the toolbar and **pin** the extension for quick access.

If you make changes to the code:

* Return to the extensions page.
* Click **Reload** on the extension card.

### Option 2: Download the ZIP

- [Download the ZIP file](https://github.com/80h3m14n/theme-changer-browser-extension/releases/latest)
- Extract the contents to a folder on your computer.

```bash
unzip page-theme-toggle-v*.zip -d theme-changer
```

- Follow the same steps as above to load the unpacked extension from that folder.

---

## Why Some Websites May Not Style Perfectly

The extension works by:

* Injecting a single `<style>` element into the page
* Applying a root class (e.g., `extension-theme-modern-dark`) to toggle themes

While this approach works well for most sites, certain modern web applications use advanced rendering techniques that limit how much injected CSS can safely override.

### Common Limitations

Some websites rely on complex rendering systems that don’t respond well to blanket CSS overrides:

* **Canvas and WebGL rendering (e.g., interactive maps)**
  Sites like Google Maps use layered canvas/WebGL elements. Aggressive color overrides can unintentionally hide map tiles or controls.

* **Shadow DOM components**
  Some UI elements are encapsulated in shadow roots, making them inaccessible to standard global CSS rules.

* **Inline styles and `!important` declarations**
  Highly specific inline styles or strong CSS filters may conflict with or override the injected theme.

* **Privileged browser pages**
  Internal pages such as `chrome://`, `about:` pages, extension galleries, and built-in PDF viewers cannot be modified by extensions. If the extension attempts to run on these pages, it will display a friendly notice instead.

---

## How You Can Help

If you encounter a site where the theme appears broken or unusable:

* Open an issue and include:

  * The website URL
  * A brief description of the problem
  * A screenshot (if possible)

This helps ensure fixes remain targeted and don’t unintentionally affect other sites.

You can also:

* Use the popup’s **Toggle** button to disable the theme on a page if needed.
* Enable **“Remember for this site”** only after confirming the theme works properly on that domain.

---

## Planned Improvements

Upcoming enhancements may include:

* A lightweight content script to detect SPA (single-page application) navigations and safely reapply theme rules.
* Per-site customization support (opt-outs or site-specific CSS snippets stored locally).
* A visual theme preview in the popup.
* A more conservative toggling strategy that avoids recoloring canvas or WebGL content by default.

---

## Supported Styling Methods

To improve compatibility across a wider range of sites, the extension may incorporate multiple theming techniques, including:

* Injecting CSS files via `<link>` tags in the document `<head>`
* Modifying or replacing existing `<style>` elements
* Dynamically updating styles using JavaScript (e.g., `document.body.style`)
* Applying higher-specificity CSS rules to override defaults
* Injecting styles into Shadow DOM components when possible

---

Thank you for testing the extension!
If you discover any problematic sites, please report them so targeted, conservative fixes can be added.
