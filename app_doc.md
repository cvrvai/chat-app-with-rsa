# RSA-Based Secure Messaging App Documentation


## group2 
## Team member (Cheong Choonvai,Rauth,Chhay Lyhour,Srengkoang Cheang )


## Overview
The RSA-Based Secure Messaging App is a real-time messaging application that demonstrates end-to-end encryption using RSA digital signatures. It provides a practical example of secure communication similar to modern messaging applications.

## Architecture

### Frontend (React + Vite)
- **User Interface**: Modern, responsive design built with React and styled using Tailwind CSS
- **Real-time Communication**: Socket.IO client for WebSocket connections
- **State Management**: React hooks for local state management
- **Encryption Handling**: Client-side RSA encryption/decryption implementation

### Backend (Flask)
- **Server**: Flask server with Flask-SocketIO for real-time messaging
- **Cryptography**: PyCryptodome for RSA implementation
- **Message Handling**: Real-time message routing and storage
- **Certificate Authority**: User authentication and key verification


## Storage here in logs folder
### Logging System 
- **Storage Location**: All application logs are stored in the `logs` directory
- **Log Format**: `app_YYYYMMDD_HHMMSS.log` (e.g., app_20250529_154657.log)
- **Log Content**: Timestamps, module names, log levels, and detailed messages
- **Logging Levels**: INFO, WARNING, ERROR for different event severities
- **Components Logged**:
  - User registration and authentication
  - Message handling and encryption
  - Security events and tampering attempts
  - System status and errors

## Security Features

### 1. End-to-End Encryption
- RSA key pair generation for each user
- Public key exchange during user registration
- Message encryption using recipient's public key
- Message decryption using recipient's private key

### 2. Digital Signatures
- Message signing with sender's private key
- Signature verification using sender's public key
- Tamper detection through signature validation
- Certificate-based user authentication

### 3. MITM Attack Prevention
- Certificate Authority (CA) implementation
- User certificate generation and validation
- Public key verification through certificates
- Encrypted channel for key exchange

## Message Flow

1. **User Registration**
   ```
   User -> Server: Register with username
   Server -> User: Generate RSA key pair & certificate
   ```

2. **Sending a Message (Encrypted Mode)**
   ```
   Sender -> Encrypt message with recipient's public key
   Sender -> Sign encrypted message with private key
   Sender -> Send {encrypted_message, signature} to server
   Server -> Route message to recipient
   Recipient -> Verify signature with sender's public key
   Recipient -> Decrypt message with private key
   ```

3. **Sending a Message (Unencrypted Mode)**
   ```
   Sender -> Send plaintext message to server
   Server -> Route message to recipient
   ```

## RSA Algorithm Implementation

### Key Generation
1. Generate two large prime numbers (p, q)
2. Calculate n = p * q
3. Calculate φ(n) = (p-1) * (q-1)
4. Choose public exponent e
5. Calculate private exponent d
6. Public key = (n, e)
7. Private key = (n, d)

### Encryption Process
```
c = m^e mod n
where:
c = ciphertext
m = message
e = public exponent
n = modulus
```

### Decryption Process
```
m = c^d mod n
where:
c = ciphertext
d = private exponent
n = modulus
m = original message
```

## Attack Simulation

The application includes an attacker simulation to demonstrate:
1. Plaintext visibility when encryption is disabled
2. Encrypted message security
3. Message tampering detection
4. Digital signature verification

## Testing Scenarios

### Basic Communication
1. Unencrypted messaging
2. Message routing
3. Real-time delivery

### Security Testing
1. End-to-end encryption
2. Digital signature verification
3. Certificate validation
4. Tamper detection

### Attack Testing
1. MITM attack simulation
2. Message modification attempts
3. Invalid signature detection

## Dependencies

### Frontend Dependencies
- React
- Vite
- Socket.IO Client
- TailwindCSS
- React Icons

### Backend Dependencies
- Flask (v2.3.3)
- Flask-SocketIO (v5.3.4)
- PyCryptodome (v3.18.0)
- Python-dotenv (v1.0.0)
- Cryptography (v41.0.3)
- Colorama (v0.4.6)
- Python-socketio (v5.7.2)
- Websocket-client (v1.8.0)
