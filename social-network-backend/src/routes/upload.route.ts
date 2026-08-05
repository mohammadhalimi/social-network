import { Router } from 'express';
import { upload } from '../services/upload.service';

const router = Router();

router.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'هیچ فایلی آپلود نشده است.' });
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
});

export default router;