// backend/services/post-media.service.test.ts
//
// تست‌های واحد برای post-media.service.ts
// فریمورک: Jest (+ ts-jest یا babel-jest برای TypeScript)
//
// نکته: چون ماژول در زمان import پوشه آپلود را با fs.existsSync/mkdirSync
// می‌سازد و multer را به صورت instance-level فراخوانی می‌کند، برای کنترل
// کامل رفتار از jest.mock روی 'fs' و 'multer' استفاده شده و ماژول با
// jest.isolateModules/require دوباره بارگذاری می‌شود تا هر تست از حالت
// تمیز شروع کند.

import path from 'path';

// -----------------------------------------------------------------
// Mock: fs
// -----------------------------------------------------------------
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    unlinkSync: jest.fn(),
}));

// -----------------------------------------------------------------
// Mock: multer
// -----------------------------------------------------------------
class MockMulterError extends Error {
    code: string;
    constructor(code: string, message?: string) {
        super(message);
        this.code = code;
        this.name = 'MulterError';
    }
}

// این mockSingle در هر تست با mockImplementation بازتعریف می‌شود تا
// رفتار میان‌افزار multer (موفقیت / خطا / بدون فایل) را شبیه‌سازی کند.
const mockSingle = jest.fn();
// تایپ صریح jest.fn<any, any[]> تا فراخوانی با spread argument بدون خطای TS کار کند
const mockDiskStorage: jest.Mock<any, any[]> = jest.fn((opts: any) => opts);

jest.mock('multer', () => {
    const multerFn: any = jest.fn(() => ({
        single: jest.fn(() => mockSingle),
    }));
    multerFn.diskStorage = (...args: any[]) => mockDiskStorage.apply(null, args);
    multerFn.MulterError = MockMulterError;
    return multerFn;
});

// -----------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------
// این فایل در src/services/__tests__/ قرار دارد و سرویس یک پوشه بالاتر
// در src/services/post-media.service.ts است.
const SERVICE_PATH = '../post-media.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
type ServiceModule = typeof import('../post-media.service');

function loadFreshModule(existsSyncReturn = true): ServiceModule {
    let mod!: ServiceModule;

    jest.isolateModules(() => {
        const fs = require('fs');
        fs.existsSync.mockReturnValue(existsSyncReturn);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        mod = require(SERVICE_PATH);
    });

    return mod;
}

function makeReq(overrides: any = {}) {
    return {
        protocol: 'https',
        get: (key: string) => (key === 'host' ? 'example.com' : undefined),
        file: undefined,
        ...overrides,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

// ===================================================================
// بارگذاری اولیه ماژول (ایجاد پوشه)
// ===================================================================
describe('بارگذاری ماژول - ایجاد پوشه آپلود', () => {
    test('اگر پوشه uploads/posts وجود نداشته باشد، آن را می‌سازد', () => {
        const fs = require('fs');
        loadFreshModule(false); // existsSync -> false
        expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
        expect(fs.mkdirSync).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ recursive: true })
        );
    });

    test('اگر پوشه از قبل وجود داشته باشد، mkdirSync فراخوانی نمی‌شود', () => {
        const fs = require('fs');
        loadFreshModule(true); // existsSync -> true
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
});

// ===================================================================
// getMediaType
// ===================================================================
describe('getMediaType', () => {
    const mod = loadFreshModule(true);

    test('برای mimetype شروع‌شده با image/ مقدار "image" برمی‌گرداند', () => {
        expect(mod.getMediaType('image/png')).toBe('image');
        expect(mod.getMediaType('image/jpeg')).toBe('image');
    });

    test('برای mimetype شروع‌شده با video/ مقدار "video" برمی‌گرداند', () => {
        expect(mod.getMediaType('video/mp4')).toBe('video');
        expect(mod.getMediaType('video/webm')).toBe('video');
    });

    test('برای mimetype ناشناخته، مقدار پیش‌فرض "image" برمی‌گرداند', () => {
        expect(mod.getMediaType('application/pdf')).toBe('image');
        expect(mod.getMediaType('')).toBe('image');
    });
});

// ===================================================================
// deletePostMedia
// ===================================================================
describe('deletePostMedia', () => {
    test('اگر mediaUrl خالی یا null/undefined باشد، false برمی‌گرداند', () => {
        const mod = loadFreshModule(true);
        expect(mod.deletePostMedia(null)).toBe(false);
        expect(mod.deletePostMedia(undefined)).toBe(false);
        expect(mod.deletePostMedia('')).toBe(false);
    });

    test('مسیر نسبی /uploads/posts/... را درست پارس و فایل را حذف می‌کند', () => {
        const fs = require('fs');
        const mod = loadFreshModule(true);
        fs.existsSync.mockReturnValue(true);

        const result = mod.deletePostMedia('/uploads/posts/abc123.png');

        expect(fs.unlinkSync).toHaveBeenCalledWith(
            expect.stringContaining(path.join('abc123.png'))
        );
        expect(result).toBe(true);
    });

    test('URL کامل (http/https) را درست پارس و فایل را حذف می‌کند', () => {
        const fs = require('fs');
        const mod = loadFreshModule(true);
        fs.existsSync.mockReturnValue(true);

        const result = mod.deletePostMedia(
            'https://example.com/uploads/posts/xyz789.mp4'
        );

        expect(fs.unlinkSync).toHaveBeenCalledWith(
            expect.stringContaining('xyz789.mp4')
        );
        expect(result).toBe(true);
    });

    test('اگر ورودی فقط نام فایل باشد (بدون پیشوند)، همان را به عنوان filename استفاده می‌کند', () => {
        const fs = require('fs');
        const mod = loadFreshModule(true);
        fs.existsSync.mockReturnValue(true);

        const result = mod.deletePostMedia('plainfilename.jpg');

        expect(fs.unlinkSync).toHaveBeenCalledWith(
            expect.stringContaining('plainfilename.jpg')
        );
        expect(result).toBe(true);
    });

    test('اگر فایل روی دیسک وجود نداشته باشد، unlinkSync فراخوانی نمی‌شود و false برمی‌گردد', () => {
        const fs = require('fs');
        const mod = loadFreshModule(true);
        fs.existsSync.mockReturnValue(false);

        const result = mod.deletePostMedia('/uploads/posts/missing.png');

        expect(fs.unlinkSync).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    test('اگر fs خطا پرتاب کند، تابع آن را می‌گیرد و false برمی‌گرداند', () => {
        const fs = require('fs');
        const mod = loadFreshModule(true);
        fs.existsSync.mockReturnValue(true);
        fs.unlinkSync.mockImplementation(() => {
            throw new Error('disk error');
        });

        const result = mod.deletePostMedia('/uploads/posts/broken.png');

        expect(result).toBe(false);
    });
});

// ===================================================================
// uploadPostMedia
// ===================================================================
describe('uploadPostMedia', () => {
    test('در حالت موفقیت، آدرس فایل و اطلاعات آن را resolve می‌کند', async () => {
        const mod = loadFreshModule(true);

        mockSingle.mockImplementation((req: any, res: any, cb: any) => {
            req.file = {
                filename: 'generated-uuid.png',
                size: 12345,
                mimetype: 'image/png',
            };
            cb(null);
        });

        const req = makeReq();
        const res = {};

        const result: any = await mod.uploadPostMedia(req, res);

        expect(result).toEqual({
            success: true,
            url: 'https://example.com/uploads/posts/generated-uuid.png',
            filename: 'generated-uuid.png',
            size: 12345,
            mimetype: 'image/png',
        });
    });

    test('اگر هیچ فایلی ارسال نشده باشد، با status 400 reject می‌کند', async () => {
        const mod = loadFreshModule(true);

        mockSingle.mockImplementation((req: any, res: any, cb: any) => {
            req.file = undefined;
            cb(null);
        });

        const req = makeReq();
        const res = {};

        await expect(mod.uploadPostMedia(req, res)).rejects.toEqual({
            status: 400,
            message: 'هیچ فایلی آپلود نشده است.',
        });
    });

    test('خطای LIMIT_FILE_SIZE از multer را با status 413 reject می‌کند', async () => {
        const mod = loadFreshModule(true);

        mockSingle.mockImplementation((req: any, res: any, cb: any) => {
            const err = new MockMulterError('LIMIT_FILE_SIZE', 'File too large');
            cb(err);
        });

        const req = makeReq();
        const res = {};

        await expect(mod.uploadPostMedia(req, res)).rejects.toEqual({
            status: 413,
            message: 'حجم فایل انتخابی بیش از حد مجاز (حداکثر ۵۰ مگابایت) است.',
        });
    });

    test('خطای فیلتر فرمت فایل را با status 400 و همان پیام reject می‌کند', async () => {
        const mod = loadFreshModule(true);
        const filterMessage =
            'فرمت فایل پشتیبانی نمی‌شود. فقط تصاویر (JPG, PNG, GIF, WEBP) و ویدیوها (MP4, WebM) مجاز هستند.';

        mockSingle.mockImplementation((req: any, res: any, cb: any) => {
            cb(new Error(filterMessage));
        });

        const req = makeReq();
        const res = {};

        await expect(mod.uploadPostMedia(req, res)).rejects.toEqual({
            status: 400,
            message: filterMessage,
        });
    });

    test('سایر خطاها را با status 500 reject می‌کند', async () => {
        const mod = loadFreshModule(true);

        mockSingle.mockImplementation((req: any, res: any, cb: any) => {
            cb(new Error('یک خطای غیرمنتظره'));
        });

        const req = makeReq();
        const res = {};

        await expect(mod.uploadPostMedia(req, res)).rejects.toEqual({
            status: 500,
            message: 'یک خطای غیرمنتظره',
        });
    });

    test('اگر خطا بدون پیام باشد، پیام پیش‌فرض "خطا در آپلود فایل" برگردانده می‌شود', async () => {
        const mod = loadFreshModule(true);

        mockSingle.mockImplementation((req: any, res: any, cb: any) => {
            const err: any = new Error();
            err.message = '';
            cb(err);
        });

        const req = makeReq();
        const res = {};

        await expect(mod.uploadPostMedia(req, res)).rejects.toEqual({
            status: 500,
            message: 'خطا در آپلود فایل',
        });
    });
});