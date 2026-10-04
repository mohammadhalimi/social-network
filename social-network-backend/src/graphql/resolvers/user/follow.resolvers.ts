// src/graphql/resolvers/user/follow.resolvers.ts
import prisma from '../../../lib/prisma';
import { requireAuth } from '../try-catch/requireAuth';
import { createNotification } from '../helpers/notify';

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

        // ✅ اگر حساب خصوصی است، درخواست فالو بساز
        if (targetUser.isPrivate) {
            const existingRequest = await prisma.followRequest.findUnique({
                where: { requesterId_targetId: { requesterId: currentUserId, targetId: userId } },
            });

            // ✅ اگر قبلاً پذیرفته شده، یعنی فالو هست
            if (existingRequest?.status === 'ACCEPTED') {
                return {
                    success: true,
                    message: 'شما این کاربر را دنبال می‌کنید.',
                    isFollowing: true,
                    isPending: false,
                    followersCount: await prisma.follow.count({ where: { followingId: userId } }),
                };
            }

            // ✅ اگر PENDING است، دوباره نساز
            if (existingRequest?.status === 'PENDING') {
                throw new Error('درخواست شما قبلاً ارسال شده و در انتظار تأیید است.');
            }

            // ✅ ایجاد درخواست جدید (یا تبدیل REJECTED به PENDING)
            const followRequest = await prisma.followRequest.upsert({
                where: { requesterId_targetId: { requesterId: currentUserId, targetId: userId } },
                create: { requesterId: currentUserId, targetId: userId, status: 'PENDING' },
                update: { status: 'PENDING' },
            });

            await createNotification({
                recipientId: userId,
                actorId: currentUserId,
                type: 'FOLLOW_REQUEST',
                followRequestId: followRequest.id,
            });

            return {
                success: true,
                message: 'درخواست دنبال کردن ارسال شد.',
                isFollowing: false,
                isPending: true,
                followersCount: await prisma.follow.count({ where: { followingId: userId } }),
            };
        }

        // ✅ حساب عمومی: فالوی مستقیم
        await prisma.follow.upsert({
            where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
            create: { followerId: currentUserId, followingId: userId },
            update: {},
        });

        await createNotification({
            recipientId: userId,
            actorId: currentUserId,
            type: 'FOLLOW',
        });

        return {
            success: true,
            message: 'با موفقیت دنبال شد.',
            isFollowing: true,
            isPending: false,
            followersCount: await prisma.follow.count({ where: { followingId: userId } }),
        };
    },

    unfollowUser: async (_: any, { userId }: { userId: string }, context: any) => {
        const currentUserId = requireAuth(context, 'برای لغو دنبال کردن باید وارد شوید.');

        await prisma.follow.deleteMany({
            where: { followerId: currentUserId, followingId: userId },
        });

        const followersCount = await prisma.follow.count({ where: { followingId: userId } });

        return {
            success: true,
            message: 'دنبال کردن لغو شد.',
            isFollowing: false,
            isPending: false,
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