// components/story/CloseFriendsSelector/useFollowersPagination.ts
'use client';

import { useQuery } from '@apollo/client/react';
import { GET_FOLLOWERS } from '@/app/graphql/user.queries';
import {
    useState,
    useEffect,
    useRef,
    useCallback
} from 'react';

const PAGE_SIZE = 10;

export const useFollowersPagination = (userId: string) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [allFollowers, setAllFollowers] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMoreRef = useRef<HTMLDivElement>(null);
    const prevDebouncedSearchRef = useRef(debouncedSearch);
    // ✅ Debounce برای جستجو
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, loading, fetchMore } = useQuery(GET_FOLLOWERS, {
        variables: { userId, searchTerm: debouncedSearch, limit: PAGE_SIZE, offset: 0 },
        fetchPolicy: 'cache-and-network',
    });

    // ✅ ادغام: هم data رو ست می‌کنه، هم در صورت تغییر search، لیست رو ریست می‌کنه
    useEffect(() => {
        if (data?.getFollowers?.users) {
            setAllFollowers(data.getFollowers.users);
            setHasMore(data.getFollowers.hasMore);
        } else if (prevDebouncedSearchRef.current !== debouncedSearch) {
            // ✅ search تغییر کرده و data جدید هنوز نیامده
            setAllFollowers([]);
            setHasMore(true);
        }
        prevDebouncedSearchRef.current = debouncedSearch;
    }, [data, debouncedSearch]);


    const handleLoadMore = useCallback(async () => {
        if (!hasMore || loadingMore || loading) return;
        setLoadingMore(true);

        try {
            const { data: newData } = await fetchMore({
                variables: {
                    offset: allFollowers.length,
                    limit: PAGE_SIZE,
                    searchTerm: debouncedSearch,
                },
            });

            const newUsers = newData?.getFollowers?.users || [];
            const newHasMore = newData?.getFollowers?.hasMore ?? false;

            setAllFollowers(prev => {
                const existingIds = new Set(prev.map(u => u.id));
                const uniqueNew = newUsers.filter((u: any) => !existingIds.has(u.id));
                return [...prev, ...uniqueNew];
            });
            setHasMore(newHasMore);
        } catch (err) {
            console.error('Error loading more followers:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, loading, allFollowers.length, debouncedSearch, fetchMore]);

    // ✅ IntersectionObserver برای Infinite Scroll
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [handleLoadMore, hasMore, loading, loadingMore]);

    return {
        searchTerm,
        setSearchTerm,
        allFollowers,
        loading,
        hasMore,
        loadingMore,
        loadMoreRef,
    };
};