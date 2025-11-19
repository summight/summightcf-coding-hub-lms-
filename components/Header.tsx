// components/Header.tsx
import React from 'react';

interface HeaderProps {
  onLogout: () => void;
  isAdmin: boolean;
  userName: string;
  userAvatar?: string;
  onNavigateToLiveStudio: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onLogout,
  isAdmin,
  userName,
  userAvatar,
  onNavigateToLiveStudio,
}) => {
  // Temporarily hardcode isLive = false until we build the API
  const isLive = false;

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isAdmin ? 'Admin Portal' : 'Student Dashboard'}
            </h1>
            {isLive && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                ● Live
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isLive && (
              <button
                onClick={onNavigateToLiveStudio}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition"
              >
                Join Live Session
              </button>
            )}
            <div className="flex items-center space-x-3">
              {userAvatar ? (
                <img className="h-10 w-10 rounded-full object-cover border-2 border-slate-300" src={userAvatar} alt={userName} />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {userName}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;