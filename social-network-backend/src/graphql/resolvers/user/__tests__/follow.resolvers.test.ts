jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
        },
        follow: {
            upsert: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

jest.mock('../../try-catch/requireAuth', () => ({
    requireAuth: jest.fn(),
}));

import prisma from '../../../../lib/prisma';
import { requireAuth } from '../../try-catch/requireAuth';
import { followResolvers } from '../follow.resolvers';

describe('followResolvers', () => {
    let mockContext: { req: any; res: any; user: { userId: string; email: string } | null };

    const mockTargetUser = {
        id: 'target-user-1',
        email: 'target@example.com',
        username: 'targetuser',
        fullName: 'Target User',
        bio: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        mockContext = {
            req: {},
            res: {},
            user: { userId: 'current-user-1', email: 'current@example.com' },
        };
        jest.clearAllMocks();
    });

    describe('followUser', () => {
        it('should return success, true isFollowing, and followersCount when following succeeds', async () => {
            // ماک‌ها
            (requireAuth as jest.Mock).mockReturnValue('current-user-1');
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockTargetUser);
            (prisma.follow.upsert as jest.Mock).mockResolvedValue({});
            (prisma.follow.count as jest.Mock).mockResolvedValue(150);

            const result = await followResolvers.followUser(null as any, { userId: 'target-user-1' }, mockContext);

            // بررسی فراخوانی‌ها
            expect(requireAuth).toHaveBeenCalledWith(mockContext, 'برای دنبال کردن کاربر باید وارد شوید.');
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'target-user-1' } });
            expect(prisma.follow.upsert).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: 'current-user-1',
                        followingId: 'target-user-1',
                    },
                },
                create: {
                    followerId: 'current-user-1',
                    followingId: 'target-user-1',
                },
                update: {},
            });
            expect(prisma.follow.count).toHaveBeenCalledWith({
                where: { followingId: 'target-user-1' },
            });

            // بررسی خروجی
            expect(result).toEqual({
                success: true,
                message: 'با موفقیت دنبال شد.',
                isFollowing: true,
                followersCount: 150,
            });
        });

        it('should throw error when not authenticated', async () => {
            (requireAuth as jest.Mock).mockImplementation(() => {
                throw new Error('برای دنبال کردن کاربر باید وارد شوید.');
            });
            mockContext.user = null;

            await expect(
                followResolvers.followUser(null as any, { userId: 'target-user-1' }, mockContext)
            ).rejects.toThrow('برای دنبال کردن کاربر باید وارد شوید.');

            expect(prisma.user.findUnique).not.toHaveBeenCalled();
            expect(prisma.follow.upsert).not.toHaveBeenCalled();
        });

        it('should throw error when user tries to follow themselves', async () => {
            (requireAuth as jest.Mock).mockReturnValue('current-user-1');

            await expect(
                followResolvers.followUser(null as any, { userId: 'current-user-1' }, mockContext)
            ).rejects.toThrow('نمی‌توانید خودتان را دنبال کنید.');

            expect(prisma.user.findUnique).not.toHaveBeenCalled();
            expect(prisma.follow.upsert).not.toHaveBeenCalled();
        });

        it('should throw error when target user does not exist', async () => {
            (requireAuth as jest.Mock).mockReturnValue('current-user-1');
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                followResolvers.followUser(null as any, { userId: 'nonexistent' }, mockContext)
            ).rejects.toThrow('کاربر یافت نشد.');

            expect(prisma.follow.upsert).not.toHaveBeenCalled();
        });
    });

    describe('unfollowUser', () => {
        it('should return success, false isFollowing, and followersCount when unfollowing succeeds', async () => {
            // ماک‌ها
            (requireAuth as jest.Mock).mockReturnValue('current-user-1');
            (prisma.follow.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.follow.count as jest.Mock).mockResolvedValue(100);

            const result = await followResolvers.unfollowUser(null as any, { userId: 'target-user-1' }, mockContext);

            // بررسی فراخوانی‌ها
            expect(requireAuth).toHaveBeenCalledWith(mockContext, 'برای لغو دنبال کردن باید وارد شوید.');
            expect(prisma.follow.deleteMany).toHaveBeenCalledWith({
                where: {
                    followerId: 'current-user-1',
                    followingId: 'target-user-1',
                },
            });
            expect(prisma.follow.count).toHaveBeenCalledWith({
                where: { followingId: 'target-user-1' },
            });

            // بررسی خروجی
            expect(result).toEqual({
                success: true,
                message: 'دنبال کردن لغو شد.',
                isFollowing: false,
                followersCount: 100,
            });
        });

        it('should throw error when not authenticated', async () => {
            (requireAuth as jest.Mock).mockImplementation(() => {
                throw new Error('برای لغو دنبال کردن باید وارد شوید.');
            });
            mockContext.user = null;

            await expect(
                followResolvers.unfollowUser(null as any, { userId: 'target-user-1' }, mockContext)
            ).rejects.toThrow('برای لغو دنبال کردن باید وارد شوید.');

            expect(prisma.follow.deleteMany).not.toHaveBeenCalled();
        });
    });
});