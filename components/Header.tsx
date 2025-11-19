// components/Header.tsx
import React, { useState, useEffect } from 'react';
import { getActiveSession } from '../dbService';

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
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkLive = async () => {
      const session = await getActiveSession();
      setIsLive(!!session);
    };
    checkLive();
    const interval = setInterval(checkLive, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isAdmin ? 'Admin Portal' : 'Student Dashboard'}
            </h1>
            {isLive && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Live
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isLive && (
              <button
                onClick={onNavigateToLiveStudio}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Join Live
              </button>
            )}
            <div className="flex items-center space-x-3">
              {userAvatar && (
                <img className="h-8 w-8 rounded-full" src={userAvatar} alt={userName} />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {userName}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
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