// src/services/__tests__/story-media.service.test.ts

// ✅ ماک کردن fs
jest.mock('fs');
jest.mock('path', () => ({
    ...jest.requireActual('path'),
    join: jest.fn((...args) => args.join('/')),
    extname: jest.fn((file) => {
        const parts = file.split('.');
        return parts.length > 1 ? `.${parts.pop()}` : '';
    }),
}));

// ✅ ماک کردن multer
const mockSingle = jest.fn();
jest.mock('multer', () => {
    const multerMock: any = jest.fn(() => ({
        single: mockSingle,
    }));
    multerMock.diskStorage = jest.fn(() => ({}));
    multerMock.MulterError = class MulterError extends Error {
        code: string;
        constructor(code: string) {
            super('Multer Error');
            this.code = code;
        }
    };
    return multerMock;
});

// ✅ ماک کردن crypto
jest.mock('crypto', () => ({
    randomUUID: jest.fn(() => 'test-uuid-1234'),
}));

import fs from 'fs';
import multer from 'multer';
import { uploadStoryMedia, deleteStoryMedia, getStoryMediaType } from '../story-media.service';

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('story-media.service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // ✅ fs.existsSync برای ساخت پوشه در ابتدای فایل
        mockedFs.existsSync = jest.fn((_path: any) => true);
        mockedFs.mkdirSync = jest.fn();
        mockedFs.unlinkSync = jest.fn();
    });

    // =====================================================
    // ✅ تست‌های uploadStoryMedia
    // =====================================================
    describe('uploadStoryMedia', () => {
        const createMockReqRes = (file: any = null) => ({
            req: {
                protocol: 'http',
                get: jest.fn(() => 'localhost:4000'),
                file,
            },
            res: {},
        });

        it('1. باید فایل را با موفقیت آپلود کند و URL کامل برگرداند', async () => {
            const mockFile = {
                filename: 'test-uuid-1234.jpg',
                size: 1024,
                mimetype: 'image/jpeg',
            };

            mockSingle.mockImplementation((_field: string) => (req: any, _res: any, cb: any) => {
                req.file = mockFile;
                cb(null);
            });

            const { req, res } = createMockReqRes();
            const result = await uploadStoryMedia(req, res) as any;

            expect(result.success).toBe(true);
            expect(result.url).toBe('http://localhost:4000/uploads/stories/test-uuid-1234.jpg');
            expect(result.filename).toBe('test-uuid-1234.jpg');
            expect(result.size).toBe(1024);
            expect(result.mimetype).toBe('image/jpeg');
        });

        it('2. اگر فایل ارسال نشود، خطای 400 برگرداند', async () => {
            mockSingle.mockImplementation((_field: string) => (req: any, _res: any, cb: any) => {
                req.file = null;
                cb(null);
            });

            const { req, res } = createMockReqRes();

            await expect(uploadStoryMedia(req, res)).rejects.toEqual({
                status: 400,
                message: 'هیچ فایلی آپلود نشده است.',
            });
        });

        it('3. اگر حجم فایل بیش از حد مجاز باشد، خطای 413 برگرداند', async () => {
            const multerError = new (multer as any).MulterError('LIMIT_FILE_SIZE');

            mockSingle.mockImplementation((_field: string) => (_req: any, _res: any, cb: any) => {
                cb(multerError);
            });

            const { req, res } = createMockReqRes();

            await expect(uploadStoryMedia(req, res)).rejects.toEqual({
                status: 413,
                message: 'حجم فایل انتخابی بیش از حد مجاز (حداکثر ۵۰ مگابایت) است.',
            });
        });

        it('4. اگر فرمت فایل نامعتبر باشد، خطای 400 برگرداند', async () => {
            const filterError = new Error('فرمت فایل پشتیبانی نمی‌شود.');

            mockSingle.mockImplementation((_field: string) => (_req: any, _res: any, cb: any) => {
                cb(filterError);
            });

            const { req, res } = createMockReqRes();

            await expect(uploadStoryMedia(req, res)).rejects.toEqual({
                status: 400,
                message: 'فرمت فایل پشتیبانی نمی‌شود.',
            });
        });

        it('5. اگر خطای عمومی رخ دهد، خطای 500 برگرداند', async () => {
            const genericError = new Error('Unexpected error');

            mockSingle.mockImplementation((_field: string) => (_req: any, _res: any, cb: any) => {
                cb(genericError);
            });

            const { req, res } = createMockReqRes();

            await expect(uploadStoryMedia(req, res)).rejects.toEqual({
                status: 500,
                message: 'Unexpected error',
            });
        });

        it('6. باید از فیلد "media" برای دریافت فایل استفاده کند', async () => {
            mockSingle.mockImplementation(() => (_req: any, _res: any, cb: any) => cb(null));

            const { req, res } = createMockReqRes();
            try {
                await uploadStoryMedia(req, res);
            } catch {
                // ممکن است خطا بده چون فایل نیست
            }

            expect(mockSingle).toHaveBeenCalledWith('media');
        });
    });

    // =====================================================
    // ✅ تست‌های deleteStoryMedia
    // =====================================================
    describe('deleteStoryMedia', () => {
        it('1. باید فایل را با URL نسبی حذف کند', () => {
            mockedFs.existsSync = jest.fn((_path: any) => true);
            mockedFs.unlinkSync = jest.fn();

            const result = deleteStoryMedia('/uploads/stories/test.jpg');

            expect(mockedFs.unlinkSync).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('2. باید فایل را با URL کامل (http) حذف کند', () => {
            mockedFs.existsSync = jest.fn((_path: any) => true);
            mockedFs.unlinkSync = jest.fn();

            const result = deleteStoryMedia('http://localhost:4000/uploads/stories/test.jpg');

            expect(mockedFs.unlinkSync).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('3. اگر URL خالی باشد، false برگرداند', () => {
            expect(deleteStoryMedia(null)).toBe(false);
            expect(deleteStoryMedia(undefined)).toBe(false);
            expect(deleteStoryMedia('')).toBe(false);
        });

        it('4. اگر فایل وجود نداشته باشد، false برگرداند', () => {
            mockedFs.existsSync = jest.fn((_path: any) => false);

            const result = deleteStoryMedia('/uploads/stories/nonexistent.jpg');

            expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('5. اگر خطا رخ دهد، false برگرداند و کرش نکند', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockedFs.existsSync = jest.fn((_path: any) => {
                throw new Error('Permission denied');
            });

            const result = deleteStoryMedia('/uploads/stories/test.jpg');

            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it('6. اگر URL شامل /uploads/stories/ نباشد، false برگرداند', () => {
            mockedFs.existsSync = jest.fn((_path: any) => false);

            const result = deleteStoryMedia('invalid-url-without-path');

            expect(result).toBe(false);
        });
    });

    // =====================================================
    // ✅ تست‌های getStoryMediaType
    // =====================================================
    describe('getStoryMediaType', () => {
        it('1. برای mimetype تصویر، "image" برگرداند', () => {
            expect(getStoryMediaType('image/jpeg')).toBe('image');
            expect(getStoryMediaType('image/png')).toBe('image');
            expect(getStoryMediaType('image/webp')).toBe('image');
            expect(getStoryMediaType('image/gif')).toBe('image');
        });

        it('2. برای mimetype ویدیو، "video" برگرداند', () => {
            expect(getStoryMediaType('video/mp4')).toBe('video');
            expect(getStoryMediaType('video/webm')).toBe('video');
            expect(getStoryMediaType('video/quicktime')).toBe('video');
        });

        it('3. برای mimetype ناشناخته، "image" برگرداند (پیش‌فرض)', () => {
            expect(getStoryMediaType('application/pdf')).toBe('image');
            expect(getStoryMediaType('text/plain')).toBe('image');
            expect(getStoryMediaType('')).toBe('image');
        });
    });
});