import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CameraIcon } from './icons';

interface VideoPlayerProps {
  mode: 'camera' | 'screen';
  isPresenter: boolean;
  isCameraEnabled: boolean;
  onStreamReady: (stream: MediaStream | null) => void;
  externalStream?: MediaStream | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mode,
  isPresenter,
  isCameraEnabled,
  onStreamReady,
  externalStream
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to safely attach stream to video element
  const attachStream = useCallback(async (stream: MediaStream | null) => {
    if (!videoRef.current) return;
    
    try {
      // Clear previous stream first
      videoRef.current.srcObject = null;
      
      if (stream) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready before playing
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (err: any) {
      console.error('Failed to attach stream to video:', err);
      // Don't treat autoplay restrictions as critical errors
      if (err.name !== 'NotAllowedError') {
        setError('Could not display video stream');
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let currentStream: MediaStream | null = null;

    const startStream = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      setError(null);

      // Clean up previous stream if it's not the external stream
      if (streamRef.current && streamRef.current !== externalStream) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // If we have an external stream (e.g. screen share), use that
      if (externalStream) {
        currentStream = externalStream;
        streamRef.current = externalStream;
        await attachStream(externalStream);
        onStreamReady(externalStream);
        setIsLoading(false);
        return;
      }

      // Otherwise handle camera mode
      if (!isPresenter || !isCameraEnabled || mode !== 'camera') {
        await attachStream(null);
        onStreamReady(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Starting camera stream...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        currentStream = stream;
        streamRef.current = stream;
        
        // Verify stream has video tracks
        const videoTracks = stream.getVideoTracks();
        console.log('Camera stream ready, video tracks:', videoTracks.length);
        
        if (videoTracks.length === 0) {
          throw new Error('No video tracks available from camera');
        }

        await attachStream(stream);
        onStreamReady(stream);

      } catch (err: any) {
        console.error('Media access error:', err);
        if (mounted) {
          setError(getUserFriendlyError(err));
          onStreamReady(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    startStream();

    return () => {
      mounted = false;
      // Only cleanup if this component created the stream
      if (currentStream && currentStream !== externalStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isPresenter, isCameraEnabled, mode, externalStream, onStreamReady, attachStream]);

  // Helper function for user-friendly error messages
  const getUserFriendlyError = (error: any): string => {
    if (error.name === 'NotAllowedError') {
      return 'Camera access was denied. Please allow camera permissions.';
    } else if (error.name === 'NotFoundError') {
      return 'No camera found. Please check your device.';
    } else if (error.name === 'NotReadableError') {
      return 'Camera is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      return 'Camera does not support required settings.';
    } else {
      return error?.message || 'Could not access camera';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-xl font-semibold">Loading camera...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-red-400 p-4 text-center">
        <p className="font-bold text-lg mb-2">Stream Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!isPresenter) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
        <CameraIcon className="w-24 h-24 mb-4" />
        <p className="text-xl font-semibold">Viewing Stream</p>
      </div>
    );
  }

  if (!isCameraEnabled && mode === 'camera') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
        <CameraIcon className="w-24 h-24 mb-4" />
        <p className="text-xl font-semibold">Camera Off</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <video 
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        autoPlay 
        playsInline
        muted={true} // Always muted for presenter to avoid feedback
        onError={(e) => {
          console.error('Video element error:', e);
          setError('Video playback failed');
        }}
      />
      {isPresenter && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded">
          {mode === 'camera' ? 'Camera' : 'Screen Share'} • Live
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;