// resolvers/story/story.queries.ts
import prisma from '../../../lib/prisma';
import { requireAuth } from '../try-catch/requireAuth';
import { canViewStory } from '../helpers/checkStoryAccess';

export const storyQueries = {
    getUserStories: async (_: any, { userId }: { userId: string }, context: any) => {
        const viewerId = context.user?.userId || null;

        const stories = await prisma.story.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() },
            },
            include: { user: true, views: true },
            orderBy: { createdAt: 'asc' },
        });

        // ✅ اگر viewer لاگین نیست، فقط استوری‌های PUBLIC رو نشون بده
        if (!viewerId) {
            return stories
                .filter(s => s.visibility === 'PUBLIC')
                .map(story => ({
                    ...story,
                    createdAt: story.createdAt.toISOString(),
                    expiresAt: story.expiresAt.toISOString(),
                    viewsCount: story.views.length,
                    isViewedByMe: false,
                    viewers: [],
                }));
        }

        // ✅ اگر viewer خود صاحب استوری است، همه رو نشون بده
        if (viewerId === userId) {
            return stories.map(story => ({
                ...story,
                createdAt: story.createdAt.toISOString(),
                expiresAt: story.expiresAt.toISOString(),
                viewsCount: story.views.length,
                isViewedByMe: story.views.some(v => v.viewerId === viewerId),
                viewers: story.views.map((v: any) => ({
                    user: v.viewer,
                    viewedAt: v.viewedAt,
                })),
            }));
        }

        // ✅ بهینه‌سازی: یک بار following و closeFriend رو بگیر
        const [followingSet, closeFriendSet] = await Promise.all([
            prisma.follow.findMany({
                where: { followerId: viewerId, followingId: userId },
                select: { followingId: true },
            }).then(rows => new Set(rows.map(r => r.followingId))),
            prisma.closeFriend.findMany({
                where: { ownerId: userId, friendId: viewerId },
                select: { ownerId: true },
            }).then(rows => new Set(rows.map(r => r.ownerId))),
        ]);

        // ✅ فیلتر استوری‌ها بر اساس دسترسی (بدون Query اضافه)
        const visibleStories = stories.filter(story => {
            if (story.visibility === 'PUBLIC') return true;
            if (story.visibility === 'FOLLOWERS') return followingSet.has(story.userId);
            if (story.visibility === 'CLOSE_FRIENDS') return closeFriendSet.has(story.userId);
            return false;
        });

        return visibleStories.map(story => ({
            ...story,
            createdAt: story.createdAt.toISOString(),
            expiresAt: story.expiresAt.toISOString(),
            viewsCount: story.views.length,
            isViewedByMe: story.views.some(v => v.viewerId === viewerId),
            viewers: [],
        }));
    },
    getFollowingStories: async (_: any, __: any, context: any) => {
        const userId = requireAuth(context, 'برای مشاهده باید وارد شوید.');

        // ✅ یک بار followingIds رو بگیر
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map(f => f.followingId);

        if (followingIds.length === 0) return [];

        const stories = await prisma.story.findMany({
            where: {
                userId: { in: followingIds },
                expiresAt: { gt: new Date() },
            },
            include: { user: true, views: true },
            orderBy: { createdAt: 'asc' },  // ✅ asc برای ترتیب زمانی
        });

        // ✅ بهینه‌سازی: یک بار closeFriendSet رو بگیر
        const closeFriendSet = new Set(
            (await prisma.closeFriend.findMany({
                where: {
                    ownerId: { in: stories.map(s => s.userId) },
                    friendId: userId,
                },
                select: { ownerId: true },
            })).map(cf => cf.ownerId)
        );

        const followingSet = new Set(followingIds);

        // ✅ فیلتر استوری‌ها بر اساس دسترسی (بدون Query اضافه)
        const visibleStories = stories.filter(story => {
            if (story.visibility === 'PUBLIC') return true;
            if (story.visibility === 'FOLLOWERS') return followingSet.has(story.userId);
            if (story.visibility === 'CLOSE_FRIENDS') return closeFriendSet.has(story.userId);
            return false;
        });

        return visibleStories.map(story => ({
            ...story,
            createdAt: story.createdAt.toISOString(),
            expiresAt: story.expiresAt.toISOString(),
            viewsCount: story.views.length,
            isViewedByMe: story.views.some(v => v.viewerId === userId),
            viewers: [],
        }));
    },

    getCloseFriends: async (_: any, __: any, context: any) => {
        const ownerId = requireAuth(context, 'برای مشاهده باید وارد شوید.');

        const closeFriends = await prisma.closeFriend.findMany({
            where: { ownerId },
            include: { friend: true },
        });

        return closeFriends.map(cf => ({
            ...cf.friend,
            createdAt: cf.friend.createdAt.toISOString(),
            updatedAt: cf.friend.updatedAt.toISOString(),
        }));
    },
};