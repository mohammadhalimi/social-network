'use client';

import { FollowUser } from './types';
import { Loader2 } from 'lucide-react';
import { UserListItem } from './UserListItem';

interface FollowListProps {
    users: FollowUser[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    type: 'followers' | 'following';
    onClose: () => void;
    onLoadMore: () => void;
    onFollowChange?: () => void;
}

export const FollowList = ({
    users,
    loading,
    loadingMore,
    hasMore,
    type,
    onClose,
    onLoadMore,
    onFollowChange,
}: FollowListProps) => {
    // حالت لودینگ اولیه
    if (loading) {
        return (
            <div
                className="
                flex
                justify-center
                py-8
            ">
                <Loader2
                    size={24}
                    className="
                    animate-spin
                    text-primary
                "/>
            </div>
        );
    }

    // حالت خالی بودن
    if (users.length === 0) {
        return (
            <p
                className="
                text-center
                text-secondary
                py-8
            ">
                {type === 'followers' ? 'دنبال‌کننده‌ای یافت نشد' : 'دنبال‌شونده‌ای یافت نشد'}
            </p>
        );
    }

    return (
        <>
            <div
                className="
                space-y-3
            ">
                {users.map((u) => (
                    <UserListItem
                    key={u.id}
                    user={u}
                    onClose={onClose}
                    onFollowChange={onFollowChange}
                    />
                ))}
            </div>

            {/* دکمه لود بیشتر */}
            {hasMore && (
                <div
                    className="
                    flex
                    justify-center
                    py-4
                ">
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="
                        text-sm
                        text-primary
                        hover:underline
                        disabled:opacity-50
                        ">
                        {loadingMore ? 'در حال بارگذاری...' : 'نمایش بیشتر'}
                    </button>
                </div>
            )}
        </>
    );
};