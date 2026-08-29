jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),    // ✅ اضافه شد
            count: jest.fn(),       // ✅ اضافه شد
        },
    },
}));

import prisma from '../../../lib/prisma';
import { userQueries } from '../user/user.queries';

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
    //  ✅ تست‌های جدید: searchUsers
    // ==========================================================
    describe('searchUsers', () => {
        const mockUsers = [mockUser2, mockUser3];

        it('should search users by username (case-insensitive)', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
            (prisma.user.count as jest.Mock).mockResolvedValue(2);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'ali',
                limit: 10,
                offset: 0,
            });

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { username: { contains: 'ali', mode: 'insensitive' } },
                        { fullName: { contains: 'ali', mode: 'insensitive' } },
                    ],
                },
                take: 10,
                skip: 0,
                select: {
                    id: true,
                    username: true,
                    fullName: true,
                    email: true,
                    bio: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { username: 'asc' },
            });
            expect(prisma.user.count).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { username: { contains: 'ali', mode: 'insensitive' } },
                        { fullName: { contains: 'ali', mode: 'insensitive' } },
                    ],
                },
            });

            expect(result.users).toHaveLength(2);
            expect(result.totalCount).toBe(2);
            expect(result.hasMore).toBe(false);
        });

        it('should search users by fullName (case-insensitive)', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser2]);
            (prisma.user.count as jest.Mock).mockResolvedValue(1);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'علی',
                limit: 10,
                offset: 0,
            });

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { username: { contains: 'علی', mode: 'insensitive' } },
                        { fullName: { contains: 'علی', mode: 'insensitive' } },
                    ],
                },
                take: 10,
                skip: 0,
                select: expect.any(Object),
                orderBy: { username: 'asc' },
            });

            expect(result.users).toHaveLength(1);
            expect(result.totalCount).toBe(1);
            expect(result.hasMore).toBe(false);
        });

        it('should return paginated results with hasMore true when more results exist', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser2]);
            (prisma.user.count as jest.Mock).mockResolvedValue(15);

            const result = await userQueries.searchUsers(null as any, {
                searchTerm: 'a',
                limit: 10,
                offset: 0,
            });

            expect(result.users).toHaveLength(1);
            expect(result.totalCount).toBe(15);
            expect(result.hasMore).toBe(true);
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
    //  ✅ تست‌های جدید: getUserByUsername
    // ==========================================================
    describe('getUserByUsername', () => {
        it('should return user when found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser2);

            const result = await userQueries.getUserByUsername(null as any, {
                username: 'alireza',
            });

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'alireza' },
                select: {
                    id: true,
                    username: true,
                    fullName: true,
                    email: true,
                    bio: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,
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
            });
        });

        it('should throw error when user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                userQueries.getUserByUsername(null as any, { username: 'notfound' })
            ).rejects.toThrow('کاربر یافت نشد.');
        });
    });
});
