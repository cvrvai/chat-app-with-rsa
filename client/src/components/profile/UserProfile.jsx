import { RiShieldLine, RiLogoutBoxRLine, RiUserLine } from 'react-icons/ri';

const UserProfile = ({ username, onLogout, onViewSecurity }) => {
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-notion-blue/10 to-notion-purple/10">
          <div className="flex items-center justify-center">
            <div className="h-24 w-24 bg-[#4C5B6B] rounded-full flex items-center justify-center">
              <RiUserLine className="h-12 w-12 text-[#9AA3AD]" />
            </div>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
            {username}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-red-600"
          >
            <RiLogoutBoxRLine className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
