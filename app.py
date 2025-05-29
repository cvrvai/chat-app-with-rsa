from flask import Flask, render_template, jsonify, session, send_from_directory, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import logging
import json
import os
import base64
import hashlib
from app.crypto.rsa_utils import generate_key_pair, sign_message, verify_signature, encrypt_message, decrypt_message
from app.crypto.rsa_utils import generate_certificate, verify_certificate
from app.backend.message_handler import MessageHandler
from app.utils.logger import setup_logger

# Initialize Flask app
app = Flask(__name__, 
            static_folder='app/static',
            template_folder='app/templates')
app.config['SECRET_KEY'] = os.urandom(24).hex()

# Enable CORS for the React frontend
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"]}})
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"], ping_timeout=60)

# Setup logger
logger = setup_logger()

# Initialize message handler
message_handler = MessageHandler()

# Store user key pairs (in a real app, these would be properly managed)
user_keys = {}

# Store message hashes for integrity checking
message_hashes = {}

# Track intercepted messages to prevent duplicate delivery
intercepted_messages = set()

# Generate CA key pair for certificate authority
ca_private_key, ca_public_key = generate_key_pair()
logger.info("Certificate Authority keys generated")

# Store user certificates
user_certificates = {}

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/app/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('app/static/images', filename)

@app.route('/app/styles/<path:filename>')
def serve_styles(filename):
    return send_from_directory('app/static/css', filename)

@app.route('/app/utils/<path:filename>')
def serve_js(filename):
    return send_from_directory('app/static/js', filename)

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    logger.info("Client connected")

@socketio.on('register_user')
def handle_register(data):
    user_id = data['user_id']
    logger.info(f"Registering user: {user_id}")
    
    # Generate RSA key pair for this user
    private_key, public_key = generate_key_pair()
    user_keys[user_id] = {
        'private_key': private_key,
        'public_key': public_key
    }
    
    # Generate certificate for the user
    certificate = generate_certificate(user_id, public_key, ca_private_key)
    user_certificates[user_id] = certificate
    logger.info(f"Certificate generated for user: {user_id}")
    
    # Store user in message handler
    message_handler.add_user(user_id, public_key)
    
    # Join a room with the user's ID
    join_room(user_id)
    
    # Broadcast updated user list
    emit('user_list_updated', {'users': list(message_handler.get_users())}, broadcast=True)
    
    # Send user's key pair and certificate back
    emit('key_generated', {
        'private_key': private_key.export_key().decode('utf-8'),
        'public_key': public_key.export_key().decode('utf-8'),
        'certificate': certificate,
        'ca_public_key': ca_public_key.export_key().decode('utf-8')
    })

@socketio.on('send_message')
def handle_message(data):
    sender = data['sender']
    recipient = data['recipient']
    message_text = data['message']
    encrypted = data.get('encrypted', False)
    
    logger.info(f"Message from {sender} to {recipient}: {'[ENCRYPTED]' if encrypted else message_text}")
    
    # Create message object
    message = {
        'sender': sender,
        'recipient': recipient,
        'timestamp': message_handler.get_timestamp(),
        'message': message_text,
        'encrypted': encrypted,
    }
    
    # Add certificate to message for sender verification
    if sender in user_certificates:
        message['certificate'] = user_certificates[sender]
    
    # Calculate message hash for integrity checking
    message_hash = hashlib.sha256(message_text.encode()).hexdigest()
    message['hash'] = message_hash
    
    # Generate a unique message ID
    message_id = f"{sender}_{recipient}_{message_handler.get_timestamp()}_{message_text}"
    
    # Store original hash with the message ID
    message_hashes[message_id] = message_hash
    
    if encrypted:
        # Sign the message with sender's private key
        signature = sign_message(message_text, user_keys[sender]['private_key'])
        message['signature'] = base64.b64encode(signature).decode('utf-8')
          # Encrypt the message with recipient's public key
        recipient_public_key = message_handler.get_user_public_key(recipient)
        encrypted_message = encrypt_message(message_text, recipient_public_key)
        message['encrypted_message'] = base64.b64encode(encrypted_message).decode('utf-8')
    
    # Always send a copy back to the sender immediately (they see their original message)
    sender_copy = message.copy()
    emit('new_message', sender_copy, to=sender)
    logger.info(f"Sent original message confirmation to sender {sender}")
    
    # Log message for attacker to intercept
    message_handler.log_message(message)
    
    # Only deliver to recipient if not being intercepted by attacker
    # In normal operation, the attacker script will intercept and either forward 
    # the original or a tampered version using tampered_message event
    if not message_handler.is_tampering_active():
        # Attacker not active, deliver normally
        emit('new_message', message, to=recipient)
        logger.info(f"Delivered message directly to recipient {recipient} (no attacker active)")

@socketio.on('intercept_message')
def handle_intercept_message(data):
    """Handle notification that a message is being intercepted"""
    message_id = data.get('message_id')
    if message_id and data.get('intercepted', False):
        intercepted_messages.add(message_id)
        logger.info(f"Message {message_id} is being intercepted by attacker")

@socketio.on('tampered_message')
def handle_tampered_message(data):
    """Handle tampered messages from the attacker"""
    logger.warning(f"Received tampered message from attacker")
    
    original_text = data.get('original_message', '')
    tampered_text = data.get('message', '')
    
    # Check integrity by comparing hash - only for encrypted messages
    if 'hash' in data and data.get('encrypted', False):
        expected_hash = data['hash']
        current_hash = hashlib.sha256(tampered_text.encode()).hexdigest()
        
        # If hash doesn't match, mark integrity failure
        if current_hash != expected_hash:
            data['integrity_failure'] = True
            logger.warning(f"Integrity check failed: hash mismatch for tampered message")
    
    # Only forward to recipient - the sender already got their copy
    if 'recipient' in data:
        # Ensure we mark this message as tampered if it was changed, but only for encrypted messages
        if original_text and original_text != tampered_text:
            if data.get('encrypted', False):
                data['tampered'] = True
                logger.warning(f"Message tampered: '{original_text}' -> '{tampered_text}'")
            else:
                # For unencrypted messages, don't mark as tampered - this is expected behavior
                logger.info(f"Unencrypted message modified: '{original_text}' -> '{tampered_text}'")
          # Only send to recipient
        emit('new_message', data, to=data['recipient'])
        logger.info(f"Forwarded tampered message to recipient {data['recipient']}")

@socketio.on('request_intercept')
def handle_intercept():
    """Endpoint for the attacker to intercept messages"""
    messages = message_handler.get_logged_messages()
    emit('intercepted_messages', {'messages': messages})

@socketio.on('set_tampering_mode')
def handle_set_tampering_mode(data):
    """Set whether tampering is active"""
    active = data.get('active', False)
    message_handler.set_tampering_active(active)
    logger.info(f"Tampering mode set to: {active}")

@socketio.on('verify_user')
def handle_verify_user(data):
    """Handle user certificate verification"""
    try:
        user_id = data.get('user_id')
        certificate = data.get('certificate')
        
        logger.info(f"Certificate verification request for user: {user_id}")
        
        if user_id and certificate:
            # Verify the certificate using CA public key
            is_valid = verify_certificate(certificate, ca_public_key)
            
            # Return verification result
            emit('verification_result', {
                'user_id': user_id,
                'verified': is_valid
            })
            
            logger.info(f"Certificate verification result for {user_id}: {'Success' if is_valid else 'Failed'}")
    except Exception as e:
        logger.error(f"Error in certificate verification: {e}")
        emit('verification_result', {
            'user_id': data.get('user_id'),
            'verified': False,
            'error': str(e)
        })
            
@socketio.on('get_conversation')
def handle_get_conversation(data):
    """Handle request to get conversation history between two users"""
    try:
        user_id = data.get('user_id')
        recipient_id = data.get('recipient_id')
        
        logger.info(f"Retrieving conversation history between {user_id} and {recipient_id}")
        
        # In a real app, we'd fetch from a database. Here we'll just return any cached messages
        conversation_messages = []
        for msg in message_handler.messages:
            if (msg['sender'] == user_id and msg['recipient'] == recipient_id) or \
               (msg['sender'] == recipient_id and msg['recipient'] == user_id):
                conversation_messages.append(msg)
        
        # Sort messages by timestamp
        conversation_messages.sort(key=lambda x: x.get('timestamp', ''))
        
        # Send conversation history to requesting client
        emit('conversation_history', {
            'conversation_with': recipient_id,
            'messages': conversation_messages
        })
        
        logger.info(f"Sent {len(conversation_messages)} messages for conversation between {user_id} and {recipient_id}")
    except Exception as e:
        logger.error(f"Error retrieving conversation history: {e}")
        emit('conversation_history', {
            'conversation_with': recipient_id,
            'messages': [],
            'error': str(e)
        })

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify({'users': list(message_handler.get_users())})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 