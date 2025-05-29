# RSA-Based Secure Messaging App Flow Diagrams

This document visualizes the key flows and algorithms in the secure messaging application using Mermaid diagrams.

## User Registration and Key Generation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant CA as Certificate Authority

    U->>F: Enter Username
    F->>B: Register Request
    Note over B: Generate RSA Key Pair
    B->>CA: Request Certificate
    CA->>B: Generate & Sign Certificate
    B->>F: Return Keys & Certificate
    F->>U: Display Public Key
    Note over F: Store Private Key Securely
```

## Encrypted Message Flow

```mermaid
sequenceDiagram
    participant S as Sender
    participant SF as Sender Frontend
    participant B as Backend
    participant RF as Receiver Frontend
    participant R as Receiver

    S->>SF: Type Message
    Note over SF: 1. Get Receiver's Public Key
    Note over SF: 2. Encrypt Message
    Note over SF: 3. Sign with Private Key
    SF->>B: Send Encrypted Message + Signature
    B->>RF: Route Message
    Note over RF: 1. Verify Signature
    Note over RF: 2. Decrypt with Private Key
    RF->>R: Display Message
```

## RSA Algorithm Flow

```mermaid
graph TD
    A[Key Generation] --> B[Generate Prime Numbers p, q]
    B --> C[Calculate n = p * q]
    C --> D[Calculate φ(n) = (p-1) * (q-1)]
    D --> E[Choose Public Exponent e]
    E --> F[Calculate Private Exponent d]
    F --> G[Public Key (n, e)]
    F --> H[Private Key (n, d)]

    I[Encryption] --> J[Get Message m]
    J --> K[Use Public Key]
    K --> L[c = m^e mod n]

    M[Decryption] --> N[Get Ciphertext c]
    N --> O[Use Private Key]
    O --> P[m = c^d mod n]
```

## Digital Signature Process

```mermaid
sequenceDiagram
    participant S as Sender
    participant R as Receiver
    participant H as Hash Function

    Note over S: Original Message
    S->>H: Generate Hash
    Note over S: Sign Hash with Private Key
    S->>R: Send Message + Signature
    R->>H: Generate Hash of Received Message
    Note over R: Verify Signature with Sender's Public Key
    Note over R: Compare Hashes
```

## MITM Attack Prevention

```mermaid
graph TD
    A[Certificate Authority] --> B[Generate CA Key Pair]
    B --> C[Issue User Certificate]
    C --> D[Sign with CA Private Key]
    
    E[User Authentication] --> F[Present Certificate]
    F --> G[Verify with CA Public Key]
    G -->|Valid| H[Trust User's Public Key]
    G -->|Invalid| I[Reject Connection]

    J[Message Exchange] --> K[Verify Certificates]
    K --> L[Establish Encrypted Channel]
    L --> M[Exchange Messages]
```

## Error Handling Flow

```mermaid
graph TD
    A[Message Received] --> B{Signature Valid?}
    B -->|Yes| C[Decrypt Message]
    B -->|No| D[Show Tampering Warning]
    
    C --> E{Decryption Successful?}
    E -->|Yes| F[Display Message]
    E -->|No| G[Show Error]
    
    H[Send Message] --> I{Encryption Enabled?}
    I -->|Yes| J[Encrypt + Sign]
    I -->|No| K[Send Plaintext]
    J --> L[Send via WebSocket]
    K --> L
```
