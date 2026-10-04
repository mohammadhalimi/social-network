// helpers/mapUser.ts
// تبدیل رکورد کاربر (Prisma) به شکل خروجی GraphQL
interface FollowInfo {
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
    isFollowRequestPending?: boolean; // ✅ اضافه شد
}

export function mapUser(user: {
    id: string | number;
    email: string;
    username: string;
    fullName: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
    isPrivate?: boolean; // ✅ اضافه شد (اختیاری، چون بعضی select ها شاید این فیلد رو نیارن)
},
    followInfo?: FollowInfo
) {
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        followersCount: followInfo?.followersCount ?? 0,
        followingCount: followInfo?.followingCount ?? 0,
        isFollowing: followInfo?.isFollowing ?? false,
        isPrivate: user.isPrivate ?? false, // ✅ اضافه شد
        isFollowRequestPending: followInfo?.isFollowRequestPending ?? false, // ✅ اضافه شد
    };
}