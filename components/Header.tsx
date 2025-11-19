// components/Header.tsx - FINAL CLEAN VERSION
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
  // Live indicator will be added later when PHP API is ready
  const isLive = false;

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isAdmin ? 'Admin Portal' : 'Student Dashboard'}
            </h1>
            {isLive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                ● LIVE NOW
              </span>
            )}
          </div>

          <div className="flex items-center space-x-6">
            {isLive && (
              <button
                onClick={onNavigateToLiveStudio}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-lg"
              >
                Join Live Studio
              </button>
            )}

            <div className="flex items-center space-x-3">
              {userAvatar ? (
                <img className="h-10 w-10 rounded-full ring-2 ring-blue-500" src={userAvatar} alt={userName} />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {userName[0].toUpperCase()}
                </div>
              )}
              <span className="font-medium text-slate-700 dark:text-slate-300">{userName}</span>
            </div>

            <button
              onClick={onLogout}
              className="text-red-600 hover:text-red-800 font-medium transition"
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