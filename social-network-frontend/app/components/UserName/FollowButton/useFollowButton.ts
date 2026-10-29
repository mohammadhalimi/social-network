'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FollowState } from './constants';
import { useMutation } from '@apollo/client/react';
import { FOLLOW_USER, UNFOLLOW_USER } from '@/app/graphql/user.queries';
import { CANCEL_FOLLOW_REQUEST } from '@/app/graphql/notification.queries';

interface UseFollowButtonProps {
    userId: string;
    initialIsFollowing: boolean;
    initialIsPending?: boolean;
    onFollowChange?: (newState: 'not-following' | 'pending' | 'following', followersCount?: number) => void;
}

export const useFollowButton = ({
    userId,
    initialIsFollowing,
    initialIsPending = false,
    onFollowChange,
}: UseFollowButtonProps) => {
    
    const [state, setState] = useState<FollowState>(
        initialIsPending ? 'pending' : initialIsFollowing ? 'following' : 'not-following'
    );
    const [isLoading, setIsLoading] = useState(false);

    const [followUser] = useMutation(FOLLOW_USER, { errorPolicy: 'all' });
    const [unfollowUser] = useMutation(UNFOLLOW_USER, { errorPolicy: 'all' });
    const [cancelFollowRequest] = useMutation(CANCEL_FOLLOW_REQUEST, { errorPolicy: 'all' });

    const handleClick = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            // ✅ حالت ۱: pending → cancel
            if (state === 'pending') {
                const { data, error } = await cancelFollowRequest({
                    variables: { targetUserId: userId },
                });

                if (error) {
                    toast.error(error.message || 'خطا در لغو درخواست');
                    return;
                }
                if (data?.cancelFollowRequest.success) {
                    setState('not-following');
                    toast.success('درخواست لغو شد');
                    onFollowChange?.('not-following'); 
                } else {
                    toast.error(data?.cancelFollowRequest.message || 'خطا در لغو درخواست');
                }
                return;
            }

            // ✅ حالت ۲: following → unfollow
            if (state === 'following') {
                const { data, error } = await unfollowUser({ variables: { userId } });

                if (error) {
                    toast.error(error.message || 'خطا در لغو دنبال کردن');
                    return;
                }
                if (data?.unfollowUser.success) {
                    setState('not-following');
                    // ✅ اصلاح شد:
                    onFollowChange?.('not-following', data.unfollowUser.followersCount);
                } else {
                    toast.error(data?.unfollowUser.message || 'خطا در لغو دنبال کردن');
                }
                return;
            }

            // ✅ حالت ۳: not-following → follow (public → following, private → pending)
            const { data, error } = await followUser({ variables: { userId } });

            if (error) {
                toast.error(error.message || 'خطا در دنبال کردن');
                return;
            }
            if (data?.followUser.success) {
                if (data.followUser.isPending) {
                    setState('pending');
                    toast.success('درخواست دنبال کردن ارسال شد');
                    onFollowChange?.('pending'); // ✅ خبر بده
                } else {
                    setState('following');
                    onFollowChange?.('following', data.followUser.followersCount); // ✅ خبر بده
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'خطایی رخ داد');
        } finally {
            setIsLoading(false);
        }
    };

    return { state, isLoading, handleClick };
};