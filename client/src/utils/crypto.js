/**
 * Format a key string for better display
 * @param {string} keyString - The key string to format
 * @returns {string} - The formatted key string
 */
export const formatKey = (keyString) => {
    // Format the key by adding line breaks at appropriate intervals
    if (!keyString) return '';
    return keyString
        .replace(/(.{64})/g, '$1\n')
        .trim();
};

/**
 * Check if a message's integrity has been compromised
 * @param {Object} message - The message object to check
 * @returns {boolean} - Whether the message integrity is valid
 */
export const checkMessageIntegrity = (message) => {
    return !message.integrity_failure;
};

/**
 * Process a message for display, handling encrypted message content if needed
 * @param {Object} message - The message object from backend
 * @returns {Object} - Processed message ready for display
 */
export const processMessageForDisplay = (message) => {
    // For now, we're just returning the message content without decryption
    // In a real app, you would decrypt the encrypted_message using the private key
    const displayMessage = {
        sender: message.sender,
        recipient: message.recipient,
        content: message.message || message.encrypted_message || '',
        timestamp: message.timestamp || new Date().toISOString(),
        encrypted: message.encrypted || false,
        integrity_failure: message.integrity_failure || false
    };
    
    return displayMessage;
};

/**
 * Create a visual representation of verification status
 * @param {boolean} isVerified - Whether the entity is verified
 * @returns {Object} - Object containing status text and CSS class
 */
export const getVerificationStatus = (isVerified) => {
    return {
        text: isVerified ? 'Verified' : 'Unverified',
        className: isVerified ? 'verified-badge' : 'unverified-badge'
    };
};
