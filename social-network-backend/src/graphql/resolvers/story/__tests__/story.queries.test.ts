// src/graphql/resolvers/story/__tests__/story.queries.test.ts

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        story: { findMany: jest.fn() },
        user: { findUnique: jest.fn() },
        follow: { findUnique: jest.fn(), findMany: jest.fn() },
        closeFriend: { findUnique: jest.fn(), findMany: jest.fn() },
    },
}));

jest.mock('../../helpers/mapUser', () => ({
    mapUser: jest.fn((user: any) => ({ mapped: true, sourceId: user?.id })),
}));

jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { storyQueries } from '../story.queries';

const mockedStoryFindMany = (prisma as any).story.findMany as jest.Mock;
const mockedUserFindUnique = (prisma as any).user.findUnique as jest.Mock;
const mockedFollowFindUnique = (prisma as any).follow.findUnique as jest.Mock;
const mockedFollowFindMany = (prisma as any).follow.findMany as jest.Mock;
const mockedCloseFriendFindUnique = (prisma as any).closeFriend.findUnique as jest.Mock;
const mockedCloseFriendFindMany = (prisma as any).closeFriend.findMany as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;

// ✅ تابع کمکی برای ساخت استوری
const buildStory = (overrides: any = {}) => ({
    id: 'story-1',
    userId: 'owner-1',
    mediaUrl: 'http://localhost/uploads/story.jpg',
    mediaType: 'image',
    visibility: 'PUBLIC',
    createdAt: new Date('2024-01-01'),
    expiresAt: new Date(Date.now() + 86400000),
    user: { id: 'owner-1', username: 'owner' },
    views: [],
    ...overrides,
});

// ✅ تابع کمکی برای user (profileOwner)
const buildProfileOwner = (overrides: any = {}) => ({
    id: 'owner-1',
    isPrivate: false,
    ...overrides,
});

describe('storyQueries', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // ✅ پیش‌فرض: پروفایل عمومی
        mockedUserFindUnique.mockResolvedValue(buildProfileOwner());
    });

    // ===================================================================
    // getUserStories
    // ===================================================================
    describe('getUserStories', () => {
        it('1. اگر profileOwner پیدا نشه، آرایه خالی برمی‌گردونه', async () => {
            mockedUserFindUnique.mockResolvedValue(null);

            const result = await storyQueries.getUserStories(null, { userId: 'owner-1' }, {});

            expect(result).toEqual([]);
            expect(mockedStoryFindMany).not.toHaveBeenCalled();
        });

        it('2. اگر پروفایل خصوصی باشه و viewer لاگین نکرده باشه، آرایه خالی برمی‌گردونه', async () => {
            mockedUserFindUnique.mockResolvedValue(buildProfileOwner({ isPrivate: true }));

            const result = await storyQueries.getUserStories(null, { userId: 'owner-1' }, {});

            expect(result).toEqual([]);
            expect(mockedStoryFindMany).not.toHaveBeenCalled();
        });

        it('3. اگر پروفایل خصوصی باشه و viewer فالوور نباشه، آرایه خالی برمی‌گردونه', async () => {
            mockedUserFindUnique.mockResolvedValue(buildProfileOwner({ isPrivate: true }));
            mockedFollowFindUnique.mockResolvedValue(null);

            const result = await storyQueries.getUserStories(
                null,
                { userId: 'owner-1' },
                { user: { userId: 'viewer-1' } }
            );

            expect(result).toEqual([]);
            expect(mockedStoryFindMany).not.toHaveBeenCalled();
        });

        it('4. اگر پروفایل خصوصی باشه و viewer فالوور باشه، ادامه می‌ده', async () => {
            mockedUserFindUnique.mockResolvedValue(buildProfileOwner({ isPrivate: true }));

            // ✅ دو بار follow.findUnique صدا زده می‌شه (یک بار برای چک privacy، یک بار برای visibility)
            mockedFollowFindUnique.mockResolvedValue({ id: 'follow-1' });
            mockedCloseFriendFindUnique.mockResolvedValue(null);

            mockedStoryFindMany.mockResolvedValue([
                buildStory({ id: 's1', visibility: 'FOLLOWERS' }),
            ]);

            const result = await storyQueries.getUserStories(
                null,
                { userId: 'owner-1' },
                { user: { userId: 'viewer-1' } }
            );

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('s1');
        });

        it('5. اگر viewer لاگین نکرده باشد، فقط استوری‌های PUBLIC را برمی‌گرداند', async () => {
            mockedStoryFindMany.mockResolvedValue([
                buildStory({ id: 's1', visibility: 'PUBLIC' }),
                buildStory({ id: 's2', visibility: 'FOLLOWERS' }),
                buildStory({ id: 's3', visibility: 'CLOSE_FRIENDS' }),
            ]);

            const result = await storyQueries.getUserStories(null, { userId: 'owner-1' }, {});

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('s1');
            expect(result[0].viewsCount).toBe(0);
            expect(result[0].isViewedByMe).toBe(false);
            expect(result[0].viewers).toEqual([]);
            // ✅ نباید به دیتابیس برای follow/closeFriend Query بزند (بعد از profileOwner)
            expect(mockedFollowFindUnique).not.toHaveBeenCalled();
            expect(mockedCloseFriendFindUnique).not.toHaveBeenCalled();
        });

        it('6. اگر viewer صاحب استوری باشد، همه استوری‌ها را با viewers برمی‌گرداند', async () => {
            const viewerUser = { id: 'viewer-2', username: 'viewer2' };
            mockedStoryFindMany.mockResolvedValue([
                buildStory({
                    id: 's1',
                    visibility: 'CLOSE_FRIENDS',
                    views: [
                        { viewerId: 'owner-1', viewer: viewerUser, viewedAt: new Date() },
                    ],
                }),
            ]);

            const result = await storyQueries.getUserStories(
                null,
                { userId: 'owner-1' },
                { user: { userId: 'owner-1' } }
            );

            expect(result).toHaveLength(1);
            expect(result[0].viewers).toHaveLength(1);
            expect(result[0].viewers[0].user).toEqual(viewerUser);
            expect(result[0].viewsCount).toBe(1);
            expect(result[0].isViewedByMe).toBe(true);
            // ✅ نباید به دیتابیس follow/closeFriend Query بزند
            expect(mockedFollowFindUnique).not.toHaveBeenCalled();
            expect(mockedCloseFriendFindUnique).not.toHaveBeenCalled();
        });

        it('7. اگر viewer دنبال‌کننده باشد، استوری‌های FOLLOWERS را می‌بیند', async () => {
            mockedStoryFindMany.mockResolvedValue([
                buildStory({ id: 's1', visibility: 'FOLLOWERS' }),
                buildStory({ id: 's2', visibility: 'CLOSE_FRIENDS' }),
            ]);
            mockedFollowFindUnique.mockResolvedValue({ id: 'follow-1' });
            mockedCloseFriendFindUnique.mockResolvedValue(null);

            const result = await storyQueries.getUserStories(
                null,
                { userId: 'owner-1' },
                { user: { userId: 'viewer-1' } }
            );

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('s1');
        });

        it('8. اگر viewer Close Friend باشد، استوری‌های CLOSE_FRIENDS را می‌بیند', async () => {
            mockedStoryFindMany.mockResolvedValue([
                buildStory({ id: 's1', visibility: 'CLOSE_FRIENDS' }),
            ]);
            mockedFollowFindUnique.mockResolvedValue(null);
            mockedCloseFriendFindUnique.mockResolvedValue({ id: 'cf-1' });

            const result = await storyQueries.getUserStories(
                null,
                { userId: 'owner-1' },
                { user: { userId: 'viewer-1' } }
            );

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('s1');
        });

        it('9. اگر viewer نه دنبال‌کننده باشد نه Close Friend، فقط PUBLIC را می‌بیند', async () => {
            mockedStoryFindMany.mockResolvedValue([
                buildStory({ id: 's1', visibility: 'PUBLIC' }),
                buildStory({ id: 's2', visibility: 'FOLLOWERS' }),
                buildStory({ id: 's3', visibility: 'CLOSE_FRIENDS' }),
            ]);
            mockedFollowFindUnique.mockResolvedValue(null);
            mockedCloseFriendFindUnique.mockResolvedValue(null);

            const result = await storyQueries.getUserStories(
                null,
                { userId: 'owner-1' },
                { user: { userId: 'viewer-1' } }
            );

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('s1');
        });

        it('10. فقط استوری‌های منقضی‌نشده را می‌خواند (expiresAt > now)', async () => {
            mockedStoryFindMany.mockResolvedValue([]);

            await storyQueries.getUserStories(null, { userId: 'owner-1' }, {});

            const args = mockedStoryFindMany.mock.calls[0][0];
            expect(args.where.userId).toBe('owner-1');
            expect(args.where.expiresAt.gt).toBeInstanceOf(Date);
        });

        it('11. viewers را برای غیر-صاحب استوری خالی برمی‌گرداند', async () => {
            mockedStoryFindMany.mockResolvedValue([
                buildStory({
                    id: 's1',
                    visibility: 'FOLLOWERS',
                    views: [{ viewerId: 'someone', viewer: { id: 'someone' }, viewedAt: new Date() }],
                }),
            ]);
            mockedFollowFindUnique.mockResolvedValue({ id: 'follow-1' });

            const result = await storyQueries.getUserStories(
                null,
                { userId: 'owner-1' },
                { user: { userId: 'viewer-1' } }
            );

            expect(result[0].viewers).toEqual([]);
            expect(result[0].viewsCount).toBe(1);
        });

        it('12. isViewedByMe برای بیننده‌ای که قبلاً دیده، true برمی‌گرداند', async () => {
            mockedStoryFindMany.mockResolvedValue([
                buildStory({
                    id: 's1',
                    visibility: 'PUBLIC',
                    views: [{ viewerId: 'viewer-1', viewer: {}, viewedAt: new Date() }],
                }),
            ]);

            const result = await storyQueries.getUserStories(
                null,
                { userId: 'owner-1' },
                { user: { userId: 'viewer-1' } }
            );

            expect(result[0].isViewedByMe).toBe(true);
        });
    });

    // ===================================================================
    // getFollowingStories
    // ===================================================================
    describe('getFollowingStories', () => {
        it('13. اگر کاربر هیچ‌کس را دنبال نکند، آرایه خالی برمی‌گرداند', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedFollowFindMany.mockResolvedValue([]);

            const result = await storyQueries.getFollowingStories(null, {}, {});

            expect(result).toEqual([]);
            expect(mockedStoryFindMany).not.toHaveBeenCalled();
        });

        it('14. استوری‌های دنبال‌شده‌ها را برمی‌گرداند (فقط visible)', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedFollowFindMany.mockResolvedValue([
                { followingId: 'owner-A' },
                { followingId: 'owner-B' },
            ]);
            mockedStoryFindMany.mockResolvedValue([
                buildStory({ id: 's1', userId: 'owner-A', visibility: 'PUBLIC' }),
                buildStory({ id: 's2', userId: 'owner-B', visibility: 'FOLLOWERS' }),
                buildStory({ id: 's3', userId: 'owner-B', visibility: 'CLOSE_FRIENDS' }),
            ]);
            mockedCloseFriendFindMany.mockResolvedValue([]);

            const result = await storyQueries.getFollowingStories(null, {}, {});

            expect(result).toHaveLength(2);
            expect(result.map((s: any) => s.id).sort()).toEqual(['s1', 's2']);
        });

        it('15. استوری‌های CLOSE_FRIENDS از دنبال‌شده‌هایی که Close Friend نیستند، فیلتر می‌شوند', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedFollowFindMany.mockResolvedValue([
                { followingId: 'owner-A' },
                { followingId: 'owner-B' },
            ]);
            mockedStoryFindMany.mockResolvedValue([
                buildStory({ id: 's1', userId: 'owner-A', visibility: 'CLOSE_FRIENDS' }),
                buildStory({ id: 's2', userId: 'owner-B', visibility: 'CLOSE_FRIENDS' }),
            ]);
            mockedCloseFriendFindMany.mockResolvedValue([{ ownerId: 'owner-A' }]);

            const result = await storyQueries.getFollowingStories(null, {}, {});

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('s1');
        });

        it('16. viewers را در getFollowingStories خالی برمی‌گرداند', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedFollowFindMany.mockResolvedValue([{ followingId: 'owner-A' }]);
            mockedStoryFindMany.mockResolvedValue([
                buildStory({
                    id: 's1',
                    userId: 'owner-A',
                    visibility: 'PUBLIC',
                    views: [{ viewerId: 'x', viewer: {}, viewedAt: new Date() }],
                }),
            ]);
            mockedCloseFriendFindMany.mockResolvedValue([]);

            const result = await storyQueries.getFollowingStories(null, {}, {});

            expect(result[0].viewers).toEqual([]);
            expect(result[0].viewsCount).toBe(1);
        });
    });

    // ===================================================================
    // getCloseFriends
    // ===================================================================
    describe('getCloseFriends', () => {
        it('17. لیست دوستان نزدیک را با mapUser برمی‌گرداند', async () => {
            mockedRequireAuth.mockReturnValue('user-1');
            mockedCloseFriendFindMany.mockResolvedValue([
                { friend: { id: 'friend-1' } },
                { friend: { id: 'friend-2' } },
            ]);

            const result = await storyQueries.getCloseFriends(null, {}, {});

            expect(result).toEqual([
                { mapped: true, sourceId: 'friend-1' },
                { mapped: true, sourceId: 'friend-2' },
            ]);
            expect(mockedCloseFriendFindMany).toHaveBeenCalledWith({
                where: { ownerId: 'user-1' },
                include: { friend: true },
            });
        });

        it('18. اگر کاربر لاگین نکرده باشد، requireAuth خطا می‌دهد', async () => {
            mockedRequireAuth.mockImplementation(() => {
                throw new Error('برای مشاهده باید وارد شوید.');
            });

            await expect(storyQueries.getCloseFriends(null, {}, {})).rejects.toThrow(
                'برای مشاهده باید وارد شوید.'
            );
        });
    });
});