import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ایجاد adapter
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

// ایجاد PrismaClient با adapter
const prisma = new PrismaClient({ adapter });

export class UserService {
    async register(email: string, username: string, password: string, fullName: string) {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existingUser) {
            throw new Error('ایمیل یا نام کاربری قبلاً ثبت شده است.');
        }

        // ۲. هش کردن رمز عبور
        const hashedPassword = await bcrypt.hash(password, 10);

        // ۳. ذخیره کاربر در دیتابیس
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                fullName,
            },
        });

        // ۴. تولید توکن JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        return { user, token };
    }
}