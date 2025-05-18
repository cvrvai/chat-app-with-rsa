// Connect to Socket.IO server
const socket = io();

// DOM elements
const loginSection = document.getElementById('login-section');
const chatSection = document.getElementById('chat-section');
const securityInfo = document.getElementById('security-info');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');
const usersList = document.getElementById('users-list');
const selectedUserDisplay = document.getElementById('selected-user');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const encryptionSwitch = document.getElementById('encryption-switch');
const userIdDisplay = document.getElementById('user-id-display');
const publicKeyDisplay = document.getElementById('public-key-display');
const privateKeyDisplay = document.getElementById('private-key-display');
const showSecurityInfoButton = document.getElementById('show-security-info');

// Application state
let currentUser = null;
let selectedUser = null;
let userPublicKey = null;
let userPrivateKey = null;
let userCertificate = null;
let caPublicKey = null;
let users = [];
let conversations = {}; // Store conversations by user
let verifiedUsers = {}; // Track which users have verified certificates

// Event Listeners
loginButton.addEventListener('click', handleLogin);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

showSecurityInfoButton.addEventListener('click', () => {
    securityInfo.classList.toggle('hidden');
    showSecurityInfoButton.textContent = securityInfo.classList.contains('hidden') ? 
        'Show Security Info' : 'Hide Security Info';
});

// Socket.IO event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('user_list_updated', (data) => {
    users = data.users;
    updateUsersList();
});

socket.on('key_generated', (data) => {
    userPublicKey = data.public_key;
    userPrivateKey = data.private_key;
    userCertificate = data.certificate;
    caPublicKey = data.ca_public_key;
    
    // Display keys
    publicKeyDisplay.textContent = formatKey(userPublicKey);
    privateKeyDisplay.textContent = formatKey(userPrivateKey);
    
    // Add certificate information to the security info section
    addCertificateInfo();
    
    console.log('RSA keys and certificate generated and received');
});

socket.on('new_message', (message) => {
    console.log('Received message:', message);
    
    // Store the message in the appropriate conversation
    const otherUser = message.sender === currentUser ? message.recipient : message.sender;
    
    if (!conversations[otherUser]) {
        conversations[otherUser] = [];
    }
    
    // If message has a certificate and sender is not current user and is encrypted, verify it
    if (message.certificate && message.sender !== currentUser && message.encrypted) {
        console.log(`Verifying certificate for encrypted message from ${message.sender}`);
        
        // Verify if not already verified
        if (verifiedUsers[message.sender] === undefined) {
            verifyUserCertificate(message.sender, message.certificate);
            // Set as pending verification initially
            verifiedUsers[message.sender] = false;
        }
        
        // Set the certificate verification status on the message
        message.certificateVerified = !!verifiedUsers[message.sender];
        console.log(`Certificate verified status for ${message.sender}: ${message.certificateVerified}`);
    }
    
    conversations[otherUser].push(message);
    
    // If this is the currently selected conversation, display it
    if (otherUser === selectedUser) {
        displayConversation(selectedUser);
    }
    
    // If integrity failure, show alert
    if (message.integrity_failure) {
        showIntegrityAlert(message);
    }
});

socket.on('verification_result', (result) => {
    console.log('Certificate verification result:', result);
    
    // Store verification result with proper encoding handling
    if (result.user_id) {
        verifiedUsers[result.user_id] = result.verified;
        
        // Update conversation display if needed
        if (result.user_id === selectedUser) {
            displayConversation(selectedUser);
        }
        
        // Show verification notification
        showVerificationNotification(result.user_id, result.verified);
    }
});

// Functions
function handleLogin() {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        userIdDisplay.textContent = username;
        
        // Register user with server
        socket.emit('register_user', { user_id: username });
        
        // Show chat section, hide login
        loginSection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        
        console.log('Logged in as:', username);
    }
}

function updateUsersList() {
    // Clear current list
    usersList.innerHTML = '';
    
    // Populate with users except current user
    users.forEach(user => {
        if (user !== currentUser) {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.textContent = user;
            userItem.dataset.userId = user;
            
            // Add verification badge if applicable
            if (verifiedUsers[user]) {
                const verifiedBadge = document.createElement('span');
                verifiedBadge.className = 'verified-badge';
                verifiedBadge.textContent = '✓';
                verifiedBadge.title = 'Verified Certificate';
                userItem.appendChild(verifiedBadge);
            }
            
            if (user === selectedUser) {
                userItem.classList.add('selected');
            }
            
            userItem.addEventListener('click', () => {
                selectUser(user);
            });
            
            usersList.appendChild(userItem);
        }
    });
}

function selectUser(userId) {
    // Update selected user
    selectedUser = userId;
    selectedUserDisplay.textContent = userId;
    
    // Update UI
    const userItems = document.querySelectorAll('.user-item');
    userItems.forEach(item => {
        if (item.dataset.userId === userId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Enable message input and send button
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
    
    // If we have messages with this user, check if we need to verify certificates
    if (conversations[userId] && conversations[userId].length > 0) {
        checkConversationCertificates(userId);
    }
    
    // Display the conversation with this user
    displayConversation(userId);
}

// Helper function to check and verify certificates in a conversation
function checkConversationCertificates(userId) {
    // Find any encrypted messages from this user that have certificates
    const messages = conversations[userId] || [];
    
    for (const message of messages) {
        if (message.encrypted && message.certificate && message.sender !== currentUser) {
            // If we don't have a verification result yet, verify the certificate
            if (verifiedUsers[message.sender] === undefined) {
                console.log(`Verifying certificate for ${message.sender} from conversation history`);
                verifyUserCertificate(message.sender, message.certificate);
                // Initially set to false until verification completes
                verifiedUsers[message.sender] = false;
                // We only need to request verification once
                break;
            }
        }
    }
}

function displayConversation(userId) {
    // Clear the messages container
    messagesContainer.innerHTML = '';
    
    // If there are no messages yet, show the empty state
    if (!conversations[userId] || conversations[userId].length === 0) {
        const noMessages = document.createElement('div');
        noMessages.className = 'no-messages';
        const p = document.createElement('p');
        p.textContent = 'No messages yet. Start a conversation!';
        noMessages.appendChild(p);
        messagesContainer.appendChild(noMessages);
        return;
    }
    
    // Display all messages in the conversation
    conversations[userId].forEach(message => {
        displayMessage(message);
    });
    
    // Scroll to the bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function clearMessages() {
    messagesContainer.innerHTML = '';
    const noMessages = document.createElement('div');
    noMessages.className = 'no-messages';
    const p = document.createElement('p');
    p.textContent = 'No messages yet. Start a conversation!';
    noMessages.appendChild(p);
    messagesContainer.appendChild(noMessages);
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText && selectedUser) {
        const isEncrypted = encryptionSwitch.checked;
        
        // Create message object
        const message = {
            sender: currentUser,
            recipient: selectedUser,
            message: messageText,
            encrypted: isEncrypted,
            timestamp: new Date().toLocaleTimeString()
        };
        
        // Send message
        socket.emit('send_message', message);
        
        // Clear input
        messageInput.value = '';
        messageInput.focus();
        
        console.log('Message sent:', isEncrypted ? '[ENCRYPTED]' : messageText);
    }
}

function displayMessage(message) {
    // Remove "no messages" notice if present
    const noMessagesElement = document.querySelector('.no-messages');
    if (noMessagesElement) {
        noMessagesElement.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = message.sender === currentUser ? 'message sent' : 'message received';
    
    // If integrity failure or tampered, add warning class, but only for encrypted messages
    if (message.encrypted) {
        if (message.integrity_failure) {
            messageElement.classList.add('integrity-warning');
        }
        
        if (message.tampered) {
            messageElement.classList.add('tampered');
        }
    }
    
    // Sender name container
    const senderElement = document.createElement('div');
    senderElement.className = 'message-sender';
    
    // Add sender name as a span
    const senderNameElement = document.createElement('span');
    senderNameElement.textContent = message.sender;
    senderElement.appendChild(senderNameElement);
    
    // Add status badges
    // Encrypted badge if applicable
    if (message.encrypted) {
        const encryptedBadge = document.createElement('span');
        encryptedBadge.className = 'encrypted-badge';
        encryptedBadge.textContent = 'Encrypted';
        senderElement.appendChild(encryptedBadge);
        
        // Only show certificate verification badges for encrypted messages
        if (message.sender !== currentUser) {
            // Check verification status directly from global verifiedUsers object
            const isVerified = verifiedUsers[message.sender] === true; 
            
            // Log state for debugging
            console.log(`Display - User ${message.sender} verification status: ${isVerified}`, verifiedUsers);
            
            if (isVerified) {
                const verifiedBadge = document.createElement('span');
                verifiedBadge.className = 'verified-badge';
                verifiedBadge.textContent = 'Verified';
                verifiedBadge.title = 'User has a verified certificate';
                senderElement.appendChild(verifiedBadge);
            } else if (message.certificate) {
                const unverifiedBadge = document.createElement('span');
                unverifiedBadge.className = 'unverified-badge';
                unverifiedBadge.textContent = 'Unverified';
                unverifiedBadge.title = 'Certificate verification pending or failed';
                senderElement.appendChild(unverifiedBadge);
            }
        }
    }
    
    // Message content
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.textContent = message.message;
    
    // Add signature or tampering indicators
    if (message.encrypted) {
        // If we're the recipient, attempt to decrypt
        if (message.recipient === currentUser && message.encrypted_message) {
            // Show signature verification status if applicable
            if (message.signature) {
                const signatureElement = document.createElement('div');
                signatureElement.className = 'signature-status';
                signatureElement.innerHTML = '<span class="verified-badge">Signature verified ✓</span>';
                contentElement.appendChild(signatureElement);
            }
        }
        
        // Show integrity warning for encrypted messages if applicable
        if (message.integrity_failure || message.tampered) {
            const warningElement = document.createElement('div');
            warningElement.className = 'integrity-warning-text';
            warningElement.innerHTML = '<span class="unverified-badge">⚠️ Message tampered</span>';
            contentElement.appendChild(warningElement);
        }
    }
    
    // Timestamp
    const timeElement = document.createElement('div');
    timeElement.className = 'message-time';
    timeElement.textContent = message.timestamp || new Date().toLocaleTimeString();
    
    // Assemble message
    messageElement.appendChild(senderElement);
    messageElement.appendChild(contentElement);
    messageElement.appendChild(timeElement);
    
    // Add to messages container
    messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showIntegrityAlert(message) {
    // Only show integrity alerts for encrypted messages
    if (message.encrypted) {
        if (message.integrity_failure || message.tampered) {
            console.warn('Message integrity failure for encrypted message!', message);
            
            // Create a notification div
            const notification = document.createElement('div');
            notification.className = 'integrity-notification';
            notification.textContent = '⚠️ Warning: Message integrity check failed! The message may have been tampered with.';
            
            // Add the notification to the page temporarily
            document.body.appendChild(notification);
            
            // Remove after 5 seconds
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 5000);
        } else {
            // For encrypted messages, signature verification will handle this
            console.log('Signature verification ensures integrity of encrypted messages');
        }
    }
}

function formatKey(keyString) {
    // Format a key for display with line breaks
    if (!keyString) return '';
    
    // Ensure PEM format is preserved with line breaks
    return keyString.replace(/\\n/g, '\n');
}

// Function to verify a user's certificate
function verifyUserCertificate(userId, certificate) {
    console.log(`Verifying certificate for user: ${userId}`);
    socket.emit('verify_user', {
        user_id: userId,
        certificate: certificate
    });
}

// Add notification for certificate verification
function showVerificationNotification(userId, isVerified) {
    const notificationClass = isVerified ? 'success-notification' : 'error-notification';
    const message = isVerified ? 
        `✓ User ${userId}'s certificate has been verified.` :
        `⚠️ Warning: Failed to verify ${userId}'s certificate!`;
    
    const notification = document.createElement('div');
    notification.className = `certificate-notification ${notificationClass}`;
    notification.textContent = message;
    
    // Add the notification to the page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

// Add certificate info to security section
function addCertificateInfo() {
    if (userCertificate && document.getElementById('certificate-section') === null) {
        const keyInfo = document.querySelector('.key-info');
        
        const certSection = document.createElement('div');
        certSection.id = 'certificate-section';
        
        const certTitle = document.createElement('h3');
        certTitle.textContent = 'Your Certificate:';
        certSection.appendChild(certTitle);
        
        const certDetails = document.createElement('div');
        certDetails.className = 'certificate-details';
        
        // Display certificate details
        const certData = userCertificate.data;
        certDetails.innerHTML = `
            <div class="cert-item"><strong>User ID:</strong> ${certData.user_id}</div>
            <div class="cert-item"><strong>Issued By:</strong> ${certData.issued_by}</div>
            <div class="cert-item"><strong>Valid Until:</strong> ${certData.valid_until}</div>
            <div class="cert-status">
                <span class="cert-badge">Digitally Signed ✓</span>
            </div>
        `;
        
        certSection.appendChild(certDetails);
        keyInfo.appendChild(certSection);
    }
} 