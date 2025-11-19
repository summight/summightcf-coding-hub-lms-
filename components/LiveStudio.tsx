// components/LiveStudio.tsx
import React, { useEffect, useRef, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import CollaborativeIDE from './CollaborativeIDE';
import ParticipantList from './ParticipantList';
import LiveChat from './LiveChat'; // ← No type import here
import { CameraIcon, StopIcon, PlayCircleIcon, MicrophoneIcon, DownloadIcon } from './icons';
import { useScreenShare } from '../services/geminiService';
import {
  startLiveSessionDB,
  endLiveSessionDB,
  joinSessionDB,
  leaveSessionDB,
  fetchLiveState,
  saveRecordingDB,
  fetchChatMessagesDB,
  sendChatMessageDB,
  clearChatMessagesDB,
} from '../src/auth';
import { User, LiveStudioState, LiveSessionDBState, LiveStudioChatMessage } from '../types';

interface LiveStudioProps {
  currentUser: User;
  currentUserEmail: string;
  isAdmin: boolean;
  onExit: () => void;
}

const LiveStudio: React.FC<LiveStudioProps> = ({ currentUser, currentUserEmail, isAdmin, onExit }) => {
  const [state, setState] = useState<LiveStudioState>({
    sessionId: null,
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
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const { startScreenShare, stopScreenShare } = useScreenShare();

  const startSession = async () => {
    const session = await startLiveSessionDB(currentUser.id, currentUser.name);
    setState((s) => ({
      ...s,
      sessionId: session.id,
      isLive: true,
      presenterEmail: currentUserEmail,
      sessionStartTime: Date.now(),
    }));
    await joinSessionDB(session.id, currentUser.id, currentUser.name);
    if (videoRef.current) startScreenShare(videoRef.current);
  };

  const endSession = async () => {
    if (state.sessionId) {
      await endLiveSessionDB(state.sessionId);
      setState((s) => ({
        ...s,
        isLive: false,
        sessionId: null,
        participants: {},
        contributions: {},
        raisedHands: [],
      }));
      stopScreenShare();
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const dbState: LiveSessionDBState | null = await fetchLiveState();
      if (dbState) {
        const participants = Object.fromEntries(
          (dbState.session_participants || []).map((p) => [p.user_id, { name: p.user_name }])
        );
        setState((s) => ({
          ...s,
          sessionId: dbState.id,
          isLive: dbState.is_active,
          presenterEmail: currentUserEmail,
          participants,
        }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUserEmail]);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Studio</h1>
        <button onClick={onExit} className="text-red-500 hover:underline">Exit</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer ref={videoRef} />
          <div className="flex space-x-3">
            {isAdmin && !state.isLive && (
              <button onClick={startSession} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                Start Live
              </button>
            )}
            {isAdmin && state.isLive && (
              <button onClick={endSession} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                End Live
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <ParticipantList participants={state.participants} />
          <LiveChat sessionId={state.sessionId} currentUser={currentUser} />
        </div>
      </div>

      <div className="mt-6">
        <CollaborativeIDE
          code=""
          allowedCoders={state.allowedCoders}
          currentUserId={currentUser.id}
          onCodeChange={() => {}}
          cursors={state.cursors}
          contributions={state.contributions}
        />
      </div>
    </div>
  );
};

export default LiveStudio;