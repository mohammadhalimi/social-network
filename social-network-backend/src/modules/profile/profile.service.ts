import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export class ProfileService {
  async updateProfile(
    userId: string,
    data: {
      username?: string;
      fullName?: string;
      email?: string;
      bio?: string;
      avatar?: string;
    }
  ) {
    // ۱. پیدا کردن کاربر
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('کاربر یافت نشد.');
    }

    // ۲. بررسی تکراری نبودن email و username (اگر تغییر کرده باشند)
    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new Error('این ایمیل قبلاً ثبت شده است.');
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUsername) {
        throw new Error('این نام کاربری قبلاً ثبت شده است.');
      }
    }

    // ۳. به‌روزرسانی کاربر
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username ?? user.username,
        fullName: data.fullName ?? user.fullName,
        email: data.email ?? user.email,
        bio: data.bio ?? user.bio,
        avatar: data.avatar ?? user.avatar,
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // ۱. پیدا کردن کاربر
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('کاربر یافت نشد.');
    }

    // ۲. بررسی رمز عبور فعلی
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('رمز عبور فعلی اشتباه است.');
    }

    // ۳. هش کردن رمز عبور جدید
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ۴. به‌روزرسانی رمز عبور
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return updatedUser;
  }
}