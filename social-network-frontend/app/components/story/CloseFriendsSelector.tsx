// components/story/CloseFriendsSelector.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import Image from 'next/image';
import { Search, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    GET_CLOSE_FRIENDS,
    ADD_CLOSE_FRIEND,
    REMOVE_CLOSE_FRIEND,
    StoryUser,
} from '@/app/graphql/story.queries';
import { GET_FOLLOWERS } from '@/app/graphql/user.queries';

interface CloseFriendsSelectorProps {
    userId: string;
    onChange?: (selectedCount: number) => void;
}

const PAGE_SIZE = 10; // ✅ هر بار ۱۰ نفر

export const CloseFriendsSelector = ({ userId, onChange }: CloseFriendsSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [allFollowers, setAllFollowers] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMoreRef = useRef<HTMLDivElement>(null);

    // ✅ Debounce برای جستجو (۳۰۰ میلی‌ثانیه)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ✅ دریافت لیست Close Friends فعلی
    const { data: closeFriendsData, loading: loadingClose, refetch: refetchClose } = useQuery(
        GET_CLOSE_FRIENDS,
        { fetchPolicy: 'cache-and-network' }
    );

    // ✅ دریافت اولین صفحه فالوورها
    const { data: followersData, loading: loadingFollowers, fetchMore } = useQuery(GET_FOLLOWERS, {
        variables: { userId, searchTerm: debouncedSearch, limit: PAGE_SIZE, offset: 0 },
        fetchPolicy: 'cache-and-network',
    });

    const [addCloseFriend] = useMutation(ADD_CLOSE_FRIEND, { errorPolicy: 'all' });
    const [removeCloseFriend] = useMutation(REMOVE_CLOSE_FRIEND, { errorPolicy: 'all' });

    const closeFriends: StoryUser[] = closeFriendsData?.getCloseFriends || [];

    // ✅ پر کردن selectedIds با Close Friends فعلی
    useEffect(() => {
        if (closeFriends.length > 0) {
            setSelectedIds(new Set(closeFriends.map(cf => cf.id)));
        }
    }, [closeFriends]);

    // ✅ گزارش تعداد به والد
    useEffect(() => {
        onChange?.(selectedIds.size);
    }, [selectedIds, onChange]);

    // ✅ هماهنگ‌سازی allFollowers با داده‌های جدید (بعد از refetch یا تغییر search)
    useEffect(() => {
        if (followersData?.getFollowers?.users) {
            setAllFollowers(followersData.getFollowers.users);
            setHasMore(followersData.getFollowers.hasMore);
        }
    }, [followersData]);

    // ✅ ریست لیست وقتی search تغییر می‌کند
    useEffect(() => {
        setAllFollowers([]);
        setHasMore(true);
    }, [debouncedSearch]);

    // ✅ تابع لود بیشتر
    const handleLoadMore = useCallback(async () => {
        if (!hasMore || loadingMore || loadingFollowers) return;
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

            // ✅ جلوگیری از تکرار
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
    }, [hasMore, loadingMore, loadingFollowers, allFollowers.length, debouncedSearch, fetchMore]);

    // ✅ IntersectionObserver برای Infinite Scroll
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || loadingFollowers) return;

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
    }, [handleLoadMore, hasMore, loadingMore, loadingFollowers]);

    // ✅ toggle انتخاب
    const handleToggle = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // ✅ ذخیره تغییرات
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const currentIds = new Set(closeFriends.map(cf => cf.id));
            const toAdd = [...selectedIds].filter(id => !currentIds.has(id));
            const toRemove = [...currentIds].filter(id => !selectedIds.has(id));

            await Promise.all(toRemove.map(id => removeCloseFriend({ variables: { userId: id } })));
            await Promise.all(toAdd.map(id => addCloseFriend({ variables: { userId: id } })));

            await refetchClose();
            toast.success('لیست دوستان نزدیک ذخیره شد ✅');
        } catch (err: any) {
            toast.error(err.message || 'خطا در ذخیره‌سازی');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="border border-border rounded-xl p-4 bg-card/50">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-text-primary">
                    انتخاب دوستان نزدیک ({selectedIds.size} نفر)
                </h4>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-xs px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
            </div>

            {/* ✅ جستجو */}
            <div className="relative mb-3">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در دنبال‌کنندگان..."
                    className="w-full pr-10 pl-3 py-2 bg-transparent border border-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:border-primary outline-none"
                />
            </div>

            {/* ✅ لیست دنبال‌کنندگان */}
            <div className="max-h-60 overflow-y-auto space-y-2">
                {loadingFollowers && allFollowers.length === 0 ? (
                    <div className="flex justify-center py-6">
                        <Loader2 size={20} className="animate-spin text-primary" />
                    </div>
                ) : allFollowers.length === 0 ? (
                    <p className="text-center text-xs text-secondary py-6">
                        {searchTerm ? 'کاربری پیدا نشد' : 'هنوز کسی شما را دنبال نکرده'}
                    </p>
                ) : (
                    <>
                        {allFollowers.map((follower: any) => {
                            const isSelected = selectedIds.has(follower.id);
                            return (
                                <button
                                    key={follower.id}
                                    type="button"
                                    onClick={() => handleToggle(follower.id)}
                                    className={`
                                        w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-right
                                        ${isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-border/30'}
                                    `}
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {follower.avatar ? (
                                            <Image
                                                src={follower.avatar}
                                                alt={follower.fullName}
                                                className="w-full h-full object-cover"
                                                width={36}
                                                height={36}
                                                unoptimized
                                            />
                                        ) : (
                                            <span className="text-white font-bold text-xs">
                                                {follower.fullName?.[0] || '👤'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">
                                            {follower.fullName}
                                        </p>
                                        <p className="text-xs text-secondary truncate">
                                            @{follower.username}
                                        </p>
                                    </div>
                                    <div
                                        className={`
                                            w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                                            ${isSelected ? 'bg-primary text-white' : 'border-2 border-border'}
                                        `}
                                    >
                                        {isSelected && <Check size={14} />}
                                    </div>
                                </button>
                            );
                        })}

                        {/* ✅ سنتینل برای Infinite Scroll */}
                        {hasMore && (
                            <div ref={loadMoreRef} className="flex justify-center py-3">
                                {loadingMore && (
                                    <Loader2 size={18} className="animate-spin text-primary" />
                                )}
                            </div>
                        )}

                        {!hasMore && allFollowers.length > 0 && (
                            <p className="text-center text-[10px] text-secondary py-2">
                                همه فالوورها نمایش داده شدند
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};