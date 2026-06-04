// MV3 service worker for the PPA Estimate Cover extension.
//
// Sole responsibility: when the user clicks the toolbar icon, open the
// React app in a 1200x900 popup window. No state, no storage, no
// messaging — the app is fully self-contained inside the popup.

chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL('index.html'),
    type: 'popup',
    width: 1200,
    height: 900,
  });
});

export {};
