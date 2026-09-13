// resolvers/user/__tests__/user.queries.test.ts

jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
        follow: {
            count: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(), // ✅ اضافه شد - برای getFollowers/getFollowing
        },
    },
}));

import prisma from '../../../../lib/prisma';
import { userQueries } from '../../user/user.queries';

describe('userQueries', () => {
    let mockContext: { req: any; res: any; user: { userId: string; email: string } | null };

    const mockUser = {
        id: 'cm123',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'کاربر تست',
        bio: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockUser2 = {
        id: 'cm456',
        email: 'ali@example.com',
        username: 'alireza',
        fullName: 'علی رضایی',
        bio: 'برنامه‌نویس',
        avatar: 'https://cdn.example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser3 = {
        id: 'cm789',
        email: 'sara@example.com',
        username: 'saramo',
        fullName: 'سارا محمدی',
        bio: 'طراح گرافیک',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        mockContext = {
            req: {},
            res: {},
            user: { userId: 'cm123', email: 'test@example.com' },
        };
        jest.clearAllMocks();
    });

    describe('_empty', () => {
        it('should return an empty string', () => {
            expect(userQueries._empty()).toBe('');
        });
    });

    describe('me', () => {
        it('should return the current user when authenticated and found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await userQueries.me(null as any, null as any, mockContext);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'cm123' } });
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                username: mockUser.username,
                fullName: mockUser.fullName,
                bio: mockUser.bio,
                avatar: mockUser.avatar,
                createdAt: mockUser.createdAt.toISOString(),
                updatedAt: mockUser.updatedAt.toISOString(),
                followersCount: 0,
                followingCount: 0,
                isFollowing: false,
            });
        });

        it('should throw when not authenticated', async () => {
            mockContext.user = null;

            await expect(userQueries.me(null as any, null as any, mockContext)).rejects.toThrow(
                'برای دسترسی به این بخش باید وارد شوید.'
            );
            expect(prisma.user.findUnique).not.toHaveBeenCalled();
        });

        it('should throw when the user is not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(userQueries.me(null as any, null as any, mockContext)).rejects.toThrow(
                'کاربر یافت نشد.'
            );
        });
    });

    describe('searchUsers', () => {
        const mockSearchUsers = [mockUser2, mockUser3];

        it('should search users with case-insensitive OR condition', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue(mockSearchUsers);
            (prisma.user.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'al',
                limit: 10,
                offset: 0,
            });

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { username: { contains: 'al', mode: 'insensitive' } },
                        { fullName: { contains: 'al', mode: 'insensitive' } },
                    ],
                },
                select: expect.any(Object),
            });

            expect(result.users).toHaveLength(2);
            expect(result.totalCount).toBe(2);
            expect(result.hasMore).toBe(false);
        });

        it('should prioritize users whose username starts with searchTerm', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser3, mockUser2]);
            (prisma.user.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'al',
                limit: 10,
                offset: 0,
            });

            expect(result.users[0].username).toBe('alireza');
            expect(result.users[1].username).toBe('saramo');
        });

        it('should prioritize users whose fullName starts with searchTerm', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser3, mockUser2]);
            (prisma.user.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'علی',
                limit: 10,
                offset: 0,
            });

            expect(result.users[0].username).toBe('alireza');
        });

        it('should apply pagination manually using slice and return hasMore correctly', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser, mockUser2, mockUser3]);
            (prisma.user.count as jest.Mock).mockResolvedValue(3);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'a',
                limit: 2,
                offset: 0,
            });

            expect(result.users).toHaveLength(2);
            expect(result.hasMore).toBe(true);

            const result2 = await userQueries.searchUsers(null as any, {
                searchTerm: 'a',
                limit: 2,
                offset: 2,
            });

            expect(result2.users).toHaveLength(1);
            expect(result2.hasMore).toBe(false);
        });

        it('should return empty array when no users match', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.user.count as jest.Mock).mockResolvedValue(0);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'nonexistent',
                limit: 10,
                offset: 0,
            });

            expect(result.users).toHaveLength(0);
            expect(result.totalCount).toBe(0);
            expect(result.hasMore).toBe(false);
        });
    });

    describe('getUserByUsername', () => {
        it('should return user with follow counts when authenticated', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2);

            (prisma.follow.count as jest.Mock)
                .mockResolvedValueOnce(150)
                .mockResolvedValueOnce(45);

            (prisma.follow.findUnique as jest.Mock).mockResolvedValue({ id: 'follow-1' });

            const result = await userQueries.getUserByUsername(null as any, {
                username: 'alireza',
            }, mockContext);

            expect(prisma.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: 'cm123',
                        followingId: 'cm456',
                    },
                },
            });

            expect(result).toEqual({
                id: mockUser2.id,
                email: mockUser2.email,
                username: mockUser2.username,
                fullName: mockUser2.fullName,
                bio: mockUser2.bio,
                avatar: mockUser2.avatar,
                createdAt: mockUser2.createdAt.toISOString(),
                updatedAt: mockUser2.updatedAt.toISOString(),
                followersCount: 150,
                followingCount: 45,
                isFollowing: true,
            });
        });

        it('should return user with default follow values when not authenticated', async () => {
            mockContext.user = null;

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2);

            (prisma.follow.count as jest.Mock)
                .mockResolvedValueOnce(10)
                .mockResolvedValueOnce(20);

            (prisma.follow.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await userQueries.getUserByUsername(null as any, {
                username: 'alireza',
            }, mockContext);

            expect(prisma.follow.findUnique).not.toHaveBeenCalled();
            expect(result.followersCount).toBe(10);
            expect(result.followingCount).toBe(20);
            expect(result.isFollowing).toBe(false);
        });

        it('should throw error when user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                userQueries.getUserByUsername(null as any, { username: 'notfound' }, mockContext)
            ).rejects.toThrow('کاربر یافت نشد.');
        });
    });

    // ==========================================================
    //  ✅ تست‌های جدید: getFollowers
    // ==========================================================
    describe('getFollowers', () => {
        it('should return followers list with isFollowing status when authenticated', async () => {
            const mockFollowRecords = [
                { followerId: mockUser2.id, follower: mockUser2 },
                { followerId: mockUser3.id, follower: mockUser3 },
            ];

            (prisma.follow.findMany as jest.Mock)
                .mockResolvedValueOnce(mockFollowRecords) // لیست فالوورها
                .mockResolvedValueOnce([{ followingId: mockUser2.id }]); // فالوهای کاربر فعلی

            (prisma.follow.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.getFollowers(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(prisma.follow.findMany).toHaveBeenNthCalledWith(1, {
                where: { followingId: 'target-user' },
                include: { follower: true },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });

            expect(result.users).toHaveLength(2);
            expect(result.users[0].isFollowing).toBe(true);  // mockUser2 در لیست فالو شده
            expect(result.users[1].isFollowing).toBe(false); // mockUser3 نیست
            expect(result.totalCount).toBe(2);
            expect(result.hasMore).toBe(false);
        });

        it('should apply searchTerm filter on follower username/fullName', async () => {
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce([]);
            (prisma.follow.count as jest.Mock).mockResolvedValue(0);

            await userQueries.getFollowers(null as any, {
                userId: 'target-user',
                searchTerm: 'ali',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(prisma.follow.findMany).toHaveBeenCalledWith({
                where: {
                    followingId: 'target-user',
                    follower: {
                        OR: [
                            { username: { contains: 'ali', mode: 'insensitive' } },
                            { fullName: { contains: 'ali', mode: 'insensitive' } },
                        ],
                    },
                },
                include: { follower: true },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should not query current user follows when not authenticated', async () => {
            mockContext.user = null;

            const mockFollowRecords = [{ followerId: mockUser2.id, follower: mockUser2 }];
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce(mockFollowRecords);
            (prisma.follow.count as jest.Mock).mockResolvedValue(1);

            const result = await userQueries.getFollowers(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            // فقط یک بار findMany صدا زده می‌شود (برای لیست فالوورها) نه برای چک کردن فالوهای کاربر فعلی
            expect(prisma.follow.findMany).toHaveBeenCalledTimes(1);
            expect(result.users[0].isFollowing).toBe(false);
        });

        it('should return hasMore true when more results exist beyond offset+limit', async () => {
            const mockFollowRecords = [{ followerId: mockUser2.id, follower: mockUser2 }];
            (prisma.follow.findMany as jest.Mock)
                .mockResolvedValueOnce(mockFollowRecords) // صدای اول: لیست فالوورها
                .mockResolvedValueOnce([]);               // صدای دوم: چک isFollowing کاربر فعلی
            (prisma.follow.count as jest.Mock).mockResolvedValue(5);

            const result = await userQueries.getFollowers(null as any, {
                userId: 'target-user',
                limit: 1,
                offset: 0,
            }, mockContext);

            expect(result.hasMore).toBe(true);
        });

        it('should skip the isFollowing lookup query when followers list is empty', async () => {
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce([]); // لیست فالوورها خالی
            (prisma.follow.count as jest.Mock).mockResolvedValue(0);

            await userQueries.getFollowers(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            // چون followers خالیه، نباید کوئری دوم (چک isFollowing) اجرا بشه
            expect(prisma.follow.findMany).toHaveBeenCalledTimes(1);
        });
    });

    // ==========================================================
    //  ✅ تست‌های جدید: getFollowing
    // ==========================================================
    describe('getFollowing', () => {
        it('should return following list with isFollowing status when authenticated', async () => {
            const mockFollowRecords = [
                { followingId: mockUser2.id, following: mockUser2 },
                { followingId: mockUser3.id, following: mockUser3 },
            ];

            (prisma.follow.findMany as jest.Mock)
                .mockResolvedValueOnce(mockFollowRecords)
                .mockResolvedValueOnce([{ followingId: mockUser3.id }]);

            (prisma.follow.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.getFollowing(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(prisma.follow.findMany).toHaveBeenNthCalledWith(1, {
                where: { followerId: 'target-user' },
                include: { following: true },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });

            expect(result.users).toHaveLength(2);
            expect(result.users[0].isFollowing).toBe(false); // mockUser2
            expect(result.users[1].isFollowing).toBe(true);  // mockUser3
            expect(result.totalCount).toBe(2);
        });

        it('should apply searchTerm filter on following username/fullName', async () => {
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce([]);
            (prisma.follow.count as jest.Mock).mockResolvedValue(0);

            await userQueries.getFollowing(null as any, {
                userId: 'target-user',
                searchTerm: 'sara',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(prisma.follow.findMany).toHaveBeenCalledWith({
                where: {
                    followerId: 'target-user',
                    following: {
                        OR: [
                            { username: { contains: 'sara', mode: 'insensitive' } },
                            { fullName: { contains: 'sara', mode: 'insensitive' } },
                        ],
                    },
                },
                include: { following: true },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should not query current user follows when not authenticated', async () => {
            mockContext.user = null;

            const mockFollowRecords = [{ followingId: mockUser2.id, following: mockUser2 }];
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce(mockFollowRecords);
            (prisma.follow.count as jest.Mock).mockResolvedValue(1);

            const result = await userQueries.getFollowing(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(prisma.follow.findMany).toHaveBeenCalledTimes(1);
            expect(result.users[0].isFollowing).toBe(false);
        });

        it('should return empty list when user follows no one', async () => {
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce([]);
            (prisma.follow.count as jest.Mock).mockResolvedValue(0);

            const result = await userQueries.getFollowing(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(result.users).toHaveLength(0);
            expect(result.hasMore).toBe(false);
        });

        it('should skip the isFollowing lookup query when followers list is empty', async () => {
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce([]); // لیست فالوورها خالی
            (prisma.follow.count as jest.Mock).mockResolvedValue(0);

            await userQueries.getFollowing(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            // چون following خالیه، نباید کوئری دوم (چک isFollowing) اجرا بشه
            expect(prisma.follow.findMany).toHaveBeenCalledTimes(1);
        });
    });
});