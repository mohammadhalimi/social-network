import { UserService } from '../user.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import prisma from '../../../lib/prisma';
// ✅ ۱. Mock کردن bcrypt و jwt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// ✅ ۲. Mock کردن پرزیما — مسیر باید دقیقاً با import زیر یکی باشه
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

// ✅ ۳. import کردن prisma بعد از mock — مسیر با بالا یکی شد

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

// ✅ ۴. یک mock ساده برای Response اکسپرس
const createMockRes = () => {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;
};

describe('UserService', () => {
  let userService: UserService;
  let mockRes: Response;

  beforeEach(() => {
    userService = new UserService();
    mockRes = createMockRes(); // 👈 هر تست یک res تازه می‌گیره
    jest.clearAllMocks();
  });

  // =============================================
  //  تست‌های register
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

      const result = await userService.register(
        mockUserData.email,
        mockUserData.username,
        mockUserData.password,
        mockUserData.fullName,
        mockRes // 👈 اضافه شد
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

      // ✅ تست جدید: چک کردن که کوکی درست ست شده
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'fake-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        })
      );
    });

    it('should throw error if user already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'cm123',
        email: mockUserData.email,
      });

      await expect(
        userService.register(
          mockUserData.email,
          mockUserData.username,
          mockUserData.password,
          mockUserData.fullName,
          mockRes // 👈 اضافه شد
        )
      ).rejects.toThrow('ایمیل یا نام کاربری قبلاً ثبت شده است.');

      // ✅ اگه یوزر تکراریه، نباید کوکی ست بشه
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });
  });

  // =============================================
  //  تست‌های login
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

      const result = await userService.login('test@example.com', '123456', mockRes); // 👈 اضافه شد

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.token).toBe('fake-jwt-token');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', mockUser.password);

      // ✅ تست جدید
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'fake-jwt-token',
        expect.objectContaining({ httpOnly: true })
      );
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.login('notfound@example.com', '123456', mockRes) // 👈 اضافه شد
      ).rejects.toThrow('کاربری با این ایمیل یافت نشد.');

      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should throw error if password is incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.login('test@example.com', 'wrongpassword', mockRes) // 👈 اضافه شد
      ).rejects.toThrow('رمز عبور اشتباه است.');

      expect(mockRes.cookie).not.toHaveBeenCalled();
    });
  });

  // =============================================
  //  تست‌های logout (جدید — چون متد جدید اضافه کردید)
  // =============================================
  describe('logout', () => {
    it('should clear the token cookie', async () => {
      const result = await userService.logout(mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
      );
      expect(result).toEqual({ success: true });
    });
  });
});