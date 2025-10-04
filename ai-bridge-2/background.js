// Background service worker
chrome.action.onClicked.addListener((tab) => {
  // Open the extension page in a new tab
  chrome.tabs.create({
    url: 'tab.html'
  });
}); 