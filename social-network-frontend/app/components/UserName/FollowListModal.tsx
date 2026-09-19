// components/common/FollowListModal/index.tsx
'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { FollowList } from './FollowListModal/FollowList';
import { SearchInput } from './FollowListModal/SearchInput';
import { GET_FOLLOWERS, GET_FOLLOWING } from '@/app/graphql/user.queries';
import { FollowListModalProps, FollowUser } from './FollowListModal/types';

export const FollowListModal = ({ userId, type, isOpen, onClose }: FollowListModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<FollowUser[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const query = type === 'followers' ? GET_FOLLOWERS : GET_FOLLOWING;

    const { data, loading, fetchMore, refetch } = useQuery(query, {
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
        <div
            className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-[70]
            p-4
        ">
            <div
                className="
                bg-card
                rounded-2xl
                p-6
                max-w-md
                w-full
                max-h-[80vh]
                overflow-y-auto
                shadow-xl
            ">
                <div
                    className="
                    flex
                    items-center
                    justify-between
                    mb-4
                ">
                    <h1
                        className="
                        text-lg
                        font-bold
                        text-primary
                    ">
                        {type === 'followers' ? 'دنبال‌کننده‌ها' : 'دنبال‌شونده‌ها'}
                    </h1>
                    <button
                        onClick={onClose}
                        className="
                        p-1
                        hover:bg-border
                        rounded-lg
                        transition-colors
                        cursor-pointer
                        ">
                        <X size={20} />
                    </button>
                </div>

                <SearchInput
                    value={searchTerm}
                    onChange={handleSearch}
                />

                <FollowList
                    users={users}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasMore={hasMore}
                    type={type}
                    onClose={onClose}
                    onLoadMore={handleLoadMore}
                />
            </div>
        </div>
    );
};