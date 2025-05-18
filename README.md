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
- **Frontend**: HTML, CSS, JavaScript
- **WebSockets**: Socket.IO for real-time communication
- **Logging**: Python's built-in logging module

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Run the application:
```
python app.py
```

3. Open two browser windows/tabs at http://localhost:5000 for the two users
   - Enter different usernames in each window
   - Send messages between users
   - Toggle encryption on/off to see the difference

4. In a terminal, run the attacker simulation:
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

- `app.py`: Main Flask application entry point
- `attacker.py`: MITM attack simulation script
- `app/crypto`: RSA implementation and signature utilities
  - `rsa_utils.py`: Functions for key generation, signing, verification, encryption, and decryption
- `app/templates`: HTML templates for the frontend
  - `index.html`: Single-page application template
- `app/static`: CSS, JavaScript, and image assets
  - `css/style.css`: Application styling
  - `js/app.js`: Frontend JavaScript for UI interactions and Socket.IO
  - `images/lock-icon.svg`: Lock icon for the application
- `app/backend`: Server-side logic for message handling
  - `message_handler.py`: Message processing and user management
- `app/utils`: Utility functions for the application
  - `logger.py`: Logging configuration and setup
- `logs/`: Directory for application logs (created automatically)

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
## Chat Demo Between Two Users
![Image](https://github.com/user-attachments/assets/1bfd1709-6e5a-450d-95bb-6b1d408ab321)
![Image](https://github.com/user-attachments/assets/c56ba5fb-37b5-41b9-bd35-9749dfc418e1)
![Image](https://github.com/user-attachments/assets/3b2d22c1-7bab-42d6-8f4d-64b9b287e9d8)
![Image](https://github.com/user-attachments/assets/09cfd0c9-3a75-4206-858a-d9ddba792323)
![Image](https://github.com/user-attachments/assets/979085a7-b44b-47f8-9dc9-e6cf45f48e50)
![Image](https://github.com/user-attachments/assets/b5d29c1e-d7cc-4123-b3da-9e49bb04591c)
![Image](https://github.com/user-attachments/assets/1d439c04-2d28-4e9c-a49f-1e57007e6d23)
![Image](https://github.com/user-attachments/assets/43d3de4d-90a2-44ee-994c-7b4975132ea3)
![Image](https://github.com/user-attachments/assets/fec77cf5-cfc5-4c2c-bb64-a5fd43c99544)
![Image](https://github.com/user-attachments/assets/c8e9943f-a6c0-4eb2-a60d-74ab624e0451)
