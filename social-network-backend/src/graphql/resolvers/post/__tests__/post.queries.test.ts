// graphql/resolvers/post/__tests__/post.queries.test.ts
//
// prisma و formatPost mock می‌شوند تا تست کاملاً روی منطق خود resolverها
// (نه دیتابیس واقعی یا فرمت‌دهی) متمرکز باشد.

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        post: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

jest.mock('../../helpers/formatPost', () => ({
    formatPost: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { formatPost } from '../../helpers/formatPost';
import { postQueries } from '../post.queries';

const mockedFindUnique = (prisma as any).post.findUnique as jest.Mock;
const mockedFindMany = (prisma as any).post.findMany as jest.Mock;
const mockedFormatPost = formatPost as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockedFormatPost.mockImplementation((post: any, userId?: string) => ({
        formatted: true,
        id: post.id,
        userId: userId ?? null,
    }));
});

// ===================================================================
// getPost
// ===================================================================
describe('postQueries.getPost', () => {
    test('پست را با include صحیح از prisma می‌خواند و آن را فرمت می‌کند', async () => {
        const rawPost = { id: 'post-1' };
        mockedFindUnique.mockResolvedValue(rawPost);

        const result = await postQueries.getPost(null, { postId: 'post-1' });

        expect(mockedFindUnique).toHaveBeenCalledWith({
            where: { id: 'post-1' },
            include: {
                user: true,
                likes: true,
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
        expect(mockedFormatPost).toHaveBeenCalledWith(rawPost);
        expect(result).toEqual({ formatted: true, id: 'post-1', userId: null });
    });

    test('اگر پست پیدا نشود، خطا پرتاب می‌کند و formatPost فراخوانی نمی‌شود', async () => {
        mockedFindUnique.mockResolvedValue(null);

        await expect(postQueries.getPost(null, { postId: 'missing' })).rejects.toThrow(
            'پست یافت نشد.'
        );
        expect(mockedFormatPost).not.toHaveBeenCalled();
    });
});

// ===================================================================
// getUserPosts
// ===================================================================
describe('postQueries.getUserPosts', () => {
    test('پست‌های کاربر را با فیلتر isPublished و pagination صحیح می‌خواند', async () => {
        mockedFindMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

        const result = await postQueries.getUserPosts(null, {
            userId: 'user-1',
            limit: 5,
            offset: 20,
        });

        expect(mockedFindMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', isPublished: true },
            include: {
                user: true,
                likes: true,
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
        expect(result).toEqual([
            { formatted: true, id: 'p1', userId: null },
            { formatted: true, id: 'p2', userId: null },
        ]);
    });

    test('اگر limit/offset ارسال نشود، مقادیر پیش‌فرض 10 و 0 استفاده می‌شود', async () => {
        mockedFindMany.mockResolvedValue([]);

        await postQueries.getUserPosts(null, { userId: 'user-1' } as any);

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 10, skip: 0 })
        );
    });

    test('اگر کاربر هیچ پستی نداشته باشد، آرایه خالی برمی‌گرداند', async () => {
        mockedFindMany.mockResolvedValue([]);

        const result = await postQueries.getUserPosts(null, {
            userId: 'user-1',
            limit: 10,
            offset: 0,
        });

        expect(result).toEqual([]);
        expect(mockedFormatPost).not.toHaveBeenCalled();
    });

    test('formatPost را بدون userId (بدون isLiked) فراخوانی می‌کند', async () => {
        mockedFindMany.mockResolvedValue([{ id: 'p1' }]);

        await postQueries.getUserPosts(null, { userId: 'user-1', limit: 10, offset: 0 });

        expect(mockedFormatPost).toHaveBeenCalledWith({ id: 'p1' });
        expect(mockedFormatPost).toHaveBeenCalledTimes(1);
    });
});

// ===================================================================
// getFeed
// ===================================================================
describe('postQueries.getFeed', () => {
    test('فقط پست‌های isPublished را می‌خواند و به formatPost با userId کاربر لاگین‌شده پاس می‌دهد', async () => {
        mockedFindMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
        const context = { user: { userId: 'user-9' } };

        const result = await postQueries.getFeed(null, { limit: 10, offset: 0 }, context);

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { isPublished: true } })
        );
        expect(mockedFormatPost).toHaveBeenNthCalledWith(1, { id: 'p1' }, 'user-9');
        expect(mockedFormatPost).toHaveBeenNthCalledWith(2, { id: 'p2' }, 'user-9');
        expect(result).toEqual([
            { formatted: true, id: 'p1', userId: 'user-9' },
            { formatted: true, id: 'p2', userId: 'user-9' },
        ]);
    });

    test('اگر کاربر لاگین نکرده باشد (context.user نباشد)، userId برابر null به formatPost پاس می‌شود', async () => {
        mockedFindMany.mockResolvedValue([{ id: 'p1' }]);
        const context = {};

        await postQueries.getFeed(null, { limit: 10, offset: 0 }, context);

        expect(mockedFormatPost).toHaveBeenCalledWith({ id: 'p1' }, null);
    });

    test('pagination را با limit و offset سفارشی اعمال می‌کند', async () => {
        mockedFindMany.mockResolvedValue([]);
        const context = { user: { userId: 'user-1' } };

        await postQueries.getFeed(null, { limit: 25, offset: 50 }, context);

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 25, skip: 50, orderBy: { createdAt: 'desc' } })
        );
    });

    test('اگر limit/offset ارسال نشود، مقادیر پیش‌فرض 10 و 0 استفاده می‌شود', async () => {
        mockedFindMany.mockResolvedValue([]);
        const context = { user: { userId: 'user-1' } };

        await postQueries.getFeed(null, {} as any, context);

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 10, skip: 0 })
        );
    });
});