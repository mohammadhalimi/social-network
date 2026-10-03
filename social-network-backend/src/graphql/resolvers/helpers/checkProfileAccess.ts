// src/graphql/resolvers/helpers/checkProfileAccess.ts
import prisma from '../../../lib/prisma';

/**
 * بررسی می‌کند آیا viewer اجازه‌ی دیدن محتوای (پست/استوری) profileOwner را دارد
 * فقط برای چک حریم خصوصی حساب است؛ visibility مخصوص استوری جداگانه چک می‌شود
 */
export async function canViewPrivateProfile(
    viewerId: string | null,
    profileOwner: { id: string; isPrivate: boolean }
): Promise<boolean> {
    if (viewerId === profileOwner.id) return true;
    if (!profileOwner.isPrivate) return true;
    if (!viewerId) return false;

    const isFollower = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: viewerId,
                followingId: profileOwner.id,
            },
        },
    });

    return !!isFollower;
}