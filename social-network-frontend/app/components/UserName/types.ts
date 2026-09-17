// app/user/[username]/components/types.ts

export interface ProfileUser {
    id: string;
    username: string;
    fullName: string;
    bio: string | null;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
}