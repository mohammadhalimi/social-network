'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { Loader2 } from 'lucide-react';
import { GET_USER_POSTS } from '@/app/graphql/post.queries';
import { ProfilePostCard } from './ProfilePostCard';

interface ProfilePostsListProps {
    userId: string;
}

export const ProfilePostsList = ({ userId }: ProfilePostsListProps) => {
    const [limit] = useState(6);
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { data, loading, error, fetchMore } = useQuery(GET_USER_POSTS, {
        variables: { userId, limit, offset: 0 },
        skip: !userId,
    });

    useEffect(() => {
        if (data?.getUserPosts) {
            setAllPosts(data.getUserPosts);
            setHasMore(data.getUserPosts.length === limit);
        }
    }, [data, limit]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || loading) return;

        setLoadingMore(true);
        try {
            const newOffset = allPosts.length;
            const { data: newData } = await fetchMore({ variables: { offset: newOffset } });

            if (newData?.getUserPosts) {
                setAllPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newData.getUserPosts.filter((p: any) => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
                if (newData.getUserPosts.length < limit) setHasMore(false);
            }
        } catch (err) {
            console.error('Error loading more posts:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [fetchMore, hasMore, loading, loadingMore, allPosts.length, limit]);

    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [loadMore, hasMore, loading, loadingMore]);

    if (loading && allPosts.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">خطا در دریافت پست‌ها</p>
            </div>
        );
    }

    if (allPosts.length === 0) {
        return (
            <div className="text-center py-12 text-text-secondary">
                <p className="text-lg">این کاربر هنوز پستی منتشر نکرده است</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPosts.map((post) => (
                    <ProfilePostCard key={post.id} post={post} />
                ))}
            </div>

            {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                    {loadingMore && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                </div>
            )}

            {!hasMore && allPosts.length > 0 && (
                <div className="text-center py-4 text-secondary text-sm">
                    همه پست‌ها نمایش داده شدند ✅
                </div>
            )}
        </div>
    );
};