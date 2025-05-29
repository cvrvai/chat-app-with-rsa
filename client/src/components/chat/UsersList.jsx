import { useEffect, useState } from 'react';
import socket from '../../services/socket';
import { RiCheckLine, RiUserLine, RiSearchLine } from 'react-icons/ri';


const UsersList = ({ currentUser, selectedUser, onSelectUser, verifiedUsers }) => {
    const [users, setUsers] = useState([]);    useEffect(() => {
        // Listen for user list updates
        const handleUserListUpdate = (data) => {
            setUsers(data.users);
        };

        socket.on('user_list_updated', handleUserListUpdate);

        // Fetch initial user list
        fetch('http://localhost:5000/api/users')
            .then(response => response.json())
            .then(data => setUsers(data.users))
            .catch(error => console.error('Error fetching users:', error));

        return () => {
            socket.off('user_list_updated', handleUserListUpdate);
        };
    }, []);return (
        <div className="h-full flex flex-col">
            <div className="p-2 md:p-3 border-b border-[#232E3C]">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 md:pl-3 flex items-center pointer-events-none">
                        <RiSearchLine className="h-3 w-3 md:h-4 md:w-4 text-[#6C7883]" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="block w-full pl-7 md:pl-9 pr-2 md:pr-3 py-1.5 md:py-2 bg-[#242F3D] border border-[#242F3D] rounded-md text-xs md:text-sm text-gray-200 placeholder-[#6C7883] focus:outline-none focus:border-[#3A4B5B] focus:ring-0"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {users
                    .filter(user => user !== currentUser)
                    .map(user => (
                        <div 
                            key={user} 
                            className={`py-2 md:py-3 px-3 md:px-4 flex items-center gap-2 md:gap-3 cursor-pointer transition-colors ${
                                selectedUser === user 
                                    ? 'bg-[#2B5278]' 
                                    : 'hover:bg-[#202B36]'
                            }`}
                            onClick={() => onSelectUser(user)}
                        >
                            <div className="h-8 w-8 md:h-12 md:w-12 rounded-full flex items-center justify-center bg-[#4C5B6B] text-[#9AA3AD] flex-shrink-0">
                                <RiUserLine className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center">
                                    <span className="text-sm md:text-[15px] text-gray-100 font-medium truncate">{user}</span>
                                    {verifiedUsers[user] && (
                                        <span className="ml-1 md:ml-1.5 text-[#64B3F4]">
                                            <RiCheckLine className="h-3 w-3 md:h-4 md:w-4" />
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs md:text-sm text-[#6C7883] truncate">Online</p>
                            </div>
                        </div>
                    ))}
                {users.length <= 1 && (
                    <div className="flex items-center justify-center h-24 md:h-32">
                        <p className="text-xs md:text-sm text-[#6C7883]">No other users online</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersList;
