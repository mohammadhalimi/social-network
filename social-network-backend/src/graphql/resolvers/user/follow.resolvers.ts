// resolvers/user/follow.resolvers.ts
import prisma from '../../../lib/prisma';
import { createNotification } from '../helpers/notify';
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


    // ✅ جدید: لغو درخواست فالوی در حال انتظار
    cancelFollowRequest: async (_: any, { targetUserId }: { targetUserId: string }, context: any) => {
        const currentUserId = requireAuth(context, 'برای لغو درخواست باید وارد شوید.');

        await prisma.followRequest.deleteMany({
            where: { requesterId: currentUserId, targetId: targetUserId, status: 'PENDING' },
        });

        return { success: true, message: 'درخواست دنبال کردن لغو شد.' };
    },

    // ✅ جدید: تأیید درخواست
    acceptFollowRequest: async (_: any, { requestId }: { requestId: string }, context: any) => {
        const currentUserId = requireAuth(context, 'برای این کار باید وارد شوید.');

        const request = await prisma.followRequest.findUnique({ where: { id: requestId } });
        if (!request) throw new Error('درخواست یافت نشد.');
        if (request.targetId !== currentUserId) throw new Error('شما اجازه‌ی این کار را ندارید.');
        if (request.status !== 'PENDING') throw new Error('این درخواست قبلاً پردازش شده است.');

        await prisma.$transaction([
            prisma.followRequest.update({
                where: { id: requestId },
                data: { status: 'ACCEPTED' },
            }),
            prisma.follow.upsert({
                where: {
                    followerId_followingId: {
                        followerId: request.requesterId,
                        followingId: request.targetId,
                    },
                },
                create: { followerId: request.requesterId, followingId: request.targetId },
                update: {},
            }),
        ]);

        await createNotification({
            recipientId: request.requesterId,
            actorId: currentUserId,
            type: 'FOLLOW_REQUEST_ACCEPTED',
        });

        return { success: true, message: 'درخواست تأیید شد.' };
    },

    // ✅ جدید: رد درخواست
    rejectFollowRequest: async (_: any, { requestId }: { requestId: string }, context: any) => {
        const currentUserId = requireAuth(context, 'برای این کار باید وارد شوید.');

        const request = await prisma.followRequest.findUnique({ where: { id: requestId } });
        if (!request) throw new Error('درخواست یافت نشد.');
        if (request.targetId !== currentUserId) throw new Error('شما اجازه‌ی این کار را ندارید.');
        if (request.status !== 'PENDING') throw new Error('این درخواست قبلاً پردازش شده است.');

        await prisma.followRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });

        return { success: true, message: 'درخواست رد شد.' };
    },
};