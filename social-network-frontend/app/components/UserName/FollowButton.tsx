// components/profile/FollowButton.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FOLLOW_USER, UNFOLLOW_USER } from '@/app/graphql/user.queries';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing: boolean;
    onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
}

export const FollowButton = ({ userId, initialIsFollowing, onFollowChange }: FollowButtonProps) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const [followUser] = useMutation(FOLLOW_USER);
    const [unfollowUser] = useMutation(UNFOLLOW_USER);

    const handleClick = async () => {
        if (isLoading) return;

        const previousState = isFollowing;
        setIsLoading(true);

        try {
            if (previousState) {
                const { data } = await unfollowUser({ variables: { userId } });
                if (data?.unfollowUser.success) {
                    setIsFollowing(false);
                    onFollowChange?.(false, data.unfollowUser.followersCount);
                } else {
                    toast.error(data?.unfollowUser.message || 'خطا در لغو دنبال کردن');
                }
            } else {
                const { data } = await followUser({ variables: { userId } });
                if (data?.followUser.success) {
                    setIsFollowing(true);
                    onFollowChange?.(true, data.followUser.followersCount);
                } else {
                    toast.error(data?.followUser.message || 'خطا در دنبال کردن');
                }
            }
        } catch (error: any) {
            console.error('Error toggling follow:', error);
            toast.error(error.message || 'خطایی رخ داد');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium
                transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                ${isFollowing
                    ? 'bg-border text-text-primary hover:bg-red-500/10 hover:text-red-500'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }
            `}
        >
            {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : isFollowing ? (
                <UserCheck size={16} />
            ) : (
                <UserPlus size={16} />
            )}
            {isFollowing ? 'دنبال می‌کنید' : 'دنبال کردن'}
        </button>
    );
};