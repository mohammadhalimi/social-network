// app/components/notification/NotificationItem/constants.ts

import { NotificationType } from '@/app/graphql/notification.queries';

export const MESSAGE_MAP: Record<NotificationType, string> = {
    FOLLOW: 'شما را دنبال کرد',
    FOLLOW_REQUEST: 'درخواست دنبال کردن فرستاد',
    FOLLOW_REQUEST_ACCEPTED: 'درخواست شما را پذیرفت',
    LIKE: 'پست شما را لایک کرد',
    COMMENT: 'برای پست شما کامنت گذاشت',
    REPLY: 'به کامنت شما پاسخ داد',
    COMMENT_LIKE: 'کامنت شما را لایک کرد',
};

export const POST_NOTIFICATION_TYPES: NotificationType[] = [
    'LIKE',
    'COMMENT',
    'REPLY',
    'COMMENT_LIKE',
];