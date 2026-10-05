'use client';

import { useMutation } from '@apollo/client/react';
import { Bell, CheckCheck } from 'lucide-react';
import {
    INotification,
    MARK_ALL_NOTIFICATIONS_READ,
    GET_NOTIFICATIONS,
} from '@/app/graphql/notification.queries';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
    notifications: INotification[];
    unreadCount: number;
    loading: boolean;
    onClose: () => void;
}

export const NotificationDropdown = ({
    notifications,
    unreadCount,
    loading,
    onClose,
}: NotificationDropdownProps) => {
    const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
        errorPolicy: 'all',
        refetchQueries: [GET_NOTIFICATIONS],
    });

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        await markAllAsRead();
    };

    return (
        <div
            className="
            absolute
            top-full
            mt-2
            left-0
            w-80
            sm:w-96
            bg-card
            border
            border-border
            rounded-2xl
            shadow-xl
            z-[60]
            overflow-hidden
            ">
            {/* هدر */}
            <div
                className="
                flex
                items-center
                justify-between
                px-4
                py-3
                border-b
                border-border
                ">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-primary" />
                    <h3 className="font-bold text-text-primary">اعلان‌ها</h3>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="
                        flex
                        items-center
                        gap-1
                        text-xs
                        text-primary
                        hover:underline
                        transition-colors
                        cursor-pointer
                        ">
                        <CheckCheck size={14} />
                        خواندن همه
                    </button>
                )}
            </div>

            {/* لیست */}
            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <Bell size={32} className="text-secondary mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-secondary">هنوز اعلانی ندارید</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {notifications.map((n) => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onClose={onClose}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};