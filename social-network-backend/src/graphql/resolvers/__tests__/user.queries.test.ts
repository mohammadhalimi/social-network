jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

import prisma from '../../../lib/prisma';
import { userQueries } from '../user.queries';

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
});