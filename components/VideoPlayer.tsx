// components/VideoPlayer.tsx

import React, { useRef, useEffect, forwardRef } from 'react';
import { PlayCircleIcon, StopIcon } from './icons';

interface VideoPlayerProps {
  stream: MediaStream | null;
  mode: 'camera' | 'screen';
  isAdmin: boolean;
  cameraEnabled?: boolean;
  micEnabled?: boolean;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({ 
  stream, 
  mode, 
  isAdmin, 
  cameraEnabled = false, 
  micEnabled = false 
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);  // For potential canvas overlay

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  if (!stream) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded">
        <PlayCircleIcon className="w-16 h-16 text-slate-500" />
        <p className="mt-2 text-slate-400">No stream active</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={ref || videoRef}
        className="w-full h-full object-cover rounded"
        autoPlay
        muted={isAdmin}  // Mute local preview
        playsInline
      />
      {/* Status Overlay */}
      <div className="absolute top-2 right-2 space-y-1">
        <div className={`w-3 h-3 rounded-full ${cameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className={`w-3 h-3 rounded-full ${micEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      {/* Mode Indicator */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {mode === 'screen' ? 'Screen Share' : 'Camera'}
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;