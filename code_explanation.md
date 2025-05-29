# RSA-Based Secure Messaging App Code Explanation

## Project Structure Overview

### Backend (Flask)
```
app/
├── backend/         # Message handling and routing
├── crypto/         # RSA implementation
├── static/         # Static assets
├── templates/      # HTML templates
└── utils/          # Utility functions
```

### Frontend (React + Vite)
```
client/
├── src/
│   ├── components/    # React components
│   ├── services/      # Socket.IO setup
│   └── utils/         # Crypto utilities
```

## Core Components Explanation

### 1. RSA Implementation (`app/crypto/rsa_utils.py`)
- Implements RSA key generation
- Handles message encryption/decryption
- Manages digital signatures
- Key features:
  - Prime number generation
  - Key pair creation (public/private)
  - Message encryption/decryption
  - Digital signature creation/verification

### 2. Message Handling (`app/backend/message_handler.py`)
- Manages real-time message routing
- Implements WebSocket communication
- Handles:
  - Message encryption
  - Digital signatures
  - Message routing
  - User session management

### 3. Frontend Components

#### Authentication (`client/src/components/auth/Login.jsx`)
- User authentication flow
- Username input
- Key pair generation trigger
- Session management

#### Chat Interface (`client/src/components/chat/Chat.jsx`)
- Real-time messaging UI
- Message encryption toggle
- Signature verification display
- Features:
  - Message input/display
  - Encryption status indicator
  - Integrity verification
  - Real-time updates

#### Security Information (`client/src/components/security/SecurityInfo.jsx`)
- Displays cryptographic information
- Shows:
  - Public key
  - Private key (securely)
  - Certificate details
  - Encryption status

### 4. Crypto Utilities (`client/src/utils/crypto.js`)
- Frontend cryptographic operations
- Handles:
  - Key formatting
  - Message integrity checks
  - Signature verification
  - Encryption status management

## Key Implementation Details

### RSA Key Generation Process
```python
def generate_key_pair():
    # Generate large prime numbers
    p = generate_prime()
    q = generate_prime()
    
    # Calculate modulus
    n = p * q
    
    # Calculate totient
    phi = (p - 1) * (q - 1)
    
    # Choose public exponent
    e = 65537  # Common choice
    
    # Calculate private exponent
    d = mod_inverse(e, phi)
    
    return ((n, e), (n, d))  # (public_key, private_key)
```

### Message Encryption Flow
1. Get recipient's public key (n, e)
2. Convert message to number representation
3. Apply RSA encryption: c = m^e mod n
4. Sign encrypted message with sender's private key
5. Send message and signature

### Message Decryption Flow
1. Verify signature using sender's public key
2. Use recipient's private key (n, d)
3. Apply RSA decryption: m = c^d mod n
4. Convert number back to message

### Security Features

#### 1. Digital Signatures
- Ensures message integrity
- Prevents tampering
- Provides authentication
- Implementation:
  ```python
  def sign_message(message, private_key):
      hash_value = hash(message)
      signature = encrypt(hash_value, private_key)
      return signature
  ```

#### 2. Certificate Authority
- Validates user identities
- Manages public key distribution
- Prevents MITM attacks
- Implementation:
  ```python
  def issue_certificate(user_id, public_key):
      cert_data = f"{user_id}:{public_key}"
      signature = ca_sign(cert_data)
      return Certificate(user_id, public_key, signature)
  ```

## Real-time Communication

### Socket.IO Implementation
- Manages WebSocket connections
- Handles real-time message delivery
- Maintains user sessions
- Example:
  ```javascript
  socket.on('message', async (data) => {
      if (data.encrypted) {
          const verified = await verifySignature(data);
          if (verified) {
              const decrypted = await decrypt(data.message);
              displayMessage(decrypted);
          }
      }
  });
  ```

## Error Handling and Security

### Message Integrity Verification
- Checks signature validity
- Detects tampering attempts
- Handles decryption failures
- Implementation:
  ```javascript
  const checkMessageIntegrity = (message) => {
      const signature = message.signature;
      const content = message.content;
      return verifySignature(content, signature, senderPublicKey);
  };
  ```

### Attack Prevention
1. MITM Attack Prevention
   - Certificate verification
   - Encrypted key exchange
   - Digital signatures

2. Replay Attack Prevention
   - Timestamp verification
   - Session management
   - Nonce implementation

## Testing and Debugging

### Logging System
- Records all security events
- Tracks message flow
- Monitors system status
- Implementation:
  ```python
  def log_security_event(event_type, details):
      logger.info(f"Security Event: {event_type}")
      logger.debug(f"Details: {details}")
  ```

### Attack Simulation
- Tests encryption effectiveness
- Verifies signature validation
- Demonstrates security features
- Includes:
  - Message interception
  - Tampering attempts
  - Invalid signature testing
