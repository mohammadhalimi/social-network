// src/graphql/resolvers/story/__tests__/story.mutations.test.ts

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        story: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
        storyView: { upsert: jest.fn() },
        follow: { findUnique: jest.fn() },
        closeFriend: {
            upsert: jest.fn(),
            deleteMany: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

jest.mock('../../helpers/checkStoryAccess', () => ({
    canViewStory: jest.fn(),
}));

jest.mock('../../helpers/storyDuration', () => ({
    calculateExpiresAt: jest.fn(() => new Date('2024-12-31T00:00:00.000Z')),
}));

jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { canViewStory } from '../../helpers/checkStoryAccess';
import { storyMutations } from '../story.mutations';

const mockedStoryCreate = (prisma as any).story.create as jest.Mock;
const mockedStoryFindUnique = (prisma as any).story.findUnique as jest.Mock;
const mockedStoryDelete = (prisma as any).story.delete as jest.Mock;
const mockedStoryViewUpsert = (prisma as any).storyView.upsert as jest.Mock;
const mockedFollowFindUnique = (prisma as any).follow.findUnique as jest.Mock;
const mockedCloseFriendUpsert = (prisma as any).closeFriend.upsert as jest.Mock;
const mockedCloseFriendDeleteMany = (prisma as any).closeFriend.deleteMany as jest.Mock;
const mockedCloseFriendFindMany = (prisma as any).closeFriend.findMany as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;
const mockedCanViewStory = canViewStory as jest.Mock;

describe('storyMutations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedRequireAuth.mockReturnValue('user-1');
    });

    // ===================================================================
    // createStory
    // ===================================================================
    describe('createStory', () => {
        const validArgs = {
            mediaUrl: 'http://localhost/uploads/story.jpg',
            mediaType: 'image',
            duration: 'TWENTY_FOUR_HOURS',
            visibility: 'PUBLIC',
        };

        it('1. با args معتبر، استوری می‌سازد و پاسخ می‌دهد', async () => {
            mockedStoryCreate.mockResolvedValue({
                id: 'story-1',
                userId: 'user-1',
                mediaUrl: validArgs.mediaUrl,
                mediaType: 'image',
                visibility: 'PUBLIC',
                createdAt: new Date('2024-01-01'),
                expiresAt: new Date('2024-12-31'),
                views: [],
            });

            const result = await storyMutations.createStory(null, validArgs, {});

            expect(result.success).toBe(true);
            expect(result.message).toBe('استوری با موفقیت منتشر شد.');
            expect(result.story?.id).toBe('story-1');
            expect(result.story?.viewsCount).toBe(0);
            expect(result.story?.isViewedByMe).toBe(false);
            expect(result.story?.viewers).toEqual([]);
        });

        it('2. mediaUrl را trim می‌کند', async () => {
            mockedStoryCreate.mockResolvedValue({
                id: 'story-1', createdAt: new Date(), expiresAt: new Date(), views: [],
            });

            await storyMutations.createStory(null, { ...validArgs, mediaUrl: '  url.jpg  ' }, {});

            expect(mockedStoryCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ mediaUrl: 'url.jpg' }),
                })
            );
        });

        it('3. برای mediaType نامعتبر، خطا پرتاب می‌کند', async () => {
            await expect(
                storyMutations.createStory(null, { ...validArgs, mediaType: 'audio' }, {})
            ).rejects.toThrow('نوع فایل باید image یا video باشد.');
        });

        it('4. برای visibility نامعتبر، خطا پرتاب می‌کند', async () => {
            await expect(
                storyMutations.createStory(null, { ...validArgs, visibility: 'FRIENDS' }, {})
            ).rejects.toThrow('نوع دسترسی نامعتبر است.');
        });

        it('5. برای duration نامعتبر، خطا پرتاب می‌کند', async () => {
            await expect(
                storyMutations.createStory(null, { ...validArgs, duration: 'ONE_HOUR' }, {})
            ).rejects.toThrow('مدت زمان نامعتبر است.');
        });

        it('6. برای mediaUrl خالی، خطا پرتاب می‌کند', async () => {
            await expect(
                storyMutations.createStory(null, { ...validArgs, mediaUrl: '   ' }, {})
            ).rejects.toThrow('آدرس فایل نمی‌تواند خالی باشد.');
        });

        it('7. باید requireAuth را صدا بزند', async () => {
            mockedStoryCreate.mockResolvedValue({
                id: 'story-1', createdAt: new Date(), expiresAt: new Date(), views: [],
            });

            await storyMutations.createStory(null, validArgs, {});

            expect(mockedRequireAuth).toHaveBeenCalled();
        });
    });

    // ===================================================================
    // deleteStory
    // ===================================================================
    describe('deleteStory', () => {
        it('8. اگر صاحب استوری باشد، آن را حذف می‌کند', async () => {
            mockedStoryFindUnique.mockResolvedValue({ id: 'story-1', userId: 'user-1' });

            const result = await storyMutations.deleteStory(null, { storyId: 'story-1' }, {});

            expect(mockedStoryDelete).toHaveBeenCalledWith({ where: { id: 'story-1' } });
            expect(result.success).toBe(true);
        });

        it('9. اگر استوری پیدا نشود، خطا می‌دهد', async () => {
            mockedStoryFindUnique.mockResolvedValue(null);

            await expect(
                storyMutations.deleteStory(null, { storyId: 'missing' }, {})
            ).rejects.toThrow('استوری یافت نشد.');
        });

        it('10. اگر کاربر مالک نباشد، خطا می‌دهد و حذف نمی‌کند', async () => {
            mockedStoryFindUnique.mockResolvedValue({ id: 'story-1', userId: 'other-user' });

            await expect(
                storyMutations.deleteStory(null, { storyId: 'story-1' }, {})
            ).rejects.toThrow('شما اجازه‌ی حذف این استوری را ندارید.');

            expect(mockedStoryDelete).not.toHaveBeenCalled();
        });
    });

    // ===================================================================
    // viewStory
    // ===================================================================
    describe('viewStory', () => {
        it('11. اگر استوری منقضی شده باشد، خطا می‌دهد', async () => {
            mockedStoryFindUnique.mockResolvedValue({
                id: 'story-1',
                userId: 'owner-1',
                visibility: 'PUBLIC',
                expiresAt: new Date('2020-01-01'), // ✅ گذشته
            });

            await expect(
                storyMutations.viewStory(null, { storyId: 'story-1' }, {})
            ).rejects.toThrow('این استوری منقضی شده است.');
        });

        it('12. اگر کاربر دسترسی نداشته باشد، خطا می‌دهد', async () => {
            mockedStoryFindUnique.mockResolvedValue({
                id: 'story-1',
                userId: 'owner-1',
                visibility: 'FOLLOWERS',
                expiresAt: new Date(Date.now() + 86400000),
            });
            mockedCanViewStory.mockResolvedValue(false);

            await expect(
                storyMutations.viewStory(null, { storyId: 'story-1' }, {})
            ).rejects.toThrow('شما اجازه‌ی مشاهده‌ی این استوری را ندارید.');
        });

        it('13. برای صاحب استوری، view ثبت نمی‌کند', async () => {
            mockedStoryFindUnique.mockResolvedValue({
                id: 'story-1',
                userId: 'user-1', // ✅ same as requireAuth
                visibility: 'PUBLIC',
                expiresAt: new Date(Date.now() + 86400000),
            });
            mockedCanViewStory.mockResolvedValue(true);

            const result = await storyMutations.viewStory(null, { storyId: 'story-1' }, {});

            expect(mockedStoryViewUpsert).not.toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('14. برای بیننده دیگر، view را ثبت می‌کند (upsert)', async () => {
            mockedStoryFindUnique.mockResolvedValue({
                id: 'story-1',
                userId: 'owner-1',
                visibility: 'PUBLIC',
                expiresAt: new Date(Date.now() + 86400000),
            });
            mockedCanViewStory.mockResolvedValue(true);
            mockedStoryViewUpsert.mockResolvedValue({});

            const result = await storyMutations.viewStory(null, { storyId: 'story-1' }, {});

            expect(mockedStoryViewUpsert).toHaveBeenCalledWith({
                where: { storyId_viewerId: { storyId: 'story-1', viewerId: 'user-1' } },
                create: { storyId: 'story-1', viewerId: 'user-1' },
                update: {},
            });
            expect(result.success).toBe(true);
        });

        it('15. اگر استوری پیدا نشود، خطا می‌دهد', async () => {
            mockedStoryFindUnique.mockResolvedValue(null);

            await expect(
                storyMutations.viewStory(null, { storyId: 'missing' }, {})
            ).rejects.toThrow('استوری یافت نشد.');
        });
    });

    // ===================================================================
    // addCloseFriend
    // ===================================================================
    describe('addCloseFriend', () => {
        it('16. اگر کاربر خودش را اضافه کند، خطا می‌دهد', async () => {
            await expect(
                storyMutations.addCloseFriend(null, { userId: 'user-1' }, {})
            ).rejects.toThrow('نمی‌توانید خودتان را انتخاب کنید.');
        });

        it('17. اگر کاربر دنبال‌کننده نباشد، خطا می‌دهد', async () => {
            mockedFollowFindUnique.mockResolvedValue(null);

            await expect(
                storyMutations.addCloseFriend(null, { userId: 'friend-1' }, {})
            ).rejects.toThrow('فقط می‌توانید از بین دنبال‌کنندگان خود انتخاب کنید.');
        });

        it('18. اگر کاربر دنبال‌کننده باشد، به لیست اضافه می‌شود', async () => {
            mockedFollowFindUnique.mockResolvedValue({ id: 'follow-1' });
            mockedCloseFriendUpsert.mockResolvedValue({});
            mockedCloseFriendFindMany.mockResolvedValue([
                { friend: { id: 'friend-1', username: 'friend' } },
            ]);

            const result = await storyMutations.addCloseFriend(null, { userId: 'friend-1' }, {});

            expect(mockedCloseFriendUpsert).toHaveBeenCalledWith({
                where: { ownerId_friendId: { ownerId: 'user-1', friendId: 'friend-1' } },
                create: { ownerId: 'user-1', friendId: 'friend-1' },
                update: {},
            });
            expect(result.success).toBe(true);
            expect(result.closeFriends).toHaveLength(1);
        });
    });

    // ===================================================================
    // removeCloseFriend
    // ===================================================================
    describe('removeCloseFriend', () => {
        it('19. کاربر را از لیست حذف می‌کند', async () => {
            mockedCloseFriendDeleteMany.mockResolvedValue({ count: 1 });
            mockedCloseFriendFindMany.mockResolvedValue([]);

            const result = await storyMutations.removeCloseFriend(null, { userId: 'friend-1' }, {});

            expect(mockedCloseFriendDeleteMany).toHaveBeenCalledWith({
                where: { ownerId: 'user-1', friendId: 'friend-1' },
            });
            expect(result.success).toBe(true);
            expect(result.closeFriends).toEqual([]);
        });

        it('20. اگر کاربر در لیست نبود، باز هم success: true برمی‌گرداند', async () => {
            mockedCloseFriendDeleteMany.mockResolvedValue({ count: 0 });
            mockedCloseFriendFindMany.mockResolvedValue([]);

            const result = await storyMutations.removeCloseFriend(null, { userId: 'friend-1' }, {});

            expect(result.success).toBe(true);
        });
    });
});