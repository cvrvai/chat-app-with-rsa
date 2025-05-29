# Secure Messaging App

A simple demo of RSA-based digital signatures for secure messaging, similar to today's messaging app end-to-end encryption.

## Features

- End-to-end encryption using RSA for message signing and verification
- Digital signature implementation to ensure message integrity
- Real-time message delivery via WebSockets
- MITM attack simulation to demonstrate encryption effectiveness
- Simple UI for demo
- Toggle between encrypted and unencrypted messaging by switch
- Security information display showing public and private keys
- Certificate authority and certificate verification for user authentication

## Technologies Used

- **Backend**: Flask, Flask-SocketIO
- **Cryptography**: PyCryptodome for RSA implementation
- **Frontend**: react vite 
- **WebSockets**: Socket.IO for real-time communication
- **Logging**: Python's built-in logging module

## In a terminal, run the attacker simulation:
```
python attacker.py
```
This will display all message traffic, including:
- Plaintext messages when encryption is off
- Encrypted content and digital signatures when encryption is on
- Simulated tampering attempts

## Testing Scenarios

### Scenario 1: Unencrypted Communication
1. Keep the encryption toggle switched OFF
2. Send messages between users
3. Observe in the attacker window that messages are visible in plaintext
4. Notice the attacker can read and potentially modify these messages

### Scenario 2: End-to-End Encrypted Communication
1. Turn the encryption toggle ON
2. Send messages between users
3. Observe in the attacker window that messages appear as encrypted data
4. Notice the digital signatures that protect against message tampering
5. See that the attacker cannot read the content or modify messages

### Scenario 3: Tampered Message Detection
1. Turn the encryption toggle ON
2. In the attacker window, type 't' to enable tampering mode
3. Send a message between users
4. The attacker will prompt to modify the message
5. Enter a modified message in the attacker terminal
6. Observe that the recipient can detect the tampering due to signature verification

## Project Structure


## Dependencies

The application requires the following Python packages:
- flask (v2.3.3)
- flask-socketio (v5.3.4)
- pycryptodome (v3.18.0)
- python-dotenv (v1.0.0)
- cryptography (v41.0.3)
- colorama (v0.4.6)
- python-socketio (v5.7.2)
- websocket-client (v1.8.0)
