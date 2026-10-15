// src/graphql/resolvers/try-catch/__test__/requireAuth.test.ts

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

    test('اگر context.user یک آبجکت خالی باشد، خطا می‌دهد (چون userId ندارد)', () => {
        const context: any = { user: {} };

        expect(() => requireAuth(context)).toThrow('برای ادامه باید وارد شوید.');
    });

    test('اگر userId خالی (empty string) باشد، خطا می‌دهد', () => {
        expect(() => requireAuth({ user: { userId: '' } })).toThrow(
            'برای ادامه باید وارد شوید.'
        );
    });

    test('اگر userId مقدار falsy مثل null/undefined/0/false داشته باشد، خطا می‌دهد', () => {
        expect(() => requireAuth({ user: { userId: null } })).toThrow();
        expect(() => requireAuth({ user: { userId: undefined } })).toThrow();
        expect(() => requireAuth({ user: { userId: 0 } })).toThrow();
        expect(() => requireAuth({ user: { userId: false } })).toThrow();
    });

    test('userId های معتبر را دقیقاً همان‌طور که هستند برمی‌گرداند', () => {
        expect(requireAuth({ user: { userId: 'abc' } })).toBe('abc');
        expect(requireAuth({ user: { userId: 'admin-999' } })).toBe('admin-999');
        expect(requireAuth({ user: { userId: '550e8400-e29b-41d4-a716-446655440000' } })).toBe(
            '550e8400-e29b-41d4-a716-446655440000'
        );
    });

    test('پیام سفارشی روی همه حالت‌های خطا اعمال می‌شود', () => {
        const customMessage = 'شما اجازه دسترسی ندارید.';

        expect(() => requireAuth({ user: null }, customMessage)).toThrow(customMessage);
        expect(() => requireAuth({ user: {} }, customMessage)).toThrow(customMessage);
        expect(() => requireAuth({ user: { userId: '' } }, customMessage)).toThrow(
            customMessage
        );
        expect(() => requireAuth({ user: { userId: undefined } }, customMessage)).toThrow(
            customMessage
        );
    });
});