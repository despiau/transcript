const chatbox = document.querySelector('#chat-box');
const saveButton = document.querySelector('.save-btn');
const micButton = document.querySelector('#mic-button');
const recognition = new window.webkitSpeechRecognition();
const liveTranscriptElement = document.querySelector('#live-transcript'); 
const noteInput = document.querySelector('#input');
const addNoteButton = document.querySelector('#submit-button');

let isRecording = false;
let currentTranscript = '';

micButton.addEventListener('click', (event) => {
  event.preventDefault();
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

recognition.addEventListener('end', () => {
  if (isRecording) {
    recognition.start();
  }
});

function handleRecognitionResult(event) {
  const results = event.results;
  const lastResult = results[results.length - 1];
  const transcript = lastResult[0].transcript.trim();
  updateLiveTranscript(transcript);

  if (lastResult.isFinal) {
    const message = formatMessage(transcript);
    if (message) {
      addMessage(message, 'Speaker');
      scrollChatboxToBottom();
    }
    updateLiveTranscript('');
  }
}

function updateLiveTranscript(transcript) {
  liveTranscriptElement.innerText = transcript;
}

function formatMessage(message) {
  const words = message.split(' ');
  const uniqueWords = [...new Set(words)];
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
    messageElement.classList.add('list-group-item');
    messageElement.innerText = `${speaker}: ${message}`;
    chatbox.appendChild(messageElement);
    previousMessage = message;
  }
}

function scrollChatboxToBottom() {
  chatbox.scrollTop = chatbox.scrollHeight;
}

addNoteButton.addEventListener('click', (event) => {
  event.preventDefault();
  const noteText = noteInput.value.trim();
  if (noteText) {
    addMessage(noteText, 'User');
    scrollChatboxToBottom();
    noteInput.value = '';
  }
});
