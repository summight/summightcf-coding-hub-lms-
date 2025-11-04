import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, AdminChatMessage } from '../types';

type AllChats = Record<string, AdminChatMessage[]>;

const CHAT_STORAGE_KEY = 'adminChats';

const UserAvatar: React.FC<{ name?: string; avatar?: string; size?: 'small' | 'large' }> = ({ name, avatar, size = 'small' }) => {
    const sizeClasses = size === 'small' ? 'w-10 h-10 text-base' : 'w-16 h-16 text-2xl';
    if (avatar) {
        return <img src={avatar} alt={name || 'User Avatar'} className={`${sizeClasses} rounded-full object-cover`} />;
    }
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className={`${sizeClasses} rounded-full bg-slate-400 flex items-center justify-center text-white font-bold`}>
            {initial}
        </div>
    );
};


const AdminChat: React.FC = () => {
    const [allUsers, setAllUsers] = useState<Record<string, User>>({});
    const [allChats, setAllChats] = useState<AllChats>({});
    const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const loadData = useCallback(() => {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const chats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '{}');
        setAllUsers(users);
        setAllChats(chats);
    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, [loadData]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allChats, selectedUserEmail]);

    const handleSelectUser = (email: string) => {
        setSelectedUserEmail(email);
        // Mark messages as read
        setAllChats(prev => {
            const userChat = prev[email] || [];
            const updatedChat = userChat.map(msg => msg.sender === email ? { ...msg, read: true } : msg);
            const newAllChats = { ...prev, [email]: updatedChat };
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newAllChats));
            return newAllChats;
        });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedUserEmail) return;

        const newMessage: AdminChatMessage = {
            sender: 'admin',
            text: message,
            timestamp: Date.now(),
            read: true,
        };
        
        const updatedChats = {
            ...allChats,
            [selectedUserEmail]: [...(allChats[selectedUserEmail] || []), newMessage]
        };

        setAllChats(updatedChats);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedChats));
        setMessage('');
    };

    // FIX: Cast object entry values to `User` type to resolve properties.
    const sortedUsers = Object.entries(allUsers).sort(([, a], [, b]) => (a as User).name.localeCompare((b as User).name));
    const selectedUser = selectedUserEmail ? allUsers[selectedUserEmail] : null;
    const currentChat = selectedUserEmail ? allChats[selectedUserEmail] || [] : [];
    
    const countUnread = (email: string) => {
        return (allChats[email] || []).filter(msg => msg.sender === email && !msg.read).length;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="flex flex-grow overflow-hidden">
                {/* User List */}
                <aside className="w-1/3 border-r dark:border-slate-700 flex flex-col">
                    <div className="p-4 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">Students</h2>
                    </div>
                    <ul className="flex-grow overflow-y-auto">
                        {sortedUsers.map(([email, userData]) => {
                            const unreadCount = countUnread(email);
                            // FIX: Cast object entry value to `User` type to resolve properties.
                            const user = userData as User;
                            return (
                                <li key={email}>
                                    <button
                                        onClick={() => handleSelectUser(email)}
                                        className={`w-full text-left flex items-center gap-3 p-3 ${selectedUserEmail === email ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                    >
                                        <UserAvatar name={user.name} avatar={user.avatar} />
                                        <span className="flex-grow">{user.name}</span>
                                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </aside>
                {/* Chat Window */}
                <main className="w-2/3 flex flex-col">
                    {selectedUser ? (
                        <>
                            <div className="p-4 border-b dark:border-slate-700 flex items-center gap-3">
                                <UserAvatar name={selectedUser.name} avatar={selectedUser.avatar} />
                                <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {currentChat.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                            <p>{msg.text}</p>
                                            <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-slate-700">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="w-full bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </form>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-slate-500">
                            <p>Select a student to start chatting</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminChat;