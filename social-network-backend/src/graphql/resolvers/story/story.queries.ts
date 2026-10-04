// resolvers/story/story.queries.ts
import prisma from '../../../lib/prisma';
import { mapUser } from '../helpers/mapUser';
import { requireAuth } from '../try-catch/requireAuth';

export const storyQueries = {
    getUserStories: async (_: any, { userId }: { userId: string }, context: any) => {
        const viewerId = context.user?.userId || null;

        // ✅ چک حریم خصوصی حساب، قبل از هر چیز دیگه
        const profileOwner = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isPrivate: true },
        });

        if (!profileOwner) {
            return [];
        }

        if (profileOwner.isPrivate && viewerId !== userId) {
            if (!viewerId) return [];

            const isFollower = await prisma.follow.findUnique({
                where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
            });

            if (!isFollower) {
                return []; // ✅ حساب خصوصی است و بیننده فالوور نیست: هیچ استوری‌ای نمایش داده نمی‌شود
            }
        }

        const stories = await prisma.story.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: true,
                views: {
                    include: {
                        viewer: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

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

        const [isFollower, isCloseFriend] = await Promise.all([
            prisma.follow.findUnique({
                where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
            }),
            prisma.closeFriend.findUnique({
                where: { ownerId_friendId: { ownerId: userId, friendId: viewerId } },
            }),
        ]);

        const visibleStories = stories.filter(story => {
            if (story.visibility === 'PUBLIC') return true;
            if (story.visibility === 'FOLLOWERS') return !!isFollower;
            if (story.visibility === 'CLOSE_FRIENDS') return !!isCloseFriend;
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

    // ✅ بدون تغییر - چون همیشه فقط کاربرهایی که فالو می‌کنی رو شامل می‌شه
    getFollowingStories: async (_: any, __: any, context: any) => {
        const userId = requireAuth(context, 'برای مشاهده باید وارد شوید.');

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
            orderBy: { createdAt: 'asc' },
        });

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

        return closeFriends.map(cf => mapUser(cf.friend));
    },
};