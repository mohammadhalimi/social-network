// app/components/notification/NotificationItem/useNotificationItem.ts
'use client';

import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import {
    INotification,
    MARK_NOTIFICATION_READ,
    ACCEPT_FOLLOW_REQUEST,
    REJECT_FOLLOW_REQUEST,
    GET_NOTIFICATIONS,
} from '@/app/graphql/notification.queries';
import { useAppDispatch } from '@/app/redux/hooks';
import { openPostModal } from '@/app/redux/uiSlice';
import { POST_NOTIFICATION_TYPES } from './constants';

export const useNotificationItem = (
    notification: INotification,
    onClose: () => void
) => {
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

    const handleClick = async () => {
        if (!notification.isRead) {
            await markAsRead({ variables: { notificationId: notification.id } });
        }

        if (POST_NOTIFICATION_TYPES.includes(notification.type)) {
            if (notification.postId) {
                dispatch(openPostModal(notification.postId));
            }
            onClose();
            return;
        }

        router.push(`/${notification.actor.username}`);
        onClose();
    };

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

    return { handleClick, handleAccept, handleReject };
};