import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import prisma from '../../../lib/prisma';
import { AuthService } from '../auth.service';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// مسیر باید دقیقاً با import بالا یکی باشه
jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    },
}));

const mockPrisma = prisma as unknown as {
    user: {
        findUnique: jest.Mock;
        findFirst: jest.Mock;
        create: jest.Mock;
    };
};

const createMockRes = () =>
    ({
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    } as unknown as Response);

describe('AuthService', () => {
    let authService: AuthService;
    let mockRes: Response;

    beforeEach(() => {
        authService = new AuthService();
        mockRes = createMockRes();
        jest.clearAllMocks();
    });

    // =============================================
    //  register
    // =============================================
    describe('register', () => {
        const mockUserData = {
            email: 'test@example.com',
            username: 'testuser',
            password: '123456',
            fullName: 'کاربر تست',
        };

        it('should register a new user successfully', async () => {
            mockPrisma.user.findFirst.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            mockPrisma.user.create.mockResolvedValue({
                id: 'cm123',
                ...mockUserData,
                password: 'hashed_password',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

            const result = await authService.register(
                mockUserData.email,
                mockUserData.username,
                mockUserData.password,
                mockUserData.fullName,
                mockRes
            );

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe(mockUserData.email);
            expect(result.user.username).toBe(mockUserData.username);
            expect(result.token).toBe('fake-jwt-token');

            expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
                where: { OR: [{ email: mockUserData.email }, { username: mockUserData.username }] },
            });
            expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
            expect(jwt.sign).toHaveBeenCalledTimes(1);

            expect(mockRes.cookie).toHaveBeenCalledWith(
                'token',
                'fake-jwt-token',
                expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
            );
        });

        it('should throw error if user already exists', async () => {
            mockPrisma.user.findFirst.mockResolvedValue({
                id: 'cm123',
                email: mockUserData.email,
            });

            await expect(
                authService.register(
                    mockUserData.email,
                    mockUserData.username,
                    mockUserData.password,
                    mockUserData.fullName,
                    mockRes
                )
            ).rejects.toThrow('ایمیل یا نام کاربری قبلاً ثبت شده است.');

            expect(mockRes.cookie).not.toHaveBeenCalled();
        });
    });

    // =============================================
    //  login
    // =============================================
    describe('login', () => {
        const mockUser = {
            id: 'cm123',
            email: 'test@example.com',
            username: 'testuser',
            password: 'hashed_password',
            fullName: 'کاربر تست',
            bio: null,
            avatar: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should login successfully with correct credentials', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

            const result = await authService.login('test@example.com', '123456', mockRes);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe(mockUser.email);
            expect(result.token).toBe('fake-jwt-token');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('123456', mockUser.password);

            expect(mockRes.cookie).toHaveBeenCalledWith(
                'token',
                'fake-jwt-token',
                expect.objectContaining({ httpOnly: true })
            );
        });

        it('should throw error if user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.login('notfound@example.com', '123456', mockRes)
            ).rejects.toThrow('کاربری با این ایمیل یافت نشد.');

            expect(mockRes.cookie).not.toHaveBeenCalled();
        });

        it('should throw error if password is incorrect', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.login('test@example.com', 'wrongpassword', mockRes)
            ).rejects.toThrow('رمز عبور اشتباه است.');

            expect(mockRes.cookie).not.toHaveBeenCalled();
        });
    });

    // =============================================
    //  logout
    // =============================================
    describe('logout', () => {
        it('should clear the token cookie', async () => {
            const result = await authService.logout(mockRes);

            expect(mockRes.clearCookie).toHaveBeenCalledWith(
                'token',
                expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
            );
            expect(result).toEqual({ success: true });
        });
    });
});