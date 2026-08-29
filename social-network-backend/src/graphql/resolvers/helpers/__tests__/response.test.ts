// graphql/resolvers/helpers/__tests__/response.test.ts

import { successResponse, errorResponse, withTryCatch } from '../response';

// ===================================================================
// successResponse
// ===================================================================
describe('successResponse', () => {
    test('success: true و message ورودی را برمی‌گرداند', () => {
        const result = successResponse('عملیات موفق بود');

        expect(result).toEqual({ success: true, message: 'عملیات موفق بود' });
    });

    test('فیلدهای extra را به خروجی اضافه می‌کند', () => {
        const result = successResponse('پروفایل آپدیت شد', { user: { id: 'u1' } });

        expect(result).toEqual({
            success: true,
            message: 'پروفایل آپدیت شد',
            user: { id: 'u1' },
        });
    });

    test('اگر extra شامل کلید message یا success باشد، مقادیر پیش‌فرض را override می‌کند', () => {
        // این رفتار طبیعی spread ({success, message, ...extra}) است؛ این تست
        // فقط این رفتار را مستند می‌کند تا تغییر ناخواسته در پیاده‌سازی زود
        // متوجه شود.
        const result = successResponse('پیام اولیه', {
            message: 'پیام override‌شده',
            success: false,
        });

        expect(result).toEqual({ success: false, message: 'پیام override‌شده' });
    });
});

// ===================================================================
// errorResponse
// ===================================================================
describe('errorResponse', () => {
    test('success: false و message ورودی را برمی‌گرداند', () => {
        const result = errorResponse('خطا در انجام عملیات');

        expect(result).toEqual({ success: false, message: 'خطا در انجام عملیات' });
    });

    test('فیلدهای extra را به خروجی اضافه می‌کند', () => {
        const result = errorResponse('خطا در آپدیت', { user: null });

        expect(result).toEqual({
            success: false,
            message: 'خطا در آپدیت',
            user: null,
        });
    });
});

// ===================================================================
// withTryCatch
// ===================================================================
describe('withTryCatch', () => {
    test('اگر resolver موفق باشد، خروجی آن را بدون تغییر برمی‌گرداند', async () => {
        const resolver = jest.fn().mockResolvedValue({ success: true, message: 'انجام شد' });
        const wrapped = withTryCatch(resolver, 'پیام پیش‌فرض خطا');

        const result = await wrapped('arg1', 'arg2');

        expect(result).toEqual({ success: true, message: 'انجام شد' });
    });

    test('آرگومان‌ها را دقیقاً همان‌طور که دریافت کرده به resolver پاس می‌دهد', async () => {
        const resolver = jest.fn().mockResolvedValue({ success: true, message: 'ok' });
        const wrapped = withTryCatch(resolver, 'خطا');

        const parent = {};
        const args = { id: '1' };
        const context = { user: { userId: 'u1' } };

        await wrapped(parent, args, context);

        expect(resolver).toHaveBeenCalledWith(parent, args, context);
    });

    test('اگر resolver خطا با message پرتاب کند، errorResponse با همان message برمی‌گردد', async () => {
        const resolver = jest.fn().mockRejectedValue(new Error('کاربر پیدا نشد'));
        const wrapped = withTryCatch(resolver, 'پیام پیش‌فرض خطا');

        const result = await wrapped();

        expect(result).toEqual({ success: false, message: 'کاربر پیدا نشد' });
    });

    test('اگر خطا بدون message باشد، از fallbackMessage استفاده می‌کند', async () => {
        const errWithoutMessage: any = new Error();
        errWithoutMessage.message = '';
        const resolver = jest.fn().mockRejectedValue(errWithoutMessage);
        const wrapped = withTryCatch(resolver, 'پیام پیش‌فرض خطا');

        const result = await wrapped();

        expect(result).toEqual({ success: false, message: 'پیام پیش‌فرض خطا' });
    });

    test('extraNullFields را در پاسخ خطا اضافه می‌کند', async () => {
        const resolver = jest.fn().mockRejectedValue(new Error('خطای دیتابیس'));
        const wrapped = withTryCatch(resolver, 'خطای پیش‌فرض', { user: null, post: null });

        const result = await wrapped();

        expect(result).toEqual({
            success: false,
            message: 'خطای دیتابیس',
            user: null,
            post: null,
        });
    });

    test('اگر resolver آبجکتی که خطا نیست پرتاب کند (نه instance از Error)، بدون کرش fallback استفاده می‌شود', async () => {
        const resolver = jest.fn().mockRejectedValue('یک رشته به‌جای Error');
        const wrapped = withTryCatch(resolver, 'پیام پیش‌فرض خطا');

        const result = await wrapped();

        expect(result).toEqual({ success: false, message: 'پیام پیش‌فرض خطا' });
    });
});