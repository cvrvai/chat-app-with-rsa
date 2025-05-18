import time
import logging
from datetime import datetime

class MessageHandler:
    def __init__(self):
        self.users = {} 
        self.messages = []  
        self.logger = logging.getLogger(__name__)
        self.tampering_active = False  
    
    def add_user(self, user_id, public_key):
        """Add a user to the system with their public key"""
        self.users[user_id] = public_key
        self.logger.info(f"Added user: {user_id}")
    
    def get_users(self):
        """Return all registered users"""
        return self.users.keys()
    
    def get_user_public_key(self, user_id):
        """Get a user's public key"""
        if user_id in self.users:
            return self.users[user_id]
        else:
            self.logger.warning(f"Attempted to get public key for unknown user: {user_id}")
            return None
    
    def log_message(self, message):
        """Store a message for interception simulation"""
        self.messages.append(message)
        self.logger.info(f"Logged message from {message.get('sender', 'unknown')} to {message.get('recipient', 'unknown')}")
    
    def get_logged_messages(self):
        """Get all logged messages"""
        return self.messages
    
    def get_timestamp(self):
        """Get a formatted timestamp for messages"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def clear_messages(self):
        """Clear all logged messages"""
        self.messages = []
        self.logger.info("Cleared all logged messages")
        
    def set_tampering_active(self, active):
        """Set whether tampering is active"""
        self.tampering_active = active
        self.logger.info(f"Tampering mode set to: {active}")
        
    def is_tampering_active(self):
        """Check if tampering is active"""
        return self.tampering_active

# Initialize the logger for this module
def setup_logger():
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    
    # Create a handler
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    
    # Create a formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    
    # Add the handler to the logger
    logger.addHandler(handler)
    
    return logger 