document.addEventListener('DOMContentLoaded', function () {
  const simplifyButton = document.getElementById('simplifyButton');
  const summarizeButton = document.getElementById('summarizeButton');
  const rewriteButton = document.getElementById('rewriteButton');
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const errorMessage = document.getElementById('errorMessage');

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }

  function processText(action, text) {
    const apiEndpoint = 'http://127.0.0.1:5000/generate'; // Single endpoint for all tasks
  
    const taskPrompt = action === 'summarize'
      ? `Summarize: ${text}`
      : action === 'rewrite'
      ? `Rewrite: ${text}`
      : text; // Default for simplify
  
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
  
    console.log('Sending request to:', apiEndpoint);
    console.log('Task prompt:', taskPrompt);
  
    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: taskPrompt }),
    })
      .then((response) => {
        console.log('Raw response:', response); // Log raw response
        loadingSpinner.style.display = 'none';
  
        if (!response.ok) {
          return response.text().then((text) => {
            console.error('Error response text:', text);
            throw new Error(`HTTP error! status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('API Response:', data); // Log API response
        loadingSpinner.style.display = 'none';
  
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const outputHTML = data.candidates[0].content.parts[0].text
            .split('\n') // Split by newlines for better formatting
            .map((line) => `<p>${line}</p>`) // Wrap each line in <p>
            .join('');
          outputText.innerHTML = outputHTML; // Render formatted output
        } else {
          throw new Error('Unexpected response format');
        }
      })
      .catch((error) => {
        console.error('Error during fetch:', error);
        loadingSpinner.style.display = 'none';
        showError('An error occurred while processing the request. Please try again.');
      });
  }
  function readAloud(text) {
    if (!text.trim()) {
      alert('No text available to read aloud.');
      return;
    }

    // Check if the browser supports text-to-speech
    if (!window.speechSynthesis) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    // Create a speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice and language (optional)
    utterance.lang = 'en-US';
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1; // Normal pitch

    // Speak the text
    speechSynthesis.speak(utterance);

    // Optional: Add event listeners for debugging
    utterance.onstart = () => console.log('Speech started');
    utterance.onend = () => console.log('Speech finished');
    utterance.onerror = (error) => console.error('Speech error:', error);
  }

  // Attach to the Read Aloud button
  readAloudButton.addEventListener('click', () => {
    const text = document.getElementById('outputText').textContent;
    readAloud(text);
  });

  // Stop Text-to-Speech
  stopButton.addEventListener('click', () => {
    speechSynthesis.cancel();
    console.log('Speech stopped.');
  });

  // Speech-to-Text functionality
  document.getElementById('recordVoiceButton').addEventListener('click', function () {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (stream) {
        console.log('Microphone access granted.');
        const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
        if (!recognition) {
          alert('Speech recognition is not supported in this browser.');
          return;
        }
  
        const speechRecognition = new recognition();
        speechRecognition.lang = 'en-US'; // Set the language
        speechRecognition.start();
        console.log('Speech recognition started...');
  
        speechRecognition.onresult = function (event) {
          const transcript = event.results[0][0].transcript; // Extract recognized text
          document.getElementById('inputText').value = transcript; // Set the input field value
          console.log('Recognized speech:', transcript);
        };
  
        speechRecognition.onerror = function (event) {
          console.error('Speech recognition error:', event.error);
          alert('An error occurred during speech recognition. Please try again.');
        };
  
        speechRecognition.onend = function () {
          console.log('Speech recognition ended.');
        };
      })
      .catch(function (err) {
        console.error('Microphone access error:', err);
        alert('Microphone access denied. Please enable it in your browser settings.');
      });
  });
  
  
  function startSpeechRecognition() {
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
  
    const speechRecognition = new recognition();
    speechRecognition.lang = 'en-US'; // Set the language
  
    // Start speech recognition
    speechRecognition.start();
    console.log('Speech recognition started...');
  
    // Handle speech recognition results
    speechRecognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript; // Extract recognized text
      document.getElementById('inputText').value = transcript; // Set the input field value
      console.log('Recognized speech:', transcript);
    };
  
    // Handle recognition errors
    speechRecognition.onerror = function (event) {
      console.error('Speech recognition error:', event.error);
      alert('An error occurred during speech recognition. Please try again.');
    };
  
    // Log when speech recognition ends
    speechRecognition.onend = function () {
      console.log('Speech recognition ended.');
    };
  }

  // Simplify Button Click
  simplifyButton.addEventListener('click', function () {
    const text = inputText.value.trim();
    if (!text) {
      showError('Please enter text to simplify.');
      return;
    }
    processText('simplify', text); // Pass action "simplify"
  });

  // Summarize Button Click
  summarizeButton.addEventListener('click', function () {
    const text = inputText.value.trim();
    if (!text) {
      showError('Please enter text to summarize.');
      return;
    }
    processText('summarize', text);
  });

  // Rewrite Button Click
  rewriteButton.addEventListener('click', function () {
    const text = inputText.value.trim();
    if (!text) {
      showError('Please enter text to rewrite.');
      return;
    }
    processText('rewrite', text);
  });
});
document.getElementById('navigateButton').addEventListener('click', function () {
  const userInput = document.getElementById('inputText').value.trim();

  if (!userInput) {
    alert('Please enter or speak a website name or URL.');
    return;
  }

  // Function to check if the input is a valid URL
  function isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  let url;

  // If the input is a valid URL, use it directly
  if (isValidURL(userInput)) {
    url = userInput;
  } else {
    // If not, construct a URL (assume "www.[input].com")
    url = `https://www.${userInput.replace(/\s+/g, '')}.com`;
  }

  // Open the URL in a new tab
  window.open(url, '_blank');
});
document.getElementById('chatWithAIButton').addEventListener('click', function () {
  // Start speech recognition
  const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!recognition) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }

  const speechRecognition = new recognition();
  speechRecognition.lang = 'en-US'; // Set the language
  speechRecognition.start();
  console.log('Speech recognition started...');

  speechRecognition.onresult = function (event) {
    const userInput = event.results[0][0].transcript; // Get the recognized text
    console.log('Recognized speech:', userInput);

    // Send user input to AI assistant for intent detection
    fetch('http://127.0.0.1:5000/ai-parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: userInput }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('AI Response:', data);

        // Check if AI detected a "navigate" intent
        if (data.intent === 'navigate' && data.website) {
          const website = data.website;
          console.log(`Navigating to ${website}`);
          window.open(website, '_blank'); // Open the website in a new tab
        } else {
          alert('Sorry, I could not understand your request.');
        }
      })
      .catch((error) => {
        console.error('Error with AI assistant:', error);
        alert('An error occurred while processing your request.');
      });
  };

  speechRecognition.onerror = function (event) {
    console.error('Speech recognition error:', event.error);
    alert('An error occurred during speech recognition. Please try again.');
  };

  speechRecognition.onend = function () {
    console.log('Speech recognition ended.');
  };
});
document.getElementById('contrastButton').addEventListener('click', function () {
  document.body.classList.toggle('high-contrast');
});
// Increase Text Size
document.getElementById('increaseTextButton').addEventListener('click', function () {
  document.body.style.fontSize = (parseFloat(getComputedStyle(document.body).fontSize) + 2) + 'px';
});

// Decrease Text Size
document.getElementById('decreaseTextButton').addEventListener('click', function () {
  const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
  if (currentSize > 10) { // Minimum font size
    document.body.style.fontSize = (currentSize - 2) + 'px';
  }
});
document.getElementById('darkModeButton').addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');
});
document.getElementById('highlightLinksButton').addEventListener('click', function () {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.backgroundColor = 'yellow';
    link.style.color = 'black';
  });
});
document.addEventListener('mousemove', function (event) {
  const lineFocus = document.getElementById('lineFocus') || createLineFocus();
  lineFocus.style.top = event.clientY + 'px';
});

function createLineFocus() {
  const focus = document.createElement('div');
  focus.id = 'lineFocus';
  document.body.appendChild(focus);
  focus.style.position = 'fixed';
  focus.style.height = '40px';
  focus.style.width = '100%';
  focus.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  focus.style.pointerEvents = 'none';
  focus.style.zIndex = '9999';
  return focus;
}
// Function to send a message to the content script
function sendMessageToContentScript(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: action }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message to content script:", chrome.runtime.lastError.message);
        } else {
          console.log("Response from content script:", response);
        }
      });
    }
  });
}

// Button listeners
document.getElementById('contrastButton').addEventListener('click', () => sendMessageToContentScript('toggleContrast'));
document.getElementById('increaseTextButton').addEventListener('click', () => sendMessageToContentScript('increaseText'));
document.getElementById('decreaseTextButton').addEventListener('click', () => sendMessageToContentScript('decreaseText'));
document.getElementById('darkModeButton').addEventListener('click', () => sendMessageToContentScript('toggleDarkMode'));
document.getElementById('highlightLinksButton').addEventListener('click', () => sendMessageToContentScript('highlightLinks'));
