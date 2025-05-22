// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzWD-GapOQ5XYvqFZUjoJsWB1yzHxrd1I",
    authDomain: "privatechat-317bc.firebaseapp.com",
    databaseURL: "https://privatechat-317bc-default-rtdb.firebaseio.com",
    projectId: "privatechat-317bc",
    storageBucket: "privatechat-317bc.firebasestorage.app",
    messagingSenderId: "742830327113",
    appId: "1:742830327113:web:84662100302df40dca4698",
    measurementId: "G-NX49XRRQCZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global variables
let currentUser = null;
const database = firebase.database();
const messagesRef = database.ref('messages');
let messagesLoaded = false;

// Show username form when page loads
document.addEventListener('DOMContentLoaded', function() {
    showUsernameForm();
});

function showUsernameForm() {
    document.getElementById('usernameForm').style.display = 'block';
    document.getElementById('chatContainer').style.display = 'none';
}

function joinChat() {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        currentUser = username;
        document.getElementById('usernameForm').style.display = 'none';
        document.getElementById('chatContainer').style.display = 'block';
        document.getElementById('currentUsername').textContent = username;
        setupMessageListener();
    }
}

function setupMessageListener() {
    // Remove existing event listeners first
    messagesRef.off();
    
    // Load initial messages
    messagesRef.once('value', function(snapshot) {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        snapshot.forEach(function(childSnapshot) {
            displayMessage(childSnapshot.val());
        });
        messagesLoaded = true;
    });

    // Set up listener for new messages
    messagesRef.on('child_added', function(data) {
        if (messagesLoaded) {
            displayMessage(data.val());
        }
    });
}

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === currentUser ? 'sent' : 'received'}`;
    
    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'username';
    usernameDiv.textContent = message.sender;
    
    const textDiv = document.createElement('div');
    textDiv.textContent = message.text;
    
    messageDiv.appendChild(usernameDiv);
    messageDiv.appendChild(textDiv);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const text = document.getElementById('messageInput').value.trim();
    if (text && currentUser) {
        messagesRef.push({
            text: text,
            sender: currentUser,
            timestamp: Date.now()
        });
        document.getElementById('messageInput').value = '';
    }
}

// Add reset button functionality
function resetChat() {
    if (confirm('Are you sure you want to reset the chat? This will delete all messages.')) {
        messagesRef.remove();
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        messagesLoaded = false;
    }
}

// Add reset button to HTML
document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chatContainer');
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Chat';
    resetButton.style.marginTop = '10px';
    resetButton.onclick = resetChat;
    chatContainer.insertBefore(resetButton, document.getElementById('messageInput').parentElement);
});

// Add event listener for Enter key
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Add click handler for send button
document.getElementById('sendButton').onclick = sendMessage;

// Add event listener for Enter key
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Add click handler for send button
document.getElementById('sendButton').onclick = sendMessage;
