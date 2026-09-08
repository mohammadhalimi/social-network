jest.mock('../../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),    // ✅ اضافه شد
            count: jest.fn(),       // ✅ اضافه شد
        },
        follow: {
            count: jest.fn(),
            findUnique: jest.fn(),
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

    // ==========================================================
    //  ✅ تست‌های بازنویسی شده: searchUsers (هماهنگ با منطق جدید)
    // ==========================================================
    describe('searchUsers', () => {
        const mockSearchUsers = [mockUser2, mockUser3]; // علی، سارا

        it('should search users with case-insensitive OR condition', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue(mockSearchUsers);
            (prisma.user.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'al',
                limit: 10,
                offset: 0,
            });

            // تست شرط where (بدون take/skip/orderBy)
            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { username: { contains: 'al', mode: 'insensitive' } },
                        { fullName: { contains: 'al', mode: 'insensitive' } },
                    ],
                },
                select: expect.any(Object),
            });
            
            // تست خروجی
            expect(result.users).toHaveLength(2);
            expect(result.totalCount).toBe(2);
            expect(result.hasMore).toBe(false);
        });

        it('should prioritize users whose username starts with searchTerm', async () => {
            // mockUser2.username = 'alireza' (شروع با al)
            // mockUser3.username = 'saramo' (شروع نمی‌شود)
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser3, mockUser2]); // ترتیب برعکس
            (prisma.user.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'al',
                limit: 10,
                offset: 0,
            });

            // انتظار داریم alireza اول بیاید
            expect(result.users[0].username).toBe('alireza');
            expect(result.users[1].username).toBe('saramo');
        });

        it('should prioritize users whose fullName starts with searchTerm', async () => {
            // mockUser2.fullName = 'علی رضایی' (شروع با علی)
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
            // 3 کاربر داریم، limit=2، offset=0
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser, mockUser2, mockUser3]);
            (prisma.user.count as jest.Mock).mockResolvedValue(3);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'a',
                limit: 2,
                offset: 0,
            });

            expect(result.users).toHaveLength(2);
            expect(result.hasMore).toBe(true);
            
            // تست offset جدید
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

    // ==========================================================
    //  ✅ تست‌های بازنویسی شده: getUserByUsername (با Follow)
    // ==========================================================
    describe('getUserByUsername', () => {
        it('should return user with follow counts when authenticated', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2);
            
            // فالوورها و فالووینگ‌ها
            (prisma.follow.count as jest.Mock)
                .mockResolvedValueOnce(150)  // followersCount
                .mockResolvedValueOnce(45);  // followingCount

            // رکورد فالو (این کاربر قبلا ما را فالو کرده است)
            (prisma.follow.findUnique as jest.Mock).mockResolvedValue({ id: 'follow-1' });

            const result = await userQueries.getUserByUsername(null as any, {
                username: 'alireza',
            }, mockContext);

            expect(prisma.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: 'cm123', // از context.user
                        followingId: 'cm456', // از mockUser2.id
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
                isFollowing: true, // چون followRecord وجود دارد
            });
        });

        it('should return user with default follow values when not authenticated', async () => {
            mockContext.user = null;

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2);
            
            // فقط شمارش فالوور و فالووینگ (رکورد فالو نباید صدا زده شود)
            (prisma.follow.count as jest.Mock)
                .mockResolvedValueOnce(10)
                .mockResolvedValueOnce(20);

            (prisma.follow.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await userQueries.getUserByUsername(null as any, {
                username: 'alireza',
            }, mockContext);

            expect(prisma.follow.findUnique).not.toHaveBeenCalled(); // چون context.user null است
            expect(result.followersCount).toBe(10);
            expect(result.followingCount).toBe(20);
            expect(result.isFollowing).toBe(false); // چون followRecord ندارد
        });

        it('should throw error when user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                userQueries.getUserByUsername(null as any, { username: 'notfound' }, null as any)
            ).rejects.toThrow('کاربر یافت نشد.');
        });
    });
});
