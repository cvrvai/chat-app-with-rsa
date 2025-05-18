from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
import base64
import logging

logger = logging.getLogger(__name__)

def generate_key_pair(key_size=2048):
    """
    Generate an RSA key pair with the specified key size
    
    Args:
        key_size (int): Size of the RSA key in bits
        
    Returns:
        tuple: (private_key, public_key) as RSA key objects
    """
    try:
        # Generate a new RSA key pair
        key = RSA.generate(key_size)
        private_key = key
        public_key = key.publickey()
        
        logger.info(f"Generated RSA key pair with size {key_size}")
        return private_key, public_key
    
    except Exception as e:
        logger.error(f"Error generating RSA key pair: {e}")
        raise

def sign_message(message, private_key):
    """
    Sign a message using RSA private key
    
    Args:
        message (str): The message to sign
        private_key (RSA key): The RSA private key
        
    Returns:
        bytes: The signature
    """
    try:
        # Create a hash of the message
        h = SHA256.new(message.encode('utf-8'))
        
        # Sign the hash with the private key
        signature = pkcs1_15.new(private_key).sign(h)
        
        logger.info("Message signed successfully")
        return signature
    
    except Exception as e:
        logger.error(f"Error signing message: {e}")
        raise

def verify_signature(message, signature, public_key):
    """
    Verify a signature using RSA public key
    
    Args:
        message (str): The message that was signed
        signature (bytes): The signature to verify
        public_key (RSA key): The RSA public key
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    try:
        # Create a hash of the message
        h = SHA256.new(message.encode('utf-8'))
        
        # Verify the signature
        pkcs1_15.new(public_key).verify(h, signature)
        
        logger.info("Signature verified successfully")
        return True
    
    except (ValueError, TypeError) as e:
        logger.warning(f"Invalid signature: {e}")
        return False
    
    except Exception as e:
        logger.error(f"Error verifying signature: {e}")
        raise

def encrypt_message(message, public_key):
    """
    Encrypt a message using RSA public key
    
    Args:
        message (str): The message to encrypt
        public_key (RSA key): The RSA public key
        
    Returns:
        bytes: The encrypted message
    """
    try:
        # Create a cipher object using the public key
        cipher = PKCS1_OAEP.new(public_key)
        
        # Encrypt the message
        encrypted = cipher.encrypt(message.encode('utf-8'))
        
        logger.info("Message encrypted successfully")
        return encrypted
    
    except Exception as e:
        logger.error(f"Error encrypting message: {e}")
        raise

def decrypt_message(encrypted_message, private_key):
    """
    Decrypt a message using RSA private key
    
    Args:
        encrypted_message (bytes): The encrypted message
        private_key (RSA key): The RSA private key
        
    Returns:
        str: The decrypted message
    """
    try:
        # Create a cipher object using the private key
        cipher = PKCS1_OAEP.new(private_key)
        
        # Decrypt the message
        decrypted = cipher.decrypt(encrypted_message)
        
        logger.info("Message decrypted successfully")
        return decrypted.decode('utf-8')
    
    except Exception as e:
        logger.error(f"Error decrypting message: {e}")
        raise

def generate_certificate(user_id, public_key, issuer_private_key):
    """
    Generate a simple certificate for a user
    
    Args:
        user_id (str): The user ID
        public_key (RSA key): The user's public key
        issuer_private_key (RSA key): The issuer's private key
        
    Returns:
        dict: The certificate as a dictionary
    """
    try:
        # Create a certificate with user information and public key
        certificate_data = {
            "user_id": user_id,
            "public_key": public_key.export_key().decode('utf-8'),
            "issued_by": "Secure Messaging App",
            "valid_until": "2025-12-31"  # dummy timestamp
        }
        
        # Serialize the certificate data
        certificate_str = str(certificate_data)
        
        # Sign the certificate
        signature = sign_message(certificate_str, issuer_private_key)
        
        # Create the complete certificate
        certificate = {
            "data": certificate_data,
            "signature": base64.b64encode(signature).decode('utf-8')
        }
        
        logger.info(f"Certificate generated for user {user_id}")
        return certificate
    
    except Exception as e:
        logger.error(f"Error generating certificate: {e}")
        raise

def verify_certificate(certificate, issuer_public_key):
    """
    Verify a certificate using the issuer's public key
    
    Args:
        certificate (dict): The certificate to verify
        issuer_public_key (RSA key): The issuer's public key
        
    Returns:
        bool: True if certificate is valid, False otherwise
    """
    try:
        # Extract certificate data and signature
        certificate_data = certificate["data"]
        signature = base64.b64decode(certificate["signature"])
        
        # Verify the signature
        is_valid = verify_signature(str(certificate_data), signature, issuer_public_key)
        
        if is_valid:
            logger.info(f"Certificate verified for user {certificate_data['user_id']}")
        else:
            logger.warning(f"Invalid certificate for user {certificate_data['user_id']}")
        
        return is_valid
    
    except Exception as e:
        logger.error(f"Error verifying certificate: {e}")
        return False 