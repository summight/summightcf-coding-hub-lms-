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
  messages?: LiveStudioChatMessage[];
  onSend?: (text: string) => void;
  onClear?: () => void;

  // optional fallback/context if used standalone
  currentUserEmail?: string;
  currentUserName?: string;
}

const LIVE_CHAT_KEY = 'liveStudioChat';

const LiveChat: React.FC<LiveChatProps> = ({
  messages: controlledMessages,
  onSend,
  onClear,
  currentUserEmail = 'anonymous@local',
  currentUserName = 'Anonymous',
}) => {
  const isControlled = Array.isArray(controlledMessages);
  const [internalMessages, setInternalMessages] = useState<LiveStudioChatMessage[]>(() => {
    try {
      const s = localStorage.getItem(LIVE_CHAT_KEY);
      return s ? JSON.parse(s) as LiveStudioChatMessage[] : [];
    } catch {
      return [];
    }
  });
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Sync controlled -> internal for display convenience
  useEffect(() => {
    if (isControlled) return;
    const stored = localStorage.getItem(LIVE_CHAT_KEY);
    if (stored) {
      setInternalMessages(JSON.parse(stored));
    }
  }, [isControlled]);

  // Listen to storage events when uncontrolled so multiple tabs sync
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (!isControlled && event.key === LIVE_CHAT_KEY && event.newValue) {
      setInternalMessages(JSON.parse(event.newValue));
    }
  }, [isControlled]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleStorageChange]);

  const messages = isControlled ? (controlledMessages as LiveStudioChatMessage[]) : internalMessages;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submitMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: LiveStudioChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      senderEmail: currentUserEmail,
      senderName: currentUserName,
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    if (isControlled) {
      // delegate to parent
      onSend?.(msg.text);
    } else {
      const next = [...internalMessages, msg];
      setInternalMessages(next);
      localStorage.setItem(LIVE_CHAT_KEY, JSON.stringify(next));
    }

    setNewMessage('');
  };

  const handleClear = () => {
    if (isControlled) {
      onClear?.();
    } else {
      setInternalMessages([]);
      localStorage.removeItem(LIVE_CHAT_KEY);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <div className="p-3 border-b dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Live Session Chat</h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleClear} className="text-xs text-slate-400 hover:text-red-500">Clear</button>
        </div>
      </div>

      <div className="flex-grow p-3 space-y-3 overflow-y-auto">
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

      <form onSubmit={(e) => { e.preventDefault(); submitMessage(); }} className="p-2 border-t dark:border-slate-700 flex items-center space-x-2">
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
