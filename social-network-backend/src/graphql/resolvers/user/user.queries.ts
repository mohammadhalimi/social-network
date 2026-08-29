// resolvers/user.queries.ts
// Queryهای مربوط به کاربر

import prisma from '../../../lib/prisma';
import { mapUser } from '../helpers/mapUser';
import { requireAuth } from '../try-catch/requireAuth';

export const userQueries = {
    _empty: () => '',

    me: async (_: any, __: any, context: any) => {
        const userId = requireAuth(context, 'برای دسترسی به این بخش باید وارد شوید.');

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new Error('کاربر یافت نشد.');
        }

        return mapUser(user);
    },
    searchUsers: async (_: any, { searchTerm, limit, offset }: { searchTerm: string; limit: number; offset: number }) => {
        const where = {
            OR: [
                { username: { contains: searchTerm, mode: 'insensitive' as const } },
                { fullName: { contains: searchTerm, mode: 'insensitive' as const } },
            ],
        };

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                take: limit,
                skip: offset,
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
                orderBy: {
                    username: 'asc',
                },
            }),
            prisma.user.count({ where }),
        ]);

        const hasMore = offset + users.length < totalCount;

        return {
            users: users.map(mapUser),
            totalCount,
            hasMore,
        };
    },

    // ✅ کوئری جدید برای دریافت کاربر با username
    getUserByUsername: async (_: any, { username }: { username: string }) => {
        const user = await prisma.user.findUnique({
            where: { username },
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

        if (!user) {
            throw new Error('کاربر یافت نشد.');
        }

        return mapUser(user);
    },
};