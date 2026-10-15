// src/socket/__tests__/index.test.ts

// ✅ Mock کردن socket.io
const mockEmit = jest.fn();
const mockTo = jest.fn(() => ({ emit: mockEmit }));
const mockOn = jest.fn();
const mockDisconnect = jest.fn();
const mockUse = jest.fn();

const mockSocketIOServer = jest.fn(() => ({
    on: mockOn,
    to: mockTo,
    use: mockUse,
}));

jest.mock('socket.io', () => ({
    Server: mockSocketIOServer,
}));

// ✅ Mock کردن jwt
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}));

import jwt from 'jsonwebtoken';
import { initializeSocket, emitToUser } from '../index';

const mockedJwtVerify = jwt.verify as jest.Mock;
const mockHttpServer = {} as any;

describe('Socket', () => {
    let connectionHandler: any;
    let mockSocket: any;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});

        // ✅ ذخیره‌ی connection handler برای صدا زدن دستی
        mockOn.mockImplementation((event: string, handler: any) => {
            if (event === 'connection') {
                connectionHandler = handler;
            }
        });

        // ✅ ساخت یک socket جعلی
        mockSocket = {
            id: 'socket-1',
            handshake: {
                auth: { token: 'valid-token' },
                headers: { cookie: '' },
            },
            disconnect: mockDisconnect,
            on: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ==========================================================
    //  initializeSocket
    // ==========================================================
    describe('initializeSocket', () => {
        it('1. باید SocketIOServer با CORS درست بسازه', () => {
            initializeSocket(mockHttpServer);

            expect(mockSocketIOServer).toHaveBeenCalledWith(mockHttpServer, {
                cors: {
                    origin: 'http://localhost:3000',
                    credentials: true,
                },
            });
        });

        it('2. باید به event "connection" گوش بده', () => {
            initializeSocket(mockHttpServer);

            expect(mockOn).toHaveBeenCalledWith('connection', expect.any(Function));
        });
    });

    // ==========================================================
    //  Connection Handler
    // ==========================================================
    describe('connection handler', () => {
        beforeEach(() => {
            initializeSocket(mockHttpServer);
        });

        it('3. باید socket با توکن معتبر رو قبول کنه', () => {
            mockedJwtVerify.mockReturnValue({ userId: 'user-1' });

            connectionHandler(mockSocket);

            expect(mockedJwtVerify).toHaveBeenCalledWith('valid-token', 'secret');
            expect(mockDisconnect).not.toHaveBeenCalled();
            expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
        });

        it('4. باید socket با توکن نامعتبر رو قطع کنه', () => {
            mockedJwtVerify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            connectionHandler(mockSocket);

            expect(mockDisconnect).toHaveBeenCalled();
            expect(mockSocket.on).not.toHaveBeenCalled();
        });

        it('5. باید socket بدون توکن رو قطع کنه', () => {
            mockSocket.handshake.auth.token = null;
            mockSocket.handshake.headers.cookie = '';

            connectionHandler(mockSocket);

            expect(mockDisconnect).toHaveBeenCalled();
        });

        it('6. باید توکن رو از cookie هم بگیره', () => {
            mockSocket.handshake.auth.token = null;
            mockSocket.handshake.headers.cookie = 'other=value; token=cookie-token; more=value';
            mockedJwtVerify.mockReturnValue({ userId: 'user-1' });

            connectionHandler(mockSocket);

            expect(mockedJwtVerify).toHaveBeenCalledWith('cookie-token', 'secret');
            expect(mockDisconnect).not.toHaveBeenCalled();
        });

        it('7. باید socket.id رو به Map اضافه کنه', () => {
            mockedJwtVerify.mockReturnValue({ userId: 'user-1' });

            connectionHandler(mockSocket);

            // ✅ چک کنیم که emitToUser با user-1 کار می‌کنه
            emitToUser('user-1', 'test', { data: 'test' });

            expect(mockTo).toHaveBeenCalledWith('socket-1');
            expect(mockEmit).toHaveBeenCalledWith('test', { data: 'test' });
        });

        it('8. باید چند socket برای یک کاربر رو پشتیبانی کنه', () => {
            mockedJwtVerify.mockReturnValue({ userId: 'user-1' });

            const socket2 = { ...mockSocket, id: 'socket-2' };

            connectionHandler(mockSocket);
            connectionHandler(socket2);

            // ✅ ارسال به هر دو socket
            emitToUser('user-1', 'test', { data: 'test' });

            expect(mockTo).toHaveBeenCalledWith('socket-1');
            expect(mockTo).toHaveBeenCalledWith('socket-2');
            expect(mockEmit).toHaveBeenCalledTimes(2);
        });
    });

    // ==========================================================
    //  Disconnect Handler
    // ==========================================================
    describe('disconnect handler', () => {
        beforeEach(() => {
            initializeSocket(mockHttpServer);
        });

        it('9. باید socket.id رو از Map حذف کنه', () => {
            mockedJwtVerify.mockReturnValue({ userId: 'user-1' });

            connectionHandler(mockSocket);

            // ✅ گرفتن disconnect handler
            const disconnectHandler = mockSocket.on.mock.calls.find(
                (call: any[]) => call[0] === 'disconnect'
            )?.[1];

            expect(disconnectHandler).toBeDefined();

            // ✅ صدا زدن disconnect
            disconnectHandler();

            // ✅ حالا emitToUser نباید socket-1 رو صدا بزنه
            emitToUser('user-1', 'test', {});
            expect(mockTo).not.toHaveBeenCalledWith('socket-1');
        });

        it('10. باید فقط socket.id فعلی رو حذف کنه، نه کل کاربر', () => {
            mockedJwtVerify.mockReturnValue({ userId: 'user-1' });

            const socket2 = { ...mockSocket, id: 'socket-2' };

            connectionHandler(mockSocket);
            connectionHandler(socket2);

            // ✅ disconnect socket-1
            const disconnectHandler1 = mockSocket.on.mock.calls.find(
                (call: any[]) => call[0] === 'disconnect'
            )?.[1];
            disconnectHandler1();

            // ✅ socket-2 باید هنوز کار کنه
            emitToUser('user-1', 'test', {});

            expect(mockTo).not.toHaveBeenCalledWith('socket-1');
            expect(mockTo).toHaveBeenCalledWith('socket-2');
        });
    });

    // ==========================================================
    //  emitToUser
    // ==========================================================
    describe('emitToUser', () => {
        beforeEach(() => {
            initializeSocket(mockHttpServer);
        });

        it('11. اگر کاربر آنلاین نباشه، هیچی نمی‌فرسته', () => {
            emitToUser('unknown-user', 'test', {});

            expect(mockTo).not.toHaveBeenCalled();
            expect(mockEmit).not.toHaveBeenCalled();
        });

        it('12. اگر کاربر آنلاین باشه، به همه‌ی socket هاش می‌فرسته', () => {
            mockedJwtVerify.mockReturnValue({ userId: 'user-1' });

            const socket2 = { ...mockSocket, id: 'socket-2' };

            connectionHandler(mockSocket);
            connectionHandler(socket2);

            emitToUser('user-1', 'notification:new', { id: 'notif-1' });

            expect(mockTo).toHaveBeenCalledWith('socket-1');
            expect(mockTo).toHaveBeenCalledWith('socket-2');
            expect(mockEmit).toHaveBeenCalledWith('notification:new', { id: 'notif-1' });
        });
    });
});