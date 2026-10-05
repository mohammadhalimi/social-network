'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // ✅ اتصال به Socket.IO بک‌اند
        const newSocket = io('http://localhost:4000', {
            withCredentials: true, // ✅ ارسال کوکی برای احراز هویت
            transports: ['websocket', 'polling'],
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ متصل به Socket.IO شد:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ از Socket.IO قطع شد:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ خطا در اتصال به Socket.IO:', error.message);
            setIsConnected(false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};