// Log when the content script is loaded
console.log("Content script loaded!");

// Function to adjust font size for all elements on the page
function adjustFontSize(amount) {
  const elements = document.querySelectorAll('*'); // Select all elements on the page

  elements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);

    // Check if the element has text and is visible
    if (computedStyle.fontSize && computedStyle.display !== 'none') {
      const currentFontSize = parseFloat(computedStyle.fontSize);
      const newFontSize = currentFontSize + amount;

      // Apply the new font size (avoid sizes below 10px)
      if (newFontSize >= 10) {
        element.style.fontSize = `${newFontSize}px`;
      }
    }
  });
}

// Function to toggle high contrast mode
function toggleContrast() {
  document.body.classList.toggle('high-contrast');
}

// Function to toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Function to highlight all links on the page
function highlightLinks() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.backgroundColor = 'yellow';
    link.style.color = 'black';
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);

  try {
    // Perform actions based on the message
    switch (message.action) {
      case 'toggleContrast':
        toggleContrast();
        break;

      case 'increaseText':
        adjustFontSize(2); // Increase font size by 2px
        break;

      case 'decreaseText':
        adjustFontSize(-2); // Decrease font size by 2px
        break;

      case 'toggleDarkMode':
        toggleDarkMode(); // Toggle dark mode
        break;

      case 'highlightLinks':
        highlightLinks(); // Highlight all links on the page
        break;

      default:
        console.log('Unknown action:', message.action);
    }

    // Send a success response back to the popup
    sendResponse({ status: 'success', action: message.action });

  } catch (error) {
    console.error("Error processing action:", message.action, error);
    sendResponse({ status: 'error', action: message.action, error: error.message });
  }
});
