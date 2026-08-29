// resolvers/post/comment.resolvers.ts
// کامنت و ریپلای روی پست

import prisma from '../../../lib/prisma';
import { mapUser } from '../helpers/mapUser';
import { requireAuth } from '../try-catch/requireAuth';

export const commentResolvers = {
    commentOnPost: async (
        _: any,
        { postId, content }: { postId: string; content: string },
        context: any
    ) => {
        const userId = requireAuth(context);

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error('پست یافت نشد.');

        const comment = await prisma.comment.create({
            data: { content, userId, postId },
            include: {
                user: true,
                likes: true,
            },
        });

        return {
            success: true,
            message: 'کامنت با موفقیت ثبت شد.',
            comment: {
                ...comment,
                user: mapUser(comment.user),
                likesCount: comment.likes.length,
                isLiked: comment.likes.some((like: any) => like.userId === userId),
                replies: [],
            },
        };
    },

    replyToComment: async (
        _: any,
        { commentId, content }: { commentId: string; content: string },
        context: any
    ) => {
        const userId = requireAuth(context);

        const parentComment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!parentComment) throw new Error('کامنت یافت نشد.');

        const reply = await prisma.comment.create({
            data: { content, userId, postId: parentComment.postId, parentId: commentId },
            include: {
                user: true,
                likes: true,
            },
        });

        return {
            success: true,
            message: 'ریپلی با موفقیت ثبت شد.',
            comment: {
                ...reply,
                user: mapUser(reply.user),
                likesCount: reply.likes.length,
                isLiked: reply.likes.some((like: any) => like.userId === userId),
                replies: [],
            },
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