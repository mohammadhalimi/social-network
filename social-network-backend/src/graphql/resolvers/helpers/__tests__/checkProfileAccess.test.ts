// src/graphql/resolvers/helpers/__tests__/checkProfileAccess.test.ts

// ✅ Mock کردن prisma
jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        follow: {
            findUnique: jest.fn(),
        },
    },
}));

import prisma from '../../../../lib/prisma';
import { canViewPrivateProfile } from '../checkProfileAccess';

const mockedFollowFindUnique = (prisma as any).follow.findUnique as jest.Mock;

describe('canViewPrivateProfile', () => {
    const profileOwner = {
        id: 'owner-1',
        isPrivate: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================================
    //  حالت ۱: viewer خود صاحب پروفایل
    // ==========================================================
    it('1. اگر viewer خود صاحب پروفایل باشه، دسترسی داره (حتی برای پروفایل خصوصی)', async () => {
        const result = await canViewPrivateProfile('owner-1', profileOwner);

        expect(result).toBe(true);
        // ✅ نباید به دیتابیس Query بزنه
        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  حالت ۲: پروفایل عمومی
    // ==========================================================
    it('2. اگر پروفایل عمومی باشه، همه دسترسی دارن (حتی کاربر لاگین‌نکرده)', async () => {
        const publicProfile = { id: 'owner-1', isPrivate: false };

        const result = await canViewPrivateProfile(null, publicProfile);

        expect(result).toBe(true);
        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
    });

    it('3. اگر پروفایل عمومی باشه، کاربر لاگین‌شده هم دسترسی داره', async () => {
        const publicProfile = { id: 'owner-1', isPrivate: false };

        const result = await canViewPrivateProfile('viewer-1', publicProfile);

        expect(result).toBe(true);
        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  حالت ۳: پروفایل خصوصی + کاربر لاگین‌نکرده
    // ==========================================================
    it('4. اگر پروفایل خصوصی باشه و viewer لاگین نکرده باشه، دسترسی نداره', async () => {
        const result = await canViewPrivateProfile(null, profileOwner);

        expect(result).toBe(false);
        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  حالت ۴: پروفایل خصوصی + کاربر فالوور
    // ==========================================================
    it('5. اگر viewer فالوور باشه، دسترسی داره', async () => {
        mockedFollowFindUnique.mockResolvedValue({ id: 'follow-1' });

        const result = await canViewPrivateProfile('viewer-1', profileOwner);

        expect(result).toBe(true);
        expect(mockedFollowFindUnique).toHaveBeenCalledWith({
            where: {
                followerId_followingId: {
                    followerId: 'viewer-1',
                    followingId: 'owner-1',
                },
            },
        });
    });

    // ==========================================================
    //  حالت ۵: پروفایل خصوصی + کاربر فالوور نیست
    // ==========================================================
    it('6. اگر viewer فالوور نباشه، دسترسی نداره', async () => {
        mockedFollowFindUnique.mockResolvedValue(null);

        const result = await canViewPrivateProfile('viewer-1', profileOwner);

        expect(result).toBe(false);
        expect(mockedFollowFindUnique).toHaveBeenCalledWith({
            where: {
                followerId_followingId: {
                    followerId: 'viewer-1',
                    followingId: 'owner-1',
                },
            },
        });
    });

    // ==========================================================
    //  حالت ۶: viewerId به صورت undefined (نه null)
    // ==========================================================
    it('7. اگر viewerId برابر undefined باشه، مثل null رفتار کنه', async () => {
        const result = await canViewPrivateProfile(undefined as any, profileOwner);

        expect(result).toBe(false);
        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
    });

    // ==========================================================
    //  حالت ۷: viewer با id دیگه
    // ==========================================================
    it('8. اگر viewer با id دیگه‌ای وارد بشه، باید چک فالو انجام بشه', async () => {
        mockedFollowFindUnique.mockResolvedValue({ id: 'follow-1' });

        const result = await canViewPrivateProfile('other-viewer', profileOwner);

        expect(result).toBe(true);
        expect(mockedFollowFindUnique).toHaveBeenCalledWith({
            where: {
                followerId_followingId: {
                    followerId: 'other-viewer',
                    followingId: 'owner-1',
                },
            },
        });
    });
});