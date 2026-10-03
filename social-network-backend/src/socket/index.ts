// src/socket/index.ts
import jwt from 'jsonwebtoken';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

// ✅ نگهداری اتصال هر کاربر (userId -> socketId)
const userSocketMap = new Map<string, string>();

export function initializeSocket(httpServer: HTTPServer) {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.match(/token=([^;]+)/)?.[1];

        let userId: string | null = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
                userId = decoded.userId;
            } catch {
                console.log('❌ توکن سوکت نامعتبر است');
            }
        }

        if (!userId) {
            socket.disconnect();
            return;
        }

        userSocketMap.set(userId, socket.id);
        console.log(`🔌 کاربر ${userId} به سوکت متصل شد`);

        socket.on('disconnect', () => {
            userSocketMap.delete(userId!);
            console.log(`🔌 کاربر ${userId} از سوکت قطع شد`);
        });
    });

    return io;
}

/**
 * ارسال نوتیف لحظه‌ای به یک کاربر خاص (اگر آنلاین باشد)
 */
export function emitToUser(userId: string, event: string, payload: any) {
    const socketId = userSocketMap.get(userId);
    if (socketId && io) {
        io.to(socketId).emit(event, payload);
    }
}