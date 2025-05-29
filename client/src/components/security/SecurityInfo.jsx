import { useState } from 'react';
import { formatKey } from '../../utils/crypto';

const SecurityInfo = ({ userKeys }) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [activeTab, setActiveTab] = useState('keys');
  
  if (!userKeys) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Security Information</h2>
          <p className="text-center text-gray-500">No security keys available. Please log in first.</p>
        </div>
      </section>
    );
  }
  
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-notion-blue/10 to-notion-purple/10 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-notion-blue" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Security Information</h2>
          </div>
          
          <div className="flex mt-6 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('keys')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'keys' 
                  ? 'text-notion-blue border-b-2 border-notion-blue' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Encryption Keys
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'info' 
                  ? 'text-notion-blue border-b-2 border-notion-blue' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Security Info
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Your Public Key</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">This key is shared with others so they can encrypt messages to you.</p>
                <pre className="bg-white p-4 rounded-md font-mono text-xs text-gray-700 overflow-x-auto border border-gray-200">{formatKey(userKeys.publicKey)}</pre>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Your Private Key</h3>
                  </div>
                  
                  <button 
                    className="flex items-center text-sm font-medium px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                        Hide Key
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Show Key
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mb-3">
                  <span className="text-yellow-600 font-semibold">Sensitive:</span> This key decrypts messages encrypted with your public key.
                </p>
                
                {showPrivateKey ? (
                  <pre className="bg-white p-4 rounded-md font-mono text-xs text-gray-700 overflow-x-auto border border-gray-200">{formatKey(userKeys.privateKey)}</pre>
                ) : (
                  <div className="bg-white p-4 rounded-md border border-gray-200 text-center">
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Private key is hidden for security</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
                 
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">About RSA Encryption</h3>
                <p className="text-sm text-blue-700">
                  Your messages are secured with RSA encryption, a public-key cryptosystem
                  that enables secure communication by using a pair of keys:
                </p>
                <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                  <li>Public key: Used to encrypt messages sent to you</li>
                  <li>Private key: Used to decrypt messages you receive</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-semibold text-green-700">End-to-End Encryption</h3>
                </div>
                <p className="text-sm text-green-700 ml-7">
                  Your messages are encrypted on your device and only decrypted on the recipient's device.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-semibold text-yellow-700">Security Tips</h3>
                </div>
                <ul className="ml-7 mt-1 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Never share your private key with anyone</li>
                  <li>Only exchange messages with users who have verified certificates</li>
                  <li>Check message integrity indicators for possible tampering</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SecurityInfo;
