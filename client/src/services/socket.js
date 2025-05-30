import { io } from 'socket.io-client';

// Create a socket connection to the Flask backend server
// Make sure the Flask server is running on port 5000
const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  upgrade: true,
  rememberUpgrade: true
});

// Log connection events for debugging
socket.on('connect', () => {
  console.log('Connected to Flask backend');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from Flask backend');
});

export default socket;
