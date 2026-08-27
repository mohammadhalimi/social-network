// backend/routes/posts.route.ts
import { Router } from 'express';
import { uploadPostMedia, deletePostMedia } from '../services/post-media.service';

const router = Router();

// =============================================
// ✅ آپلود رسانه پست
// =============================================

router.post('/upload-post-media', async (req, res) => {
    try {
        const result = await uploadPostMedia(req, res) as any;
        
        res.json({
            success: true,
            url: result.url,
            filename: result.filename,
            size: result.size,
            mimetype: result.mimetype,
        });
    } catch (error: any) {
        console.error('❌ خطا در آپلود رسانه پست:', error);
        res.status(500).json({ 
            error: error.message || 'خطا در آپلود فایل.' 
        });
    }
});

// =============================================
// ✅ حذف رسانه پست
// =============================================

router.delete('/delete-post-media', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL فایل ارسال نشده است.' });
        }

        const deleted = deletePostMedia(url);
        
        res.json({
            success: deleted,
            message: deleted ? 'فایل با موفقیت حذف شد.' : 'فایل یافت نشد.',
        });
    } catch (error: any) {
        console.error('❌ خطا در حذف رسانه:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;