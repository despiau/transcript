// Get references to DOM elements
const chatbox = document.querySelector('#chat-box');
const saveButton = document.querySelector('#save-button');
const saveCleanButton = document.querySelector('#save-clean-button');
const micButton = document.querySelector('#mic-button');
const languageSelection = document.querySelector('#language-selection');
const recognition = new window.webkitSpeechRecognition();
const liveTranscriptElement = document.querySelector('#live-transcript');
const noteInput = document.querySelector('#input');
const addNoteButton = document.querySelector('#submit-button');
const hamburgerMenuButton = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');
const headerButtons = document.querySelector('.header-buttons');

// Initialize variables
let isRecording = false;

// Event listener for the microphone button
micButton.addEventListener('click', (event) => {
  event.preventDefault();
  if (!isRecording) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageSelection.value;
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

// Event listener for speech recognition end event
recognition.addEventListener('end', () => {
  if (isRecording) {
    recognition.start();
  }
});

// Function to handle speech recognition results
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

// Function to update live transcript
function updateLiveTranscript(transcript) {
  liveTranscriptElement.innerText = transcript;
}

// Function to format a message
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

// Function to add a message to chatbox
function addMessage(message, speaker) {
  const timeStamp = new Date().toLocaleTimeString();
  const messageElement = document.createElement('div');
  messageElement.classList.add('list-group-item');
  if (speaker === 'Note') {
    messageElement.classList.add('note');
  }
  messageElement.innerHTML = `<strong>${speaker}:</strong> ${message}<br><span class="timestamp">${timeStamp}</span>`;
  chatbox.appendChild(messageElement);
  scrollChatboxToBottom();
}

// Function to scroll chatbox to the bottom
function scrollChatboxToBottom() {
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Event listener for adding a note
addNoteButton.addEventListener('click', (event) => {
  event.preventDefault();
  const noteText = noteInput.value.trim();
  if (noteText) {
    addMessage(noteText, 'Note');
    scrollChatboxToBottom();
    noteInput.value = '';
  }
});

// Event listener for Enter key to add a note
noteInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    const noteText = noteInput.value.trim();
    if (noteText) {
      addMessage(noteText, 'Note');
      scrollChatboxToBottom();
      noteInput.value = '';
    }
  }
});

// Function to save the transcript
function saveTranscript() {
  const date = new Date().toLocaleDateString();
  const meetingTitle = `Transcription from Meeting [${date}]`;
  let fullTranscript = `${meetingTitle}\n\n`;
  // Initialize cleanTranscript with the prompt
  let cleanTranscript = `${meetingTitle}\n\nPrompt: Write a bullet point summary and action item list.\n\n`;

  chatbox.childNodes.forEach((node) => {
    const speaker = node.querySelector('strong').textContent;
    const message = node.childNodes[1].textContent.trim();
    const timeStamp = node.querySelector('.timestamp').textContent;
    fullTranscript += `${timeStamp} - ${speaker} - ${message}\n`;
    cleanTranscript += `- ${message}\n`;
  });

  const totalCharacters = fullTranscript.length;
  const totalWords = fullTranscript.split(/\s+/).length - 1;

  fullTranscript += `\nTotal Characters: ${totalCharacters}\n`;
  fullTranscript += `Total Words: ${totalWords}\n`;

  return {
    fullTranscript,
    cleanTranscript,
  };
}

// Event listener for saving the full transcript
saveButton.addEventListener('click', () => {
  const transcripts = saveTranscript();
  const blob = new Blob([transcripts.fullTranscript], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transcript_${new Date().toISOString().replace(/:|\./g, '_')}.txt`;
  link.click();
});

// Event listener for saving the clean transcript
saveCleanButton.addEventListener('click', () => {
  const transcripts = saveTranscript();
  const blob = new Blob([transcripts.cleanTranscript], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `clean_transcript_${new Date().toISOString().replace(/:|\./g, '_')}.txt`;
  link.click();
});

// Event listener for the hamburger menu
hamburgerMenuButton.addEventListener('click', () => {
  sidebar.classList.toggle('sidebar-open');
  headerButtons.classList.toggle('header-buttons-open');
});
