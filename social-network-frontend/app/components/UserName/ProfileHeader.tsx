// app/user/[username]/components/ProfileHeader.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useQuery } from '@apollo/client/react';
import { ProfileUser } from './types';
import { Calendar, Plus } from 'lucide-react';
import { FollowButton } from '@/app/components/UserName/FollowButton';
import { GET_USER_STORIES, Story } from '@/app/graphql/story.queries';
import { StoryViewerModal } from '../story/StoryViewerModal';

interface ProfileHeaderProps {
    user: ProfileUser;
    avatarUrl: string | null;
    isOwner: boolean;
    displayedFollowersCount: number;
    displayedFollowingCount: number;
    onAvatarClick: () => void;
    onFollowersClick: () => void;
    onFollowingClick: () => void;
    onFollowChange: (newCount: number) => void;
    onCreateStory: () => void;
}

const LONG_PRESS_DURATION = 400; // میلی‌ثانیه

export const ProfileHeader = ({
    user,
    avatarUrl,
    isOwner,
    displayedFollowersCount,
    displayedFollowingCount,
    onAvatarClick,
    onFollowersClick,
    onFollowingClick,
    onFollowChange,
    onCreateStory,
}: ProfileHeaderProps) => {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [isLongPressing, setIsLongPressing] = useState(false);

    const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef(false);

    const { data, refetch } = useQuery(GET_USER_STORIES, {
        variables: { userId: user.id },
        fetchPolicy: 'cache-and-network',
    });

    const stories: Story[] = data?.getUserStories || [];
    const hasStories = stories.length > 0;
    const hasUnviewedStory = stories.some(s => !s.isViewedByMe);
    const initialIndex = hasUnviewedStory ? stories.findIndex(s => !s.isViewedByMe) : 0;

    // ✅ شروع فشار (ماوس یا لمس)
    const handlePressStart = useCallback(() => {
        if (!avatarUrl) return;
        isLongPressRef.current = false;

        pressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            setIsLongPressing(true);
        }, LONG_PRESS_DURATION);
    }, [avatarUrl]);

    // ✅ پایان فشار (ماوس یا لمس)
    const handlePressEnd = useCallback(() => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }

        if (isLongPressRef.current) {
            // نگه‌داشتن طولانی بود: عکس بزرگ رو ببند
            setIsLongPressing(false);
        } else {
            // کلیک سریع بود: برو سراغ استوری
            if (hasStories) setViewerOpen(true);
        }
    }, [hasStories]);

    // ✅ لغو فشار (مثلاً اگه انگشت/ماوس از روی المان خارج بشه)
    const handlePressCancel = useCallback(() => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
        setIsLongPressing(false);
    }, []);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 mb-6 border-b border-border">
                <div className="relative mx-auto sm:mx-0 flex-shrink-0">
                    <div
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressCancel}
                        onTouchStart={handlePressStart}
                        onTouchEnd={handlePressEnd}
                        onTouchCancel={handlePressCancel}
                        className={`
                            w-24 h-24 sm:w-32 sm:h-32 rounded-full p-0.5 transition-colors select-none
                            ${hasStories
                                ? hasUnviewedStory
                                    ? 'bg-gradient-to-tr from-primary to-purple-500 cursor-pointer'
                                    : 'bg-border cursor-pointer'
                                : avatarUrl ? 'cursor-pointer' : ''
                            }
                        `}
                        title={hasStories ? 'کلیک: مشاهده‌ی استوری - نگه‌دارید: مشاهده‌ی عکس' : undefined}
                    >
                        <div className={`w-full h-full rounded-full ${hasStories ? 'bg-card p-0.5' : ''}`}>
                            <div className="w-full h-full rounded-full bg-gradient-primary flex items-center justify-center shadow-glow-primary overflow-hidden">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover pointer-events-none"
                                        width={128}
                                        height={128}
                                        unoptimized
                                        draggable={false}
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {user.fullName?.[0] || '👤'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ✅ دکمه‌ی + برای صاحب پروفایل */}
                    {isOwner && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateStory();
                            }}
                            title="افزودن استوری"
                            className="absolute bottom-1 left-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-card hover:bg-primary-dark transition-colors z-10"
                        >
                            <Plus size={18} />
                        </button>
                    )}
                </div>

                <div className="flex-1 text-center sm:text-right">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-primary">
                                {user.fullName}
                            </h1>
                            <p className="text-secondary text-sm">
                                @{user.username}
                            </p>
                            <p className="text-xs text-secondary mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                عضویت از {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                            </p>
                        </div>

                        {!isOwner && (
                            <FollowButton
                                userId={user.id}
                                initialIsFollowing={user.isFollowing}
                                onFollowChange={(_, newCount) => onFollowChange(newCount)}
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
                        <button onClick={onFollowersClick} className="text-center hover:opacity-80 transition-opacity cursor-pointer">
                            <p className="font-bold text-primary">{displayedFollowersCount}</p>
                            <p className="text-xs text-secondary">دنبال‌کننده</p>
                        </button>
                        <button onClick={onFollowingClick} className="text-center hover:opacity-80 transition-opacity cursor-pointer">
                            <p className="font-bold text-primary">{displayedFollowingCount}</p>
                            <p className="text-xs text-secondary">دنبال‌شونده</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ نمایش موقت عکس بزرگ حین نگه‌داشتن (long-press) */}
            {isLongPressing && avatarUrl && (
                <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center pointer-events-none">
                    <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden border-4 border-white/20 animate-in fade-in zoom-in duration-200">
                        <Image
                            src={avatarUrl}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                            width={400}
                            height={400}
                            unoptimized
                        />
                    </div>
                </div>
            )}

            {viewerOpen && hasStories && (
                <StoryViewerModal
                    stories={stories}
                    initialIndex={initialIndex}
                    isOwner={isOwner}
                    isOpen={true}
                    onClose={() => setViewerOpen(false)}
                    onStoryViewed={() => refetch()}
                />
            )}
        </>
    );
};