import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onLogout: () => void;
  isAdmin: boolean;
  userName?: string;
  userAvatar?: string;
  onNavigateToLiveStudio?: () => void;
}

const UserAvatar: React.FC<{ name?: string; avatar?: string }> = ({ name, avatar }) => {
    if (avatar) {
        return <img src={avatar} alt={name || 'User Avatar'} className="w-10 h-10 rounded-full object-cover" />;
    }
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
            {initial}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onLogout, isAdmin, userName, userAvatar, onNavigateToLiveStudio }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href={isAdmin ? '#' : "https://tech.summightcf.com.ng"} className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">SummightCF Coding Hub</span>
           {isAdmin && (
            <span className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full">Admin</span>
          )}
        </a>
        <nav className="flex items-center space-x-4">
            {!isAdmin && (
              <>
                <button
                    onClick={onNavigateToLiveStudio}
                    className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors"
                >
                    Live Studio
                </button>
                <a href="https://summightcf.com.ng" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Main Site</a>
              </>
            )}
            
            {isAdmin ? (
                <button
                    onClick={onLogout}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Logout
                </button>
            ) : (
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500">
                        <UserAvatar name={userName} avatar={userAvatar} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-600">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{userName}</p>
                            </div>
                            <button
                                onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
