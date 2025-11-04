import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdminChatMessage } from '../types';
import { ChatBubbleLeftRightIcon, SendIcon } from './icons';
import Notification from './Notification';
import useNotificationSound from '../hooks/useNotificationSound';


interface UserChatProps {
    userEmail: string;
    userName: string;
}

type AllChats = Record<string, AdminChatMessage[]>;
const CHAT_STORAGE_KEY = 'adminChats';

const UserChat: React.FC<UserChatProps> = ({ userEmail, userName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<AdminChatMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notification, setNotification] = useState<string | null>(null);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const prevUnreadCountRef = useRef(0);
    const playNotificationSound = useNotificationSound();

    const loadChat = useCallback(() => {
        const allChats: AllChats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '{}');
        const userChat = allChats[userEmail] || [];
        setChatHistory(userChat);
        setUnreadCount(userChat.filter(msg => msg.sender === 'admin' && !msg.read).length);
    }, [userEmail]);

    useEffect(() => {
        loadChat();
        window.addEventListener('storage', loadChat);
        return () => window.removeEventListener('storage', loadChat);
    }, [loadChat]);

    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            markAsRead();
        }
    }, [chatHistory, isOpen]);
    
    useEffect(() => {
        if (unreadCount > prevUnreadCountRef.current) {
            setNotification("You have a new message from the admin!");
            playNotificationSound();
        }
        prevUnreadCountRef.current = unreadCount;
    }, [unreadCount, playNotificationSound]);

    const markAsRead = () => {
        const allChats: AllChats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '{}');
        const userChat = allChats[userEmail] || [];
        const updatedChat = userChat.map(msg => msg.sender === 'admin' ? { ...msg, read: true } : msg);
        allChats[userEmail] = updatedChat;
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allChats));
        setUnreadCount(0);
    };

    const handleToggleChat = () => {
        if (!isOpen) {
            markAsRead();
        }
        setIsOpen(!isOpen);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newMessage: AdminChatMessage = {
            sender: userEmail,
            text: message,
            timestamp: Date.now(),
            read: false, // Admin has not read it yet
        };

        const allChats: AllChats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '{}');
        const updatedChat = [...(allChats[userEmail] || []), newMessage];
        allChats[userEmail] = updatedChat;
        
        setChatHistory(updatedChat);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(allChats));
        setMessage('');
    };

    return (
        <>
            {!isOpen ? (
                <button
                    onClick={handleToggleChat}
                    className="fixed bottom-8 left-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50"
                    aria-label="Open Admin Chat"
                >
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-blue-600">{unreadCount}</span>
                    )}
                </button>
            ) : (
                <div className="fixed bottom-8 left-8 w-full max-w-md h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
                    <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold">Chat with Admin</h3>
                        <button onClick={handleToggleChat} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl">&times;</button>
                    </div>
                    
                    <div ref={chatEndRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender !== 'admin' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-sm p-3 rounded-lg ${msg.sender !== 'admin' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask the admin..."
                            className="flex-grow bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50" disabled={!message.trim()}>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}
            {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
        </>
    );
};

export default UserChat;
