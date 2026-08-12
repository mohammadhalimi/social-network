import { Router } from 'express';
import { upload, deleteOldAvatar } from '../services/upload.service';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'هیچ فایلی آپلود نشده است.' });
        }

        // ✅ ۱. دریافت userId از کوکی
        const token = req.cookies?.token || null;
        let userId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
                    userId: string;
                    email: string;
                };
                userId = decoded.userId;
            } catch (error) {
                console.log('❌ توکن نامعتبر');
            }
        }

        // ✅ ۲. اگر userId وجود دارد، عکس قبلی را حذف کن
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { avatar: true },
            });

            if (user?.avatar) {
                // حذف عکس قبلی
                deleteOldAvatar(user.avatar);
            }

            // ✅ ۳. به‌روزرسانی آدرس عکس در دیتابیس
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

            await prisma.user.update({
                where: { id: userId },
                data: { avatar: fileUrl },
            });
        }

        // ✅ ۴. پاسخ به کاربر
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: fileUrl,
            filename: req.file.filename,
        });
    } catch (error: any) {
        console.error('❌ خطا در آپلود:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;