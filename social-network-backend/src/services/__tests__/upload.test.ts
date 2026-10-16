import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs'; // اگر از bcryptjs استفاده می‌کنید، عوضش کنید
import request from 'supertest';
import { app } from '../../index';
import prisma from '../../lib/prisma';

// ⚠️ همان مسیر uploads که برنامه استفاده می‌کند (فقط برای "خواندن" و پاک کردن فایل‌های خود تست)
const uploadDir = path.join(__dirname, '../../../uploads');

const TEST_EMAIL = 'upload-test-user@example.com';
const TEST_PASSWORD = 'Test@1234';
const TEST_USERNAME = 'upload_test_user';
const TEST_FULLNAME = 'Upload Test User';
// ==========================================================
//  ردیابی فایل‌هایی که خود تست ساخته
//  تست هیچ‌وقت پوشه را اسکن و پاک نمی‌کند؛ فقط همین فایل‌ها را حذف می‌کند
// ==========================================================
const createdFiles = new Set<string>();

const filePathOf = (filename: string) => path.join(uploadDir, path.basename(filename));
// path.basename یعنی حتی اگر filename عجیب باشد، از uploadDir بیرون نمی‌رود

const track = (res: request.Response) => {
    if (res.body?.filename) createdFiles.add(res.body.filename);
    return res;
};

const uploadAvatar = (filename: string, content: Buffer | string, token?: string) => {
    const req = request(app)
        .post('/upload-avatar')
        .attach('avatar', Buffer.isBuffer(content) ? content : Buffer.from(content), filename);
    if (token) req.set('Cookie', `token=${token}`); // به‌جای Authorization
    return req.then(track);
};

describe('Upload Avatar - Integration Tests', () => {
    beforeAll(async () => {
        const hashed = await bcrypt.hash(TEST_PASSWORD, 10);
        // ⚠️ فیلدها را با مدل User خودتان تطبیق دهید
        await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
        await prisma.user.create({
            data: {
                email: TEST_EMAIL,
                password: hashed,
                username: TEST_USERNAME,      // ✅ اضافه شد
                fullName: TEST_FULLNAME,
            },
        });
    });

    afterEach(() => {
        for (const filename of createdFiles) {
            const p = filePathOf(filename);
            // فقط فایل (نه پوشه) و فقط اگر هنوز وجود دارد
            if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                fs.unlinkSync(p);
            }
        }
        createdFiles.clear();
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
        await prisma.$disconnect();
    });

    it('should upload an image successfully', async () => {
        const res = await uploadAvatar('test.jpg', 'fake image content');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('url');
        expect(res.body.filename).toMatch(/^[a-f0-9-]+\.jpg$/);
        expect(fs.existsSync(filePathOf(res.body.filename))).toBe(true);
    });

    it('should return error when no file is uploaded', async () => {
        const res = await request(app).post('/upload-avatar').field('dummy', 'x');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('هیچ فایلی آپلود نشده است.');
    });

    it('should reject invalid file formats', async () => {
        const res = await uploadAvatar('test.txt', 'fake text');

        expect([400, 500]).toContain(res.status);
        expect(res.body.error).toMatch(/فرمت|پشتیبانی|نامعتبر/i);
    });

    it('should reject files larger than 5MB', async () => {
        const res = await uploadAvatar('large.jpg', Buffer.alloc(6 * 1024 * 1024));

        expect(res.status).toBe(413);
        expect(res.body.error).toMatch(/حجم|بزرگ/i);
    });

    it('should delete old avatar when uploading new one with auth', async () => {
        const login = await request(app)
            .post('/graphql')
            .send({
                query: `mutation { login(email: "${TEST_EMAIL}", password: "${TEST_PASSWORD}") { token } }`,
            });
        const token = login.body.data?.login?.token;
        if (!token) throw new Error(`Login failed: ${JSON.stringify(login.body)}`);

        const first = await uploadAvatar('avatar1.jpg', 'fake image content', token);
        expect(first.status).toBe(200);
        expect(fs.existsSync(filePathOf(first.body.filename))).toBe(true);

        const second = await uploadAvatar('avatar2.jpg', 'fake image content 2', token);
        expect(second.status).toBe(200);

        // فقط درباره‌ی فایل‌های خود تست حکم می‌دهیم
        expect(fs.existsSync(filePathOf(first.body.filename))).toBe(false);
        expect(fs.existsSync(filePathOf(second.body.filename))).toBe(true);

        const user = await prisma.user.findUnique({
            where: { email: TEST_EMAIL },
            select: { avatar: true },
        });
        expect(user?.avatar).toContain(second.body.filename);
    });
});