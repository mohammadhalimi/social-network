// resolvers/post/post.mutations.ts
// mutationهای اصلی پست: ایجاد، ویرایش، حذف

import prisma from '../../../lib/prisma';
import { formatPost } from '../helpers/formatPost';
import { requireAuth } from '../try-catch/requireAuth';

export const postMutations = {
    createPost: async (_: any, { content }: { content: string }, context: any) => {
        const userId = requireAuth(context);

        const post = await prisma.post.create({
            data: { content, userId },
            include: {
                user: true,
                likes: true,
                comments: {
                    include: {
                        user: true,
                        likes: true,
                    },
                },
            },
        });

        return {
            success: true,
            message: 'پست با موفقیت ایجاد شد.',
            post: formatPost(post, userId),
        };
    },

    updatePost: async (
        _: any,
        { postId, content }: { postId: string; content: string },
        context: any
    ) => {
        const userId = requireAuth(context);

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error('پست یافت نشد.');
        if (post.userId !== userId) throw new Error('شما اجازه ویرایش این پست را ندارید.');

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { content },
            include: {
                user: true,
                likes: true,
                comments: {
                    include: {
                        user: true,
                        likes: true,
                    },
                },
            },
        });

        return {
            success: true,
            message: 'پست با موفقیت ویرایش شد.',
            post: formatPost(updatedPost, userId),
        };
    },

    deletePost: async (_: any, { postId }: { postId: string }, context: any) => {
        const userId = requireAuth(context);

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error('پست یافت نشد.');
        if (post.userId !== userId) throw new Error('شما اجازه حذف این پست را ندارید.');

        await prisma.post.delete({ where: { id: postId } });

        return {
            success: true,
            message: 'پست با موفقیت حذف شد.',
        };
    },
};