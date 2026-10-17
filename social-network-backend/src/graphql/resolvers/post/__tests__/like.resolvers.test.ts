// graphql/resolvers/post/__tests__/like.resolvers.test.ts

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        post: {
            findUnique: jest.fn(),
        },
        comment: {
            findUnique: jest.fn(),
        },
        like: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        commentLike: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

jest.mock('../../helpers/notify', () => ({
    createNotification: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { likeResolvers } from '../like.resolvers';
import { createNotification } from '../../helpers/notify';

const mockedPostFindUnique = (prisma as any).post.findUnique as jest.Mock;
const mockedCommentFindUnique = (prisma as any).comment.findUnique as jest.Mock;
const mockedLikeFindUnique = (prisma as any).like.findUnique as jest.Mock;
const mockedLikeCreate = (prisma as any).like.create as jest.Mock;
const mockedLikeDelete = (prisma as any).like.delete as jest.Mock;
const mockedLikeCount = (prisma as any).like.count as jest.Mock;
const mockedCommentLikeFindUnique = (prisma as any).commentLike.findUnique as jest.Mock;
const mockedCommentLikeCreate = (prisma as any).commentLike.create as jest.Mock;
const mockedCommentLikeDelete = (prisma as any).commentLike.delete as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;
const mockedCreateNotification = createNotification as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockedRequireAuth.mockReturnValue('user-1');
    mockedLikeCount.mockResolvedValue(5);
    mockedPostFindUnique.mockResolvedValue({ id: 'post-1', userId: 'owner-1' });
    mockedCommentFindUnique.mockResolvedValue({ id: 'c1', userId: 'owner-1' });
});

// ===================================================================
// likePost
// ===================================================================
describe('likeResolvers.likePost', () => {
    test('اگر پست وجود نداشته باشد، خطا می‌دهد و لایکی ساخته نمی‌شود', async () => {
        mockedPostFindUnique.mockResolvedValue(null);

        await expect(
            likeResolvers.likePost(null, { postId: 'missing' }, {})
        ).rejects.toThrow('پست یافت نشد.');

        expect(mockedLikeCreate).not.toHaveBeenCalled();
        expect(mockedCreateNotification).not.toHaveBeenCalled();
    });

    test('اگر لایک قبلاً وجود داشته باشد، بدون ساخت لایک جدید پیام خطا و likesCount برمی‌گرداند', async () => {
        mockedLikeFindUnique.mockResolvedValue({ id: 'like-1' });
        mockedLikeCount.mockResolvedValue(10);

        const result = await likeResolvers.likePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeFindUnique).toHaveBeenCalledWith({
            where: { userId_postId: { userId: 'user-1', postId: 'post-1' } },
        });
        expect(mockedLikeCreate).not.toHaveBeenCalled();
        expect(mockedCreateNotification).not.toHaveBeenCalled();
        expect(mockedLikeCount).toHaveBeenCalledWith({ where: { postId: 'post-1' } });
        expect(result).toEqual({
            success: false,
            message: 'شما قبلاً این پست را لایک کرده‌اید.',
            isLiked: true,
            likesCount: 10,
        });
    });

    test('اگر لایک وجود نداشته باشد، لایک جدید می‌سازد، نوتیف می‌فرستد و likesCount جدید برمی‌گرداند', async () => {
        mockedLikeFindUnique.mockResolvedValue(null);
        mockedLikeCount.mockResolvedValue(6);

        const result = await likeResolvers.likePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeCreate).toHaveBeenCalledWith({
            data: { userId: 'user-1', postId: 'post-1' },
        });
        expect(mockedLikeCount).toHaveBeenCalledWith({ where: { postId: 'post-1' } });
        expect(mockedCreateNotification).toHaveBeenCalledWith({
            recipientId: 'owner-1',
            actorId: 'user-1',
            type: 'LIKE',
            postId: 'post-1',
        });
        expect(result).toEqual({
            success: true,
            message: 'پست با موفقیت لایک شد.',
            isLiked: true,
            likesCount: 6,
        });
    });

    test('اگر ساخت نوتیف خطا بدهد، لایک همچنان موفق است', async () => {
        mockedLikeFindUnique.mockResolvedValue(null);
        mockedLikeCount.mockResolvedValue(6);
        // Once: تا روی تست‌های بعدی اثر نگذارد (clearAllMocks پیاده‌سازی را پاک نمی‌کند)
        mockedCreateNotification.mockRejectedValueOnce(new Error('notify failed'));
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const result = await likeResolvers.likePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeCreate).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            message: 'پست با موفقیت لایک شد.',
            isLiked: true,
            likesCount: 6,
        });

        spy.mockRestore();
    });
});

// ===================================================================
// unlikePost
// ===================================================================
describe('likeResolvers.unlikePost', () => {
    test('اگر لایکی وجود نداشته باشد، بدون حذف پیام خطا و likesCount برمی‌گرداند', async () => {
        mockedLikeFindUnique.mockResolvedValue(null);
        mockedLikeCount.mockResolvedValue(5);

        const result = await likeResolvers.unlikePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeDelete).not.toHaveBeenCalled();
        expect(mockedLikeCount).toHaveBeenCalledWith({ where: { postId: 'post-1' } });
        expect(result).toEqual({
            success: false,
            message: 'شما این پست را لایک نکرده‌اید.',
            isLiked: false,
            likesCount: 5,
        });
    });

    test('اگر لایک وجود داشته باشد، آن را حذف می‌کند و likesCount جدید برمی‌گرداند', async () => {
        mockedLikeFindUnique.mockResolvedValue({ id: 'like-1' });
        mockedLikeCount.mockResolvedValue(4);

        const result = await likeResolvers.unlikePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeDelete).toHaveBeenCalledWith({ where: { id: 'like-1' } });
        expect(mockedLikeCount).toHaveBeenCalledWith({ where: { postId: 'post-1' } });
        expect(result).toEqual({
            success: true,
            message: 'لایک پست برداشته شد.',
            isLiked: false,
            likesCount: 4,
        });
    });
});

// ===================================================================
// likeComment
// ===================================================================
describe('likeResolvers.likeComment', () => {
    test('اگر کامنت وجود نداشته باشد، خطا می‌دهد و لایکی ساخته نمی‌شود', async () => {
        mockedCommentFindUnique.mockResolvedValue(null);

        await expect(
            likeResolvers.likeComment(null, { commentId: 'missing' }, {})
        ).rejects.toThrow('کامنت یافت نشد.');

        expect(mockedCommentLikeCreate).not.toHaveBeenCalled();
        expect(mockedCreateNotification).not.toHaveBeenCalled();
    });

    test('اگر لایک قبلاً وجود داشته باشد، بدون ساخت لایک جدید پیام خطا برمی‌گرداند', async () => {
        mockedCommentLikeFindUnique.mockResolvedValue({ id: 'clike-1' });

        const result = await likeResolvers.likeComment(null, { commentId: 'c1' }, {});

        expect(mockedCommentLikeFindUnique).toHaveBeenCalledWith({
            where: { userId_commentId: { userId: 'user-1', commentId: 'c1' } },
        });
        expect(mockedCommentLikeCreate).not.toHaveBeenCalled();
        expect(mockedCreateNotification).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: false,
            message: 'شما قبلاً این کامنت را لایک کرده‌اید.',
            isLiked: true,
        });
    });

    test('اگر لایک وجود نداشته باشد، لایک کامنت جدید می‌سازد و نوتیف می‌فرستد', async () => {
        mockedCommentLikeFindUnique.mockResolvedValue(null);

        const result = await likeResolvers.likeComment(null, { commentId: 'c1' }, {});

        expect(mockedCommentLikeCreate).toHaveBeenCalledWith({
            data: { userId: 'user-1', commentId: 'c1' },
        });
        expect(mockedCreateNotification).toHaveBeenCalledWith({
            recipientId: 'owner-1',
            actorId: 'user-1',
            type: 'COMMENT_LIKE',
            commentId: 'c1',
        });
        expect(result).toEqual({
            success: true,
            message: 'کامنت با موفقیت لایک شد.',
            isLiked: true,
        });
    });

    test('اگر ساخت نوتیف خطا بدهد، لایک کامنت همچنان موفق است', async () => {
        mockedCommentLikeFindUnique.mockResolvedValue(null);
        mockedCreateNotification.mockRejectedValueOnce(new Error('notify failed'));
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const result = await likeResolvers.likeComment(null, { commentId: 'c1' }, {});

        expect(mockedCommentLikeCreate).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            message: 'کامنت با موفقیت لایک شد.',
            isLiked: true,
        });

        spy.mockRestore();
    });
});

// ===================================================================
// unlikeComment
// ===================================================================
describe('likeResolvers.unlikeComment', () => {
    test('اگر لایکی وجود نداشته باشد، بدون حذف پیام خطا برمی‌گرداند', async () => {
        mockedCommentLikeFindUnique.mockResolvedValue(null);

        const result = await likeResolvers.unlikeComment(null, { commentId: 'c1' }, {});

        expect(mockedCommentLikeDelete).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: false,
            message: 'شما این کامنت را لایک نکرده‌اید.',
            isLiked: false,
        });
    });

    test('اگر لایک وجود داشته باشد، آن را حذف می‌کند', async () => {
        mockedCommentLikeFindUnique.mockResolvedValue({ id: 'clike-1' });

        const result = await likeResolvers.unlikeComment(null, { commentId: 'c1' }, {});

        expect(mockedCommentLikeDelete).toHaveBeenCalledWith({ where: { id: 'clike-1' } });
        expect(result).toEqual({
            success: true,
            message: 'لایک کامنت برداشته شد.',
            isLiked: false,
        });
    });
});

// ===================================================================
// احراز هویت مشترک
// ===================================================================
describe('likeResolvers - احراز هویت', () => {
    test('همه‌ی resolverها قبل از هر کاری requireAuth را صدا می‌زنند', async () => {
        mockedRequireAuth.mockImplementation(() => {
            throw new Error('برای ادامه باید وارد شوید.');
        });

        await expect(likeResolvers.likePost(null, { postId: 'p1' }, {})).rejects.toThrow();
        await expect(likeResolvers.unlikePost(null, { postId: 'p1' }, {})).rejects.toThrow();
        await expect(likeResolvers.likeComment(null, { commentId: 'c1' }, {})).rejects.toThrow();
        await expect(likeResolvers.unlikeComment(null, { commentId: 'c1' }, {})).rejects.toThrow();

        expect(mockedPostFindUnique).not.toHaveBeenCalled();
        expect(mockedCommentFindUnique).not.toHaveBeenCalled();
        expect(mockedLikeFindUnique).not.toHaveBeenCalled();
        expect(mockedLikeCreate).not.toHaveBeenCalled();
        expect(mockedLikeDelete).not.toHaveBeenCalled();
        expect(mockedLikeCount).not.toHaveBeenCalled();
        expect(mockedCommentLikeFindUnique).not.toHaveBeenCalled();
        expect(mockedCommentLikeCreate).not.toHaveBeenCalled();
        expect(mockedCommentLikeDelete).not.toHaveBeenCalled();
        expect(mockedCreateNotification).not.toHaveBeenCalled();
    });
});