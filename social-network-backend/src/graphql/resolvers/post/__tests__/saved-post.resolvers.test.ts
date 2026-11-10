// src/graphql/resolvers/post/__tests__/saved-post.resolvers.test.ts
import { savedPostResolvers } from '../saved-post.resolvers';
import { formatPost } from '../../helpers/formatPost';
import { requireAuth } from '../../try-catch/requireAuth';

// ✅ متدهای mock بیرون از factory تعریف می‌شوند تا همه‌ی instanceها از یک مجموعه‌ی مشترک استفاده کنند
// (نام متغیرها باید با `mock` شروع شود تا jest اجازه‌ی استفاده در jest.mock را بدهد)
const mockGetSavedPosts = jest.fn();
const mockToggleSavePost = jest.fn();

// ✅ با wrapper، مشکل hoisting / TDZ هم از بین می‌رود
jest.mock('../../../../modules/posts/saved-post.service', () => ({
    SavedPostService: jest.fn(() => ({
        getSavedPosts: (...args: any[]) => mockGetSavedPosts(...args),
        toggleSavePost: (...args: any[]) => mockToggleSavePost(...args),
    })),
}));

jest.mock('../../helpers/formatPost');
jest.mock('../../try-catch/requireAuth');

const mockedFormatPost = formatPost as jest.Mock;
const mockedRequireAuth = requireAuth as jest.Mock;

describe('savedPostResolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedRequireAuth.mockReturnValue('user-1');
    });

    // ==========================================
    // Query: getSavedPosts
    // ==========================================
    describe('Query.getSavedPosts', () => {
        it('باید از سرویس لیست را بگیرد و با formatPost فرمت کند', async () => {
            const mockPosts = [{ id: 'post-1' }];

            mockGetSavedPosts.mockResolvedValue({
                posts: mockPosts,
                totalCount: 1,
                hasMore: false,
            });
            mockedFormatPost.mockReturnValue({ id: 'post-1', formatted: true });

            const result = await savedPostResolvers.Query.getSavedPosts(
                null,
                { limit: 10, offset: 0 },
                {}
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith({});
            expect(mockGetSavedPosts).toHaveBeenCalledWith('user-1', 10, 0);
            expect(mockedFormatPost).toHaveBeenCalledWith(mockPosts[0], 'user-1');

            expect(result).toEqual({
                posts: [{ id: 'post-1', formatted: true }],
                totalCount: 1,
                hasMore: false,
            });
        });

        it('باید در صورت ندادن limit و offset از مقادیر پیش‌فرض (20 و 0) استفاده کند', async () => {
            mockGetSavedPosts.mockResolvedValue({
                posts: [],
                totalCount: 0,
                hasMore: false,
            });

            await savedPostResolvers.Query.getSavedPosts(null, {}, {});

            expect(mockGetSavedPosts).toHaveBeenCalledWith('user-1', 20, 0);
        });

        it('باید برای لیست خالی آرایه‌ی خالی برگرداند و formatPost را صدا نزند', async () => {
            mockGetSavedPosts.mockResolvedValue({
                posts: [],
                totalCount: 0,
                hasMore: false,
            });

            const result = await savedPostResolvers.Query.getSavedPosts(
                null,
                { limit: 10, offset: 0 },
                {}
            );

            expect(mockedFormatPost).not.toHaveBeenCalled();
            expect(result).toEqual({
                posts: [],
                totalCount: 0,
                hasMore: false,
            });
        });

        it('باید خطا بدهد اگر کاربر لاگین نباشد و سرویس صدا زده نشود', async () => {
            mockedRequireAuth.mockImplementation(() => {
                throw new Error('برای ادامه باید وارد شوید.');
            });

            await expect(
                savedPostResolvers.Query.getSavedPosts(null, { limit: 10, offset: 0 }, {})
            ).rejects.toThrow('برای ادامه باید وارد شوید.');

            expect(mockGetSavedPosts).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // Mutation: toggleSavePost
    // ==========================================
    describe('Mutation.toggleSavePost', () => {
        it('باید سرویس را با userId و postId صدا بزند', async () => {
            mockToggleSavePost.mockResolvedValue({
                success: true,
                message: 'ذخیره شد',
                isSaved: true,
            });

            const result = await savedPostResolvers.Mutation.toggleSavePost(
                null,
                { postId: 'post-1' },
                {}
            );

            expect(mockedRequireAuth).toHaveBeenCalledWith({});
            expect(mockToggleSavePost).toHaveBeenCalledWith('user-1', 'post-1');
            expect(result.isSaved).toBe(true);
        });

        it('باید خطا بدهد اگر کاربر لاگین نباشد (requireAuth خطا بدهد)', async () => {
            mockedRequireAuth.mockImplementation(() => {
                throw new Error('برای ادامه باید وارد شوید.');
            });

            await expect(
                savedPostResolvers.Mutation.toggleSavePost(null, { postId: 'post-1' }, {})
            ).rejects.toThrow('برای ادامه باید وارد شوید.');

            expect(mockToggleSavePost).not.toHaveBeenCalled();
        });
    });
});