// Initialize Firebase
const firebaseConfig = {
    // You'll need to add your Firebase config here
    // Get this from your Firebase project settings
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database reference
const database = firebase.database();
const messagesRef = database.ref('messages');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

// Listen for new messages
messagesRef.on('child_added', function(data) {
    const message = data.val();
    const messageDiv = document.createElement('div');
    messageDiv.className = message.sender === 'me' ? 'message sent' : 'message received';
    messageDiv.textContent = message.text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

function sendMessage() {
    const text = messageInput.value;
    if (text.trim()) {
        messagesRef.push({
            text: text,
            sender: 'me',
            timestamp: Date.now()
        });
        messageInput.value = '';
    }
}
