import { useState, useEffect, useRef } from 'react';
import socket from '../../services/socket';
import { checkMessageIntegrity, processMessageForDisplay } from '../../utils/crypto';
import { RiLockLine, RiLockUnlockLine, RiAlertLine, RiSendPlane2Fill } from 'react-icons/ri';
import './Chat.css'; // Import the new CSS file

const Chat = ({ currentUser, selectedUser, userKeys }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [sendButtonAnimate, setSendButtonAnimate] = useState(false);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Animation state for user change
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    // Reset messages when selected user changes
    setMessages([]);
    setFadeIn(true);
    
    // Reset fade-in effect after animation completes
    const timer = setTimeout(() => setFadeIn(false), 500);
    
    if (!selectedUser) return;
    
    // Fetch conversation history
    socket.emit('get_conversation', {
      user_id: currentUser,
      recipient_id: selectedUser
    });
    
    return () => clearTimeout(timer);
  }, [selectedUser, currentUser]);useEffect(() => {
    // Listen for incoming messages
    const handleIncomingMessage = (data) => {
      if ((data.sender === selectedUser && data.recipient === currentUser) ||
          (data.sender === currentUser && data.recipient === selectedUser)) {
        // Process message for display using our helper function
        const messageForDisplay = processMessageForDisplay(data);
        setMessages(prevMessages => [...prevMessages, messageForDisplay]);
      }
    };

    // Listen for conversation history
    const handleConversationHistory = (data) => {
      if (data.conversation_with === selectedUser) {
        // Convert backend message format to frontend format
        const messagesForDisplay = (data.messages || []).map(msg => ({
          sender: msg.sender,
          recipient: msg.recipient,
          content: msg.message || msg.encrypted_message,
          timestamp: msg.timestamp,
          encrypted: msg.encrypted
        }));
        setMessages(messagesForDisplay);
      }
    };

    socket.on('new_message', handleIncomingMessage); // Backend emits 'new_message', not 'receive_message'
    socket.on('conversation_history', handleConversationHistory);

    return () => {
      socket.off('new_message', handleIncomingMessage);
      socket.off('conversation_history', handleConversationHistory);
    };
  }, [selectedUser, currentUser]);
  const sendMessage = () => {
    if (!messageInput.trim() || !selectedUser) return;

    // Create message object
    const messageData = {
      sender: currentUser,
      recipient: selectedUser,
      message: messageInput,  // Backend expects 'message', not 'content'
      timestamp: new Date().toISOString(),
      encrypted: isEncrypted
    };

    // Send to server
    socket.emit('send_message', messageData);
    
    // Clear input
    setMessageInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    // Simulate typing indicator (in a real app, this would emit to the socket)
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a timeout to stop "typing" after a delay
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };
  
  // Animate send button and send message
  const handleSendButtonClick = () => {
    setSendButtonAnimate(true);
    setTimeout(() => setSendButtonAnimate(false), 300);
    sendMessage();
  };
  
  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex justify-start mb-2">
      <div className="bg-gray-100 px-3 py-2 rounded-lg">
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="flex flex-col h-full md:h-screen">
        <div className="flex items-center h-[60px] px-4 border-b border-[#232E3C] bg-[#17212B]">
            <h2 className="text-gray-100 font-medium text-sm md:text-base">
                {selectedUser || 'Select a user to chat with'}
            </h2>
            <div className="ml-auto flex items-center gap-2">
                <button
                    onClick={() => setIsEncrypted(!isEncrypted)}
                    className={`p-2 rounded-full transition-colors ${
                        isEncrypted 
                            ? 'text-[#64B3F4] hover:bg-[#202B36]' 
                            : 'text-[#6C7883] hover:bg-[#202B36]'
                    }`}
                >
                    {isEncrypted ? <RiLockLine size={20} /> : <RiLockUnlockLine size={20} />}
                </button>
            </div>
        </div>
        
        <div 
            className="flex-1 p-2 md:p-4 overflow-y-auto custom-scrollbar"
            ref={messagesContainerRef}
        >
            {selectedUser ? (
                messages.length > 0 ? (
                    <div className="space-y-2">
                        {messages.map((msg, index) => {
                            const isOwnMessage = msg.sender === currentUser;
                            const isIntegrityValid = checkMessageIntegrity(msg);
                            
                            return (
                                <div
                                    key={index}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[90%] md:max-w-[75%] p-2 md:p-3 rounded-lg ${
                                            isOwnMessage 
                                                ? 'bg-[#2B5278] text-white' 
                                                : 'bg-[#182533] text-white'
                                        } ${!isIntegrityValid ? 'border border-[#FFA033]' : ''}`}
                                    >
                                        <div className="break-words text-[13px] md:text-[15px]">
                                            {msg.content}
                                            <div className="flex items-center gap-1 mt-1 opacity-70">
                                                {msg.encrypted && (
                                                    <RiLockLine size={14} />
                                                )}
                                                {!isIntegrityValid && (
                                                    <RiAlertLine size={14} className="text-[#FFA033]" />
                                                )}
                                                <span className="text-xs ml-auto">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[#6C7883]">No messages yet. Start a conversation!</p>
                    </div>
                )
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-[#6C7883]">Select a user to start messaging</p>
                </div>
            )}
            
            {isTyping && selectedUser && <TypingIndicator />}
        </div>
        
        <div className="p-2 md:p-4 bg-[#17212B]">
            <div className="flex items-center bg-[#242F3D] rounded-lg">
                <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedUser ? "Write a message..." : "Select a user to chat with"}
                    disabled={!selectedUser}
                    className="flex-1 bg-transparent border-0 outline-none px-2 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-100 placeholder-[#6C7883]"
                />
                <button 
                    onClick={handleSendButtonClick}
                    disabled={!selectedUser || !messageInput.trim()}
                    className={`mx-2 p-2 rounded-full ${
                        selectedUser && messageInput.trim() 
                            ? 'text-[#64B3F4] hover:bg-[#202B36]' 
                            : 'text-[#6C7883] cursor-not-allowed'
                    }`}
                >
                    <RiSendPlane2Fill size={20} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default Chat;
