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

export const deleteFile = (filename: string) => {
  if (!filename) return false;
  // استخراج نام فایل از مسیر کامل
  const baseName = filename.startsWith('/uploads/') 
    ? filename.replace('/uploads/', '') 
    : filename;
  const filepath = path.join(uploadDir, baseName);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
};

// ✅ تابع برای ساخت آدرس کامل
export const getFullUrl = (req: any, filename: string) => {
  if (!filename) return null;
  // اگر قبلاً آدرس کامل است، برگردان
  if (filename.startsWith('http')) return filename;
  // اگر با /uploads/ شروع می‌شود
  if (filename.startsWith('/uploads/')) {
    return `${req.protocol}://${req.get('host')}${filename}`;
  }
  // در غیر این صورت، مسیر را بساز
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};