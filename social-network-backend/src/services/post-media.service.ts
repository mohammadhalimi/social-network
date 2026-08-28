// backend/services/post-media.service.ts
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';

// =============================================
// ✅ تنظیمات پوشه آپلود پست‌ها
// =============================================

const postsUploadDir = path.join(__dirname, '../../uploads/posts');

// ایجاد پوشه اگر وجود ندارد
if (!fs.existsSync(postsUploadDir)) {
    fs.mkdirSync(postsUploadDir, { recursive: true });
    console.log(`📁 پوشه پست‌ها ایجاد شد: ${postsUploadDir}`);
}

// =============================================
// ✅ تنظیمات ذخیره‌سازی
// =============================================

const postsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, postsUploadDir);
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

const postsFileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('فرمت فایل پشتیبانی نمی‌شود. فقط تصاویر (JPG, PNG, GIF, WEBP) و ویدیوها (MP4, WebM) مجاز هستند.'));
    }
};

// =============================================
// ✅ نمونه multer برای آپلود رسانه پست
// =============================================

export const postMediaUpload = multer({
    storage: postsStorage,
    fileFilter: postsFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 مگابایت
    },
});

// =============================================
// ✅ تابع آپلود رسانه پست
// =============================================

export const uploadPostMedia = (req: any, res: any) => {
    return new Promise((resolve, reject) => {
        postMediaUpload.single('media')(req, res, (err: any) => {
            if (err) {
                // ✅ مدیریت خطاهای multer
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return reject({
                            status: 413,
                            message: 'حجم فایل انتخابی بیش از حد مجاز (حداکثر ۵۰ مگابایت) است.'
                        });
                    }
                }
                
                // ✅ خطای فیلتر (فرمت فایل)
                if (err.message && err.message.includes('فرمت')) {
                    return reject({
                        status: 400,
                        message: err.message
                    });
                }
                
                // ✅ خطای عمومی
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

            // موفقیت
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const fileUrl = `${baseUrl}/uploads/posts/${req.file.filename}`;

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
// ✅ تابع حذف رسانه پست
// =============================================

export const deletePostMedia = (mediaUrl: string | null | undefined): boolean => {
    if (!mediaUrl) return false;

    try {
        // استخراج نام فایل از URL
        let filename: string | null = null;
        
        if (mediaUrl.startsWith('/uploads/posts/')) {
            filename = mediaUrl.replace('/uploads/posts/', '');
        } else if (mediaUrl.startsWith('http')) {
            const parts = mediaUrl.split('/uploads/posts/');
            if (parts.length > 1) {
                filename = parts[1];
            }
        } else {
            filename = mediaUrl;
        }

        if (!filename) return false;

        const filepath = path.join(postsUploadDir, filename);
        
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`✅ فایل پست حذف شد: ${filename}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ خطا در حذف فایل پست:', error);
        return false;
    }
};

// =============================================
// ✅ تابع بررسی نوع فایل
// =============================================

export const getMediaType = (mimetype: string): 'image' | 'video' => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    return 'image';
};