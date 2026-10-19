'use client';

import {
    io,
    Socket
} from 'socket.io-client';
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
    url?: string;   // ← برای تست و انعطاف
}

const isDev = process.env.NODE_ENV === 'development';

export const SocketProvider = ({ children, url }: SocketProviderProps) => {
    const socketRef = useRef<Socket | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const SOCKET_URL = url || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            if (isDev) console.log('✅ متصل به Socket.IO شد:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            if (isDev) console.log('❌ از Socket.IO قطع شد:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            if (isDev) console.error('❌ خطا در اتصال به Socket.IO:', error.message);
            setIsConnected(false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [url]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};