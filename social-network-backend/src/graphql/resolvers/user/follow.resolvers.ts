// resolvers/user/follow.resolvers.ts
import prisma from '../../../lib/prisma';
import { requireAuth } from '../try-catch/requireAuth';

export const followResolvers = {
    followUser: async (_: any, { userId }: { userId: string }, context: any) => {
        const currentUserId = requireAuth(context, 'برای دنبال کردن کاربر باید وارد شوید.');

        if (currentUserId === userId) {
            throw new Error('نمی‌توانید خودتان را دنبال کنید.');
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            throw new Error('کاربر یافت نشد.');
        }

        // ✅ جلوگیری از خطای duplicate اگه قبلاً فالو کرده
        await prisma.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userId,
                },
            },
            create: {
                followerId: currentUserId,
                followingId: userId,
            },
            update: {},
        });

        const followersCount = await prisma.follow.count({
            where: { followingId: userId },
        });

        return {
            success: true,
            message: 'با موفقیت دنبال شد.',
            isFollowing: true,
            followersCount,
        };
    },

    unfollowUser: async (_: any, { userId }: { userId: string }, context: any) => {
        const currentUserId = requireAuth(context, 'برای لغو دنبال کردن باید وارد شوید.');

        await prisma.follow.deleteMany({
            where: {
                followerId: currentUserId,
                followingId: userId,
            },
        });

        const followersCount = await prisma.follow.count({
            where: { followingId: userId },
        });

        return {
            success: true,
            message: 'دنبال کردن لغو شد.',
            isFollowing: false,
            followersCount,
        };
    },
};