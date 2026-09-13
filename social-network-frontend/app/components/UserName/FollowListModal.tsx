// components/common/FollowListModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_FOLLOWERS, GET_FOLLOWING } from '@/app/graphql/user.queries';
import Image from 'next/image';
import Link from 'next/link';
import { X, Search, Loader2 } from 'lucide-react';
import { FollowButton } from './FollowButton';

interface FollowListModalProps {
    userId: string;
    type: 'followers' | 'following';
    isOpen: boolean;
    onClose: () => void;
}

export const FollowListModal = ({ userId, type, isOpen, onClose }: FollowListModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const query = type === 'followers' ? GET_FOLLOWERS : GET_FOLLOWING;

    const { data, loading, error, fetchMore, refetch } = useQuery(query, {
        variables: { userId, searchTerm: '', limit: 20, offset: 0 },
        skip: !isOpen,
    });

    useEffect(() => {
        if (data?.getFollowers || data?.getFollowing) {
            const result = data.getFollowers || data.getFollowing;
            setUsers(result.users);
            setHasMore(result.hasMore);
        }
    }, [data]);

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        try {
            const { data: newData } = await refetch({ searchTerm: term, offset: 0 });
            const result = newData?.getFollowers || newData?.getFollowing;
            setUsers(result?.users || []);
            setHasMore(result?.hasMore || false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleLoadMore = async () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const { data: newData } = await fetchMore({
                variables: { offset: users.length, searchTerm },
            });
            const result = newData?.getFollowers || newData?.getFollowing;
            setUsers(prev => [...prev, ...result.users]);
            setHasMore(result.hasMore);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMore(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-text-primary">
                        {type === 'followers' ? 'دنبال‌کننده‌ها' : 'دنبال‌شونده‌ها'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-border rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* جستجو */}
                <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="جستجو در لیست..."
                        className="w-full pr-10 pl-4 py-2 bg-transparent border border-border rounded-xl focus:border-primary outline-none text-sm text-text-primary"
                    />
                </div>

                {/* لیست کاربران */}
                <div className="space-y-3">
                    {loading && (
                        <div className="flex justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    )}

                    {!loading && users.length === 0 && (
                        <p className="text-center text-text-secondary py-8">
                            {type === 'followers' ? 'دنبال‌کننده‌ای یافت نشد' : 'دنبال‌شونده‌ای یافت نشد'}
                        </p>
                    )}

                    {users.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-border/50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                                {u.avatar ? (
                                    <Image src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" width={40} height={40} unoptimized />
                                ) : (
                                    <span className="text-white font-bold">{u.fullName?.[0] || '👤'}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/${u.username}`} onClick={onClose} className="block truncate text-sm font-medium text-text-primary hover:text-primary">
                                    {u.fullName}
                                </Link>
                                <p className="text-xs text-text-secondary truncate">@{u.username}</p>
                            </div>
                            <FollowButton
                                userId={u.id}
                                initialIsFollowing={u.isFollowing}
                            />
                        </div>
                    ))}
                </div>

                {/* دکمه لود بیشتر */}
                {hasMore && (
                    <div className="flex justify-center py-4">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="text-sm text-primary hover:underline disabled:opacity-50"
                        >
                            {loadingMore ? 'در حال بارگذاری...' : 'نمایش بیشتر'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};