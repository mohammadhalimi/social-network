// app/lib/upload.test.ts
import { uploadPostMedia } from '../upload';

describe('uploadPostMedia', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('returns the url on a successful upload', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ url: 'https://cdn.example.com/file.png' }),
        }) as jest.Mock;

        const file = new File(['content'], 'photo.png', { type: 'image/png' });
        const url = await uploadPostMedia(file);

        expect(url).toBe('https://cdn.example.com/file.png');
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:4000/upload-post-media',
            expect.objectContaining({
                method: 'POST',
                credentials: 'include',
                body: expect.any(FormData),
            })
        );
    });

    it('appends the file to FormData under the "media" key', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ url: 'x' }),
        }) as jest.Mock;

        const file = new File(['content'], 'photo.png', { type: 'image/png' });
        await uploadPostMedia(file);

        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        const formData = callArgs.body as FormData;

        expect(formData.get('media')).toBe(file);
    });

    it('throws a size-limit message on 413 status', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 413,
            json: async () => ({ error: 'Payload too large' }),
        }) as jest.Mock;

        const file = new File(['content'], 'big.png', { type: 'image/png' });

        await expect(uploadPostMedia(file)).rejects.toThrow(
            'حجم فایل انتخابی بیش از حد مجاز (حداکثر ۵۰ مگابایت) است. لطفاً فایل کوچکتری انتخاب کنید.'
        );
    });

    it('throws a format-not-supported message when the server error mentions فرمت', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: 'فرمت فایل اشتباه است' }),
        }) as jest.Mock;

        const file = new File(['content'], 'file.exe', { type: 'application/octet-stream' });

        await expect(uploadPostMedia(file)).rejects.toThrow(
            'فرمت فایل پشتیبانی نمی‌شود. فقط تصاویر (JPG, PNG, WEBP) و ویدیوها (MP4, WebM) مجاز هستند.'
        );
    });

    it('throws the server-provided error message for other non-413/format errors', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: 'خطای سفارشی سرور' }),
        }) as jest.Mock;

        const file = new File(['content'], 'file.png', { type: 'image/png' });

        await expect(uploadPostMedia(file)).rejects.toThrow('خطای سفارشی سرور');
    });

    it('throws a generic error message when response is not ok and has no error field', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({}),
        }) as jest.Mock;

        const file = new File(['content'], 'file.png', { type: 'image/png' });

        await expect(uploadPostMedia(file)).rejects.toThrow('خطا در آپلود فایل');
    });

    it('throws a connection error message when response.json() fails while handling a non-ok response', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => {
                throw new Error('invalid json');
            },
        }) as jest.Mock;

        const file = new File(['content'], 'file.png', { type: 'image/png' });

        await expect(uploadPostMedia(file)).rejects.toThrow('خطا در ارتباط با سرور');
    });

    it('throws a network-error message when fetch itself rejects with "Failed to fetch"', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch')) as jest.Mock;

        const file = new File(['content'], 'file.png', { type: 'image/png' });

        await expect(uploadPostMedia(file)).rejects.toThrow(
            'خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.'
        );
    });

    it('rethrows the original error when it does not match the fetch-failure pattern', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('یک خطای ناشناخته')) as jest.Mock;

        const file = new File(['content'], 'file.png', { type: 'image/png' });

        await expect(uploadPostMedia(file)).rejects.toThrow('یک خطای ناشناخته');
    });
});