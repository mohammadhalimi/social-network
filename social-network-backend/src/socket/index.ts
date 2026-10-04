// src/socket/index.ts
import jwt from 'jsonwebtoken';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

// ✅ تغییر ۱: Map از Set استفاده کند (هر کاربر می‌تواند چند socket داشته باشد)
const userSocketMap = new Map<string, Set<string>>();

export function initializeSocket(httpServer: HTTPServer) {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.cookie?.match(/token=([^;]+)/)?.[1];

        let userId: string | null = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
                    userId: string;
                };
                userId = decoded.userId;
            } catch {
                console.log('❌ توکن سوکت نامعتبر است');
            }
        }

        if (!userId) {
            socket.disconnect();
            return;
        }

        // ✅ تغییر ۲: اضافه کردن socket.id به Set کاربر
        if (!userSocketMap.has(userId)) {
            userSocketMap.set(userId, new Set());
        }
        userSocketMap.get(userId)!.add(socket.id);

        console.log(`🔌 کاربر ${userId} به سوکت متصل شد (socket: ${socket.id})`);

        socket.on('disconnect', () => {
            // ✅ تغییر ۳: فقط socket.id فعلی را حذف کن، نه کل کاربر
            const sockets = userSocketMap.get(userId!);
            if (sockets) {
                sockets.delete(socket.id);
                // اگر دیگر هیچ socket ای برای این کاربر نماند، کلید را حذف کن
                if (sockets.size === 0) {
                    userSocketMap.delete(userId!);
                }
            }
            console.log(`🔌 کاربر ${userId} از سوکت قطع شد (socket: ${socket.id})`);
        });
    });

    return io;
}

/**
 * ارسال نوتیف لحظه‌ای به یک کاربر خاص (اگر آنلاین باشد)
 * به همه‌ی تب‌های باز کاربر ارسال می‌شود
 */
export function emitToUser(userId: string, event: string, payload: any) {
    const sockets = userSocketMap.get(userId);
    if (sockets && io) {
        // ✅ ارسال به همه‌ی socket های کاربر
        sockets.forEach((socketId) => {
            io.to(socketId).emit(event, payload);
        });
    }
}