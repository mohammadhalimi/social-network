// graphql/resolvers/post/__tests__/like.resolvers.test.ts

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        like: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
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

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { likeResolvers } from '../like.resolvers';

const mockedLikeFindUnique = (prisma as any).like.findUnique as jest.Mock;
const mockedLikeCreate = (prisma as any).like.create as jest.Mock;
const mockedLikeDelete = (prisma as any).like.delete as jest.Mock;
const mockedCommentLikeFindUnique = (prisma as any).commentLike.findUnique as jest.Mock;
const mockedCommentLikeCreate = (prisma as any).commentLike.create as jest.Mock;
const mockedCommentLikeDelete = (prisma as any).commentLike.delete as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockedRequireAuth.mockReturnValue('user-1');
});

// ===================================================================
// likePost
// ===================================================================
describe('likeResolvers.likePost', () => {
    test('اگر لایک قبلاً وجود داشته باشد، بدون ساخت لایک جدید پیام خطا برمی‌گرداند', async () => {
        mockedLikeFindUnique.mockResolvedValue({ id: 'like-1' });

        const result = await likeResolvers.likePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeFindUnique).toHaveBeenCalledWith({
            where: { userId_postId: { userId: 'user-1', postId: 'post-1' } },
        });
        expect(mockedLikeCreate).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: false,
            message: 'شما قبلاً این پست را لایک کرده‌اید.',
            isLiked: true,
        });
    });

    test('اگر لایک وجود نداشته باشد، لایک جدید می‌سازد و موفقیت برمی‌گرداند', async () => {
        mockedLikeFindUnique.mockResolvedValue(null);

        const result = await likeResolvers.likePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeCreate).toHaveBeenCalledWith({
            data: { userId: 'user-1', postId: 'post-1' },
        });
        expect(result).toEqual({
            success: true,
            message: 'پست با موفقیت لایک شد.',
            isLiked: true,
        });
    });
});

// ===================================================================
// unlikePost
// ===================================================================
describe('likeResolvers.unlikePost', () => {
    test('اگر لایکی وجود نداشته باشد، بدون حذف پیام خطا برمی‌گرداند', async () => {
        mockedLikeFindUnique.mockResolvedValue(null);

        const result = await likeResolvers.unlikePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeDelete).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: false,
            message: 'شما این پست را لایک نکرده‌اید.',
            isLiked: false,
        });
    });

    test('اگر لایک وجود داشته باشد، آن را حذف می‌کند', async () => {
        mockedLikeFindUnique.mockResolvedValue({ id: 'like-1' });

        const result = await likeResolvers.unlikePost(null, { postId: 'post-1' }, {});

        expect(mockedLikeDelete).toHaveBeenCalledWith({ where: { id: 'like-1' } });
        expect(result).toEqual({
            success: true,
            message: 'لایک پست برداشته شد.',
            isLiked: false,
        });
    });
});

// ===================================================================
// likeComment
// ===================================================================
describe('likeResolvers.likeComment', () => {
    test('اگر لایک قبلاً وجود داشته باشد، بدون ساخت لایک جدید پیام خطا برمی‌گرداند', async () => {
        mockedCommentLikeFindUnique.mockResolvedValue({ id: 'clike-1' });

        const result = await likeResolvers.likeComment(null, { commentId: 'c1' }, {});

        expect(mockedCommentLikeFindUnique).toHaveBeenCalledWith({
            where: { userId_commentId: { userId: 'user-1', commentId: 'c1' } },
        });
        expect(mockedCommentLikeCreate).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: false,
            message: 'شما قبلاً این کامنت را لایک کرده‌اید.',
            isLiked: true,
        });
    });

    test('اگر لایک وجود نداشته باشد، لایک کامنت جدید می‌سازد', async () => {
        mockedCommentLikeFindUnique.mockResolvedValue(null);

        const result = await likeResolvers.likeComment(null, { commentId: 'c1' }, {});

        expect(mockedCommentLikeCreate).toHaveBeenCalledWith({
            data: { userId: 'user-1', commentId: 'c1' },
        });
        expect(result).toEqual({
            success: true,
            message: 'کامنت با موفقیت لایک شد.',
            isLiked: true,
        });
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

        expect(mockedLikeFindUnique).not.toHaveBeenCalled();
        expect(mockedCommentLikeFindUnique).not.toHaveBeenCalled();
    });
});