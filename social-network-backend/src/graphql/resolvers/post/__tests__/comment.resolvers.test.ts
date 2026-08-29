// graphql/resolvers/post/__tests__/comment.resolvers.test.ts

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        post: {
            findUnique: jest.fn(),
        },
        comment: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('../../helpers/mapUser', () => ({
    mapUser: jest.fn(),
}));

jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { mapUser } from '../../helpers/mapUser';
import { requireAuth } from '../../try-catch/requireAuth';
import { commentResolvers } from '../comment.resolvers';

const mockedPostFindUnique = (prisma as any).post.findUnique as jest.Mock;
const mockedCommentCreate = (prisma as any).comment.create as jest.Mock;
const mockedCommentFindUnique = (prisma as any).comment.findUnique as jest.Mock;
const mockedCommentDelete = (prisma as any).comment.delete as jest.Mock;
const mockedMapUser = mapUser as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockedRequireAuth.mockReturnValue('user-1');
    mockedMapUser.mockImplementation((user: any) => ({ mapped: true, id: user?.id }));
});

// ===================================================================
// commentOnPost
// ===================================================================
describe('commentResolvers.commentOnPost', () => {
    test('اگر پست وجود نداشته باشد، خطا می‌دهد و کامنتی ساخته نمی‌شود', async () => {
        mockedPostFindUnique.mockResolvedValue(null);

        await expect(
            commentResolvers.commentOnPost(null, { postId: 'missing', content: 'سلام' }, {})
        ).rejects.toThrow('پست یافت نشد.');

        expect(mockedCommentCreate).not.toHaveBeenCalled();
    });

    test('کامنت جدید را می‌سازد و پاسخ فرمت‌شده برمی‌گرداند', async () => {
        mockedPostFindUnique.mockResolvedValue({ id: 'post-1' });
        mockedCommentCreate.mockResolvedValue({
            id: 'comment-1',
            content: 'سلام',
            user: { id: 'user-1' },
            likes: [{ userId: 'user-1' }],
        });

        const result = await commentResolvers.commentOnPost(
            null,
            { postId: 'post-1', content: 'سلام' },
            {}
        );

        expect(mockedCommentCreate).toHaveBeenCalledWith({
            data: { content: 'سلام', userId: 'user-1', postId: 'post-1' },
            include: { user: true, likes: true },
        });
        expect(result).toEqual({
            success: true,
            message: 'کامنت با موفقیت ثبت شد.',
            comment: {
                id: 'comment-1',
                content: 'سلام',
                user: { mapped: true, id: 'user-1' },
                likes: [{ userId: 'user-1' }],
                likesCount: 1,
                isLiked: true,
                replies: [],
            },
        });
    });

    test('isLiked وقتی کاربر فعلی در لایک‌های کامنت نباشد، false است', async () => {
        mockedPostFindUnique.mockResolvedValue({ id: 'post-1' });
        mockedCommentCreate.mockResolvedValue({
            id: 'comment-1',
            user: { id: 'user-1' },
            likes: [{ userId: 'other-user' }],
        });

        const result = await commentResolvers.commentOnPost(
            null,
            { postId: 'post-1', content: 'سلام' },
            {}
        );

        expect(result.comment.isLiked).toBe(false);
        expect(result.comment.likesCount).toBe(1);
    });
});

// ===================================================================
// replyToComment
// ===================================================================
describe('commentResolvers.replyToComment', () => {
    test('اگر کامنت والد وجود نداشته باشد، خطا می‌دهد و ریپلای ساخته نمی‌شود', async () => {
        mockedCommentFindUnique.mockResolvedValue(null);

        await expect(
            commentResolvers.replyToComment(null, { commentId: 'missing', content: 'پاسخ' }, {})
        ).rejects.toThrow('کامنت یافت نشد.');

        expect(mockedCommentCreate).not.toHaveBeenCalled();
    });

    test('ریپلای را با postId کامنت والد و parentId درست می‌سازد', async () => {
        mockedCommentFindUnique.mockResolvedValue({ id: 'comment-1', postId: 'post-1' });
        mockedCommentCreate.mockResolvedValue({
            id: 'reply-1',
            user: { id: 'user-1' },
            likes: [],
        });

        const result = await commentResolvers.replyToComment(
            null,
            { commentId: 'comment-1', content: 'پاسخ' },
            {}
        );

        expect(mockedCommentCreate).toHaveBeenCalledWith({
            data: { content: 'پاسخ', userId: 'user-1', postId: 'post-1', parentId: 'comment-1' },
            include: { user: true, likes: true },
        });
        expect(result).toEqual({
            success: true,
            message: 'ریپلی با موفقیت ثبت شد.',
            comment: {
                id: 'reply-1',
                user: { mapped: true, id: 'user-1' },
                likes: [],
                likesCount: 0,
                isLiked: false,
                replies: [],
            },
        });
    });
});

// ===================================================================
// deleteComment
// ===================================================================
describe('commentResolvers.deleteComment', () => {
    test('اگر کامنت وجود نداشته باشد، خطا می‌دهد', async () => {
        mockedCommentFindUnique.mockResolvedValue(null);

        await expect(
            commentResolvers.deleteComment(null, { commentId: 'missing' }, {})
        ).rejects.toThrow('کامنت یافت نشد.');

        expect(mockedCommentDelete).not.toHaveBeenCalled();
    });

    test('اگر کاربر مالک کامنت نباشد، خطای عدم دسترسی می‌دهد', async () => {
        mockedCommentFindUnique.mockResolvedValue({ id: 'comment-1', userId: 'owner-2' });
        mockedRequireAuth.mockReturnValue('user-1');

        await expect(
            commentResolvers.deleteComment(null, { commentId: 'comment-1' }, {})
        ).rejects.toThrow('شما اجازه حذف این کامنت را ندارید.');

        expect(mockedCommentDelete).not.toHaveBeenCalled();
    });

    test('اگر کاربر مالک کامنت باشد، آن را حذف می‌کند', async () => {
        mockedCommentFindUnique.mockResolvedValue({ id: 'comment-1', userId: 'user-1' });

        const result = await commentResolvers.deleteComment(
            null,
            { commentId: 'comment-1' },
            {}
        );

        expect(mockedCommentDelete).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
        expect(result).toEqual({ success: true, message: 'کامنت با موفقیت حذف شد.' });
    });
});