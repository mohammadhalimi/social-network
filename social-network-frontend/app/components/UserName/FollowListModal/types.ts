export interface FollowUser {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
    isFollowing: boolean;
    isFollowRequestPending?: boolean;
}

export interface FollowListModalProps {
    userId: string;
    type: 'followers' | 'following';
    isOpen: boolean;
    onClose: () => void;
}