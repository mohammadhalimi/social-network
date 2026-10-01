// src/app/lib/__tests__/uploadStory.test.ts

import { uploadStoryMedia } from '../uploadStory';

// ✅ Mock کردن fetch جهانی
global.fetch = jest.fn();

const mockedFetch = global.fetch as jest.Mock;

describe('uploadStoryMedia', () => {
    // ✅ Mock فایل
    const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================================
    //  تست ۱: آپلود موفق
    // ==========================================================
    it('1. باید فایل را آپلود کند و URL را برگرداند', async () => {
        mockedFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ url: 'http://localhost:4000/uploads/stories/test.jpg' }),
        });

        const result = await uploadStoryMedia(mockFile);

        expect(result).toBe('http://localhost:4000/uploads/stories/test.jpg');
    });

    // ==========================================================
    //  تست ۲: استفاده از متد POST و URL درست
    // ==========================================================
    it('2. باید درخواست POST به /upload-story-media بفرستد', async () => {
        mockedFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ url: 'http://test.com/file.jpg' }),
        });

        await uploadStoryMedia(mockFile);

        expect(mockedFetch).toHaveBeenCalledWith(
            'http://localhost:4000/upload-story-media',
            expect.objectContaining({
                method: 'POST',
                credentials: 'include',
            })
        );
    });

    // ==========================================================
    //  تست ۳: استفاده از نام فیلد "media" در FormData
    // ==========================================================
    it('3. باید فایل را با نام فیلد "media" در FormData قرار دهد', async () => {
        mockedFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ url: 'http://test.com/file.jpg' }),
        });

        await uploadStoryMedia(mockFile);

        const callArgs = mockedFetch.mock.calls[0][1];
        const formData = callArgs.body as FormData;

        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get('media')).toBe(mockFile);
    });

    // ==========================================================
    //  تست ۴: خطای HTTP با پیام error از سرور
    // ==========================================================
    it('4. اگر response.ok=false باشد و سرور error بدهد، همان پیام را پرتاب کند', async () => {
        mockedFetch.mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'حجم فایل بیش از حد مجاز است.' }),
        });

        await expect(uploadStoryMedia(mockFile)).rejects.toThrow(
            'حجم فایل بیش از حد مجاز است.'
        );
    });

    // ==========================================================
    //  تست ۵: خطای HTTP با پیام message از سرور
    // ==========================================================
    it('5. اگر سرور error نداشت ولی message داشت، همان message را پرتاب کند', async () => {
        mockedFetch.mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'فرمت فایل پشتیبانی نمی‌شود.' }),
        });

        await expect(uploadStoryMedia(mockFile)).rejects.toThrow(
            'فرمت فایل پشتیبانی نمی‌شود.'
        );
    });

    // ==========================================================
    //  تست ۶: خطای HTTP بدون JSON (پاسخ نامعتبر)
    // ==========================================================
    it('6. اگر پاسخ JSON نبود، پیام پیش‌فرض را پرتاب کند', async () => {
        mockedFetch.mockResolvedValue({
            ok: false,
            json: async () => {
                throw new Error('Invalid JSON');
            },
        });

        await expect(uploadStoryMedia(mockFile)).rejects.toThrow(
            'خطا در آپلود فایل استوری'
        );
    });

    // ==========================================================
    //  تست ۷: خطای HTTP با JSON بدون error و message
    // ==========================================================
    it('7. اگر JSON نبود ولی error/message نداشت، پیام پیش‌فرض را پرتاب کند', async () => {
        mockedFetch.mockResolvedValue({
            ok: false,
            json: async () => ({ someOtherField: 'value' }),
        });

        await expect(uploadStoryMedia(mockFile)).rejects.toThrow(
            'خطا در آپلود فایل استوری'
        );
    });

    // ==========================================================
    //  تست ۸: خطای شبکه (fetch reject)
    // ==========================================================
    it('8. اگر fetch خودش خطا بدهد (خطای شبکه)، خطا propagate شود', async () => {
        mockedFetch.mockRejectedValue(new Error('Network error'));

        await expect(uploadStoryMedia(mockFile)).rejects.toThrow('Network error');
    });
});