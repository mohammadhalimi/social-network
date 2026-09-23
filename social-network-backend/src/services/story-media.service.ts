// src/services/story-media.service.ts
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';

// =============================================
// ✅ تنظیمات پوشه آپلود استوری
// =============================================

const storiesUploadDir = path.join(__dirname, '../../uploads/stories');

// ایجاد پوشه اگر وجود ندارد
if (!fs.existsSync(storiesUploadDir)) {
    fs.mkdirSync(storiesUploadDir, { recursive: true });
    console.log(`📁 پوشه استوری‌ها ایجاد شد: ${storiesUploadDir}`);
}

// =============================================
// ✅ تنظیمات ذخیره‌سازی
// =============================================

const storiesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storiesUploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${randomUUID()}${ext}`;
        cb(null, filename);
    },
});

// =============================================
// ✅ فیلتر فایل‌ها (تصاویر و ویدیوها)
// =============================================

const storiesFileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('فرمت فایل پشتیبانی نمی‌شود. فقط تصاویر (JPG, PNG, GIF, WEBP) و ویدیوها (MP4, WebM) مجاز هستند.'));
    }
};

// =============================================
// ✅ نمونه multer برای آپلود رسانه استوری
// =============================================

export const storyMediaUpload = multer({
    storage: storiesStorage,
    fileFilter: storiesFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // ۵۰ مگابایت
    },
});

// =============================================
// ✅ تابع آپلود رسانه استوری
// =============================================

export const uploadStoryMedia = (req: any, res: any) => {
    return new Promise((resolve, reject) => {
        storyMediaUpload.single('media')(req, res, (err: any) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return reject({
                            status: 413,
                            message: 'حجم فایل انتخابی بیش از حد مجاز (حداکثر ۵۰ مگابایت) است.'
                        });
                    }
                }

                if (err.message && err.message.includes('فرمت')) {
                    return reject({
                        status: 400,
                        message: err.message
                    });
                }

                return reject({
                    status: 500,
                    message: err.message || 'خطا در آپلود فایل'
                });
            }

            if (!req.file) {
                return reject({
                    status: 400,
                    message: 'هیچ فایلی آپلود نشده است.'
                });
            }

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const fileUrl = `${baseUrl}/uploads/stories/${req.file.filename}`;

            resolve({
                success: true,
                url: fileUrl,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
            });
        });
    });
};

// =============================================
// ✅ تابع حذف رسانه استوری
// =============================================

export const deleteStoryMedia = (mediaUrl: string | null | undefined): boolean => {
    if (!mediaUrl) return false;

    try {
        let filename: string | null = null;

        if (mediaUrl.startsWith('/uploads/stories/')) {
            filename = mediaUrl.replace('/uploads/stories/', '');
        } else if (mediaUrl.startsWith('http')) {
            const parts = mediaUrl.split('/uploads/stories/');
            if (parts.length > 1) {
                filename = parts[1];
            }
        } else {
            filename = mediaUrl;
        }

        if (!filename) return false;

        const filepath = path.join(storiesUploadDir, filename);

        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`✅ فایل استوری حذف شد: ${filename}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error('❌ خطا در حذف فایل استوری:', error);
        return false;
    }
};

// =============================================
// ✅ تابع بررسی نوع فایل
// =============================================

export const getStoryMediaType = (mimetype: string): 'image' | 'video' => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    return 'image';
};