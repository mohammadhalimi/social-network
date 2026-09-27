// components/story/StoriesBar.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { GET_USER_STORIES, Story } from '@/app/graphql/story.queries';
import { StoryViewerModal } from './StoryViewerModal';

interface StoriesBarProps {
    userId: string;
    isOwner: boolean;
    userAvatar?: string | null;
    userFullName?: string;
    onCreateStory?: () => void;
}

export const StoriesBar = ({
    userId,
    isOwner,
    userAvatar,
    userFullName,
    onCreateStory,
}: StoriesBarProps) => {
    const [viewerOpen, setViewerOpen] = useState(false);

    const { data, refetch } = useQuery(GET_USER_STORIES, {
        variables: { userId },
        fetchPolicy: 'cache-and-network',
    });

    const stories: Story[] = data?.getUserStories || [];
    const hasStories = stories.length > 0;
    const hasUnviewedStory = stories.some(s => !s.isViewedByMe);

    // ✅ اولین استوری دیده‌نشده (یا اگر همه دیده شده، از اول شروع کن)
    const initialIndex = hasUnviewedStory
        ? stories.findIndex(s => !s.isViewedByMe)
        : 0;

    const handleAvatarClick = () => {
        if (hasStories) {
            setViewerOpen(true);
        } else if (isOwner) {
            onCreateStory?.();
        }
    };

    const handleStoryViewed = () => {
        refetch();
    };

    return (
        <>
            <div className="flex flex-col items-center gap-2">
                <button onClick={handleAvatarClick} className="relative group">
                    <div
                        className={`
                            w-20 h-20 rounded-full p-0.5 transition-colors
                            ${hasStories
                                ? hasUnviewedStory
                                    ? 'bg-gradient-to-tr from-primary to-purple-500'
                                    : 'bg-border'
                                : 'bg-transparent'
                            }
                        `}
                    >
                        <div className="w-full h-full rounded-full bg-card p-0.5">
                            <div className="w-full h-full rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                                {userAvatar ? (
                                    <Image
                                        src={userAvatar}
                                        alt={userFullName || 'کاربر'}
                                        className="w-full h-full object-cover"
                                        width={80}
                                        height={80}
                                        unoptimized
                                    />
                                ) : (
                                    <span className="text-white font-bold text-xl">
                                        {userFullName?.[0] || '👤'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ✅ دکمه‌ی + فقط وقتی صاحب پروفایلی */}
                    {isOwner && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateStory?.();
                            }}
                            className="absolute bottom-0 left-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center border-2 border-card group-hover:bg-primary-dark transition-colors"
                        >
                            <Plus size={16} />
                        </span>
                    )}
                </button>

                <span className="text-xs text-secondary">
                    {isOwner ? 'استوری من' : hasStories ? 'مشاهده استوری' : ''}
                </span>
            </div>

            {viewerOpen && hasStories && (
                <StoryViewerModal
                    stories={stories}
                    initialIndex={initialIndex}
                    isOwner={isOwner}
                    isOpen={true}
                    onClose={() => setViewerOpen(false)}
                    onStoryViewed={handleStoryViewed}
                />
            )}
        </>
    );
};