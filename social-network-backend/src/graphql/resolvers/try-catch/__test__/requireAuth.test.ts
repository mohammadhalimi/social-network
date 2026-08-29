import { requireAuth } from '../requireAuth';

describe('requireAuth', () => {
    test('اگر context.user موجود باشد، userId را برمی‌گرداند', () => {
        const context = { user: { userId: 'user-123' } };

        const result = requireAuth(context);

        expect(result).toBe('user-123');
    });

    test('اگر context.user وجود نداشته باشد، با پیام پیش‌فرض خطا پرتاب می‌کند', () => {
        const context = { user: null };

        expect(() => requireAuth(context)).toThrow('برای ادامه باید وارد شوید.');
    });

    test('اگر context.user undefined باشد، با پیام پیش‌فرض خطا پرتاب می‌کند', () => {
        const context: any = {};

        expect(() => requireAuth(context)).toThrow('برای ادامه باید وارد شوید.');
    });

    test('در صورت ارسال پیام سفارشی، همان پیام در خطا استفاده می‌شود', () => {
        const context = { user: null };
        const customMessage = 'دسترسی غیرمجاز به این بخش.';

        expect(() => requireAuth(context, customMessage)).toThrow(customMessage);
    });

    test('اگر context.user مقدار falsy مثل undefined/false/0 باشد، همچنان خطا می‌دهد', () => {
        expect(() => requireAuth({ user: undefined })).toThrow();
        expect(() => requireAuth({ user: false })).toThrow();
        expect(() => requireAuth({ user: 0 })).toThrow();
    });

    test('اگر context.user یک آبجکت خالی باشد (truthy)، خطا نمی‌دهد و userId (undefined) را برمی‌گرداند', () => {
        // نکته: پیاده‌سازی فعلی فقط وجود context.user را چک می‌کند، نه وجود
        // فیلد userId داخل آن. این تست رفتار فعلی را مستند می‌کند؛ اگر انتظار
        // دارید در نبود userId هم خطا داده شود، این نکته‌ای برای بازبینی
        // پیاده‌سازی requireAuth است، نه باگ در تست.
        const context: any = { user: {} };

        const result = requireAuth(context);

        expect(result).toBeUndefined();
    });

    test('userId های مختلف را دقیقاً همان‌طور که هستند برمی‌گرداند', () => {
        expect(requireAuth({ user: { userId: 'abc' } })).toBe('abc');
        expect(requireAuth({ user: { userId: '' } })).toBe('');
        expect(requireAuth({ user: { userId: 'admin-999' } })).toBe('admin-999');
    });
});