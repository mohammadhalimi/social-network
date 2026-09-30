// src/routes/__tests__/post-media.route.test.ts

jest.mock('../../services/post-media.service', () => ({
    uploadPostMedia: jest.fn(),
    deletePostMedia: jest.fn(),
}));

import express from 'express';
import request from 'supertest';
import postsRoutes from '../post-media.route';
import { uploadPostMedia, deletePostMedia } from '../../services/post-media.service';

const mockedUploadPostMedia = uploadPostMedia as jest.Mock;
const mockedDeletePostMedia = deletePostMedia as jest.Mock;

// ✅ ساخت اپ Express برای تست
const app = express();
app.use(express.json());
app.use('/', postsRoutes);

describe('post-media.route', () => {
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
    //  POST /upload-post-media
    // ==========================================================
    describe('POST /upload-post-media', () => {
        it('1. باید فایل را با موفقیت آپلود کند و پاسخ JSON برگرداند', async () => {
            mockedUploadPostMedia.mockResolvedValue({
                url: 'http://localhost:4000/uploads/posts/test.jpg',
                filename: 'test.jpg',
                size: 1024,
                mimetype: 'image/jpeg',
            });

            const response = await request(app).post('/upload-post-media');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                url: 'http://localhost:4000/uploads/posts/test.jpg',
                filename: 'test.jpg',
                size: 1024,
                mimetype: 'image/jpeg',
            });
        });

        it('2. اگر سرویس خطای 400 بدهد، وضعیت و پیام خطا برگردانده شود', async () => {
            mockedUploadPostMedia.mockRejectedValue({
                status: 400,
                message: 'هیچ فایلی آپلود نشده است.',
            });

            const response = await request(app).post('/upload-post-media');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                error: 'هیچ فایلی آپلود نشده است.',
            });
            // ✅ خطاهای کلاینت باید با warn لاگ شوند
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('3. اگر سرویس خطای 413 (حجم زیاد) بدهد، وضعیت 413 برگردانده شود', async () => {
            mockedUploadPostMedia.mockRejectedValue({
                status: 413,
                message: 'حجم فایل بیش از حد مجاز است.',
            });

            const response = await request(app).post('/upload-post-media');

            expect(response.status).toBe(413);
            expect(response.body.error).toBe('حجم فایل بیش از حد مجاز است.');
        });

        it('4. اگر سرویس خطای 500 بدهد، با error لاگ شود', async () => {
            mockedUploadPostMedia.mockRejectedValue({
                status: 500,
                message: 'خطای سرور',
            });

            const response = await request(app).post('/upload-post-media');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('خطای سرور');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('5. اگر خطا status نداشته باشد، پیش‌فرض 500 استفاده شود', async () => {
            mockedUploadPostMedia.mockRejectedValue(new Error('Unknown error'));

            const response = await request(app).post('/upload-post-media');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Unknown error');
        });

        it('6. اگر پیام خطا نداشته باشد، پیام پیش‌فرض برگردانده شود', async () => {
            mockedUploadPostMedia.mockRejectedValue({ status: 400 });

            const response = await request(app).post('/upload-post-media');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('خطا در آپلود فایل');
        });
    });

    // ==========================================================
    //  DELETE /delete-post-media
    // ==========================================================
    describe('DELETE /delete-post-media', () => {
        it('1. اگر URL ارسال شود و فایل حذف شود، پاسخ موفق برگرداند', async () => {
            mockedDeletePostMedia.mockReturnValue(true);

            const response = await request(app)
                .delete('/delete-post-media')
                .send({ url: 'http://localhost:4000/uploads/posts/test.jpg' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'فایل با موفقیت حذف شد.',
            });
            expect(mockedDeletePostMedia).toHaveBeenCalledWith(
                'http://localhost:4000/uploads/posts/test.jpg'
            );
        });

        it('2. اگر فایل یافت نشود، success: false برگرداند', async () => {
            mockedDeletePostMedia.mockReturnValue(false);

            const response = await request(app)
                .delete('/delete-post-media')
                .send({ url: 'http://localhost:4000/uploads/posts/missing.jpg' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: false,
                message: 'فایل یافت نشد.',
            });
        });

        it('3. اگر URL ارسال نشود، خطای 400 برگرداند', async () => {
            const response = await request(app)
                .delete('/delete-post-media')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('URL فایل ارسال نشده است.');
            expect(mockedDeletePostMedia).not.toHaveBeenCalled();
        });

        it('4. اگر خطا رخ دهد، وضعیت 500 و پیام خطا برگرداند', async () => {
            mockedDeletePostMedia.mockImplementation(() => {
                throw new Error('Delete failed');
            });

            const response = await request(app)
                .delete('/delete-post-media')
                .send({ url: 'http://test.com/file.jpg' });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Delete failed');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });
});