// graphql/resolvers/helpers/__tests__/mapUser.test.ts

import { mapUser } from '../mapUser';

function buildUser(overrides: Partial<Parameters<typeof mapUser>[0]> = {}) {
    return {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        bio: 'یک بیوگرافی نمونه',
        avatar: 'https://example.com/uploads/avatar.png',
        createdAt: new Date('2024-01-01T10:00:00.000Z'),
        updatedAt: new Date('2024-06-15T12:30:00.000Z'),
        ...overrides,
    };
}

describe('mapUser', () => {
    test('تمام فیلدهای اصلی کاربر را بدون تغییر منتقل می‌کند', () => {
        const user = buildUser();

        const result = mapUser(user);

        expect(result.id).toBe(user.id);
        expect(result.email).toBe(user.email);
        expect(result.username).toBe(user.username);
        expect(result.fullName).toBe(user.fullName);
        expect(result.bio).toBe(user.bio);
        expect(result.avatar).toBe(user.avatar);
    });

    test('createdAt و updatedAt را به رشته ISO تبدیل می‌کند', () => {
        const user = buildUser({
            createdAt: new Date('2024-01-01T10:00:00.000Z'),
            updatedAt: new Date('2024-06-15T12:30:00.000Z'),
        });

        const result = mapUser(user);

        expect(result.createdAt).toBe('2024-01-01T10:00:00.000Z');
        expect(result.updatedAt).toBe('2024-06-15T12:30:00.000Z');
        expect(typeof result.createdAt).toBe('string');
        expect(typeof result.updatedAt).toBe('string');
    });

    test('مقادیر null برای bio و avatar را حفظ می‌کند', () => {
        const user = buildUser({ bio: null, avatar: null });

        const result = mapUser(user);

        expect(result.bio).toBeNull();
        expect(result.avatar).toBeNull();
    });

    test('id عددی را بدون تبدیل به رشته منتقل می‌کند', () => {
        const user = buildUser({ id: 42 });

        const result = mapUser(user);

        expect(result.id).toBe(42);
    });

    test('فقط فیلدهای مشخص‌شده را در خروجی برمی‌گرداند (فیلدهای اضافه فیلتر می‌شوند)', () => {
        const user: any = buildUser();
        user.password = 'hashed-secret';
        user.__internalFlag = true;

        const result: any = mapUser(user);

        expect(result.password).toBeUndefined();
        expect(result.__internalFlag).toBeUndefined();
        expect(Object.keys(result).sort()).toEqual(
            [
                'id',
                'email',
                'username',
                'fullName',
                'bio',
                'avatar',
                'createdAt',
                'updatedAt',
            ].sort()
        );
    });
});