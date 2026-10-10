// src/graphql/resolvers/post/like.resolvers.ts
import prisma from '../../../lib/prisma';
import { requireAuth } from '../try-catch/requireAuth';
import { createNotification } from '../helpers/notify';

export const likeResolvers = {
    likePost: async (_: any, { postId }: { postId: string }, context: any) => {
        const userId = requireAuth(context);

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true, userId: true },
        });

        if (!post) throw new Error('پست یافت نشد.');

        const existingLike = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existingLike) {
            const likesCount = await prisma.like.count({ where: { postId } });
            return {
                success: false,
                message: 'شما قبلاً این پست را لایک کرده‌اید.',
                isLiked: true,
                likesCount,
            };
        }

        await prisma.like.create({ data: { userId, postId } });

        const likesCount = await prisma.like.count({ where: { postId } });

        // ✅ ارسال نوتیف (بدون شکست لایک در صورت خطا)
        try {
            await createNotification({
                recipientId: post.userId,
                actorId: userId,
                type: 'LIKE',
                postId,
            });
        } catch (err) {
            console.error('❌ خطا در ساخت نوتیف LIKE:', err);
        }

        return {
            success: true,
            message: 'پست با موفقیت لایک شد.',
            isLiked: true,
            likesCount,
        };
    },

    unlikePost: async (_: any, { postId }: { postId: string }, context: any) => {
        const userId = requireAuth(context);

        const like = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (!like) {
            const likesCount = await prisma.like.count({ where: { postId } });
            return {
                success: false,
                message: 'شما این پست را لایک نکرده‌اید.',
                isLiked: false,
                likesCount,
            };
        }

        await prisma.like.delete({ where: { id: like.id } });

        const likesCount = await prisma.like.count({ where: { postId } });

        return {
            success: true,
            message: 'لایک پست برداشته شد.',
            isLiked: false,
            likesCount,
        };
    },

    likeComment: async (_: any, { commentId }: { commentId: string }, context: any) => {
        const userId = requireAuth(context);

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true },
        });

        if (!comment) throw new Error('کامنت یافت نشد.');

        const existingLike = await prisma.commentLike.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (existingLike) {
            return {
                success: false,
                message: 'شما قبلاً این کامنت را لایک کرده‌اید.',
                isLiked: true,
            };
        }

        await prisma.commentLike.create({
            data: { userId, commentId },
        });

        // ✅ ارسال نوتیف (بدون شکست لایک در صورت خطا)
        try {
            await createNotification({
                recipientId: comment.userId,
                actorId: userId,
                type: 'COMMENT_LIKE',
                commentId,
            });
        } catch (err) {
            console.error('❌ خطا در ساخت نوتیف COMMENT_LIKE:', err);
        }

        return {
            success: true,
            message: 'کامنت با موفقیت لایک شد.',
            isLiked: true,
        };
    },

    unlikeComment: async (_: any, { commentId }: { commentId: string }, context: any) => {
        const userId = requireAuth(context);

        const like = await prisma.commentLike.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (!like) {
            return {
                success: false,
                message: 'شما این کامنت را لایک نکرده‌اید.',
                isLiked: false,
            };
        }

        await prisma.commentLike.delete({ where: { id: like.id } });

        return {
            success: true,
            message: 'لایک کامنت برداشته شد.',
            isLiked: false,
        };
    },
};