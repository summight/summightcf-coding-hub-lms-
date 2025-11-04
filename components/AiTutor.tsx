import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { createPcmBlob, decode, decodeAudioData, generateGroundedContent } from '../services/geminiService';
import { SparklesIcon, MicrophoneIcon, StopIcon, SendIcon, SpinnerIcon } from './icons';
import { AiChatMessage, GroundingChunk } from '../types';

// Polyfill for webkitAudioContext
// FIX: Cast window to any to support webkitAudioContext for older browsers.
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

interface AiTutorProps {
    initialChatHistory: AiChatMessage[];
    onUpdateChatHistory: (history: AiChatMessage[]) => void;
}

const AiTutor: React.FC<AiTutorProps> = ({ initialChatHistory, onUpdateChatHistory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [messages, setMessages] = useState<AiChatMessage[]>(initialChatHistory);
    const [userTranscription, setUserTranscription] = useState('');
    const [modelTranscription, setModelTranscription] = useState('');
    const [isBotThinking, setIsBotThinking] = useState(false);
    
    const userTranscriptionRef = useRef('');
    const modelTranscriptionRef = useRef('');
    
    const sessionPromise = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages, userTranscription, modelTranscription, isBotThinking]);

    useEffect(() => {
        // When the component opens, sync state with the initial history from props
        if (isOpen) {
            setMessages(initialChatHistory);
        }
    }, [isOpen, initialChatHistory]);

    useEffect(() => {
        // Persist message changes to parent component, skipping the initial render.
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            onUpdateChatHistory(messages);
        }
    }, [messages, onUpdateChatHistory]);

    const handleStartConversation = async () => {
        if (isListening) return;
        setIsListening(true);
        setUserTranscription('');
        setModelTranscription('');
        userTranscriptionRef.current = '';
        modelTranscriptionRef.current = '';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            inputAudioContext.current = new AudioContext({ sampleRate: 16000 });
            outputAudioContext.current = new AudioContext({ sampleRate: 24000 });
            
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            sessionPromise.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
                },
                callbacks: {
                    onopen: () => {
                        console.log('Live session opened.');
                        sourceRef.current = inputAudioContext.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            if (sessionPromise.current) {
                                sessionPromise.current.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                            }
                        };
                        sourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContext.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            userTranscriptionRef.current += message.serverContent.inputTranscription.text;
                            setUserTranscription(userTranscriptionRef.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                           modelTranscriptionRef.current += message.serverContent.outputTranscription.text;
                           setModelTranscription(modelTranscriptionRef.current);
                        }
                        if (message.serverContent?.turnComplete) {
                            const finalUserTranscription = userTranscriptionRef.current;
                            const finalModelTranscription = modelTranscriptionRef.current;

                            if (finalUserTranscription.trim() || finalModelTranscription.trim()) {
                                setMessages(prev => [...prev, 
                                    { type: 'user', text: finalUserTranscription }, 
                                    { type: 'bot', text: finalModelTranscription }
                                ]);
                            }

                            userTranscriptionRef.current = '';
                            modelTranscriptionRef.current = '';
                            setUserTranscription('');
                            setModelTranscription('');
                        }
                        
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.current!.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext.current!, 24000, 1);
                            const source = outputAudioContext.current!.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.current!.destination);
                            source.addEventListener('ended', () => sources.delete(source));
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                    },
                    onclose: () => console.log('Live session closed.'),
                    onerror: (e) => console.error('Live session error:', e)
                }
            });

        } catch (error) {
            console.error('Error starting conversation:', error);
            setIsListening(false);
        }
    };

    const handleStopConversation = useCallback(() => {
        if (!isListening) return;
        setIsListening(false);

        if(sessionPromise.current) {
            sessionPromise.current.then(session => session.close());
            sessionPromise.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContext.current) {
            inputAudioContext.current.close();
            inputAudioContext.current = null;
        }
        if (outputAudioContext.current) {
            outputAudioContext.current.close();
            outputAudioContext.current = null;
        }
        
    }, [isListening]);
    
    useEffect(() => {
        return () => {
            handleStopConversation();
        };
    }, [handleStopConversation]);

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || isBotThinking) return;

        const newUserMessage: AiChatMessage = { type: 'user', text: textInput };
        setMessages(prev => [...prev, newUserMessage]);
        setTextInput('');
        setIsBotThinking(true);

        const { text, sources } = await generateGroundedContent(textInput);
        const newBotMessage: AiChatMessage = { type: 'bot', text, sources };
        setMessages(prev => [...prev, newBotMessage]);
        setIsBotThinking(false);
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
    
    const SourceLink: React.FC<{source: GroundingChunk, index: number}> = ({source, index}) => {
      if (!source.web) return null;
      return (
        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" title={source.web.title} className="text-xs bg-slate-200 dark:bg-slate-600 rounded-full px-2 py-1 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors">
          [{index + 1}]
        </a>
      );
    };

    return (
        <div className="fixed bottom-8 right-8 w-full max-w-md h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-50">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-bold">AI Tutor</h3>
                </div>
                <button onClick={() => { handleStopConversation(); setIsOpen(false); }} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
            </div>
            
            {/* Chat History */}
            <div ref={chatHistoryRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                            <p>{msg.text}</p>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-600 flex flex-wrap gap-2">
                                    {msg.sources.map((source, i) => <SourceLink key={i} source={source} index={i} />)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {userTranscription && <div className="text-right text-slate-400 italic">User: {userTranscription}...</div>}
                 {modelTranscription && <div className="text-left text-slate-400 italic">Tutor: {modelTranscription}...</div>}
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
            
            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                {isListening ? (
                     <button onClick={handleStopConversation} className="w-full flex items-center justify-center p-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                        <StopIcon className="w-5 h-5 mr-2" /> Stop Conversation
                     </button>
                ) : (
                    <>
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
                    <button onClick={handleStartConversation} className="w-full mt-2 flex items-center justify-center p-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">
                        <MicrophoneIcon className="w-5 h-5 mr-2" /> Start Voice Chat
                    </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AiTutor;