import React, { useEffect, useRef, useState, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';
import CollaborativeIDE from './CollaborativeIDE';
import ParticipantList from './ParticipantList';
import LiveChat from './LiveChat';
import { CameraIcon, StopIcon, PlayCircleIcon, MicrophoneIcon, DownloadIcon } from './icons';
import { useScreenShare } from '../services/geminiService';

/* lightweight types (kept local) */
type User = { name: string; email?: string };
type LiveStudioChatMessage = { id: string; senderName: string; senderEmail: string; text: string; timestamp: number };
type LiveStudioState = {
  isLive: boolean;
  presenterEmail: string | null;
  mode: 'camera' | 'screen';
  allowedCoders: string[];
  participants: Record<string, any>;
  contributions: Record<string, { code: string; timestamp: number }>;
  isRecording: boolean;
  sessionStartTime: number | null;
  raisedHands: string[];
  cursors: Record<string, any>;
};

const LIVE_STATE_KEY = 'liveStudioState';
const LIVE_CHAT_KEY = 'liveStudioChat';
const ATTENDANCE_KEY = 'liveStudioAttendance';

interface LiveStudioProps {
  currentUser: User;
  currentUserEmail: string;
  isAdmin: boolean;
  onExit: () => void;
}

const defaultState: LiveStudioState = {
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

// MediaRecorder compatibility checker
const getSupportedMimeType = (): string | null => {
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4;codecs=avc1',
    'video/mp4'
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      console.log('Using MIME type:', mimeType);
      return mimeType;
    }
  }
  return null;
};

const LiveStudio: React.FC<LiveStudioProps> = ({ currentUser, currentUserEmail, isAdmin, onExit }) => {
  const [liveState, setLiveState] = useState<LiveStudioState>(() => {
    try {
      const s = localStorage.getItem(LIVE_STATE_KEY);
      return s ? (JSON.parse(s) as LiveStudioState) : defaultState;
    } catch {
      return defaultState;
    }
  });

  const [presenterStream, setPresenterStream] = useState<MediaStream | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(false);
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(false);
  const [recordingBlobs, setRecordingBlobs] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recorderError, setRecorderError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const { isSharing, startScreenShare, stopScreenShare, getStream: getScreenStream } = useScreenShare();

  const [chatMessages, setChatMessages] = useState<LiveStudioChatMessage[]>(() => {
    try {
      const s = localStorage.getItem(LIVE_CHAT_KEY);
      return s ? JSON.parse(s) as LiveStudioChatMessage[] : [];
    } catch {
      return [];
    }
  });

  const [attendance, setAttendance] = useState<Record<string, { name: string; joinedAt: number }>>(() => {
    try {
      const s = localStorage.getItem(ATTENDANCE_KEY);
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });

  // screen share UX state
  const [isStartingScreenShare, setIsStartingScreenShare] = useState(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(liveState));
  }, [liveState]);

  useEffect(() => {
    localStorage.setItem(LIVE_CHAT_KEY, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
  }, [attendance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      
      // Clean up all streams
      [presenterStream, combinedStreamRef.current, micStreamRef.current].forEach(stream => {
        if (stream) {
          stream.getTracks().forEach(track => {
            try { track.stop(); } catch {}
          });
        }
      });
    };
  }, []);

  // Auto-start recording when session begins
  // Auto-start recording when session begins - with proper delay
useEffect(() => {
  if (liveState.isLive && liveState.presenterEmail === currentUserEmail && !isRecording) {
    // Wait longer for streams to initialize
    const timer = setTimeout(() => {
      console.log('Auto-starting recording...');
      startRecording().catch((e) => {
        console.warn('Auto-recording failed', e);
      });
    }, 2000); // Increased delay to 2 seconds
    
    return () => clearTimeout(timer);
  }
}, [liveState.isLive, liveState.presenterEmail]);

  const addAttendance = useCallback((email: string, name: string) => {
    setAttendance(prev => {
      if (prev[email]) return prev;
      return { ...prev, [email]: { name, joinedAt: Date.now() } };
    });
  }, []);

  const removeAttendance = useCallback((email: string) => {
    setAttendance(prev => {
      if (!prev[email]) return prev;
      const next = { ...prev };
      delete next[email];
      return next;
    });
  }, []);

  const startSession = async (mode: 'camera' | 'screen' = 'camera') => {
    setLiveState(prev => ({ 
      ...prev, 
      isLive: true, 
      presenterEmail: currentUserEmail, 
      mode, 
      sessionStartTime: Date.now() 
    }));
    setIsCameraEnabled(mode === 'camera');
    addAttendance(currentUserEmail, currentUser.name);
  };

  const endSession = useCallback(() => {
    // Stop recording if active
    stopRecording();
    
    // Stop screen share
    if (isSharing) {
      stopScreenShare();
    }
    
    // Stop mic
    stopMic();
    
    // Clean up presenter stream
    if (presenterStream) {
      presenterStream.getTracks().forEach(track => {
        try { track.stop(); } catch {}
      });
      setPresenterStream(null);
    }
    
    setIsCameraEnabled(false);
    setIsMicEnabled(false);
    setLiveState(defaultState);
  }, [presenterStream, isSharing, stopScreenShare]);

  // VideoPlayer stream handler
  const handlePresenterStreamReady = useCallback((stream: MediaStream | null) => {
    setPresenterStream(stream);
    
    if (!stream) {
      setIsCameraEnabled(false);
      if (liveState.presenterEmail === currentUserEmail) {
        stopRecording();
      }
    } else {
      addAttendance(currentUserEmail, currentUser.name);
    }
  }, [liveState.presenterEmail, currentUserEmail, currentUser.name, addAttendance]);

  const startMic = async (): Promise<MediaStream | null> => {
    try {
      if (micStreamRef.current) return micStreamRef.current;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: false 
      });
      
      micStreamRef.current = stream;
      setIsMicEnabled(true);
      return stream;
    } catch (err: any) {
      console.error('Could not get mic', err);
      setRecorderError('Could not access microphone. Check permissions and extensions.');
      setIsMicEnabled(false);
      return null;
    }
  };

  const stopMic = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch {}
      });
      micStreamRef.current = null;
    }
    setIsMicEnabled(false);
  }, []);

  const buildCombinedStream = useCallback(async (): Promise<MediaStream | null> => {
  const combined = new MediaStream();
  let hasTracks = false;

  console.log('Building combined stream...');
  console.log('Presenter stream:', presenterStream);
  console.log('Screen stream:', getScreenStream ? getScreenStream() : null);
  console.log('Mic enabled:', isMicEnabled);
  console.log('Mic stream:', micStreamRef.current);

  // Add presenter stream (camera or screen)
  if (presenterStream) {
    const videoTracks = presenterStream.getVideoTracks();
    const audioTracks = presenterStream.getAudioTracks();
    
    console.log('Presenter video tracks:', videoTracks.length);
    console.log('Presenter audio tracks:', audioTracks.length);
    
    videoTracks.forEach(track => {
      if (track.readyState === 'live') {
        combined.addTrack(track);
        hasTracks = true;
        console.log('Added presenter video track:', track.kind, track.label);
      }
    });
    
    // Only add audio from presenter if it's screen share (camera audio goes through mic)
    if (liveState.mode === 'screen') {
      audioTracks.forEach(track => {
        if (track.readyState === 'live') {
          combined.addTrack(track);
          hasTracks = true;
          console.log('Added screen share audio track:', track.kind, track.label);
        }
      });
    }
  }

  // Add microphone if enabled
  if (isMicEnabled && micStreamRef.current) {
    const audioTracks = micStreamRef.current.getAudioTracks();
    console.log('Mic audio tracks:', audioTracks.length);
    
    audioTracks.forEach(track => {
      if (track.readyState === 'live') {
        combined.addTrack(track);
        hasTracks = true;
        console.log('Added mic audio track:', track.kind, track.label);
      }
    });
  }

  console.log('Final combined stream tracks:', combined.getTracks().length);
  combined.getTracks().forEach(track => {
    console.log('Track:', track.kind, track.label, track.readyState);
  });

  return hasTracks ? combined : null;
}, [presenterStream, getScreenStream, isMicEnabled, liveState.mode]);

  const startRecording = async (): Promise<void> => {
    try {
      setRecorderError(null);

      // Check MediaRecorder support
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder not supported in this browser');
      }

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported recording format found in this browser');
      }

      // Ensure we have streams for recording
      if (!presenterStream && liveState.presenterEmail === currentUserEmail && !isCameraEnabled) {
        setIsCameraEnabled(true);
        // Wait a bit for camera to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Ensure mic if enabled
      if (isMicEnabled && !micStreamRef.current) {
        await startMic();
      }

      const combined = await buildCombinedStream();
      if (!combined || combined.getTracks().length === 0) {
        throw new Error('No active media tracks available for recording');
      }

      // Verify all tracks are live
      const videoTracks = combined.getVideoTracks();
      const audioTracks = combined.getAudioTracks();
      
      if (videoTracks.length === 0) {
        console.warn('No video tracks available for recording');
      }

      combinedStreamRef.current = combined;

      const options: MediaRecorderOptions = { mimeType };
      
      // For better compatibility, use higher bitrates for certain formats
      if (mimeType.includes('webm')) {
        options.videoBitsPerSecond = 2500000;
      } else if (mimeType.includes('mp4')) {
        options.videoBitsPerSecond = 3000000;
      }

      const mediaRecorder = new MediaRecorder(combined, options);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
          setRecordingBlobs(prev => [...prev, blob]);
        }
        
        // Clean up combined stream (but not original tracks)
        if (combinedStreamRef.current) {
          combinedStreamRef.current = null;
        }
        
        mediaRecorderRef.current = null;
        setIsRecording(false);
        setLiveState(prev => ({ ...prev, isRecording: false }));
      };

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        setRecorderError(`Recording error: ${event.error?.message || 'Unknown error'}`);
        setIsRecording(false);
      };

      // Start recording with timeslice to ensure regular data availability
      mediaRecorder.start(1000);
      setIsRecording(true);
      setLiveState(prev => ({ ...prev, isRecording: true }));
      
    } catch (err: any) {
      console.error('startRecording error:', err);
      setRecorderError(err.message || 'Failed to start recording. Check browser support and permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = useCallback((): void => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setLiveState(prev => ({ ...prev, isRecording: false }));
    } catch (err) {
      console.warn('stopRecording error:', err);
    }
  }, []);

  const downloadRecording = (index?: number): void => {
    const blobIndex = typeof index === 'number' ? index : recordingBlobs.length - 1;
    const blob = recordingBlobs[blobIndex];
    
    if (!blob) {
      console.warn('No recording found at index:', blobIndex);
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summightcf-live-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendChat = useCallback((text: string) => {
    const msg: LiveStudioChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      senderName: currentUser.name,
      senderEmail: currentUserEmail,
      text,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, msg]);
  }, [currentUser.name, currentUserEmail]);

  const toggleCoderPermission = useCallback((email: string) => {
    setLiveState(prev => {
      const allowed = new Set(prev.allowedCoders || []);
      if (allowed.has(email)) {
        allowed.delete(email);
      } else {
        allowed.add(email);
      }
      return { ...prev, allowedCoders: Array.from(allowed) };
    });
  }, []);

  // Screen share handling
  const handleStartScreenShare = async (): Promise<void> => {
    if (isStartingScreenShare) return;
    
    setScreenShareError(null);
    setIsStartingScreenShare(true);
    
    try {
      const stream = await startScreenShare();
      if (!stream) {
        setScreenShareError('Screen share not started (cancelled or failed)');
        return;
      }

      // Set as presenter stream and switch to screen mode
      setPresenterStream(stream);
      setLiveState(prev => ({ ...prev, mode: 'screen' }));
      
      // Handle any existing tracks from previous streams
      if (presenterStream && presenterStream !== stream) {
        presenterStream.getTracks().forEach(track => {
          try { track.stop(); } catch {}
        });
      }

    } catch (err: any) {
      console.error('Screen share error:', err);
      if (err?.name === 'NotAllowedError') {
        setScreenShareError('Screen share permission denied');
      } else if (err?.name === 'NotFoundError') {
        setScreenShareError('No screen source available');
      } else {
        setScreenShareError(err?.message || 'Failed to start screen sharing');
      }
    } finally {
      setIsStartingScreenShare(false);
    }
  };

  const handleStopScreenShare = useCallback((): void => {
    try {
      stopScreenShare();
      
      // If we're in screen mode and stop sharing, switch back to camera or clear stream
      if (liveState.mode === 'screen') {
        setPresenterStream(null);
        setLiveState(prev => ({ ...prev, mode: 'camera' }));
      }
      
      setScreenShareError(null);
    } catch (err) {
      console.warn('Error stopping screen share:', err);
    }
  }, [liveState.mode, stopScreenShare]);

  {recorderError && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-2">
    <strong>Recording Error:</strong> {recorderError}
    <div className="mt-2">
      <button 
        onClick={startRecording}
        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
      >
        Retry Recording
      </button>
      <button 
        onClick={() => setRecorderError(null)}
        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Dismiss
      </button>
    </div>
  </div>
)}

  // Render UI (same as your original, but with better error display)
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-800">
        <div className="flex items-center space-x-3">
          <CameraIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold">Live Studio — {liveState.isLive ? 'Live' : 'Offline'}</h2>
          {liveState.sessionStartTime && (
            <span className="text-sm text-slate-500 ml-3">
              Started: {new Date(liveState.sessionStartTime).toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Session controls */}
          {!liveState.isLive ? (
            <>
              <button
                type="button"
                onClick={() => startSession('camera')}
                className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              >
                <PlayCircleIcon className="inline w-4 h-4 mr-2" /> Start Camera
              </button>
              <button
                type="button"
                onClick={() => startSession('screen')}
                className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Start Screen
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={endSession}
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
            >
              <StopIcon className="inline w-4 h-4 mr-2" /> End Session
            </button>
          )}

          {/* Recording controls */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={!liveState.isLive}
              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
            >
              Record
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700"
            >
              Stop Recording
            </button>
          )}

          {/* Download control */}
          {recordingBlobs.length > 0 && (
            <button
              type="button"
              onClick={() => downloadRecording()}
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              title="Download last recording"
            >
              <DownloadIcon className="inline w-4 h-4 mr-2" /> Download
            </button>
          )}

          {/* Screen share controls */}
          {liveState.isLive && (
            <>
              {!isSharing ? (
                <button
                  type="button"
                  onClick={handleStartScreenShare}
                  disabled={isStartingScreenShare}
                  className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
                >
                  {isStartingScreenShare ? 'Sharing...' : 'Share Screen'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopScreenShare}
                  className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700"
                >
                  Stop Share
                </button>
              )}
            </>
          )}

          {/* Screen share status */}
          {isStartingScreenShare && (
            <span className="ml-2 text-sm text-yellow-500">Starting screen share...</span>
          )}
          {screenShareError && (
            <span className="ml-2 text-sm text-red-500">{screenShareError}</span>
          )}

          {/* Microphone control */}
          <button
            type="button"
            onClick={async () => {
              if (!isMicEnabled) {
                await startMic();
              } else {
                stopMic();
              }
            }}
            className={`px-3 py-1 rounded ${
              isMicEnabled 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
            }`}
            title="Toggle microphone"
          >
            <MicrophoneIcon className="inline w-4 h-4 mr-2" /> 
            {isMicEnabled ? 'Mic On' : 'Mic Off'}
          </button>
        </div>
      </div>

      {/* Error display */}
      {recorderError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-2">
          <strong>Recording Error:</strong> {recorderError}
          <button 
            onClick={() => setRecorderError(null)}
            className="float-right text-red-900 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 gap-4 p-4">
        <div className="w-2/3 bg-slate-800 rounded-lg overflow-hidden">
          {/* Video player area */}
          <div className="h-[420px] bg-black">
            <VideoPlayer
              mode={liveState.mode}
              isPresenter={liveState.presenterEmail === currentUserEmail}
              isCameraEnabled={isCameraEnabled}
              onStreamReady={handlePresenterStreamReady}
              externalStream={presenterStream}
            />
          </div>

          {/* Video player info bar */}
          <div className="p-3 bg-slate-900 text-slate-200 flex items-center justify-between">
            <div>
              <strong>Presenter:</strong> {liveState.presenterEmail || 'None'}
              <span className="ml-3 text-sm">Mode: {liveState.mode}</span>
            </div>
            <div className="text-sm">
              Recording: {isRecording ? 'Yes' : 'No'} • 
              Participants: {Object.keys(attendance).length}
            </div>
          </div>

          {/* Collaborative IDE */}
          <div className="p-3 border-t bg-white dark:bg-slate-800">
            <CollaborativeIDE
              isReadOnly={!liveState.allowedCoders.includes(currentUserEmail)}
              code={liveState.contributions?.[currentUserEmail]?.code ?? ''}
              onCodeChange={(newCode) => setLiveState(prev => ({
                ...prev,
                contributions: { 
                  ...prev.contributions, 
                  [currentUserEmail]: { code: newCode, timestamp: Date.now() } 
                }
              }))}
              currentUserEmail={currentUserEmail}
              onCursorChange={(position) => setLiveState(prev => ({
                ...prev,
                cursors: { ...prev.cursors, [currentUserEmail]: position }
              }))}
              cursors={liveState.cursors}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-1/3 flex flex-col gap-4">
          {/* Participants */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
            <h3 className="font-semibold mb-2">Participants & Attendance</h3>
            <ParticipantList
              participants={liveState.participants}
              attendance={attendance}
              onTogglePermission={toggleCoderPermission}
              allowedCoders={liveState.allowedCoders}
            />
          </div>

          {/* Live Chat */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 flex-1 flex flex-col">
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <LiveChat
              messages={chatMessages}
              onSend={sendChat}
              onClear={() => setChatMessages([])}
            />
          </div>

          {/* Recordings list */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
            <h3 className="font-semibold mb-2">Recordings</h3>
            {recordingBlobs.length === 0 ? (
              <p className="text-sm text-slate-500">No recordings yet.</p>
            ) : (
              <ul className="space-y-2">
                {recordingBlobs.map((blob, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm">
                      Recording {index + 1} • {(blob.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <button 
                      type="button" 
                      onClick={() => downloadRecording(index)} 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LiveStudio;