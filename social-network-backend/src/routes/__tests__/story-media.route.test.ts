// src/routes/__tests__/story-media.route.test.ts

jest.mock('../../services/story-media.service', () => ({
    uploadStoryMedia: jest.fn(),
    deleteStoryMedia: jest.fn(),
}));

import express from 'express';
import request from 'supertest';
import storyMediaRoutes from '../story-media.route';
import { uploadStoryMedia, deleteStoryMedia } from '../../services/story-media.service';

const mockedUploadStoryMedia = uploadStoryMedia as jest.Mock;
const mockedDeleteStoryMedia = deleteStoryMedia as jest.Mock;

const app = express();
app.use(express.json());
app.use('/', storyMediaRoutes);

describe('story-media.route', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    // ==========================================================
    //  POST /upload-story-media
    // ==========================================================
    describe('POST /upload-story-media', () => {
        it('1. باید فایل استوری را با موفقیت آپلود کند', async () => {
            mockedUploadStoryMedia.mockResolvedValue({
                url: 'http://localhost:4000/uploads/stories/test.jpg',
                filename: 'test.jpg',
                size: 2048,
                mimetype: 'image/jpeg',
            });

            const response = await request(app).post('/upload-story-media');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                url: 'http://localhost:4000/uploads/stories/test.jpg',
                filename: 'test.jpg',
                size: 2048,
                mimetype: 'image/jpeg',
            });
        });

        it('2. اگر فایلی ارسال نشود (خطای 400)، پاسخ مناسب برگرداند', async () => {
            mockedUploadStoryMedia.mockRejectedValue({
                status: 400,
                message: 'هیچ فایلی آپلود نشده است.',
            });

            const response = await request(app).post('/upload-story-media');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('هیچ فایلی آپلود نشده است.');
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('3. اگر حجم فایل زیاد باشد (خطای 413)، پاسخ مناسب برگرداند', async () => {
            mockedUploadStoryMedia.mockRejectedValue({
                status: 413,
                message: 'حجم فایل انتخابی بیش از حد مجاز (حداکثر ۵۰ مگابایت) است.',
            });

            const response = await request(app).post('/upload-story-media');

            expect(response.status).toBe(413);
            expect(response.body.error).toBe(
                'حجم فایل انتخابی بیش از حد مجاز (حداکثر ۵۰ مگابایت) است.'
            );
        });

        it('4. اگر فرمت فایل نامعتبر باشد (خطای 400)، پیام مناسب برگرداند', async () => {
            mockedUploadStoryMedia.mockRejectedValue({
                status: 400,
                message: 'فرمت فایل پشتیبانی نمی‌شود.',
            });

            const response = await request(app).post('/upload-story-media');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('فرمت فایل پشتیبانی نمی‌شود.');
        });

        it('5. اگر سرویس خطای 500 بدهد، با error لاگ شود', async () => {
            mockedUploadStoryMedia.mockRejectedValue({
                status: 500,
                message: 'خطای سرور',
            });

            const response = await request(app).post('/upload-story-media');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('خطای سرور');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('6. اگر خطا status نداشته باشد، پیش‌فرض 500 استفاده شود', async () => {
            mockedUploadStoryMedia.mockRejectedValue(new Error('Unknown error'));

            const response = await request(app).post('/upload-story-media');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Unknown error');
        });

        it('7. اگر پیام خطا نداشته باشد، پیام پیش‌فرض برگردانده شود', async () => {
            mockedUploadStoryMedia.mockRejectedValue({ status: 400 });

            const response = await request(app).post('/upload-story-media');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('خطا در آپلود فایل استوری');
        });
    });

    // ==========================================================
    //  DELETE /delete-story-media
    // ==========================================================
    describe('DELETE /delete-story-media', () => {
        it('1. اگر URL ارسال شود و فایل حذف شود، پاسخ موفق برگرداند', async () => {
            mockedDeleteStoryMedia.mockReturnValue(true);

            const response = await request(app)
                .delete('/delete-story-media')
                .send({ url: 'http://localhost:4000/uploads/stories/test.jpg' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'فایل استوری با موفقیت حذف شد.',
            });
            expect(mockedDeleteStoryMedia).toHaveBeenCalledWith(
                'http://localhost:4000/uploads/stories/test.jpg'
            );
        });

        it('2. اگر فایل یافت نشود، success: false برگرداند', async () => {
            mockedDeleteStoryMedia.mockReturnValue(false);

            const response = await request(app)
                .delete('/delete-story-media')
                .send({ url: 'http://localhost:4000/uploads/stories/missing.jpg' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: false,
                message: 'فایل یافت نشد.',
            });
        });

        it('3. اگر URL ارسال نشود، خطای 400 برگرداند', async () => {
            const response = await request(app)
                .delete('/delete-story-media')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('URL فایل ارسال نشده است.');
            expect(mockedDeleteStoryMedia).not.toHaveBeenCalled();
        });

        it('4. اگر خطا رخ دهد، وضعیت 500 و پیام خطا برگرداند', async () => {
            mockedDeleteStoryMedia.mockImplementation(() => {
                throw new Error('Delete failed');
            });

            const response = await request(app)
                .delete('/delete-story-media')
                .send({ url: 'http://test.com/file.jpg' });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Delete failed');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });
});