import socketio
import time
import base64
import json
import threading
import sys
import colorama
import random
import queue
from colorama import Fore, Style

# Initialize colorama for colored terminal output
colorama.init()

class Attacker:
    def __init__(self):
        self.sio = socketio.Client()
        self.intercepted_messages = []
        self.displayed_message_ids = set()  # Track which messages have been displayed
        self.processed_message_ids = set()  # Track which messages have been processed (to prevent forwarding)
        self.tamper_active = False  # Flag to enable/disable tampering
        self.message_queue = queue.Queue()  # Queue for messages waiting to be processed
        self.awaiting_tamper_input = False  # Flag to indicate if waiting for tamper input
        self.current_tamper_msg = None  # Current message being tampered with
        
        # Register event handlers
        self.sio.on('connect', self.on_connect)
        self.sio.on('disconnect', self.on_disconnect)
        self.sio.on('intercepted_messages', self.on_intercepted_messages)
    
    def on_connect(self):
        print(Fore.GREEN + "Connected to server as attacker!" + Style.RESET_ALL)
        print(Fore.YELLOW + "Commands: 't' - toggle tampering, 'q' - quit" + Style.RESET_ALL)
        # Start command thread
        threading.Thread(target=self.command_handler, daemon=True).start()
        
    def on_disconnect(self):
        print(Fore.RED + "Disconnected from server!" + Style.RESET_ALL)
    
    def command_handler(self):
        """Handle user commands while running"""
        while True:
            # If waiting for tamper input, process that instead of normal commands
            if self.awaiting_tamper_input:
                tamper_text = input(f"{Fore.YELLOW}Enter new message text (or 'skip' to leave unchanged): {Style.RESET_ALL}").strip()
                if tamper_text.lower() != 'skip':
                    if self.current_tamper_msg:
                        original_message = self.current_tamper_msg.get('message', '')
                        # Store original message for internal tracking
                        self.current_tamper_msg['original_message'] = original_message
                        # Replace the message text with the tampered version
                        self.current_tamper_msg['message'] = tamper_text
                        self.current_tamper_msg['tampered'] = True
                        
                        # Emit the tampered message back to the server
                        self.sio.emit('tampered_message', self.current_tamper_msg)
                        
                        print(f"{Fore.RED}TAMPERING with message: {original_message} -> {tamper_text}{Style.RESET_ALL}")
                        print(f"{Fore.GREEN}Tampered message forwarded to recipient.{Style.RESET_ALL}")
                    else:
                        print(f"{Fore.RED}No message to tamper with.{Style.RESET_ALL}")
                else:
                    # Forward original message without tampering
                    if self.current_tamper_msg:
                        print(f"{Fore.GREEN}Forwarding original message without tampering.{Style.RESET_ALL}")
                        self.sio.emit('tampered_message', self.current_tamper_msg)
                    else:
                        print(f"{Fore.RED}No message to forward.{Style.RESET_ALL}")
                
                # Reset tampering state
                self.awaiting_tamper_input = False
                self.current_tamper_msg = None
                
                # Process next message in queue if available
                self.process_message_queue()
            else:
                # Regular command processing
                cmd = input().strip().lower()
                if cmd == 't':
                    self.tamper_active = not self.tamper_active
                    status = "ENABLED" if self.tamper_active else "DISABLED"
                    print(f"{Fore.YELLOW}Message tampering {status}{Style.RESET_ALL}")
                    
                    # Notify server about tampering mode change
                    self.sio.emit('set_tampering_mode', {'active': self.tamper_active})
                elif cmd == 'q':
                    print(f"{Fore.RED}Exiting...{Style.RESET_ALL}")
                    sys.exit(0)
    
    def process_message_queue(self):
        """Process the next message in the queue if tampering is active"""
        if self.tamper_active and not self.awaiting_tamper_input and not self.message_queue.empty():
            msg = self.message_queue.get()
            
            # Only offer tampering for unencrypted messages
            if not msg.get('encrypted', False) and 'message' in msg:
                print(f"\n{Fore.YELLOW}Message intercepted:{Style.RESET_ALL}")
                print(f"  {Fore.GREEN}From:{Style.RESET_ALL} {msg.get('sender', 'Unknown')}")
                print(f"  {Fore.GREEN}To:{Style.RESET_ALL} {msg.get('recipient', 'Unknown')}")
                print(f"  {Fore.GREEN}Message:{Style.RESET_ALL} {msg.get('message', '')}")
                
                self.awaiting_tamper_input = True
                self.current_tamper_msg = msg
            else:
                # For encrypted messages, just forward them
                self.sio.emit('tampered_message', msg)
                print(f"{Fore.RED}Encrypted message forwarded (cannot be tampered).{Style.RESET_ALL}")
                
                # Process next message
                self.process_message_queue()
    
    def get_message_id(self, msg):
        """Generate a unique ID for a message"""
        return f"{msg.get('sender', '')}_{msg.get('recipient', '')}_{msg.get('timestamp', '')}_{msg.get('message', '')}"
    
    def on_intercepted_messages(self, data):
        new_messages = []
        for msg in data['messages']:
            # Create a unique ID for each message
            msg_id = self.get_message_id(msg)
            
            # Only process messages we haven't seen before
            if msg_id not in self.displayed_message_ids and msg_id not in self.processed_message_ids:
                self.displayed_message_ids.add(msg_id)
                
                # If tampering is active, queue message for tampering and mark as processed
                if self.tamper_active:
                    # Mark message as processed to prevent server from delivering it directly
                    self.processed_message_ids.add(msg_id)
                    
                    # Indicate to server that we're intercepting this message
                    self.sio.emit('intercept_message', {
                        'message_id': msg_id,
                        'intercepted': True
                    })
                    
                    # Queue for manual tampering
                    self.message_queue.put(msg)
                    new_messages.append(msg)
                else:
                    # If tampering is not active, allow message through
                    new_messages.append(msg)
                
        # Update our stored messages with new ones
        self.intercepted_messages.extend(new_messages)
        
        # Only display if there are new messages
        if new_messages:
            self.display_intercepted_messages(new_messages)
            
            # Start processing the message queue if tampering is active
            if self.tamper_active and not self.awaiting_tamper_input:
                self.process_message_queue()
    
    def display_intercepted_messages(self, messages_to_display):
        """Display intercepted messages"""
        print("\n" + Fore.RED + "===== NEW INTERCEPTED MESSAGES =====" + Style.RESET_ALL)
        for idx, msg in enumerate(messages_to_display):
            sender = msg.get('sender', 'Unknown')
            recipient = msg.get('recipient', 'Unknown')
            timestamp = msg.get('timestamp', 'Unknown time')
            
            if msg.get('encrypted', False):
                print(f"{idx+1}. {Fore.YELLOW}{sender} → {recipient} ({timestamp}){Style.RESET_ALL}")
                print(f"   {Fore.RED}[ENCRYPTED MESSAGE]{Style.RESET_ALL}")
                
                if msg.get('encrypted_message', ''):
                    print(f"   {Fore.BLUE}Encrypted data:{Style.RESET_ALL} {msg.get('encrypted_message', '')[:50]}...")
                
                if msg.get('signature', ''):
                    print(f"   {Fore.BLUE}Digital Signature:{Style.RESET_ALL} {msg.get('signature', '')[:50]}...")
                
                # Try to tamper with the message
                self.attempt_tampering_encrypted(msg, idx)
            else:
                content = msg.get('message', '[No content]')
                print(f"{idx+1}. {Fore.YELLOW}{sender} → {recipient} ({timestamp}){Style.RESET_ALL}")
                print(f"   {Fore.GREEN}Message:{Style.RESET_ALL} {content}")
                
                # For unencrypted, indicate tampering status
                if msg.get('tampered', False):
                    print(f"   {Fore.RED}[TAMPERED] This message was modified by attacker!{Style.RESET_ALL}")
                else:
                    if self.tamper_active:
                        print(f"   {Fore.YELLOW}[PENDING] Message intercepted - waiting for tampering decision{Style.RESET_ALL}")
                    else:
                        print(f"   {Fore.RED}[WARNING] Unencrypted message - can be easily read and modified!{Style.RESET_ALL}")
        
        if not messages_to_display:
            print(f"{Fore.BLUE}No new messages intercepted.{Style.RESET_ALL}")
            
        print(Fore.RED + "================================\n" + Style.RESET_ALL)
    
    def attempt_tampering_encrypted(self, msg, idx):
        """Simulate attempts to tamper with encrypted messages"""
        if msg.get('encrypted_message') and msg.get('signature'):
            print(f"   {Fore.YELLOW}Tampering attempt:{Style.RESET_ALL}")
            print(f"   {Fore.RED}[FAILED] Cannot read message content due to encryption{Style.RESET_ALL}")
            print(f"   {Fore.RED}[FAILED] Cannot modify message without detection (signature){Style.RESET_ALL}")
            print(f"   {Fore.GREEN}[PROTECTED] Message integrity and confidentiality preserved{Style.RESET_ALL}")
        else:
            print(f"   {Fore.RED}[WARNING] Message appears to be missing proper security{Style.RESET_ALL}")
    
    def start_interception(self):
        """Start intercepting messages"""
        try:
            self.sio.connect('http://localhost:5000')
            
            while True:
                try:
                    # Request new intercepted messages every few seconds
                    self.sio.emit('request_intercept')
                    time.sleep(3)
                except KeyboardInterrupt:
                    break
        
        except Exception as e:
            print(f"{Fore.RED}Error: {e}{Style.RESET_ALL}")
        finally:
            self.sio.disconnect()

if __name__ == "__main__":
    print(Fore.RED + "Starting MITM Attack Simulation..." + Style.RESET_ALL)
    print("This tool will intercept and analyze all messages passing through the server.")
    print(Fore.YELLOW + "Type 't' to toggle message tampering, 'q' to quit" + Style.RESET_ALL)
    print("When tampering is enabled, messages will be held for your inspection and modification.")
    print("Press Ctrl+C to exit.\n")
    
    attacker = Attacker()
    attacker.start_interception() 