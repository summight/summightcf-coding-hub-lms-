// components/CollaborativeIDE.tsx

import React, { useState, useEffect, useRef } from 'react';
import { CodeBracketIcon, CursorArrowRaysIcon } from './icons';

interface CollaborativeIDEProps {
  code: string;
  allowedCoders: string[];
  currentUserId: string;
  onCodeChange: (code: string) => void;
  cursors: Record<string, any>;
  contributions: Record<string, { code: string; timestamp: number }>;
}

const CollaborativeIDE: React.FC<CollaborativeIDEProps> = ({
  code,
  allowedCoders,
  currentUserId,
  onCodeChange,
  cursors,
  contributions,
}) => {
  const [editorValue, setEditorValue] = useState(code);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setEditorValue(code);
  }, [code]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editorValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditorValue(newValue);
    setIsTyping(true);

    // Debounce onCodeChange
    const timeoutId = setTimeout(() => {
      onCodeChange(newValue);
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const canEdit = allowedCoders.includes(currentUserId) || isTyping;  // Local typing always allowed

  // Cursor position simulation (for real, use Realtime)
  const renderCursors = () => {
    if (!textareaRef.current) return null;
    return Object.entries(cursors).map(([userId, cursor]) => (
      <div
        key={userId}
        className="absolute bg-blue-500 w-1 h-4 rounded"
        style={{
          left: cursor.x,
          top: cursor.y,
          transform: 'translateY(-50%)',
        }}
        title={cursor.userName}
      >
        <div className="absolute -top-8 bg-black text-white px-1 py-0.5 rounded text-xs whitespace-nowrap">
          {cursor.userName}
        </div>
      </div>
    ));
  };

  return (
    <div className="relative bg-slate-900 rounded p-3">
      <div className="flex items-center space-x-2 mb-2">
        <CodeBracketIcon className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-400">Collaborative Code Editor</span>
        {canEdit ? (
          <span className="ml-auto text-xs text-green-400">Editing</span>
        ) : (
          <span className="ml-auto text-xs text-slate-400">View Only</span>
        )}
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={editorValue}
          onChange={handleChange}
          disabled={!canEdit}
          className={`w-full bg-slate-800 text-white p-2 rounded border-none focus:outline-none resize-none font-mono text-sm ${
            !canEdit ? 'cursor-not-allowed opacity-60' : ''
          }`}
          placeholder="// Type your code here..."
          style={{ minHeight: '200px' }}
        />
        {renderCursors()}
        {/* Contributions Log */}
        <div className="mt-2 text-xs text-slate-500 max-h-20 overflow-y-auto">
          {Object.entries(contributions)
            .sort(([,a], [,b]) => b.timestamp - a.timestamp)
            .slice(0, 3)
            .map(([userId, contrib]) => (
              <div key={userId} className="flex items-center space-x-1">
                <CursorArrowRaysIcon className="w-3 h-3" />
                <span>{userId}: {contrib.code.slice(0, 50)}...</span>
                <span className="text-slate-600 ml-auto">{new Date(contrib.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeIDE;