'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { Bell, CheckCheck, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/app/redux/hooks';
import {
    GET_NOTIFICATIONS,
    MARK_ALL_NOTIFICATIONS_READ,
    INotification,
} from '@/app/graphql/notification.queries';
import { NotificationItem } from '@/app/components/notification/NotificationItem';

const PAGE_SIZE = 15; // ✅ هر بار ۱۵ نوتیف

export default function NotificationsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAppSelector((state) => state.auth);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { data, loading, fetchMore, refetch } = useQuery(GET_NOTIFICATIONS, {
        variables: { limit: PAGE_SIZE, offset: 0 },
        fetchPolicy: 'cache-and-network',
        skip: !user,
    });

    const [markAllAsRead, { loading: marking }] = useMutation(
        MARK_ALL_NOTIFICATIONS_READ,
        { errorPolicy: 'all', refetchQueries: [GET_NOTIFICATIONS] }
    );

    const notifications: INotification[] = data?.getNotifications?.notifications || [];
    const unreadCount = data?.getNotifications?.unreadCount || 0;
    const totalCount = data?.getNotifications?.totalCount || 0;
    const hasMore = data?.getNotifications?.hasMore || false;

    // ✅ ریدایرکت به لاگین اگر کاربر لاگین نکرده
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    // ✅ لود بیشتر
    const handleLoadMore = useCallback(async () => {
        if (!hasMore || loading) return;
        try {
            await fetchMore({
                variables: {
                    offset: notifications.length,
                    limit: PAGE_SIZE,
                },
            });
        } catch (err) {
            console.error('Error loading more notifications:', err);
        }
    }, [hasMore, loading, notifications.length, fetchMore]);

    // ✅ IntersectionObserver برای اسکرول نامحدود
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [handleLoadMore, hasMore, loading]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* هدر */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="p-2 rounded-xl hover:bg-border/50 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-secondary" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">اعلان‌ها</h1>
                        <p className="text-xs text-secondary">
                            {totalCount} اعلان
                            {unreadCount > 0 && ` · ${unreadCount} خوانده‌نشده`}
                        </p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllAsRead()}
                        disabled={marking}
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {marking ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <CheckCheck size={14} />
                        )}
                        خواندن همه
                    </button>
                )}
            </div>

            {/* لیست */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {loading && notifications.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <Bell size={48} className="text-secondary mx-auto mb-3 opacity-40" />
                        <p className="text-text-primary font-medium">هنوز اعلانی ندارید</p>
                        <p className="text-sm text-secondary mt-1">
                            وقتی کسی با شما تعامل کند، اینجا نمایش داده می‌شود.
                        </p>
                    </div>
                ) : (
                    <div className="p-2">
                        {notifications.map((n) => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onClose={() => {}}
                            />
                        ))}
                    </div>
                )}

                {/* ✅ سنتینل برای اسکرول */}
                {hasMore && (
                    <div ref={loadMoreRef} className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                )}

                {!hasMore && notifications.length > 0 && (
                    <div className="text-center py-4 text-xs text-secondary border-t border-border">
                        همه اعلان‌ها نمایش داده شدند
                    </div>
                )}
            </div>
        </div>
    );
}