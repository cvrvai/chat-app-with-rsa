import socketio
import time
from colorama import init, Fore, Style
import json
import base64

# Initialize colorama for colored terminal output
init()

# Create a Socket.IO client instance
sio = socketio.Client(logger=True)  # Enable logging for debugging

# Store intercepted messages
intercepted_messages = []

# Track if tampering mode is active
tampering_active = False

def on_connect():
    print(f"{Fore.GREEN}[+] Connected to the messaging server as an attacker{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}[*] Listening for messages...{Style.RESET_ALL}")
    # Enable tampering mode on connect
    sio.emit('set_tampering_mode', {'active': True})
    # Request any existing messages
    sio.emit('request_intercept')

def on_disconnect():
    print(f"{Fore.RED}[-] Disconnected from server{Style.RESET_ALL}")

def on_intercepted_messages(data):
    """Handle bulk intercepted messages from server"""
    messages = data.get('messages', [])
    if messages:
        print(f"\n{Fore.YELLOW}[+] Fetched {len(messages)} existing messages{Style.RESET_ALL}")
        for msg in messages:
            process_message(msg)

def process_message(data):
    """Process an intercepted message"""
    message = data.get('message', '')
    if not data.get('encrypted', False):
        print(f"\n{Fore.RED}[!] UNENCRYPTED MESSAGE:{Style.RESET_ALL}")
        print(f"{Fore.CYAN}From: {data.get('sender', 'Unknown')}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}To: {data.get('recipient', 'Unknown')}{Style.RESET_ALL}")
        print(f"{Fore.WHITE}{message}{Style.RESET_ALL}")
        return True
    else:
        print(f"\n{Fore.GREEN}[+] ENCRYPTED MESSAGE{Style.RESET_ALL}")
        print(f"{Fore.CYAN}From: {data.get('sender', 'Unknown')}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}To: {data.get('recipient', 'Unknown')}{Style.RESET_ALL}")
        print(f"{Fore.BLUE}Encrypted data: {message[:30]}...{Style.RESET_ALL}")
        return False

def on_new_message(data):
    """
    Intercept and analyze messages passing through the server
    """
    intercepted_messages.append(data)
    
    print(f"\n{Fore.YELLOW}[*] Intercepted Message:{Style.RESET_ALL}")
    if process_message(data) and tampering_active:
        # If message is not encrypted and tampering is active, modify it
        message = data.get('message', '')
        tampered_msg = f"[HACKED] {message}"
        data['message'] = tampered_msg
        data['original_message'] = message  # Store original for server logging
        print(f"{Fore.RED}[!] Message tampered to: {tampered_msg}{Style.RESET_ALL}")
        
        # Forward tampered message
        sio.emit('tampered_message', data)

# Register event handlers
sio.on('connect', on_connect)
sio.on('disconnect', on_disconnect)
sio.on('new_message', on_new_message)
sio.on('intercepted_messages', on_intercepted_messages)

def start_attack():
    """
    Start the MITM attack simulation
    """
    global tampering_active
    
    print(f"{Fore.RED}=== Man-in-the-Middle Attack Simulator ==={Style.RESET_ALL}")
    print(f"{Fore.YELLOW}[*] Connecting to messaging server...{Style.RESET_ALL}")
    
    try:
        # Connect to the messaging server
        sio.connect('http://localhost:5000')
        
        while True:
            command = input(f"\n{Fore.YELLOW}Attack Console > {Style.RESET_ALL}").lower()
            
            if command == 'q' or command == 'quit':
                break
            elif command == 'h' or command == 'help':
                print("\nCommands:")
                print("  h, help   - Show this help message")
                print("  s, stats  - Show attack statistics")
                print("  c, clear  - Clear intercepted messages")
                print("  t, toggle - Toggle message tampering")
                print("  f, fetch  - Fetch existing messages from server")
                print("  q, quit   - Exit the attacker")
            elif command == 's' or command == 'stats':
                total = len(intercepted_messages)
                encrypted = sum(1 for m in intercepted_messages if m.get('encrypted', False))
                unencrypted = total - encrypted
                
                print(f"\n{Fore.YELLOW}Attack Statistics:{Style.RESET_ALL}")
                print(f"Total messages intercepted: {total}")
                print(f"Encrypted messages: {encrypted}")
                print(f"Unencrypted (readable) messages: {unencrypted}")
                print(f"Tampering active: {tampering_active}")
            elif command == 'c' or command == 'clear':
                intercepted_messages.clear()
                print(f"{Fore.GREEN}[+] Cleared intercepted messages{Style.RESET_ALL}")
            elif command == 't' or command == 'toggle':
                tampering_active = not tampering_active
                sio.emit('set_tampering_mode', {'active': tampering_active})
                status = "enabled" if tampering_active else "disabled"
                print(f"{Fore.YELLOW}[*] Message tampering {status}{Style.RESET_ALL}")
            elif command == 'f' or command == 'fetch':
                print(f"{Fore.YELLOW}[*] Requesting stored messages from server...{Style.RESET_ALL}")
                sio.emit('request_intercept')
    
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}[*] Attack terminated by user{Style.RESET_ALL}")
    except Exception as e:
        print(f"{Fore.RED}[-] Error: {str(e)}{Style.RESET_ALL}")
    finally:
        if sio.connected:
            sio.disconnect()

if __name__ == "__main__":
    start_attack()
