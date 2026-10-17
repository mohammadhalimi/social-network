// src/graphql/resolvers/post/comment.resolvers.ts
// کامنت و ریپلای روی پست

import prisma from '../../../lib/prisma';
import { formatComment } from '../helpers/formatPost';
import { requireAuth } from '../try-catch/requireAuth';
import { createNotification } from '../helpers/notify';

export const commentResolvers = {
    commentOnPost: async (
        _: any,
        { postId, content }: { postId: string; content: string },
        context: any
    ) => {
        const userId = requireAuth(context);

        // ✅ چک کن که پست وجود داره (و صاحبش رو بگیر)
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true, userId: true },
        });

        if (!post) {
            throw new Error('پست یافت نشد.');
        }

        const comment = await prisma.comment.create({
            data: { content, userId, postId },
            include: {
                user: true,
                likes: true,
            },
        });

        // ✅ ارسال نوتیف به صاحب پست
        try {
            await createNotification({
                recipientId: post.userId,
                actorId: userId,
                type: 'COMMENT',
                postId,
                commentId: comment.id,
            });
        } catch (err) {
            console.error('❌ خطا در ساخت نوتیف COMMENT:', err);
        }

        return {
            success: true,
            message: 'کامنت با موفقیت ثبت شد.',
            comment: formatComment(comment, userId),
        };
    },

    replyToComment: async (
        _: any,
        { commentId, content }: { commentId: string; content: string },
        context: any
    ) => {
        const userId = requireAuth(context);

        // ✅ کامنت والد رو بگیر (و صاحبش رو)
        const parentComment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true, userId: true, postId: true },
        });

        if (!parentComment) {
            throw new Error('کامنت یافت نشد.');
        }

        const reply = await prisma.comment.create({
            data: {
                content,
                userId,
                postId: parentComment.postId,
                parentId: commentId,
            },
            include: {
                user: true,
                likes: true,
            },
        });

        // ✅ ارسال نوتیف به صاحب کامنت والد
        try {
            await createNotification({
                recipientId: parentComment.userId,
                actorId: userId,
                type: 'REPLY',
                postId: parentComment.postId,
                commentId: parentComment.id,
            });
        } catch (err) {
            console.error('❌ خطا در ساخت نوتیف REPLY:', err);
        }

        return {
            success: true,
            message: 'ریپلی با موفقیت ثبت شد.',
            comment: formatComment(reply, userId),
        };
    },

    deleteComment: async (_: any, { commentId }: { commentId: string }, context: any) => {
        const userId = requireAuth(context);

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) throw new Error('کامنت یافت نشد.');
        if (comment.userId !== userId) throw new Error('شما اجازه حذف این کامنت را ندارید.');

        await prisma.comment.delete({ where: { id: commentId } });

        return { success: true, message: 'کامنت با موفقیت حذف شد.' };
    },
};