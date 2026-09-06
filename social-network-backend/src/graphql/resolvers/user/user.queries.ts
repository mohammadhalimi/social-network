// resolvers/user.queries.ts
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

        // ✅ همه‌ی نتایج مچ‌شده رو می‌گیریم (بدون skip/take) تا اول اولویت‌بندی کنیم
        const [allMatches, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
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
            }),
            prisma.user.count({ where }),
        ]);

        // ✅ اولویت‌بندی: شروع با username > شروع با fullName > شامل شدن در بقیه‌جاها
        const term = searchTerm.toLowerCase();

        const getPriority = (user: typeof allMatches[number]) => {
            const username = user.username.toLowerCase();
            const fullName = user.fullName.toLowerCase();

            if (username.startsWith(term)) return 0;
            if (fullName.startsWith(term)) return 1;
            return 2;
        };

        const sortedMatches = allMatches.sort((a, b) => {
            const priorityDiff = getPriority(a) - getPriority(b);
            if (priorityDiff !== 0) return priorityDiff;
            // در صورت اولویت یکسان، الفبایی بر اساس username مرتب کن
            return a.username.localeCompare(b.username);
        });

        // ✅ صفحه‌بندی رو دستی روی نتایج مرتب‌شده اعمال می‌کنیم
        const paginatedUsers = sortedMatches.slice(offset, offset + limit);
        const hasMore = offset + paginatedUsers.length < totalCount;

        return {
            users: paginatedUsers.map(user => mapUser(user)),
            totalCount,
            hasMore,
        };
    },

    getUserByUsername: async (_: any, { username }: { username: string }, context: any) => {
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

        const currentUserId = context.user?.userId || null;

        const [followersCount, followingCount, followRecord] = await Promise.all([
            prisma.follow.count({ where: { followingId: user.id } }),
            prisma.follow.count({ where: { followerId: user.id } }),
            currentUserId
                ? prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: currentUserId,
                            followingId: user.id,
                        },
                    },
                })
                : null,
        ]);

        return mapUser(user, {
            followersCount,
            followingCount,
            isFollowing: !!followRecord,
        });
    },
};