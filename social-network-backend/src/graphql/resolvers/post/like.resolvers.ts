// resolvers/post/like.resolvers.ts
// لایک/آنلایک روی پست و کامنت

import prisma from '../../../lib/prisma';
import { requireAuth } from '../try-catch/requireAuth';

export const likeResolvers = {
    likePost: async (_: any, { postId }: { postId: string }, context: any) => {
        const userId = requireAuth(context);

        const existingLike = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existingLike) {
            const likesCount = await prisma.like.count({ where: { postId } });
            return {
                success: false,
                message: 'شما قبلاً این پست را لایک کرده‌اید.',
                isLiked: true,
                likesCount,  // ✅ اضافه شد
            };
        }

        await prisma.like.create({ data: { userId, postId } });

        const likesCount = await prisma.like.count({ where: { postId } });  // ✅ محاسبه

        return {
            success: true,
            message: 'پست با موفقیت لایک شد.',
            isLiked: true,
            likesCount,  // ✅ اضافه شد
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
                likesCount,  // ✅ اضافه شد
            };
        }

        await prisma.like.delete({ where: { id: like.id } });

        const likesCount = await prisma.like.count({ where: { postId } });  // ✅ محاسبه

        return {
            success: true,
            message: 'لایک پست برداشته شد.',
            isLiked: false,
            likesCount,  // ✅ اضافه شد
        };
    },

    likeComment: async (_: any, { commentId }: { commentId: string }, context: any) => {
        const userId = requireAuth(context);

        const existingLike = await prisma.commentLike.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (existingLike) {
            return { success: false, message: 'شما قبلاً این کامنت را لایک کرده‌اید.', isLiked: true };
        }

        await prisma.commentLike.create({
            data: { userId, commentId },
        });

        return { success: true, message: 'کامنت با موفقیت لایک شد.', isLiked: true };
    },

    unlikeComment: async (_: any, { commentId }: { commentId: string }, context: any) => {
        const userId = requireAuth(context);

        const like = await prisma.commentLike.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (!like) {
            return { success: false, message: 'شما این کامنت را لایک نکرده‌اید.', isLiked: false };
        }

        await prisma.commentLike.delete({ where: { id: like.id } });

        return { success: true, message: 'لایک کامنت برداشته شد.', isLiked: false };
    },
};