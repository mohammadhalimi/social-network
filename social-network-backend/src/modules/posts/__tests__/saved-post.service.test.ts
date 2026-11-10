// src/modules/post/__tests__/saved-post.service.test.ts
import prisma from '../../../lib/prisma';
import { SavedPostService } from '../saved-post.service';


// ✅ mock کردن Prisma
jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        post: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        savedPost: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    },
}));

const mockedPrisma = prisma as any;

describe('SavedPostService', () => {
    let service: SavedPostService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new SavedPostService();
    });

    // ==========================================
    // toggleSavePost
    // ==========================================
    describe('toggleSavePost', () => {
        it('should throw error if post does not exist', async () => {
            mockedPrisma.post.findUnique.mockResolvedValue(null);

            await expect(service.toggleSavePost('user-1', 'post-1'))
                .rejects.toThrow('پست یافت نشد.');
        });

        it('should remove from saved if already saved (toggle off)', async () => {
            mockedPrisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
            mockedPrisma.savedPost.findUnique.mockResolvedValue({ id: 'saved-1' });

            const result = await service.toggleSavePost('user-1', 'post-1');

            expect(mockedPrisma.savedPost.delete).toHaveBeenCalledWith({
                where: { id: 'saved-1' },
            });
            expect(result).toEqual({
                success: true,
                message: 'پست از ذخیره‌ها حذف شد.',
                isSaved: false,
            });
        });

        it('should save post if not already saved (toggle on)', async () => {
            mockedPrisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
            mockedPrisma.savedPost.findUnique.mockResolvedValue(null);

            const result = await service.toggleSavePost('user-1', 'post-1');

            expect(mockedPrisma.savedPost.create).toHaveBeenCalledWith({
                data: { userId: 'user-1', postId: 'post-1' },
            });
            expect(result).toEqual({
                success: true,
                message: 'پست ذخیره شد.',
                isSaved: true,
            });
        });
    });

    // ==========================================
    // getSavedPosts
    // ==========================================
    describe('getSavedPosts', () => {
        it('should return saved posts with _count and hasMore', async () => {
            // ✅ فیلدهای likes و savedBy رو اضافه کردیم تا سرویس کرش نکنه
            const mockPosts = [
                { id: 'post-1', likes: [{ userId: 'user-1' }], savedBy: [{ userId: 'user-1' }] },
                { id: 'post-2', likes: [], savedBy: [{ userId: 'user-1' }] }
            ];
            mockedPrisma.post.findMany.mockResolvedValue(mockPosts);
            mockedPrisma.savedPost.count.mockResolvedValue(5); // کل ذخیره‌ها ۵ تاست

            const result = await service.getSavedPosts('user-1', 2, 0);

            expect(mockedPrisma.post.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { savedBy: { some: { userId: 'user-1' } } },
                    include: expect.objectContaining({
                        _count: { select: { comments: true, likes: true } },
                    }),
                })
            );

            // ✅ حالا چک می‌کنیم که isLiked درست محاسبه شده
            expect(result.posts[0].isLiked).toBe(true);
            expect(result.posts[1].isLiked).toBe(false);

            expect(result.totalCount).toBe(5);
            expect(result.hasMore).toBe(true); // چون 2 < 5
        });
    });
});