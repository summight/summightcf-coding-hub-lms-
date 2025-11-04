import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, LiveStudioState } from '../types';
import Button from './Button';
import Card from './Card';
import CollaborativeIDE from './CollaborativeIDE';
import LiveChat from './LiveChat';
import ParticipantList from './ParticipantList';
import VideoPlayer from './VideoPlayer';
import { CameraIcon, HandRaisedIcon, RecordIcon, StopIcon, DownloadIcon } from './icons';

interface LiveStudioProps {
    currentUser: User;
    currentUserEmail: string;
    isAdmin: boolean;
    onExit: () => void;
}

const LIVE_STATE_KEY = 'liveStudioState';
const LIVE_CODE_KEY = 'liveStudioCode';

const initialLiveState: LiveStudioState = {
    isLive: false,
    presenterEmail: null,
    mode: 'camera',
    allowedCoders: [],
    participants: {},
    contributions: {},
    isRecording: false,
    sessionStartTime: null,
    raisedHands: [],
    cursors: {},
};

const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const LiveStudio: React.FC<LiveStudioProps> = ({ currentUser, currentUserEmail, isAdmin, onExit }) => {
    const [liveState, setLiveState] = useState<LiveStudioState>(initialLiveState);
    const [code, setCode] = useState<string>('// Welcome to the Live Studio!\n// Admin can start the session and share their screen.');
    const [isCameraEnabled, setIsCameraEnabled] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<number | null>(null);

    const updateLiveState = (newState: Partial<LiveStudioState>) => {
        const currentState: LiveStudioState = JSON.parse(localStorage.getItem(LIVE_STATE_KEY) || JSON.stringify(initialLiveState));
        const updatedState = { ...currentState, ...newState };
        localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(updatedState));
        setLiveState(updatedState);
    };

    const handleStorageChange = useCallback((event: StorageEvent) => {
        if (event.key === LIVE_STATE_KEY && event.newValue) {
            setLiveState(JSON.parse(event.newValue));
        }
        if (event.key === LIVE_CODE_KEY && event.newValue) {
            setCode(event.newValue);
        }
    }, []);

    useEffect(() => {
        const storedState = localStorage.getItem(LIVE_STATE_KEY);
        if (storedState) setLiveState(JSON.parse(storedState));
        else if (isAdmin) localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(initialLiveState));
        
        const storedCode = localStorage.getItem(LIVE_CODE_KEY);
        if (storedCode) setCode(storedCode);

        const addParticipant = () => {
            const currentState: LiveStudioState = JSON.parse(localStorage.getItem(LIVE_STATE_KEY) || JSON.stringify(initialLiveState));
            if (!currentState.participants[currentUserEmail]) {
                const newParticipants = { ...currentState.participants, [currentUserEmail]: { name: currentUser.name, avatar: currentUser.avatar }};
                const newCursors = { ...currentState.cursors, [currentUserEmail]: { position: 0, name: currentUser.name }};
                const updatedState = { ...currentState, participants: newParticipants, cursors: newCursors };
                localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(updatedState));
                setLiveState(updatedState);
            }
        };
        addParticipant();
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            const currentState: LiveStudioState = JSON.parse(localStorage.getItem(LIVE_STATE_KEY) || JSON.stringify(initialLiveState));
            const newParticipants = { ...currentState.participants };
            delete newParticipants[currentUserEmail];
            const newCursors = { ...currentState.cursors };
            delete newCursors[currentUserEmail];
            const updatedState = { ...currentState, participants: newParticipants, cursors: newCursors };
            localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(updatedState));
            window.removeEventListener('storage', handleStorageChange);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [currentUserEmail, currentUser.name, currentUser.avatar, handleStorageChange]);
    
    useEffect(() => {
        if (liveState.isLive && liveState.sessionStartTime) {
            timerIntervalRef.current = window.setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - (liveState.sessionStartTime || 0)) / 1000));
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setElapsedTime(0);
        }
        return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
    }, [liveState.isLive, liveState.sessionStartTime]);


    const handleStartSession = () => {
        setIsCameraEnabled(true);
        updateLiveState({ isLive: true, presenterEmail: currentUserEmail, mode: 'camera', sessionStartTime: Date.now() });
    };

    const handleEndSession = () => {
        if (liveState.isRecording) handleStopRecording();
        setIsCameraEnabled(false);
        const finalState = { ...initialLiveState, participants: liveState.participants };
        localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(finalState));
        setLiveState(finalState);
    };

    const handleStartRecording = () => {
        if (!streamRef.current || liveState.isRecording) return;
        recordedChunksRef.current = [];
        setVideoUrl(null);
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm; codecs=vp9' });
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        };
        mediaRecorderRef.current.start();
        updateLiveState({ isRecording: true });
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        updateLiveState({ isRecording: false });
    };

    const handleCodeChange = (newCode: string) => {
        localStorage.setItem(LIVE_CODE_KEY, newCode);
        setCode(newCode);
    };

     const handleCursorChange = (position: number) => {
        updateLiveState({ cursors: { ...liveState.cursors, [currentUserEmail]: { position, name: currentUser.name } } });
    };

    const handleToggleRaiseHand = () => {
        const isRaised = liveState.raisedHands.includes(currentUserEmail);
        const newRaisedHands = isRaised
            ? liveState.raisedHands.filter(email => email !== currentUserEmail)
            : [...liveState.raisedHands, currentUserEmail];
        updateLiveState({ raisedHands: newRaisedHands });
    };
    
    const canEditCode = isAdmin || (liveState.allowedCoders.includes(currentUserEmail));

    if (!liveState.isLive && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 text-center p-4">
                <CameraIcon className="w-16 h-16 text-blue-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Live Studio is Offline</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-6">The instructor has not started the session yet. Please wait.</p>
                <Button onClick={onExit}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <header className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 shadow-md flex-shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">Live Studio</h1>
                    {liveState.isLive && (
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>LIVE
                            </span>
                            <span className="text-sm font-mono text-slate-500">{formatTime(elapsedTime)}</span>
                        </div>
                    )}
                </div>
                 <div className="flex items-center gap-2">
                    {isAdmin && liveState.isLive && (
                         <>
                            {liveState.isRecording ? (
                                <Button onClick={handleStopRecording} className="bg-red-500 hover:bg-red-600 flex items-center gap-2">
                                    <StopIcon className="w-5 h-5"/> Stop Recording
                                </Button>
                            ) : (
                                <Button onClick={handleStartRecording} variant="secondary" className="flex items-center gap-2">
                                    <RecordIcon className="w-5 h-5"/> Record
                                </Button>
                            )}
                         </>
                    )}
                    {videoUrl && <a href={videoUrl} download={`session-recording-${new Date().toISOString()}.webm`}><Button variant="secondary" className="flex items-center gap-2"><DownloadIcon className="w-5 h-5"/> Download</Button></a>}
                 </div>
                 <div className="flex items-center gap-2">
                    {isAdmin && (
                        <>
                            {!liveState.isLive ? (
                                <Button onClick={handleStartSession}>Start Session</Button>
                            ) : (
                                <>
                                    {liveState.mode === 'camera' ? <Button variant="secondary" onClick={() => updateLiveState({ mode: 'screen' })}>Share Screen</Button> : <Button variant="secondary" onClick={() => updateLiveState({ mode: 'camera' })}>Share Camera</Button>}
                                    <Button onClick={handleEndSession} className="bg-red-500 hover:bg-red-600">End Session</Button>
                                </>
                            )}
                        </>
                    )}
                     {!isAdmin && liveState.isLive && (
                         <Button onClick={handleToggleRaiseHand} variant={liveState.raisedHands.includes(currentUserEmail) ? 'primary' : 'secondary'} className="flex items-center gap-2"><HandRaisedIcon className="w-5 h-5"/> {liveState.raisedHands.includes(currentUserEmail) ? 'Lower Hand' : 'Raise Hand'}</Button>
                     )}
                    <Button onClick={onExit} variant="secondary">Exit Studio</Button>
                 </div>
            </header>

            <main className="flex-grow flex p-4 gap-4 overflow-hidden">
                <div className="flex-grow flex flex-col gap-4 w-3/4">
                    <div className="flex-grow rounded-lg bg-black overflow-hidden relative">
                         <VideoPlayer mode={liveState.mode} isPresenter={liveState.presenterEmail === currentUserEmail} isCameraEnabled={isCameraEnabled} onStreamReady={(stream) => streamRef.current = stream} />
                         {!liveState.isLive && (<div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-2xl font-bold">Session has not started</div>)}
                    </div>
                    <div className="h-1/2 flex flex-col relative">
                       <CollaborativeIDE code={code} onCodeChange={handleCodeChange} isReadOnly={!canEditCode} currentUserEmail={currentUserEmail} onCursorChange={handleCursorChange} cursors={liveState.cursors}/>
                    </div>
                </div>
                <div className="w-1/4 flex-shrink-0 flex flex-col gap-4">
                    <Card title="Participants" className="flex-shrink-0">
                        <ParticipantList participants={liveState.participants} allowedCoders={liveState.allowedCoders} contributions={liveState.contributions} raisedHands={liveState.raisedHands} isAdmin={isAdmin} onTogglePermission={(email) => {
                               const newAllowed = liveState.allowedCoders.includes(email) ? liveState.allowedCoders.filter(e => e !== email) : [...liveState.allowedCoders, email];
                               updateLiveState({ allowedCoders: newAllowed });
                           }}/>
                    </Card>
                    <div className="flex-grow min-h-0">
                       <LiveChat currentUserEmail={currentUserEmail} currentUserName={currentUser.name} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveStudio;
