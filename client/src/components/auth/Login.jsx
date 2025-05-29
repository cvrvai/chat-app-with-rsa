import { useState } from 'react';
import socket from '../../services/socket';
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);
        
        // Register the user with the server
        socket.emit('register_user', { user_id: username });

        // Set up listener for key generation response
        socket.once('key_generated', (data) => {
            const userData = {
                username,
                publicKey: data.public_key,
                privateKey: data.private_key,
                certificate: data.certificate,
                caPublicKey: data.ca_public_key
            };
            
            setIsLoading(false);
            onLogin(userData);
        });
    };    
    
    return (
        <div className="min-h-screen min-w-full flex items-center justify-center bg-[#17212B] p-4">
            <div className="w-full max-w-[420px] bg-[#242F3D] rounded-xl shadow-2xl p-6 space-y-6">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-[#3A4B5B] rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#64B3F4]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-xl text-white font-medium">Secure Messaging</h2>
                    <p className="text-sm text-[#6C7883]">Enter your username to begin</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            disabled={isLoading}
                            className="w-full bg-[#17212B] text-gray-100 placeholder-[#6C7883] px-4 py-3 rounded-lg border border-[#3A4B5B] focus:outline-none focus:border-[#64B3F4] transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username.trim()}
                        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
                            isLoading || !username.trim()
                                ? 'bg-[#3A4B5B] text-[#6C7883] cursor-not-allowed'
                                : 'bg-[#64B3F4] hover:bg-[#5AA1E5] text-white'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating Keys...</span>
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>

                {isLoading && (
                    <p className="text-center text-sm text-[#6C7883] animate-pulse">
                        Generating secure RSA keys for your session...
                    </p>
                )}
                
                <div className="flex items-center justify-center text-xs text-[#6C7883] mt-4">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Protected with RSA encryption
                </div>
            </div>
        </div>
    );
};

export default Login;
