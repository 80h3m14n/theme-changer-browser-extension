// Background service worker (MV3). Do not access `document` here — service workers have no DOM.
// Keep this file for runtime listeners and lightweight background tasks.

chrome.runtime.onInstalled.addListener(() => {
  // Set default values (if needed).
  chrome.storage.sync.get({ theme: "modern-dark" }, (items) => {
    if (!items.theme) {
      chrome.storage.sync.set({ theme: "modern-dark" });
    }
  });
});

// Example: respond to messages from popup or content scripts if needed in future.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "PING") {
    sendResponse({ ok: true });
  }
});
