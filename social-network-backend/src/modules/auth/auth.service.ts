import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../../lib/prisma';

export class AuthService {
  async register(
    email: string,
    username: string,
    password: string,
    fullName: string,
    res: Response
  ) {
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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user, token };
  }

  async login(email: string, password: string, res: Response) {
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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { user, token };
  }

  async logout(res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true };
  }
  // ✅ ۱. درخواست بازیابی رمز عبور
  async requestPasswordReset(email: string) {
    // ۱. پیدا کردن کاربر
    const user = await prisma.user.findUnique({ where: { email } });

    // ⚠️ به دلایل امنیتی، پیام موفقیت یکسان برمی‌گردانیم
    if (!user) {
      return { success: true };
    }

    // ۲. تولید توکن یکبارمصرف (64 کاراکتر هگز)
    const token = crypto.randomBytes(32).toString('hex');

    // ۳. تنظیم زمان انقضا (۱ ساعت)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // ۴. ذخیره توکن در دیتابیس
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiresAt: expiresAt,
      },
    });

    // ۵. ارسال ایمیل به کاربر
    await this.sendResetEmail(user.email, token);

    return { success: true };
  }

  // ✅ ۲. ارسال ایمیل بازیابی
  private async sendResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"شبکه اجتماعی" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'بازیابی رمز عبور',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1DA1F2;">🔐 بازیابی رمز عبور</h2>
          <p>برای تنظیم رمز عبور جدید، روی لینک زیر کلیک کنید. این لینک تا <strong>۱ ساعت</strong> معتبر است.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 16px 0; background: #1DA1F2; color: #fff; text-decoration: none; border-radius: 4px;">
            بازیابی رمز عبور
          </a>
          <p style="color: #666; font-size: 14px;">اگر این درخواست را شما ندادید، این ایمیل را نادیده بگیرید.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0;" />
          <p style="color: #999; font-size: 12px;">این ایمیل به صورت خودکار ارسال شده است، لطفاً به آن پاسخ ندهید.</p>
        </div>
      `,
    });
  }

  // ✅ ۳. بازنشانی رمز عبور با توکن
  async resetPassword(token: string, newPassword: string) {
    // ۱. پیدا کردن کاربر با توکن معتبر و غیرمنقضی
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: {
          gt: new Date(), // تاریخ انقضا بزرگ‌تر از زمان فعلی
        },
      },
    });

    if (!user) {
      throw new Error('لینک بازیابی منقضی یا نامعتبر است.');
    }

    // ۲. هش کردن رمز جدید
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ۳. به‌روزرسانی رمز و پاک کردن توکن
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return { success: true };
  }
}