import React, { useState, useRef, useEffect } from 'react';
import { createPcmBlob, decode, decodeAudioData, generateGroundedContent } from '../services/geminiService';
import type { GroundingChunk as ServiceGroundingChunk } from '../services/geminiService';
import { SparklesIcon, MicrophoneIcon, StopIcon, SendIcon, SpinnerIcon } from './icons';
import { AiChatMessage } from '../types';
import type { GroundingChunk } from '../types';

// Polyfill for webkitAudioContext
const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;

interface AiTutorProps {
    initialChatHistory: AiChatMessage[];
    onUpdateChatHistory: (history: AiChatMessage[]) => void;
}

const AiTutor: React.FC<AiTutorProps> = ({ initialChatHistory, onUpdateChatHistory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [messages, setMessages] = useState<AiChatMessage[]>(initialChatHistory);
    const [isBotThinking, setIsBotThinking] = useState(false);

    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages, isBotThinking]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            onUpdateChatHistory(messages);
        }
    }, [messages, onUpdateChatHistory]);

    const handleTextSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!textInput.trim() || isBotThinking) return;

        const newUserMessage: AiChatMessage = { type: 'user', text: textInput };
        setMessages(prev => [...prev, newUserMessage]);
        setTextInput('');
        setIsBotThinking(true);
        try {
            const result = await generateGroundedContent(textInput);
            const botText: string = typeof result?.text === 'string' ? result.text : 'No response from AI.';
            const serviceSources: ServiceGroundingChunk[] = Array.isArray(result?.sources) ? result.sources as ServiceGroundingChunk[] : [];

            // Normalize service sources so they conform to the project's GroundingChunk type
            // (ensure web.uri and web.title are present as strings)
            const botSources: GroundingChunk[] = serviceSources.map(s => {
                return {
                    ...s,
                    web: {
                        uri: (s as any)?.web?.uri ?? '',
                        title: (s as any)?.web?.title ?? ''
                    }
                } as unknown as GroundingChunk;
            });

            const newBotMessage: AiChatMessage = {
                type: 'bot',
                text: botText,
                ...(botSources.length ? { sources: botSources } : {})
            };
            setMessages(prev => [...prev, newBotMessage]);
        } catch (err) {
            console.error('AI generation error', err);
            const errMsg: AiChatMessage = { type: 'bot', text: 'Sorry — failed to contact AI service. Please try again.', sources: [] };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsBotThinking(false);
        }
    };

    const handleStartVoice = () => {
        // Voice/live audio requires server-side/live SDK and is disabled in this browser build.
        alert('Voice chat is not available in this build. Use text input for the AI Tutor.');
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50"
                aria-label="Open AI Tutor"
            >
                <SparklesIcon className="w-8 h-8" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 w-full max-w-md h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-50">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-bold">AI Tutor</h3>
                </div>
                <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
            </div>

            <div ref={chatHistoryRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isBotThinking && (
                    <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-sm p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            <div className="flex items-center space-x-2">
                                <SpinnerIcon className="w-5 h-5" />
                                <span>Tutor is thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleTextSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-grow bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50" disabled={!textInput.trim() || isBotThinking}>
                        {isBotThinking ? <SpinnerIcon className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
                    </button>
                </form>
                <button onClick={handleStartVoice} className="w-full mt-2 flex items-center justify-center p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-200 font-semibold hover:opacity-90">
                    <MicrophoneIcon className="w-5 h-5 mr-2" /> Voice Chat (Not Available)
                </button>
            </div>
        </div>
    );
};

export default AiTutor;