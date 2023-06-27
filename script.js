const chatbox = document.querySelector('.chatbox');
const saveButton = document.querySelector('.save-btn');
const micButton = document.querySelector('.mic-btn');
const recognition = new window.webkitSpeechRecognition();
const liveTranscriptElement = document.querySelector('.live-transcript p'); 
const noteInput = document.querySelector('.note-input input');
const addNoteButton = document.querySelector('.note-input button');

let isRecording = false;
let currentTranscript = '';

micButton.addEventListener('click', () => {
  if (!isRecording) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.addEventListener('result', handleRecognitionResult);
    recognition.start();
    micButton.classList.add('recording');
    micButton.innerHTML = '🔴';
  } else {
    recognition.stop();
    micButton.classList.remove('recording');
    micButton.innerHTML = '🎤';
    recognition.removeEventListener('result', handleRecognitionResult);
  }
  isRecording = !isRecording;
});

function handleRecognitionResult(event) {
  const results = event.results;

  // Get the last result from the event
  const lastResult = results[results.length - 1];

  // Get the transcript from the last result
  const transcript = lastResult[0].transcript.trim();

  // Update live transcript
  updateLiveTranscript(transcript);

  if (lastResult.isFinal) {
    const message = formatMessage(transcript);

    if (message) {
      addMessage(message, 'Speaker');
      scrollChatboxToBottom();
    }

    // Clear live transcript
    updateLiveTranscript('');
  }
}

function updateLiveTranscript(transcript) {
  liveTranscriptElement.innerText = transcript;
}

function formatMessage(message) {
  const words = message.split(' ');

  // Remove duplicate words
  const uniqueWords = [...new Set(words)];

  // Capitalize the first letter of each sentence
  for (let i = 0; i < uniqueWords.length; i++) {
    if (i === 0 || uniqueWords[i - 1].endsWith('.')) {
      uniqueWords[i] = uniqueWords[i][0].toUpperCase() + uniqueWords[i].substring(1);
    }
  }

  return uniqueWords.join(' ');
}

let previousMessage = '';

function addMessage(message, speaker) {
  if (message !== previousMessage) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(speaker.toLowerCase());

    const messageBubbleElement = document.createElement('div');
    messageBubbleElement.classList.add('message-bubble');

    const messageTextElement = document.createElement('p');
    messageTextElement.innerText = message;

    const timestampElement = document.createElement('div');
    timestampElement.classList.add('timestamp');
    timestampElement.innerText = getTimeStamp();

    messageBubbleElement.appendChild(messageTextElement);
    messageBubbleElement.appendChild(timestampElement);
    messageElement.appendChild(messageBubbleElement);
    chatbox.appendChild(messageElement);

    previousMessage = message;
  }
}

function scrollChatboxToBottom() {
  setTimeout(() => {
    chatbox.scrollTop = chatbox.scrollHeight;
  }, 100);
}

function saveTranscript() {
  const messages = chatbox.querySelectorAll('.message');
  let transcript = '';

  messages.forEach((message) => {
    const messageTextElement = message.querySelector('p');
    const timestampElement = message.querySelector('.timestamp');
    const speakerElement = message.classList.contains('speaker') ? 'Speaker' : (message.classList.contains('note') ? 'Note' : 'Unknown');

    const messageText = messageTextElement.innerText;
    const timestamp = timestampElement.innerText;

    transcript += `[${timestamp}] [${speakerElement}] ${messageText}\n`;
  });

  const element = document.createElement('a');
  const file = new Blob([transcript], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = 'transcript.txt';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

saveButton.addEventListener('click', () => {
  saveTranscript();
});

function getTimeStamp() {
  const date = new Date();
  const hours = date.getHours() % 12 || 12;
  const minutes = addZeroPadding(date.getMinutes());
  const seconds = addZeroPadding(date.getSeconds());
  const amOrPm = date.getHours() >= 12 ? 'pm' : 'am';
  return `${hours}:${minutes}:${seconds} ${amOrPm}`;
}

function addZeroPadding(number) {
  return number < 10 ? `0${number}` : `${number}`;
}

// Add event listener to add notes
addNoteButton.addEventListener('click', () => {
  const noteText = noteInput.value.trim();
  if (noteText) {
    addMessage(noteText, 'Note');
    scrollChatboxToBottom();
    noteInput.value = '';
  }
});
