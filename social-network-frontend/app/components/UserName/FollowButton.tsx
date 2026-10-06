'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { UserPlus, UserCheck, Loader2, Clock } from 'lucide-react';
import { FOLLOW_USER, UNFOLLOW_USER } from '@/app/graphql/user.queries';
import { CANCEL_FOLLOW_REQUEST } from '@/app/graphql/notification.queries';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing: boolean;
    initialIsPending?: boolean;  // ✅ جدید
    onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
}

export const FollowButton = ({
    userId,
    initialIsFollowing,
    initialIsPending = false,
    onFollowChange,
}: FollowButtonProps) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, setIsPending] = useState(initialIsPending);
    const [isLoading, setIsLoading] = useState(false);

    const [followUser] = useMutation(FOLLOW_USER, { errorPolicy: 'all' });
    const [unfollowUser] = useMutation(UNFOLLOW_USER, { errorPolicy: 'all' });
    const [cancelFollowRequest] = useMutation(CANCEL_FOLLOW_REQUEST, { errorPolicy: 'all' });

    const handleClick = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            // ✅ حالت ۱: در انتظار تأیید → لغو درخواست
            if (isPending) {
                const { data, error } = await cancelFollowRequest({
                    variables: { targetUserId: userId },
                });

                if (error) {
                    toast.error(error.message || 'خطا در لغو درخواست');
                    return;
                }

                if (data?.cancelFollowRequest.success) {
                    setIsPending(false);
                    toast.success('درخواست لغو شد');
                } else {
                    toast.error(data?.cancelFollowRequest.message || 'خطا در لغو درخواست');
                }
                return;
            }

            // ✅ حالت ۲: دنبال می‌کنید → آنفالو
            if (isFollowing) {
                const { data, error } = await unfollowUser({ variables: { userId } });

                if (error) {
                    toast.error(error.message || 'خطا در لغو دنبال کردن');
                    return;
                }

                if (data?.unfollowUser.success) {
                    setIsFollowing(false);
                    onFollowChange?.(false, data.unfollowUser.followersCount);
                } else {
                    toast.error(data?.unfollowUser.message || 'خطا در لغو دنبال کردن');
                }
                return;
            }

            // ✅ حالت ۳: دنبال نمی‌کنید → فالو یا درخواست
            const { data, error } = await followUser({ variables: { userId } });

            if (error) {
                toast.error(error.message || 'خطا در دنبال کردن');
                return;
            }

            if (data?.followUser.success) {
                if (data.followUser.isPending) {
                    // ✅ پیج خصوصی: درخواست فرستاده شد
                    setIsPending(true);
                    toast.success('درخواست دنبال کردن ارسال شد');
                } else {
                    // ✅ پیج عمومی: فالو شد
                    setIsFollowing(true);
                    onFollowChange?.(true, data.followUser.followersCount);
                }
            } else {
                toast.error(data?.followUser.message || 'خطا در دنبال کردن');
            }
        } catch (error: any) {
            console.error('Error toggling follow:', error);
            toast.error(error.message || 'خطایی رخ داد');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ تعیین ظاهر دکمه
    const getButtonContent = () => {
        if (isLoading) return <Loader2 size={16} className="animate-spin" />;
        if (isPending) return <Clock size={16} />;
        if (isFollowing) return <UserCheck size={16} />;
        return <UserPlus size={16} />;
    };

    const getButtonText = () => {
        if (isPending) return 'در انتظار تأیید';
        if (isFollowing) return 'دنبال می‌کنید';
        return 'دنبال کردن';
    };

    const getButtonClasses = () => {
        if (isPending) {
            return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 hover:bg-yellow-500/20';
        }
        if (isFollowing) {
            return 'bg-border text-primary hover:bg-red-500/10 hover:text-red-500';
        }
        return 'bg-primary text-white hover:bg-secondary';
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium
                transition-colors disabled:opacity-60 cursor-pointer
                ${getButtonClasses()}
            `}
        >
            {getButtonContent()}
            {getButtonText()}
        </button>
    );
};