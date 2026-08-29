import express from 'express';
import request from 'supertest';

const ROUTE_PATH = '../upload.route';

// -----------------------------------------------------------------
// Mock: multer
// فقط MulterError لازم است تا router بتواند instanceof را چک کند.
// -----------------------------------------------------------------
class MockMulterError extends Error {
    code: string;
    constructor(code: string, message?: string) {
        super(message);
        this.code = code;
        this.name = 'MulterError';
    }
}

jest.mock('multer', () => {
    const multerFn: any = jest.fn();
    multerFn.MulterError = MockMulterError;
    return multerFn;
});

// -----------------------------------------------------------------
// Mock: jsonwebtoken
// -----------------------------------------------------------------
jest.mock('jsonwebtoken');

// -----------------------------------------------------------------
// Mock: prisma
// -----------------------------------------------------------------
jest.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

// -----------------------------------------------------------------
// Mock: upload.service
// mockMiddleware رفتار میان‌افزار multer.single('avatar') را در هر تست
// شبیه‌سازی می‌کند (موفقیت / بدون فایل / خطا).
// -----------------------------------------------------------------
const mockMiddleware = jest.fn();

jest.mock('../../services/upload.service', () => ({
    upload: {
        single: jest.fn(() => mockMiddleware),
    },
    deleteOldAvatar: jest.fn(),
}));

// -----------------------------------------------------------------
// Importها (بعد از jest.mock انجام می‌شوند - هوایست خودکار جست)
// -----------------------------------------------------------------
import multer from 'multer';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { upload, deleteOldAvatar } from '../../services/upload.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const router = require(ROUTE_PATH).default;

const mockedJwtVerify = jwt.verify as jest.Mock;
const mockedFindUnique = (prisma as any).user.findUnique as jest.Mock;
const mockedUpdate = (prisma as any).user.update as jest.Mock;
const mockedDeleteOldAvatar = deleteOldAvatar as jest.Mock;

// -----------------------------------------------------------------
// ساخت اپلیکیشن Express برای تست
// -----------------------------------------------------------------
function parseCookieHeader(header?: string): Record<string, string> {
    if (!header) return {};
    return Object.fromEntries(
        header
            .split(';')
            .map((pair) => pair.trim())
            .filter(Boolean)
            .map((pair) => {
                const idx = pair.indexOf('=');
                const key = pair.slice(0, idx);
                const value = decodeURIComponent(pair.slice(idx + 1));
                return [key, value];
            })
    );
}

function buildApp() {
    const app = express();
    app.use((req: any, _res, next) => {
        req.cookies = parseCookieHeader(req.headers.cookie);
        next();
    });
    app.use(router);
    return app;
}

beforeEach(() => {
    jest.clearAllMocks();
});

// ===================================================================
// موفقیت‌آمیز - بدون توکن
// ===================================================================
describe('POST /upload-avatar - بدون توکن', () => {
    test('فایل را آپلود می‌کند و بدون تعامل با prisma پاسخ موفق برمی‌گرداند', async () => {
        mockMiddleware.mockImplementation((req: any, _res: any, cb: any) => {
            req.file = { filename: 'avatar-abc.png' };
            cb(null);
        });

        const app = buildApp();
        const res = await request(app).post('/upload-avatar');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            url: expect.stringContaining('/uploads/avatar-abc.png'),
            filename: 'avatar-abc.png',
        });

        expect(mockedJwtVerify).not.toHaveBeenCalled();
        expect(mockedFindUnique).not.toHaveBeenCalled();
        expect(mockedUpdate).not.toHaveBeenCalled();
        expect(mockedDeleteOldAvatar).not.toHaveBeenCalled();
    });
});

// ===================================================================
// موفقیت‌آمیز - با توکن معتبر
// ===================================================================
describe('POST /upload-avatar - با توکن معتبر', () => {
    test('آواتار قبلی را حذف و پروفایل کاربر را با URL جدید آپدیت می‌کند', async () => {
        mockMiddleware.mockImplementation((req: any, _res: any, cb: any) => {
            req.file = { filename: 'avatar-new.png' };
            cb(null);
        });

        mockedJwtVerify.mockReturnValue({ userId: 'user-1', email: 'a@a.com' });
        mockedFindUnique.mockResolvedValue({
            avatar: 'https://example.com/uploads/avatar-old.png',
        });
        mockedUpdate.mockResolvedValue({});

        const app = buildApp();
        const res = await request(app)
            .post('/upload-avatar')
            .set('Cookie', ['token=valid-token']);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.filename).toBe('avatar-new.png');

        expect(mockedJwtVerify).toHaveBeenCalledWith('valid-token', expect.any(String));
        expect(mockedFindUnique).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            select: { avatar: true },
        });
        expect(mockedDeleteOldAvatar).toHaveBeenCalledWith(
            'https://example.com/uploads/avatar-old.png'
        );
        expect(mockedUpdate).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { avatar: expect.stringContaining('/uploads/avatar-new.png') },
        });
    });

    test('اگر کاربر آواتار قبلی نداشته باشد، deleteOldAvatar فراخوانی نمی‌شود', async () => {
        mockMiddleware.mockImplementation((req: any, _res: any, cb: any) => {
            req.file = { filename: 'avatar-new2.png' };
            cb(null);
        });

        mockedJwtVerify.mockReturnValue({ userId: 'user-2', email: 'b@b.com' });
        mockedFindUnique.mockResolvedValue({ avatar: null });
        mockedUpdate.mockResolvedValue({});

        const app = buildApp();
        const res = await request(app)
            .post('/upload-avatar')
            .set('Cookie', ['token=valid-token']);

        expect(res.status).toBe(200);
        expect(mockedDeleteOldAvatar).not.toHaveBeenCalled();
        expect(mockedUpdate).toHaveBeenCalled();
    });
});

// ===================================================================
// توکن نامعتبر
// ===================================================================
describe('POST /upload-avatar - توکن نامعتبر یا منقضی', () => {
    test('در صورت خطای jwt.verify، بدون تماس با prisma پاسخ موفق برمی‌گرداند', async () => {
        mockMiddleware.mockImplementation((req: any, _res: any, cb: any) => {
            req.file = { filename: 'avatar-anon.png' };
            cb(null);
        });

        mockedJwtVerify.mockImplementation(() => {
            throw new Error('jwt malformed');
        });

        const app = buildApp();
        const res = await request(app)
            .post('/upload-avatar')
            .set('Cookie', ['token=bad-token']);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(mockedFindUnique).not.toHaveBeenCalled();
        expect(mockedUpdate).not.toHaveBeenCalled();
        expect(mockedDeleteOldAvatar).not.toHaveBeenCalled();
    });
});

// ===================================================================
// بدون فایل
// ===================================================================
describe('POST /upload-avatar - بدون فایل', () => {
    test('اگر req.file ست نشود، با 400 پاسخ می‌دهد', async () => {
        mockMiddleware.mockImplementation((_req: any, _res: any, cb: any) => {
            cb(null);
        });

        const app = buildApp();
        const res = await request(app).post('/upload-avatar');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'هیچ فایلی آپلود نشده است.' });
    });
});

// ===================================================================
// خطاهای multer
// ===================================================================
describe('POST /upload-avatar - خطاهای میان‌افزار آپلود', () => {
    test('خطای LIMIT_FILE_SIZE با status 413 و پیام فارسی برمی‌گردد', async () => {
        mockMiddleware.mockImplementation((_req: any, _res: any, cb: any) => {
            cb(new multer.MulterError('LIMIT_FILE_SIZE', 'File too large'));
        });

        const app = buildApp();
        const res = await request(app).post('/upload-avatar');

        expect(res.status).toBe(413);
        expect(res.body).toEqual({
            error: 'حجم فایل بیش از حد مجاز است (حداکثر 5 مگابایت).',
        });
    });

    test('خطای عمومی با status 500 و پیام خطا برمی‌گردد', async () => {
        mockMiddleware.mockImplementation((_req: any, _res: any, cb: any) => {
            cb(new Error('فرمت فایل نامعتبر است'));
        });

        const app = buildApp();
        const res = await request(app).post('/upload-avatar');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'فرمت فایل نامعتبر است' });
    });

    test('اگر خطا بدون پیام باشد، پیام پیش‌فرض "خطا در آپلود فایل." برمی‌گردد', async () => {
        mockMiddleware.mockImplementation((_req: any, _res: any, cb: any) => {
            const err: any = new Error();
            err.message = '';
            cb(err);
        });

        const app = buildApp();
        const res = await request(app).post('/upload-avatar');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'خطا در آپلود فایل.' });
    });
});

// ===================================================================
// خطای غیرمنتظره داخل هندلر (مثلاً خطای دیتابیس)
// ===================================================================
describe('POST /upload-avatar - خطای غیرمنتظره در هندلر', () => {
    test('اگر prisma.user.findUnique خطا بدهد، با 500 و پیام خطا پاسخ می‌دهد', async () => {
        mockMiddleware.mockImplementation((req: any, _res: any, cb: any) => {
            req.file = { filename: 'avatar-db-error.png' };
            cb(null);
        });

        mockedJwtVerify.mockReturnValue({ userId: 'user-3', email: 'c@c.com' });
        mockedFindUnique.mockRejectedValue(new Error('Database connection lost'));

        const app = buildApp();
        const res = await request(app)
            .post('/upload-avatar')
            .set('Cookie', ['token=valid-token']);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Database connection lost' });
        expect(mockedUpdate).not.toHaveBeenCalled();
    });
});