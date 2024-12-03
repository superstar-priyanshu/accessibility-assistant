// Log when the background script is loaded
console.log("Background script loaded!");

// Listener to relay messages from popup.js to content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);

  // Forward the message to the active tab's content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tabs found.");
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message to content script:", chrome.runtime.lastError.message);
      } else {
        console.log("Response from content script:", response);
        sendResponse(response);
      }
    });
  });

  // Required to keep the message channel open
  return true;
});
