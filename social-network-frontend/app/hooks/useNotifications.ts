// src/app/hooks/useNotifications.ts
'use client';

import { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import {
    GET_NOTIFICATIONS,
    INotification,
    INotificationsResult,
} from '@/app/graphql/notification.queries';
import { client } from '@/app/lib/apollo-client';
import { useSocket } from '@/app/providers/SocketProvider';

const NOTIFICATIONS_LIMIT = 20;

export const useNotifications = () => {
    const { socket } = useSocket();

    const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
        variables: { limit: NOTIFICATIONS_LIMIT, offset: 0 },
        fetchPolicy: 'cache-and-network',
    });

    const notifications: INotification[] = data?.getNotifications?.notifications || [];
    const unreadCount: number = data?.getNotifications?.unreadCount || 0;

    // ✅ گوش دادن به رویداد Socket
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (payload: any) => {
            console.log('🔔 نوتیف جدید:', payload);

            // ✅ آپدیت Apollo Cache
            const existing = client.readQuery<{ getNotifications: INotificationsResult }>({
                query: GET_NOTIFICATIONS,
                variables: { limit: NOTIFICATIONS_LIMIT, offset: 0 },
            });

            if (existing) {
                const newNotification: INotification = {
                    id: payload.id,
                    type: payload.type,
                    isRead: payload.isRead,
                    createdAt: payload.createdAt,
                    actor: payload.actor,
                    followRequest: payload.followRequest || null,
                };

                // ✅ اضافه کردن نوتیف جدید به ابتدای لیست
                client.writeQuery({
                    query: GET_NOTIFICATIONS,
                    variables: { limit: NOTIFICATIONS_LIMIT, offset: 0 },
                    data: {
                        getNotifications: {
                            ...existing.getNotifications,
                            notifications: [newNotification, ...existing.getNotifications.notifications],
                            unreadCount: payload.unreadCount ?? existing.getNotifications.unreadCount + 1,
                            totalCount: existing.getNotifications.totalCount + 1,
                        },
                    },
                });
            }
        };

        socket.on('notification:new', handleNewNotification);

        return () => {
            socket.off('notification:new', handleNewNotification);
        };
    }, [socket]);

    return {
        notifications,
        unreadCount,
        loading,
        refetch,
    };
};