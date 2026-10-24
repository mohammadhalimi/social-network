// app/components/notification/NotificationItem/index.tsx
'use client';

import Image from 'next/image';
import { faIR } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';
import {
    UserPlus,
    Check,
    X,
    UserCheck,
    Heart,
    MessageCircle,
    Reply,
} from 'lucide-react';

import { getAvatarUrl } from '@/app/lib/utils/avatar';
import { MESSAGE_MAP } from './NotificationItem/constants';
import { useNotificationItem } from './NotificationItem/useNotificationItem';
import {
    INotification,
    NotificationType
} from '@/app/graphql/notification.queries';

interface NotificationItemProps {
    notification: INotification;
    onClose: () => void;
}

const getIcon = (type: NotificationType) => {
    switch (type) {
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

export const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
    const {
        handleClick,
        handleAccept,
        handleReject
    } = useNotificationItem(notification, onClose);

    const avatarUrl = getAvatarUrl(notification.actor.avatar);
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: faIR,
    });

    return (
        <div
            onClick={handleClick}
            data-testid="notification-item"
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
            {/* Avatar */}
            <div
                className="
                w-10
                h-10
                rounded-full
                bg-gradient-primary
                flex
                items-center
                justify-center
                overflow-hidden
                flex-shrink-0
            ">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={notification.actor.fullName}
                        className="
                        w-full
                        h-full
                        object-cover"
                        width={40}
                        height={40}
                        unoptimized
                    />
                ) : (
                    <span
                        className="
                        text-white
                        font-bold
                        text-sm
                    ">
                        {notification.actor.fullName?.[0] || '👤'}
                    </span>
                )}
            </div>

            <div
                className="
                flex-1
                min-w-0
            ">
                <p
                    className="
                    text-sm
                    text-primary
                ">
                    <span
                        className="
                        font-bold
                    ">
                        {notification.actor.fullName}
                    </span>{' '}
                    <span
                        className="
                        text-secondary
                    ">
                        {MESSAGE_MAP[notification.type]}
                    </span>
                </p>
                <p
                    className="
                    text-[10px]
                    text-secondary
                    mt-1
                ">
                    {timeAgo}
                </p>
                {notification.type === 'FOLLOW_REQUEST' &&
                    notification.followRequest?.status === 'PENDING' && (
                        <div
                            className="
                            flex
                            gap-2
                            mt-2
                        ">
                            <button
                                onClick={handleAccept}
                                data-testid="accept-button"
                                className="
                                flex
                                items-center
                                gap-1
                                px-3
                                py-1
                                bg-primary
                                text-white
                                text-xs
                                rounded-lg
                                hover:bg-secondary
                                transition-colors"
                            >
                                <Check size={12} />
                                قبول
                            </button>
                            <button
                                onClick={handleReject}
                                data-testid="reject-button"
                                className="
                                flex
                                items-center
                                gap-1
                                px-3
                                py-1
                                bg-border
                                text-primary
                                text-xs
                                rounded-lg
                                hover:bg-red-500
                                hover:text-white
                                transition-colors
                                ">
                                <X size={12} />
                                رد
                            </button>
                        </div>
                    )}
            </div>
            <div
                className="
                flex-shrink-0
                mt-1"
                data-testid="notification-icon">
                {getIcon(notification.type)}
            </div>
        </div>
    );
};

export default NotificationItem;