// resolvers/post/post.queries.ts
// کوئری‌های مربوط به پست: دریافت یک پست، پست‌های یک کاربر، و فید

import prisma from '../../../lib/prisma';
import { formatPost } from '../helpers/formatPost';

export const postQueries = {
    getPost: async (_: any, { postId }: { postId: string }) => {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                user: true,
                likes: true,
                comments: {
                    include: {
                        user: true,
                        likes: true,
                        replies: {
                            include: {
                                user: true,
                                likes: true,
                            },
                        },
                    },
                },
            },
        });

        if (!post) throw new Error('پست یافت نشد.');
        return formatPost(post);
    },

    getUserPosts: async (
        _: any,
        { userId, limit = 10, offset = 0 }: { userId: string; limit: number; offset: number }
    ) => {
        const posts = await prisma.post.findMany({
            where: { userId, isPublished: true },
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
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        return posts.map((post) => formatPost(post));
    },

    getFeed: async (
        _: any,
        { limit = 10, offset = 0 }: { limit: number; offset: number },
        context: any
    ) => {
        const userId = context.user?.userId || null;

        const posts = await prisma.post.findMany({
            where: { isPublished: true },
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
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        return posts.map((post) => formatPost(post, userId));
    },
};