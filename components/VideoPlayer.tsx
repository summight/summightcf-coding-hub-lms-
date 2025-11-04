import React, { useEffect, useRef, useState } from 'react';
import { CameraIcon } from './icons';

interface VideoPlayerProps {
    mode: 'camera' | 'screen';
    isPresenter: boolean;
    isCameraEnabled: boolean;
    onStreamReady: (stream: MediaStream) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ mode, isPresenter, isCameraEnabled, onStreamReady }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startStream = async () => {
            setError(null); // Clear previous errors
            if (isPresenter && isCameraEnabled && videoRef.current) {
                try {
                    // Stop previous stream if it exists
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                    }

                    let stream: MediaStream;

                    if (mode === 'camera') {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    } else {
                        // Use standard, correct constraints for getDisplayMedia.
                        // The Permissions Policy error can be caused by the environment, but also by
                        // incorrect or non-standard constraints. This ensures our call is correct.
                        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                    }

                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                    onStreamReady(stream);
                } catch (err) {
                    console.error("Error accessing media devices.", err);
                    if (err instanceof Error) {
                        // The "permissions policy" error has the name 'SecurityError'.
                        if (err.name === 'SecurityError') {
                             setError('Screen sharing is blocked by your browser or a permissions policy. Ensure "display-capture" is allowed for this page.');
                        } else if (err.name === 'NotAllowedError') {
                            setError('You denied the request for screen sharing.');
                        } else {
                            setError(`An unexpected error occurred: ${err.message}`);
                        }
                    } else {
                        setError('An unknown error occurred while trying to share the screen.');
                    }
                }
            }
        };

        startStream();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isPresenter, isCameraEnabled, mode, onStreamReady]);
    
    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-red-400 p-4 text-center">
                <p className="font-bold text-lg mb-2">Could Not Start Stream</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!isPresenter) {
        return (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                <CameraIcon className="w-24 h-24 mb-4" />
                <p className="text-xl font-semibold">Viewing Instructor's Stream</p>
            </div>
        )
    }

    if (!isCameraEnabled) {
         return (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                <CameraIcon className="w-24 h-24 mb-4" />
                <p className="text-xl font-semibold">Your Camera is Off</p>
                <p>Start the session to share your video.</p>
            </div>
        )
    }

    return <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted={isPresenter}></video>;
};

export default VideoPlayer;