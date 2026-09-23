// src/routes/story-media.route.ts
import { Router } from 'express';
import { uploadStoryMedia, deleteStoryMedia } from '../services/story-media.service';

const router = Router();

// ✅ آپلود رسانه استوری
router.post('/upload-story-media', async (req, res) => {
    try {
        const result = await uploadStoryMedia(req, res) as any;

        res.json({
            success: true,
            url: result.url,
            filename: result.filename,
            size: result.size,
            mimetype: result.mimetype,
        });
    } catch (error: any) {
        const status = error.status || 500;
        const message = error.message || 'خطا در آپلود فایل استوری';

        if (status >= 500) {
            console.error('❌ خطای سرور در آپلود استوری:', error);
        } else {
            console.warn(`⚠️ ${message}`);
        }

        res.status(status).json({
            error: message,
        });
    }
});

// ✅ حذف رسانه استوری
router.delete('/delete-story-media', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL فایل ارسال نشده است.' });
        }

        const deleted = deleteStoryMedia(url);

        res.json({
            success: deleted,
            message: deleted ? 'فایل استوری با موفقیت حذف شد.' : 'فایل یافت نشد.',
        });
    } catch (error: any) {
        console.error('❌ خطا در حذف رسانه استوری:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;