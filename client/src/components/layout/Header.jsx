import { useState, useEffect } from 'react';
import lockIcon from '../../assets/lock-icon.svg';
import './Header.css';

const Header = ({ currentUser, onToggleSecurityInfo, onToggleProfile }) => {
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={`backdrop-blur-sm bg-white/95 transition-all duration-300 border-b ${
      scrolled ? 'shadow-md border-transparent' : 'border-gray-100'
    } sticky top-0 z-50`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-4 md:py-0 md:h-16">
          <div className="flex items-center group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-notion-blue to-notion-purple rounded-full blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
              <img 
                src={lockIcon} 
                alt="Lock Icon" 
                className="relative h-8 w-8 transition-transform duration-300 group-hover:rotate-12" 
              />
            </div>
            <h1 className="ml-3 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-notion-black to-gray-700">
              Secure Messaging
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center space-x-2 md:space-x-4 mt-2 md:mt-0">
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              currentUser 
                ? 'bg-green-50 text-green-700 border border-green-200 cursor-pointer hover:bg-green-100' 
                : 'bg-gray-50 text-gray-500 border border-gray-200'
            }`}
              onClick={onToggleProfile}
            >
              {currentUser ? currentUser : 'Not logged in'}
            </div>
            
            {currentUser && (
              <button 
                className="relative px-4 py-1.5 rounded-full text-sm font-medium text-white overflow-hidden group"
                onClick={onToggleSecurityInfo}
              >
                <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out bg-gradient-to-r from-notion-blue to-notion-purple group-hover:bg-gradient-to-r group-hover:from-notion-blue group-hover:via-notion-purple group-hover:to-notion-blue bg-size-200 bg-pos-0 group-hover:bg-pos-100"></span>
                <span className="relative flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Security Info</span>
                  <span className="inline sm:hidden">Security</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
