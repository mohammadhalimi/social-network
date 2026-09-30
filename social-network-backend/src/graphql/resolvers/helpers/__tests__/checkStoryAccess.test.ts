// src/graphql/resolvers/helpers/__tests__/checkStoryAccess.test.ts

// ✅ ماک کردن prisma
jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        follow: {
            findUnique: jest.fn(),
        },
        closeFriend: {
            findUnique: jest.fn(),
        },
    },
}));

import prisma from '../../../../lib/prisma';
import { canViewStory } from '../checkStoryAccess';

const mockedFollowFindUnique = (prisma as any).follow.findUnique as jest.Mock;
const mockedCloseFriendFindUnique = (prisma as any).closeFriend.findUnique as jest.Mock;

describe('checkStoryAccess', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =====================================================
    //  حالت ۱: صاحب استوری
    // =====================================================
    it('1. صاحب استوری همیشه دسترسی دارد (حتی برای CLOSE_FRIENDS)', async () => {
        const result = await canViewStory('user-1', {
            userId: 'user-1',
            visibility: 'CLOSE_FRIENDS',
        });

        expect(result).toBe(true);
        // ✅ نباید به دیتابیس Query بزند
        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
        expect(mockedCloseFriendFindUnique).not.toHaveBeenCalled();
    });

    // =====================================================
    //  حالت ۲: PUBLIC
    // =====================================================
    it('2. برای visibility=PUBLIC، همه (حتی کاربر لاگین‌نکرده) دسترسی دارند', async () => {
        const result = await canViewStory(null, {
            userId: 'owner-1',
            visibility: 'PUBLIC',
        });

        expect(result).toBe(true);
        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
        expect(mockedCloseFriendFindUnique).not.toHaveBeenCalled();
    });

    it('3. برای visibility=PUBLIC، کاربر لاگین‌شده غیر-دنبال‌کننده هم دسترسی دارد', async () => {
        const result = await canViewStory('viewer-1', {
            userId: 'owner-1',
            visibility: 'PUBLIC',
        });

        expect(result).toBe(true);
    });

    // =====================================================
    //  حالت ۳: FOLLOWERS
    // =====================================================
    it('4. برای FOLLOWERS، اگر کاربر لاگین نکرده باشد، دسترسی ندارد', async () => {
        const result = await canViewStory(null, {
            userId: 'owner-1',
            visibility: 'FOLLOWERS',
        });

        expect(result).toBe(false);
        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
    });

    it('5. برای FOLLOWERS، اگر کاربر دنبال‌کننده باشد، دسترسی دارد', async () => {
        mockedFollowFindUnique.mockResolvedValue({ id: 'follow-1' });

        const result = await canViewStory('viewer-1', {
            userId: 'owner-1',
            visibility: 'FOLLOWERS',
        });

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

    it('6. برای FOLLOWERS، اگر کاربر دنبال‌کننده نباشد، دسترسی ندارد', async () => {
        mockedFollowFindUnique.mockResolvedValue(null);

        const result = await canViewStory('viewer-1', {
            userId: 'owner-1',
            visibility: 'FOLLOWERS',
        });

        expect(result).toBe(false);
    });

    // =====================================================
    //  حالت ۴: CLOSE_FRIENDS
    // =====================================================
    it('7. برای CLOSE_FRIENDS، اگر کاربر لاگین نکرده باشد، دسترسی ندارد', async () => {
        const result = await canViewStory(null, {
            userId: 'owner-1',
            visibility: 'CLOSE_FRIENDS',
        });

        expect(result).toBe(false);
        expect(mockedCloseFriendFindUnique).not.toHaveBeenCalled();
    });

    it('8. برای CLOSE_FRIENDS، اگر کاربر در لیست دوستان نزدیک باشد، دسترسی دارد', async () => {
        mockedCloseFriendFindUnique.mockResolvedValue({ id: 'cf-1' });

        const result = await canViewStory('viewer-1', {
            userId: 'owner-1',
            visibility: 'CLOSE_FRIENDS',
        });

        expect(result).toBe(true);
        expect(mockedCloseFriendFindUnique).toHaveBeenCalledWith({
            where: {
                ownerId_friendId: {
                    ownerId: 'owner-1',
                    friendId: 'viewer-1',
                },
            },
        });
    });

    it('9. برای CLOSE_FRIENDS، اگر کاربر در لیست نباشد، دسترسی ندارد', async () => {
        mockedCloseFriendFindUnique.mockResolvedValue(null);

        const result = await canViewStory('viewer-1', {
            userId: 'owner-1',
            visibility: 'CLOSE_FRIENDS',
        });

        expect(result).toBe(false);
    });

    it('10. برای FOLLOWERS، نباید به closeFriend Query بزند', async () => {
        mockedFollowFindUnique.mockResolvedValue({ id: 'follow-1' });

        await canViewStory('viewer-1', {
            userId: 'owner-1',
            visibility: 'FOLLOWERS',
        });

        expect(mockedCloseFriendFindUnique).not.toHaveBeenCalled();
    });

    it('11. برای CLOSE_FRIENDS، نباید به follow Query بزند', async () => {
        mockedCloseFriendFindUnique.mockResolvedValue({ id: 'cf-1' });

        await canViewStory('viewer-1', {
            userId: 'owner-1',
            visibility: 'CLOSE_FRIENDS',
        });

        expect(mockedFollowFindUnique).not.toHaveBeenCalled();
    });

    // =====================================================
    //  حالت ۵: visibility نامعتبر
    // =====================================================
    it('12. برای visibility ناشناخته، false برمی‌گرداند', async () => {
        const result = await canViewStory('viewer-1', {
            userId: 'owner-1',
            visibility: 'UNKNOWN' as any,
        });

        expect(result).toBe(false);
    });
});