// components/LiveChat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SendIcon } from './icons';

/* lightweight type kept local to avoid cross-file type issues */
export type LiveStudioChatMessage = {
  id: string;
  senderEmail: string;
  senderName: string;
  text: string;
  timestamp: number;
};

interface LiveChatProps {
  // controlled mode (LiveStudio passes messages/onSend/onClear)
  messages: LiveStudioChatMessage[]; // Now required (always controlled)
  onSend: (text: string) => void;   // Now required
  onClear: () => void;              // Now required

  currentUserEmail: string;
  currentUserName: string;
}

const LiveChat: React.FC<LiveChatProps> = ({
  messages,
  onSend,
  onClear,
  currentUserEmail,
  currentUserName,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submitMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    // Delegate to parent (LiveStudio) which handles the DB service call
    onSend(newMessage.trim());

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <div className="p-3 border-b dark:border-slate-700 flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Live Session Chat</h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClear} className="text-xs text-slate-400 hover:text-red-500">Clear History</button>
        </div>
      </div>

      <div className="flex-grow p-3 space-y-3 overflow-y-auto min-h-[100px]">
        {messages.length === 0 && <div className="text-sm text-slate-500">No messages yet.</div>}
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

      <form onSubmit={(e) => { e.preventDefault(); submitMessage(); }} className="p-2 border-t dark:border-slate-700 flex items-center space-x-2 flex-shrink-0">
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