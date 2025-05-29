import { useState, useEffect } from 'react'
import Header from './components/layout/Header'
import Login from './components/auth/Login'
import UsersList from './components/chat/UsersList'
import Chat from './components/chat/Chat'
import SecurityInfo from './components/security/SecurityInfo'
import UserProfile from './components/profile/UserProfile'
import socket from './services/socket'
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [userKeys, setUserKeys] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState({});

  useEffect(() => {
    // Handle verified user updates
    const handleVerifiedUsersUpdate = (data) => {
      setVerifiedUsers(data.verified_users || {});
    };

    socket.on('verified_users_updated', handleVerifiedUsersUpdate);

    return () => {
      socket.off('verified_users_updated', handleVerifiedUsersUpdate);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.username);
    setUserKeys({
      publicKey: userData.publicKey,
      privateKey: userData.privateKey,
      certificate: userData.certificate,
      caPublicKey: userData.caPublicKey
    });
  };

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
  };

  const toggleSecurityInfo = () => {
    setShowSecurityInfo(!showSecurityInfo);
  };

  const handleLogout = () => {
    setUser(null);
    setUserKeys(null);
    setSelectedUser(null);
    setShowSecurityInfo(false);
    setShowProfile(false);
    socket.emit('user_logout'); // Add this event handler on your server
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setShowSecurityInfo(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#17212B]">
      {user && (
        <Header 
          currentUser={user} 
          onToggleSecurityInfo={toggleSecurityInfo} 
          onToggleProfile={toggleProfile}
        />
      )}
      <main className="flex-1 flex">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : showSecurityInfo ? (
          <SecurityInfo userKeys={userKeys} />
        ) : showProfile ? (
          <UserProfile 
            username={user}
            onLogout={handleLogout}
            onViewSecurity={() => {
              setShowSecurityInfo(true);
              setShowProfile(false);
            }}
          />
        ) : (
          <div className="flex flex-1">
            <div className="w-[320px] border-r border-[#232E3C] bg-[#17212B]">
              <UsersList 
                currentUser={user}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                verifiedUsers={verifiedUsers}
              />
            </div>
            <div className="flex-1 bg-[#0E1621]">
              <Chat 
                currentUser={user}
                selectedUser={selectedUser}
                userKeys={userKeys}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
