// resolvers/helpers/checkStoryAccess.ts
import prisma from '../../../lib/prisma';

export async function canViewStory(
    viewerId: string | null,
    story: { userId: string; visibility: 'PUBLIC' | 'FOLLOWERS' | 'CLOSE_FRIENDS' }
): Promise<boolean> {
    // صاحب استوری همیشه اجازه داره
    if (viewerId === story.userId) return true;

    if (story.visibility === 'PUBLIC') return true;

    // برای FOLLOWERS و CLOSE_FRIENDS، باید لاگین کرده باشه
    if (!viewerId) return false;

    if (story.visibility === 'FOLLOWERS') {
        const isFollower = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: viewerId,
                    followingId: story.userId,
                },
            },
        });
        return !!isFollower;
    }

    if (story.visibility === 'CLOSE_FRIENDS') {
        const isCloseFriend = await prisma.closeFriend.findUnique({
            where: {
                ownerId_friendId: {
                    ownerId: story.userId,
                    friendId: viewerId,
                },
            },
        });
        return !!isCloseFriend;
    }

    return false;
}