import prisma from '../../lib/prisma';
import { requireAuth } from './try-catch/requireAuth';
import { formatPost } from './helpers/formatPost';
import { mapUser } from './helpers/mapUser'; // ✅ اضافه شد

export const postResolvers = {
    Query: {
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

        getUserPosts: async (_: any, { userId, limit = 10, offset = 0 }: { userId: string; limit: number; offset: number }) => {
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

        getFeed: async (_: any, { limit = 10, offset = 0 }: { limit: number; offset: number }, context: any) => {
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
    },

    Mutation: {
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

        updatePost: async (_: any, { postId, content }: { postId: string; content: string }, context: any) => {
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

        likePost: async (_: any, { postId }: { postId: string }, context: any) => {
            const userId = requireAuth(context);

            const existingLike = await prisma.like.findUnique({
                where: { userId_postId: { userId, postId } },
            });

            if (existingLike) {
                return { success: false, message: 'شما قبلاً این پست را لایک کرده‌اید.', isLiked: true };
            }

            await prisma.like.create({ data: { userId, postId } });

            return { success: true, message: 'پست با موفقیت لایک شد.', isLiked: true };
        },

        unlikePost: async (_: any, { postId }: { postId: string }, context: any) => {
            const userId = requireAuth(context);

            const like = await prisma.like.findUnique({
                where: { userId_postId: { userId, postId } },
            });

            if (!like) {
                return { success: false, message: 'شما این پست را لایک نکرده‌اید.', isLiked: false };
            }

            await prisma.like.delete({ where: { id: like.id } });

            return { success: true, message: 'لایک پست برداشته شد.', isLiked: false };
        },

        commentOnPost: async (_: any, { postId, content }: { postId: string; content: string }, context: any) => {
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

        replyToComment: async (_: any, { commentId, content }: { commentId: string; content: string }, context: any) => {
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
    },
};