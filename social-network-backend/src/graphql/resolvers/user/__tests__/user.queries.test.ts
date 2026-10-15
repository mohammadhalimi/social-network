// src/graphql/resolvers/user/__tests__/user.queries.test.ts

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
            findMany: jest.fn(),
        },
        followRequest: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
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
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const mockUser2 = {
        id: 'cm456',
        email: 'ali@example.com',
        username: 'alireza',
        fullName: 'علی رضایی',
        bio: 'برنامه‌نویس',
        avatar: 'https://cdn.example.com/avatar.jpg',
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    const mockUser3 = {
        id: 'cm789',
        email: 'sara@example.com',
        username: 'saramo',
        fullName: 'سارا محمدی',
        bio: 'طراح گرافیک',
        avatar: null,
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    };

    beforeEach(() => {
        mockContext = {
            req: {},
            res: {},
            user: { userId: 'cm123', email: 'test@example.com' },
        };
        jest.clearAllMocks();
    });

    // ==========================================================
    //  _empty
    // ==========================================================
    describe('_empty', () => {
        it('1. باید رشته خالی برگردونه', () => {
            expect(userQueries._empty()).toBe('');
        });
    });

    // ==========================================================
    //  me
    // ==========================================================
    describe('me', () => {
        it('2. باید کاربر فعلی رو با تمام فیلدها برگردونه', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await userQueries.me(null as any, null as any, mockContext);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'cm123' } });
            expect(result).toEqual(
                expect.objectContaining({
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
                })
            );
        });

        it('3. اگر کاربر لاگین نکرده باشه، باید خطا بده', async () => {
            mockContext.user = null;

            await expect(
                userQueries.me(null as any, null as any, mockContext)
            ).rejects.toThrow('برای دسترسی به این بخش باید وارد شوید.');

            expect(prisma.user.findUnique).not.toHaveBeenCalled();
        });

        it('4. اگر کاربر پیدا نشه، باید خطا بده', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                userQueries.me(null as any, null as any, mockContext)
            ).rejects.toThrow('کاربر یافت نشد.');
        });
    });

    // ==========================================================
    //  searchUsers
    // ==========================================================
    describe('searchUsers', () => {
        const mockSearchUsers = [mockUser2, mockUser3];

        it('5. باید کاربران رو با شرط OR case-insensitive جستجو کنه', async () => {
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

        it('6. باید کاربرانی که username‌شون با searchTerm شروع میشه رو اولویت بده', async () => {
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

        it('7. باید کاربرانی که fullName‌شون با searchTerm شروع میشه رو اولویت بده', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser3, mockUser2]);
            (prisma.user.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'علی',
                limit: 10,
                offset: 0,
            });

            expect(result.users[0].username).toBe('alireza');
        });

        it('8. باید pagination رو دستی با slice اعمال کنه', async () => {
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

        it('9. اگر کاربری پیدا نشه، آرایه خالی برگردونه', async () => {
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

    // ==========================================================
    //  getUserByUsername
    // ==========================================================
    describe('getUserByUsername', () => {
        it('10. باید کاربر رو با follow counts، isPrivate و isFollowRequestPending برگردونه', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser2,
                isPrivate: false,
            });

            (prisma.follow.count as jest.Mock)
                .mockResolvedValueOnce(150)
                .mockResolvedValueOnce(45);

            (prisma.follow.findUnique as jest.Mock).mockResolvedValue({ id: 'follow-1' });
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue(null);

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

            expect(prisma.followRequest.findUnique).toHaveBeenCalledWith({
                where: {
                    requesterId_targetId: {
                        requesterId: 'cm123',
                        targetId: 'cm456',
                    },
                },
            });

            expect(result).toEqual(
                expect.objectContaining({
                    id: mockUser2.id,
                    email: mockUser2.email,
                    username: mockUser2.username,
                    fullName: mockUser2.fullName,
                    isPrivate: false,
                    followersCount: 150,
                    followingCount: 45,
                    isFollowing: true,
                    isFollowRequestPending: false,
                })
            );
        });

        it('11. اگر درخواست فالو PENDING باشه، isFollowRequestPending باید true باشه', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser2,
                isPrivate: true,
            });

            (prisma.follow.count as jest.Mock)
                .mockResolvedValueOnce(10)
                .mockResolvedValueOnce(20);

            (prisma.follow.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.followRequest.findUnique as jest.Mock).mockResolvedValue({
                id: 'req-1',
                status: 'PENDING',
            });

            const result = await userQueries.getUserByUsername(null as any, {
                username: 'alireza',
            }, mockContext);

            expect(result.isPrivate).toBe(true);
            expect(result.isFollowRequestPending).toBe(true);
            expect(result.isFollowing).toBe(false);
        });

        it('12. اگر کاربر لاگین نکرده باشه، باید کاربر رو با مقادیر پیش‌فرض برگردونه', async () => {
            mockContext.user = null;

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser2,
                isPrivate: false,
            });

            (prisma.follow.count as jest.Mock)
                .mockResolvedValueOnce(10)
                .mockResolvedValueOnce(20);

            const result = await userQueries.getUserByUsername(null as any, {
                username: 'alireza',
            }, mockContext);

            expect(prisma.follow.findUnique).not.toHaveBeenCalled();
            expect(prisma.followRequest.findUnique).not.toHaveBeenCalled();
            expect(result.followersCount).toBe(10);
            expect(result.followingCount).toBe(20);
            expect(result.isFollowing).toBe(false);
            expect(result.isFollowRequestPending).toBe(false);
        });

        it('13. اگر کاربر پیدا نشه، باید خطا بده', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                userQueries.getUserByUsername(null as any, { username: 'notfound' }, mockContext)
            ).rejects.toThrow('کاربر یافت نشد.');
        });
    });

    // ==========================================================
    //  getFollowers
    // ==========================================================
    describe('getFollowers', () => {
        it('14. باید لیست فالوورها رو با isFollowing و isFollowRequestPending برگردونه', async () => {
            const mockFollowRecords = [
                { followerId: mockUser2.id, follower: mockUser2 },
                { followerId: mockUser3.id, follower: mockUser3 },
            ];

            (prisma.follow.findMany as jest.Mock)
                .mockResolvedValueOnce(mockFollowRecords)                              // لیست فالوورها
                .mockResolvedValueOnce([{ followingId: mockUser2.id }]);              // فالوهای کاربر فعلی

            (prisma.follow.count as jest.Mock).mockResolvedValue(2);

            // ✅ کاربر فعلی برای mockUser3 درخواست فالو فرستاده
            (prisma.followRequest.findMany as jest.Mock).mockResolvedValue([
                { targetId: mockUser3.id },
            ]);

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
            expect(result.users[0]).toEqual(
                expect.objectContaining({
                    id: mockUser2.id,
                    isFollowing: true,
                    isFollowRequestPending: false,
                })
            );
            expect(result.users[1]).toEqual(
                expect.objectContaining({
                    id: mockUser3.id,
                    isFollowing: false,
                    isFollowRequestPending: true,
                })
            );
            expect(result.totalCount).toBe(2);
            expect(result.hasMore).toBe(false);
        });

        it('15. باید searchTerm رو روی follower اعمال کنه', async () => {
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

        it('16. اگر کاربر لاگین نکرده باشه، فقط یک بار findMany صدا زده میشه', async () => {
            mockContext.user = null;

            const mockFollowRecords = [{ followerId: mockUser2.id, follower: mockUser2 }];
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce(mockFollowRecords);
            (prisma.follow.count as jest.Mock).mockResolvedValue(1);

            const result = await userQueries.getFollowers(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(prisma.follow.findMany).toHaveBeenCalledTimes(1);
            expect(result.users[0].isFollowing).toBe(false);
            expect(result.users[0].isFollowRequestPending).toBe(false);
        });

        it('17. اگر لیست فالوورها خالی باشه، از کوئری دوم صرف‌نظر میکنه', async () => {
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce([]);
            (prisma.follow.count as jest.Mock).mockResolvedValue(0);

            await userQueries.getFollowers(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(prisma.follow.findMany).toHaveBeenCalledTimes(1);
            expect(prisma.followRequest.findMany).not.toHaveBeenCalled();
        });

        it('18. باید hasMore رو درست محاسبه کنه', async () => {
            const mockFollowRecords = [{ followerId: mockUser2.id, follower: mockUser2 }];
            (prisma.follow.findMany as jest.Mock)
                .mockResolvedValueOnce(mockFollowRecords)
                .mockResolvedValueOnce([]);
            (prisma.follow.count as jest.Mock).mockResolvedValue(5);
            (prisma.followRequest.findMany as jest.Mock).mockResolvedValue([]);

            const result = await userQueries.getFollowers(null as any, {
                userId: 'target-user',
                limit: 1,
                offset: 0,
            }, mockContext);

            expect(result.hasMore).toBe(true);
        });
    });

    // ==========================================================
    //  getFollowing
    // ==========================================================
    describe('getFollowing', () => {
        it('19. باید لیست دنبال‌شونده‌ها رو با isFollowing و isFollowRequestPending برگردونه', async () => {
            const mockFollowRecords = [
                { followingId: mockUser2.id, following: mockUser2 },
                { followingId: mockUser3.id, following: mockUser3 },
            ];

            (prisma.follow.findMany as jest.Mock)
                .mockResolvedValueOnce(mockFollowRecords)                              // لیست دنبال‌شونده‌ها
                .mockResolvedValueOnce([{ followingId: mockUser3.id }]);              // فالوهای کاربر فعلی

            (prisma.follow.count as jest.Mock).mockResolvedValue(2);

            // ✅ کاربر فعلی برای mockUser2 درخواست فالو فرستاده
            (prisma.followRequest.findMany as jest.Mock).mockResolvedValue([
                { targetId: mockUser2.id },
            ]);

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
            expect(result.users[0]).toEqual(
                expect.objectContaining({
                    id: mockUser2.id,
                    isFollowing: false,
                    isFollowRequestPending: true,
                })
            );
            expect(result.users[1]).toEqual(
                expect.objectContaining({
                    id: mockUser3.id,
                    isFollowing: true,
                    isFollowRequestPending: false,
                })
            );
            expect(result.totalCount).toBe(2);
        });

        it('20. باید searchTerm رو روی following اعمال کنه', async () => {
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

        it('21. اگر کاربر لاگین نکرده باشه، فقط یک بار findMany صدا زده میشه', async () => {
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
            expect(result.users[0].isFollowRequestPending).toBe(false);
        });

        it('22. اگر لیست دنبال‌شونده‌ها خالی باشه، آرایه خالی برگردونه', async () => {
            (prisma.follow.findMany as jest.Mock).mockResolvedValueOnce([]);
            (prisma.follow.count as jest.Mock).mockResolvedValue(0);

            const result = await userQueries.getFollowing(null as any, {
                userId: 'target-user',
                limit: 10,
                offset: 0,
            }, mockContext);

            expect(result.users).toHaveLength(0);
            expect(result.hasMore).toBe(false);
            expect(prisma.followRequest.findMany).not.toHaveBeenCalled();
        });

        it('23. باید hasMore رو درست محاسبه کنه', async () => {
            const mockFollowRecords = [{ followingId: mockUser2.id, following: mockUser2 }];
            (prisma.follow.findMany as jest.Mock)
                .mockResolvedValueOnce(mockFollowRecords)
                .mockResolvedValueOnce([]);
            (prisma.follow.count as jest.Mock).mockResolvedValue(10);
            (prisma.followRequest.findMany as jest.Mock).mockResolvedValue([]);

            const result = await userQueries.getFollowing(null as any, {
                userId: 'target-user',
                limit: 5,
                offset: 0,
            }, mockContext);

            expect(result.hasMore).toBe(true);
        });
    });
});