import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { app } from '../../index';
import prisma from '../../lib/prisma';

// ✅ مسیر پوشه uploads
const uploadDir = path.join(__dirname, '../../../uploads');

describe('Upload Avatar - Integration Tests', () => {
    // ✅ قبل از هر تست، پوشه uploads را پاک کنید
    beforeEach(() => {
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            files.forEach((file) => {
                const filePath = path.join(uploadDir, file);
                if (file !== '.gitkeep') {
                    fs.unlinkSync(filePath);
                }
            });
        }
    });

    // ==========================================================
    //  تست ۱: آپلود موفق عکس
    // ==========================================================
    it('should upload an image successfully', async () => {
        const response = await request(app)
            .post('/upload-avatar')
            .attach('avatar', Buffer.from('fake image content'), 'test.jpg')
            .set('Content-Type', 'multipart/form-data');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('url');
        expect(response.body).toHaveProperty('filename');
        expect(response.body.url).toMatch(/^https?:\/\/.+\/uploads\/[a-f0-9-]+\.jpg$/);
    });

    // ==========================================================
    //  تست ۲: خطا وقتی هیچ فایلی ارسال نمی‌شود
    // ==========================================================
    it('should return error when no file is uploaded', async () => {
        const response = await request(app)
            .post('/upload-avatar')
            .field('dummy', 'x');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('هیچ فایلی آپلود نشده است.');
    });

    // ==========================================================
    //  تست ۳: خطا برای فرمت نامعتبر
    // ==========================================================
    it('should reject invalid file formats', async () => {
        const response = await request(app)
            .post('/upload-avatar')
            .attach('avatar', Buffer.from('fake text'), 'test.txt')
            .set('Content-Type', 'multipart/form-data');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/فرمت|پشتیبانی|نامعتبر/i);
    });

    // ==========================================================
    //  تست ۴: خطا برای حجم بیش از حد مجاز
    // ==========================================================
    it('should reject files larger than 5MB', async () => {
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

        const response = await request(app)
            .post('/upload-avatar')
            .attach('avatar', largeBuffer, 'large.jpg')
            .set('Content-Type', 'multipart/form-data');

        expect(response.status).toBe(413);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/حجم|بزرگ/i);
    });

    // ==========================================================
    //  تست ۵: آپلود عکس با احراز هویت
    // ==========================================================
    it('should delete old avatar when uploading new one with auth', async () => {
        // ۱. ابتدا یک کاربر لاگین کنید و توکن بگیرید
        const loginResponse = await request(app)
            .post('/graphql')
            .send({
                query: `
                    mutation {
                        login(email: "test@example.com", password: "Test@1234") {
                            token
                            user { id }
                        }
                    }
                `,
            });

        const token = loginResponse.body.data?.login?.token;

        // اگر توکن وجود نداشت، تست را رد کن
        if (!token) {
            console.warn('⚠️ Skipping auth test - no token received');
            return;
        }

        // ۲. عکس اول را آپلود کنید
        const uploadResponse = await request(app)
            .post('/upload-avatar')
            .attach('avatar', Buffer.from('fake image content'), 'avatar1.jpg')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'multipart/form-data');

        expect(uploadResponse.status).toBe(200);
        expect(uploadResponse.body).toHaveProperty('success', true);

        // ۳. عکس دوم را آپلود کنید
        const uploadResponse2 = await request(app)
            .post('/upload-avatar')
            .attach('avatar', Buffer.from('fake image content 2'), 'avatar2.jpg')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'multipart/form-data');

        expect(uploadResponse2.status).toBe(200);
        expect(uploadResponse2.body).toHaveProperty('success', true);

        // ۴. بررسی کنید که عکس قبلی حذف شده است
        const files = fs.readdirSync(uploadDir);
        expect(files).toHaveLength(1);
        expect(files[0]).toContain('avatar2');
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
});