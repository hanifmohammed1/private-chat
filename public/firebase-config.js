// Firebase configuration
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
const database = firebase.database();
const usersRef = database.ref('users');
const messagesRef = database.ref('messages');
let currentUser = null;
let selectedColor = null;
const MAX_USERS = 5;

// Initialize color selection
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        selectedColor = this.dataset.color;
    });
});

// Handle PIN input navigation
document.querySelectorAll('.pin-input').forEach((input, index) => {
    input.addEventListener('input', function() {
        if (this.value && index < 3) {
            document.querySelectorAll('.pin-input')[index + 1].focus();
        }
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && !this.value && index > 0) {
            document.querySelectorAll('.pin-input')[index - 1].focus();
        }
    });
});

// Join chat functionality
document.getElementById('joinButton').addEventListener('click', async function() {
    const username = document.getElementById('usernameInput').value.trim();
    const pin = Array.from(document.querySelectorAll('.pin-input'))
        .map(input => input.value)
        .join('');

    if (!username || !selectedColor || pin.length !== 4) {
        alert('Please fill in all fields');
        return;
    }

    // Check room capacity
    const snapshot = await usersRef.once('value');
    const currentUsers = snapshot.val() || {};
    if (Object.keys(currentUsers).length >= MAX_USERS) {
        alert('Chat room is full (5/5 users). Please try again later.');
        return;
    }

    // Check if username exists
    const userExists = Object.values(currentUsers).some(user => user.username === username);
    if (userExists) {
        alert('Username already taken. Please choose another one.');
        return;
    }

    // Create user profile
    currentUser = {
        username: username,
        color: selectedColor,
        pin: pin,
        joinedAt: firebase.database.ServerValue.TIMESTAMP
    };

    // Add user to database
    await usersRef.push(currentUser);

    // Switch to chat interface
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'flex';
    
    // Set up user interface
    setupUserInterface();
    setupMessageListener();
    setupUserListener();
});

function setupUserInterface() {
    const userColor = document.getElementById('userColor');
    const userName = document.getElementById('userName');
    
    userColor.style.backgroundColor = currentUser.color;
    userName.textContent = currentUser.username;
}

function setupUserListener() {
    usersRef.on('value', function(snapshot) {
        const users = snapshot.val() || {};
        const userCount = Object.keys(users).length;
        
        // Update user count
        document.getElementById('onlineCount').textContent = `${userCount}/5 users online`;
        document.querySelector('.users-list h3').textContent = `Chat Members (${userCount}/5)`;
        
        // Update users list
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        Object.values(users).forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-color" style="background-color: ${user.color}"></div>
                <div class="user-name">${user.username}</div>
            `;
            usersList.appendChild(userItem);
        });
    });
}

function setupMessageListener() {
    messagesRef.on('child_added', function(snapshot) {
        const message = snapshot.val();
        displayMessage(message);
    });
}

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === currentUser.username ? 'sent' : 'received'}`;
    messageDiv.style.backgroundColor = message.sender === currentUser.username ? currentUser.color : message.color;
    messageDiv.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div class="message-text">${message.text}</div>
    `;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Send message functionality
document.getElementById('sendButton').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();
    
    if (text && currentUser) {
        messagesRef.push({
            text: text,
            sender: currentUser.username,
            color: currentUser.color,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        messageInput.value = '';
    }
}

// Leave chat functionality
document.getElementById('leaveButton').addEventListener('click', function() {
    if (confirm('Are you sure you want to leave the chat?')) {
        // Remove user from database
        const userRef = Object.entries(usersRef).find(([key, val]) => 
            val.username === currentUser.username
        );
        if (userRef) {
            usersRef.child(userRef[0]).remove();
        }
        
        // Reset and show login form
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('chatContainer').style.display = 'none';
        document.getElementById('usernameInput').value = '';
        document.querySelectorAll('.pin-input').forEach(input => input.value = '');
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        // Reset current user
        currentUser = null;
        selectedColor = null;
    }
});
