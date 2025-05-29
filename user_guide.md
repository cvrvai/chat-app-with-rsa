# RSA-Based Secure Messaging App - User Guide

## Getting Started

### Installation and Setup

1. **Backend Setup**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt

   # Start the Flask server
   python app.py
   ```

2. **Frontend Setup**
   ```bash
   # Navigate to client directory
   cd client

   # Install Node dependencies
   npm install

   # Start the development server
   npm run dev
   ```

## Using the App

### 1. Registration and Login
1. Open the app in your browser (default: http://localhost:5173)
2. Enter your desired username in the login screen
3. A new RSA key pair will be generated for you
4. Your public key will be displayed in the Security Info panel
5. Your private key is securely stored locally

### 2. Sending Messages
1. Select a recipient from the users list
2. Type your message in the chat input box
3. Toggle encryption ON/OFF using the switch
4. Click "Send" or press Enter to send the message

### 3. Security Features

#### Encryption Toggle
- **ON**: Messages are encrypted and signed
  - Only the recipient can read the message
  - Digital signatures verify message authenticity
  - Tampering attempts are detected

- **OFF**: Messages are sent in plaintext
  - No encryption or security
  - Useful for demonstration purposes
  - Shows vulnerability to interception

#### Security Information Panel
- Displays your public key
- Shows encryption status
- Indicates certificate validity
- Displays connection security status

### 4. Testing Security Features

#### Basic Communication Test
1. Open two browser windows
2. Log in with different usernames
3. Send messages between users
4. Observe real-time message delivery

#### Encryption Test
1. Enable encryption toggle
2. Send a message
3. Notice the encrypted format in transit
4. Recipient sees decrypted message
5. Security panel shows encryption status

#### Attack Simulation

1. **Start the Attacker Simulation**
   ```bash
   python attacker.py
   ```

2. **Test Unencrypted Messages**
   - Keep encryption OFF
   - Send messages between users
   - Watch attacker window show plaintext
   - Observe message vulnerability

3. **Test Encrypted Messages**
   - Turn encryption ON
   - Send messages between users
   - Watch attacker window show encrypted data
   - Notice inability to read messages

4. **Test Tampering Detection**
   - In attacker window, type 't' for tamper mode
   - Send an encrypted message
   - Follow attacker prompts to modify message
   - Observe tampering detection at recipient

### 5. Best Practices

1. **Security**
   - Keep encryption toggle ON for sensitive messages
   - Never share your private key
   - Verify certificate validity
   - Monitor security indicators

2. **Privacy**
   - Check encryption status before sending sensitive info
   - Verify recipient's identity
   - Monitor attacker simulation for security awareness
   - Understand encryption indicators

### 6. Troubleshooting

#### Common Issues and Solutions

1. **Message Not Sending**
   - Check internet connection
   - Verify WebSocket connection
   - Ensure server is running
   - Check for console errors

2. **Encryption Issues**
   - Verify both users have valid certificates
   - Check encryption toggle status
   - Ensure key pair generation success
   - Monitor security panel warnings

3. **Connection Problems**
   - Verify server is running
   - Check correct ports are open
   - Ensure WebSocket connection
   - Restart application if needed

### 7. Understanding Security Indicators

#### Message Status Icons
- 🔒 Message is encrypted
- 🔓 Message is unencrypted
- ✓✓ Message integrity verified
- ⚠️ Tampering detected

#### Security Panel Indicators
- 🟢 Secure connection active
- 🔑 Valid certificate
- 🔒 Encryption enabled
- ⚠️ Security warning

## Support and Additional Resources

### Help and Documentation
- Refer to README.md for technical details
- Check app_doc.md for system architecture
- See flow_app.md for process flows
- Review real_world_applications.md for use cases

### Security Best Practices
- Always use encryption for sensitive data
- Regularly check security indicators
- Monitor attacker simulation for awareness
- Understand encryption status before sending

### Contact and Support
For issues, questions, or support:
- Create an issue on the project repository
- Contact system administrator
- Check documentation for updates
- Review security guidelines
