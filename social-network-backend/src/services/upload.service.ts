import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('فرمت فایل پشتیبانی نمی‌شود. فقط JPG, PNG, GIF, WEBP مجاز هستند.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 مگابایت
    },
});

// ✅ تابع برای حذف عکس قبلی
export const deleteOldAvatar = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return false;

    // استخراج نام فایل از URL
    let filename: string | null = null;
    
    if (avatarUrl.startsWith('/uploads/')) {
        filename = avatarUrl.replace('/uploads/', '');
    } else if (avatarUrl.startsWith('http')) {
        // استخراج از آدرس کامل
        const parts = avatarUrl.split('/uploads/');
        if (parts.length > 1) {
            filename = parts[1];
        }
    } else {
        filename = avatarUrl;
    }

    if (!filename) return false;

    const filepath = path.join(uploadDir, filename);
    if (fs.existsSync(filepath)) {
        try {
            fs.unlinkSync(filepath);
            console.log(`✅ عکس قبلی حذف شد: ${filename}`);
            return true;
        } catch (error) {
            console.error(`❌ خطا در حذف عکس ${filename}:`, error);
            return false;
        }
    }
    return false;
};

export const getFilePath = (filename: string) => {
    return `/uploads/${filename}`;
};