// resolvers/post/post.queries.ts
// کوئری‌های مربوط به پست: دریافت یک پست، پست‌های یک کاربر، و فید

import prisma from '../../../lib/prisma';
import { formatPost } from '../helpers/formatPost';
import { canViewPrivateProfile } from '../helpers/checkProfileAccess';

export const postQueries = {
    getPost: async (_: any, { postId }: { postId: string }, context: any) => {
        const userId = context.user?.userId || null;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                user: true,
                likes: true,
                savedBy: { where: { userId } },
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

        // ✅ چک حریم خصوصی
        const hasAccess = await canViewPrivateProfile(userId, {
            id: post.user.id,
            isPrivate: post.user.isPrivate,
        });
        if (!hasAccess) {
            throw new Error('این پست متعلق به یک حساب خصوصی است.');
        }

        return formatPost(post, userId);
    },

    getUserPosts: async (
        _: any,
        { userId, limit = 10, offset = 0 }: { userId: string; limit: number; offset: number },
        context: any
    ) => {
        const currentUserId = context.user?.userId || null;

        // ✅ چک حریم خصوصی قبل از گرفتن پست‌ها
        const profileOwner = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isPrivate: true },
        });

        if (!profileOwner) {
            throw new Error('کاربر یافت نشد.');
        }

        const hasAccess = await canViewPrivateProfile(currentUserId, profileOwner);
        if (!hasAccess) {
            return []; // ✅ آرایه‌ی خالی برمی‌گردونیم، نه خطا (چون این یه کوئری لیستیه، نه تکی)
        }

        const posts = await prisma.post.findMany({
            where: { userId, isPublished: true },
            include: {
                user: true,
                likes: true,
                savedBy: { where: { userId: currentUserId } },
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

        return posts.map((post) => formatPost(post, currentUserId));
    },

    getFeed: async (
        _: any,
        { limit = 10, offset = 0 }: { limit: number; offset: number },
        context: any
    ) => {
        const userId = context.user?.userId || null;

        // ✅ گرفتن لیست کسانی که کاربر فعلی فالو می‌کند (برای فیلتر حساب‌های خصوصی)
        const followingIds = userId
            ? (await prisma.follow.findMany({
                  where: { followerId: userId },
                  select: { followingId: true },
              })).map((f) => f.followingId)
            : [];

        const posts = await prisma.post.findMany({
            where: {
                isPublished: true,
                OR: [
                    { user: { isPrivate: false } },           // حساب‌های عمومی: برای همه قابل مشاهده
                    { userId: { in: followingIds } },          // حساب‌های خصوصی: فقط اگر فالوورش باشی
                    ...(userId ? [{ userId }] : []),           // پست‌های خودت (حتی اگر خودت خصوصی باشی)
                ],
            },
            include: {
                user: true,
                likes: true,
                savedBy: { where: { userId } },
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