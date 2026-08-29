// graphql/resolvers/post/__tests__/post.mutations.test.ts

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        post: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('../../helpers/formatPost', () => ({
    formatPost: jest.fn(),
}));

jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { formatPost } from '../../helpers/formatPost';
import { requireAuth } from '../../try-catch/requireAuth';
import { postMutations } from '../post.mutations';

const mockedCreate = (prisma as any).post.create as jest.Mock;
const mockedFindUnique = (prisma as any).post.findUnique as jest.Mock;
const mockedUpdate = (prisma as any).post.update as jest.Mock;
const mockedDelete = (prisma as any).post.delete as jest.Mock;
const mockedFormatPost = formatPost as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockedRequireAuth.mockReturnValue('user-1');
    mockedFormatPost.mockImplementation((post: any, userId?: string) => ({
        formatted: true,
        id: post.id,
        userId,
    }));
});

// ===================================================================
// createPost
// ===================================================================
describe('postMutations.createPost', () => {
    test('احراز هویت را بررسی می‌کند و پست جدید را با userId فعلی می‌سازد', async () => {
        mockedCreate.mockResolvedValue({ id: 'post-1' });
        const context = { user: { userId: 'user-1' } };

        const result = await postMutations.createPost(null, { content: 'متن پست' }, context);

        expect(mockedRequireAuth).toHaveBeenCalledWith(context);
        expect(mockedCreate).toHaveBeenCalledWith({
            data: { content: 'متن پست', userId: 'user-1' },
            include: {
                user: true,
                likes: true,
                comments: { include: { user: true, likes: true } },
            },
        });
        expect(mockedFormatPost).toHaveBeenCalledWith({ id: 'post-1' }, 'user-1');
        expect(result).toEqual({
            success: true,
            message: 'پست با موفقیت ایجاد شد.',
            post: { formatted: true, id: 'post-1', userId: 'user-1' },
        });
    });

    test('اگر کاربر لاگین نکرده باشد (requireAuth خطا بدهد)، پستی ساخته نمی‌شود', async () => {
        mockedRequireAuth.mockImplementation(() => {
            throw new Error('برای ادامه باید وارد شوید.');
        });

        await expect(
            postMutations.createPost(null, { content: 'متن' }, {})
        ).rejects.toThrow('برای ادامه باید وارد شوید.');

        expect(mockedCreate).not.toHaveBeenCalled();
    });
});

// ===================================================================
// updatePost
// ===================================================================
describe('postMutations.updatePost', () => {
    test('پست را وقتی مالک درخواست‌دهنده است، ویرایش می‌کند', async () => {
        mockedFindUnique.mockResolvedValue({ id: 'post-1', userId: 'user-1' });
        mockedUpdate.mockResolvedValue({ id: 'post-1', content: 'متن جدید' });

        const result = await postMutations.updatePost(
            null,
            { postId: 'post-1', content: 'متن جدید' },
            { user: { userId: 'user-1' } }
        );

        expect(mockedUpdate).toHaveBeenCalledWith({
            where: { id: 'post-1' },
            data: { content: 'متن جدید' },
            include: {
                user: true,
                likes: true,
                comments: { include: { user: true, likes: true } },
            },
        });
        expect(result).toEqual({
            success: true,
            message: 'پست با موفقیت ویرایش شد.',
            post: { formatted: true, id: 'post-1', userId: 'user-1' },
        });
    });

    test('اگر پست وجود نداشته باشد، خطا می‌دهد و update فراخوانی نمی‌شود', async () => {
        mockedFindUnique.mockResolvedValue(null);

        await expect(
            postMutations.updatePost(null, { postId: 'missing', content: 'x' }, {})
        ).rejects.toThrow('پست یافت نشد.');

        expect(mockedUpdate).not.toHaveBeenCalled();
    });

    test('اگر کاربر مالک پست نباشد، خطای عدم دسترسی می‌دهد', async () => {
        mockedFindUnique.mockResolvedValue({ id: 'post-1', userId: 'owner-2' });
        mockedRequireAuth.mockReturnValue('user-1');

        await expect(
            postMutations.updatePost(
                null,
                { postId: 'post-1', content: 'x' },
                { user: { userId: 'user-1' } }
            )
        ).rejects.toThrow('شما اجازه ویرایش این پست را ندارید.');

        expect(mockedUpdate).not.toHaveBeenCalled();
    });
});

// ===================================================================
// deletePost
// ===================================================================
describe('postMutations.deletePost', () => {
    test('پست را وقتی مالک درخواست‌دهنده است، حذف می‌کند', async () => {
        mockedFindUnique.mockResolvedValue({ id: 'post-1', userId: 'user-1' });

        const result = await postMutations.deletePost(
            null,
            { postId: 'post-1' },
            { user: { userId: 'user-1' } }
        );

        expect(mockedDelete).toHaveBeenCalledWith({ where: { id: 'post-1' } });
        expect(result).toEqual({ success: true, message: 'پست با موفقیت حذف شد.' });
    });

    test('اگر پست وجود نداشته باشد، خطا می‌دهد و delete فراخوانی نمی‌شود', async () => {
        mockedFindUnique.mockResolvedValue(null);

        await expect(
            postMutations.deletePost(null, { postId: 'missing' }, {})
        ).rejects.toThrow('پست یافت نشد.');

        expect(mockedDelete).not.toHaveBeenCalled();
    });

    test('اگر کاربر مالک پست نباشد، خطای عدم دسترسی می‌دهد', async () => {
        mockedFindUnique.mockResolvedValue({ id: 'post-1', userId: 'owner-2' });
        mockedRequireAuth.mockReturnValue('user-1');

        await expect(
            postMutations.deletePost(null, { postId: 'post-1' }, { user: { userId: 'user-1' } })
        ).rejects.toThrow('شما اجازه حذف این پست را ندارید.');

        expect(mockedDelete).not.toHaveBeenCalled();
    });
});