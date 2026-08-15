import multer from 'multer';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { upload, deleteOldAvatar } from '../services/upload.service';

const router = Router();

router.post(
    '/upload-avatar',
    // ✅ میان‌افزار به‌صورت inline (بدون type صریح Request/Response/NextFunction)
    (req, res, next) => {
        upload.single('avatar')(req, res, (err: any) => {
            if (err) {
                if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({
                        error: 'حجم فایل بیش از حد مجاز است (حداکثر 5 مگابایت).',
                    });
                }
                return res.status(500).json({
                    error: err.message || 'خطا در آپلود فایل.',
                });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'هیچ فایلی آپلود نشده است.' });
            }

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

            if (userId) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { avatar: true },
                });

                if (user?.avatar) {
                    deleteOldAvatar(user.avatar);
                }

                const baseUrl = `${req.protocol}://${req.get('host')}`;
                const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

                await prisma.user.update({
                    where: { id: userId },
                    data: { avatar: fileUrl },
                });
            }

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
    }
);

export default router;