import prisma from '../../lib/prisma'; // مسیر رو با ساختار پروژه‌ت تنظیم کن
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserService {
  async register(email: string, username: string, password: string, fullName: string) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      throw new Error('ایمیل یا نام کاربری قبلاً ثبت شده است.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword, fullName },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('کاربری با این ایمیل یافت نشد.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('رمز عبور اشتباه است.');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return { user, token };
  }
}