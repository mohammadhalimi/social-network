import { UserService } from './user.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ✅ ۱. Mock کردن bcrypt و jwt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// ✅ ۲. Mock کردن پرزیما — mock object باید مستقیماً داخل factory ساخته بشه
//    تا مشکل hoisting (TDZ) پیش نیاد
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// ✅ ۳. import کردن prisma بعد از mock، و گرفتن یک reference تایپ‌دار برایش
import prisma from '../../lib/prisma';
const mockPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
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
        mockUserData.fullName
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
          mockUserData.fullName
        )
      ).rejects.toThrow('ایمیل یا نام کاربری قبلاً ثبت شده است.');
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

      const result = await userService.login('test@example.com', '123456');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.token).toBe('fake-jwt-token');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', mockUser.password);
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.login('notfound@example.com', '123456')
      ).rejects.toThrow('کاربری با این ایمیل یافت نشد.');
    });

    it('should throw error if password is incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('رمز عبور اشتباه است.');
    });
  });
});