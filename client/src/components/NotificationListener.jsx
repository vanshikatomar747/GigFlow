import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// Use same URL as axios
const ENDPOINT = import.meta.env.VITE_API_URL;
if (!ENDPOINT) {
    console.error("CRITICAL: VITE_API_URL is missing! Socket will not connect.");
    // alert("Configuration Error: VITE_API_URL is missing. Please check Vercel settings."); // Optional: Uncomment if user keeps missing this
}
var socket;

const NotificationListener = () => {
    const { user } = useAuth();
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (user) {
            socket = io(ENDPOINT);
            socket.emit('setup', user);

            socket.on('notification', (data) => {
                setNotification(data);
                // Auto hide after 5 seconds
                setTimeout(() => setNotification(null), 5000);
            });
        }
        return () => {
            if (socket) socket.disconnect();
        };
    }, [user]);

    if (!notification) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
            <div className="bg-white border-l-4 border-accent shadow-2xl rounded-lg p-4 max-w-sm flex items-start">
                <div className="text-xl mr-3">🎉</div>
                <div>
                    <h4 className="font-bold text-gray-800">Congratulations!</h4>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                </div>
                <button
                    onClick={() => setNotification(null)}
                    className="ml-4 text-gray-400 hover:text-gray-600"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default NotificationListener;
