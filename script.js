const chatbox = document.querySelector('#chat-box');
const saveButton = document.querySelector('#save-button');
const micButton = document.querySelector('#mic-button');
const recognition = new window.webkitSpeechRecognition();
const liveTranscriptElement = document.querySelector('#live-transcript');
const noteInput = document.querySelector('#input');
const addNoteButton = document.querySelector('#submit-button');
const scrollBottomButton = document.querySelector('#scroll-bottom-btn');

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

function addMessage(message, speaker) {
  const timeStamp = new Date().toLocaleTimeString();
  const messageElement = document.createElement('div');
  messageElement.classList.add('list-group-item');
  messageElement.innerHTML = `<strong>${speaker}:</strong> ${message}<br><span class="timestamp">${timeStamp}</span>`;
  chatbox.appendChild(messageElement);
  scrollChatboxToBottom();
}

function scrollChatboxToBottom() {
  chatbox.scrollTop = chatbox.scrollHeight;
}

addNoteButton.addEventListener('click', (event) => {
  event.preventDefault();
  const noteText = noteInput.value.trim();
  if (noteText) {
    addMessage(noteText, 'Note');
    scrollChatboxToBottom();
    noteInput.value = '';
  }
});

function saveTranscript() {
  const date = new Date().toLocaleDateString();
  const meetingTitle = `Transcription from Meeting [${date}]`;
  let transcript = `${meetingTitle}\n`;

  chatbox.childNodes.forEach(node => {
    const speaker = node.querySelector('strong').textContent;
    const message = node.childNodes[1].textContent.trim();
    const timeStamp = node.querySelector('.timestamp').textContent;
    transcript += `${timeStamp} - ${speaker} - ${message}\n`;
  });

  const totalCharacters = transcript.length;
  const totalWords = transcript.split(/\s+/).length - 1; // Exclude line breaks
  const totalMeetingTime = (chatbox.childNodes.length * 2).toFixed(2); // Assuming 2 seconds per message

  transcript += `\nTotal Characters: ${totalCharacters}\n`;
  transcript += `Total Words: ${totalWords}\n`;
  transcript += `Total Meeting Time: ${totalMeetingTime} seconds\n`;

  let blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transcript.txt';
  link.click();
}

saveButton.addEventListener('click', (event) => {
  event.preventDefault();
  saveTranscript();
});

scrollBottomButton.addEventListener('click', () => {
  scrollChatboxToBottom();
});
