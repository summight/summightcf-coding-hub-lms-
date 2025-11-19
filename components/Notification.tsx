// components/Notification.tsx
import React, { useEffect } from 'react';

interface NotificationProps {
    message: string;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-24 right-8 bg-green-600 text-white p-4 rounded-lg shadow-lg z-[100] animate-fade-in-up w-full max-w-sm">
            <div className="flex justify-between items-center">
                <p className="font-semibold">{message}</p>
                <button onClick={onClose} className="ml-4 text-xl font-bold opacity-70 hover:opacity-100">&times;</button>
            </div>
        </div>
    );
};

export default Notification;
