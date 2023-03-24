// Set up authentication
const apiKey = "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";
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`
}

// Define conversation starting prompt
const prompt = "Start a conversation with me";

// Get the elements we need from the HTML
const form = document.querySelector('#input-box');
const input = document.querySelector('#input');
const chatBox = document.querySelector('#chat-box');
const micButton = document.querySelector('#mic-button');
const liveTranscript = document.querySelector('#live-transcript');

// Define API completions parameters
const params = {
  'model': 'text-davinci-003',
  'temperature': 1,
  'max_tokens': 200,
}

// Define conversation transcript variable
let conversationTranscript = "";

// Initialize Speech Recognition
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new window.SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = true;

// Handle speech recognition result
recognition.addEventListener('result', (event) => {
  let interimTranscript = '';
  for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
    let transcript_content = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      input.value += transcript_content + " ";
      sendMessage(input.value.trim());
      input.value = '';

      // Clear the live transcript display after each message is sent
      liveTranscript.innerText = 'Waiting for speech...';
    } else {
      // Update the live transcript display in real time
      liveTranscript.innerText = interimTranscript + transcript_content;

      interimTranscript += transcript_content;
    }
  }
});

// Handle errors in recognition
recognition.addEventListener('error', (event) => {
  console.error('Error detecting speech');
  recognition.stop();
});

// Handle mic button click event
micButton.addEventListener('click', toggleSpeechRecognition);

// Define function to start or stop speech recognition
function toggleSpeechRecognition() {
  if (micButton.innerText === "🎤") {
    micButton.innerText = '🔴 Stop';
    micButton.classList.remove('btn-secondary');
    micButton.classList.add('btn-danger');
    recognition.start();
  } else {
    micButton.innerText = '🎤';
    micButton.classList.remove('btn-danger');
    micButton.classList.add('btn-secondary');
    recognition.stop();
  }
}

// Handle form submission (for text input)
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value;
  input.value = '';
  sendMessage(message);
});

// Define function to send message and add it to the HTML
async function sendMessage(message) {
  // Append chat message to prompt if this is the start of the conversation
  const chat_input = conversationTranscript == "" ? prompt + ": " + message : message;

  // Call OpenAI API
  const response = await fetch("https://api.openai.com/v1/engines/text-davinci-003/completions", {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      prompt: chat_input,
      temperature: params.temperature,
      max_tokens: params.max_tokens,
      n: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })
  });

  // Extract the generated message from the response
  const data = await response.json();
  const message_response = data.choices[0].text;

  // Add the message to the HTML
  const messageHTML = `
    <div class="list-group-item">
      <strong>You:</strong> ${message}
    </div>
    <div class="list-group-item">
      <strong>ChatGPT:</strong> ${message_response}
    </div>
  `;
  chatBox.insertAdjacentHTML('beforeend', messageHTML);

  // Scroll to the bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight;

  // Add the message to the conversation transcript
  conversationTranscript += `Human: ${message}\nChatGPT: ${message_response}\n\n`;
}
