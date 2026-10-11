'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
    UserPlus,
    Check,
    X,
    UserCheck,
    Heart,
    MessageCircle,
    Reply,
} from 'lucide-react';
import {
    INotification,
    MARK_NOTIFICATION_READ,
    ACCEPT_FOLLOW_REQUEST,
    REJECT_FOLLOW_REQUEST,
    GET_NOTIFICATIONS,
} from '@/app/graphql/notification.queries';
import { getAvatarUrl } from '@/app/lib/utils/avatar';
import { useAppDispatch } from '@/app/redux/hooks';
import { openPostModal } from '@/app/redux/uiSlice';

interface NotificationItemProps {
    notification: INotification;
    onClose: () => void;
}

export const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [markAsRead] = useMutation(MARK_NOTIFICATION_READ, {
        errorPolicy: 'all',
        refetchQueries: [GET_NOTIFICATIONS],
    });

    const [acceptRequest] = useMutation(ACCEPT_FOLLOW_REQUEST, {
        errorPolicy: 'all',
        refetchQueries: [GET_NOTIFICATIONS],
    });

    const [rejectRequest] = useMutation(REJECT_FOLLOW_REQUEST, {
        errorPolicy: 'all',
        refetchQueries: [GET_NOTIFICATIONS],
    });

    const avatarUrl = getAvatarUrl(notification.actor.avatar);

    // ✅ زمان نسبی
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: faIR,
    });

    // ✅ متن نوتیف
    const getMessage = () => {
        switch (notification.type) {
            case 'FOLLOW':
                return 'شما را دنبال کرد';
            case 'FOLLOW_REQUEST':
                return 'درخواست دنبال کردن فرستاد';
            case 'FOLLOW_REQUEST_ACCEPTED':
                return 'درخواست شما را پذیرفت';
            case 'LIKE':
                return 'پست شما را لایک کرد';
            case 'COMMENT':
                return 'برای پست شما کامنت گذاشت';
            case 'REPLY':
                return 'به کامنت شما پاسخ داد';
            case 'COMMENT_LIKE':
                return 'کامنت شما را لایک کرد';
            default:
                return '';
        }
    };

    // ✅ آیکون نوتیف
    const getIcon = () => {
        switch (notification.type) {
            case 'FOLLOW':
                return <UserPlus size={14} className="text-green-500" />;
            case 'FOLLOW_REQUEST':
                return <UserPlus size={14} className="text-blue-500" />;
            case 'FOLLOW_REQUEST_ACCEPTED':
                return <UserCheck size={14} className="text-primary" />;
            case 'LIKE':
                return <Heart size={14} className="text-red-500 fill-red-500" />;
            case 'COMMENT':
                return <MessageCircle size={14} className="text-blue-500" />;
            case 'REPLY':
                return <Reply size={14} className="text-purple-500" />;
            case 'COMMENT_LIKE':
                return <Heart size={14} className="text-pink-500 fill-pink-500" />;
            default:
                return null;
        }
    };

    // ✅ کلیک روی نوتیف
    const handleClick = async () => {
        if (!notification.isRead) {
            await markAsRead({ variables: { notificationId: notification.id } });
        }

        // ✅ برای نوتیف‌های پست: باز کردن مودال پست
        if (
            notification.type === 'LIKE' ||
            notification.type === 'COMMENT' ||
            notification.type === 'REPLY' ||
            notification.type === 'COMMENT_LIKE'
        ) {
            if (notification.postId) {
                dispatch(openPostModal(notification.postId));
            }
            onClose();
            return;
        }

        // ✅ برای نوتیف‌های فالو: رفتن به پروفایل کاربر
        router.push(`/${notification.actor.username}`);
        onClose();
    };

    // ✅ قبول درخواست
    const handleAccept = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.followRequest) return;

        const { data, error } = await acceptRequest({
            variables: { requestId: notification.followRequest.id },
        });

        if (error) {
            toast.error(error.message || 'خطا در قبول درخواست');
            return;
        }

        if (data?.acceptFollowRequest.success) {
            toast.success('درخواست قبول شد ✅');
        }
    };

    // ✅ رد درخواست
    const handleReject = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.followRequest) return;

        const { data, error } = await rejectRequest({
            variables: { requestId: notification.followRequest.id },
        });

        if (error) {
            toast.error(error.message || 'خطا در رد درخواست');
            return;
        }

        if (data?.rejectFollowRequest.success) {
            toast.success('درخواست رد شد');
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
            flex
            items-start
            gap-3
            p-3
            rounded-xl
            cursor-pointer
            transition-colors
            hover:bg-border/30
            ${!notification.isRead ? 'bg-primary/5 border-r-2 border-primary' : ''}
            `}
        >
            {/* ✅ آواتار */}
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={notification.actor.fullName}
                        className="w-full h-full object-cover"
                        width={40}
                        height={40}
                        unoptimized
                    />
                ) : (
                    <span className="text-white font-bold text-sm">
                        {notification.actor.fullName?.[0] || '👤'}
                    </span>
                )}
            </div>

            {/* ✅ متن */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                    <span className="font-bold">{notification.actor.fullName}</span>{' '}
                    <span className="text-text-secondary">{getMessage()}</span>
                </p>
                <p className="text-[10px] text-text-secondary mt-1">{timeAgo}</p>

                {/* ✅ دکمه‌های قبول/رد برای FollowRequest */}
                {notification.type === 'FOLLOW_REQUEST' &&
                    notification.followRequest?.status === 'PENDING' && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleAccept}
                                className="flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <Check size={12} />
                                قبول
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex items-center gap-1 px-3 py-1 bg-border text-text-primary text-xs rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <X size={12} />
                                رد
                            </button>
                        </div>
                    )}
            </div>

            {/* ✅ آیکون نوع نوتیف */}
            <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        </div>
    );
};