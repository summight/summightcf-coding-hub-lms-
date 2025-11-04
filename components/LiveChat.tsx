import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LiveStudioChatMessage } from '../types';
import { SendIcon } from './icons';

interface LiveChatProps {
    currentUserEmail: string;
    currentUserName: string;
}

const LIVE_CHAT_KEY = 'liveStudioChat';

const LiveChat: React.FC<LiveChatProps> = ({ currentUserEmail, currentUserName }) => {
    const [messages, setMessages] = useState<LiveStudioChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleStorageChange = useCallback((event: StorageEvent) => {
        if (event.key === LIVE_CHAT_KEY && event.newValue) {
            setMessages(JSON.parse(event.newValue));
        }
    }, []);

    useEffect(() => {
        const storedMessages = localStorage.getItem(LIVE_CHAT_KEY);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [handleStorageChange]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message: LiveStudioChatMessage = {
            id: `${Date.now()}-${currentUserEmail}`,
            senderEmail: currentUserEmail,
            senderName: currentUserName,
            text: newMessage,
            timestamp: Date.now(),
        };

        const updatedMessages = [...messages, message];
        localStorage.setItem(LIVE_CHAT_KEY, JSON.stringify(updatedMessages));
        setMessages(updatedMessages);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 p-3 border-b dark:border-slate-700">Live Session Chat</h3>
            <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <div className="flex items-baseline gap-2">
                           <span className={`text-sm font-semibold ${msg.senderEmail === currentUserEmail ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                {msg.senderName}:
                            </span>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 <div ref={chatEndRef} />
            </div>
             <form onSubmit={handleSendMessage} className="p-2 border-t dark:border-slate-700 flex items-center space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type..."
                    className="flex-grow bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50" disabled={!newMessage.trim()}>
                    <SendIcon className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default LiveChat;
