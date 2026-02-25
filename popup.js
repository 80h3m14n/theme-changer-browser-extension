// Popup script: theme selector, per-site persistence, and safe injection.

const themeSelect = document.getElementById("theme-select");
const persistCheckbox = document.getElementById("persist-site");
const toggleBtn = document.getElementById("toggle");
const applyBtn = document.getElementById("apply");
const msg = document.getElementById("msg");

const themes = {
  "modern-dark": {
    id: "modern-dark",
    css: `
      /* Base background and text color applied to root containers only */
      html.extension-theme-modern-dark, body.extension-theme-modern-dark,
      .extension-theme-modern-dark html, .extension-theme-modern-dark body,
      .extension-theme-modern-dark main, .extension-theme-modern-dark header,
      .extension-theme-modern-dark nav, .extension-theme-modern-dark .container,
      .extension-theme-modern-dark .content {
        background-color: #0b132b !important; /* deep navy */
        color: #dbeafe !important; /* very light bluish */
      }

      /* Text elements */
      .extension-theme-modern-dark, .extension-theme-modern-dark p, .extension-theme-modern-dark span,
      .extension-theme-modern-dark h1, .extension-theme-modern-dark h2, .extension-theme-modern-dark h3,
      .extension-theme-modern-dark h4, .extension-theme-modern-dark h5, .extension-theme-modern-dark h6,
      .extension-theme-modern-dark li, .extension-theme-modern-dark label {
        color: #dbeafe !important;
      }

      /* Links */
      .extension-theme-modern-dark a { color: #7cc0ff !important; }

      /* Inputs and controls */
      .extension-theme-modern-dark input, .extension-theme-modern-dark textarea,
      .extension-theme-modern-dark button, .extension-theme-modern-dark select {
        background-color: #0f2138 !important;
        color: #dbeafe !important;
        border-color: rgba(59,130,246,0.18) !important;
      }

      /* SVG/vector icons should follow current text color */
      .extension-theme-modern-dark svg, .extension-theme-modern-dark svg * {
        fill: currentColor !important;
        stroke: currentColor !important;
      }

      /* Preserve raster images, video and canvas visuals */
      .extension-theme-modern-dark img, .extension-theme-modern-dark video, .extension-theme-modern-dark canvas {
        background: transparent !important;
        filter: none !important;
      }

      /* Gentle map dimming: targets common map container classes and tile canvases.
         This improves contrast on map-heavy sites like Google Maps without
         destroying imagery. It's intentionally conservative. */
      .extension-theme-modern-dark .widget-scene,
      .extension-theme-modern-dark .gm-style,
      .extension-theme-modern-dark .maps-surface-inner,
      .extension-theme-modern-dark .scene,
      .extension-theme-modern-dark .maps-canvas-container,
      .extension-theme-modern-dark .maps-raster,
      .extension-theme-modern-dark [class*="map"] canvas,
      .extension-theme-modern-dark [class*="tile"] img {
        filter: brightness(0.82) saturate(0.9) contrast(0.98) !important;
      }

      /* Add a subtle overlay for map layers to push them into the theme while
         keeping markers and labels readable. Only applies if element is positioned. */
      .extension-theme-modern-dark .widget-scene::after,
      .extension-theme-modern-dark .gm-style::after,
      .extension-theme-modern-dark .maps-surface-inner::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(4,12,24,0.18);
        pointer-events: none;
        mix-blend-mode: multiply;
      }
    `,
  },
  "dark-gray": {
    id: "dark-gray",
    css: `
      .extension-theme-dark-gray, .extension-theme-dark-gray * {
        background-color: #111 !important;
        color: #ddd !important;
        border-color: rgba(255,255,255,0.06) !important;
        box-shadow: none !important;
      }
      .extension-theme-dark-gray a { color: #89c2ff !important; }
    `,
  },
  sepia: {
    id: "sepia",
    css: `
      .extension-theme-sepia, .extension-theme-sepia * {
        background-color: #f4ecd8 !important;
        color: #4b372e !important;
        border-color: rgba(75,55,46,0.06) !important;
        box-shadow: none !important;
      }
      .extension-theme-sepia a { color: #8b5e34 !important; }
    `,
  },
  light: {
    id: "light",
    css: `
      .extension-theme-light, .extension-theme-light * {
        background-color: initial !important;
        color: initial !important;
        border-color: initial !important;
      }
    `,
  },
};

// Utility: show a short message in popup
function showMessage(text, timeout = 3500) {
  msg.textContent = text;
  if (timeout)
    setTimeout(() => {
      msg.textContent = "";
    }, timeout);
}

// Load saved theme preference and per-site mapping
async function init() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    let hostname = null;
    try {
      hostname = new URL(tab.url).hostname;
    } catch (e) {
      hostname = null;
    }

    // load global theme
    chrome.storage.sync.get({ theme: "modern-dark" }, (items) => {
      if (items.theme && themes[items.theme]) themeSelect.value = items.theme;
    });

    // if persisted for this site, set select accordingly
    if (hostname) {
      chrome.storage.local.get({ sites: {} }, (res) => {
        const siteTheme = res.sites[hostname];
        if (siteTheme && themes[siteTheme]) themeSelect.value = siteTheme;
      });
    }
  } catch (err) {
    console.error("Init error", err);
  }
}

themeSelect.addEventListener("change", () => {
  const val = themeSelect.value;
  chrome.storage.sync.set({ theme: val });
});

applyBtn.addEventListener("click", async () => {
  const themeId = themeSelect.value;
  const applyPersist = persistCheckbox.checked;
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.id) return showMessage("No active tab");

    if (applyPersist) {
      // store mapping by hostname
      let hostname = null;
      try {
        hostname = new URL(tab.url).hostname;
      } catch (e) {
        hostname = null;
      }
      if (hostname) {
        chrome.storage.local.get({ sites: {} }, (res) => {
          const sites = res.sites || {};
          sites[hostname] = themeId;
          chrome.storage.local.set({ sites }, () =>
            showMessage("Saved for this site")
          );
        });
      } else {
        showMessage("Cannot persist on this page");
      }
    }

    await injectTheme(tab.id, themeId);
  } catch (err) {
    console.error(err);
    showMessage("Failed to apply theme");
  }
});

toggleBtn.addEventListener("click", async () => {
  const themeId = themeSelect.value;
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.id) return showMessage("No active tab");
    await toggleTheme(tab.id, themeId);
  } catch (err) {
    console.error(err);
    showMessage("Could not toggle theme");
  }
});

// Inject or toggle theme on page safely, returning promise and handling scripting-blocked pages
async function injectTheme(tabId, themeId) {
  const theme = themes[themeId] || themes["modern-dark"];
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (css, themeId) => {
        const styleId = "extension-theme-style-" + themeId;
        // remove any other extension-theme-* style elements to keep only the chosen theme
        Array.from(
          document.querySelectorAll('style[id^="extension-theme-style-"]')
        ).forEach((el) => el.remove());

        if (!document.getElementById(styleId)) {
          const s = document.createElement("style");
          s.id = styleId;
          s.textContent = css;
          document.head.appendChild(s);
          document.documentElement.classList.add("extension-theme-" + themeId);
        }
      },
      args: [theme.css, theme.id],
    });
    showMessage("Theme applied");
  } catch (e) {
    // Common causes: trying to script chrome:// pages or extension pages.
    console.error("scripting failed", e);
    showMessage("This page cannot be themed");
  }
}

async function toggleTheme(tabId, themeId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (themeId) => {
        const styleId = "extension-theme-style-" + themeId;
        const el = document.getElementById(styleId);
        if (el) {
          el.remove();
          document.documentElement.classList.remove(
            "extension-theme-" + themeId
          );
        } else {
          // If the specific theme style isn't present, try applying it by asking the caller to inject CSS.
        }
      },
      args: [themeId],
    });
    showMessage("Toggled");
  } catch (e) {
    console.error("toggle failed", e);
    showMessage("This page cannot be scripted");
  }
}

init();
