// src/graphql/resolvers/post/__tests__/post.queries.test.ts

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        post: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
        follow: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('../../helpers/formatPost', () => ({
    formatPost: jest.fn(),
}));

jest.mock('../../helpers/checkProfileAccess', () => ({
    canViewPrivateProfile: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { formatPost } from '../../helpers/formatPost';
import { canViewPrivateProfile } from '../../helpers/checkProfileAccess';
import { postQueries } from '../post.queries';

const mockedFindUnique = (prisma as any).post.findUnique as jest.Mock;
const mockedFindMany = (prisma as any).post.findMany as jest.Mock;
const mockedUserFindUnique = (prisma as any).user.findUnique as jest.Mock;
const mockedFollowFindMany = (prisma as any).follow.findMany as jest.Mock;
const mockedFormatPost = formatPost as jest.Mock;
const mockedCanViewPrivateProfile = canViewPrivateProfile as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();

    mockedFormatPost.mockImplementation((post: any, userId?: string) => ({
        formatted: true,
        id: post.id,
        userId: userId ?? null,
    }));

    mockedCanViewPrivateProfile.mockResolvedValue(true);
});

// ===================================================================
// getPost
// ===================================================================
describe('postQueries.getPost', () => {
    const mockPost = { id: 'post-1', user: { id: 'owner-1', isPrivate: false } };

    test('1. پست را می‌خواند و با userId کاربر فرمت می‌کند', async () => {
        mockedFindUnique.mockResolvedValue(mockPost);
        const context = { user: { userId: 'user-1' } };

        const result = await postQueries.getPost(null, { postId: 'post-1' }, context);

        expect(mockedFindUnique).toHaveBeenCalledWith({
            where: { id: 'post-1' },
            include: {
                user: true,
                likes: true,
                savedBy: { where: { userId: 'user-1' } }, // ✅ این خط اضافه شد
                comments: {
                    include: {
                        user: true,
                        likes: true,
                        replies: {
                            include: {
                                user: true,
                                likes: true,
                            },
                        },
                    },
                },
            },
        });
        expect(mockedCanViewPrivateProfile).toHaveBeenCalledWith('user-1', {
            id: 'owner-1',
            isPrivate: false,
        });
        expect(mockedFormatPost).toHaveBeenCalledWith(mockPost, 'user-1');
        expect(result).toEqual({ formatted: true, id: 'post-1', userId: 'user-1' });
    });

    test('2. اگر کاربر لاگین نکرده باشد، userId برابر null به formatPost پاس می‌شود', async () => {
        mockedFindUnique.mockResolvedValue(mockPost);

        await postQueries.getPost(null, { postId: 'post-1' }, {});

        expect(mockedCanViewPrivateProfile).toHaveBeenCalledWith(null, {
            id: 'owner-1',
            isPrivate: false,
        });
        expect(mockedFormatPost).toHaveBeenCalledWith(mockPost, null);
    });

    test('3. اگر پست پیدا نشود، خطا پرتاب می‌کند', async () => {
        mockedFindUnique.mockResolvedValue(null);

        await expect(postQueries.getPost(null, { postId: 'missing' }, {})).rejects.toThrow(
            'پست یافت نشد.'
        );

        expect(mockedFormatPost).not.toHaveBeenCalled();
        expect(mockedCanViewPrivateProfile).not.toHaveBeenCalled();
    });

    test('4. اگر کاربر دسترسی نداشته باشد (پروفایل خصوصی)، خطا پرتاب می‌کند', async () => {
        mockedFindUnique.mockResolvedValue({
            ...mockPost,
            user: { id: 'owner-1', isPrivate: true },
        });
        mockedCanViewPrivateProfile.mockResolvedValue(false);

        await expect(postQueries.getPost(null, { postId: 'post-1' }, {})).rejects.toThrow(
            'این پست متعلق به یک حساب خصوصی است.'
        );

        expect(mockedFormatPost).not.toHaveBeenCalled();
    });
});

// ===================================================================
// getUserPosts
// ===================================================================
describe('postQueries.getUserPosts', () => {
    const mockProfileOwner = { id: 'user-1', isPrivate: false };

    test('5. پست‌های کاربر را با فیلتر isPublished و pagination می‌خواند', async () => {
        mockedUserFindUnique.mockResolvedValue(mockProfileOwner);
        mockedFindMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
        const context = { user: { userId: 'user-logged-in' } };

        const result = await postQueries.getUserPosts(
            null,
            { userId: 'user-1', limit: 5, offset: 20 },
            context
        );

        expect(mockedUserFindUnique).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            select: { id: true, isPrivate: true },
        });
        expect(mockedCanViewPrivateProfile).toHaveBeenCalledWith('user-logged-in', mockProfileOwner);
        expect(mockedFindMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', isPublished: true },
            include: {
                user: true,
                likes: true,
                savedBy: { where: { userId: 'user-logged-in' } }, // ✅ این خط اضافه شد
                comments: {
                    include: {
                        user: true,
                        likes: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            skip: 20,
        });
        expect(mockedFormatPost).toHaveBeenNthCalledWith(1, { id: 'p1' }, 'user-logged-in');
        expect(mockedFormatPost).toHaveBeenNthCalledWith(2, { id: 'p2' }, 'user-logged-in');
        expect(result).toHaveLength(2);
    });

    test('6. اگر profileOwner پیدا نشود، خطا پرتاب می‌کند', async () => {
        mockedUserFindUnique.mockResolvedValue(null);

        await expect(
            postQueries.getUserPosts(null, { userId: 'nonexistent' } as any, {})
        ).rejects.toThrow('کاربر یافت نشد.');

        expect(mockedFindMany).not.toHaveBeenCalled();
    });

    test('7. اگر کاربر دسترسی نداشته باشد، آرایه خالی برمی‌گرداند', async () => {
        mockedUserFindUnique.mockResolvedValue({ id: 'user-1', isPrivate: true });
        mockedCanViewPrivateProfile.mockResolvedValue(false);

        const result = await postQueries.getUserPosts(
            null,
            { userId: 'user-1', limit: 10, offset: 0 },
            { user: { userId: 'viewer-1' } }
        );

        expect(result).toEqual([]);
        expect(mockedFindMany).not.toHaveBeenCalled();
    });

    test('8. اگر کاربر لاگین نکرده باشد، currentUserId برابر null پاس می‌شود', async () => {
        mockedUserFindUnique.mockResolvedValue(mockProfileOwner);
        mockedFindMany.mockResolvedValue([{ id: 'p1' }]);

        await postQueries.getUserPosts(null, { userId: 'user-1', limit: 10, offset: 0 }, {});

        expect(mockedFormatPost).toHaveBeenCalledWith({ id: 'p1' }, null);
    });

    test('9. اگر limit/offset ارسال نشود، مقادیر پیش‌فرض 10 و 0 استفاده می‌شود', async () => {
        mockedUserFindUnique.mockResolvedValue(mockProfileOwner);
        mockedFindMany.mockResolvedValue([]);

        await postQueries.getUserPosts(null, { userId: 'user-1' } as any, {});

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 10, skip: 0 })
        );
    });

    test('10. اگر کاربر هیچ پستی نداشته باشد، آرایه خالی برمی‌گرداند', async () => {
        mockedUserFindUnique.mockResolvedValue(mockProfileOwner);
        mockedFindMany.mockResolvedValue([]);

        const result = await postQueries.getUserPosts(
            null,
            { userId: 'user-1', limit: 10, offset: 0 },
            {}
        );

        expect(result).toEqual([]);
        expect(mockedFormatPost).not.toHaveBeenCalled();
    });
});

// ===================================================================
// getFeed
// ===================================================================
describe('postQueries.getFeed', () => {
    test('11. فید را با فیلتر OR (public + following + own posts) می‌خواند', async () => {
        mockedFollowFindMany.mockResolvedValue([
            { followingId: 'followed-1' },
            { followingId: 'followed-2' },
        ]);
        mockedFindMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
        const context = { user: { userId: 'user-9' } };

        const result = await postQueries.getFeed(null, { limit: 10, offset: 0 }, context);

        expect(mockedFollowFindMany).toHaveBeenCalledWith({
            where: { followerId: 'user-9' },
            select: { followingId: true },
        });
        expect(mockedFindMany).toHaveBeenCalledWith({
            where: {
                isPublished: true,
                OR: [
                    { user: { isPrivate: false } },
                    { userId: { in: ['followed-1', 'followed-2'] } },
                    { userId: 'user-9' },
                ],
            },
            include: {
                user: true,
                likes: true,
                savedBy: { where: { userId: 'user-9' } }, // ✅ این خط اضافه شد
                comments: {
                    include: {
                        user: true,
                        likes: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            skip: 0,
        });
        expect(result).toHaveLength(2);
    });

    test('12. اگر کاربر لاگین نکرده باشد، followingIds خالی می‌شود و پست خودش حذف می‌شود', async () => {
        mockedFindMany.mockResolvedValue([{ id: 'p1' }]);
        const context = {};

        await postQueries.getFeed(null, { limit: 10, offset: 0 }, context);

        expect(mockedFollowFindMany).not.toHaveBeenCalled();

        const args = mockedFindMany.mock.calls[0][0];
        expect(args.where.OR).toEqual([
            { user: { isPrivate: false } },
            { userId: { in: [] } },
        ]);
    });

    test('13. pagination را با limit و offset سفارشی اعمال می‌کند', async () => {
        mockedFollowFindMany.mockResolvedValue([]);
        mockedFindMany.mockResolvedValue([]);

        await postQueries.getFeed(null, { limit: 25, offset: 50 }, { user: { userId: 'user-1' } });

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 25, skip: 50, orderBy: { createdAt: 'desc' } })
        );
    });

    test('14. اگر limit/offset ارسال نشود، مقادیر پیش‌فرض 10 و 0 استفاده می‌شود', async () => {
        mockedFollowFindMany.mockResolvedValue([]);
        mockedFindMany.mockResolvedValue([]);

        await postQueries.getFeed(null, {} as any, { user: { userId: 'user-1' } });

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 10, skip: 0 })
        );
    });
});