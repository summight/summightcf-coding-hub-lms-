import React, { useState, useEffect, useRef } from 'react';
import { LiveStudioState, CodeContribution } from '../types';

const LIVE_STATE_KEY = 'liveStudioState';

interface CollaborativeIDEProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    isReadOnly: boolean;
    currentUserEmail: string;
    onCursorChange: (position: number) => void;
    cursors: LiveStudioState['cursors'];
}

const CURSOR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const getCursorColor = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};

const CollaborativeIDE: React.FC<CollaborativeIDEProps> = ({ code, onCodeChange, isReadOnly, currentUserEmail, onCursorChange, cursors }) => {
    const [lastCode, setLastCode] = useState(code);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (code !== lastCode && !isReadOnly) {
                trackContributions(lastCode, code);
                setLastCode(code);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [code, lastCode, isReadOnly]);

    const trackContributions = (oldCode: string, newCode: string) => {
        const insertions = newCode.length - oldCode.length > 0 ? newCode.length - oldCode.length : 0;
        const deletions = oldCode.length - newCode.length > 0 ? oldCode.length - newCode.length : 0;

        const storedState = localStorage.getItem(LIVE_STATE_KEY);
        if (storedState) {
            const state: LiveStudioState = JSON.parse(storedState);
            const userContribution = state.contributions[currentUserEmail] || { insertions: 0, deletions: 0, userEmail: currentUserEmail };
            const updatedContribution: CodeContribution = { ...userContribution, insertions: userContribution.insertions + insertions, deletions: userContribution.deletions + deletions };
            const newState: LiveStudioState = { ...state, contributions: { ...state.contributions, [currentUserEmail]: updatedContribution } };
            localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(newState));
        }
    };
    
    const handleSelectionChange = () => {
        if(textareaRef.current) {
            onCursorChange(textareaRef.current.selectionStart);
        }
    }

    // This is a simplified calculation and may not be perfectly accurate with all fonts/characters
    const getCursorPositionStyles = (position: number): React.CSSProperties => {
        if (!textareaRef.current) return { display: 'none' };
        
        const text = code.substring(0, position);
        const lines = text.split('\n');
        const lastLine = lines[lines.length - 1];
        
        const lineNum = lines.length - 1;
        const charNum = lastLine.length;

        // Approximation: assumes monospace font behavior
        const charWidth = 8.4; // approx width for 14px mono font
        const lineHeight = 21; // approx line height for 14px mono font

        return {
            position: 'absolute',
            top: `${lineNum * lineHeight + 4}px`, // +4 for padding
            left: `${charNum * charWidth + 4}px`, // +4 for padding
            transition: 'top 0.1s, left 0.1s',
        };
    };

    return (
        <div className="h-full w-full flex flex-col bg-slate-800 rounded-lg shadow-inner relative">
            <div className="flex-shrink-0 p-2 bg-slate-900 rounded-t-lg text-xs text-slate-400 font-semibold">
                Collaborative IDE
            </div>
            <div className="relative flex-grow w-full">
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => onCodeChange(e.target.value)}
                    onKeyUp={handleSelectionChange}
                    onClick={handleSelectionChange}
                    readOnly={isReadOnly}
                    className="absolute inset-0 w-full h-full p-4 bg-transparent text-slate-100 font-mono text-sm resize-none focus:outline-none placeholder-slate-500 caret-white z-10"
                    placeholder={isReadOnly ? "Viewing code... Admin can grant you permission to edit." : "Start coding..."}
                    spellCheck="false"
                />
                {!isReadOnly && Object.entries(cursors).map(([email, cursorData]) => {
                    if (email === currentUserEmail) return null;
                    // FIX: Cast object entry value to its correct type to resolve properties.
                    const cursor = cursorData as { position: number; name: string };
                    return (
                        <div key={email} style={getCursorPositionStyles(cursor.position)} className="z-0">
                           <div className="absolute w-0.5 h-5" style={{ backgroundColor: getCursorColor(email) }}></div>
                           <div className="absolute text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: getCursorColor(email), color: 'white', transform: 'translateY(-100%)' }}>
                               {cursor.name}
                           </div>
                        </div>
                    )
                })}
            </div>
             <div className="flex-shrink-0 p-2 bg-slate-900 rounded-b-lg text-xs text-slate-400">
                {isReadOnly ? "Read-only Mode" : "You have permission to edit"}
            </div>
        </div>
    );
};

export default CollaborativeIDE;